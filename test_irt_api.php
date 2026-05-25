<?php
// Test IRT API directly
require 'config.php';

// Test 1: No filter
echo "=== Test 1: No filter ===\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/bimbel/api/soal.php?action=get_irt_analysis');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
echo "Count: " . count($data['data']) . "\n";

// Test 2: Filter by category name TWK
echo "\n=== Test 2: Filter by kategori=TWK ===\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/bimbel/api/soal.php?action=get_irt_analysis&kategori=TWK');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
echo "Count: " . count($data['data']) . "\n";
if (count($data['data']) > 0) {
    echo "First item category: " . $data['data'][0]['nama_kategori'] . "\n";
}

// Test 3: Filter by category ID 1
echo "\n=== Test 3: Filter by kategori=1 (ID) ===\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/bimbel/api/soal.php?action=get_irt_analysis&kategori=1');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
echo "Count: " . count($data['data']) . "\n";
if (count($data['data']) > 0) {
    echo "First item category: " . $data['data'][0]['nama_kategori'] . "\n";
}

// Test 4: Filter by quality
echo "\n=== Test 4: Filter by quality=excellent ===\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/bimbel/api/soal.php?action=get_irt_analysis&quality=excellent');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
echo "Count: " . count($data['data']) . "\n";
