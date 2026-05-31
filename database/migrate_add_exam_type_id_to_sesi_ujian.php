<?php
/**
 * Migration: Add exam_type_id column to sesi_ujian table
 * This is required for CAT system to track which exam type was used
 */

// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'bimbel_db');

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    // Check if exam_type_id column already exists
    $check_column = "SHOW COLUMNS FROM sesi_ujian LIKE 'exam_type_id'";
    $result = $conn->query($check_column);
    
    if ($result->num_rows > 0) {
        echo "Column exam_type_id already exists in sesi_ujian table.\n";
    } else {
        // Add exam_type_id column
        $sql = "ALTER TABLE sesi_ujian 
                ADD COLUMN exam_type_id INT(11) DEFAULT NULL 
                AFTER paket_id,
                ADD INDEX idx_exam_type (exam_type_id)";
        
        if ($conn->query($sql)) {
            echo "Successfully added exam_type_id column to sesi_ujian table.\n";
        } else {
            echo "Error adding column: " . $conn->error . "\n";
        }
    }
    
    $conn->close();
    echo "Migration completed.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
