<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../scripts/logger.php';
require_once __DIR__ . '/middleware.php';

session_start();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

requireAuth();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'generate_bahan':
    case 'generate_bahan_pelajaran':
        generateBahanPelajaranBatch();
        break;
    case 'generate_tips':
        generateTipsBatch();
        break;
    case 'generate_questions':
        generateQuestions();
        break;
    case 'generate_edu_content':
        generateEducationalContent();
        break;
    case 'backup':
        createBackup();
        break;
    case 'cleanup':
        cleanupFiles();
        break;
    case 'analyze_storage':
        analyzeStorage();
        break;
    case 'system_status':
        checkSystemStatus();
        break;
    case 'analyze_soal_topics':
        analyzeSoalTopics();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function analyzeSoalTopics() {
    global $conn;
    
    requireAdmin();
    
    $kategori_id = intval($_GET['kategori_id'] ?? 0);
    
    $where = "";
    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = $kategori_id";
    }
    
    // Group soal by common patterns in pertanyaan
    $sql = "SELECT kategori_id, 
            SUBSTRING(pertanyaan, 1, 100) as preview,
            LENGTH(pertanyaan) as length,
            tingkat
            FROM soal
            $where
            ORDER BY kategori_id, tingkat
            LIMIT 1000";
    $result = $conn->query($sql);
    
    $analysis = [];
    $topic_patterns = [];
    
    while ($row = $result->fetch_assoc()) {
        // Simple pattern matching for common topics
        $preview = $row['preview'];
        
        // Extract common keywords
        $keywords = extractKeywords($preview);
        
        $analysis[] = [
            'kategori_id' => $row['kategori_id'],
            'preview' => $preview,
            'length' => $row['length'],
            'tingkat' => $row['tingkat'],
            'keywords' => $keywords
        ];
        
        // Group by keywords
        foreach ($keywords as $keyword) {
            if (!isset($topic_patterns[$keyword])) {
                $topic_patterns[$keyword] = 0;
            }
            $topic_patterns[$keyword]++;
        }
    }
    
    // Sort topics by frequency
    arsort($topic_patterns);
    $top_topics = array_slice($topic_patterns, 0, 20, true);
    
    echo json_encode([
        'success' => true,
        'analysis' => $analysis,
        'top_topics' => $top_topics
    ]);
}

function extractKeywords($text) {
    // Simple keyword extraction
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s]/', '', $text);
    $words = explode(' ', $text);
    
    // Filter common words
    $stop_words = ['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 'tersebut', 'sebagai', 'oleh'];
    
    $keywords = [];
    foreach ($words as $word) {
        if (strlen($word) > 3 && !in_array($word, $stop_words)) {
            $keywords[] = $word;
        }
    }
    
    return array_unique($keywords);
}

function generateBahanPelajaranBatch() {
    global $conn;
    
    requireAdmin();
    
    $kategori_id = intval($_GET['kategori_id'] ?? 0);
    $limit = intval($_GET['limit'] ?? 50);
    
    $where = "";
    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = $kategori_id";
    }
    
    // Get soal to analyze
    $sql = "SELECT s.*, k.nama_kategori 
            FROM soal s
            LEFT JOIN kategori_soal k ON s.kategori_id = k.id
            $where
            ORDER BY RAND()
            LIMIT $limit";
    $result = $conn->query($sql);
    
    $generated_count = 0;
    $soal_processed = [];
    
    while ($row = $result->fetch_assoc()) {
        $soal_id = $row['id'];
        $kategori = $row['nama_kategori'];
        $pertanyaan = $row['pertanyaan'];
        
        // Generate learning material based on question
        $judul = "Pembahasan Soal {$kategori} - Soal #{$soal_id}";
        $konten = generateKontenBahan($pertanyaan, $row['pembahasan'], $row['jawaban_benar']);
        
        // Insert into bahan_pelajaran
        $konten_escaped = $conn->real_escape_string($konten);
        $judul_escaped = $conn->real_escape_string($judul);
        
        $sql_insert = "INSERT INTO bahan_pelajaran (soal_id, judul, konten, tipe, urutan)
                       VALUES ($soal_id, '$judul_escaped', '$konten_escaped', 'teks', 0)";
        
        if ($conn->query($sql_insert)) {
            $generated_count++;
            $soal_processed[] = $soal_id;
        }
    }
    
    echo json_encode([
        'success' => true,
        'generated' => $generated_count,
        'soal_processed' => $soal_processed
    ]);
}

function generateKontenBahan($pertanyaan, $pembahasan, $jawaban_benar) {
    $konten = "<h3>Pertanyaan</h3>\n";
    $konten .= "<p>{$pertanyaan}</p>\n\n";
    
    if (!empty($jawaban_benar)) {
        $konten .= "<h3>Jawaban Benar</h3>\n";
        $konten .= "<p><strong>{$jawaban_benar}</strong></p>\n\n";
    }
    
    if (!empty($pembahasan)) {
        $konten .= "<h3>Pembahasan</h3>\n";
        $konten .= "<p>{$pembahasan}</p>\n\n";
    }
    
    $konten .= "<h3>Tips Menjawab</h3>\n";
    $konten .= "<p>Bacalah pertanyaan dengan teliti sebelum menjawab. Perhatikan kata kunci dalam pertanyaan untuk memahami apa yang ditanyakan.</p>\n";
    
    return $konten;
}

function generateTipsBatch() {
    global $conn;
    
    requireAdmin();
    
    $kategori_id = intval($_GET['kategori_id'] ?? 0);
    $limit = intval($_GET['limit'] ?? 100);
    
    $where = "";
    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = $kategori_id";
    }
    
    // Generate tips_soal for individual questions
    $sql = "SELECT s.*, k.nama_kategori 
            FROM soal s
            LEFT JOIN kategori_soal k ON s.kategori_id = k.id
            $where
            ORDER BY RAND()
            LIMIT $limit";
    $result = $conn->query($sql);
    
    $tips_generated = 0;
    $tricks_generated = 0;
    
    while ($row = $result->fetch_assoc()) {
        $soal_id = $row['id'];
        $kategori = $row['nama_kategori'];
        $tingkat = $row['tingkat'];
        
        // Generate tips_soal
        $judul_tips = "Tips Soal {$kategori} ({$tingkat}) - #{$soal_id}";
        $konten_tips = generateTipsContent($row['pertanyaan'], $tingkat);
        
        $judul_escaped = $conn->real_escape_string($judul_tips);
        $konten_escaped = $conn->real_escape_string($konten_tips);
        
        $sql_insert_tips = "INSERT INTO tips_soal (tips_id, soal_id)
                             VALUES (NULL, $soal_id)";
        
        if ($conn->query($sql_insert_tips)) {
            $tips_id = $conn->insert_id;
            
            // Add to tips_tricks
            $sql_insert_tricks = "INSERT INTO tips_tricks (kategori_id, tipe_tips, judul, konten, prioritas)
                                   VALUES ({$row['kategori_id']}, 'spesifik', '$judul_escaped', '$konten_escaped', 1)";
            
            if ($conn->query($sql_insert_tricks)) {
                $tips_generated++;
            }
        }
    }
    
    // Generate general tips for each kategori
    $kategori_sql = "SELECT DISTINCT kategori_id FROM soal $where";
    $kategori_result = $conn->query($kategori_sql);
    
    while ($kat_row = $kategori_result->fetch_assoc()) {
        $kat_id = $kat_row['kategori_id'];
        
        $general_tips = generateGeneralTips($kat_id);
        
        foreach ($general_tips as $tip) {
            $judul_escaped = $conn->real_escape_string($tip['judul']);
            $konten_escaped = $conn->real_escape_string($tip['konten']);
            
            $sql_insert = "INSERT INTO tips_tricks (kategori_id, tipe_tips, judul, konten, prioritas)
                           VALUES ($kat_id, 'umum', '$judul_escaped', '$konten_escaped', 2)";
            
            if ($conn->query($sql_insert)) {
                $tricks_generated++;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'tips_generated' => $tips_generated,
        'tricks_generated' => $tricks_generated
    ]);
}

function generateTipsContent($pertanyaan, $tingkat) {
    $tips = "Tips untuk menjawab soal tingkat {$tingkat}:\n\n";
    
    // Generate context-aware tips
    if (stripos($pertanyaan, 'bukan') !== false) {
        $tips .= "- Perhatikan kata negatif seperti 'bukan', 'tidak', 'kecuali'\n";
    }
    
    if (stripos($pertanyaan, 'yang') !== false) {
        $tips .= "- Identifikasi subjek yang ditanyakan dengan kata 'yang'\n";
    }
    
    if (stripos($pertanyaan, 'berikut') !== false) {
        $tips .= "- Pilih jawaban yang paling tepat dari pilihan yang tersedia\n";
    }
    
    $tips .= "\nStrategi umum:\n";
    $tips .= "- Baca semua opsi jawaban sebelum memilih\n";
    $tips .= "- Eliminasi jawaban yang jelas salah\n";
    $tips .= "- Pilih jawaban yang paling logis\n";
    
    return $tips;
}

function generateGeneralTips($kategori_id) {
    global $conn;
    
    $tips = [];
    
    // Get kategori name
    $sql = "SELECT nama_kategori FROM kategori_soal WHERE id = $kategori_id";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $kategori = $row['nama_kategori'];
    
    // Generate general tips based on kategori
    switch ($kategori) {
        case 'TWK':
            $tips[] = [
                'judul' => "Tips TWK - Wawasan Kebangsaan",
                'konten' => "Pelajari sejarah Indonesia, pancasila, UUD 1945, dan budaya nasional. Banyak membaca berita dan artikel tentang kebangsaan."
            ];
            $tips[] = [
                'judul' => "Strategi TWK",
                'konten' => "Fokus pada pemahaman konsep dasar negara dan bangsa. Jangan hafal tanggal dan angka secara kaku, pahami konteksnya."
            ];
            break;
            
        case 'TIU':
            $tips[] = [
                'judul' => "Tips TIU - Tes Intelejensi Umum",
                'konten' => "Latih soal logika, aritmatika, dan deret angka secara rutin. Pahami pola-pola yang sering muncul."
            ];
            $tips[] = [
                'judul' => "Shortcut TIU",
                'konten' => "Untuk soal deret, cari pola selisih antar angka. Untuk soal silogisme, buat diagram jika diperlukan."
            ];
            break;
            
        case 'TKP':
            $tips[] = [
                'judul' => "Tips TKP - Tes Karakteristik Pribadi",
                'konten' => "Jawab dengan jujur sesuai kepribadian asli. TKP tidak ada jawaban salah atau benar, pilih yang paling menggambarkan diri."
            ];
            $tips[] = [
                'judul' => "Strategi TKP",
                'konten' => "Baca setiap pertanyaan dengan seksama. Jangan terburu-buru. Pilih jawaban yang paling sesuai dengan karakter Anda."
            ];
            break;
            
        case 'TPA':
            $tips[] = [
                'judul' => "Tips TPA - Tes Potensi Akademik",
                'konten' => "Latih verbal, numerik, dan logika. TPA mengukur potensi akademik, bukan pengetahuan yang sudah dipelajari."
            ];
            break;
            
        case 'PSIKOLOGIS':
            $tips[] = [
                'judul' => "Tips Psikologis",
                'konten' => "Jawab dengan tenang dan jujur. Tes psikologis mengukur kecocokan kepribadian dengan pekerjaan."
            ];
            break;
    }
    
    return $tips;
}

function generateQuestions() {
    global $conn;
    
    requireAdmin();
    
    echo json_encode([
        'success' => false,
        'error' => 'This feature has been deprecated. Please use the manual question creation or batch import from external sources.'
    ]);
}

function generateEducationalContent() {
    global $conn;
    
    requireAdmin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $soal_id = $input['soal_id'] ?? null;
    
    // Include the educational content generator
    require_once __DIR__ . '/../scripts/educational_content_generator.php';
    
    $generator = new EducationalContentGenerator($conn);
    
    if ($soal_id) {
        // Generate for specific soal
        $sql = "SELECT * FROM soal WHERE id = $soal_id";
        $result = $conn->query($sql);
        $row = $result->fetch_assoc();
        
        $content = $generator->generateEducationalContent(
            $soal_id,
            $row['kategori_id'],
            $row['tingkat'],
            $row['pertanyaan'],
            $row['pembahasan'],
            $row['jawaban_benar']
        );
        
        echo json_encode([
            'success' => true,
            'generated' => 1,
            'content' => $content
        ]);
    } else {
        // Generate batch (limit to 10 for demo)
        $sql = "SELECT id, kategori_id, tingkat, pertanyaan, pembahasan, jawaban_benar FROM soal LIMIT 10";
        $result = $conn->query($sql);
        
        $generated = 0;
        while ($row = $result->fetch_assoc()) {
            $content = $generator->generateEducationalContent(
                $row['id'],
                $row['kategori_id'],
                $row['tingkat'],
                $row['pertanyaan'],
                $row['pembahasan'],
                $row['jawaban_benar']
            );
            $generated++;
        }
        
        echo json_encode([
            'success' => true,
            'generated' => $generated
        ]);
    }
}

function createBackup() {
    global $conn;
    
    requireAdmin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $backup_name = $input['backup_name'] ?? 'backup_' . date('Y-m-d');
    
    // Include backup script
    require_once __DIR__ . '/../scripts/backup.php';
    
    // Simple backup implementation
    $backup_file = __DIR__ . '/../database/' . $backup_name . '.sql';
    
    // Get all tables
    $tables = [];
    $result = $conn->query("SHOW TABLES");
    while ($row = $result->fetch_array()) {
        $tables[] = $row[0];
    }
    
    $backup_content = "-- Database Backup: $backup_name\n";
    $backup_content .= "-- Date: " . date('Y-m-d H:i:s') . "\n\n";
    
    foreach ($tables as $table) {
        $backup_content .= "-- Table: $table\n";
        $result = $conn->query("SELECT * FROM $table");
        $num_fields = $result->field_count;
        
        while ($row = $result->fetch_row()) {
            $backup_content .= "INSERT INTO $table VALUES(";
            for ($i = 0; $i < $num_fields; $i++) {
                $row[$i] = addslashes($row[$i]);
                $row[$i] = preg_replace("/\n/", "\\n", $row[$i]);
                if (isset($row[$i])) {
                    $backup_content .= '"' . $row[$i] . '"';
                } else {
                    $backup_content .= '""';
                }
                if ($i < ($num_fields - 1)) {
                    $backup_content .= ',';
                }
            }
            $backup_content .= ");\n";
        }
        $backup_content .= "\n\n";
    }
    
    file_put_contents($backup_file, $backup_content);
    
    echo json_encode([
        'success' => true,
        'backup_file' => $backup_name . '.sql'
    ]);
}

function cleanupFiles() {
    global $conn;
    
    requireAdmin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $cleanup_uploads = $input['uploads'] ?? false;
    $cleanup_cache = $input['cache'] ?? false;
    $cleanup_logs = $input['logs'] ?? false;
    
    $files_deleted = 0;
    
    if ($cleanup_cache) {
        $cache_dir = __DIR__ . '/../cache';
        if (is_dir($cache_dir)) {
            $files = glob($cache_dir . '/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                    $files_deleted++;
                }
            }
        }
    }
    
    if ($cleanup_logs) {
        $logs_dir = __DIR__ . '/../logs';
        if (is_dir($logs_dir)) {
            $files = glob($logs_dir . '/*.log');
            foreach ($files as $file) {
                if (is_file($file)) {
                    // Only delete logs older than 7 days
                    if (filemtime($file) < strtotime('-7 days')) {
                        unlink($file);
                        $files_deleted++;
                    }
                }
            }
        }
    }
    
    if ($cleanup_uploads) {
        // Only cleanup unused uploads (not referenced in database)
        $uploads_dir = __DIR__ . '/../uploads';
        if (is_dir($uploads_dir)) {
            // This is a simplified version - in production, check database references
            $files = glob($uploads_dir . '/*');
            foreach ($files as $file) {
                if (is_file($file) && filemtime($file) < strtotime('-30 days')) {
                    unlink($file);
                    $files_deleted++;
                }
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'files_deleted' => $files_deleted
    ]);
}

function analyzeStorage() {
    global $conn;
    
    requireAdmin();
    
    $total_size = 0;
    $uploads_size = 0;
    $cache_size = 0;
    $logs_size = 0;
    
    // Calculate uploads size
    $uploads_dir = __DIR__ . '/../uploads';
    if (is_dir($uploads_dir)) {
        $files = glob($uploads_dir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                $uploads_size += filesize($file);
            }
        }
    }
    
    // Calculate cache size
    $cache_dir = __DIR__ . '/../cache';
    if (is_dir($cache_dir)) {
        $files = glob($cache_dir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                $cache_size += filesize($file);
            }
        }
    }
    
    // Calculate logs size
    $logs_dir = __DIR__ . '/../logs';
    if (is_dir($logs_dir)) {
        $files = glob($logs_dir . '/*.log');
        foreach ($files as $file) {
            if (is_file($file)) {
                $logs_size += filesize($file);
            }
        }
    }
    
    $total_size = $uploads_size + $cache_size + $logs_size;
    
    function formatBytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
    
    echo json_encode([
        'success' => true,
        'total_size' => formatBytes($total_size),
        'uploads_size' => formatBytes($uploads_size),
        'cache_size' => formatBytes($cache_size),
        'logs_size' => formatBytes($logs_size)
    ]);
}

function checkSystemStatus() {
    global $conn;
    
    requireAdmin();
    
    $db_status = 'OK';
    $cache_status = 'OK';
    $uploads_status = 'OK';
    
    // Check database connection
    if (!$conn->ping()) {
        $db_status = 'Error';
    }
    
    // Check cache directory
    $cache_dir = __DIR__ . '/../cache';
    if (!is_dir($cache_dir) || !is_writable($cache_dir)) {
        $cache_status = 'Error';
    }
    
    // Check uploads directory
    $uploads_dir = __DIR__ . '/../uploads';
    if (!is_dir($uploads_dir) || !is_writable($uploads_dir)) {
        $uploads_status = 'Error';
    }
    
    // Calculate uptime (simplified)
    $uptime = 'N/A';
    if (function_exists('sys_getloadavg')) {
        $load = sys_getloadavg();
        $uptime = 'Load: ' . round($load[0], 2);
    }
    
    echo json_encode([
        'success' => true,
        'db_status' => $db_status,
        'cache_status' => $cache_status,
        'uploads_status' => $uploads_status,
        'uptime' => $uptime
    ]);
}

$conn->close();
?>
