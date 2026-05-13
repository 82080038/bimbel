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
    
    // Support both API key and JWT token authentication
    $token = str_replace('Bearer ', '', $auth_header);
    
    global $conn;
    
    // First try API key authentication
    $sql = "SELECT id, username, role FROM users WHERE api_key = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        return $user;
    }
    
    // If API key fails, try session-based authentication (for admin panel JWT tokens)
    session_start();
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_role'])) {
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'role' => $_SESSION['user_role']
        ];
    }
    
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid authorization']);
    exit();
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
