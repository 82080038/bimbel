<?php
// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'ujian_sekolah_kedinasan');

// Create database connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8mb4");

// Exam settings
define('DURASI_UJIAN_MENIT', 100); // 100 menit sesuai standar SKD
define('JUMLAH_SOAL_TWK', 30);
define('JUMLAH_SOAL_TIU', 35);
define('JUMLAH_SOAL_TKP', 35);
define('JUMLAH_SOAL_TPA', 15);
define('JUMLAH_SOAL_PSIKOLOGIS', 15);
define('TOTAL_SOAL', 130);

// Passing grades
define('PASSING_GRADE_TWK', 65);
define('PASSING_GRADE_TIU', 80);
define('PASSING_GRADE_TKP', 166);
define('PASSING_GRADE_TPA', 70);
define('PASSING_GRADE_PSIKOLOGIS', 166);
define('PASSING_GRADE_TOTAL', 311);
?>
