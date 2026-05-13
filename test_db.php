<?php
/**
 * Simple Database Connection Test
 * Run this to verify database connection
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Database Connection Test</h1>";
echo "<hr>";

// Test 1: Check constants
echo "<h2>1. Configuration</h2>";
echo "<pre>";
echo "DB_HOST: " . DB_HOST . "\n";
echo "DB_USER: " . DB_USER . "\n";
echo "DB_PASS: " . (DB_PASS ? '***' : '(empty)') . "\n";
echo "DB_NAME: " . DB_NAME . "\n";
echo "</pre>";

// Test 2: Check connection
echo "<h2>2. Connection Status</h2>";
if (isset($conn) && $conn instanceof mysqli) {
    if ($conn->connect_error) {
        echo "<p style='color: red;'>❌ FAILED: " . htmlspecialchars($conn->connect_error) . "</p>";
    } else {
        echo "<p style='color: green;'>✅ SUCCESS: Connected to database</p>";
        echo "<p>Server Version: " . $conn->server_info . "</p>";
    }
} else {
    echo "<p style='color: red;'>❌ FAILED: Connection not established</p>";
}

// Test 3: Check database exists
echo "<h2>3. Database Check</h2>";
if (isset($conn) && !$conn->connect_error) {
    $result = $conn->query("SHOW DATABASES LIKE '" . $conn->real_escape_string(DB_NAME) . "'");
    if ($result && $result->num_rows > 0) {
        echo "<p style='color: green;'>✅ Database '
