<?php
// Additional API endpoints for exam phase fixes
// Include this at the end of soal.php

function checkActiveSession() {
    global $conn;
    $user = requireAuth();
    
    $sesi_id = $_GET['sesi_id'] ?? null;
    if (!$sesi_id) {
        echo json_encode(['valid' => false]);
        return;
    }
    
    $sql = "SELECT id, status FROM sesi_ujian WHERE id = ? AND user_id = ? AND status = 'aktif'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $sesi_id, $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    echo json_encode(['valid' => $result->num_rows > 0]);
}

function autoSaveProgress() {
    global $conn;
    $user = requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $sesi_id = $data['sesi_id'] ?? null;
    $jawaban_data = $data['jawaban_data'] ?? null;
    
    if (!$sesi_id || !$jawaban_data) {
        echo json_encode(['success' => false, 'error' => 'Missing data']);
        return;
    }
    
    $sql = "INSERT INTO exam_progress_auto_save (sesi_id, user_id, jawaban_data, current_question_index, time_remaining) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            jawaban_data = VALUES(jawaban_data), 
            current_question_index = VALUES(current_question_index),
            time_remaining = VALUES(time_remaining),
            saved_at = CURRENT_TIMESTAMP";
    
    $jawaban_json = json_encode($jawaban_data);
    $current_q = $data['current_question_index'] ?? 0;
    $time_rem = $data['time_remaining'] ?? 0;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iisii", $sesi_id, $user['id'], $jawaban_json, $current_q, $time_rem);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getTimer() {
    global $conn;
    $user = requireAuth();
    
    $sesi_id = $_GET['sesi_id'] ?? null;
    if (!$sesi_id) {
        echo json_encode(['success' => false]);
        return;
    }
    
    $sql = "SELECT start_time, durasi_menit FROM sesi_ujian WHERE id = ? AND user_id = ? AND status = 'aktif'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $sesi_id, $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $start = strtotime($row['start_time']);
        $now = time();
        $elapsed = $now - $start;
        $total = $row['durasi_menit'] * 60;
        $remaining = max(0, $total - $elapsed);
        
        echo json_encode(['success' => true, 'remaining_seconds' => $remaining]);
    } else {
        echo json_encode(['success' => false]);
    }
}

function getPembahasan() {
    global $conn;
    $user = requireAuth();
    
    $hasil_id = $_GET['hasil_id'] ?? null;
    if (!$hasil_id) {
        echo json_encode(['success' => false]);
        return;
    }
    
    $sql = "SELECT s.id, s.pertanyaan, s.opsi_a, s.opsi_b, s.opsi_c, s.opsi_d, s.opsi_e,
            s.jawaban_benar, s.pembahasan, k.nama_kategori as kategori,
            ju.jawaban as jawaban_user
            FROM jawaban_user ju
            JOIN soal s ON ju.soal_id = s.id
            JOIN kategori_soal k ON s.kategori_id = k.id
            WHERE ju.hasil_id = ?
            ORDER BY ju.id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $hasil_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $data]);
}