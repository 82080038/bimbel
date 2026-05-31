<?php
require 'config.php';

$conn = new mysqli('127.0.0.1', 'root', 'root', 'ujian_sekolah_kedinasan');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check hasil_ujian structure
$result = $conn->query('DESCRIBE hasil_ujian');
echo "hasil_ujian structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "- {$row['Field']} ({$row['Type']})\n";
}

// Sample data
$result = $conn->query('SELECT * FROM hasil_ujian LIMIT 2');
echo "\nSample hasil_ujian:\n";
while ($row = $result->fetch_assoc()) {
    echo json_encode($row, JSON_PRETTY_PRINT) . "\n";
}

$conn->close();
?>
