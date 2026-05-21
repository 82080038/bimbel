<?php
// Test API Endpoints Comprehensively
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== COMPREHENSIVE API ENDPOINTS TEST ===\n\n";

// Test database connection
require_once __DIR__ . '/config.php';

echo "1. Database Connection Test:\n";
if (isset($conn) && $conn instanceof mysqli && !$conn->connect_error) {
    echo "   ✓ Database connection successful\n\n";
} else {
    echo "   ✗ Database connection failed\n";
    exit(1);
}

// API endpoints to test
$endpoints = [
    'auth.php' => [
        'actions' => ['login'],
        'methods' => ['POST'],
        'data' => ['username' => 'admin', 'password' => 'admin123']
    ],
    'soal.php' => [
        'actions' => ['get_soal', 'get_kategori'],
        'methods' => ['GET'],
        'data' => []
    ],
    'analytics.php' => [
        'actions' => ['get_stats'],
        'methods' => ['GET'],
        'data' => []
    ],
    'courses.php' => [
        'actions' => ['get_courses'],
        'methods' => ['GET'],
        'data' => []
    ],
    'gamification.php' => [
        'actions' => ['get_xp'],
        'methods' => ['GET'],
        'data' => []
    ],
    'notifications.php' => [
        'actions' => ['get_notifications'],
        'methods' => ['GET'],
        'data' => []
    ],
    'expert.php' => [
        'actions' => ['get_knowledge'],
        'methods' => ['GET'],
        'data' => []
    ]
];

$baseURL = 'http://localhost/ujian/api';

echo "2. Testing API Endpoints:\n\n";

foreach ($endpoints as $file => $config) {
    echo "   Testing $file:\n";
    
    foreach ($config['actions'] as $action) {
        $url = $baseURL . '/' . $file . '?action=' . $action;
        $method = $config['methods'][0];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($method === 'POST' && !empty($config['data'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($config['data']));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            echo "     ✓ $action (HTTP $httpCode)\n";
        } else {
            echo "     ✗ $action (HTTP $httpCode)\n";
            echo "       Response: " . substr($response, 0, 100) . "...\n";
        }
    }
    echo "\n";
}

echo "3. Check API File Existence:\n";
$apiFiles = glob(__DIR__ . '/api/*.php');
foreach ($apiFiles as $file) {
    $filename = basename($file);
    echo "   ✓ $filename exists\n";
}

echo "\n=== TEST COMPLETE ===\n";
?>
