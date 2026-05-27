<?php
/**
 * Generate SHA256 hashes for remaining soal without hash
 * Fix the issue where some soal were not processed
 */

require_once __DIR__ . '/../config.php';

$conn = new mysqli('127.0.0.1', DB_USER, DB_PASS, DB_NAME, 3306);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== Generating Hashes for Remaining Soal ===\n\n";

// Get all soal without hash (using LEFT JOIN instead of NOT IN)
$sql = "SELECT s.id, s.pertanyaan 
        FROM soal s 
        LEFT JOIN soal_duplicate_check d ON s.id = d.soal_id 
        WHERE d.soal_id IS NULL";
$result = $conn->query($sql);

$totalSoal = $result->num_rows;
echo "Found {$totalSoal} soal without hash\n\n";

if ($totalSoal === 0) {
    echo "All soal already have hashes!\n";
    $conn->close();
    exit;
}

$generated = 0;
$duplicates = 0;

while ($row = $result->fetch_assoc()) {
    $soalId = $row['id'];
    $pertanyaan = $row['pertanyaan'];
    
    // Skip if pertanyaan is null or empty
    if (empty($pertanyaan)) {
        echo "⏭️  Skipping soal ID {$soalId} (empty pertanyaan)\n";
        continue;
    }
    
    // Generate hash
    $normalized = strtolower($pertanyaan);
    $normalized = preg_replace('/\s+/', ' ', $normalized);
    $normalized = preg_replace('/[^\w\s]/', '', $normalized);
    $normalized = trim($normalized);
    
    $hash = hash('sha256', $normalized);
    
    // Check if hash already exists (duplicate)
    $checkSql = "SELECT id FROM soal_duplicate_check WHERE soal_hash = ?";
    $stmt = $conn->prepare($checkSql);
    $stmt->bind_param('s', $hash);
    $stmt->execute();
    $checkResult = $stmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        // Duplicate found - don't insert, just count
        $duplicates++;
        echo "⚠️  Duplicate found for soal ID {$soalId}\n";
    } else {
        // Insert hash
        $insertSql = "INSERT INTO soal_duplicate_check (soal_hash, soal_id, source_id) VALUES (?, ?, NULL)";
        $stmt = $conn->prepare($insertSql);
        $stmt->bind_param('si', $hash, $soalId);
        $stmt->execute();
        
        $generated++;
        
        if ($generated % 100 === 0) {
            echo "✅ Generated {$generated} hashes...\n";
        }
    }
    
    $stmt->close();
}

echo "\n=== Complete ===\n";
echo "Total hashes generated: {$generated}\n";
echo "Total duplicates found: {$duplicates}\n";

// Get final statistics
$finalSql = "SELECT COUNT(*) as total FROM soal_duplicate_check";
$finalResult = $conn->query($finalSql);
$finalRow = $finalResult->fetch_assoc();

echo "Total hashes in database: {$finalRow['total']}\n";

// Check remaining
$remainingSql = "SELECT COUNT(*) as total 
                 FROM soal s 
                 LEFT JOIN soal_duplicate_check d ON s.id = d.soal_id 
                 WHERE d.soal_id IS NULL";
$remainingResult = $conn->query($remainingSql);
$remainingRow = $remainingResult->fetch_assoc();

echo "Remaining soal without hash: {$remainingRow['total']}\n";

$conn->close();
?>
