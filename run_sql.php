<?php
/**
 * SQL Migration Runner
 * Run SQL files from database folder
 */

require 'config.php';

$database = DB_NAME;
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$files_to_run = [
    'database/high_priority_improvements.sql',
    'database/medium_priority_improvements.sql',
    'database/low_priority_improvements.sql',
    'database/add_participant_fields.sql',
    'database/bahan_pelajaran.sql',
    'database/paket_tryout.sql',
    'database/soal_frequency.sql',
    'database/tingkat_kesulitan.sql',
    'database/tryout_system.sql',
    'database/ai_analysis.sql',
    'database/normalization_phase1.sql',
    'database/normalization_phase2.sql',
    'database/normalization_phase3.sql',
    'database/performance_indexes.sql'
];

echo "Starting SQL migration...\n\n";

foreach ($files_to_run as $file) {
    if (file_exists($file)) {
        echo "Processing $file...\n";
        
        $sql = file_get_contents($file);
        
        // Split by semicolon for individual statements
        $statements = explode(';', $sql);
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement) && !preg_match('/^--/', $statement)) {
                try {
                    if ($conn->query($statement)) {
                        echo "  ✓ Executed successfully\n";
                    } else {
                        $error = $conn->error;
                        // Ignore duplicate column/table errors
                        if (strpos($error, 'Duplicate column') !== false || 
                            strpos($error, 'Duplicate entry') !== false ||
                            strpos($error, 'already exists') !== false) {
                            echo "  - Skipped (already exists)\n";
                        } else {
                            echo "  ✗ Error: " . $error . "\n";
                        }
                    }
                } catch (Exception $e) {
                    echo "  ! Exception: " . $e->getMessage() . "\n";
                }
            }
        }
        
        echo "\n";
    } else {
        echo "File not found: $file\n\n";
    }
}

echo "Migration completed.\n";
$conn->close();
