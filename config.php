<?php
// Database configuration - only define if not already defined
// ============================================================================
// IMPORTANT: Update DB_PASS if your XAMPP MySQL has a password set!
// Default XAMPP: empty password (no quotes)
// If you set a password, change: define('DB_PASS', 'your_password_here');
// ============================================================================

if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
}
if (!defined('DB_USER')) {
    define('DB_USER', 'root');
}
if (!defined('DB_PASS')) {
    // MySQL password - updated to 'root' on 16 Mei 2026
    define('DB_PASS', 'root');
}
if (!defined('DB_NAME')) {
    define('DB_NAME', 'ujian_sekolah_kedinasan');
}

// Create database connection only if not exists
// ============================================================================
if (!isset($conn) || !($conn instanceof mysqli)) {
    try {
        // Try to connect with database
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        // Check connection
        if ($conn->connect_error) {
            throw new Exception($conn->connect_error);
        }
        
    } catch (Exception $e) {
        // Connection failed - try without database to create it
        try {
            $temp_conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
            
            if ($temp_conn->connect_error) {
                // Store error for later display (don't output HTML here - breaks JSON APIs)
                $GLOBALS['db_error'] = "Database Connection Error: " . $temp_conn->connect_error;
                $GLOBALS['db_error_details'] = [
                    'message' => $temp_conn->connect_error,
                    'solution' => 'Make sure XAMPP MySQL is running. If you set a password, update DB_PASS in config.php'
                ];
                // Don't die() here - let the caller handle the error
                // This prevents HTML output from breaking JSON APIs
            } else {
                try {
                    // Create database if not exists
                    $temp_conn->query("CREATE DATABASE IF NOT EXISTS `" . $temp_conn->real_escape_string(DB_NAME) . "`");
                    $temp_conn->close();
                    
                    // Reconnect with database
                    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
                    
                    if ($conn->connect_error) {
                        throw new Exception($conn->connect_error);
                    }
                } catch (Exception $e2) {
                    // Store error instead of outputting HTML (prevents breaking JSON APIs)
                    $GLOBALS['db_error'] = "Database Error: " . $e2->getMessage();
                    $GLOBALS['db_error_details'] = [
                        'message' => $e2->getMessage(),
                        'solution' => 'Check database configuration'
                    ];
                    // Don't die() here - let the caller handle the error
                }
            }
        } catch (Exception $e3) {
            // Final catch for temp_conn creation errors
            $GLOBALS['db_error'] = "Database Error: " . $e3->getMessage();
            $GLOBALS['db_error_details'] = [
                'message' => $e3->getMessage(),
                'solution' => 'Check database configuration'
            ];
        }
    }
}

// Set charset
if (isset($conn) && $conn instanceof mysqli && !$conn->connect_error) {
    $conn->set_charset("utf8mb4");
}

// ============================================================================
// ERROR HANDLING HELPER
// ============================================================================
/**
 * Check if database connection is valid
 * Use this in API files before using $conn
 */
function checkDatabaseConnection() {
    global $conn;
    
    if (!isset($conn) || !($conn instanceof mysqli) || $conn->connect_error) {
        $error = isset($GLOBALS['db_error']) ? $GLOBALS['db_error'] : 'Database connection failed';
        
        // Return JSON error response
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => $error,
            'details' => isset($GLOBALS['db_error_details']) ? $GLOBALS['db_error_details'] : null
        ]);
        exit;
    }
    
    return true;
}

// Exam settings - only define if not exists
if (!defined('DURASI_UJIAN_MENIT')) {
    define('DURASI_UJIAN_MENIT', 100);
}
if (!defined('JUMLAH_SOAL_TWK')) {
    define('JUMLAH_SOAL_TWK', 30);
}
if (!defined('JUMLAH_SOAL_TIU')) {
    define('JUMLAH_SOAL_TIU', 35);
}
if (!defined('JUMLAH_SOAL_TKP')) {
    define('JUMLAH_SOAL_TKP', 35);
}
if (!defined('JUMLAH_SOAL_TPA')) {
    define('JUMLAH_SOAL_TPA', 15);
}
if (!defined('JUMLAH_SOAL_PSIKOLOGIS')) {
    define('JUMLAH_SOAL_PSIKOLOGIS', 15);
}
if (!defined('TOTAL_SOAL')) {
    define('TOTAL_SOAL', 130);
}

// Passing grades - only define if not exists
// Note: These are minimum scores per category to pass SKD
// TWK: 65/150 (30 soal), TIU: 80/175 (35 soal), TKP: 166/175 (35 soal)
// For simulations with fewer questions, grades are proportionally adjusted
if (!defined('PASSING_GRADE_TWK')) {
    define('PASSING_GRADE_TWK', 15);  // Lowered for sim (was 65 for 30 soal)
}
if (!defined('PASSING_GRADE_TIU')) {
    define('PASSING_GRADE_TIU', 15);  // Lowered for sim (was 80 for 35 soal)
}
if (!defined('PASSING_GRADE_TKP')) {
    define('PASSING_GRADE_TKP', 15);  // Lowered for sim (was 166 for 35 soal)
}
if (!defined('PASSING_GRADE_TPA')) {
    define('PASSING_GRADE_TPA', 10);
}
if (!defined('PASSING_GRADE_PSIKOLOGIS')) {
    define('PASSING_GRADE_PSIKOLOGIS', 10);
}
if (!defined('PASSING_GRADE_TOTAL')) {
    define('PASSING_GRADE_TOTAL', 40);
}
?>
