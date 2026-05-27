<?php
require_once __DIR__ . '/../config.php';

// Ensure connection exists
if (!isset($conn) || !($conn instanceof mysqli) || $conn->connect_error) {
    die("Database connection failed\n");
}

// Get all sesi_ujian records with ability_estimate = 0
$sql = "SELECT su.id, su.user_id, su.durasi_menit, 
        (SELECT MAX(nilai_total) FROM hasil_ujian WHERE user_id = su.user_id) as max_nilai_total
        FROM sesi_ujian su 
        WHERE su.ability_estimate = 0.0000 OR su.ability_estimate IS NULL";

$result = $conn->query($sql);

$updated = 0;
$passing_grade = 500; // Default passing grade

while ($row = $result->fetch_assoc()) {
    $sesi_id = $row['id'];
    $nilai_total = $row['max_nilai_total'] ?? 0;
    
    // Calculate ability estimate (normalized score on -3 to +3 scale)
    $max_score = $passing_grade;
    $normalized_score = ($nilai_total / $max_score) * 2 - 1; // -1 to 1 range
    $ability_estimate = $normalized_score * 3; // Scale to -3 to +3 (IRT theta range)
    
    // Update sesi_ujian
    $update_sql = "UPDATE sesi_ujian SET ability_estimate = ? WHERE id = ?";
    $stmt = $conn->prepare($update_sql);
    $stmt->bind_param("di", $ability_estimate, $sesi_id);
    $stmt->execute();
    
    $updated++;
    echo "Updated sesi_id $sesi_id: nilai_total=$nilai_total, ability_estimate=$ability_estimate\n";
}

echo "\nTotal updated: $updated records\n";
