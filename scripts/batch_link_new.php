<?php
/**
 * Batch materi-soal linking for new soal only
 * Links soal that don't have materi links yet
 */

require_once __DIR__ . '/../config.php';

$conn = new mysqli('127.0.0.1', DB_USER, DB_PASS, DB_NAME, 3306);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== BATCH MATERI-SOAL LINKING FOR NEW SOAL ===\n\n";

// Get all materi
$sql = "SELECT id, judul, kategori_id, topic_id FROM materi WHERE is_active = 1";
$result = $conn->query($sql);

$materiList = [];
while ($row = $result->fetch_assoc()) {
    $materiList[] = $row;
}

echo "Found " . count($materiList) . " active materi\n\n";

// Get soal without materi links
$sql = "SELECT s.id, s.pertanyaan, s.kategori_id FROM soal s 
        LEFT JOIN materi_soal ms ON s.id = ms.soal_id 
        WHERE ms.soal_id IS NULL AND s.is_duplicate = 0 
        ORDER BY s.id";
$result = $conn->query($sql);

$processed = 0;
$linked = 0;
$skipped = 0;

while ($row = $result->fetch_assoc()) {
    $soalId = $row['id'];
    $soalKategoriId = $row['kategori_id'];
    $soalPertanyaan = strtolower($row['pertanyaan']);
    
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
            $materiKeywords = preg_split('/\s+/', strtolower($materi['judul']));
            $materiKeywords = array_filter($materiKeywords, function($word) {
                return strlen($word) > 3;
            });
            
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
    
    // Link to top 3 matching materi
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
    } else {
        $skipped++;
    }
    
    $processed++;
    
    if ($processed % 10 === 0) {
        echo "Processed: {$processed} ({$linked} linked, {$skipped} skipped)\n";
    }
}

echo "\n=== COMPLETE ===\n";
echo "Total processed: {$processed}\n";
echo "Total linked: {$linked}\n";
echo "Total skipped (no match): {$skipped}\n";
echo "Linking rate: " . round(($linked / $processed) * 100, 2) . "%\n";

$conn->close();
?>
