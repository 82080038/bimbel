<?php
// Migration script: Add topic_id to bahan_pelajaran table
// Date: 2026-05-26

require_once 'config.php';

try {
    // Add topic_id column
    $sql1 = "ALTER TABLE bahan_pelajaran 
             ADD COLUMN topic_id INT(11) DEFAULT NULL AFTER kategori_id";
    
    if ($conn->query($sql1)) {
        echo "✓ Added topic_id column to bahan_pelajaran\n";
    } else {
        echo "✗ Failed to add topic_id column: " . $conn->error . "\n";
    }
    
    // Add foreign key constraint
    $sql2 = "ALTER TABLE bahan_pelajaran 
             ADD CONSTRAINT bahan_pelajaran_ibfk_2 FOREIGN KEY (topic_id) REFERENCES topik_pelajaran(id) ON DELETE SET NULL";
    
    if ($conn->query($sql2)) {
        echo "✓ Added foreign key constraint for topic_id\n";
    } else {
        echo "✗ Failed to add foreign key constraint: " . $conn->error . "\n";
    }
    
    // Add index for better query performance
    $sql3 = "ALTER TABLE bahan_pelajaran 
             ADD INDEX idx_topic_id (topic_id)";
    
    if ($conn->query($sql3)) {
        echo "✓ Added index for topic_id\n";
    } else {
        echo "✗ Failed to add index: " . $conn->error . "\n";
    }
    
    // Verify the change
    $result = $conn->query("DESCRIBE bahan_pelajaran");
    echo "\nBahan Pelajaran table structure:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    
    echo "\nMigration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
