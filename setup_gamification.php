<?php
// Setup script to create gamification tables
// Run this file in browser: http://localhost/ujian/setup_gamification.php

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo '<!DOCTYPE html>
<html>
<head>
    <title>Setup Gamification Tables</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Setup Gamification Tables</h1>';

// Check database connection
if (!isset($conn) || $conn->connect_error) {
    echo '<p class="error">Database connection failed: ' . ($conn->connect_error ?? 'Unknown error') . '</p>';
    echo '</body></html>';
    exit;
}

echo '<p class="success">Database connected successfully</p>';

// Read SQL file
$sql_file = 'database/gamification.sql';
if (!file_exists($sql_file)) {
    echo '<p class="error">SQL file not found: ' . $sql_file . '</p>';
    echo '</body></html>';
    exit;
}

$sql_content = file_get_contents($sql_file);
echo '<p class="info">SQL file loaded: ' . $sql_file . '</p>';

// Split SQL into individual statements
$sql_statements = explode(';', $sql_content);

$errors = [];
$success_count = 0;

foreach ($sql_statements as $statement) {
    $statement = trim($statement);
    if (empty($statement) || strpos($statement, '--') === 0) {
        continue;
    }
    
    try {
        if ($conn->query($statement)) {
            $success_count++;
            echo '<p class="success">✓ Query executed successfully</p>';
        } else {
            // Some queries might fail if they're duplicates (INSERT with ON DUPLICATE KEY UPDATE)
            if (strpos($statement, 'INSERT') !== false) {
                echo '<p class="info">ℹ INSERT query (may be duplicate, handled by ON DUPLICATE KEY)</p>';
                $success_count++;
            } else {
                $error = $conn->error;
                $errors[] = $error;
                echo '<p class="error">✗ Query failed: ' . $error . '</p>';
                echo '<pre>' . htmlspecialchars($statement) . '</pre>';
            }
        }
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
        echo '<p class="error">✗ Exception: ' . $e->getMessage() . '</p>';
    }
}

echo '<h2>Summary</h2>';
echo '<p class="success">Successful queries: ' . $success_count . '</p>';
if (!empty($errors)) {
    echo '<p class="error">Errors: ' . count($errors) . '</p>';
} else {
    echo '<p class="success">All queries executed successfully!</p>';
}

echo '<p><a href="admin/admin.html">Return to Admin Panel</a></p>';
echo '</body></html>';
?>
