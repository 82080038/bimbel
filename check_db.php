<?php
require_once 'config.php';

echo "<h1>Database Schema Check</h1>";
echo "<hr>";

// Check users table columns
$result = $conn->query("DESCRIBE users");
echo "<h2>Table: users</h2>";
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Field</th><th>Type</th><th>Null</th></tr>";

$required_columns = ['nama_lengkap', 'nomor_hp', 'jenis_kelamin', 'tahun_tamat', 'asal_sekolah'];
$found_columns = [];

while ($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . htmlspecialchars($row['Field']) . "</td>";
    echo "<td>" . htmlspecialchars($row['Type']) . "</td>";
    echo "<td>" . htmlspecialchars($row['Null']) . "</td>";
    echo "</tr>";
    
    $found_columns[] = $row['Field'];
}
echo "</table>";

echo "<h2>Missing Columns Check</h2>";
$missing = array_diff($required_columns, $found_columns);
if (empty($missing)) {
    echo "<p style='color: green;'>✅ All required columns present!</p>";
} else {
    echo "<p style='color: red;'>❌ Missing columns: " . implode(', ', $missing) . "</p>";
    echo "<p>Run this SQL:</p>";
    echo "<pre>";
    foreach ($missing as $col) {
        echo "ALTER TABLE users ADD COLUMN $col VARCHAR(100);\n";
    }
    echo "</pre>";
}
