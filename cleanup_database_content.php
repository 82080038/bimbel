<?php
// Clean up database - remove konten field for materials that have file_path
// Access via: http://localhost/bimbel/cleanup_database_content.php
// Date: 2026-05-26

require_once 'config.php';

header('Content-Type: text/plain');

try {
    echo "Cleaning up database content...\n\n";
    
    // Update records that have file_path to clear konten field
    $sql = "UPDATE bahan_pelajaran 
            SET konten = NULL 
            WHERE file_path IS NOT NULL AND konten IS NOT NULL";
    
    $result = $conn->query($sql);
    
    if ($result) {
        $affected_rows = $conn->affected_rows;
        echo "✓ Cleared konten field for $affected_rows records with file_path\n";
    } else {
        echo "✗ Failed to clear konten field: " . $conn->error . "\n";
    }
    
    // Verify the cleanup
    $check_sql = "SELECT COUNT(*) as total, 
                  SUM(CASE WHEN konten IS NOT NULL THEN 1 ELSE 0 END) as with_content,
                  SUM(CASE WHEN file_path IS NOT NULL THEN 1 ELSE 0 END) as with_file
                  FROM bahan_pelajaran";
    
    $check_result = $conn->query($check_sql);
    $stats = $check_result->fetch_assoc();
    
    echo "\nDatabase statistics:\n";
    echo "- Total records: {$stats['total']}\n";
    echo "- Records with konten: {$stats['with_content']}\n";
    echo "- Records with file_path: {$stats['with_file']}\n";
    
    echo "\nCleanup completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
