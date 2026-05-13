<?php
// CLI database import script
$host = '127.0.0.1';
$user = 'root';

// Try different passwords
$passwords = ['', '8208', 'root', 'password', 'admin'];
$connected = false;
$conn = null;
$used_password = '';

echo "Testing MySQL connections...\n";
foreach ($passwords as $pass) {
    $conn = @new mysqli($host, $user, $pass);
    if ($conn->connect_error) {
        echo "Failed with password '$pass': " . $conn->connect_error . "\n";
    } else {
        echo "SUCCESS: Connected with password '$pass'\n";
        $connected = true;
        $used_password = $pass;
        break;
    }
}

if (!$connected) {
    die("Could not connect to MySQL. Please check your MySQL configuration.\n");
}

echo "\nImporting database.sql...\n";
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

echo "\nImporting tryout_system.sql...\n";
$conn->select_db('ujian_sekolah_kedinasan');
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
echo "\n=== Database import completed ===\n";
echo "Password used: $used_password\n";
echo "Please update config.php DB_PASS to: '$used_password'\n";
?>
