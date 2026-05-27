<?php
/**
 * Logging System
 * 
 * Provides centralized logging for application events, errors, and security incidents
 */

class Logger {
    private $logDir;
    private $logFile;
    private $errorLog;
    private $securityLog;
    private $accessLog;
    
    public function __construct($logDir = null) {
        $this->logDir = $logDir ?? __DIR__ . '/../logs/';
        
        // Create log directory if not exists
        if (!file_exists($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
        
        // Define log files
        $date = date('Y-m-d');
        $this->logFile = $this->logDir . 'app_' . $date . '.log';
        $this->errorLog = $this->logDir . 'error_' . $date . '.log';
        $this->securityLog = $this->logDir . 'security_' . $date . '.log';
        $this->accessLog = $this->logDir . 'access_' . $date . '.log';
    }
    
    /**
     * Log general application event
     */
    public function info($message, $context = []) {
        $this->log($this->logFile, 'INFO', $message, $context);
    }
    
    /**
     * Log warning
     */
    public function warning($message, $context = []) {
        $this->log($this->logFile, 'WARNING', $message, $context);
    }
    
    /**
     * Log error
     */
    public function error($message, $context = []) {
        $this->log($this->errorLog, 'ERROR', $message, $context);
    }
    
    /**
     * Log security event
     */
    public function security($message, $context = []) {
        $this->log($this->securityLog, 'SECURITY', $message, $context);
    }
    
    /**
     * Log API access
     */
    public function access($message, $context = []) {
        $this->log($this->accessLog, 'ACCESS', $message, $context);
    }
    
    /**
     * Core logging function
     */
    private function log($file, $level, $message, $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $ip = $this->getClientIp();
        $userId = $context['user_id'] ?? 'guest';
        $sessionId = $context['session_id'] ?? session_id();
        
        // Build log entry
        $logEntry = sprintf(
            "[%s] [%s] [IP: %s] [User: %s] [Session: %s] %s",
            $timestamp,
            $level,
            $ip,
            $userId,
            $sessionId,
            $message
        );
        
        // Add context if provided
        if (!empty($context)) {
            unset($context['user_id'], $context['session_id']);
            if (!empty($context)) {
                $logEntry .= ' | Context: ' . json_encode($context);
            }
        }
        
        $logEntry .= PHP_EOL;
        
        // Write to log file
        file_put_contents($file, $logEntry, FILE_APPEND | LOCK_EX);
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
     * Clean up old log files (older than 30 days)
     */
    public function cleanup($daysToKeep = 30) {
        $cutoff = time() - ($daysToKeep * 24 * 60 * 60);
        $files = glob($this->logDir . '*.log');
        
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
            }
        }
    }
}

// Global logger instance
global $logger;
$logger = new Logger();

// Convenience functions
function logInfo($message, $context = []) {
    global $logger;
    $logger->info($message, $context);
}

function logWarning($message, $context = []) {
    global $logger;
    $logger->warning($message, $context);
}

function logError($message, $context = []) {
    global $logger;
    $logger->error($message, $context);
}

function logSecurity($message, $context = []) {
    global $logger;
    $logger->security($message, $context);
}

function logAccess($message, $context = []) {
    global $logger;
    $logger->access($message, $context);
}
