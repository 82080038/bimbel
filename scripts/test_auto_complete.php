<?php
/**
 * Test script for auto-complete bahan ajar system
 */

require_once __DIR__ . '/../config.php';

$conn = new mysqli('127.0.0.1', DB_USER, DB_PASS, DB_NAME, 3306);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== Testing Auto-Complete Bahan Ajar System ===\n\n";

// Test 1: Check database tables
echo "Test 1: Checking database tables...\n";
$tables = ['bahan_pelajaran', 'materi_soal', 'topic_keywords', 'materi'];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        echo "✅ Table '$table' exists\n";
    } else {
        echo "❌ Table '$table' missing\n";
    }
}
echo "\n";

// Test 2: Check materi count
echo "Test 2: Checking materi count...\n";
$result = $conn->query("SELECT COUNT(*) as total FROM materi");
$row = $result->fetch_assoc();
echo "Total materi: {$row['total']}\n";
echo "\n";

// Test 3: Get a sample soal
echo "Test 3: Getting sample soal...\n";
$result = $conn->query("SELECT id, pertanyaan, kategori_id FROM soal LIMIT 1");
$soal = $result->fetch_assoc();
echo "Soal ID: {$soal['id']}\n";
echo "Pertanyaan: " . substr($soal['pertanyaan'], 0, 100) . "...\n";
echo "Kategori ID: {$soal['kategori_id']}\n";
echo "\n";

// Test 4: Test keyword extraction
echo "Test 4: Testing keyword extraction...\n";
$text = $soal['pertanyaan'];
$text = strtolower($text);
$text = preg_replace('/[^a-z0-9\s]/', '', $text);
$words = explode(' ', $text);

$stop_words = ['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 'tersebut', 'sebagai', 'oleh'];
$keywords = [];
foreach ($words as $word) {
    if (strlen($word) > 3 && !in_array($word, $stop_words)) {
        $keywords[] = $word;
    }
}
$keywords = array_unique($keywords);
echo "Keywords: " . implode(', ', array_slice($keywords, 0, 10)) . "\n";
echo "\n";

// Test 5: Test auto-link
echo "Test 5: Testing auto-link to materi...\n";
$kategori_id = $soal['kategori_id'];
$materiSql = "SELECT id, judul FROM materi WHERE kategori_id = $kategori_id AND is_active = 1";
$materiResult = $conn->query($materiSql);
$materiCount = $materiResult->num_rows;
echo "Available materi: $materiCount\n";

if ($materiCount > 0) {
    $linkedCount = 0;
    while ($materi = $materiResult->fetch_assoc()) {
        $materiText = strtolower($materi['judul']);
        $matchCount = 0;
        foreach ($keywords as $keyword) {
            if (strpos($materiText, $keyword) !== false) {
                $matchCount++;
            }
        }
        
        if ($matchCount > 0) {
            $relevance = ($matchCount / count($keywords)) * 100;
            if ($relevance > 30) {
                // Check if already linked
                $checkSql = "SELECT id FROM materi_soal WHERE materi_id = {$materi['id']} AND soal_id = {$soal['id']}";
                $checkResult = $conn->query($checkSql);
                
                if ($checkResult->num_rows == 0) {
                    $insertSql = "INSERT INTO materi_soal (materi_id, soal_id, relevance_score, auto_linked) 
                                 VALUES ({$materi['id']}, {$soal['id']}, $relevance, 1)";
                    $conn->query($insertSql);
                    $linkedCount++;
                    echo "✅ Linked to materi: {$materi['judul']} (relevance: " . round($relevance, 2) . "%)\n";
                }
            }
        }
    }
    echo "Total linked: $linkedCount\n";
} else {
    echo "No materi available for linking\n";
}
echo "\n";

// Test 6: Test AI analysis
echo "Test 6: Testing AI question analysis...\n";
$pertanyaan = $soal['pertanyaan'];
$bloom_level = 'understand';
$cognitive_load = 'medium';

// Simple bloom level detection
if (preg_match('/(apa|siapa|kapan|dimana|sebutkan)/i', $pertanyaan)) {
    $bloom_level = 'remember';
} elseif (preg_match('/(jelaskan|uraikan|mengapa)/i', $pertanyaan)) {
    $bloom_level = 'understand';
} elseif (preg_match('/(analisis|bedakan|bandingkan)/i', $pertanyaan)) {
    $bloom_level = 'analyze';
}

echo "Bloom Level: $bloom_level\n";
echo "Cognitive Load: $cognitive_load\n";
echo "\n";

// Test 7: Generate bahan pelajaran
echo "Test 7: Generating bahan pelajaran...\n";
$judul = "Pembahasan Soal #{$soal['id']}";
$konten = "<h2>Pembahasan Soal</h2>";
$konten .= "<p><strong>Pertanyaan:</strong> {$soal['pertanyaan']}</p>";
$konten .= "<p><strong>Tips:</strong> Baca pertanyaan dengan teliti dan identifikasi kata kunci.</p>";

$judul_escaped = $conn->real_escape_string($judul);
$konten_escaped = $conn->real_escape_string($konten);

$insertSql = "INSERT INTO bahan_pelajaran (soal_id, judul, konten, tipe, urutan)
              VALUES ({$soal['id']}, '$judul_escaped', '$konten_escaped', 'html', 0)";

if ($conn->query($insertSql)) {
    echo "✅ Bahan pelajaran created (ID: {$conn->insert_id})\n";
} else {
    echo "❌ Failed to create bahan pelajaran\n";
}
echo "\n";

// Test 8: Check final status
echo "Test 8: Final status check...\n";
$result = $conn->query("SELECT COUNT(*) as total FROM bahan_pelajaran");
$row = $result->fetch_assoc();
echo "Total bahan_pelajaran: {$row['total']}\n";

$result = $conn->query("SELECT COUNT(*) as total FROM materi_soal");
$row = $result->fetch_assoc();
echo "Total materi_soal links: {$row['total']}\n";

$result = $conn->query("SELECT COUNT(*) as total FROM topic_keywords");
$row = $result->fetch_assoc();
echo "Total topic_keywords: {$row['total']}\n";

echo "\n=== Test Complete ===\n";

$conn->close();
?>
