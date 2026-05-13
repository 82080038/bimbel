<?php
// Web-based database import script
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Import</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Database Import</h1>
    
    <?php
    $host = '127.0.0.1';
    $user = 'root';
    
    // Try different passwords
    $passwords = ['', '8208', 'root', 'password'];
    $connected = false;
    $conn = null;
    
    foreach ($passwords as $pass) {
        $conn = @new mysqli($host, $user, $pass);
        if ($conn->connect_error) {
            echo "<p class='error'>Failed with password: '" . htmlspecialchars($pass) . "' - " . $conn->connect_error . "</p>";
        } else {
            echo "<p class='success'>Connected successfully with password: '" . htmlspecialchars($pass) . "'</p>";
            $connected = true;
            break;
        }
    }
    
    if (!$connected) {
        die("<p class='error'>Could not connect to MySQL with any common password. Please check your MySQL configuration.</p>");
    }
    
    echo "<h2>Importing database.sql...</h2>";
    $sql = file_get_contents('database.sql');
    if ($conn->multi_query($sql)) {
        echo "<p class='success'>database.sql imported successfully</p>";
        do {
            if ($res = $conn->store_result()) {
                $res->free();
            }
        } while ($conn->more_results() && $conn->next_result());
    } else {
        echo "<p class='error'>Error importing database.sql: " . $conn->error . "</p>";
    }
    
    echo "<h2>Importing tryout_system.sql...</h2>";
    $conn->select_db('ujian_sekolah_kedinasan');
    $sql = file_get_contents('database/tryout_system.sql');
    if ($conn->multi_query($sql)) {
        echo "<p class='success'>tryout_system.sql imported successfully</p>";
        do {
            if ($res = $conn->store_result()) {
                $res->free();
            }
        } while ($conn->more_results() && $conn->next_result());
    } else {
        echo "<p class='error'>Error importing tryout_system.sql: " . $conn->error . "</p>";
    }
    
    $conn->close();
    echo "<h2 class='success'>Database import completed!</h2>";
    ?>
</body>
</html>
