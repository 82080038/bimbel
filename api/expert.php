<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');

require_once '../config.php';

// Check database connection
checkDatabaseConnection();

require_once 'middleware.php';
require_once 'csrf.php';
require_once 'rate_limiter.php';

// Start session if not already active
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Apply rate limiting
checkRateLimit(1000, 60);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

// Protected endpoints (auth required)
$protected_actions = [
    'get_expert_help',
    'get_expert_tips',
    'get_expert_tricks',
    'get_expert_logic',
    'log_assistance',
    'rate_assistance',
    'get_learning_recommendations',
    'add_expert_knowledge',
    'update_expert_knowledge'
];

// Public endpoints
$public_actions = [
    'get_expert_knowledge',
    'get_tips_by_category',
    'get_tricks_by_type'
];

if (in_array($action, $protected_actions)) {
    verifyAuth();
}

switch ($action) {
    // Public endpoints
    case 'get_expert_knowledge':
        getExpertKnowledge();
        break;
    
    case 'get_tips_by_category':
        getTipsByCategory();
        break;
    
    case 'get_tricks_by_type':
        getTricksByType();
        break;
    
    // Protected endpoints
    case 'get_expert_help':
        getExpertHelp();
        break;
    
    case 'get_expert_tips':
        getExpertTips();
        break;
    
    case 'get_expert_tricks':
        getExpertTricks();
        break;
    
    case 'get_expert_logic':
        getExpertLogic();
        break;
    
    case 'log_assistance':
        logAssistance();
        break;
    
    case 'rate_assistance':
        rateAssistance();
        break;
    
    case 'get_learning_recommendations':
        getLearningRecommendations();
        break;
    
    case 'add_expert_knowledge':
        addExpertKnowledge();
        break;
    
    case 'update_expert_knowledge':
        updateExpertKnowledge();
        break;
    
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// Get expert knowledge based on question analysis
function getExpertKnowledge() {
    global $conn;
    
    $kategori_id = $_GET['kategori_id'] ?? null;
    $keywords = $_GET['keywords'] ?? '';
    
    $sql = "SELECT ek.*, kc.nama_kategori as kategori_nama 
            FROM expert_knowledge ek
            JOIN expert_knowledge_category kc ON ek.kategori_id = kc.id
            WHERE ek.is_active = 1";
    
    $params = [];
    $types = "";
    
    if ($kategori_id) {
        $sql .= " AND ek.sub_kategori = ?";
        $params[] = $kategori_id;
        $types .= "s";
    }
    
    if ($keywords) {
        $sql .= " AND (ek.kunci_kata LIKE ? OR ek.judul LIKE ? OR ek.konten LIKE ?)";
        $keyword_pattern = "%$keywords%";
        $params[] = $keyword_pattern;
        $params[] = $keyword_pattern;
        $params[] = $keyword_pattern;
        $types .= "sss";
    }
    
    $sql .= " ORDER BY ek.prioritas DESC, ek.id DESC";
    
    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $knowledge = [];
    while ($row = $result->fetch_assoc()) {
        $knowledge[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $knowledge]);
}

// Get expert help for a specific question
function getExpertHelp() {
    global $conn;
    
    $soal_id = $_GET['soal_id'] ?? null;
    $kategori_id = $_GET['kategori_id'] ?? null;
    
    if (!$soal_id && !$kategori_id) {
        echo json_encode(['success' => false, 'message' => 'soal_id or kategori_id required']);
        return;
    }
    
    // Get question details
    $pertanyaan = '';
    if ($soal_id) {
        $sql_q = "SELECT pertanyaan, kategori_id FROM soal WHERE id = ?";
        $stmt_q = $conn->prepare($sql_q);
        $stmt_q->bind_param("i", $soal_id);
        $stmt_q->execute();
        $result_q = $stmt_q->get_result();
        if ($row_q = $result_q->fetch_assoc()) {
            $pertanyaan = $row_q['pertanyaan'];
            $kategori_id = $row_q['kategori_id'];
        }
    }
    
    // Get expert knowledge based on category and keywords
    $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
    $sub_kategori = $kategori_map[$kategori_id] ?? '';
    
    // First try pattern matching
    $pattern_matched = false;
    if ($pertanyaan && $kategori_id) {
        $sql_pattern = "SELECT qp.*, ek.judul as expert_judul, ek.konten as expert_konten, ek.sub_kategori
                        FROM question_pattern qp
                        JOIN expert_knowledge ek ON qp.expert_knowledge_id = ek.id
                        WHERE qp.kategori_soal_id = ?";
        
        $stmt_pattern = $conn->prepare($sql_pattern);
        $stmt_pattern->bind_param("i", $kategori_id);
        $stmt_pattern->execute();
        $result_pattern = $stmt_pattern->get_result();
        
        $matched_knowledge = [];
        $pertanyaan_lower = strtolower($pertanyaan);
        
        while ($pattern_row = $result_pattern->fetch_assoc()) {
            $pola_kata = strtolower($pattern_row['pola_kata']);
            $keywords = explode(' ', $pola_kata);
            
            $match_count = 0;
            foreach ($keywords as $keyword) {
                if (strpos($pertanyaan_lower, $keyword) !== false) {
                    $match_count++;
                }
            }
            
            // If at least 1 keyword matches, include it
            if ($match_count >= 1) {
                $matched_knowledge[] = $pattern_row;
                $pattern_matched = true;
            }
        }
        
        if ($pattern_matched && !empty($matched_knowledge)) {
            // Log the assistance
            $user_id = $_SESSION['user_id'] ?? null;
            if ($user_id && $soal_id) {
                $expert_knowledge_id = $matched_knowledge[0]['expert_knowledge_id'];
                $sql_log = "INSERT INTO expert_assistance_log (user_id, soal_id, expert_knowledge_id, jenis_bantuan) 
                            VALUES (?, ?, ?, 'pola')";
                $stmt_log = $conn->prepare($sql_log);
                $stmt_log->bind_param("iii", $user_id, $soal_id, $expert_knowledge_id);
                $stmt_log->execute();
            }
            
            echo json_encode(['success' => true, 'data' => $matched_knowledge, 'pertanyaan' => $pertanyaan, 'matched_by' => 'pattern']);
            return;
        }
    }
    
    // If no pattern match, fallback to category-based matching
    $sql = "SELECT ek.*, kc.nama_kategori as kategori_nama 
            FROM expert_knowledge ek
            JOIN expert_knowledge_category kc ON ek.kategori_id = kc.id
            WHERE ek.is_active = 1 AND ek.sub_kategori = ?
            ORDER BY ek.prioritas DESC, ek.id DESC
            LIMIT 5";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $sub_kategori);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $knowledge = [];
    while ($row = $result->fetch_assoc()) {
        $knowledge[] = $row;
    }
    
    // Log the assistance
    $user_id = $_SESSION['user_id'] ?? null;
    if ($user_id && $soal_id && !empty($knowledge)) {
        $expert_knowledge_id = $knowledge[0]['id'];
        $sql_log = "INSERT INTO expert_assistance_log (user_id, soal_id, expert_knowledge_id, jenis_bantuan) 
                    VALUES (?, ?, ?, 'kategori')";
        $stmt_log = $conn->prepare($sql_log);
        $stmt_log->bind_param("iii", $user_id, $soal_id, $expert_knowledge_id);
        $stmt_log->execute();
    }
    
    echo json_encode(['success' => true, 'data' => $knowledge, 'pertanyaan' => $pertanyaan, 'matched_by' => 'category']);
}

// Get expert tips by category
function getTipsByCategory() {
    global $conn;
    
    $kategori_id = $_GET['kategori_id'] ?? null;
    
    $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
    $sub_kategori = $kategori_map[$kategori_id] ?? '';
    
    $sql = "SELECT ek.*, kc.nama_kategori as kategori_nama 
            FROM expert_knowledge ek
            JOIN expert_knowledge_category kc ON ek.kategori_id = kc.id
            WHERE ek.is_active = 1 AND ek.jenis_pengetahuan = 'tips'";
    
    if ($sub_kategori) {
        $sql .= " AND ek.sub_kategori = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $sub_kategori);
    } else {
        $stmt = $conn->prepare($sql);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tips = [];
    while ($row = $result->fetch_assoc()) {
        $tips[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $tips]);
}

// Get expert tricks by type
function getTricksByType() {
    global $conn;
    
    $kategori_id = $_GET['kategori_id'] ?? null;
    
    $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
    $sub_kategori = $kategori_map[$kategori_id] ?? '';
    
    $sql = "SELECT ek.*, kc.nama_kategori as kategori_nama 
            FROM expert_knowledge ek
            JOIN expert_knowledge_category kc ON ek.kategori_id = kc.id
            WHERE ek.is_active = 1 AND ek.jenis_pengetahuan = 'trik'";
    
    if ($sub_kategori) {
        $sql .= " AND ek.sub_kategori = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $sub_kategori);
    } else {
        $stmt = $conn->prepare($sql);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tricks = [];
    while ($row = $result->fetch_assoc()) {
        $tricks[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $tricks]);
}

// Get expert tips for specific question
function getExpertTips() {
    global $conn;
    
    $soal_id = $_GET['soal_id'] ?? null;
    $kategori_id = $_GET['kategori_id'] ?? null;
    
    if (!$soal_id && !$kategori_id) {
        echo json_encode(['success' => false, 'message' => 'soal_id or kategori_id required']);
        return;
    }
    
    // Get category if soal_id provided
    if ($soal_id) {
        $sql_q = "SELECT kategori_id FROM soal WHERE id = ?";
        $stmt_q = $conn->prepare($sql_q);
        $stmt_q->bind_param("i", $soal_id);
        $stmt_q->execute();
        $result_q = $stmt_q->get_result();
        if ($row_q = $result_q->fetch_assoc()) {
            $kategori_id = $row_q['kategori_id'];
        }
    }
    
    $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
    $sub_kategori = $kategori_map[$kategori_id] ?? '';
    
    $sql = "SELECT ek.*, kc.nama_kategori as kategori_nama 
            FROM expert_knowledge ek
            JOIN expert_knowledge_category kc ON ek.kategori_id = kc.id
            WHERE ek.is_active = 1 AND ek.jenis_pengetahuan IN ('tips', 'trik') AND ek.sub_kategori = ?
            ORDER BY ek.prioritas DESC
            LIMIT 5";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $sub_kategori);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tips = [];
    while ($row = $result->fetch_assoc()) {
        $tips[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $tips]);
}

// Get expert tricks
function getExpertTricks() {
    global $conn;
    
    $soal_id = $_GET['soal_id'] ?? null;
    $kategori_id = $_GET['kategori_id'] ?? null;
    
    if (!$soal_id && !$kategori_id) {
        echo json_encode(['success' => false, 'message' => 'soal_id or kategori_id required']);
        return;
    }
    
    if ($soal_id) {
        $sql_q = "SELECT kategori_id FROM soal WHERE id = ?";
        $stmt_q = $conn->prepare($sql_q);
        $stmt_q->bind_param("i", $soal_id);
        $stmt_q->execute();
        $result_q = $stmt_q->get_result();
        if ($row_q = $result_q->fetch_assoc()) {
            $kategori_id = $row_q['kategori_id'];
        }
    }
    
    $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
    $sub_kategori = $kategori_map[$kategori_id] ?? '';
    
    $sql = "SELECT ek.*, kc.nama_kategori as kategori_nama 
            FROM expert_knowledge ek
            JOIN expert_knowledge_category kc ON ek.kategori_id = kc.id
            WHERE ek.is_active = 1 AND ek.jenis_pengetahuan = 'trik' AND ek.sub_kategori = ?
            ORDER BY ek.prioritas DESC
            LIMIT 5";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $sub_kategori);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tricks = [];
    while ($row = $result->fetch_assoc()) {
        $tricks[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $tricks]);
}

// Get expert logic explanation
function getExpertLogic() {
    global $conn;
    
    $soal_id = $_GET['soal_id'] ?? null;
    $kategori_id = $_GET['kategori_id'] ?? null;
    
    if (!$soal_id && !$kategori_id) {
        echo json_encode(['success' => false, 'message' => 'soal_id or kategori_id required']);
        return;
    }
    
    if ($soal_id) {
        $sql_q = "SELECT kategori_id FROM soal WHERE id = ?";
        $stmt_q = $conn->prepare($sql_q);
        $stmt_q->bind_param("i", $soal_id);
        $stmt_q->execute();
        $result_q = $stmt_q->get_result();
        if ($row_q = $result_q->fetch_assoc()) {
            $kategori_id = $row_q['kategori_id'];
        }
    }
    
    $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
    $sub_kategori = $kategori_map[$kategori_id] ?? '';
    
    $sql = "SELECT ek.*, kc.nama_kategori as kategori_nama 
            FROM expert_knowledge ek
            JOIN expert_knowledge_category kc ON ek.kategori_id = kc.id
            WHERE ek.is_active = 1 AND ek.jenis_pengetahuan = 'logika' AND ek.sub_kategori = ?
            ORDER BY ek.prioritas DESC
            LIMIT 5";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $sub_kategori);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $logic = [];
    while ($row = $result->fetch_assoc()) {
        $logic[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $logic]);
}

// Log assistance usage
function logAssistance() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $_SESSION['user_id'] ?? null;
    $soal_id = $data['soal_id'] ?? null;
    $expert_knowledge_id = $data['expert_knowledge_id'] ?? null;
    $jenis_bantuan = $data['jenis_bantuan'] ?? 'trik';
    
    if (!$user_id || !$soal_id || !$expert_knowledge_id) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    $sql = "INSERT INTO expert_assistance_log (user_id, soal_id, expert_knowledge_id, jenis_bantuan) 
            VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiis", $user_id, $soal_id, $expert_knowledge_id, $jenis_bantuan);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Assistance logged']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to log assistance']);
    }
}

// Rate assistance
function rateAssistance() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $_SESSION['user_id'] ?? null;
    $log_id = $data['log_id'] ?? null;
    $rating = $data['rating'] ?? null;
    $feedback = $data['feedback'] ?? null;
    
    if (!$user_id || !$log_id || !$rating) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    if ($rating < 1 || $rating > 5) {
        echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
        return;
    }
    
    $sql = "UPDATE expert_assistance_log 
            SET rating = ?, feedback = ? 
            WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isii", $rating, $feedback, $log_id, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Rating submitted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to submit rating']);
    }
}

// Get learning recommendations based on expert system
function getLearningRecommendations() {
    global $conn;
    
    $user_id = $_SESSION['user_id'] ?? null;
    
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User not authenticated']);
        return;
    }
    
    $sql = "SELECT elr.*, ek.judul, ek.konten, ek.sub_kategori 
            FROM expert_learning_recommendation elr
            JOIN expert_knowledge ek ON elr.expert_knowledge_id = ek.id
            WHERE elr.user_id = ? AND elr.status = 'pending'
            ORDER BY elr.prioritas DESC, elr.created_at DESC
            LIMIT 10";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $recommendations = [];
    while ($row = $result->fetch_assoc()) {
        $recommendations[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $recommendations]);
}

// Add expert knowledge (admin only)
function addExpertKnowledge() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $_SESSION['user_id'] ?? null;
    $user_role = $_SESSION['user_role'] ?? '';
    
    if ($user_role !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        return;
    }
    
    $kategori_id = $data['kategori_id'] ?? null;
    $sub_kategori = $data['sub_kategori'] ?? '';
    $jenis_pengetahuan = $data['jenis_pengetahuan'] ?? '';
    $judul = $data['judul'] ?? '';
    $konten = $data['konten'] ?? '';
    $kunci_kata = $data['kunci_kata'] ?? '';
    $tingkat_kesulitan = $data['tingkat_kesulitan'] ?? 'sedang';
    $prioritas = $data['prioritas'] ?? 0;
    
    if (!$kategori_id || !$jenis_pengetahuan || !$judul || !$konten) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    $sql = "INSERT INTO expert_knowledge (kategori_id, sub_kategori, jenis_pengetahuan, judul, konten, kunci_kata, tingkat_kesulitan, prioritas, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssssii", $kategori_id, $sub_kategori, $jenis_pengetahuan, $judul, $konten, $kunci_kata, $tingkat_kesulitan, $prioritas, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Expert knowledge added', 'id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add expert knowledge']);
    }
}

// Update expert knowledge (admin only)
function updateExpertKnowledge() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $_SESSION['user_id'] ?? null;
    $user_role = $_SESSION['user_role'] ?? '';
    
    if ($user_role !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        return;
    }
    
    $id = $data['id'] ?? null;
    $judul = $data['judul'] ?? null;
    $konten = $data['konten'] ?? null;
    $kunci_kata = $data['kunci_kata'] ?? null;
    $prioritas = $data['prioritas'] ?? null;
    $is_active = $data['is_active'] ?? null;
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID required']);
        return;
    }
    
    $updates = [];
    $params = [];
    $types = "";
    
    if ($judul !== null) {
        $updates[] = "judul = ?";
        $params[] = $judul;
        $types .= "s";
    }
    
    if ($konten !== null) {
        $updates[] = "konten = ?";
        $params[] = $konten;
        $types .= "s";
    }
    
    if ($kunci_kata !== null) {
        $updates[] = "kunci_kata = ?";
        $params[] = $kunci_kata;
        $types .= "s";
    }
    
    if ($prioritas !== null) {
        $updates[] = "prioritas = ?";
        $params[] = $prioritas;
        $types .= "i";
    }
    
    if ($is_active !== null) {
        $updates[] = "is_active = ?";
        $params[] = $is_active;
        $types .= "i";
    }
    
    if (empty($updates)) {
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $params[] = $id;
    $types .= "i";
    
    $sql = "UPDATE expert_knowledge SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Expert knowledge updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update expert knowledge']);
    }
}
?>
