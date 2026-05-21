<?php
// Notification System API
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once '../config.php';
require_once '../scripts/logger.php';
require_once '../api/middleware.php';

if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');

    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'get_notifications':
            getNotifications();
            break;
        case 'mark_read':
            markAsRead();
            break;
        case 'get_preferences':
            getPreferences();
            break;
        case 'update_preferences':
            updatePreferences();
            break;
        case 'get_history':
            getHistory();
            break;
        case 'send_notification':
            requireAdmin();
            sendNotification();
            break;
        case 'schedule_exam_reminder':
            scheduleExamReminder();
            break;
        case 'check_pending_reminders':
            checkPendingReminders();
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
            break;
    }
}

function getNotifications() {
    global $conn;
    
    $user = requireAuth();
    
    $limit = intval($_GET['limit'] ?? 10);
    $unread_only = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    
    $sql = "SELECT n.* FROM notifications n WHERE n.user_id = ?";
    $params = [$user['id']];
    
    if ($unread_only) {
        $sql .= " AND n.status = 'pending'";
    }
    
    $sql .= " ORDER BY n.created_at DESC LIMIT ?";
    $params[] = $limit;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(str_repeat('i', count($params)), ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }
    
    // Mark as read when fetched
    if (!$unread_only) {
        markNotificationsAsRead($user['id']);
    }
    
    echo json_encode(['success' => true, 'data' => $notifications]);
}

function markAsRead() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user = requireAuth();
    
    $notification_id = $data['notification_id'] ?? 0;
    
    $sql = "UPDATE notifications SET status = 'sent' WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $notification_id, $user['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function markNotificationsAsRead($user_id) {
    global $conn;
    
    $sql = "UPDATE notifications SET status = 'sent' WHERE user_id = ? AND status = 'pending'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
}

function getPreferences() {
    global $conn;
    
    $user = requireAuth();
    
    $sql = "SELECT * FROM notification_preferences WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $prefs = $result->fetch_assoc();
    
    if (!$prefs) {
        // Create default preferences
        $sql_insert = "INSERT INTO notification_preferences (user_id) VALUES (?)";
        $stmt2 = $conn->prepare($sql_insert);
        $stmt2->bind_param('i', $user['id']);
        $stmt2->execute();
        
        // Fetch again
        $stmt3 = $conn->prepare("SELECT * FROM notification_preferences WHERE user_id = ?");
        $stmt3->bind_param('i', $user['id']);
        $stmt3->execute();
        $prefs = $stmt3->get_result()->fetch_assoc();
    }
    
    echo json_encode(['success' => true, 'data' => $prefs]);
}

function updatePreferences() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user = requireAuth();
    
    $p_email_reminder   = intval($data['email_exam_reminder'] ?? 1);
    $p_email_result     = intval($data['email_exam_result'] ?? 1);
    $p_email_cert       = intval($data['email_certificate'] ?? 1);
    $p_email_achieve    = intval($data['email_achievement'] ?? 1);
    $p_inapp_reminder   = intval($data['in_app_exam_reminder'] ?? 1);
    $p_inapp_result     = intval($data['in_app_exam_result'] ?? 1);
    $p_inapp_achieve    = intval($data['in_app_achievement'] ?? 1);
    $p_push_reminder    = intval($data['push_exam_reminder'] ?? 1);
    $p_push_result      = intval($data['push_exam_result'] ?? 1);
    $p_sms_reminder     = intval($data['sms_exam_reminder'] ?? 0);
    $p_sms_result       = intval($data['sms_exam_result'] ?? 0);
    $p_hours_before     = intval($data['reminder_hours_before'] ?? 24);
    $p_user_id          = $user['id'];

    $sql = "UPDATE notification_preferences SET 
            email_exam_reminder = ?,
            email_exam_result = ?,
            email_certificate = ?,
            email_achievement = ?,
            in_app_exam_reminder = ?,
            in_app_exam_result = ?,
            in_app_achievement = ?,
            push_exam_reminder = ?,
            push_exam_result = ?,
            sms_exam_reminder = ?,
            sms_exam_result = ?,
            reminder_hours_before = ?
            WHERE user_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        'iiiiiiiiiiiii',
        $p_email_reminder, $p_email_result, $p_email_cert, $p_email_achieve,
        $p_inapp_reminder, $p_inapp_result, $p_inapp_achieve,
        $p_push_reminder, $p_push_result,
        $p_sms_reminder, $p_sms_result,
        $p_hours_before, $p_user_id
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getHistory() {
    global $conn;
    
    $user = requireAuth();
    
    $limit = intval($_GET['limit'] ?? 20);
    $offset = intval($_GET['offset'] ?? 0);
    
    $sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iii', $user['id'], $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $history = [];
    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $history]);
}

function sendNotification() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $data['user_id'] ?? 0;
    $type = $data['type'] ?? 'in_app';
    $title = $data['title'] ?? '';
    $message = $data['message'] ?? '';
    $category = $data['category'] ?? 'system';
    
    $sql = "INSERT INTO notifications (user_id, type, title, message, category, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('issss', $user_id, $type, $title, $message, $category);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'notification_id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function scheduleExamReminder() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $data['user_id'] ?? 0;
    $exam_id = $data['exam_id'] ?? null;
    $hours_before = $data['hours_before'] ?? 24;
    $scheduled_at = $data['scheduled_at'] ?? null;
    
    if (!$scheduled_at) {
        echo json_encode(['success' => false, 'error' => 'scheduled_at is required']);
        return;
    }
    
    $sql = "INSERT INTO exam_reminders (user_id, exam_id, reminder_type, hours_before, scheduled_at) 
            VALUES (?, ?, 'before', ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiss', $user_id, $exam_id, $hours_before, $scheduled_at);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function checkPendingReminders() {
    global $conn;
    
    $now = date('Y-m-d H:i:s');
    
    // Get pending reminders that should be sent
    $sql = "SELECT er.*, u.email, u.nama_lengkap 
            FROM exam_reminders er
            JOIN users u ON er.user_id = u.id
            WHERE er.status = 'pending' AND er.scheduled_at <= ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $now);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $sent = 0;
    while ($reminder = $result->fetch_assoc()) {
        // Get user preferences
        $sql2 = "SELECT * FROM notification_preferences WHERE user_id = ?";
        $stmt2 = $conn->prepare($sql2);
        $stmt2->bind_param('i', $reminder['user_id']);
        $stmt2->execute();
        $prefs = $stmt2->get_result()->fetch_assoc();
        
        if (!$prefs) {
            $prefs = ['email_exam_reminder' => 1, 'in_app_exam_reminder' => 1];
        }
        
        // Send in-app notification
        if ($prefs['in_app_exam_reminder']) {
            createNotification($reminder['user_id'], 'in_app', 'Pengingat Ujian', 
                'Ujian akan dimulai dalam ' . $reminder['hours_before'] . ' jam', 'exam_reminder');
        }
        
        // Send email notification
        if ($prefs['email_exam_reminder'] && $reminder['email']) {
            sendEmailNotification($reminder['email'], 'Pengingat Ujian', 
                'Ujian akan dimulai dalam ' . $reminder['hours_before'] . ' jam', 'exam_reminder');
        }
        
        // Update reminder status
        $sql3 = "UPDATE exam_reminders SET status = 'sent', sent_at = NOW() WHERE id = ?";
        $stmt3 = $conn->prepare($sql3);
        $stmt3->bind_param('i', $reminder['id']);
        $stmt3->execute();
        
        $sent++;
    }
    
    echo json_encode(['success' => true, 'sent' => $sent]);
}

function createNotification($user_id, $type, $title, $message, $category, $metadata = null) {
    global $conn;
    
    $sql = "INSERT INTO notifications (user_id, type, title, message, category, status, metadata) 
            VALUES (?, ?, ?, ?, ?, 'pending', ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('isssss', $user_id, $type, $title, $message, $category, json_encode($metadata));
    $stmt->execute();
}

function sendEmailNotification($email, $subject, $message, $category) {
    global $conn;
    
    // Get email template
    $sql = "SELECT * FROM notification_templates WHERE category = ? AND type = 'email' LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $category);
    $stmt->execute();
    $template = $stmt->get_result()->fetch_assoc();
    
    if ($template) {
        $subject = $template['subject'];
        $message = $template['body'];
    }
    
    // Send email using PHP mail function
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Ujian Sekolah Kedinasan <noreply@ujian-sekolah-kedinasan.com>" . "\r\n";
    
    $success = mail($email, $subject, $message, $headers);
    
    return $success;
}
?>
