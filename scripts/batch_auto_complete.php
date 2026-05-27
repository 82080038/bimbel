<?php
/**
 * Batch auto-complete bahan ajar for all soal
 * This script processes all soal in the database and generates bahan pelajaran
 */

require_once __DIR__ . '/../config.php';

$conn = new mysqli('127.0.0.1', DB_USER, DB_PASS, DB_NAME, 3306);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== BATCH AUTO-COMPLETE BAHAN AJAR ===\n\n";

// Get total soal count
$sql = "SELECT COUNT(*) as total FROM soal WHERE is_duplicate = 0";
$result = $conn->query($sql);
$totalSoal = $result->fetch_assoc()['total'];

echo "Total soal to process: {$totalSoal}\n\n";

// Get all soal IDs first
$sql = "SELECT id FROM soal WHERE is_duplicate = 0 ORDER BY id";
$result = $conn->query($sql);

$soalIds = [];
while ($row = $result->fetch_assoc()) {
    $soalIds[] = $row['id'];
}

echo "Found " . count($soalIds) . " soal IDs to process\n\n";

// Process in batches
$batchSize = 100;
$processed = 0;
$withBahanPelajaran = 0;

foreach ($soalIds as $soalId) {
        
        // Call auto-complete API for this soal
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
        
        if ($processed % 10 === 0) {
            echo "Processed: {$processed}/{$totalSoal} ({$withBahanPelajaran} with bahan pelajaran)\n";
        }
    }

echo "\n=== COMPLETE ===\n";
echo "Total processed: {$processed}\n";
echo "With bahan pelajaran: {$withBahanPelajaran}\n";
echo "Coverage: " . round(($withBahanPelajaran / $totalSoal) * 100, 2) . "%\n";

$conn->close();
?>
