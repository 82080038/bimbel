<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_soal_by_kategori':
        getSoalByKategori();
        break;
    case 'get_soal_acak':
        getSoalAcak();
        break;
    case 'get_soal_by_id':
        getSoalById();
        break;
    case 'simpan_sesi':
        simpanSesi();
        break;
    case 'get_sesi':
        getSesi();
        break;
    case 'selesai_ujian':
        selesaiUjian();
        break;
    case 'get_riwayat_ujian':
        getRiwayatUjian();
        break;
    case 'get_statistik':
        getStatistik();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function getSoalByKategori() {
    global $conn;
    
    $kategori = $_GET['kategori'] ?? 'TWK';
    $limit = intval($_GET['limit'] ?? 30);
    
    $kategori_map = [
        'TWK' => 1,
        'TIU' => 2,
        'TKP' => 3,
        'TPA' => 4,
        'PSIKOLOGIS' => 5
    ];
    
    $kategori_id = $kategori_map[$kategori] ?? 1;
    
    $sql = "SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar 
            FROM soal 
            WHERE kategori_id = ? 
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

function getSoalAcak() {
    global $conn;
    
    // Get random questions for each category
    $sql_twk = "SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, kategori_id 
                FROM soal WHERE kategori_id = 1 ORDER BY RAND() LIMIT " . JUMLAH_SOAL_TWK;
    $sql_tiu = "SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, kategori_id 
                FROM soal WHERE kategori_id = 2 ORDER BY RAND() LIMIT " . JUMLAH_SOAL_TIU;
    $sql_tkp = "SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, kategori_id 
                FROM soal WHERE kategori_id = 3 ORDER BY RAND() LIMIT " . JUMLAH_SOAL_TKP;
    $sql_tpa = "SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, kategori_id 
                FROM soal WHERE kategori_id = 4 ORDER BY RAND() LIMIT 15";
    $sql_psiko = "SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, kategori_id 
                FROM soal WHERE kategori_id = 5 ORDER BY RAND() LIMIT 15";
    
    $result_twk = $conn->query($sql_twk);
    $result_tiu = $conn->query($sql_tiu);
    $result_tkp = $conn->query($sql_tkp);
    $result_tpa = $conn->query($sql_tpa);
    $result_psiko = $conn->query($sql_psiko);
    
    $soal = [];
    
    // Add TWK questions (numbered 1-30)
    $num = 1;
    while ($row = $result_twk->fetch_assoc()) {
        $row['nomor'] = $num++;
        $row['kategori'] = 'TWK';
        $soal[] = $row;
    }
    
    // Add TIU questions (numbered 31-65)
    while ($row = $result_tiu->fetch_assoc()) {
        $row['nomor'] = $num++;
        $row['kategori'] = 'TIU';
        $soal[] = $row;
    }
    
    // Add TKP questions (numbered 66-100)
    while ($row = $result_tkp->fetch_assoc()) {
        $row['nomor'] = $num++;
        $row['kategori'] = 'TKP';
        $soal[] = $row;
    }
    
    // Add TPA questions (numbered 101-115)
    while ($row = $result_tpa->fetch_assoc()) {
        $row['nomor'] = $num++;
        $row['kategori'] = 'TPA';
        $soal[] = $row;
    }
    
    // Add PSIKOLOGIS questions (numbered 116-130)
    while ($row = $result_psiko->fetch_assoc()) {
        $row['nomor'] = $num++;
        $row['kategori'] = 'PSIKOLOGIS';
        $soal[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $soal]);
}

function getSoalById() {
    global $conn;
    
    $id = intval($_GET['id']);
    
    $sql = "SELECT s.*, k.nama_kategori, k.deskripsi 
            FROM soal s 
            JOIN kategori_soal k ON s.kategori_id = k.id 
            WHERE s.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $soal = $result->fetch_assoc();
    
    echo json_encode(['success' => true, 'data' => $soal]);
}

function simpanSesi() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $nama = $conn->real_escape_string($data['nama_peserta']);
    $durasi = intval($data['durasi_menit']);
    $soal_teracak = json_encode($data['soal_teracak']);
    
    $sql = "INSERT INTO sesi_ujian (nama_peserta, durasi_menit, soal_teracak) 
            VALUES (?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sis", $nama, $durasi, $soal_teracak);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'sesi_id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getSesi() {
    global $conn;
    
    $sesi_id = intval($_GET['sesi_id']);
    
    $sql = "SELECT * FROM sesi_ujian WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $sesi_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $sesi = $result->fetch_assoc();
    
    echo json_encode(['success' => true, 'data' => $sesi]);
}

function selesaiUjian() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $nama = $conn->real_escape_string($data['nama_peserta']);
    $jawaban = json_encode($data['jawaban']);
    $sesi_id = intval($data['sesi_id']);
    
    // Calculate scores
    $nilai_twk = 0;
    $nilai_tiu = 0;
    $nilai_tkp = 0;
    $nilai_tpa = 0;
    $nilai_psikologis = 0;
    
    foreach ($data['jawaban'] as $item) {
        $soal_id = intval($item['soal_id']);
        $jawaban_peserta = $item['jawaban'];
        
        $sql = "SELECT jawaban_benar, kategori_id FROM soal WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $soal_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $soal = $result->fetch_assoc();
        
        if ($soal && $soal['jawaban_benar'] === $jawaban_peserta) {
            if ($soal['kategori_id'] == 1) $nilai_twk += 5;
            elseif ($soal['kategori_id'] == 2) $nilai_tiu += 5;
            elseif ($soal['kategori_id'] == 3) $nilai_tkp += 5;
            elseif ($soal['kategori_id'] == 4) $nilai_tpa += 5;
            elseif ($soal['kategori_id'] == 5) $nilai_psikologis += 5;
        }
    }
    
    $nilai_total = $nilai_twk + $nilai_tiu + $nilai_tkp + $nilai_tpa + $nilai_psikologis;
    
    // Check passing grade (only TWK, TIU, TKP are required for SKD passing)
    $status_lulus = ($nilai_twk >= PASSING_GRADE_TWK && 
                     $nilai_tiu >= PASSING_GRADE_TIU && 
                     $nilai_tkp >= PASSING_GRADE_TKP) ? 'LULUS' : 'TIDAK LULUS';
    
    // Save result
    $sql = "INSERT INTO hasil_ujian (nama_peserta, durasi_menit, nilai_twk, nilai_tiu, nilai_tkp, nilai_tpa, nilai_psikologis, nilai_total, status_lulus, jawaban_peserta) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("siiiiisss", $nama, DURASI_UJIAN_MENIT, $nilai_twk, $nilai_tiu, $nilai_tkp, $nilai_tpa, $nilai_psikologis, $nilai_total, $status_lulus, $jawaban);
    
    if ($stmt->execute()) {
        // Update session
        $sql_update = "UPDATE sesi_ujian SET status = 'selesai', waktu_selesai = NOW() WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("i", $sesi_id);
        $stmt_update->execute();
        
        echo json_encode([
            'success' => true,
            'nilai_twk' => $nilai_twk,
            'nilai_tiu' => $nilai_tiu,
            'nilai_tkp' => $nilai_tkp,
            'nilai_tpa' => $nilai_tpa,
            'nilai_psikologis' => $nilai_psikologis,
            'nilai_total' => $nilai_total,
            'status_lulus' => $status_lulus
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getRiwayatUjian() {
    global $conn;
    
    $limit = intval($_GET['limit'] ?? 10);
    $offset = intval($_GET['offset'] ?? 0);
    
    $sql = "SELECT * FROM hasil_ujian ORDER BY tanggal_ujian DESC LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $riwayat = [];
    while ($row = $result->fetch_assoc()) {
        $riwayat[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $riwayat]);
}

function getStatistik() {
    global $conn;
    
    // Get total exams
    $sql_total = "SELECT COUNT(*) as total FROM hasil_ujian";
    $result_total = $conn->query($sql_total);
    $total_exams = $result_total->fetch_assoc()['total'];
    
    // Get average scores
    $sql_avg = "SELECT AVG(nilai_total) as avg_total, AVG(nilai_twk) as avg_twk, AVG(nilai_tiu) as avg_tiu, AVG(nilai_tkp) as avg_tkp FROM hasil_ujian";
    $result_avg = $conn->query($sql_avg);
    $avg_scores = $result_avg->fetch_assoc();
    
    // Get pass rate
    $sql_pass = "SELECT COUNT(*) as passed FROM hasil_ujian WHERE status_lulus = 'LULUS'";
    $result_pass = $conn->query($sql_pass);
    $passed = $result_pass->fetch_assoc()['passed'];
    
    $pass_rate = $total_exams > 0 ? ($passed / $total_exams) * 100 : 0;
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_exams' => $total_exams,
            'average_scores' => [
                'total' => round($avg_scores['avg_total'] ?? 0, 2),
                'twk' => round($avg_scores['avg_twk'] ?? 0, 2),
                'tiu' => round($avg_scores['avg_tiu'] ?? 0, 2),
                'tkp' => round($avg_scores['avg_tkp'] ?? 0, 2)
            ],
            'pass_rate' => round($pass_rate, 2)
        ]
    ]);
}

$conn->close();
?>
