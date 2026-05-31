<?php
require 'config.php';

$conn = new mysqli('127.0.0.1', 'root', 'root', 'ujian_sekolah_kedinasan');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Test getAllBahanPelajaran query
$page = 1;
$limit = 20;
$offset = ($page - 1) * $limit;
$kategori_id = 0;
$topic_id = 0;

$where = "";
$params = [];
$types = "";

$sql = "SELECT b.*, k.nama_kategori, t.nama_topik FROM bahan_pelajaran b LEFT JOIN kategori_soal k ON b.kategori_id = k.id LEFT JOIN topik_pelajaran t ON b.topic_id = t.id ORDER BY b.created_at DESC LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);
$params[] = $limit;
$params[] = $offset;
$types .= "ii";

$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

echo "Total results: " . $result->num_rows . "\n\n";

if ($result->num_rows > 0) {
    echo "Sample data:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- ID: {$row['id']}, Judul: {$row['judul']}, Kategori: {$row['nama_kategori']}, Topik: {$row['nama_topik']}\n";
        break; // Just show first row
    }
} else {
    echo "No results found\n";
}

$conn->close();
?>
