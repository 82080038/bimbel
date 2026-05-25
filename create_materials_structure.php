<?php
// Create directory structure for learning materials files
// Access via: http://localhost/bimbel/create_materials_structure.php
// Date: 2026-05-26

header('Content-Type: text/plain');

$baseDir = __DIR__ . '/data/learning_materials/topics';

// Category names
$categories = [
    1 => 'TWK',
    2 => 'TIU',
    3 => 'TKP',
    4 => 'TPA',
    5 => 'PSIKOLOGIS'
];

echo "Creating directory structure for learning materials...\n\n";

// Create base directory if not exists
if (!file_exists($baseDir)) {
    mkdir($baseDir, 0755, true);
    echo "✓ Created base directory: $baseDir\n";
} else {
    echo "- Base directory already exists: $baseDir\n";
}

// Get all topics from database
require_once 'config.php';

$topicsQuery = "SELECT t.id, t.kategori_id, t.nama_topik, k.nama_kategori 
                FROM topik_pelajaran t 
                JOIN kategori_soal k ON t.kategori_id = k.id 
                ORDER BY t.kategori_id, t.urutan";
$topicsResult = $conn->query($topicsQuery);

$createdDirs = 0;
$existingDirs = 0;

while ($topic = $topicsResult->fetch_assoc()) {
    $topic_id = $topic['id'];
    $kategori_id = $topic['kategori_id'];
    $kategori_name = $categories[$kategori_id];
    $topic_name = strtolower(str_replace(' ', '_', $topic['nama_topik']));
    
    // Create category directory
    $categoryDir = $baseDir . '/' . $kategori_name;
    if (!file_exists($categoryDir)) {
        mkdir($categoryDir, 0755, true);
        echo "✓ Created category directory: $kategori_name\n";
        $createdDirs++;
    }
    
    // Create topic directory
    $topicDir = $categoryDir . '/' . $topic_id . '_' . $topic_name;
    if (!file_exists($topicDir)) {
        mkdir($topicDir, 0755, true);
        echo "  ✓ Created topic directory: {$topic['nama_topik']}\n";
        $createdDirs++;
    } else {
        $existingDirs++;
    }
}

echo "\n========================================\n";
echo "Total directories created: $createdDirs\n";
echo "Total directories already existed: $existingDirs\n";
echo "========================================\n";

echo "\nDirectory structure created successfully!\n";
echo "Base path: $baseDir\n";
?>
