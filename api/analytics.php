<?php
// Advanced Analytics API
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once '../config.php';
require_once '../scripts/logger.php';
require_once '../api/middleware.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_question_analytics':
        getQuestionAnalytics();
        break;
    case 'get_user_analytics':
        getUserAnalytics();
        break;
    case 'get_exam_analytics':
        getExamAnalytics();
        break;
    case 'get_answer_heatmap':
        getAnswerHeatmap();
        break;
    case 'get_funnel_analytics':
        getFunnelAnalytics();
        break;
    case 'track_funnel_event':
        trackFunnelEvent();
        break;
    case 'export_analytics':
        requireAdmin();
        exportAnalytics();
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}

function getQuestionAnalytics() {
    global $conn;
    
    $user = requireAuth();
    
    $limit = intval($_GET['limit'] ?? 20);
    $offset = intval($_GET['offset'] ?? 0);
    
    $sql = "SELECT qa.*, s.pertanyaan, s.kategori_id 
            FROM question_analytics qa
            JOIN soal s ON qa.question_id = s.id
            ORDER BY qa.difficulty_score DESC
            LIMIT ? OFFSET ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $analytics = [];
    while ($row = $result->fetch_assoc()) {
        $analytics[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $analytics]);
}

function getUserAnalytics() {
    global $conn;
    
    $user = requireAuth();
    
    $sql = "SELECT * FROM user_analytics WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $analytics = $result->fetch_assoc();
    
    if (!$analytics) {
        echo json_encode(['success' => true, 'data' => null]);
    } else {
        echo json_encode(['success' => true, 'data' => $analytics]);
    }
}

function getExamAnalytics() {
    global $conn;
    
    $user = requireAuth();
    
    requireAdmin(); // Only admin can view exam analytics
    
    $limit = intval($_GET['limit'] ?? 30);
    $offset = intval($_GET['offset'] ?? 0);
    
    $sql = "SELECT * FROM exam_analytics ORDER BY date DESC LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $analytics = [];
    while ($row = $result->fetch_assoc()) {
        $analytics[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $analytics]);
}

function getAnswerHeatmap() {
    global $conn;
    
    $user = requireAuth();
    
    requireAdmin(); // Only admin can view heatmap
    
    $limit = intval($_GET['limit'] ?? 50);
    
    $sql = "SELECT ah.*, s.pertanyaan 
            FROM answer_heatmap ah
            JOIN soal s ON ah.question_id = s.id
            ORDER BY (ah.option_a_count + ah.option_b_count + ah.option_c_count + ah.option_d_count + ah.option_e_count) DESC
            LIMIT ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $heatmap = [];
    while ($row = $result->fetch_assoc()) {
        $heatmap[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $heatmap]);
}

function getFunnelAnalytics() {
    global $conn;
    
    $user = requireAuth();
    
    requireAdmin(); // Only admin can view funnel analytics
    
    $sql = "SELECT stage, COUNT(*) as count, 
            COUNT(DISTINCT user_id) as unique_users 
            FROM funnel_analytics 
            GROUP BY stage 
            ORDER BY FIELD(stage, 'landing', 'signup', 'dashboard', 'exam_start', 'exam_complete', 'certificate_download')";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $funnel = [];
    while ($row = $result->fetch_assoc()) {
        $funnel[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $funnel]);
}

function trackFunnelEvent() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user = requireAuth();
    
    $stage = $data['stage'] ?? 'dashboard';
    $metadata = json_encode($data['metadata'] ?? []);
    
    $sql = "INSERT INTO funnel_analytics (user_id, stage, metadata) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iss', $user['id'], $stage, $metadata);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function exportAnalytics() {
    global $conn;
    
    $type = $_GET['type'] ?? 'user';
    
    $data = [];
    
    switch ($type) {
        case 'user':
            $sql = "SELECT ua.*, u.nama_lengkap FROM user_analytics ua JOIN users u ON ua.user_id = u.id";
            $result = $conn->query($sql);
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            break;
        case 'exam':
            $sql = "SELECT * FROM exam_analytics";
            $result = $conn->query($sql);
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            break;
        case 'funnel':
            $sql = "SELECT stage, COUNT(*) as count FROM funnel_analytics GROUP BY stage";
            $result = $conn->query($sql);
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            break;
    }
    
    echo json_encode(['success' => true, 'data' => $data]);
}
?>
