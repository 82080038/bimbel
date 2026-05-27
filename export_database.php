<?php
// Database Export Script
require_once 'config.php';

checkDatabaseConnection();

// Get database name from config
$dbname = 'ujian_sekolah_kedinasan';

// Create export filename with timestamp
$filename = 'database/export_' . date('Y-m-d_H-i-s') . '.sql';
$filepath = __DIR__ . '/' . $filename;

// Open file for writing
$fp = fopen($filepath, 'w');
if (!$fp) {
    die("Failed to create file: $filepath\n");
}

// Get all tables
$sql = "SHOW TABLES";
$result = $conn->query($sql);
$tables = [];
while ($row = $result->fetch_row()) {
    $tables[] = $row[0];
}

// Write header
fwrite($fp, "-- Database Export\n");
fwrite($fp, "-- Generated: " . date('Y-m-d H:i:s') . "\n");
fwrite($fp, "-- Database: $dbname\n\n");

// Export each table
foreach ($tables as $table) {
    // Get table structure
    fwrite($fp, "--\n-- Table structure for table `$table`\n--\n");
    $sql = "SHOW CREATE TABLE `$table`";
    $result = $conn->query($sql);
    $row = $result->fetch_row();
    fwrite($fp, $row[1] . ";\n\n");
    
    // Get table data
    $sql = "SELECT * FROM `$table`";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        fwrite($fp, "--\n-- Dumping data for table `$table`\n--\n");
        
        while ($row = $result->fetch_assoc()) {
            $values = array_map(function($val) use ($conn) {
                if ($val === null) return 'NULL';
                if (is_numeric($val)) return $val;
                return "'" . $conn->real_escape_string($val) . "'";
            }, $row);
            
            $columns = array_keys($row);
            $sql = "INSERT INTO `$table` (`" . implode('`, `', $columns) . "`) VALUES (" . implode(', ', $values) . ");";
            fwrite($fp, $sql . "\n");
        }
        
        fwrite($fp, "\n");
    }
}

fclose($fp);

echo "✅ Database exported successfully to: $filename\n";
echo "File size: " . filesize($filepath) . " bytes\n";
echo "Tables exported: " . count($tables) . "\n";
?>
