<?php
/**
 * Rate Limiting Middleware
 * 
 * Limits API requests to prevent abuse and DoS attacks
 * Uses file-based storage for simplicity (can be upgraded to Redis for production)
 */

class RateLimiter {
    private $maxRequests;
    private $windowSeconds;
    private $storageDir;
    
    public function __construct($maxRequests = 100, $windowSeconds = 60, $storageDir = null) {
        $this->maxRequests = $maxRequests;
        $this->windowSeconds = $windowSeconds;
        $this->storageDir = $storageDir ?? __DIR__ . '/../cache/rate_limit/';
        
        // Create storage directory if not exists
        if (!file_exists($this->storageDir)) {
            mkdir($this->storageDir, 0755, true);
        }
    }
    
    /**
     * Check if request should be rate limited
     */
    public function checkLimit($identifier = null) {
        // Whitelist localhost untuk development & automated testing
        $clientIp = $this->getClientIp();
        if (in_array($clientIp, ['127.0.0.1', '::1', 'localhost'])) {
            return ['allowed' => true, 'remaining' => 999, 'reset' => time() + $this->windowSeconds];
        }

        $identifier = $identifier ?? $this->getIdentifier();
        $windowStart = time() - $this->windowSeconds;
        
        // Get existing requests
        $requests = $this->getRequests($identifier);
        
        // Filter requests within current window
        $validRequests = array_filter($requests, function($timestamp) use ($windowStart) {
            return $timestamp >= $windowStart;
        });
        
        // Check if limit exceeded
        if (count($validRequests) >= $this->maxRequests) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset' => end($validRequests) + $this->windowSeconds
            ];
        }
        
        // Add current request
        $validRequests[] = time();
        $this->saveRequests($identifier, $validRequests);
        
        return [
            'allowed' => true,
            'remaining' => $this->maxRequests - count($validRequests),
            'reset' => $windowStart + $this->windowSeconds
        ];
    }
    
    /**
     * Get unique identifier for rate limiting
     */
    private function getIdentifier() {
        // Use combination of IP and API key if available
        $ip = $this->getClientIp();
        $apiKey = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        return md5($ip . ':' . $apiKey);
    }
    
    /**
     * Get client IP address
     */
    private function getClientIp() {
        $headers = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                return trim($ips[0]);
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Get stored requests for identifier
     */
    private function getRequests($identifier) {
        $file = $this->getStorageFile($identifier);
        
        if (!file_exists($file)) {
            return [];
        }
        
        $data = file_get_contents($file);
        return json_decode($data, true) ?? [];
    }
    
    /**
     * Save requests for identifier
     */
    private function saveRequests($identifier, $requests) {
        $file = $this->getStorageFile($identifier);
        file_put_contents($file, json_encode($requests), LOCK_EX);
    }
    
    /**
     * Get storage file path for identifier
     */
    private function getStorageFile($identifier) {
        return $this->storageDir . $identifier . '.json';
    }
    
    /**
     * Clean up old rate limit files
     */
    public function cleanup() {
        $files = glob($this->storageDir . '*.json');
        $cutoff = time() - ($this->windowSeconds * 2); // Keep files for 2 windows
        
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
            }
        }
    }
}

// Rate limiting function for easy use
if (!function_exists('checkRateLimit')) {
    function checkRateLimit($maxRequests = 100, $windowSeconds = 60, $identifier = null) {
        $limiter = new RateLimiter($maxRequests, $windowSeconds);
        $result = $limiter->checkLimit($identifier);
        
        if (!$result['allowed']) {
            header('Content-Type: application/json');
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'Too many requests',
                'retry_after' => $result['reset'] - time()
            ]);
            exit();
        }
        
        return $result;
    }
}
