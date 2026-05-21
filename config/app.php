<?php
/**
 * Application Configuration
 * 
 * This file contains all application-wide configurations including
 * base URL, database settings, and environment variables.
 * 
 * For production deployment, update the BASE_URL constant
 * to match your production domain.
 */

// Detect environment automatically or set manually
define('ENVIRONMENT', 'development'); // Change to 'production' when deploying

// ============================================================================
// BASE URL CONFIGURATION
// ============================================================================
// IMPORTANT: Update this when deploying to production!
// 
// Examples:
// - Local development: 'http://localhost/bimbel'
// - Production: 'https://ujian.sekolahkedinasan.go.id'
// - Subdomain: 'https://exam.yourschool.edu'
// - Subfolder: 'https://yourschool.edu/ujian'
// ============================================================================

if (ENVIRONMENT === 'production') {
    // PRODUCTION CONFIGURATION
    define('BASE_URL', 'https://your-production-domain.com');
    define('API_URL', BASE_URL . '/api');
    define('ASSETS_URL', BASE_URL . '/assets');
    
    // Security settings for production
    define('FORCE_HTTPS', true);
    define('DEBUG_MODE', false);
    define('ERROR_REPORTING', E_ERROR);
    
} else {
    // DEVELOPMENT CONFIGURATION (Localhost/XAMPP)
    // Auto-detect protocol and host
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    // If running in subfolder (e.g., /bimbel), include it
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    $folder = dirname($scriptName);
    $folder = $folder === '/' || $folder === '\\' ? '' : $folder;
    
    define('BASE_URL', $protocol . '://' . $host . $folder);
    define('API_URL', BASE_URL . '/api');
    define('ASSETS_URL', BASE_URL . '/assets');
    
    // Development settings
    define('FORCE_HTTPS', false);
    define('DEBUG_MODE', true);
    define('ERROR_REPORTING', E_ALL);
}

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================
// NOTE: Database constants (DB_HOST, DB_USER, etc.) are defined in config.php
// This section only defines them if config.php hasn't been loaded yet
if (!defined('DB_HOST')) {
    if (ENVIRONMENT === 'production') {
        define('DB_HOST', 'localhost');
        define('DB_NAME', 'production_database');
        define('DB_USER', 'production_user');
        define('DB_PASS', 'your_secure_password');
    } else {
        // Auto-detect platform for database password
        // Linux: root, Windows: 8208
        $is_windows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        
        define('DB_HOST', 'localhost');
        define('DB_NAME', 'ujian_sekolah_kedinasan');
        define('DB_USER', 'root');
        define('DB_PASS', $is_windows ? '8208' : 'root');
    }
}

// ============================================================================
// SESSION & SECURITY CONFIGURATION
// ============================================================================
define('SESSION_NAME', 'bimbel_session');
define('SESSION_LIFETIME', 7200); // 2 hours
define('CSRF_TOKEN_LIFETIME', 3600); // 1 hour

// Cookie settings
define('COOKIE_SECURE', ENVIRONMENT === 'production');
define('COOKIE_HTTPONLY', true);
define('COOKIE_SAMESITE', 'Strict');

// ============================================================================
// API CONFIGURATION
// ============================================================================
define('API_RATE_LIMIT_PUBLIC', 100); // requests per minute
define('API_RATE_LIMIT_AUTH', 1000); // requests per minute for authenticated users
define('API_TIMEOUT', 30); // seconds

// ============================================================================
// FEATURE FLAGS
// ============================================================================
define('ENABLE_REGISTRATION', true);
define('ENABLE_AI_FEATURES', true);
define('ENABLE_ANALYTICS', true);
define('ENABLE_NOTIFICATIONS', false); // Set true when notification system is ready

// ============================================================================
// PATH CONSTANTS (Auto-calculated, don't modify)
// ============================================================================
define('ROOT_PATH', dirname(__DIR__)); // Project root directory
define('API_PATH', ROOT_PATH . '/api');
define('ASSETS_PATH', ROOT_PATH . '/assets');
define('UPLOADS_PATH', ROOT_PATH . '/uploads');
define('CACHE_PATH', ROOT_PATH . '/cache');
define('LOGS_PATH', ROOT_PATH . '/logs');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate full URL for a path
 * @param string $path Path relative to base URL (e.g., 'login.html' or 'api/soal.php')
 * @return string Full URL
 */
function url($path = '') {
    return BASE_URL . '/' . ltrim($path, '/');
}

/**
 * Generate API URL
 * @param string $endpoint API endpoint (e.g., 'auth.php?action=login')
 * @return string Full API URL
 */
function api_url($endpoint = '') {
    return API_URL . '/' . ltrim($endpoint, '/');
}

/**
 * Generate asset URL
 * @param string $path Asset path (e.g., 'css/style.css')
 * @return string Full asset URL
 */
function asset_url($path = '') {
    return ASSETS_URL . '/' . ltrim($path, '/');
}

/**
 * Redirect to a URL
 * @param string $url URL to redirect to
 * @param int $code HTTP status code (default: 302)
 */
function redirect($url, $code = 302) {
    header("Location: $url", true, $code);
    exit();
}

/**
 * Redirect to a route within the application
 * @param string $route Route path (e.g., 'login.html')
 * @param int $code HTTP status code
 */
function redirect_to($route, $code = 302) {
    redirect(url($route), $code);
}

/**
 * Check if running in production
 * @return bool
 */
function is_production() {
    return ENVIRONMENT === 'production';
}

/**
 * Check if running in development
 * @return bool
 */
function is_development() {
    return ENVIRONMENT === 'development';
}

/**
 * Get configuration value
 * @param string $key Configuration key
 * @param mixed $default Default value if key not found
 * @return mixed
 */
function config($key, $default = null) {
    $constants = get_defined_constants(true)['user'];
    return $constants[$key] ?? $default;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================
error_reporting(ERROR_REPORTING);
ini_set('display_errors', DEBUG_MODE ? '1' : '0');

// ============================================================================
// SECURITY HEADERS (for production)
// ============================================================================
if (is_production()) {
    // Force HTTPS
    if (FORCE_HTTPS && (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on')) {
        header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'], true, 301);
        exit();
    }
    
    // Security headers
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self';");
}

// ============================================================================
// AUTOLOAD CONFIGURATION
// ============================================================================
// Only load config.php if not already loaded (prevents duplicate constant errors)
if (!isset($conn) || !($conn instanceof mysqli)) {
    require_once __DIR__ . '/../config.php'; // Database connection
}
require_once __DIR__ . '/../api/middleware.php'; // Auth middleware

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

// Set timezone
date_default_timezone_set('Asia/Jakarta');

// Initialize session with custom name
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start([
        'cookie_lifetime' => SESSION_LIFETIME,
        'cookie_secure' => COOKIE_SECURE,
        'cookie_httponly' => COOKIE_HTTPONLY,
        'cookie_samesite' => COOKIE_SAMESITE,
        'use_strict_mode' => true
    ]);
}
