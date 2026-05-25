<?php
require 'config.php';

$conn = new mysqli('127.0.0.1', 'root', 'root', 'ujian_sekolah_kedinasan');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check paket_blueprint count
$result = $conn->query('SELECT COUNT(*) as count FROM paket_blueprint');
$row = $result->fetch_assoc();
echo "paket_blueprint count: " . $row['count'] . PHP_EOL;

// Check paket_tryout count
$result = $conn->query('SELECT COUNT(*) as count FROM paket_tryout');
$row = $result->fetch_assoc();
echo "paket_tryout count: " . $row['count'] . PHP_EOL;

// Show paket_tryout data
$result = $conn->query('SELECT id, nama_paket FROM paket_tryout LIMIT 5');
echo "Available paket_tryout:" . PHP_EOL;
while ($row = $result->fetch_assoc()) {
    echo "  ID: " . $row['id'] . ", Nama: " . $row['nama_paket'] . PHP_EOL;
}

$conn->close();
?>
