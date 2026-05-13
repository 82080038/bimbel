<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

// Check database connection (prevents HTML errors in JSON responses)
checkDatabaseConnection();

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
    
    // Use proper password hashing with password_verify
    $sql = "SELECT id, username, password, role, api_key FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        // Verify password using password_verify (secure method)
        if (password_verify($password, $user['password'])) {
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
    
    // Validate required fields
    $required_fields = ['username', 'password', 'nama_lengkap', 'nomor_hp', 'jenis_kelamin', 'tahun_tamat', 'asal_sekolah'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            echo json_encode(['success' => false, 'error' => "Field '$field' wajib diisi"]);
            return;
        }
    }
    
    $username = trim($data['username']);
    $password = $data['password'];
    $role = $data['role'] ?? 'user';
    
    // Validate username format (alphanumeric and underscore only)
    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
        echo json_encode(['success' => false, 'error' => 'Username hanya boleh huruf, angka, dan underscore (3-20 karakter)']);
        return;
    }
    
    // Validate password length
    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'error' => 'Password minimal 8 karakter']);
        return;
    }
    
    // Validate phone number (Indonesian format)
    $nomor_hp = preg_replace('/[^0-9]/', '', $data['nomor_hp']);
    if (strlen($nomor_hp) < 10 || strlen($nomor_hp) > 13) {
        echo json_encode(['success' => false, 'error' => 'Nomor HP tidak valid (10-13 digit)']);
        return;
    }
    
    // Validate year
    $tahun_tamat = intval($data['tahun_tamat']);
    if ($tahun_tamat < 1990 || $tahun_tamat > 2030) {
        echo json_encode(['success' => false, 'error' => 'Tahun tamat tidak valid']);
        return;
    }
    
    // Validate gender
    $jenis_kelamin = strtoupper($data['jenis_kelamin']);
    if (!in_array($jenis_kelamin, ['L', 'P'])) {
        echo json_encode(['success' => false, 'error' => 'Jenis kelamin tidak valid']);
        return;
    }
    
    // Sanitize text fields
    $nama_lengkap = htmlspecialchars(trim($data['nama_lengkap']), ENT_QUOTES, 'UTF-8');
    $asal_sekolah = htmlspecialchars(trim($data['asal_sekolah']), ENT_QUOTES, 'UTF-8');
    
    // Check if username exists
    $sql_check = "SELECT id FROM users WHERE username = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("s", $username);
    $stmt_check->execute();
    
    if ($stmt_check->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'Username sudah digunakan']);
        return;
    }
    
    // Check if phone number exists
    $sql_check_hp = "SELECT id FROM users WHERE nomor_hp = ?";
    $stmt_check_hp = $conn->prepare($sql_check_hp);
    $stmt_check_hp->bind_param("s", $nomor_hp);
    $stmt_check_hp->execute();
    
    if ($stmt_check_hp->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'Nomor HP sudah terdaftar']);
        return;
    }
    
    // Hash password using password_hash (secure method)
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Generate API key
    $api_key = generateApiKey();
    
    // Insert user with participant data
    $sql = "INSERT INTO users (username, password, role, api_key, nama_lengkap, nomor_hp, jenis_kelamin, tahun_tamat, asal_sekolah, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssis", $username, $hashed_password, $role, $api_key, $nama_lengkap, $nomor_hp, $jenis_kelamin, $tahun_tamat, $asal_sekolah);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Registrasi berhasil! Silakan login.',
            'user' => [
                'id' => $conn->insert_id,
                'username' => $username,
                'role' => $role,
                'nama_lengkap' => $nama_lengkap
            ]
        ]);
    } else {
        $error = $conn->error;
        // Provide helpful error message for common issues
        if (strpos($error, 'Unknown column') !== false) {
            $error = 'Database error: Kolom peserta belum ditambahkan. Silakan jalankan SQL: fix_users_table.sql';
        }
        echo json_encode(['success' => false, 'error' => $error]);
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
