<?php
header('Content-Type: application/json');

require_once '../config.php';

try {
    checkDatabaseConnection();
    
    $dbname = 'ujian_sekolah_kedinasan';
    $filename = 'database/export_' . date('Y-m-d_H-i-s') . '.sql';
    $filepath = __DIR__ . '/../' . $filename;
    
    $fp = fopen($filepath, 'w');
    if (!$fp) {
        throw new Exception("Failed to create file: $filepath");
    }
    
    $sql = "SHOW TABLES";
    $result = $conn->query($sql);
    $tables = [];
    while ($row = $result->fetch_row()) {
        $tables[] = $row[0];
    }
    
    fwrite($fp, "-- Database Export\n");
    fwrite($fp, "-- Generated: " . date('Y-m-d H:i:s') . "\n");
    fwrite($fp, "-- Database: $dbname\n\n");
    
    foreach ($tables as $table) {
        fwrite($fp, "--\n-- Table structure for table `$table`\n--\n");
        $sql = "SHOW CREATE TABLE `$table`";
        $result = $conn->query($sql);
        $row = $result->fetch_row();
        fwrite($fp, $row[1] . ";\n\n");
        
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
    
    echo json_encode([
        'success' => true,
        'filename' => $filename,
        'filesize' => filesize($filepath),
        'tables' => count($tables),
        'message' => 'Database exported successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
