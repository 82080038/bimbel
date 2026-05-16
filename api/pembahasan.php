<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_pembahasan':
        getPembahasan();
        break;
    case 'get_pembahasan_kategori':
    case 'get_kategori_pembahasan':
        getPembahasanKategori();
        break;
    case 'get_tips_umum':
        getTipsUmum();
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}

function getPembahasan() {
    global $conn;
    
    $soal_id = intval($_GET['soal_id']);
    
    $sql = "SELECT s.*, k.nama_kategori 
            FROM soal s 
            JOIN kategori_soal k ON s.kategori_id = k.id 
            WHERE s.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $soal_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $soal = $result->fetch_assoc();
    
    if ($soal) {
        echo json_encode(['success' => true, 'data' => $soal]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Soal tidak ditemukan']);
    }
}

function getPembahasanKategori() {
    global $conn;
    
    $kategori = $_GET['kategori'] ?? 'TWK';
    $limit = intval($_GET['limit'] ?? 10);
    
    $kategori_map = [
        'TWK' => 1,
        'TIU' => 2,
        'TKP' => 3,
        'TPA' => 4,
        'PSIKOLOGIS' => 5
    ];
    
    $kategori_id = $kategori_map[$kategori] ?? 1;
    
    $sql = "SELECT s.*, k.nama_kategori 
            FROM soal s 
            JOIN kategori_soal k ON s.kategori_id = k.id 
            WHERE s.kategori_id = ? AND s.pembahasan IS NOT NULL 
            ORDER BY RAND() 
            LIMIT ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $kategori_id, $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $soal = [];
    while ($row = $result->fetch_assoc()) {
        $soal[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $soal]);
}

function getTipsUmum() {
    global $conn;
    
    $kategori = $_GET['kategori'] ?? '';
    
    if ($kategori) {
        $kategori_map = ['TWK'=>1,'TIU'=>2,'TKP'=>3,'TPA'=>4,'PSIKOLOGIS'=>5];
        $kategori_id = $kategori_map[strtoupper($kategori)] ?? 0;
        $sql = "SELECT * FROM tips_umum WHERE kategori_id = ? ORDER BY id";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $kategori_id);
        $stmt->execute();
    } else {
        $sql = "SELECT * FROM tips_umum ORDER BY kategori_id, id";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
    }
    
    $result = $stmt->get_result();
    
    $tips = [];
    while ($row = $result->fetch_assoc()) {
        $tips[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $tips]);
}

$conn->close();
?>
