<?php
/**
 * API Protection Layer
 * 
 * Integrates rate limiting, input validation, and security measures
 * for all API endpoints. Include this file at the top of API files.
 */

require_once __DIR__ . '/rate_limiter.php';
require_once __DIR__ . '/validator.php';
require_once __DIR__ . '/cache.php';

/**
 * API Protection Class
 * Handles rate limiting, validation, and security for API requests
 */
class APIProtection {
    private $rateLimiter;
    private $validator;
    private $cache;
    private $config;
    
    public function __construct() {
        $this->rateLimiter = new RateLimiter(
            $_ENV['RATE_LIMIT_REQUESTS'] ?? 100,  // 100 requests
            $_ENV['RATE_LIMIT_WINDOW'] ?? 60      // per 60 seconds
        );
        $this->validator = new RequestValidator();
        $this->cache = new Cache();
        
        // Different limits for different endpoints
        $this->config = [
            'auth' => ['requests' => 10, 'window' => 60],      // 10 login attempts per minute
            'default' => ['requests' => 100, 'window' => 60],  // 100 requests per minute
            'admin' => ['requests' => 200, 'window' => 60],      // 200 for admin
            'export' => ['requests' => 5, 'window' => 60],      // 5 exports per minute
        ];
    }
    
    /**
     * Apply rate limit based on endpoint type
     */
    public function applyRateLimit($endpointType = 'default', $identifier = null) {
        $config = $this->config[$endpointType] ?? $this->config['default'];
        
        $limiter = new RateLimiter($config['requests'], $config['window']);
        $result = $limiter->checkLimit($identifier);
        
        if (!$result['allowed']) {
            $this->sendRateLimitResponse($result);
        }
        
        // Add rate limit headers
        header('X-RateLimit-Limit: ' . $config['requests']);
        header('X-RateLimit-Remaining: ' . $result['remaining']);
        header('X-RateLimit-Reset: ' . $result['reset']);
        
        return $result;
    }
    
    /**
     * Validate API input
     */
    public function validate($rules, $data = null) {
        $data = $data ?? $this->getRequestData();
        $errors = [];
        
        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? null;
            
            // Check required
            if (strpos($rule, 'required') !== false && empty($value)) {
                $errors[$field] = "$field is required";
                continue;
            }
            
            // Skip further validation if empty and not required
            if (empty($value) && strpos($rule, 'required') === false) {
                continue;
            }
            
            // Apply validation rules
            $fieldErrors = $this->applyRules($field, $value, $rule);
            if (!empty($fieldErrors)) {
                $errors[$field] = $fieldErrors;
            }
        }
        
        if (!empty($errors)) {
            $this->sendValidationError($errors);
        }
        
        return true;
    }
    
    /**
     * Apply validation rules
     */
    private function applyRules($field, $value, $rules) {
        $errors = [];
        $ruleList = explode('|', $rules);
        
        foreach ($ruleList as $rule) {
            $rule = trim($rule);
            if ($rule === 'required') continue;
            
            // Parse rule with parameters
            $params = [];
            if (strpos($rule, ':') !== false) {
                list($ruleName, $paramStr) = explode(':', $rule, 2);
                $params = explode(',', $paramStr);
            } else {
                $ruleName = $rule;
            }
            
            switch ($ruleName) {
                case 'int':
                    if (!Validator::int($value, $params[0] ?? null, $params[1] ?? null)) {
                        $errors[] = "$field must be a valid integer";
                    }
                    break;
                    
                case 'string':
                    $min = $params[0] ?? 0;
                    $max = $params[1] ?? null;
                    if (!Validator::string($value, $min, $max)) {
                        $errors[] = "$field must be a string ($min-$max characters)";
                    }
                    break;
                    
                case 'email':
                    if (!Validator::email($value)) {
                        $errors[] = "$field must be a valid email";
                    }
                    break;
                    
                case 'min':
                    if (strlen($value) < $params[0]) {
                        $errors[] = "$field must be at least {$params[0]} characters";
                    }
                    break;
                    
                case 'max':
                    if (strlen($value) > $params[0]) {
                        $errors[] = "$field must be at most {$params[0]} characters";
                    }
                    break;
                    
                case 'category':
                    if (!Validator::category($value)) {
                        $errors[] = "$field must be a valid category (TWK, TIU, TKP)";
                    }
                    break;
                    
                case 'difficulty':
                    if (!Validator::difficulty($value)) {
                        $errors[] = "$field must be a valid difficulty (mudah, sedang, sulit)";
                    }
                    break;
                    
                case 'answer':
                    if (!Validator::answer($value)) {
                        $errors[] = "$field must be a valid answer (A, B, C, D, E)";
                    }
                    break;
                    
                case 'json':
                    if (!Validator::json($value)) {
                        $errors[] = "$field must be valid JSON";
                    }
                    break;
                    
                case 'array':
                    if (!is_array($value)) {
                        $errors[] = "$field must be an array";
                    }
                    break;
                    
                case 'boolean':
                    if (!is_bool($value) && !in_array($value, [0, 1, '0', '1', 'true', 'false', 'yes', 'no'], true)) {
                        $errors[] = "$field must be a boolean";
                    }
                    break;
                    
                case 'in':
                    $allowed = array_slice($params, 0);
                    if (!in_array($value, $allowed, true)) {
                        $errors[] = "$field must be one of: " . implode(', ', $allowed);
                    }
                    break;
                    
                case 'date':
                    if (!Validator::date($value, $params[0] ?? 'Y-m-d')) {
                        $errors[] = "$field must be a valid date";
                    }
                    break;
                    
                case 'url':
                    if (!Validator::url($value)) {
                        $errors[] = "$field must be a valid URL";
                    }
                    break;
                    
                case 'alphanumeric':
                    if (!preg_match('/^[a-zA-Z0-9_]+$/', $value)) {
                        $errors[] = "$field must be alphanumeric";
                    }
                    break;
                    
                case 'nosql':
                    // Check for SQL injection patterns
                    $sqlPatterns = ['/\bSELECT\b/i', '/\bINSERT\b/i', '/\bUPDATE\b/i', '/\bDELETE\b/i', '/\bDROP\b/i', '/\bUNION\b/i'];
                    foreach ($sqlPatterns as $pattern) {
                        if (preg_match($pattern, $value)) {
                            $errors[] = "$field contains invalid characters";
                            break;
                        }
                    }
                    break;
                    
                case 'noxss':
                    // Check for XSS patterns
                    if (preg_match('/<script\b[^>]*>/i', $value) || preg_match('/javascript:/i', $value)) {
                        $errors[] = "$field contains invalid characters";
                    }
                    break;
            }
        }
        
        return $errors;
    }
    
    /**
     * Get request data from POST/GET/JSON
     */
    public function getRequestData() {
        $data = [];
        
        // Get JSON input
        $jsonInput = file_get_contents('php://input');
        if (!empty($jsonInput)) {
            $jsonData = json_decode($jsonInput, true);
            if (is_array($jsonData)) {
                $data = array_merge($data, $jsonData);
            }
        }
        
        // Merge with POST and GET
        $data = array_merge($data, $_POST, $_GET);
        
        return $data;
    }
    
    /**
     * Sanitize output data
     */
    public function sanitizeOutput($data) {
        if (is_array($data)) {
            return array_map([$this, 'sanitizeOutput'], $data);
        }
        if (is_string($data)) {
            return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
        return $data;
    }
    
    /**
     * Cache API response
     */
    public function cacheResponse($key, $callback, $ttl = 300) {
        return $this->cache->remember($key, $callback, $ttl);
    }
    
    /**
     * Clear cache for specific pattern
     */
    public function clearCache($pattern) {
        return $this->cache->clear($pattern);
    }
    
    /**
     * Send rate limit response
     */
    private function sendRateLimitResponse($result) {
        header('Content-Type: application/json');
        header('Retry-After: ' . ($result['reset'] - time()));
        http_response_code(429);
        
        echo json_encode([
            'success' => false,
            'error' => 'Too many requests',
            'message' => 'Rate limit exceeded. Please try again later.',
            'retry_after' => $result['reset'] - time()
        ]);
        
        exit();
    }
    
    /**
     * Send validation error response
     */
    private function sendValidationError($errors) {
        header('Content-Type: application/json');
        http_response_code(400);
        
        echo json_encode([
            'success' => false,
            'error' => 'Validation failed',
            'errors' => $errors
        ]);
        
        exit();
    }
    
    /**
     * Log security event
     */
    public function logSecurityEvent($event, $details = []) {
        $logFile = __DIR__ . '/../logs/security.log';
        
        // Ensure logs directory exists
        $logDir = dirname($logFile);
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'details' => $details
        ];
        
        error_log(json_encode($logEntry) . "\n", 3, $logFile);
    }
    
    /**
     * Check for suspicious activity
     */
    public function checkSuspiciousActivity() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $cacheKey = 'suspicious_' . md5($ip);
        
        $attempts = $this->cache->get($cacheKey) ?? 0;
        $attempts++;
        
        if ($attempts > 200) { // 200 suspicious requests per 5 minutes
            $this->logSecurityEvent('suspicious_activity_blocked', [
                'attempts' => $attempts,
                'ip' => $ip
            ]);
            
            header('Content-Type: application/json');
            http_response_code(429); // Use 429 Too Many Requests instead of 403
            echo json_encode([
                'success' => false,
                'error' => 'Too many requests. Please slow down.'
            ]);
            exit();
        }
        
        $this->cache->set($cacheKey, $attempts, 300); // 5 minute window
    }
}

// Helper function to get protection instance
function apiProtection() {
    return new APIProtection();
}

// Quick rate limit check
function checkRateLimit($type = 'default') {
    $protection = new APIProtection();
    return $protection->applyRateLimit($type);
}

// Quick validation
function validateInput($rules, $data = null) {
    $protection = new APIProtection();
    return $protection->validate($rules, $data);
}
