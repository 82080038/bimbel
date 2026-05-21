<?php
// Script to check database status without sudo
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== DATABASE STATUS CHECK ===\n\n";

// Database configuration
$host = 'localhost';
$user = 'root';
$pass = 'root'; // Try with password
$dbname = 'ujian_sekolah_kedinasan';

// Test connection without database
echo "1. Testing MySQL connection...\n";
$conn = @new mysqli($host, $user, $pass);
if ($conn->connect_error) {
    echo "   ERROR: Cannot connect to MySQL\n";
    echo "   Error: " . $conn->connect_error . "\n";
    exit(1);
}
echo "   ✓ MySQL connection successful\n\n";

// List all databases
echo "2. Listing all databases...\n";
$result = $conn->query("SHOW DATABASES");
$databases = [];
while ($row = $result->fetch_assoc()) {
    $databases[] = $row['Database'];
    echo "   - " . $row['Database'] . "\n";
}
$conn->close();

// Check if target database exists
echo "\n3. Checking database '$dbname'...\n";
if (in_array($dbname, $databases)) {
    echo "   ✓ Database '$dbname' exists\n\n";
    
    // Connect to specific database
    $conn = @new mysqli($host, $user, $pass, $dbname);
    if ($conn->connect_error) {
        echo "   ERROR: Cannot connect to database\n";
        echo "   Error: " . $conn->connect_error . "\n";
        exit(1);
    }
    
    // List all tables
    echo "4. Listing all tables in '$dbname'...\n";
    $result = $conn->query("SHOW TABLES");
    $tables = [];
    while ($row = $result->fetch_assoc()) {
        $tables[] = array_values($row)[0];
    }
    
    echo "   Total tables: " . count($tables) . "\n";
    foreach ($tables as $table) {
        echo "   - $table\n";
    }
    
    // Get table row counts
    echo "\n5. Table row counts...\n";
    foreach ($tables as $table) {
        $result = $conn->query("SELECT COUNT(*) as count FROM `$table`");
        $row = $result->fetch_assoc();
        echo "   $table: " . $row['count'] . " rows\n";
    }
    
    $conn->close();
} else {
    echo "   ✗ Database '$dbname' does NOT exist\n";
    echo "   You need to import the database from SQL files\n\n";
}

echo "\n=== CHECK COMPLETE ===\n";
?>
