<?php
// Authentication middleware for API

function requireAuth() {
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!$auth_header) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'No authorization header']);
        exit();
    }
    
    $api_key = str_replace('Bearer ', '', $auth_header);
    
    global $conn;
    
    $sql = "SELECT id, username, role FROM users WHERE api_key = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $api_key);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if (!$user = $result->fetch_assoc()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid API key']);
        exit();
    }
    
    return $user;
}

function requireAdmin() {
    $user = requireAuth();
    
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Admin access required']);
        exit();
    }
    
    return $user;
}
?>
