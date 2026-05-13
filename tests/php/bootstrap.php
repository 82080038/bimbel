<?php
/**
 * PHPUnit Bootstrap File
 */

// Define test constants
define('TEST_BASE_DIR', dirname(__DIR__, 2));
define('TEST_API_DIR', TEST_BASE_DIR . '/api');
define('TEST_SCRIPTS_DIR', TEST_BASE_DIR . '/scripts');

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Autoloader
spl_autoload_register(function ($class) {
    $paths = [
        TEST_API_DIR,
        TEST_SCRIPTS_DIR,
        __DIR__ . '/Helpers'
    ];
    
    foreach ($paths as $path) {
        $file = $path . '/' . str_replace('\\', '/', $class) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Test database configuration (use test database)
putenv('DB_HOST=localhost');
putenv('DB_NAME=ujian_sekolah_kedinasan_test');
putenv('DB_USER=root');
putenv('DB_PASS=root');

// Mock functions for testing
if (!function_exists('header')) {
    function header($string, $replace = true, $http_response_code = null) {
        // Mock header function for testing
        return true;
    }
}

if (!function_exists('session_start')) {
    function session_start() {
        // Mock session start
        if (!isset($_SESSION)) {
            $_SESSION = [];
        }
        return true;
    }
}

// Helper functions
require_once __DIR__ . '/Helpers/TestHelpers.php';
