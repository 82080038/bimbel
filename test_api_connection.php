<?php
// Test API Connection
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== API CONNECTION TEST ===\n\n";

// Test database connection
require_once __DIR__ . '/config.php';

echo "1. Testing database connection...\n";
if (isset($conn) && $conn instanceof mysqli && !$conn->connect_error) {
    echo "   ✓ Database connection successful\n\n";
} else {
    echo "   ✗ Database connection failed\n";
    if (isset($GLOBALS['db_error'])) {
        echo "   Error: " . $GLOBALS['db_error'] . "\n";
    }
    exit(1);
}

// Test API endpoint
echo "2. Testing auth API endpoint...\n";
$apiUrl = 'http://localhost/ujian/api/auth.php?action=login';
$testData = json_encode(['username' => 'admin', 'password' => 'admin123']);

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $testData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "   ✓ API endpoint reachable (HTTP $httpCode)\n";
    echo "   Response: " . substr($response, 0, 200) . "...\n\n";
} else {
    echo "   ✗ API endpoint failed (HTTP $httpCode)\n";
    echo "   Response: " . $response . "\n\n";
}

// Test file structure
echo "3. Checking critical files...\n";
$criticalFiles = [
    'index.php',
    'login.html',
    'admin/admin.html',
    'participant/dashboard.html',
    'api/auth.php',
    'api/soal.php',
    'js/config.js',
    'js/rbac.js'
];

foreach ($criticalFiles as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "   ✓ $file exists\n";
    } else {
        echo "   ✗ $file missing\n";
    }
}

echo "\n=== TEST COMPLETE ===\n";
?>
