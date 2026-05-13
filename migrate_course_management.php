<?php
// Course Management Database Migration Script
// Run this file to create course management tables

require_once 'config.php';

checkDatabaseConnection();

echo "Starting Course Management Database Migration...\n";

// Read SQL file
$sqlFile = __DIR__ . '/database/course_management.sql';
if (!file_exists($sqlFile)) {
    die("SQL file not found: $sqlFile\n");
}

$sql = file_get_contents($sqlFile);

// Remove comments
$sql = preg_replace('/--.*$/m', '', $sql);

// Split by semicolon but preserve CREATE TABLE statements
$statements = [];
$currentStatement = '';
$inCreateTable = false;

$lines = explode("\n", $sql);
foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line)) continue;
    
    if (stripos($line, 'CREATE TABLE') === 0) {
        $inCreateTable = true;
    }
    
    $currentStatement .= $line . ' ';
    
    if (strpos($line, ';') !== false) {
        if ($inCreateTable) {
            $statements[] = $currentStatement;
            $inCreateTable = false;
        } else {
            $statements[] = $currentStatement;
        }
        $currentStatement = '';
    }
}

$success = 0;
$failed = 0;

foreach ($statements as $statement) {
    $statement = trim($statement);
    if (empty($statement)) continue;
    
    try {
        if ($conn->query($statement)) {
            $success++;
            echo "✅ Success: " . substr($statement, 0, 50) . "...\n";
        } else {
            $failed++;
            echo "❌ Failed: " . $conn->error . "\n";
            echo "   Statement: " . substr($statement, 0, 100) . "...\n";
        }
    } catch (Exception $e) {
        $failed++;
        echo "❌ Error: " . $e->getMessage() . "\n";
        echo "   Statement: " . substr($statement, 0, 100) . "...\n";
    }
}

echo "\nMigration completed:\n";
echo "✅ Successful statements: $success\n";
echo "❌ Failed statements: $failed\n";

if ($failed === 0) {
    echo "\n🎉 Course Management tables created successfully!\n";
} else {
    echo "\n⚠️ Some statements failed. Please check the errors above.\n";
}
?>
