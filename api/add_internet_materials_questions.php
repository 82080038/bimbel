<?php
header('Content-Type: application/json');

// Database configuration
$host = '127.0.0.1';
$user = 'root';
$pass = 'root';
$dbname = 'ujian_sekolah_kedinasan';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sqlFile = '../scripts/add_internet_materials_questions.sql';
    
    if (!file_exists($sqlFile)) {
        echo json_encode([
            'success' => false,
            'error' => 'SQL file not found'
        ]);
        exit;
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Split SQL statements by semicolon
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    $successCount = 0;
    $errorCount = 0;
    $errors = [];
    
    foreach ($statements as $statement) {
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue;
        }
        
        try {
            $conn->exec($statement);
            $successCount++;
        } catch (PDOException $e) {
            $errorCount++;
            $errors[] = $e->getMessage();
        }
    }
    
    echo json_encode([
        'success' => true,
        'successCount' => $successCount,
        'errorCount' => $errorCount,
        'errors' => $errors,
        'message' => "Successfully added $successCount questions to the database"
    ]);
    
    $conn = null;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
