<?php
/**
 * Setup Database - Add missing columns for participant registration
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Database Setup</h1>";
echo "<hr>";

if (!isset($conn) || $conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Columns to add
$columns = [
    'nama_lengkap' => 'VARCHAR(100) AFTER role',
    'nomor_hp' => 'VARCHAR(15) AFTER nama_lengkap',
    'jenis_kelamin' => 'CHAR(1) AFTER nomor_hp',
    'tahun_tamat' => 'INT AFTER jenis_kelamin',
    'asal_sekolah' => 'VARCHAR(200) AFTER tahun_tamat'
];

$added = [];
$errors = [];

foreach ($columns as $column => $definition) {
    // Check if column exists
    $check = $conn->query("SHOW COLUMNS FROM users LIKE '$column'");
    
    if ($check && $check->num_rows > 0) {
        echo "<p>✅ Column '$column' already exists</p>";
    } else {
        // Add column
        $sql = "ALTER TABLE users ADD COLUMN $column $definition";
        if ($conn->query($sql)) {
            echo "<p style='color: green;'>✅ Added column '$column'</p>";
            $added[] = $column;
        } else {
            echo "<p style='color: red;'>❌ Failed to add '$column': " . $conn->error . "</p>";
            $errors[] = $column;
        }
    }
}

echo "<hr>";
echo "<h2>Summary</h2>";
echo "<p>Added: " . count($added) . " columns</p>";
echo "<p>Errors: " . count($errors) . " columns</p>";

// Show current structure
echo "<h2>Current Table Structure</h2>";
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Field</th><th>Type</th><th>Null</th></tr>";

$result = $conn->query("SHOW COLUMNS FROM users");
while ($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . htmlspecialchars($row['Field']) . "</td>";
    echo "<td>" . htmlspecialchars($row['Type']) . "</td>";
    echo "<td>" . htmlspecialchars($row['Null']) . "</td>";
    echo "</tr>";
}
echo "</table>";

echo "<hr>";
echo "<p><a href='register.html'>← Go to Registration</a></p>";
?>
