<?php
// Database import script
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$dbname = 'ujian_sekolah_kedinasan';

// Try connecting without password first (XAMPP default)
$conn = @new mysqli($host, $user, $pass);
if ($conn->connect_error) {
    // Try with password from config
    $pass = '8208';
    $conn = @new mysqli($host, $user, $pass);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
}

echo "Connected to MySQL successfully\n";

// Read and execute database.sql
$sql = file_get_contents('database.sql');
if ($conn->multi_query($sql)) {
    echo "database.sql imported successfully\n";
    do {
        if ($res = $conn->store_result()) {
            $res->free();
        }
    } while ($conn->more_results() && $conn->next_result());
} else {
    echo "Error importing database.sql: " . $conn->error . "\n";
}

// Select the database
$conn->select_db($dbname);

// Read and execute tryout_system.sql
$sql = file_get_contents('database/tryout_system.sql');
if ($conn->multi_query($sql)) {
    echo "tryout_system.sql imported successfully\n";
    do {
        if ($res = $conn->store_result()) {
            $res->free();
        }
    } while ($conn->more_results() && $conn->next_result());
} else {
    echo "Error importing tryout_system.sql: " . $conn->error . "\n";
}

$conn->close();
echo "Database import completed\n";
?>
