<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');

require_once '../config.php';
require_once '../scripts/logger.php';

// Check database connection (prevents HTML errors in JSON responses)
checkDatabaseConnection();

require_once 'middleware.php';
require_once 'csrf.php';
require_once 'rate_limiter.php';
require_once '../scripts/learning_recommendation_system.php';
require_once '../scripts/ai_question_generator.php';

// Start session if not already active
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Apply rate limiting (100 requests per minute for public endpoints, 1000 for authenticated)
$action = $_GET['action'] ?? '';
$public_actions = ['get_soal_by_kategori', 'get_soal_acak', 'get_soal_by_id', 'get_learning_topics', 'get_paket', 'get_soal_by_paket'];

if (!in_array($action, $public_actions)) {
    // Authenticated endpoints: higher limit
    checkRateLimit(1000, 60);
} else {
    // Public endpoints: lower limit
    checkRateLimit(100, 60);
}

// Log API access
logAccess("API request: action=$action", ['action' => $action, 'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown']);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

// Public endpoints (no auth required)
$public_actions = ['get_soal_by_kategori', 'get_soal_acak', 'get_soal_by_id', 'get_learning_topics', 'get_paket', 'get_soal_by_paket'];

// Protected endpoints (auth required)
if (!in_array($action, $public_actions)) {
    requireAuth();
    
    // CSRF validation for POST requests (skip if using Bearer token - already CSRF-safe)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $headers = getallheaders();
        $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $is_bearer = strpos($auth_header, 'Bearer ') === 0;
        
        if (!$is_bearer) {
            $csrf_token = $headers['X-CSRF-Token'] ?? $headers['x-csrf-token'] ?? '';
            if (!validateCsrfToken($csrf_token)) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Invalid CSRF token']);
                exit();
            }
        }
    }
}

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
    case 'submit_ujian':
        submitUjian();
        break;
    case 'get_riwayat_ujian':
        getRiwayatUjian();
        break;
    case 'get_exam_result':
        getExamResult();
        break;
    case 'get_question_analysis':
        getQuestionAnalysis();
        break;
    case 'generate_practice_questions':
        generatePracticeQuestions();
        break;
    case 'get_statistik':
        getStatistik();
        break;
    case 'create_question':
        requireAdmin();
        createQuestion();
        break;
    case 'update_question':
        requireAdmin();
        updateQuestion();
        break;
    case 'delete_question':
        requireAdmin();
        deleteQuestion();
        break;
    case 'list_questions':
        requireAdmin();
        listQuestions();
        break;
    case 'get_ranking':
        getRanking();
        break;
    case 'get_paket':
        getPaket();
        break;
    case 'get_soal_by_paket':
        getSoalByPaket();
        break;
    case 'get_soal_statistics':
        getSoalStatistics();
        break;
    case 'track_question_appearance':
        trackQuestionAppearance();
        break;
    case 'get_bahan_pelajaran':
        getBahanPelajaran();
        break;
    case 'get_all_bahan_pelajaran':
        getAllBahanPelajaran();
        break;
    case 'get_all_soal':
        getAllSoal();
        break;
    case 'save_bahan_pelajaran':
        saveBahanPelajaran();
        break;
    case 'get_rekomendasi_belajar':
        getRekomendasiBelajar();
        break;
    case 'generate_rekomendasi':
        generateRekomendasi();
        break;
    case 'update_rekomendasi_status':
        updateRekomendasiStatus();
        break;
    case 'analyze_weakness':
        analyzeWeakness();
        break;
    case 'get_my_weakness':
        getMyWeakness();
        break;
    case 'get_tips_tricks':
        getTipsTricks();
        break;
    case 'get_kategori_weakness':
        getKategoriWeakness();
        break;
    case 'save_tips':
        saveTips();
        break;
    case 'delete_tips':
        deleteTips();
        break;
    case 'verify_certificate':
        verifyCertificate();
        break;
    case 'generate_certificate':
        generateCertificate();
        break;
    case 'get_sertifikat':
        getSertifikat();
        break;
    case 'get_exam_types':
        getExamTypes();
        break;
    case 'generate_sertifikat':
        generateCertificate();
        break;
    case 'generate_question_admin':
        generateQuestionForAdmin();
        break;
    case 'generate_practice_question':
        generatePracticeQuestion();
        break;
    case 'leaderboard_optout':
        leaderboardOptout();
        break;
    case 'validate_blueprint':
        validateBlueprint();
        break;
    case 'get_leaderboard_optout_status':
        getLeaderboardOptOutStatus();
        break;
    case 'serve_file':
        serveFile();
        break;
    case 'get_blueprints':
        getBlueprints();
        break;
    case 'save_blueprint':
        saveBlueprint();
        break;
    case 'delete_blueprint':
        deleteBlueprint();
        break;
    case 'get_paket_tryout':
        getPaketTryout();
        break;
    case 'create_paket_tryout':
        requireAdmin();
        createPaketTryout();
        break;
    case 'update_paket_tryout':
        requireAdmin();
        updatePaketTryout();
        break;
    case 'delete_paket_tryout':
        requireAdmin();
        deletePaketTryout();
        break;
    case 'get_sesi_ujian':
        requireAdmin();
        getSesiUjian();
        break;
    case 'get_participants':
        requireAdmin();
        getParticipants();
        break;
    case 'terminate_session':
        requireAdmin();
        terminateSession();
        break;
    case 'calculate_irt':
        calculateIRT();
        break;
    case 'get_irt_analysis':
        getIRTAnalysis();
        break;
    case 'enable_cat':
        enableCAT();
        break;
    case 'get_next_question_cat':
        getNextQuestionCAT();
        break;
    case 'update_ability_estimate':
        updateAbilityEstimate();
        break;
    case 'serve_file':
        serveFile();
        break;
    case 'delete_bahan_pelajaran':
        deleteBahanPelajaran();
        break;
    // Tryout System Endpoints
    case 'get_kategori':
        getKategori();
        break;
    case 'get_topics_by_kategori':
        getTopicsByKategori();
        break;
    case 'get_learning_topics':
        getLearningTopics();
        break;
    case 'get_learning_recommendations':
        getLearningRecommendations();
        break;
    case 'mark_topic_studied':
        markTopicStudied();
        break;
    case 'get_learning_progress':
        getLearningProgress();
        break;
    case 'create_tryout_session':
        createTryoutSession();
        break;
    case 'get_tryout_questions':
        getTryoutQuestions();
        break;
    case 'start_tryout':
        startTryout();
        break;
    case 'submit_tryout_answer':
        submitTryoutAnswer();
        break;
    case 'complete_tryout':
        completeTryout();
        break;
    case 'get_tryout_history':
        getTryoutHistory();
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

    // Handle both numeric ID and string name
    if (is_numeric($kategori)) {
        $kategori_id = intval($kategori);
    } else {
        $kategori_id = $kategori_map[$kategori] ?? 1;
    }
    
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
    
    // Validate required fields
    if (empty($data['nama_peserta']) || !is_numeric($data['durasi_menit'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input data']);
        return;
    }
    
    // Validate and sanitize input
    $nama = trim($data['nama_peserta']);
    if (strlen($nama) < 2 || strlen($nama) > 100) {
        echo json_encode(['success' => false, 'error' => 'Nama peserta harus 2-100 karakter']);
        return;
    }
    
    $durasi = intval($data['durasi_menit']);
    if ($durasi < 1 || $durasi > 300) {
        echo json_encode(['success' => false, 'error' => 'Durasi tidak valid (1-300 menit)']);
        return;
    }
    
    // Validate soal_teracak is array
    if (!is_array($data['soal_teracak'])) {
        echo json_encode(['success' => false, 'error' => 'Format soal tidak valid']);
        return;
    }
    
    $soal_teracak = json_encode($data['soal_teracak']);
    if (strlen($soal_teracak) > 100000) { // Max 100KB
        echo json_encode(['success' => false, 'error' => 'Data soal terlalu besar']);
        return;
    }
    
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
    
    // Get authenticated user
    $user = requireAuth();
    $user_id = $user['id'];
    
    // Validate required fields
    if (empty($data['nama_peserta']) || !is_array($data['jawaban'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input data']);
        return;
    }
    
    // Validate and sanitize input
    $nama = trim($data['nama_peserta']);
    if (strlen($nama) < 2 || strlen($nama) > 100) {
        echo json_encode(['success' => false, 'error' => 'Nama peserta tidak valid']);
        return;
    }
    
    $sesi_id = isset($data['sesi_id']) ? intval($data['sesi_id']) : 0;
    
    // Validate jawaban array size
    if (count($data['jawaban']) > 1000) {
        echo json_encode(['success' => false, 'error' => 'Too many answers']);
        return;
    }
    
    $jawaban = json_encode($data['jawaban']);
    if (strlen($jawaban) > 50000) { // Max 50KB
        echo json_encode(['success' => false, 'error' => 'Answer data too large']);
        return;
    }
    
    // Calculate scores
    $nilai_twk = 0;
    $nilai_tiu = 0;
    $nilai_tkp = 0;
    $nilai_tpa = 0;
    $nilai_psikologis = 0;
    
    foreach ($data['jawaban'] as $item) {
        // Validate each answer item
        if (!is_array($item) || empty($item['soal_id'])) {
            continue;
        }
        
        $soal_id = intval($item['soal_id']);
        $jawaban_peserta = isset($item['jawaban']) ? strtoupper(substr(trim($item['jawaban']), 0, 1)) : '';
        
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
    $sql = "INSERT INTO hasil_ujian (user_id, nama_peserta, durasi_menit, nilai_twk, nilai_tiu, nilai_tkp, nilai_tpa, nilai_psikologis, nilai_total, status_lulus, jawaban_peserta) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isiiiiisss", $user_id, $nama, DURASI_UJIAN_MENIT, $nilai_twk, $nilai_tiu, $nilai_tkp, $nilai_tpa, $nilai_psikologis, $nilai_total, $status_lulus, $jawaban);
    
    if ($stmt->execute()) {
        // Get the inserted ID
        $result_id = $conn->insert_id;
        
        // Update session
        $sql_update = "UPDATE sesi_ujian SET status = 'selesai', waktu_selesai = NOW() WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("i", $sesi_id);
        $stmt_update->execute();
        
        echo json_encode([
            'success' => true,
            'id' => $result_id,
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

function submitUjian() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user = requireAuth();
    $answers = $data['answers'] ?? [];
    $is_practice = $data['is_practice'] ?? false;
    
    if (empty($answers)) {
        echo json_encode(['success' => false, 'error' => 'No answers provided']);
        return;
    }
    
    $nilai_twk = 0; $nilai_tiu = 0; $nilai_tkp = 0; $nilai_tpa = 0; $nilai_psikologis = 0;
    
    // Per-kategori stats for weakness analysis
    $kategori_stats = [];
    
    foreach ($answers as $soal_id => $jawaban_peserta) {
        $soal_id = intval($soal_id);
        $jawaban_peserta = strtoupper(substr(trim((string)$jawaban_peserta), 0, 1));
        
        $sql = "SELECT jawaban_benar, kategori_id FROM soal WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $soal_id);
        $stmt->execute();
        $soal = $stmt->get_result()->fetch_assoc();
        
        if ($soal) {
            $kid = $soal['kategori_id'];
            if (!isset($kategori_stats[$kid])) {
                $kategori_stats[$kid] = ['total' => 0, 'benar' => 0, 'salah' => 0, 'kosong' => 0];
            }
            $kategori_stats[$kid]['total']++;
            
            $is_correct = ($soal['jawaban_benar'] === $jawaban_peserta);
            if ($is_correct) {
                $kategori_stats[$kid]['benar']++;
                if ($kid == 1) $nilai_twk += 5;
                elseif ($kid == 2) $nilai_tiu += 5;
                elseif ($kid == 3) $nilai_tkp += 5;
                elseif ($kid == 4) $nilai_tpa += 5;
                elseif ($kid == 5) $nilai_psikologis += 5;
            } elseif ($jawaban_peserta !== '') {
                $kategori_stats[$kid]['salah']++;
            } else {
                $kategori_stats[$kid]['kosong']++;
            }
        }
    }
    
    $nilai_total = $nilai_twk + $nilai_tiu + $nilai_tkp + $nilai_tpa + $nilai_psikologis;
    $status_lulus = ($nilai_twk >= PASSING_GRADE_TWK && $nilai_tiu >= PASSING_GRADE_TIU && $nilai_tkp >= PASSING_GRADE_TKP) ? 'LULUS' : 'TIDAK LULUS';
    $nama = $user['username'] ?? 'Peserta';
    $jawaban_json = json_encode($answers);
    
    $durasi = intval(DURASI_UJIAN_MENIT);
    $user_id_ins = $user['id'];
    $sql = "INSERT INTO hasil_ujian (nama_peserta, user_id, durasi_menit, nilai_twk, nilai_tiu, nilai_tkp, nilai_total, status_lulus, jawaban_peserta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("siiiiisss", $nama, $user_id_ins, $durasi, $nilai_twk, $nilai_tiu, $nilai_tkp, $nilai_total, $status_lulus, $jawaban_json);
    
    if ($stmt->execute()) {
        $hasil_id = $conn->insert_id;
        
        // Fill analisis_kelemahan so dashboard weakness analysis works
        foreach ($kategori_stats as $kategori_id => $stats) {
            $total = $stats['total'];
            if ($total === 0) continue;
            $benar = $stats['benar'];
            $salah = $stats['salah'];
            $kosong = $stats['kosong'];
            $persen_benar = round(($benar / $total) * 100, 2);
            
            if ($persen_benar >= 80) {
                $tingkat = 'rendah';
                $rekomendasi = 'Sudah baik, pertahankan performa.';
            } elseif ($persen_benar >= 60) {
                $tingkat = 'sedang';
                $rekomendasi = 'Perlu latihan lebih banyak untuk meningkatkan pemahaman.';
            } elseif ($persen_benar >= 40) {
                $tingkat = 'tinggi';
                $rekomendasi = 'Kelemahan cukup signifikan, fokus pada materi kategori ini.';
            } else {
                $tingkat = 'sangat_tinggi';
                $rekomendasi = 'Kelemahan sangat tinggi, prioritaskan belajar kategori ini.';
            }
            
            $ak_sql = "INSERT INTO analisis_kelemahan 
                       (user_id, sesi_id, kategori_id, total_soal, benar, salah, kosong, persen_benar, tingkat_kelemahan, rekomendasi)
                       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
                       ON DUPLICATE KEY UPDATE
                       total_soal=VALUES(total_soal), benar=VALUES(benar), salah=VALUES(salah),
                       kosong=VALUES(kosong), persen_benar=VALUES(persen_benar),
                       tingkat_kelemahan=VALUES(tingkat_kelemahan), rekomendasi=VALUES(rekomendasi)";
            $ak_stmt = $conn->prepare($ak_sql);
            $ak_stmt->bind_param("iiiiiidss", $user_id_ins, $kategori_id,
                $total, $benar, $salah, $kosong, $persen_benar, $tingkat, $rekomendasi);
            $ak_stmt->execute();
        }
        
        // Award XP for completing exam
        require_once 'gamification.php';
        if (function_exists('addXPInternal')) {
            $xp_reason = 'Menyelesaikan ujian';
            $xp_source = 'exam';
            addXPInternal($user_id_ins, 50, $xp_reason, $xp_source, $hasil_id);
        }
        
        // Update streak
        if (function_exists('updateStreakInternal')) {
            updateStreakInternal($user_id_ins);
        }
        
        // Auto-generate certificate if passed
        if ($status_lulus === 'LULUS') {
            generateSertifikatInternal($hasil_id, $user_id_ins, $nama, $nilai_total);
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $hasil_id,
                'nilai_twk' => $nilai_twk,
                'nilai_tiu' => $nilai_tiu,
                'nilai_tkp' => $nilai_tkp,
                'nilai_total' => $nilai_total,
                'status_lulus' => $status_lulus
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function generateSertifikatInternal($hasil_id, $user_id, $nama_peserta, $nilai_total) {
    global $conn;
    
    // Check if certificate already exists
    $check = $conn->prepare("SELECT id FROM sertifikat WHERE hasil_id = ?");
    $check->bind_param("i", $hasil_id);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        return; // Already exists
    }
    
    // Generate certificate number
    $cert_number = 'CERT-' . date('Y') . '-' . str_pad($hasil_id, 6, '0', STR_PAD_LEFT);
    $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0x1000, 0x4fff),
        mt_rand(0x8000, 0xbfff),
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
    
    $issue_date = date('Y-m-d H:i:s');
    $expiry_date = date('Y-m-d H:i:s', strtotime('+5 years'));
    
    $sql = "INSERT INTO sertifikat (hasil_id, user_id, nomor_sertifikat, uuid, status, issue_date, expiry_date) 
            VALUES (?, ?, ?, ?, 'active', ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissss", $hasil_id, $user_id, $cert_number, $uuid, $issue_date, $expiry_date);
    $stmt->execute();
}

function getKategori() {
    global $conn;
    
    $sql = "SELECT id, nama_kategori, deskripsi FROM kategori_soal ORDER BY id";
    $result = $conn->query($sql);
    
    $kategori = [];
    while ($row = $result->fetch_assoc()) {
        $kategori[] = [
            'id' => $row['id'],
            'nama' => $row['nama_kategori'],
            'deskripsi' => $row['deskripsi'],
            'code' => $row['nama_kategori'] // For backwards compatibility
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $kategori
    ]);
}

function getTopicsByKategori() {
    global $conn;

    header('Content-Type: application/json');

    try {
        $kategori_nama = $_GET['kategori'] ?? '';

        // Get kategori_id from nama
        $kategori_map = [
            'TWK' => 1,
            'TIU' => 2,
            'TKP' => 3,
            'TPA' => 4,
            'PSIKOLOGIS' => 5
        ];

        $kategori_id = $kategori_map[$kategori_nama] ?? null;

        if (!$kategori_id) {
            echo json_encode([
                'success' => false,
                'error' => 'Invalid category'
            ]);
            return;
        }

        $sql = "SELECT id, nama_topik, deskripsi, urutan FROM topik_pelajaran WHERE kategori_id = ? ORDER BY urutan";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $kategori_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $topics = [];
        while ($row = $result->fetch_assoc()) {
            $topics[] = [
                'id' => $row['id'],
                'nama' => $row['nama_topik'],
                'deskripsi' => $row['deskripsi'],
                'urutan' => $row['urutan']
            ];
        }

        echo json_encode([
            'success' => true,
            'data' => $topics
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}

function getExamTypes() {
    global $conn;
    
    $sql = "SELECT id, code, name, description, icon, color, is_active, 
                   passing_grade_twk, passing_grade_tiu, passing_grade_tkp, 
                   passing_grade_tpa, passing_grade_psikologis, passing_grade_total,
                   durasi_menit, jumlah_soal
            FROM exam_types 
            WHERE is_active = TRUE 
            ORDER BY id";
    
    $result = $conn->query($sql);
    
    $types = [];
    while ($row = $result->fetch_assoc()) {
        $types[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $types,
        'count' => count($types)
    ]);
}

function getSertifikat() {
    global $conn;
    
    $hasil_id = intval($_GET['hasil_id'] ?? 0);
    
    if ($hasil_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid hasil ID']);
        return;
    }
    
    $sql = "SELECT s.*, hu.nilai_total, hu.status_lulus FROM sertifikat s JOIN hasil_ujian hu ON s.hasil_id = hu.id WHERE s.hasil_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $hasil_id);
    $stmt->execute();
    $cert = $stmt->get_result()->fetch_assoc();
    
    if ($cert) {
        echo json_encode(['success' => true, 'data' => $cert]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Certificate not found']);
    }
}

function getRiwayatUjian() {
    global $conn;
    
    $user = requireAuth();
    $user_id = $user['id'];
    $is_admin = ($user['role'] === 'admin');
    
    $limit = intval($_GET['limit'] ?? 10);
    $page = intval($_GET['page'] ?? 1);
    $offset = ($page - 1) * $limit;
    
    if ($is_admin) {
        // Admin sees all users' records
        $stmt_count = $conn->prepare("SELECT COUNT(*) as total FROM hasil_ujian");
        $stmt_count->execute();
        $total = $stmt_count->get_result()->fetch_assoc()['total'];
        
        $sql = "SELECT h.*, u.nama_lengkap FROM hasil_ujian h LEFT JOIN users u ON h.user_id = u.id ORDER BY h.tanggal_ujian DESC LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $limit, $offset);
    } else {
        // Regular user sees only their own records
        $stmt_count = $conn->prepare("SELECT COUNT(*) as total FROM hasil_ujian WHERE user_id = ?");
        $stmt_count->bind_param("i", $user_id);
        $stmt_count->execute();
        $total = $stmt_count->get_result()->fetch_assoc()['total'];
        
        $sql = "SELECT * FROM hasil_ujian WHERE user_id = ? ORDER BY tanggal_ujian DESC LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $user_id, $limit, $offset);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $riwayat = [];
    while ($row = $result->fetch_assoc()) {
        $riwayat[] = $row;
    }
    
    $total_pages = ceil($total / $limit);
    
    echo json_encode([
        'success' => true,
        'data' => $riwayat,
        'pagination' => [
            'total' => $total,
            'per_page' => $limit,
            'current_page' => $page,
            'total_pages' => $total_pages
        ]
    ]);
}

function getStatistik() {
    global $conn;
    
    $user = requireAuth();
    $user_id = $user['id'];
    $is_admin = ($user['role'] === 'admin');
    
    // Fixed categories that exist in hasil_ujian table
    $categories = ['TWK', 'TIU', 'TKP'];
    
    if ($is_admin) {
        // Admin gets global statistics (all users)
        $stmt_total = $conn->prepare("SELECT COUNT(*) as total FROM hasil_ujian");
        $stmt_total->execute();
        $total_exams = $stmt_total->get_result()->fetch_assoc()['total'];
        
        // Calculate average for total score
        $stmt_avg_total = $conn->prepare("SELECT AVG(nilai_total) as avg_total FROM hasil_ujian");
        $stmt_avg_total->execute();
        $avg_total = $stmt_avg_total->get_result()->fetch_assoc()['avg_total'] ?? 0;
        
        // Calculate average for each category
        $stmt_avg = $conn->prepare("SELECT AVG(nilai_twk) as avg_twk, AVG(nilai_tiu) as avg_tiu, AVG(nilai_tkp) as avg_tkp FROM hasil_ujian");
        $stmt_avg->execute();
        $avg_scores = $stmt_avg->get_result()->fetch_assoc();
        
        $category_averages = [
            'twk' => round($avg_scores['avg_twk'] ?? 0, 2),
            'tiu' => round($avg_scores['avg_tiu'] ?? 0, 2),
            'tkp' => round($avg_scores['avg_tkp'] ?? 0, 2)
        ];
        
        $stmt_pass = $conn->prepare("SELECT COUNT(*) as passed FROM hasil_ujian WHERE status_lulus = 'LULUS'");
        $stmt_pass->execute();
        $passed = $stmt_pass->get_result()->fetch_assoc()['passed'];
    } else {
        // Regular user sees only their own stats
        $stmt_total = $conn->prepare("SELECT COUNT(*) as total FROM hasil_ujian WHERE user_id = ?");
        $stmt_total->bind_param("i", $user_id);
        $stmt_total->execute();
        $total_exams = $stmt_total->get_result()->fetch_assoc()['total'];
        
        // Calculate average for total score
        $stmt_avg_total = $conn->prepare("SELECT AVG(nilai_total) as avg_total FROM hasil_ujian WHERE user_id = ?");
        $stmt_avg_total->bind_param("i", $user_id);
        $stmt_avg_total->execute();
        $avg_total = $stmt_avg_total->get_result()->fetch_assoc()['avg_total'] ?? 0;
        
        // Calculate average for each category
        $stmt_avg = $conn->prepare("SELECT AVG(nilai_twk) as avg_twk, AVG(nilai_tiu) as avg_tiu, AVG(nilai_tkp) as avg_tkp FROM hasil_ujian WHERE user_id = ?");
        $stmt_avg->bind_param("i", $user_id);
        $stmt_avg->execute();
        $avg_scores = $stmt_avg->get_result()->fetch_assoc();
        
        $category_averages = [
            'twk' => round($avg_scores['avg_twk'] ?? 0, 2),
            'tiu' => round($avg_scores['avg_tiu'] ?? 0, 2),
            'tkp' => round($avg_scores['avg_tkp'] ?? 0, 2)
        ];
        
        $stmt_pass = $conn->prepare("SELECT COUNT(*) as passed FROM hasil_ujian WHERE user_id = ? AND status_lulus = 'LULUS'");
        $stmt_pass->bind_param("i", $user_id);
        $stmt_pass->execute();
        $passed = $stmt_pass->get_result()->fetch_assoc()['passed'];
    }
    
    $pass_rate = $total_exams > 0 ? ($passed / $total_exams) * 100 : 0;
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_exams' => $total_exams,
            'average_scores' => array_merge(['total' => round($avg_total, 2)], $category_averages),
            'categories' => $categories,
            'pass_rate' => round($pass_rate, 2)
        ]
    ]);
}

function getExamResult() {
    global $conn;
    
    $user = requireAuth();
    $result_id = intval($_GET['id'] ?? 0);
    
    if ($result_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid result ID']);
        return;
    }
    
    // Get exam result
    $sql = "SELECT * FROM hasil_ujian WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $result_id, $user['id']);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Result not found']);
        return;
    }
    
    echo json_encode(['success' => true, 'data' => $result]);
}

function getQuestionAnalysis() {
    global $conn;
    
    $user = requireAuth();
    $result_id = intval($_GET['result_id'] ?? 0);
    
    if ($result_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid result ID']);
        return;
    }
    
    // Get exam result
    $sql = "SELECT * FROM hasil_ujian WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $result_id, $user['id']);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Result not found']);
        return;
    }
    
    // Parse answers
    $jawaban_peserta = json_decode($result['jawaban_peserta'], true);
    
    // Get categories
    $categories = [];
    $sql_cat = "SELECT k.id, k.nama_kategori, COUNT(s.id) as jumlah_soal 
                FROM kategori_soal k 
                LEFT JOIN soal s ON s.kategori_id = k.id 
                GROUP BY k.id, k.nama_kategori";
    $result_cat = $conn->query($sql_cat);
    while ($row = $result_cat->fetch_assoc()) {
        $categories[] = $row;
    }
    
    // Analyze answers
    $unanswered = [];
    $wrong_answers = [];
    $kategori_stats = [];
    
    foreach ($jawaban_peserta as $item) {
        $soal_id = intval($item['soal_id']);
        $jawaban = strtoupper(trim($item['jawaban'] ?? ''));
        
        // Get question details
        $sql = "SELECT s.*, k.nama_kategori FROM soal s 
                LEFT JOIN kategori_soal k ON s.kategori_id = k.id 
                WHERE s.id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $soal_id);
        $stmt->execute();
        $soal = $stmt->get_result()->fetch_assoc();
        
        if ($soal) {
            $kategori = $soal['nama_kategori'] ?? 'Uncategorized';
            
            // Track unanswered
            if (empty($jawaban)) {
                $unanswered[] = [
                    'soal_id' => $soal_id,
                    'kategori' => $kategori,
                    'materi' => $soal['materi'] ?? '-'
                ];
            }
            
            // Track wrong answers
            if (!empty($jawaban) && $jawaban !== $soal['jawaban_benar']) {
                $wrong_answers[] = [
                    'soal_id' => $soal_id,
                    'kategori' => $kategori,
                    'materi' => $soal['materi'] ?? '-',
                    'jawaban_peserta' => $jawaban,
                    'jawaban_benar' => $soal['jawaban_benar']
                ];
                
                // Update category stats
                if (!isset($kategori_stats[$kategori])) {
                    $kategori_stats[$kategori] = 0;
                }
                $kategori_stats[$kategori]++;
            }
        }
    }
    
    // Generate recommendations based on wrong answers
    $recommendations = [];
    foreach ($kategori_stats as $kategori => $count) {
        $recommendations[] = [
            'kategori' => $kategori,
            'jumlah_salah' => $count,
            'rekomendasi' => "Fokus belajar materi $kategori. Anda memiliki $count jawaban salah pada kategori ini.",
            'link_materi' => 'materi.html'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'categories' => $categories,
            'unanswered' => $unanswered,
            'wrong_answers' => $wrong_answers,
            'recommendations' => $recommendations
        ]
    ]);
}

function generatePracticeQuestions() {
    global $conn;
    
    $user = requireAuth();
    $result_id = intval($_GET['result_id'] ?? 0);
    
    if ($result_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid result ID']);
        return;
    }
    
    // Get wrong answers from the exam
    $sql = "SELECT s.*, k.nama_kategori FROM hasil_ujian h 
            LEFT JOIN kategori_soal k ON 1=1
            WHERE h.id = ?";
    // This is a placeholder - actual implementation would parse jawaban_peserta
    // and generate questions based on wrong answers
    
    // For now, return a simple response
    echo json_encode([
        'success' => true,
        'data' => [
            'practice_id' => 'PRACTICE_' . time(),
            'questions_count' => 10,
            'message' => 'Practice questions generated based on your weak areas'
        ]
    ]);
}

function createQuestion() {
    global $conn;

    // Set header to ensure JSON response
    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);

        $kategori_map = [
            'TWK' => 1,
            'TIU' => 2,
            'TKP' => 3,
            'TPA' => 4,
            'PSIKOLOGIS' => 5
        ];

        $kategori = $data['kategori'] ?? 'TWK';
        // Handle both numeric ID and string name
        if (is_numeric($kategori)) {
            $kategori_id = intval($kategori);
        } else {
            $kategori_id = $kategori_map[$kategori] ?? 1;
        }

        $pertanyaan = $conn->real_escape_string($data['pertanyaan'] ?? '');
        $opsi_a = $conn->real_escape_string($data['opsi_a'] ?? '');
        $opsi_b = $conn->real_escape_string($data['opsi_b'] ?? '');
        $opsi_c = $conn->real_escape_string($data['opsi_c'] ?? '');
        $opsi_d = $conn->real_escape_string($data['opsi_d'] ?? '');
        $opsi_e = $conn->real_escape_string($data['opsi_e'] ?? '');
        $jawaban_benar = $conn->real_escape_string($data['jawaban_benar'] ?? '');
        $pembahasan = $conn->real_escape_string($data['pembahasan'] ?? '');
        $topic_nama = $data['topic'] ?? '';

        $sql = "INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issssssss", $kategori_id, $pertanyaan, $opsi_a, $opsi_b, $opsi_c, $opsi_d, $opsi_e, $jawaban_benar, $pembahasan);

        if ($stmt->execute()) {
            $soal_id = $conn->insert_id;

            // If topic is provided, save the relationship
            if (!empty($topic_nama)) {
                // Get topic_id from topic name
                $topic_sql = "SELECT id FROM topik_pelajaran WHERE nama_topik = ? AND kategori_id = ?";
                $topic_stmt = $conn->prepare($topic_sql);
                $topic_stmt->bind_param("si", $topic_nama, $kategori_id);
                $topic_stmt->execute();
                $topic_result = $topic_stmt->get_result();
                $topic_row = $topic_result->fetch_assoc();

                if ($topic_row) {
                    $topic_id = $topic_row['id'];

                    // Save to soal_topik junction table
                    $junction_sql = "INSERT INTO soal_topik (soal_id, topik_id) VALUES (?, ?)";
                    $junction_stmt = $conn->prepare($junction_sql);
                    $junction_stmt->bind_param("ii", $soal_id, $topic_id);
                    $junction_stmt->execute();
                }
            }

            echo json_encode(['success' => true, 'id' => $soal_id]);
        } else {
            echo json_encode(['success' => false, 'error' => $conn->error]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function updateQuestion() {
    global $conn;

    $data = json_decode(file_get_contents('php://input'), true);

    $id = intval($data['id'] ?? 0);

    $kategori_map = [
        'TWK' => 1,
        'TIU' => 2,
        'TKP' => 3,
        'TPA' => 4,
        'PSIKOLOGIS' => 5
    ];

    $kategori = $data['kategori'] ?? 'TWK';
    // Handle both numeric ID and string name
    if (is_numeric($kategori)) {
        $kategori_id = intval($kategori);
    } else {
        $kategori_id = $kategori_map[$kategori] ?? 1;
    }

    $pertanyaan = $conn->real_escape_string($data['pertanyaan'] ?? '');
    $opsi_a = $conn->real_escape_string($data['opsi_a'] ?? '');
    $opsi_b = $conn->real_escape_string($data['opsi_b'] ?? '');
    $opsi_c = $conn->real_escape_string($data['opsi_c'] ?? '');
    $opsi_d = $conn->real_escape_string($data['opsi_d'] ?? '');
    $opsi_e = $conn->real_escape_string($data['opsi_e'] ?? '');
    $jawaban_benar = $conn->real_escape_string($data['jawaban_benar'] ?? '');
    $pembahasan = $conn->real_escape_string($data['pembahasan'] ?? '');
    
    $sql = "UPDATE soal SET kategori_id=?, pertanyaan=?, opsi_a=?, opsi_b=?, opsi_c=?, opsi_d=?, opsi_e=?, jawaban_benar=?, pembahasan=? 
            WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issssssssi", $kategori_id, $pertanyaan, $opsi_a, $opsi_b, $opsi_c, $opsi_d, $opsi_e, $jawaban_benar, $pembahasan, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function deleteQuestion() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    
    $sql = "DELETE FROM soal WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function listQuestions() {
    global $conn;
    
    $kategori = $_GET['kategori'] ?? '';
    $search = $_GET['search'] ?? '';
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;
    
    $kategori_map = [
        'TWK' => 1,
        'TIU' => 2,
        'TKP' => 3,
        'TPA' => 4,
        'PSIKOLOGIS' => 5
    ];

    $where = "WHERE 1=1";
    $params = [];
    $types = "";

    // Handle both numeric ID (from dropdown) and string name (from old code)
    if ($kategori) {
        $kategori_id = null;
        if (is_numeric($kategori)) {
            $kategori_id = intval($kategori);
        } elseif (isset($kategori_map[$kategori])) {
            $kategori_id = $kategori_map[$kategori];
        }
        if ($kategori_id) {
            $where .= " AND kategori_id = ?";
            $params[] = $kategori_id;
            $types .= "i";
        }
    }
    
    if ($search) {
        $where .= " AND pertanyaan LIKE ?";
        $params[] = "%$search%";
        $types .= "s";
    }
    
    // Get total count
    $sql_count = "SELECT COUNT(*) as total FROM soal $where";
    $stmt_count = $conn->prepare($sql_count);
    if (!empty($params)) {
        $stmt_count->bind_param($types, ...$params);
    }
    $stmt_count->execute();
    $total = $stmt_count->get_result()->fetch_assoc()['total'];
    
    // Get questions
    $sql = "SELECT s.*, k.nama_kategori FROM soal s JOIN kategori_soal k ON s.kategori_id = k.id 
            $where ORDER BY s.id DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $questions,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
}

function getPaket() {
    global $conn;
    
    $sql = "SELECT p.*, k.nama_kategori 
            FROM paket_tryout p 
            LEFT JOIN kategori_soal k ON p.kategori_id = k.id 
            WHERE p.is_active = 1 
            ORDER BY p.id";
    
    $result = $conn->query($sql);
    $paket = [];
    
    while ($row = $result->fetch_assoc()) {
        $paket[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $paket
    ]);
}

function getSoalByPaket() {
    global $conn;
    
    $paket_id = intval($_GET['paket_id'] ?? 0);
    
    if ($paket_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid paket ID']);
        return;
    }
    
    // Get paket info
    $sql_paket = "SELECT * FROM paket_tryout WHERE id = ?";
    $stmt_paket = $conn->prepare($sql_paket);
    $stmt_paket->bind_param("i", $paket_id);
    $stmt_paket->execute();
    $result_paket = $stmt_paket->get_result();
    $paket = $result_paket->fetch_assoc();
    $stmt_paket->close();
    
    if (!$paket) {
        echo json_encode(['success' => false, 'error' => 'Paket not found']);
        return;
    }
    
    // Get questions based on paket using prepared statements
    if ($paket['kategori_id']) {
        $sql = "SELECT s.*, k.nama_kategori 
                FROM soal s 
                JOIN kategori_soal k ON s.kategori_id = k.id 
                WHERE s.kategori_id = ? 
                ORDER BY RAND() 
                LIMIT ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $paket['kategori_id'], $paket['total_soal']);
    } else {
        // Random from all categories
        $sql = "SELECT s.*, k.nama_kategori 
                FROM soal s 
                JOIN kategori_soal k ON s.kategori_id = k.id 
                ORDER BY RAND() 
                LIMIT ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $paket['total_soal']);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $soal = [];
    $nomor = 1;
    
    while ($row = $result->fetch_assoc()) {
        $row['nomor'] = $nomor++;
        $soal[] = $row;
    }
    
    // Track appearance for all questions
    foreach ($soal as $s) {
        trackQuestionAppearanceDB($conn, $s['id']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $soal,
        'paket' => $paket
    ]);
}

function trackQuestionAppearanceDB($conn, $soal_id) {
    $sql = "INSERT INTO soal_frequency (soal_id, muncul_count) 
            VALUES ($soal_id, 1) 
            ON DUPLICATE KEY UPDATE 
            muncul_count = muncul_count + 1, 
            last_seen = CURRENT_TIMESTAMP";
    $conn->query($sql);
}

function trackQuestionAppearance() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $soal_id = intval($data['soal_id'] ?? 0);
    $is_correct = $data['is_correct'] ?? false;
    
    if ($soal_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid soal ID']);
        return;
    }
    
    // Track appearance
    $sql = "INSERT INTO soal_frequency (soal_id, muncul_count, benar_count, salah_count) 
            VALUES ($soal_id, 1, " . ($is_correct ? 1 : 0) . ", " . ($is_correct ? 0 : 1) . ") 
            ON DUPLICATE KEY UPDATE 
            muncul_count = muncul_count + 1,
            " . ($is_correct ? "benar_count = benar_count + 1" : "salah_count = salah_count + 1") . ",
            last_seen = CURRENT_TIMESTAMP";
    
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getSoalStatistics() {
    global $conn;
    
    $kategori = $_GET['kategori'] ?? '';
    $limit = intval($_GET['limit'] ?? 50);
    
    $where = "";
    if ($kategori) {
        $kategori_map = [
            'TWK' => 1,
            'TIU' => 2,
            'TKP' => 3,
            'TPA' => 4,
            'PSIKOLOGIS' => 5
        ];
        // Handle both numeric ID and string name
        if (is_numeric($kategori)) {
            $kategori_id = intval($kategori);
            $where = "WHERE s.kategori_id = " . $kategori_id;
        } elseif (isset($kategori_map[$kategori])) {
            $where = "WHERE s.kategori_id = " . $kategori_map[$kategori];
        }
    }
    
    $sql = "SELECT s.id, s.pertanyaan, k.nama_kategori, 
            COALESCE(sf.muncul_count, 0) as muncul_count,
            COALESCE(sf.benar_count, 0) as benar_count,
            COALESCE(sf.salah_count, 0) as salah_count,
            CASE 
                WHEN COALESCE(sf.muncul_count, 0) > 0 
                THEN ROUND((COALESCE(sf.benar_count, 0) / COALESCE(sf.muncul_count, 0)) * 100, 2)
                ELSE 0 
            END as persen_benar
            FROM soal s
            JOIN kategori_soal k ON s.kategori_id = k.id
            LEFT JOIN soal_frequency sf ON s.id = sf.soal_id
            $where
            ORDER BY muncul_count DESC, persen_benar ASC
            LIMIT $limit";
    
    $result = $conn->query($sql);
    $statistics = [];
    
    while ($row = $result->fetch_assoc()) {
        $statistics[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $statistics
    ]);
}

function getBahanPelajaran() {
    global $conn;
    
    $soal_id = intval($_GET['soal_id'] ?? 0);
    
    if ($soal_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid soal ID']);
        return;
    }
    
    $sql = "SELECT * FROM v_bahan_pelajaran_lengkap WHERE soal_id = ? ORDER BY urutan";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $soal_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $bahan = [];
    
    while ($row = $result->fetch_assoc()) {
        $bahan[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $bahan
    ]);
}

function getAllBahanPelajaran() {
    global $conn;

    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    $kategori_id = intval($_GET['kategori_id'] ?? 0);

    // Debug logging
    error_log("getAllBahanPelajaran - kategori_id: $kategori_id, page: $page, limit: $limit");

    $where = "";
    $params = [];
    $types = "";

    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = ?";
        $params[] = $kategori_id;
        $types .= "i";
    }

    // Get total count
    $count_sql = "SELECT COUNT(*) as total FROM bahan_pelajaran $where";
    if ($kategori_id > 0) {
        $stmt = $conn->prepare($count_sql);
        $stmt->bind_param("i", $kategori_id);
        $stmt->execute();
        $count_result = $stmt->get_result();
    } else {
        $count_result = $conn->query($count_sql);
    }
    $total = $count_result->fetch_assoc()['total'];

    $sql = "SELECT * FROM bahan_pelajaran $where ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("SQL Prepare Error: " . $conn->error);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $conn->error]);
        return;
    }

    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) {
        error_log("SQL Execute Error: " . $stmt->error);
        echo json_encode(['success' => false, 'error' => 'Query error: ' . $stmt->error]);
        return;
    }

    $result = $stmt->get_result();
    $bahan = [];

    while ($row = $result->fetch_assoc()) {
        $bahan[] = $row;
    }

    $total_pages = ceil($total / $limit);

    error_log("getAllBahanPelajaran - Found " . count($bahan) . " items, total: $total");

    echo json_encode([
        'success' => true,
        'data' => $bahan,
        'pagination' => [
            'total' => $total,
            'total_pages' => $total_pages,
            'current_page' => $page,
            'limit' => $limit
        ]
    ]);
}

function getAllSoal() {
    global $conn;

    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 50);
    $offset = ($page - 1) * $limit;

    // Get total count
    $count_sql = "SELECT COUNT(*) as total FROM soal";
    $count_result = $conn->query($count_sql);
    $total = $count_result->fetch_assoc()['total'];

    $sql = "SELECT s.*, k.nama_kategori
            FROM soal s
            LEFT JOIN kategori_soal k ON s.kategori_id = k.id
            ORDER BY s.id LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    $soal = [];

    while ($row = $result->fetch_assoc()) {
        $soal[] = $row;
    }

    $total_pages = ceil($total / $limit);

    echo json_encode([
        'success' => true,
        'data' => $soal,
        'pagination' => [
            'total' => $total,
            'total_pages' => $total_pages,
            'current_page' => $page,
            'limit' => $limit
        ]
    ]);
}

function saveBahanPelajaran() {
    global $conn;
    
    requireAdmin();
    
    $id = intval($_POST['id'] ?? 0);
    $soal_id = intval($_POST['soal_id'] ?? 0);
    $kategori_id = intval($_POST['kategori_id'] ?? 0);
    $judul = $conn->real_escape_string($_POST['judul'] ?? '');
    $konten = $conn->real_escape_string($_POST['konten'] ?? '');
    $tipe = $conn->real_escape_string($_POST['tipe'] ?? 'teks');
    $url = $conn->real_escape_string($_POST['url'] ?? '');
    $urutan = intval($_POST['urutan'] ?? 0);
    
    // Handle file upload with security
    $file_path = '';
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['file'];
        $file_size = $file['size'];
        $file_tmp = $file['tmp_name'];
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        // Security: Whitelist allowed file types
        $allowed_extensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'mp4', 'webm'];
        if (!in_array($file_ext, $allowed_extensions)) {
            echo json_encode(['success' => false, 'error' => 'File type not allowed']);
            return;
        }
        
        // Security: Limit file size (max 10MB)
        $max_size = 10 * 1024 * 1024;
        if ($file_size > $max_size) {
            echo json_encode(['success' => false, 'error' => 'File size exceeds maximum limit (10MB)']);
            return;
        }
        
        // Security: Sanitize file name
        $file_name = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', basename($file['name']));
        
        // Security: Verify it's a real file upload
        if (!is_uploaded_file($file_tmp)) {
            echo json_encode(['success' => false, 'error' => 'Invalid file upload']);
            return;
        }
        
        // Determine upload directory based on file type
        $upload_dir = '../uploads/bahan_pelajaran/';
        switch ($tipe) {
            case 'pdf':
                $upload_dir .= 'pdf/';
                break;
            case 'video':
                $upload_dir .= 'video/';
                break;
            case 'teks':
                $upload_dir .= 'text/';
                break;
            default:
                $upload_dir .= 'other/';
        }
        
        // Create directory if not exists
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        // Move file
        if (move_uploaded_file($file_tmp, $upload_dir . $file_name)) {
            $file_path = str_replace('../', '', $upload_dir) . $file_name;
        }
    }
    
    if (empty($judul)) {
        echo json_encode(['success' => false, 'error' => 'Judul wajib diisi']);
        return;
    }
    
    // For large content (> 1MB), store as file
    if (strlen($konten) > 1048576 && empty($file_path)) {
        $file_name = 'text_' . time() . '.txt';
        $upload_dir = '../uploads/bahan_pelajaran/text/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        file_put_contents($upload_dir . $file_name, $konten);
        $file_path = str_replace('../', '', $upload_dir) . $file_name;
        $konten = ''; // Clear konten since it's now in file
    }
    
    // INSERT or UPDATE based on id
    if ($id > 0) {
        // UPDATE existing record
        $sql = "UPDATE bahan_pelajaran SET soal_id=?, kategori_id=?, judul=?, konten=?, tipe=?, url=?, file_path=COALESCE(NULLIF(?, ''), file_path), urutan=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iisssssii", $soal_id, $kategori_id, $judul, $konten, $tipe, $url, $file_path, $urutan, $id);
    } else {
        // INSERT new record
        $sql = "INSERT INTO bahan_pelajaran (soal_id, kategori_id, judul, konten, tipe, url, file_path, urutan)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iisssssi", $soal_id, $kategori_id, $judul, $konten, $tipe, $url, $file_path, $urutan);
    }

    $result = $stmt->execute();
    $stmt->close();

    if ($result) {
        echo json_encode(['success' => true, 'id' => ($id > 0) ? $id : $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getRekomendasiBelajar() {
    global $conn;

    $user = requireAuth();
    $user_id = $user['id'];
    $sesi_id = intval($_GET['sesi_id'] ?? 0);
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;

    if ($sesi_id > 0) {
        // Get total count
        $count_sql = "SELECT COUNT(*) as total FROM v_rekomendasi_belajar WHERE sesi_id = ?";
        $stmt = $conn->prepare($count_sql);
        $stmt->bind_param('i', $sesi_id);
        $stmt->execute();
        $count_result = $stmt->get_result();
        $total = $count_result->fetch_assoc()['total'];
        $stmt->close();

        $sql = "SELECT * FROM v_rekomendasi_belajar WHERE sesi_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iii', $sesi_id, $limit, $offset);
    } else {
        // Get total count
        $count_sql = "SELECT COUNT(*) as total FROM v_rekomendasi_belajar WHERE user_id = ?";
        $stmt = $conn->prepare($count_sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $count_result = $stmt->get_result();
        $total = $count_result->fetch_assoc()['total'];
        $stmt->close();

        $sql = "SELECT * FROM v_rekomendasi_belajar WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iii', $user_id, $limit, $offset);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $rekomendasi = [];

    while ($row = $result->fetch_assoc()) {
        $rekomendasi[] = $row;
    }

    $total_pages = ceil($total / $limit);

    echo json_encode([
        'success' => true,
        'data' => $rekomendasi,
        'pagination' => [
            'total' => $total,
            'total_pages' => $total_pages,
            'current_page' => $page,
            'limit' => $limit
        ]
    ]);
}

function generateRekomendasi() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $sesi_id = intval($data['sesi_id'] ?? 0);
    $jawaban = $data['jawaban'] ?? [];
    $ragu_questions = $data['ragu_questions'] ?? [];
    
    if ($sesi_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid sesi ID']);
        return;
    }
    
    // Get session info
    $sql_sesi = "SELECT * FROM sesi_ujian WHERE id = $sesi_id";
    $result_sesi = $conn->query($sql_sesi);
    $sesi = $result_sesi->fetch_assoc();
    
    if (!$sesi) {
        echo json_encode(['success' => false, 'error' => 'Session not found']);
        return;
    }
    
    $user_id = $sesi['user_id'];
    $generated = 0;
    
    // Get all questions in the session
    $sql_soal = "SELECT * FROM jawaban_user WHERE hasil_id = ?";
    $stmt_soal = $conn->prepare($sql_soal);
    $stmt_soal->bind_param("i", $sesi['hasil_id']);
    $stmt_soal->execute();
    $result_soal = $stmt_soal->get_result();
    
    while ($row_soal = $result_soal->fetch_assoc()) {
        $soal_id = $row_soal['soal_id'];
        $jawaban_user = $row_soal['jawaban'];
        
        // Get question correct answer
        $sql_q = "SELECT jawaban_benar FROM soal WHERE id = ?";
        $stmt_q = $conn->prepare($sql_q);
        $stmt_q->bind_param("i", $soal_id);
        $stmt_q->execute();
        $result_q = $stmt_q->get_result();
        $q = $result_q->fetch_assoc();
        $stmt_q->close();
        
        if (!$q) continue;
        
        $is_correct = ($jawaban_user === $q['jawaban_benar']);
        $is_ragu = in_array($soal_id, $ragu_questions);
        
        $alasan = null;
        if (!$is_correct) {
            $alasan = 'salah';
        } elseif ($is_ragu) {
            $alasan = 'ragu';
        } else {
            continue; // Skip if correct and not doubtful
        }
        
        // Check if recommendation already exists
        $sql_check = "SELECT id FROM rekomendasi_belajar 
                     WHERE sesi_id = $sesi_id AND soal_id = $soal_id";
        $result_check = $conn->query($sql_check);
        
        if ($result_check->num_rows === 0) {
            $sql_insert = "INSERT INTO rekomendasi_belajar (user_id, sesi_id, soal_id, alasan)
                          VALUES ($user_id, $sesi_id, $soal_id, '$alasan')";
            $conn->query($sql_insert);
            $generated++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'generated' => $generated
    ]);
}

function updateRekomendasiStatus() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $rekomendasi_id = intval($data['id'] ?? 0);
    $status = $conn->real_escape_string($data['status'] ?? 'pending');
    
    if ($rekomendasi_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid ID']);
        return;
    }
    
    $sql = "UPDATE rekomendasi_belajar SET status = '$status'";
    if ($status === 'dipelajari') {
        $sql .= ", dipelajari_pada = CURRENT_TIMESTAMP";
    }
    $sql .= " WHERE id = $rekomendasi_id";
    
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function analyzeWeakness() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $sesi_id = intval($data['sesi_id'] ?? 0);
    
    if ($sesi_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid sesi ID']);
        return;
    }
    
    // Get session info
    $sql_sesi = "SELECT * FROM sesi_ujian WHERE id = ?";
    $stmt_sesi = $conn->prepare($sql_sesi);
    $stmt_sesi->bind_param("i", $sesi_id);
    $stmt_sesi->execute();
    $result_sesi = $stmt_sesi->get_result();
    $sesi = $result_sesi->fetch_assoc();
    $stmt_sesi->close();
    
    if (!$sesi) {
        echo json_encode(['success' => false, 'error' => 'Session not found']);
        return;
    }
    
    $user_id = $sesi['user_id'];
    
    // Get all answers in the session
    $sql_jawaban = "SELECT ju.*, s.kategori_id, s.jawaban_benar 
                    FROM jawaban_user ju
                    JOIN soal s ON ju.soal_id = s.id
                    WHERE ju.hasil_id = " . $sesi['hasil_id'];
    $result_jawaban = $conn->query($sql_jawaban);
    
    // Group by category
    $kategori_stats = [];
    while ($row = $result_jawaban->fetch_assoc()) {
        $kategori_id = $row['kategori_id'];
        if (!isset($kategori_stats[$kategori_id])) {
            $kategori_stats[$kategori_id] = [
                'total' => 0,
                'benar' => 0,
                'salah' => 0,
                'kosong' => 0
            ];
        }
        $kategori_stats[$kategori_id]['total']++;
        
        if ($row['jawaban'] === $row['jawaban_benar']) {
            $kategori_stats[$kategori_id]['benar']++;
        } elseif ($row['jawaban']) {
            $kategori_stats[$kategori_id]['salah']++;
        } else {
            $kategori_stats[$kategori_id]['kosong']++;
        }
    }
    
    // Analyze and save for each category
    foreach ($kategori_stats as $kategori_id => $stats) {
        $total = $stats['total'];
        $benar = $stats['benar'];
        $salah = $stats['salah'];
        $kosong = $stats['kosong'];
        
        if ($total === 0) continue;
        
        $persen_benar = ($benar / $total) * 100;
        
        // Determine weakness level
        if ($persen_benar >= 80) {
            $tingkat = 'rendah';
            $rekomendasi = 'Sudah baik, pertahankan performa.';
        } elseif ($persen_benar >= 60) {
            $tingkat = 'sedang';
            $rekomendasi = 'Perlu latihan lebih banyak untuk meningkatkan pemahaman.';
        } elseif ($persen_benar >= 40) {
            $tingkat = 'tinggi';
            $rekomendasi = 'Kelemahan cukup signifikan, fokus pada materi kategori ini.';
        } else {
            $tingkat = 'sangat_tinggi';
            $rekomendasi = 'Kelemahan sangat tinggi, prioritaskan belajar kategori ini.';
        }
        
        // Check if analysis already exists
        $sql_check = "SELECT id FROM analisis_kelemahan 
                      WHERE sesi_id = $sesi_id AND kategori_id = $kategori_id";
        $result_check = $conn->query($sql_check);
        
        if ($result_check->num_rows === 0) {
            $sql_insert = "INSERT INTO analisis_kelemahan 
                          (user_id, sesi_id, kategori_id, total_soal, benar, salah, kosong, persen_benar, tingkat_kelemahan, rekomendasi)
                          VALUES ($user_id, $sesi_id, $kategori_id, $total, $benar, $salah, $kosong, $persen_benar, '$tingkat', '$rekomendasi')";
            $conn->query($sql_insert);
        } else {
            $sql_update = "UPDATE analisis_kelemahan 
                          SET total_soal = $total, benar = $benar, salah = $salah, kosong = $kosong, 
                              persen_benar = $persen_benar, tingkat_kelemahan = '$tingkat', rekomendasi = '$rekomendasi'
                          WHERE sesi_id = $sesi_id AND kategori_id = $kategori_id";
            $conn->query($sql_update);
        }
    }
    
    echo json_encode(['success' => true, 'analyzed' => count($kategori_stats)]);
}

function getRanking() {
    global $conn;
    
    $kategori = $_GET['kategori'] ?? 'total';
    $limit = intval($_GET['limit'] ?? 50);
    $page = intval($_GET['page'] ?? 1);
    $offset = ($page - 1) * $limit;
    
    $order_field = 'nilai_total';
    // Handle both numeric ID (1,2,3) and string name (TWK,TIU,TKP)
    if ($kategori === 'TWK' || $kategori === '1') $order_field = 'nilai_twk';
    elseif ($kategori === 'TIU' || $kategori === '2') $order_field = 'nilai_tiu';
    elseif ($kategori === 'TKP' || $kategori === '3') $order_field = 'nilai_tkp';
    
    // Get total count
    $sql_count = "SELECT COUNT(*) as total 
                  FROM hasil_ujian h
                  LEFT JOIN leaderboard_optout lo ON h.nama_peserta = lo.nama_peserta
                  WHERE lo.nama_peserta IS NULL";
    $result_count = $conn->query($sql_count);
    $total = $result_count->fetch_assoc()['total'];
    
    // Exclude opted-out users
    $sql = "SELECT h.* 
            FROM hasil_ujian h
            LEFT JOIN leaderboard_optout lo ON h.nama_peserta = lo.nama_peserta
            WHERE lo.nama_peserta IS NULL
            ORDER BY $order_field DESC, tanggal_ujian ASC
            LIMIT $limit OFFSET $offset";
    $result = $conn->query($sql);
    $ranking = [];
    
    while ($row = $result->fetch_assoc()) {
        $ranking[] = $row;
    }
    
    $total_pages = ceil($total / $limit);
    
    echo json_encode([
        'success' => true,
        'data' => $ranking,
        'pagination' => [
            'total' => $total,
            'per_page' => $limit,
            'current_page' => $page,
            'total_pages' => $total_pages
        ]
    ]);
}

function getTipsTricks() {
    global $conn;
    
    $kategori_id = intval($_GET['kategori_id'] ?? 0);
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
    // Get total count
    if ($kategori_id > 0) {
        $count_sql = "SELECT COUNT(*) as total FROM tips_tricks WHERE aktif = 1 AND kategori_id = ?";
        $stmt = $conn->prepare($count_sql);
        $stmt->bind_param("i", $kategori_id);
        $stmt->execute();
        $count_result = $stmt->get_result();
        $total = $count_result->fetch_assoc()['total'];
        $stmt->close();
        
        $sql = "SELECT * FROM tips_tricks WHERE aktif = 1 AND kategori_id = ? ORDER BY prioritas DESC, created_at DESC LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $kategori_id, $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
    } else {
        $count_sql = "SELECT COUNT(*) as total FROM tips_tricks WHERE aktif = 1";
        $count_result = $conn->query($count_sql);
        $total = $count_result->fetch_assoc()['total'];
        
        $sql = "SELECT * FROM tips_tricks WHERE aktif = 1 ORDER BY prioritas DESC, created_at DESC LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
    }
    
    $tips = [];
    
    while ($row = $result->fetch_assoc()) {
        $tips[] = $row;
    }
    
    $total_pages = ceil($total / $limit);
    
    echo json_encode([
        'success' => true,
        'data' => $tips,
        'pagination' => [
            'total' => $total,
            'per_page' => $limit,
            'current_page' => $page,
            'total_pages' => $total_pages
        ]
    ]);
}

function getKategoriWeakness() {
    global $conn;
    
    $user = requireAuth();
    $user_id = $user['id'];
    
    // Get latest analysis per category
    $sql = "SELECT ak.kategori_id, k.nama_kategori, ak.persen_benar, ak.tingkat_kelemahan, ak.rekomendasi
            FROM analisis_kelemahan ak
            JOIN kategori_soal k ON ak.kategori_id = k.id
            WHERE ak.user_id = ?
            AND ak.id IN (
                SELECT MAX(id) FROM analisis_kelemahan 
                WHERE user_id = ? 
                GROUP BY kategori_id
            )
            ORDER BY ak.persen_benar ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $user_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $weakness = [];
    
    while ($row = $result->fetch_assoc()) {
        $weakness[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $weakness
    ]);
}

function getMyWeakness() {
    global $conn;
    
    $user = requireAuth();
    $user_id = $user['id'];
    
    $sql = "SELECT ak.kategori_id, k.nama_kategori, ak.persen_benar, ak.tingkat_kelemahan, ak.rekomendasi,
                   COUNT(ak2.id) as muncul_count
            FROM analisis_kelemahan ak
            JOIN kategori_soal k ON ak.kategori_id = k.id
            LEFT JOIN analisis_kelemahan ak2 ON ak2.user_id = ak.user_id AND ak2.kategori_id = ak.kategori_id
            WHERE ak.user_id = ?
            AND ak.id IN (
                SELECT MAX(id) FROM analisis_kelemahan 
                WHERE user_id = ?
                GROUP BY kategori_id
            )
            GROUP BY ak.id, ak.kategori_id, k.nama_kategori, ak.persen_benar, ak.tingkat_kelemahan, ak.rekomendasi
            ORDER BY ak.persen_benar ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $user_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $weakness = [];
    
    while ($row = $result->fetch_assoc()) {
        $weakness[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $weakness]);
}

function saveTips() {
    global $conn;
    
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $kategori_id = intval($data['kategori_id'] ?? 0);
    $tipe_tips = $conn->real_escape_string($data['tipe_tips'] ?? 'umum');
    $judul = $conn->real_escape_string($data['judul'] ?? '');
    $konten = $conn->real_escape_string($data['konten'] ?? '');
    $contoh = $conn->real_escape_string($data['contoh'] ?? '');
    $prioritas = intval($data['prioritas'] ?? 0);
    
    if (empty($judul)) {
        echo json_encode(['success' => false, 'error' => 'Judul wajib diisi']);
        return;
    }
    
    $sql = "INSERT INTO tips_tricks (kategori_id, tipe_tips, judul, konten, contoh, prioritas)
            VALUES ($kategori_id, '$tipe_tips', '$judul', '$konten', '$contoh', $prioritas)";
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function deleteTips() {
    global $conn;
    
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    
    if ($id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid ID']);
        return;
    }
    
    $sql = "DELETE FROM tips_tricks WHERE id = $id";
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function verifyCertificate() {
    global $conn;
    
    $code = $_GET['code'] ?? '';
    
    if (empty($code)) {
        echo json_encode(['success' => false, 'error' => 'Invalid code']);
        return;
    }
    
    $sql = "SELECT hu.*, s.verification_code, s.qr_code 
            FROM hasil_ujian hu
            LEFT JOIN sertifikat s ON hu.id = s.hasil_id
            WHERE hu.verification_code = '$code'";
    $result = $conn->query($sql);
    $cert = $result->fetch_assoc();
    
    if ($cert) {
        echo json_encode(['success' => true, 'data' => $cert]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Certificate not found']);
    }
}

function generateCertificate() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $hasil_id = intval($data['hasil_id'] ?? 0);
    
    if ($hasil_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid hasil ID']);
        return;
    }
    
    // Get hasil info
    $sql = "SELECT * FROM hasil_ujian WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $hasil_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $hasil = $result->fetch_assoc();
    $stmt->close();
    
    if (!$hasil) {
        echo json_encode(['success' => false, 'error' => 'Hasil not found']);
        return;
    }
    
    // Check if certificate already exists
    $sql_check = "SELECT * FROM sertifikat WHERE hasil_id = $hasil_id";
    $result_check = $conn->query($sql_check);
    
    if ($result_check->num_rows > 0) {
        $cert = $result_check->fetch_assoc();
        echo json_encode(['success' => true, 'data' => $cert]);
        return;
    }
    
    // Generate new certificate
    $verification_code = md5($hasil_id . $hasil['nama_peserta'] . time());
    $qr_code = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($verification_code);
    $user_id_cert = intval($hasil['user_id'] ?? 0);

    $sql_insert = "INSERT INTO sertifikat (user_id, hasil_id, verification_code, qr_code)
                    VALUES (?, ?, ?, ?)";
    $stmt_ins = $conn->prepare($sql_insert);
    $stmt_ins->bind_param("iiss", $user_id_cert, $hasil_id, $verification_code, $qr_code);
    $result_insert = $stmt_ins->execute();
    
    if ($result_insert) {
        echo json_encode(['success' => true, 'data' => [
            'id' => $conn->insert_id,
            'verification_code' => $verification_code,
            'qr_code' => $qr_code
        ]]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function leaderboardOptout() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $nama_peserta = $conn->real_escape_string($data['nama_peserta'] ?? '');
    $optout = $data['optout'] ?? true;
    
    if (empty($nama_peserta)) {
        echo json_encode(['success' => false, 'error' => 'Invalid nama peserta']);
        return;
    }
    
    if ($optout) {
        $sql = "INSERT INTO leaderboard_optout (nama_peserta) VALUES ('$nama_peserta')";
    } else {
        $sql = "DELETE FROM leaderboard_optout WHERE nama_peserta = '$nama_peserta'";
    }
    
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getLeaderboardOptOutStatus() {
    global $conn;
    
    $nama_peserta = $_GET['nama_peserta'] ?? '';
    
    if (empty($nama_peserta)) {
        echo json_encode(['success' => false, 'error' => 'Invalid nama peserta']);
        return;
    }
    
    $sql = "SELECT * FROM leaderboard_optout WHERE nama_peserta = '$nama_peserta'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => true, 'opted_out' => true]);
    } else {
        echo json_encode(['success' => true, 'opted_out' => false]);
    }
}

function validateBlueprint() {
    global $conn;
    
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $paket_id = intval($data['paket_id'] ?? 0);
    
    if ($paket_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid paket ID']);
        return;
    }
    
    // Get blueprint for this paket
    $sql = "SELECT * FROM paket_blueprint WHERE paket_id = $paket_id";
    $result = $conn->query($sql);
    $blueprints = [];
    while ($row = $result->fetch_assoc()) {
        $blueprints[] = $row;
    }
    
    // Get available questions per category
    $validation = [];
    foreach ($blueprints as $bp) {
        $kategori_id = $bp['kategori_id'];
        $target_count = $bp['target_count'];
        $min_difficulty = $bp['min_difficulty'];
        $max_difficulty = $bp['max_difficulty'];
        
        $sql_count = "SELECT COUNT(*) as count FROM soal 
                      WHERE kategori_id = $kategori_id 
                      AND tingkat BETWEEN '$min_difficulty' AND '$max_difficulty'";
        $result_count = $conn->query($sql_count);
        $count = $result_count->fetch_assoc()['count'];
        
        $validation[] = [
            'kategori_id' => $kategori_id,
            'target_count' => $target_count,
            'available_count' => $count,
            'valid' => $count >= $target_count
        ];
    }
    
    $all_valid = array_reduce($validation, function($carry, $item) {
        return $carry && $item['valid'];
    }, true);
    
    echo json_encode([
        'success' => true,
        'valid' => $all_valid,
        'validation' => $validation
    ]);
}

function getBlueprints() {
    global $conn;
    
    requireAdmin();
    
    $paket_id = intval($_GET['paket_id'] ?? 0);
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
    $where = "";
    $where_count = "";
    if ($paket_id > 0) {
        $where = "WHERE pb.paket_id = $paket_id";
        $where_count = "WHERE paket_id = $paket_id";
    }
    
    // Get total count
    $sql_count = "SELECT COUNT(*) as total FROM paket_blueprint $where_count";
    $result_count = $conn->query($sql_count);
    $total = $result_count->fetch_assoc()['total'];
    
    $sql = "SELECT pb.*, pt.nama_paket, k.nama_kategori,
            (SELECT COUNT(*) FROM soal WHERE kategori_id = pb.kategori_id AND tingkat BETWEEN pb.min_difficulty AND pb.max_difficulty) as available_count
            FROM paket_blueprint pb
            LEFT JOIN paket_tryout pt ON pb.paket_id = pt.id
            LEFT JOIN kategori_soal k ON pb.kategori_id = k.id
            $where
            ORDER BY pb.paket_id, pb.kategori_id
            LIMIT $limit OFFSET $offset";
    $result = $conn->query($sql);
    $blueprints = [];
    
    while ($row = $result->fetch_assoc()) {
        $row['valid'] = $row['available_count'] >= $row['target_count'];
        $blueprints[] = $row;
    }
    
    $total_pages = ceil($total / $limit);
    
    echo json_encode([
        'success' => true,
        'data' => $blueprints,
        'pagination' => [
            'total' => $total,
            'per_page' => $limit,
            'current_page' => $page,
            'total_pages' => $total_pages
        ]
    ]);
}

function saveBlueprint() {
    global $conn;
    
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $paket_id = intval($data['paket_id'] ?? 0);
    $kategori_id = intval($data['kategori_id'] ?? 0);
    $target_count = intval($data['target_count'] ?? 0);
    $min_difficulty = $conn->real_escape_string($data['min_difficulty'] ?? 'sedang');
    $max_difficulty = $conn->real_escape_string($data['max_difficulty'] ?? 'sedang');
    
    if ($paket_id === 0 || $kategori_id === 0 || $target_count === 0) {
        echo json_encode(['success' => false, 'error' => 'Paket, kategori, dan target count wajib diisi']);
        return;
    }
    
    $sql = "INSERT INTO paket_blueprint (paket_id, kategori_id, target_count, min_difficulty, max_difficulty)
            VALUES ($paket_id, $kategori_id, $target_count, '$min_difficulty', '$max_difficulty')
            ON DUPLICATE KEY UPDATE 
            target_count = $target_count,
            min_difficulty = '$min_difficulty',
            max_difficulty = '$max_difficulty'";
    
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function deleteBlueprint() {
    global $conn;
    
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    
    if ($id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid ID']);
        return;
    }
    
    $sql = "DELETE FROM paket_blueprint WHERE id = $id";
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getPaketTryout() {
    global $conn;
    
    $id = $_GET['id'] ?? '';
    $kategori_id = $_GET['kategori_id'] ?? '';
    $search = $_GET['search'] ?? '';
    
    $sql = "SELECT * FROM paket_tryout WHERE 1=1";
    $params = [];
    $types = "";
    
    if ($id) {
        $sql .= " AND id = ?";
        $params[] = $id;
        $types .= "i";
    }
    
    if ($kategori_id) {
        $sql .= " AND kategori_id = ?";
        $params[] = $kategori_id;
        $types .= "i";
    }
    
    if ($search) {
        $sql .= " AND nama_paket LIKE ?";
        $params[] = "%$search%";
        $types .= "s";
    }
    
    $sql .= " ORDER BY nama_paket";
    
    if (!empty($params)) {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql);
    }
    
    $pakets = [];
    while ($row = $result->fetch_assoc()) {
        $pakets[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $pakets]);
}

function createPaketTryout() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $nama_paket = $conn->real_escape_string($data['nama_paket'] ?? '');
    $deskripsi = $conn->real_escape_string($data['deskripsi'] ?? '');
    $durasi = $data['durasi'] ?? 100;
    $kategori_id = $data['kategori_id'] ?? null;
    $total_soal = $data['total_soal'] ?? 30;
    $is_active = $data['is_active'] ?? 1;
    
    $sql = "INSERT INTO paket_tryout (nama_paket, deskripsi, durasi, kategori_id, total_soal, is_active) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiiii", $nama_paket, $deskripsi, $durasi, $kategori_id, $total_soal, $is_active);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Package created successfully']);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function updatePaketTryout() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? 0;
    $nama_paket = $conn->real_escape_string($data['nama_paket'] ?? '');
    $deskripsi = $conn->real_escape_string($data['deskripsi'] ?? '');
    $durasi = $data['durasi'] ?? 100;
    $kategori_id = $data['kategori_id'] ?? null;
    $total_soal = $data['total_soal'] ?? 30;
    $is_active = $data['is_active'] ?? 1;
    
    $sql = "UPDATE paket_tryout SET nama_paket = ?, deskripsi = ?, durasi = ?, kategori_id = ?, total_soal = ?, is_active = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiiiii", $nama_paket, $deskripsi, $durasi, $kategori_id, $total_soal, $is_active, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Package updated successfully']);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function deletePaketTryout() {
    global $conn;
    
    $id = $_GET['id'] ?? 0;
    
    $sql = "DELETE FROM paket_tryout WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Package deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getSesiUjian() {
    global $conn;
    
    // Check if sesi_ujian table exists
    $check_table = $conn->query("SHOW TABLES LIKE 'sesi_ujian'");
    if ($check_table->num_rows == 0) {
        // Return empty data instead of error to allow section to display
        echo json_encode(['success' => true, 'data' => []]);
        return;
    }
    
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    
    try {
        $sql = "SELECT su.*, u.nama_lengkap as user_nama, pt.nama_paket as paket_nama 
                FROM sesi_ujian su 
                LEFT JOIN users u ON su.user_id = u.id 
                LEFT JOIN paket_tryout pt ON su.paket_id = pt.id 
                WHERE 1=1";
        $params = [];
        $types = "";
        
        if ($status) {
            $sql .= " AND su.status = ?";
            $params[] = $status;
            $types .= "s";
        }
        
        if ($search) {
            $sql .= " AND (u.nama_lengkap LIKE ? OR pt.nama_paket LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $types .= "ss";
        }
        
        $sql .= " ORDER BY su.waktu_mulai DESC";
        
        if (!empty($params)) {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $conn->query($sql);
        }
        
        $sessions = [];
        while ($row = $result->fetch_assoc()) {
            $sessions[] = $row;
        }
        
        echo json_encode(['success' => true, 'data' => $sessions]);
    } catch (Exception $e) {
        // Return empty data on any exception
        echo json_encode(['success' => true, 'data' => []]);
    }
}

function getParticipants() {
    global $conn;
    
    // Check if sesi_ujian table exists
    $check_table = $conn->query("SHOW TABLES LIKE 'sesi_ujian'");
    if ($check_table->num_rows == 0) {
        // Return empty data instead of error to allow section to display
        echo json_encode(['success' => true, 'data' => []]);
        return;
    }
    
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    
    try {
        // Get distinct participants from sesi_ujian
        $sql = "SELECT DISTINCT su.id, su.nama_peserta, su.user_id, su.waktu_mulai, su.waktu_selesai, su.durasi_menit, su.status, su.ability_estimate, u.nama_lengkap as user_nama
                FROM sesi_ujian su 
                LEFT JOIN users u ON su.user_id = u.id 
                WHERE 1=1";
        $params = [];
        $types = "";
        
        if ($status) {
            $sql .= " AND su.status = ?";
            $params[] = $status;
            $types .= "s";
        }
        
        if ($search) {
            $sql .= " AND (su.nama_peserta LIKE ? OR u.nama_lengkap LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $types .= "ss";
        }
        
        $sql .= " ORDER BY su.waktu_mulai DESC";
        
        if (!empty($params)) {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $conn->query($sql);
        }
        
        $participants = [];
        while ($row = $result->fetch_assoc()) {
            $participants[] = $row;
        }
        
        echo json_encode(['success' => true, 'data' => $participants]);
    } catch (Exception $e) {
        // Return empty data on any exception
        echo json_encode(['success' => true, 'data' => []]);
    }
}

function terminateSession() {
    global $conn;
    
    $id = $_GET['id'] ?? 0;
    
    $sql = "UPDATE sesi_ujian SET status = 'abandoned', waktu_selesai = NOW() WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Session terminated successfully']);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function calculateIRT() {
    global $conn;
    
    requireAdmin();
    
    // Get all questions with answer statistics
    $sql = "SELECT s.id, s.pertanyaan, s.kategori_id,
            sf.muncul_count, sf.benar_count, sf.salah_count,
            CASE WHEN sf.muncul_count > 0 THEN (sf.benar_count / sf.muncul_count) ELSE 0 END as p_benar
            FROM soal s
            LEFT JOIN soal_frequency sf ON s.id = sf.soal_id
            WHERE sf.muncul_count > 5";
    $result = $conn->query($sql);
    
    $updated_count = 0;
    
    while ($row = $result->fetch_assoc()) {
        $soal_id = $row['id'];
        $muncul_count = $row['muncul_count'];
        $benar_count = $row['benar_count'];
        $salah_count = $row['salah_count'];
        $p_benar = $row['p_benar'];
        
        // Calculate discrimination index (point-biserial correlation approximation)
        // This is a simplified version - real IRT requires more complex calculations
        $discrimination_index = 0;
        if ($muncul_count > 0 && $p_benar > 0 && $p_benar < 1) {
            $discrimination_index = 2 * sqrt($p_benar * (1 - $p_benar));
        }
        
        // Calculate IRT parameters (simplified 3PL model)
        $irt_b = -log((1 - $p_benar) / max($p_benar, 0.01)); // difficulty parameter
        $irt_a = min(max($discrimination_index, 0.5), 2.5); // discrimination parameter (clamped)
        $irt_c = 0.25; // guessing parameter (default for 5-choice questions)
        
        // Determine item quality
        if ($discrimination_index >= 0.4) {
            $item_quality = 'excellent';
        } elseif ($discrimination_index >= 0.3) {
            $item_quality = 'good';
        } elseif ($discrimination_index >= 0.2) {
            $item_quality = 'fair';
        } else {
            $item_quality = 'poor';
        }
        
        // Update soal table
        $sql_update = "UPDATE soal 
                      SET irt_a = $irt_a, irt_b = $irt_b, irt_c = $irt_c, 
                          discrimination_index = $discrimination_index, item_quality = '$item_quality'
                      WHERE id = $soal_id";
        $conn->query($sql_update);
        
        // Update soal_frequency table
        $sql_update_freq = "UPDATE soal_frequency 
                            SET irt_a = $irt_a, irt_b = $irt_b, irt_c = $irt_c,
                                discrimination_index = $discrimination_index
                            WHERE soal_id = $soal_id";
        $conn->query($sql_update_freq);
        
        $updated_count++;
    }
    
    echo json_encode([
        'success' => true,
        'updated' => $updated_count
    ]);
}

function getIRTAnalysis() {
    global $conn;
    
    requireAdmin();
    
    $sql = "SELECT s.id, s.pertanyaan, s.kategori_id, k.nama_kategori,
            s.irt_a, s.irt_b, s.irt_c, s.discrimination_index, s.item_quality,
            sf.muncul_count, sf.benar_count, sf.salah_count,
            CASE WHEN sf.muncul_count > 0 THEN (sf.benar_count / sf.muncul_count) ELSE 0 END as p_benar
            FROM soal s
            LEFT JOIN kategori_soal k ON s.kategori_id = k.id
            LEFT JOIN soal_frequency sf ON s.id = sf.soal_id
            WHERE sf.muncul_count > 0
            ORDER BY s.discrimination_index ASC";
    $result = $conn->query($sql);
    $analysis = [];
    
    while ($row = $result->fetch_assoc()) {
        $analysis[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $analysis]);
}

function enableCAT() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $sesi_id = intval($data['sesi_id'] ?? 0);
    $enabled = $data['enabled'] ?? true;
    
    if ($sesi_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid sesi ID']);
        return;
    }
    
    $sql = "UPDATE sesi_ujian SET cat_enabled = $enabled WHERE id = $sesi_id";
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getNextQuestionCAT() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $sesi_id = intval($data['sesi_id'] ?? 0);
    $kategori_id = intval($data['kategori_id'] ?? 0);
    $current_ability = floatval($data['current_ability'] ?? 0);
    
    if ($sesi_id === 0 || $kategori_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
        return;
    }
    
    // Get answered question IDs for this session
    $sql_answered = "SELECT jawaban_peserta FROM hasil_ujian WHERE sesi_id = $sesi_id";
    $result_answered = $conn->query($sql_answered);
    $answered_data = $result_answered->fetch_assoc();
    
    $answered_ids = [];
    if ($answered_data && $answered_data['jawaban_peserta']) {
        $answered_ids = json_decode($answered_data['jawaban_peserta'], true);
        $answered_ids = array_keys($answered_ids);
    }
    
    // Get next question based on IRT parameters
    // Select question with difficulty (irt_b) closest to current ability
    $answered_ids_str = implode(',', array_map('intval', $answered_ids));
    $where_answered = !empty($answered_ids_str) ? "AND s.id NOT IN ($answered_ids_str)" : "";
    
    $sql = "SELECT s.*, ABS(s.irt_b - $current_ability) as distance
            FROM soal s
            WHERE s.kategori_id = $kategori_id
            AND s.irt_b IS NOT NULL
            $where_answered
            ORDER BY distance ASC, RAND()
            LIMIT 1";
    $result = $conn->query($sql);
    $question = $result->fetch_assoc();
    
    if ($question) {
        echo json_encode(['success' => true, 'data' => $question]);
    } else {
        // Fallback to random question if no IRT data
        $sql_fallback = "SELECT s.* FROM soal s
                        WHERE s.kategori_id = $kategori_id
                        $where_answered
                        ORDER BY RAND()
                        LIMIT 1";
        $result_fallback = $conn->query($sql_fallback);
        $question_fallback = $result_fallback->fetch_assoc();
        
        if ($question_fallback) {
            echo json_encode(['success' => true, 'data' => $question_fallback, 'fallback' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No questions available']);
        }
    }
}

function updateAbilityEstimate() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $sesi_id = intval($data['sesi_id'] ?? 0);
    $soal_id = intval($data['soal_id'] ?? 0);
    $is_correct = $data['is_correct'] ?? false;
    $current_ability = floatval($data['current_ability'] ?? 0);
    
    if ($sesi_id === 0 || $soal_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
        return;
    }
    
    // Get IRT parameters for the question
    $sql = "SELECT irt_a, irt_b, irt_c FROM soal WHERE id = $soal_id";
    $result = $conn->query($sql);
    $soal_data = $result->fetch_assoc();
    
    if (!$soal_data || $soal_data['irt_b'] === null) {
        // No IRT data, use simple adjustment
        $new_ability = $current_ability + ($is_correct ? 0.1 : -0.1);
        $confidence = 0.3;
    } else {
        $irt_a = floatval($soal_data['irt_a']);
        $irt_b = floatval($soal_data['irt_b']);
        $irt_c = floatval($soal_data['irt_c']);
        
        // Simplified ability update using IRT
        // P(correct) = c + (1-c) / (1 + exp(-a(theta - b)))
        $p_correct = $irt_c + (1 - $irt_c) / (1 + exp(-$irt_a * ($current_ability - $irt_b)));
        
        // Update ability based on difference between actual and predicted
        $learning_rate = 0.5;
        $new_ability = $current_ability + $learning_rate * ($is_correct - $p_correct);
        
        // Calculate confidence based on number of questions answered
        $sql_count = "SELECT COUNT(*) as count FROM hasil_ujian WHERE sesi_id = $sesi_id";
        $result_count = $conn->query($sql_count);
        $count_data = $result_count->fetch_assoc();
        $n_questions = $count_data['count'] ?? 1;
        
        $confidence = min(0.95, 0.3 + 0.1 * $n_questions);
    }
    
    // Update ability estimate in session
    $sql_update = "UPDATE sesi_ujian 
                  SET ability_estimate = $new_ability, confidence_level = $confidence
                  WHERE id = $sesi_id";
    $result = $conn->query($sql);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'new_ability' => $new_ability,
            'confidence' => $confidence
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function serveFile() {
    global $conn;
    
    $id = intval($_GET['id'] ?? 0);
    $table = $_GET['table'] ?? 'bahan_pelajaran';
    
    if ($id === 0) {
        http_response_code(400);
        echo 'Invalid file ID';
        return;
    }
    
    // Get file path from database
    $sql = "SELECT file_path, konten, tipe FROM $table WHERE id = $id";
    $result = $conn->query($sql);
    $file_data = $result->fetch_assoc();
    
    if (!$file_data) {
        http_response_code(404);
        echo 'File not found';
        return;
    }
    
    // If content is in database and file_path is empty, serve from database
    if (!empty($file_data['konten']) && empty($file_data['file_path'])) {
        header('Content-Type: text/plain');
        echo $file_data['konten'];
        return;
    }
    
    // Serve from file system
    if (!empty($file_data['file_path'])) {
        $file_path = '../' . $file_data['file_path'];
        
        if (!file_exists($file_path)) {
            http_response_code(404);
            echo 'File not found on disk';
            return;
        }
        
        // Determine content type
        $mime_type = 'application/octet-stream';
        $file_ext = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
        $mime_types = [
            'pdf' => 'application/pdf',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'txt' => 'text/plain',
            'md' => 'text/markdown',
            'html' => 'text/html'
        ];
        
        if (isset($mime_types[$file_ext])) {
            $mime_type = $mime_types[$file_ext];
        }
        
        header('Content-Type: ' . $mime_type);
        header('Content-Length: ' . filesize($file_path));
        header('Content-Disposition: inline; filename="' . basename($file_path) . '"');
        readfile($file_path);
        return;
    }
    
    http_response_code(404);
    echo 'No file available';
}

function deleteBahanPelajaran() {
    global $conn;
    
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    
    if ($id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid ID']);
        return;
    }
    
    // Get file path before deletion
    $sql = "SELECT file_path FROM bahan_pelajaran WHERE id = $id";
    $result = $conn->query($sql);
    $bahan = $result->fetch_assoc();
    
    // Delete from database
    $sql_delete = "DELETE FROM bahan_pelajaran WHERE id = $id";
    $result = $conn->query($sql_delete);
    
    if ($result) {
        // Delete file from file system if exists
        if ($bahan && $bahan['file_path']) {
            $file_path = '../' . $bahan['file_path'];
            if (file_exists($file_path)) {
                unlink($file_path);
            }
        }
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

// Tryout System Functions

function getLearningTopics() {
    global $conn;
    
    $system = new LearningRecommendationSystem($conn);
    $topics = $system->getAllTopics();
    
    echo json_encode(['success' => true, 'data' => $topics]);
}

function getLearningRecommendations() {
    global $conn;
    
    $auth_user = requireAuth();
    $user_id = $auth_user['id'] ?? 0;
    if ($user_id === 0) {
        echo json_encode(['success' => false, 'error' => 'User not logged in']);
        return;
    }
    
    $system = new LearningRecommendationSystem($conn);
    $recommendations = $system->getRecommendations($user_id);
    
    // Save recommendations to database
    $system->saveRecommendations($user_id, $recommendations);
    
    echo json_encode(['success' => true, 'data' => $recommendations]);
}

function markTopicStudied() {
    global $conn;
    
    $auth_user = requireAuth();
    $user_id = $auth_user['id'] ?? 0;
    if ($user_id === 0) {
        echo json_encode(['success' => false, 'error' => 'User not logged in']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $topic_id = intval($data['topic_id'] ?? 0);
    $completion_percentage = intval($data['completion_percentage'] ?? 100);
    $notes = $data['notes'] ?? '';
    
    if ($topic_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid topic ID']);
        return;
    }
    
    $system = new LearningRecommendationSystem($conn);
    $result = $system->markTopicAsStudied($user_id, $topic_id, $completion_percentage, $notes);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getLearningProgress() {
    global $conn;
    
    $auth_user = requireAuth();
    $user_id = $auth_user['id'] ?? 0;
    if ($user_id === 0) {
        echo json_encode(['success' => false, 'error' => 'User not logged in']);
        return;
    }
    
    $system = new LearningRecommendationSystem($conn);
    $progress = $system->getLearningProgress($user_id);
    
    echo json_encode(['success' => true, 'data' => $progress]);
}

function createTryoutSession() {
    global $conn;
    
    $auth_user = requireAuth();
    $user_id = $auth_user['id'] ?? 0;
    if ($user_id === 0) {
        echo json_encode(['success' => false, 'error' => 'User not logged in']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $topic_id = intval($data['topic_id'] ?? 0);
    $session_name = $data['session_name'] ?? '';
    $total_questions = intval($data['total_questions'] ?? 10);
    $duration_minutes = intval($data['duration_minutes'] ?? 30);
    
    if ($topic_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid topic ID']);
        return;
    }
    
    $generator = new AIQuestionGenerator($conn);
    $session_id = $generator->createTryoutSession($user_id, $topic_id, $session_name, $total_questions, $duration_minutes);
    
    if ($session_id) {
        echo json_encode(['success' => true, 'session_id' => $session_id]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to create tryout session']);
    }
}

function getTryoutQuestions() {
    global $conn;
    
    $session_id = intval($_GET['session_id'] ?? 0);
    
    if ($session_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid session ID']);
        return;
    }
    
    $generator = new AIQuestionGenerator($conn);
    $questions = $generator->getTryoutQuestions($session_id);
    $session_info = $generator->getTryoutSession($session_id);
    
    echo json_encode(['success' => true, 'data' => [
        'session' => $session_info,
        'questions' => $questions
    ]]);
}

function startTryout() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $session_id = intval($data['session_id'] ?? 0);
    
    if ($session_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid session ID']);
        return;
    }
    
    $generator = new AIQuestionGenerator($conn);
    $result = $generator->startTryoutSession($session_id);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to start tryout']);
    }
}

function submitTryoutAnswer() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $session_id = intval($data['session_id'] ?? 0);
    $question_id = intval($data['question_id'] ?? 0);
    $user_answer = $data['answer'] ?? '';
    $time_taken = intval($data['time_taken'] ?? 0);
    
    if ($session_id === 0 || $question_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
        return;
    }
    
    $generator = new AIQuestionGenerator($conn);
    $result = $generator->submitAnswer($session_id, $question_id, $user_answer, $time_taken);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to submit answer']);
    }
}

function completeTryout() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $session_id = intval($data['session_id'] ?? 0);
    
    if ($session_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid session ID']);
        return;
    }
    
    $generator = new AIQuestionGenerator($conn);
    $score = $generator->calculateScore($session_id);
    $result = $generator->completeTryoutSession($session_id, $score);
    
    if ($result) {
        // Award XP for completing exam
        $xp_amount = 10 + floor($score / 10); // Base 10 XP + bonus based on score
        $auth_user = requireAuth();
        $user_id = $auth_user['id'] ?? null;
        $auth_token = $auth_user['api_key'] ?? '';
        
        if ($user_id) {
            // Award XP directly via DB (avoid internal curl with session token)
            $xp_sql = "SELECT total_xp, level, xp_to_next_level FROM user_xp WHERE user_id = ?";
            $xp_stmt = $conn->prepare($xp_sql);
            $xp_stmt->bind_param('i', $user_id);
            $xp_stmt->execute();
            $xp_data = $xp_stmt->get_result()->fetch_assoc();
            if ($xp_data) {
                $new_total = $xp_data['total_xp'] + $xp_amount;
                $new_level = floor(sqrt($new_total / 100)) + 1;
                $new_next = ($new_level + 1) * ($new_level + 1) * 100;
                $upd_stmt = $conn->prepare("UPDATE user_xp SET total_xp=?, level=?, xp_to_next_level=? WHERE user_id=?");
                $upd_stmt->bind_param('iiii', $new_total, $new_level, $new_next, $user_id);
                $upd_stmt->execute();
            }
            // Log XP transaction
            $txn_sql = "INSERT INTO xp_transactions (user_id, xp_amount, reason, source, source_id) VALUES (?, ?, ?, 'exam', ?)";
            $txn_stmt = $conn->prepare($txn_sql);
            $reason = 'Completed tryout session: ' . $session_id;
            $txn_stmt->bind_param('iisi', $user_id, $xp_amount, $reason, $session_id);
            $txn_stmt->execute();
            // Send in-app notification directly via DB
            $notif_sql = "INSERT INTO notifications (user_id, type, title, message, category, status) VALUES (?, 'in_app', 'Hasil Ujian Tersedia', ?, 'exam_result', 'pending')";
            $notif_stmt = $conn->prepare($notif_sql);
            $notif_msg = 'Nilai ujian Anda: ' . $score;
            $notif_stmt->bind_param('is', $user_id, $notif_msg);
            $notif_stmt->execute();
        }
        
        echo json_encode(['success' => true, 'score' => $score, 'xp_awarded' => $xp_amount]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to complete tryout']);
    }
}

function getTryoutHistory() {
    global $conn;
    
    $user_id = intval($_GET['user_id'] ?? 0);
    
    if ($user_id === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid user ID']);
        return;
    }
    
    $generator = new AIQuestionGenerator($conn);
    $history = $generator->getUserTryoutHistory($user_id);
    
    echo json_encode(['success' => true, 'data' => $history]);
}

function generateQuestionForAdmin() {
    global $conn;
    
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $kategori_id = intval($data['kategori_id'] ?? 1);
    $num_questions = intval($data['num_questions'] ?? 1);
    $difficulty = $conn->real_escape_string($data['difficulty'] ?? 'sedang');
    $auth_user = requireAuth();
    $created_by = $auth_user['id'] ?? null;
    
    $generator = new AIQuestionGenerator($conn);
    $generated_questions = $generator->generateQuestionForAdmin($kategori_id, $num_questions, $difficulty, $created_by);
    
    echo json_encode(['success' => true, 'data' => $generated_questions]);
}

function generatePracticeQuestion() {
    global $conn;
    
    $kategori_id = intval($_GET['kategori_id'] ?? 1);
    $difficulty = $_GET['difficulty'] ?? 'sedang';
    
    $generator = new AIQuestionGenerator($conn);
    $practice_question = $generator->generatePracticeQuestion($kategori_id, $difficulty);
    
    if ($practice_question) {
        echo json_encode(['success' => true, 'data' => $practice_question]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to generate practice question']);
    }
}

$conn->close();
?>
