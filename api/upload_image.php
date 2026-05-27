<?php
/**
 * API Endpoint with Protection Layer
 * Auto-generated with rate limiting, validation, and caching
 */

require_once __DIR__ . '/api_protection.php';

// Apply rate limiting for this endpoint
$protection = apiProtection();
$protection->applyRateLimit('default');
$protection->checkSuspiciousActivity();

/**
 * API untuk upload gambar soal
 * Method: POST
 * Parameters: file (multipart/form-data)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

// Cek method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit;
}

// Cek apakah ada file yang diupload
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        'success' => false,
        'error' => 'No file uploaded or upload error'
    ]);
    exit;
}

$file = $_FILES['file'];

// Validasi file type
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowed_types)) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
    ]);
    exit;
}

// Validasi file size (max 5MB)
$max_size = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $max_size) {
    echo json_encode([
        'success' => false,
        'error' => 'File size exceeds 5MB limit'
    ]);
    exit;
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('soal_') . '_' . time() . '.' . $extension;
$upload_dir = '../uploads/soal/';

// Pastikan directory ada
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Upload file
$filepath = $upload_dir . $filename;
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to move uploaded file'
    ]);
    exit;
}

// Simpan ke database media_uploads
$user_id = $_SESSION['user_id'] ?? 1; // Default to 1 if not logged in
$stmt = $conn->prepare("INSERT INTO media_uploads (file_name, file_path, file_type, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssis", $file['name'], $filename, $file['type'], $file['size'], $user_id);

if ($stmt->execute()) {
    $media_id = $conn->insert_id;
    echo json_encode([
        'success' => true,
        'data' => [
            'media_id' => $media_id,
            'filename' => $filename,
            'filepath' => 'uploads/soal/' . $filename,
            'url' => 'uploads/soal/' . $filename
        ]
    ]);
} else {
    // Hapus file jika gagal simpan ke database
    unlink($filepath);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save to database: ' . $conn->error
    ]);
}

$stmt->close();
$conn->close();
?>
