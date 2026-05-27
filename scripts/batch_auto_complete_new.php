<?php
/**
 * Batch auto-complete for new soal only
 * Processes soal that don't have bahan pelajaran yet
 */

require_once __DIR__ . '/../config.php';

$conn = new mysqli('127.0.0.1', DB_USER, DB_PASS, DB_NAME, 3306);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== BATCH AUTO-COMPLETE FOR NEW SOAL ===\n\n";

// Get soal without bahan pelajaran
$sql = "SELECT s.id FROM soal s 
        LEFT JOIN bahan_pelajaran bp ON s.id = bp.soal_id 
        WHERE bp.soal_id IS NULL AND s.is_duplicate = 0 
        ORDER BY s.id";
$result = $conn->query($sql);

$soalIds = [];
while ($row = $result->fetch_assoc()) {
    $soalIds[] = $row['id'];
}

echo "Found " . count($soalIds) . " soal without bahan pelajaran\n\n";

$processed = 0;
$withBahanPelajaran = 0;

foreach ($soalIds as $soalId) {
    $url = "http://localhost/bimbel/api/auto_complete_bahan_ajar.php?action=analyze_and_complete&soal_id={$soalId}";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "cURL Error: {$error}\n";
    }
    
    if ($httpCode === 200 && $response) {
        $responseData = json_decode($response, true);
        if ($responseData && isset($responseData['success']) && $responseData['success']) {
            if (!isset($responseData['skipped']) || !$responseData['skipped']) {
                $withBahanPelajaran++;
            }
        }
    } else {
        echo "HTTP {$httpCode}: {$response}\n";
    }
    
    $processed++;
    
    if ($processed % 5 === 0) {
        echo "Processed: {$processed}/" . count($soalIds) . " ({$withBahanPelajaran} with bahan pelajaran)\n";
    }
}

echo "\n=== COMPLETE ===\n";
echo "Total processed: {$processed}\n";
echo "With bahan pelajaran: {$withBahanPelajaran}\n";
echo "Coverage: " . round(($withBahanPelajaran / $processed) * 100, 2) . "%\n";

$conn->close();
?>
