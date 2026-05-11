<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        login();
        break;
    case 'register':
        register();
        break;
    case 'verify':
        verifyToken();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function login() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = $conn->real_escape_string($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    // For demo purposes, check against hardcoded admin credentials
    // In production, use proper password hashing (password_hash, password_verify)
    $sql = "SELECT id, username, password, role, api_key FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        // Simple password verification (use password_verify in production)
        if ($user['password'] === $password) {
            // Generate API key if not exists
            if (!$user['api_key']) {
                $api_key = generateApiKey();
                $sql_update = "UPDATE users SET api_key = ?, last_login = NOW() WHERE id = ?";
                $stmt_update = $conn->prepare($sql_update);
                $stmt_update->bind_param("si", $api_key, $user['id']);
                $stmt_update->execute();
                $user['api_key'] = $api_key;
            } else {
                $sql_update = "UPDATE users SET last_login = NOW() WHERE id = ?";
                $stmt_update = $conn->prepare($sql_update);
                $stmt_update->bind_param("i", $user['id']);
                $stmt_update->execute();
            }
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role'],
                    'api_key' => $user['api_key']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid password']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }
}

function register() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = $conn->real_escape_string($data['username'] ?? '');
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'user';
    
    // Check if username exists
    $sql_check = "SELECT id FROM users WHERE username = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("s", $username);
    $stmt_check->execute();
    
    if ($stmt_check->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'Username already exists']);
        return;
    }
    
    // Generate API key
    $api_key = generateApiKey();
    
    // Insert user
    $sql = "INSERT INTO users (username, password, role, api_key) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $username, $password, $role, $api_key);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $conn->insert_id,
                'username' => $username,
                'role' => $role,
                'api_key' => $api_key
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function verifyToken() {
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!$auth_header) {
        echo json_encode(['success' => false, 'error' => 'No authorization header']);
        return;
    }
    
    $api_key = str_replace('Bearer ', '', $auth_header);
    
    global $conn;
    
    $sql = "SELECT id, username, role FROM users WHERE api_key = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $api_key);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid API key']);
    }
}

function generateApiKey() {
    return bin2hex(random_bytes(32));
}

$conn->close();
?>
