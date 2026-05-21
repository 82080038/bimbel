<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';
require_once '../scripts/logger.php';

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
    case 'get_users':
        get_users();
        break;
    case 'get_user':
        get_user();
        break;
    case 'create_user':
        create_user();
        break;
    case 'update_user':
        update_user();
        break;
    case 'delete_user':
        delete_user();
        break;
    case 'get_profile':
        get_profile();
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
    $sql = "SELECT id, username, password, role, api_key, nama_lengkap FROM users WHERE username = ?";
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
                    'nama_lengkap' => $user['nama_lengkap'] ?: $user['username'],
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

function get_users() {
    global $conn;
    require_once 'middleware.php';
    requireAdmin();
    
    $role = $_GET['role'] ?? '';
    $search = $_GET['search'] ?? '';
    
    $sql = "SELECT id, username, nama_lengkap, role, nomor_hp, jenis_kelamin, tahun_tamat, asal_sekolah, created_at FROM users WHERE 1=1";
    $params = [];
    $types = "";
    
    if ($role) {
        $sql .= " AND role = ?";
        $params[] = $role;
        $types .= "s";
    }
    
    if ($search) {
        $sql .= " AND (username LIKE ? OR nama_lengkap LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $types .= "ss";
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    if (!empty($params)) {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql);
    }
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $users]);
}

function get_user() {
    global $conn;
    require_once 'middleware.php';
    requireAuth();
    
    $id = $_GET['id'] ?? 0;
    
    $sql = "SELECT id, username, nama_lengkap, role, nomor_hp, jenis_kelamin, tahun_tamat, asal_sekolah, created_at FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        echo json_encode(['success' => true, 'data' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }
}

function create_user() {
    global $conn;
    require_once 'middleware.php';
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = $conn->real_escape_string($data['username'] ?? '');
    $nama_lengkap = $conn->real_escape_string($data['nama_lengkap'] ?? '');
    $role = $conn->real_escape_string($data['role'] ?? 'user');
    $nomor_hp = $conn->real_escape_string($data['nomor_hp'] ?? '');
    $asal_sekolah = $conn->real_escape_string($data['asal_sekolah'] ?? '');
    $password = password_hash('password123', PASSWORD_DEFAULT);
    $api_key = bin2hex(random_bytes(32));
    
    $sql = "INSERT INTO users (username, password, role, nama_lengkap, nomor_hp, asal_sekolah, api_key) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssss", $username, $password, $role, $nama_lengkap, $nomor_hp, $asal_sekolah, $api_key);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User created successfully']);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function update_user() {
    global $conn;
    require_once 'middleware.php';
    $caller = requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = intval($data['id'] ?? 0);
    
    // Security: regular users can only update their own profile
    if ($caller['role'] !== 'admin' && $caller['id'] !== $id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied']);
        return;
    }
    
    $nama_lengkap = htmlspecialchars(trim($data['nama_lengkap'] ?? ''), ENT_QUOTES, 'UTF-8');
    $nomor_hp = preg_replace('/[^0-9]/', '', $data['nomor_hp'] ?? '');
    $jenis_kelamin = strtoupper($data['jenis_kelamin'] ?? '');
    $tahun_tamat = intval($data['tahun_tamat'] ?? 0);
    $asal_sekolah = htmlspecialchars(trim($data['asal_sekolah'] ?? ''), ENT_QUOTES, 'UTF-8');
    
    $sql = "UPDATE users SET nama_lengkap = ?, nomor_hp = ?, jenis_kelamin = ?, tahun_tamat = ?, asal_sekolah = ?";
    $params = [$nama_lengkap, $nomor_hp, $jenis_kelamin, $tahun_tamat, $asal_sekolah];
    $types = "sssis";
    
    // Update role only if admin
    if ($caller['role'] === 'admin' && isset($data['role'])) {
        $role = $conn->real_escape_string($data['role']);
        $sql .= ", role = ?";
        $params[] = $role;
        $types .= "s";
    }
    
    // Update password if provided
    if (!empty($data['password'])) {
        if (strlen($data['password']) < 8) {
            echo json_encode(['success' => false, 'error' => 'Password minimal 8 karakter']);
            return;
        }
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $sql .= ", password = ?";
        $params[] = $hashed;
        $types .= "s";
    }
    
    $sql .= " WHERE id = ?";
    $params[] = $id;
    $types .= "i";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Profil berhasil diperbarui']);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function delete_user() {
    global $conn;
    require_once 'middleware.php';
    requireAdmin();
    
    $id = $_GET['id'] ?? 0;
    
    $sql = "DELETE FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function get_profile() {
    global $conn;
    
    require_once 'middleware.php';
    $user_data = requireAuth();
    $user_id = $user_data['id'];
    
    $sql = "SELECT id, username, role, nama_lengkap, nomor_hp, jenis_kelamin, tahun_tamat, asal_sekolah, created_at, last_login FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }
}

function generateApiKey() {
    return bin2hex(random_bytes(32));
}

$conn->close();
?>
