<?php
/**
 * Master API for Auto-Complete Bahan Ajar System
 * Orchestrates all auto-complete functions for "seperti guru mengajar" experience
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

$action = $_GET['action'] ?? '';

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    switch ($action) {
        case 'process_new_soal':
            processNewSoal();
            break;
        case 'auto_complete_all':
            autoCompleteAll();
            break;
        case 'analyze_and_complete':
            analyzeAndComplete();
            break;
        case 'get_teacher_view':
            getTeacherView();
            break;
        case 'status':
            getSystemStatus();
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function processNewSoal() {
    global $conn;
    
    $soal_id = isset($_GET['soal_id']) ? intval($_GET['soal_id']) : 0;
    if ($soal_id == 0) {
        throw new Exception("soal_id is required");
    }
    
    $steps = [];
    $success = true;
    
    // Step 1: Analyze question with AI
    $steps[] = [
        'step' => 'Analyzing question',
        'status' => 'processing'
    ];
    
    // Call AI analyzer
    $ai_url = "http://localhost/bimbel/api/ai_question_analyzer.php?action=analyze&soal_id=$soal_id";
    $ai_response = file_get_contents($ai_url);
    $ai_data = json_decode($ai_response, true);
    
    if ($ai_data['success']) {
        $steps[0]['status'] = 'completed';
        $steps[0]['result'] = $ai_data['analysis'];
    } else {
        $steps[0]['status'] = 'failed';
        $success = false;
    }
    
    // Step 2: Generate bahan pelajaran
    $steps[] = [
        'step' => 'Generating learning material',
        'status' => 'processing'
    ];
    
    $materi_url = "http://localhost/bimbel/api/ai_question_analyzer.php?action=generate_materi&soal_id=$soal_id";
    $materi_response = file_get_contents($materi_url);
    $materi_data = json_decode($materi_response, true);
    
    if ($materi_data['success']) {
        $steps[1]['status'] = 'completed';
        $steps[1]['bahan_pelajaran_id'] = $materi_data['bahan_pelajaran_id'];
    } else {
        $steps[1]['status'] = 'failed';
        $success = false;
    }
    
    // Step 3: Auto-link to existing materi
    $steps[] = [
        'step' => 'Linking to learning materials',
        'status' => 'processing'
    ];
    
    $link_url = "http://localhost/bimbel/api/auto_link_materi.php?action=link_single&soal_id=$soal_id";
    $link_response = file_get_contents($link_url);
    $link_data = json_decode($link_response, true);
    
    if ($link_data['success']) {
        $steps[2]['status'] = 'completed';
        $steps[2]['linked_count'] = $link_data['linked_count'];
    } else {
        $steps[2]['status'] = 'failed';
        // Don't fail entire process if linking fails
    }
    
    // Step 4: Check if new topic needs scraping
    $steps[] = [
        'step' => 'Checking for new topics',
        'status' => 'processing'
    ];
    
    $keywords = $steps[0]['result']['key_concepts'] ?? [];
    $new_topics_found = 0;
    
    foreach ($keywords as $keyword) {
        $checkSql = "SELECT id FROM materi WHERE judul LIKE '%$keyword%'";
        $result = $conn->query($checkSql);
        
        if ($result->num_rows == 0) {
            // Check if keyword exists in topic_keywords
            $keywordCheck = "SELECT id FROM topic_keywords WHERE keyword = '$keyword'";
            $kwResult = $conn->query($keywordCheck);
            
            if ($kwResult->num_rows == 0) {
                // Add to topic_keywords for future scraping
                $insertSql = "INSERT INTO topic_keywords (keyword, frequency) VALUES ('$keyword', 1)";
                $conn->query($insertSql);
                $new_topics_found++;
            }
        }
    }
    
    $steps[3]['status'] = 'completed';
    $steps[3]['new_topics_found'] = $new_topics_found;
    
    // Update soal metadata
    $updateSql = "UPDATE soal SET generated_by_ai = 1, ai_generated_at = NOW() WHERE id = $soal_id";
    $conn->query($updateSql);
    
    echo json_encode([
        'success' => $success,
        'soal_id' => $soal_id,
        'steps' => $steps,
        'message' => $success ? 'Auto-complete completed successfully' : 'Auto-complete completed with some errors'
    ]);
}

function autoCompleteAll() {
    global $conn;
    
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $kategori_id = isset($_GET['kategori_id']) ? intval($_GET['kategori_id']) : 0;
    
    $where = "WHERE generated_by_ai = 0";
    if ($kategori_id > 0) {
        $where .= " AND kategori_id = $kategori_id";
    }
    
    // Get soal to process
    $sql = "SELECT id FROM soal $where LIMIT $limit";
    $result = $conn->query($sql);
    
    $total = $result->num_rows;
    $processed = 0;
    $failed = 0;
    
    while ($row = $result->fetch_assoc()) {
        $soal_id = $row['id'];
        
        try {
            // Process each soal
            $url = "http://localhost/bimbel/api/auto_complete_bahan_ajar.php?action=process_new_soal&soal_id=$soal_id";
            $response = file_get_contents($url);
            $data = json_decode($response, true);
            
            if ($data['success']) {
                $processed++;
            } else {
                $failed++;
            }
        } catch (Exception $e) {
            $failed++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'total' => $total,
        'processed' => $processed,
        'failed' => $failed
    ]);
}

function getTeacherView() {
    global $conn;
    
    $soal_id = isset($_GET['soal_id']) ? intval($_GET['soal_id']) : 0;
    if ($soal_id == 0) {
        throw new Exception("soal_id is required");
    }
    
    // Get soal data
    $sql = "SELECT * FROM soal WHERE id = $soal_id";
    $result = $conn->query($sql);
    $soal = $result->fetch_assoc();
    
    if (!$soal) {
        throw new Exception("Soal not found");
    }
    
    // Get bahan pelajaran
    $bahanSql = "SELECT * FROM bahan_pelajaran WHERE soal_id = $soal_id ORDER BY created_at DESC LIMIT 1";
    $bahanResult = $conn->query($bahanSql);
    $bahan = $bahanResult->fetch_assoc();
    
    // Get linked materi
    $materiSql = "SELECT m.*, ms.relevance_score 
                  FROM materi_soal ms
                  JOIN materi m ON ms.materi_id = m.id
                  WHERE ms.soal_id = $soal_id
                  ORDER BY ms.relevance_score DESC
                  LIMIT 5";
    $materiResult = $conn->query($materiSql);
    
    $linked_materi = [];
    while ($row = $materiResult->fetch_assoc()) {
        $linked_materi[] = $row;
    }
    
    // Get AI analysis
    $analysis = [
        'bloom_level' => $soal['bloom_level'],
        'cognitive_load' => $soal['cognitive_load'],
        'learning_objective' => $soal['learning_objective']
    ];
    
    echo json_encode([
        'success' => true,
        'soal' => $soal,
        'bahan_pelajaran' => $bahan,
        'linked_materi' => $linked_materi,
        'analysis' => $analysis
    ]);
}

function getSystemStatus() {
    global $conn;
    
    // Get statistics
    $stats = [];
    
    // Total soal
    $result = $conn->query("SELECT COUNT(*) as total FROM soal");
    $stats['total_soal'] = $result->fetch_assoc()['total'];
    
    // Soal with AI analysis
    $result = $conn->query("SELECT COUNT(*) as total FROM soal WHERE bloom_level IS NOT NULL");
    $stats['analyzed_soal'] = $result->fetch_assoc()['total'];
    
    // Soal with bahan pelajaran
    $result = $conn->query("SELECT COUNT(DISTINCT soal_id) as total FROM bahan_pelajaran");
    $stats['with_bahan_pelajaran'] = $result->fetch_assoc()['total'];
    
    // Total materi
    $result = $conn->query("SELECT COUNT(*) as total FROM materi");
    $stats['total_materi'] = $result->fetch_assoc()['total'];
    
    // Total materi-soal links
    $result = $conn->query("SELECT COUNT(*) as total FROM materi_soal");
    $stats['total_links'] = $result->fetch_assoc()['total'];
    
    // New topics to scrape
    $result = $conn->query("SELECT COUNT(*) as total FROM topic_keywords WHERE materi_id IS NULL AND frequency > 5");
    $stats['new_topics_to_scrape'] = $result->fetch_assoc()['total'];
    
    echo json_encode([
        'success' => true,
        'stats' => $stats
    ]);
}

function analyzeAndComplete() {
    global $conn;
    
    $soal_id = isset($_GET['soal_id']) ? intval($_GET['soal_id']) : 0;
    if ($soal_id == 0) {
        echo json_encode(['success' => false, 'error' => 'soal_id is required']);
        return;
    }
    
    // Get soal data
    $sql = "SELECT * FROM soal WHERE id = $soal_id";
    $result = $conn->query($sql);
    $soal = $result->fetch_assoc();
    
    if (!$soal) {
        echo json_encode(['success' => false, 'error' => 'Soal not found']);
        return;
    }
    
    // Check if already has bahan pelajaran
    $checkSql = "SELECT COUNT(*) as count FROM bahan_pelajaran WHERE soal_id = $soal_id";
    $checkResult = $conn->query($checkSql);
    $hasBahan = $checkResult->fetch_assoc()['count'] > 0;
    
    if ($hasBahan) {
        echo json_encode(['success' => true, 'message' => 'Already has bahan pelajaran', 'skipped' => true]);
        return;
    }
    
    // Simulate AI analysis (since we don't have real AI)
    $bloom_level = 'remember';
    $cognitive_load = 'low';
    $learning_objective = 'Memahami konsep dasar';
    
    // Generate simple bahan pelajaran
    $bahan_content = generateSimpleBahanPelajaran($soal);
    $bahan_judul = "Pembahasan Soal #{$soal_id}";
    
    // Insert bahan pelajaran
    $insertSql = "INSERT INTO bahan_pelajaran (soal_id, judul, konten, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = $conn->prepare($insertSql);
    $stmt->bind_param('iss', $soal_id, $bahan_judul, $bahan_content);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Bahan pelajaran generated', 'skipped' => false]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
}

function generateSimpleBahanPelajaran($soal) {
    $pertanyaan = $soal['pertanyaan'] ?? '';
    $kategori_id = $soal['kategori_id'] ?? 0;
    
    $kategori_names = [
        1 => 'TWK',
        2 => 'TIU',
        3 => 'TKP',
        4 => 'TPA',
        5 => 'PSIKOLOGIS'
    ];
    
    $kategori = $kategori_names[$kategori_id] ?? 'Umum';
    
    $html = "<div class='bahan-pelajaran'>";
    $html .= "<h3>Pembahasan Soal</h3>";
    $html .= "<p><strong>Kategori:</strong> {$kategori}</p>";
    $html .= "<p><strong>Pertanyaan:</strong> {$pertanyaan}</p>";
    $html .= "<h4>Penjelasan:</h4>";
    $html .= "<p>Untuk menjawab soal ini, perhatikan kunci jawaban dan opsi yang tersedia. Soal ini menguji pemahaman Anda tentang materi {$kategori}.</p>";
    $html .= "<h4>Tips:</h4>";
    $html .= "<ul>";
    $html .= "<li>Baca soal dengan teliti</li>";
    $html .= "<li>Analisis setiap opsi jawaban</li>";
    $html .= "<li>Hindari jawaban tergesa-gesa</li>";
    $html .= "</ul>";
    $html .= "</div>";
    
    return $html;
}
?>
