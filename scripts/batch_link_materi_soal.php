<?php
/**
 * Batch script to link soal to materi automatically
 * Links soal to materi based on kategori_id and topic keywords
 */

require_once __DIR__ . '/../config.php';

$conn = new mysqli('127.0.0.1', DB_USER, DB_PASS, DB_NAME, 3306);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== BATCH MATERI-SOAL LINKING ===\n\n";

// Get total soal count
$sql = "SELECT COUNT(*) as total FROM soal WHERE is_duplicate = 0";
$result = $conn->query($sql);
$totalSoal = $result->fetch_assoc()['total'];

echo "Total soal to process: {$totalSoal}\n\n";

// Get all materi
$sql = "SELECT id, judul, kategori_id, topic_id FROM materi WHERE is_active = 1";
$result = $conn->query($sql);

$materiList = [];
while ($row = $result->fetch_assoc()) {
    $materiList[] = $row;
}

echo "Found " . count($materiList) . " active materi\n\n";

// Get all soal with kategori_id
$sql = "SELECT id, pertanyaan, kategori_id FROM soal WHERE is_duplicate = 0 ORDER BY id";
$result = $conn->query($sql);

$processed = 0;
$linked = 0;
$skipped = 0;

while ($row = $result->fetch_assoc()) {
    $soalId = $row['id'];
    $soalKategoriId = $row['kategori_id'];
    $soalPertanyaan = strtolower($row['pertanyaan']);
    
    // Check if already linked
    $checkSql = "SELECT COUNT(*) as count FROM materi_soal WHERE soal_id = $soalId";
    $checkResult = $conn->query($checkSql);
    $alreadyLinked = $checkResult->fetch_assoc()['count'] > 0;
    
    if ($alreadyLinked) {
        $skipped++;
        $processed++;
        continue;
    }
    
    // Find matching materi based on kategori_id
    $matchedMateri = [];
    foreach ($materiList as $materi) {
        $relevanceScore = 0.0;
        
        // Match by kategori_id (high relevance)
        if ($materi['kategori_id'] == $soalKategoriId) {
            $relevanceScore = 0.90;
        }
        
        // Match by topic keywords (medium relevance)
        if ($relevanceScore < 0.50) {
            // Extract keywords from materi judul
            $materiKeywords = preg_split('/\s+/', strtolower($materi['judul']));
            $materiKeywords = array_filter($materiKeywords, function($word) {
                return strlen($word) > 3;
            });
            
            // Check if any keyword appears in soal pertanyaan
            foreach ($materiKeywords as $keyword) {
                if (strpos($soalPertanyaan, $keyword) !== false) {
                    $relevanceScore = max($relevanceScore, 0.60);
                    break;
                }
            }
        }
        
        // Minimum relevance threshold
        if ($relevanceScore >= 0.50) {
            $matchedMateri[] = [
                'materi_id' => $materi['id'],
                'relevance_score' => $relevanceScore
            ];
        }
    }
    
    // Sort by relevance score (highest first)
    usort($matchedMateri, function($a, $b) {
        return $b['relevance_score'] <=> $a['relevance_score'];
    });
    
    // Link to top 3 matching materi (or fewer if less matches)
    $topMatches = array_slice($matchedMateri, 0, 3);
    
    foreach ($topMatches as $match) {
        $insertSql = "INSERT INTO materi_soal (materi_id, soal_id, relevance_score, auto_linked, created_at) 
                      VALUES (?, ?, ?, 1, NOW())";
        $stmt = $conn->prepare($insertSql);
        $stmt->bind_param('iid', $match['materi_id'], $soalId, $match['relevance_score']);
        $stmt->execute();
    }
    
    if (count($topMatches) > 0) {
        $linked++;
    }
    
    $processed++;
    
    if ($processed % 100 === 0) {
        echo "Processed: {$processed}/{$totalSoal} ({$linked} linked, {$skipped} skipped)\n";
    }
}

echo "\n=== COMPLETE ===\n";
echo "Total processed: {$processed}\n";
echo "Total linked: {$linked}\n";
echo "Total skipped (already linked): {$skipped}\n";
echo "Linking rate: " . round(($linked / $totalSoal) * 100, 2) . "%\n";

$conn->close();
?>
