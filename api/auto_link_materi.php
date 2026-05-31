<?php
/**
 * API untuk auto-link soal ke materi pembelajaran
 * Sistem otomatis untuk menghubungkan soal dengan materi yang relevan
 */

header('Content-Type: application/json');
require_once '../config.php';

$action = $_GET['action'] ?? '';

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    switch ($action) {
        case 'link_single':
            linkSingleSoal();
            break;
        case 'link_batch':
            linkBatchSoal();
            break;
        case 'link_all':
            linkAllSoal();
            break;
        case 'analyze_keywords':
            analyzeKeywords();
            break;
        case 'get_relevant_materi':
            getRelevantMateri();
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function extractKeywords($text) {
    // Extract keywords from text
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s]/', '', $text);
    $words = explode(' ', $text);
    
    // Filter common words (stop words)
    $stop_words = ['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 'tersebut', 'sebagai', 'oleh', 'dalam', 'akan', 'telah', 'adalah', 'merupakan', 'yaitu', 'yakni', 'serta', 'ataupun', 'bagi', 'terhadap', 'dengan', 'oleh', 'karena', 'sehingga', 'apabila', 'jika', 'kalau', 'bila', 'walaupun', 'meskipun', 'namun', 'tetapi', 'melainkan', 'kecuali', 'selain', 'lain', 'lainnya', 'semua', 'tiap', 'setiap', 'masing-masing', 'sendiri', 'sendirinya', 'ia', 'dia', 'mereka', 'kita', 'kami', 'anda', 'kamu', 'beliau', 'saya', 'aku', 'kita', 'kamu', 'kalian', 'para', 'siapa', 'apa', 'bagaimana', 'mengapa', 'kapan', 'dimana', 'kemana', 'darimana', 'berapa', 'mana', 'yangmana'];
    
    $keywords = [];
    foreach ($words as $word) {
        if (strlen($word) > 3 && !in_array($word, $stop_words)) {
            $keywords[] = $word;
        }
    }
    
    return array_unique($keywords);
}

function calculateRelevance($soalKeywords, $materiTitle, $materiDesc) {
    // Calculate relevance score between soal and materi
    $materiText = strtolower($materiTitle . ' ' . ($materiDesc ?? ''));
    $materiText = preg_replace('/[^a-z0-9\s]/', '', $materiText);
    
    $matchCount = 0;
    foreach ($soalKeywords as $keyword) {
        if (strpos($materiText, $keyword) !== false) {
            $matchCount++;
        }
    }
    
    if (count($soalKeywords) == 0) return 0;
    
    $relevance = ($matchCount / count($soalKeywords)) * 100;
    return min($relevance, 100);
}

function linkSingleSoal() {
    global $conn;
    
    $soal_id = intval($_GET['soal_id'] ?? 0);
    if ($soal_id == 0) {
        throw new Exception("soal_id is required");
    }
    
    // Get soal data
    $sql = "SELECT pertanyaan, pembahasan, kategori_id FROM soal WHERE id = $soal_id";
    $result = $conn->query($sql);
    $soal = $result->fetch_assoc();
    
    if (!$soal) {
        throw new Exception("Soal not found");
    }
    
    // Extract keywords
    $text = $soal['pertanyaan'] . ' ' . ($soal['pembahasan'] ?? '');
    $keywords = extractKeywords($text);
    
    // Get relevant materi
    $kategori_id = $soal['kategori_id'];
    $sql = "SELECT id, judul, deskripsi FROM materi WHERE kategori_id = $kategori_id AND is_active = 1";
    $result = $conn->query($sql);
    
    $linkedCount = 0;
    while ($materi = $result->fetch_assoc()) {
        $relevance = calculateRelevance($keywords, $materi['judul'], $materi['deskripsi']);
        
        // Only link if relevance > 30%
        if ($relevance > 30) {
            // Check if already linked
            $checkSql = "SELECT id FROM materi_soal WHERE materi_id = {$materi['id']} AND soal_id = $soal_id";
            $checkResult = $conn->query($checkSql);
            
            if ($checkResult->num_rows == 0) {
                $relevance_float = floatval($relevance);
                $insertSql = "INSERT INTO materi_soal (materi_id, soal_id, relevance_score, auto_linked) 
                             VALUES ({$materi['id']}, $soal_id, $relevance_float, 1)";
                $conn->query($insertSql);
                $linkedCount++;
            }
        }
    }
    
    // Store keywords for future reference
    foreach ($keywords as $keyword) {
        $keywordEscaped = $conn->real_escape_string($keyword);
        $insertSql = "INSERT INTO topic_keywords (keyword, frequency) 
                      VALUES ('$keywordEscaped', 1) 
                      ON DUPLICATE KEY UPDATE frequency = frequency + 1, last_used = NOW()";
        $conn->query($insertSql);
    }
    
    echo json_encode([
        'success' => true,
        'linked_count' => $linkedCount,
        'keywords' => $keywords
    ]);
}

function linkBatchSoal() {
    global $conn;
    
    $limit = intval($_GET['limit'] ?? 50);
    $kategori_id = intval($_GET['kategori_id'] ?? 0);
    
    $where = "";
    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = $kategori_id";
    }
    
    // Get soal to process
    $sql = "SELECT id, pertanyaan, pembahasan, kategori_id FROM soal $where LIMIT $limit";
    $result = $conn->query($sql);
    
    $totalLinked = 0;
    $processedCount = 0;
    
    while ($soal = $result->fetch_assoc()) {
        $soal_id = $soal['id'];
        
        // Extract keywords
        $text = $soal['pertanyaan'] . ' ' . ($soal['pembahasan'] ?? '');
        $keywords = extractKeywords($text);
        
        // Get relevant materi
        $kat_id = $soal['kategori_id'];
        $materiSql = "SELECT id, judul, deskripsi FROM materi WHERE kategori_id = $kat_id AND is_active = 1";
        $materiResult = $conn->query($materiSql);
        
        while ($materi = $materiResult->fetch_assoc()) {
            $relevance = calculateRelevance($keywords, $materi['judul'], $materi['deskripsi']);
            
            if ($relevance > 30) {
                $checkSql = "SELECT id FROM materi_soal WHERE materi_id = {$materi['id']} AND soal_id = $soal_id";
                $checkResult = $conn->query($checkSql);
                
                if ($checkResult->num_rows == 0) {
                    $relevance_float = floatval($relevance);
                    $insertSql = "INSERT INTO materi_soal (materi_id, soal_id, relevance_score, auto_linked) 
                                 VALUES ({$materi['id']}, $soal_id, $relevance_float, 1)";
                    $conn->query($insertSql);
                    $totalLinked++;
                }
            }
        }
        
        // Store keywords
        foreach ($keywords as $keyword) {
            $keywordEscaped = $conn->real_escape_string($keyword);
            $insertSql = "INSERT INTO topic_keywords (keyword, frequency) 
                          VALUES ('$keywordEscaped', 1) 
                          ON DUPLICATE KEY UPDATE frequency = frequency + 1, last_used = NOW()";
            $conn->query($insertSql);
        }
        
        $processedCount++;
    }
    
    echo json_encode([
        'success' => true,
        'processed_count' => $processedCount,
        'total_linked' => $totalLinked
    ]);
}

function linkAllSoal() {
    global $conn;
    
    // Get total soal count
    $countSql = "SELECT COUNT(*) as total FROM soal";
    $countResult = $conn->query($countSql);
    $total = $countResult->fetch_assoc()['total'];
    
    // Process in batches of 100
    $batchSize = 100;
    $batches = ceil($total / $batchSize);
    
    $totalLinked = 0;
    
    for ($i = 0; $i < $batches; $i++) {
        $offset = $i * $batchSize;
        
        $sql = "SELECT id, pertanyaan, pembahasan, kategori_id FROM soal LIMIT $offset, $batchSize";
        $result = $conn->query($sql);
        
        while ($soal = $result->fetch_assoc()) {
            $soal_id = $soal['id'];
            
            $text = $soal['pertanyaan'] . ' ' . ($soal['pembahasan'] ?? '');
            $keywords = extractKeywords($text);
            
            $kat_id = $soal['kategori_id'];
            $materiSql = "SELECT id, judul, deskripsi FROM materi WHERE kategori_id = $kat_id AND is_active = 1";
            $materiResult = $conn->query($materiSql);
            
            while ($materi = $materiResult->fetch_assoc()) {
                $relevance = calculateRelevance($keywords, $materi['judul'], $materi['deskripsi']);
                
                if ($relevance > 30) {
                    $checkSql = "SELECT id FROM materi_soal WHERE materi_id = {$materi['id']} AND soal_id = $soal_id";
                    $checkResult = $conn->query($checkSql);
                    
                    if ($checkResult->num_rows == 0) {
                        $insertSql = "INSERT INTO materi_soal (materi_id, soal_id, relevance_score, auto_linked) 
                                     VALUES ({$materi['id']}, $soal_id, $relevance, 1)";
                        $conn->query($insertSql);
                        $totalLinked++;
                    }
                }
            }
            
            foreach ($keywords as $keyword) {
                $keywordEscaped = $conn->real_escape_string($keyword);
                $insertSql = "INSERT INTO topic_keywords (keyword, frequency) 
                              VALUES ('$keywordEscaped', 1) 
                              ON DUPLICATE KEY UPDATE frequency = frequency + 1, last_used = NOW()";
                $conn->query($insertSql);
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'total_soal' => $total,
        'total_linked' => $totalLinked
    ]);
}

function analyzeKeywords() {
    global $conn;
    
    // Get top keywords
    $sql = "SELECT keyword, frequency, last_used FROM topic_keywords ORDER BY frequency DESC LIMIT 50";
    $result = $conn->query($sql);
    
    $keywords = [];
    while ($row = $result->fetch_assoc()) {
        $keywords[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'keywords' => $keywords
    ]);
}

function getRelevantMateri() {
    global $conn;
    
    $soal_id = intval($_GET['soal_id'] ?? 0);
    if ($soal_id == 0) {
        throw new Exception("soal_id is required");
    }
    
    // Get linked materi
    $sql = "SELECT m.*, ms.relevance_score 
            FROM materi_soal ms
            JOIN materi m ON ms.materi_id = m.id
            WHERE ms.soal_id = $soal_id
            ORDER BY ms.relevance_score DESC";
    $result = $conn->query($sql);
    
    $materiList = [];
    while ($row = $result->fetch_assoc()) {
        $materiList[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'materi' => $materiList
    ]);
}
?>
