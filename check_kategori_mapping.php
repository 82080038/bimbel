<?php
require 'config.php';

$conn = new mysqli('127.0.0.1', 'root', 'root', 'ujian_sekolah_kedinasan');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check kategori_soal table
$result = $conn->query('SELECT id, nama_kategori FROM kategori_soal');
echo "Kategori mapping:\n";
while ($row = $result->fetch_assoc()) {
    echo "- ID: {$row['id']}, Nama: {$row['nama_kategori']}\n";
}

$conn->close();
?>
