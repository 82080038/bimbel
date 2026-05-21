<?php
// Advanced Analytics API
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once '../config.php';
require_once '../scripts/logger.php';
require_once '../api/middleware.php';

if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
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
    $uid = $user['id'];

    $stmt = $conn->prepare("
        SELECT
            COUNT(*) as total_exams,
            COALESCE(AVG(nilai_total), 0) as avg_score,
            COALESCE(MAX(nilai_total), 0) as best_score,
            SUM(durasi_menit) as total_study_time,
            SUM(CASE WHEN status_lulus = 'LULUS' THEN 1 ELSE 0 END) as total_lulus,
            COALESCE(AVG(nilai_twk), 0) as avg_twk,
            COALESCE(AVG(nilai_tiu), 0) as avg_tiu,
            COALESCE(AVG(nilai_tkp), 0) as avg_tkp,
            COALESCE(AVG(nilai_tpa), 0) as avg_tpa,
            COALESCE(AVG(nilai_psikologis), 0) as avg_psikologis
        FROM hasil_ujian WHERE user_id = ?");
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $analytics = $stmt->get_result()->fetch_assoc();

    echo json_encode(['success' => true, 'data' => $analytics]);
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
            $sql = "
                SELECT u.id as user_id, u.nama_lengkap, u.username,
                    COUNT(h.id) as total_exams,
                    COALESCE(AVG(h.nilai_total),0) as avg_score,
                    COALESCE(MAX(h.nilai_total),0) as best_score,
                    SUM(CASE WHEN h.status_lulus='LULUS' THEN 1 ELSE 0 END) as total_lulus
                FROM users u
                LEFT JOIN hasil_ujian h ON h.user_id = u.id
                WHERE u.role != 'admin'
                GROUP BY u.id, u.nama_lengkap, u.username
                ORDER BY avg_score DESC";
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
