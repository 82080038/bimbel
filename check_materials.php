<?php
require 'config.php';

$conn = new mysqli('127.0.0.1', 'root', 'root', 'ujian_sekolah_kedinasan');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check learning topics
$result = $conn->query('SELECT COUNT(*) as count FROM learning_topics');
$row = $result->fetch_assoc();
echo "Learning topics count: " . $row['count'] . "\n";

// Check bahan_pelajaran
$result = $conn->query('SELECT COUNT(*) as count FROM bahan_pelajaran');
$row = $result->fetch_assoc();
echo "Bahan pelajaran count: " . $row['count'] . "\n";

// Check learning_topics structure
$result = $conn->query('DESCRIBE learning_topics');
echo "\nLearning topics structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "- {$row['Field']} ({$row['Type']})\n";
}

// Sample learning topics
$result = $conn->query('SELECT * FROM learning_topics LIMIT 5');
echo "\nSample learning topics:\n";
while ($row = $result->fetch_assoc()) {
    echo "- ID: {$row['id']}, Data: " . json_encode($row) . "\n";
}

// Check bahan_pelajaran structure
$result = $conn->query('DESCRIBE bahan_pelajaran');
echo "\nBahan pelajaran structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "- {$row['Field']} ({$row['Type']})\n";
}

// Sample bahan_pelajaran
$result = $conn->query('SELECT id, judul, kategori_id, topic_id FROM bahan_pelajaran LIMIT 5');
echo "\nSample bahan pelajaran:\n";
while ($row = $result->fetch_assoc()) {
    echo "- ID: {$row['id']}, Judul: {$row['judul']}, Kategori ID: {$row['kategori_id']}, Topic ID: {$row['topic_id']}\n";
}

$conn->close();
?>
