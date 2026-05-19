<?php
/**
 * Manual Exam Simulation Script with Multiple Conditions
 * Simulates exams with different scenarios: passing, failing, borderline cases
 */

require_once __DIR__ . '/config.php';

// Multiple simulation scenarios for all exam types
$scenarios = [
    // SKD (Seleksi Kompetensi Dasar)
    [
        'user_id' => 22, // fresh_user_11778919457
        'exam_type' => 'SKD',
        'exam_code' => 'skd',
        'nama_peserta' => 'Fresh User 1 - SKD High Score',
        'scenario' => 'HIGH_SCORE',
        'twk_target' => 28, // High TWK
        'tiu_target' => 32, // High TIU
        'tkp_target' => 33, // High TKP
        'tpa_target' => 13, // High TPA
        'psikologis_target' => 13, // High Psikologis
        'durasi' => 100,
        'jumlah_soal' => 100,
        'description' => 'SKD dengan nilai tinggi di semua kategori'
    ],
    // SKD_CAT (CAT Mode)
    [
        'user_id' => 22,
        'exam_type' => 'SKD - CAT Mode',
        'exam_code' => 'skd_cat',
        'nama_peserta' => 'Fresh User 1 - SKD CAT Borderline',
        'scenario' => 'BORDERLINE_PASS',
        'twk_target' => 16, // Minimum passing
        'tiu_target' => 16, // Minimum passing
        'tkp_target' => 17, // Minimum passing
        'tpa_target' => 8, // Minimum passing
        'psikologis_target' => 8, // Minimum passing
        'durasi' => 90,
        'jumlah_soal' => 100,
        'description' => 'SKD CAT dengan nilai pas batas lulus'
    ],
    // TPA (Tes Potensi Akademik)
    [
        'user_id' => 23, // fresh_user_21778919457
        'exam_type' => 'TPA',
        'exam_code' => 'tpa',
        'nama_peserta' => 'Fresh User 2 - TPA High Score',
        'scenario' => 'HIGH_SCORE',
        'twk_target' => 0,
        'tiu_target' => 0,
        'tkp_target' => 0,
        'tpa_target' => 14, // High TPA
        'psikologis_target' => 0,
        'durasi' => 60,
        'jumlah_soal' => 15,
        'description' => 'TPA dengan nilai tinggi'
    ],
    // PSIKOTES
    [
        'user_id' => 23,
        'exam_type' => 'Psikotes',
        'exam_code' => 'psikotes',
        'nama_peserta' => 'Fresh User 2 - Psikotes Average',
        'scenario' => 'AVERAGE',
        'twk_target' => 0,
        'tiu_target' => 0,
        'tkp_target' => 0,
        'tpa_target' => 0,
        'psikologis_target' => 23, // Average Psikologis
        'durasi' => 45,
        'jumlah_soal' => 30,
        'description' => 'Psikotes dengan nilai rata-rata'
    ],
    // TRYOUT (Tryout Umum)
    [
        'user_id' => 24, // testuser
        'exam_type' => 'Tryout Umum',
        'exam_code' => 'tryout',
        'nama_peserta' => 'Test User - Tryout Failed',
        'scenario' => 'FAILED',
        'twk_target' => 12, // Below passing
        'tiu_target' => 10, // Below passing
        'tkp_target' => 14, // Below passing
        'tpa_target' => 8, // Below passing
        'psikologis_target' => 22, // Below passing
        'durasi' => 100,
        'jumlah_soal' => 130,
        'description' => 'Tryout yang tidak lulus'
    ],
    // LATIHAN (Latihan Bebas)
    [
        'user_id' => 24,
        'exam_type' => 'Latihan Bebas',
        'exam_code' => 'latihan',
        'nama_peserta' => 'Test User - Latihan Practice',
        'scenario' => 'PRACTICE',
        'twk_target' => 20,
        'tiu_target' => 25,
        'tkp_target' => 25,
        'tpa_target' => 12,
        'psikologis_target' => 25,
        'durasi' => 0, // No time limit
        'jumlah_soal' => 20,
        'description' => 'Latihan bebas tanpa batasan waktu'
    ],
    // SKB (Seleksi Kompetensi Bidang)
    [
        'user_id' => 22,
        'exam_type' => 'SKB (Seleksi Kompetensi Bidang)',
        'exam_code' => 'skb',
        'nama_peserta' => 'Fresh User 1 - SKB High Score',
        'scenario' => 'HIGH_SCORE',
        'twk_target' => 0,
        'tiu_target' => 0,
        'tkp_target' => 0,
        'tpa_target' => 9, // High TPA
        'psikologis_target' => 9, // High Psikologis
        'durasi' => 90,
        'jumlah_soal' => 100,
        'description' => 'SKB dengan nilai tinggi di bidang'
    ],
    // UTBK (Ujian Tulis Berbasis Komputer)
    [
        'user_id' => 23,
        'exam_type' => 'UTBK',
        'exam_code' => 'utbk',
        'nama_peserta' => 'Fresh User 2 - UTBK Average',
        'scenario' => 'AVERAGE',
        'twk_target' => 0,
        'tiu_target' => 0,
        'tkp_target' => 0,
        'tpa_target' => 12, // Average TPA
        'psikologis_target' => 12, // Average Psikologis
        'durasi' => 120,
        'jumlah_soal' => 180,
        'description' => 'UTBK dengan nilai rata-rata'
    ]
];

echo "══════════════════════════════════════════════════════════════════════\n";
echo "  ALL EXAM TYPES SIMULATION\n";
echo "══════════════════════════════════════════════════════════════════════\n";

foreach ($scenarios as $index => $scenario) {
    $userId = $scenario['user_id'];
    $examType = $scenario['exam_type'];
    $examCode = $scenario['exam_code'];
    $namaPeserta = $scenario['nama_peserta'];
    $scenarioType = $scenario['scenario'];
    $twkTarget = $scenario['twk_target'];
    $tiuTarget = $scenario['tiu_target'];
    $tkpTarget = $scenario['tkp_target'];
    $tpaTarget = $scenario['tpa_target'];
    $psikologisTarget = $scenario['psikologis_target'];
    $durasi = $scenario['durasi'];
    $jumlahSoal = $scenario['jumlah_soal'];
    $description = $scenario['description'];
    
    echo "\n" . "─" . 70 . "\n";
    echo "SCENARIO " . ($index + 1) . ": $scenarioType\n";
    echo "Description: $description\n";
    echo "User ID: $userId\n";
    echo "Exam Type: $examType\n";
    echo "─" . 70 . "\n";
    
    // Calculate scores based on scenario targets
    $nilaiTWK = ($twkTarget > 0) ? ($twkTarget / 30) * 150 : 0;
    $nilaiTIU = ($tiuTarget > 0) ? ($tiuTarget / 35) * 175 : 0;
    $nilaiTKP = ($tkpTarget > 0) ? ($tkpTarget / 35) * 175 : 0;
    $nilaiTPA = ($tpaTarget > 0) ? ($tpaTarget / 15) * 100 : 0;
    $nilaiPsikologis = ($psikologisTarget > 0) ? ($psikologisTarget / 30) * 100 : 0;
    $nilaiTotal = $nilaiTWK + $nilaiTIU + $nilaiTKP + $nilaiTPA + $nilaiPsikologis;
    
    // Determine pass/fail based on exam type
    if ($examCode === 'latihan') {
        $statusLulus = 'PRACTICE'; // Practice mode, no pass/fail
    } else {
        // Check passing grades based on exam type
        $twkPass = ($twkTarget >= 15) || ($twkTarget === 0 && $examCode !== 'skd' && $examCode !== 'skd_cat' && $examCode !== 'tryout');
        $tiuPass = ($tiuTarget >= 15) || ($tiuTarget === 0 && $examCode !== 'skd' && $examCode !== 'skd_cat' && $examCode !== 'tryout');
        $tkpPass = ($tkpTarget >= 15) || ($tkpTarget === 0 && $examCode !== 'skd' && $examCode !== 'skd_cat' && $examCode !== 'tryout');
        $tpaPass = ($tpaTarget >= 10) || ($tpaTarget === 0 && $examCode !== 'tpa' && $examCode !== 'skb' && $examCode !== 'utbk' && $examCode !== 'tryout');
        $psikologisPass = ($psikologisTarget >= 10) || ($psikologisTarget === 0 && $examCode !== 'psikotes' && $examCode !== 'skb' && $examCode !== 'utbk' && $examCode !== 'tryout');
        
        $statusLulus = ($twkPass && $tiuPass && $tkpPass && $tpaPass && $psikologisPass) ? 'LULUS' : 'TIDAK LULUS';
    }
    
    echo "\n📝 Exam Type: $examType\n";
    echo "👤 Participant: $namaPeserta\n";
    echo "\n📈 Target Scores:\n";
    if ($twkTarget > 0) echo "  TWK: $twkTarget/30 correct (Nilai: " . number_format($nilaiTWK, 2) . ")\n";
    if ($tiuTarget > 0) echo "  TIU: $tiuTarget/35 correct (Nilai: " . number_format($nilaiTIU, 2) . ")\n";
    if ($tkpTarget > 0) echo "  TKP: $tkpTarget/35 correct (Nilai: " . number_format($nilaiTKP, 2) . ")\n";
    if ($tpaTarget > 0) echo "  TPA: $tpaTarget/15 correct (Nilai: " . number_format($nilaiTPA, 2) . ")\n";
    if ($psikologisTarget > 0) echo "  PSIKOLOGIS: $psikologisTarget/30 correct (Nilai: " . number_format($nilaiPsikologis, 2) . ")\n";
    echo "\n🎯 Total Score: " . number_format($nilaiTotal, 2) . "\n";
    echo "✅ Status: $statusLulus\n";
    echo "\n══════════════════════════════════════════════════════════════════════\n";
    
    // Insert exam session
    $sqlSesi = "INSERT INTO sesi_ujian (user_id, nama_peserta, status, waktu_mulai, waktu_selesai, durasi_menit) VALUES (?, ?, 'selesai', NOW(), NOW(), ?)";
    $stmtSesi = $conn->prepare($sqlSesi);
    $stmtSesi->bind_param("isi", $userId, $namaPeserta, $durasi);
    $stmtSesi->execute();
    $sesiId = $conn->insert_id;
    
    // Insert exam result (using actual database schema with all categories)
    $sqlHasil = "INSERT INTO hasil_ujian (user_id, nama_peserta, nilai_twk, nilai_tiu, nilai_tkp, nilai_tpa, nilai_psikologis, nilai_total, status_lulus, tanggal_ujian, durasi_menit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)";
    $stmtHasil = $conn->prepare($sqlHasil);
    $stmtHasil->bind_param("isddddsssi", $userId, $namaPeserta, $nilaiTWK, $nilaiTIU, $nilaiTKP, $nilaiTPA, $nilaiPsikologis, $nilaiTotal, $statusLulus, $durasi);
    $stmtHasil->execute();
    $hasilId = $conn->insert_id;
    
    echo "✅ Exam session created (ID: $sesiId)\n";
    echo "✅ Exam result saved (ID: $hasilId)\n";
    
    // Update user XP (gamification) - different XP based on performance and exam type
    if ($scenarioType === 'HIGH_SCORE') {
        $xpEarned = 100;
    } elseif ($scenarioType === 'BORDERLINE_PASS') {
        $xpEarned = 50;
    } elseif ($scenarioType === 'FAILED') {
        $xpEarned = 20; // Failed exam still gets some XP
    } elseif ($scenarioType === 'PRACTICE') {
        $xpEarned = 30; // Practice mode
    } else {
        $xpEarned = 40; // Average
    }
    
    $sqlXP = "INSERT INTO user_xp (user_id, total_xp, level) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE total_xp = total_xp + ?, level = FLOOR(total_xp / 100) + 1";
    $stmtXP = $conn->prepare($sqlXP);
    $stmtXP->bind_param("iii", $userId, $xpEarned, $xpEarned);
    $stmtXP->execute();
    
    echo "✅ User XP updated (+$xpEarned XP)\n";
    
    // Update user streak
    $sqlStreak = "INSERT INTO user_streak (user_id, current_streak, last_activity_date) VALUES (?, 1, CURDATE()) ON DUPLICATE KEY UPDATE current_streak = IF(last_activity_date = CURDATE() - INTERVAL 1 DAY, current_streak + 1, IF(last_activity_date < CURDATE() - INTERVAL 1 DAY, 1, current_streak)), last_activity_date = CURDATE()";
    $stmtStreak = $conn->prepare($sqlStreak);
    $stmtStreak->bind_param("i", $userId);
    $stmtStreak->execute();
    
    echo "✅ User streak updated\n";
    
    $stmtSesi->close();
    $stmtHasil->close();
    $stmtXP->close();
    $stmtStreak->close();
}

echo "\n══════════════════════════════════════════════════════════════════════\n";
echo "  ALL EXAM TYPES SIMULATION COMPLETED\n";
echo "══════════════════════════════════════════════════════════════════════\n";
echo "\n📊 Summary:\n";
echo "  - SKD: User 22 (High Score)\n";
echo "  - SKD_CAT: User 22 (Borderline Pass)\n";
echo "  - TPA: User 23 (High Score)\n";
echo "  - PSIKOTES: User 23 (Average)\n";
echo "  - TRYOUT: User 24 (Failed)\n";
echo "  - LATIHAN: User 24 (Practice)\n";
echo "  - SKB: User 22 (High Score)\n";
echo "  - UTBK: User 23 (Average)\n";
echo "\n✅ Ready for dashboard verification\n";
echo "══════════════════════════════════════════════════════════════════════\n";

$conn->close();
?>
