-- Tabel untuk analisis kelemahan peserta per kategori
CREATE TABLE IF NOT EXISTS analisis_kelemahan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    sesi_id INT,
    kategori_id INT,
    total_soal INT DEFAULT 0,
    benar INT DEFAULT 0,
    salah INT DEFAULT 0,
    kosong INT DEFAULT 0,
    persen_benar DECIMAL(5,2) DEFAULT 0,
    tingkat_kelemahan ENUM('rendah', 'sedang', 'tinggi', 'sangat_tinggi') DEFAULT 'sedang',
    rekomendasi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (sesi_id) REFERENCES sesi_ujian(id),
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id)
);

-- Tabel untuk tips & tricks penyelesaian soal
CREATE TABLE IF NOT EXISTS tips_tricks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT,
    tipe_tips ENUM('umum', 'spesifik', 'strategi', 'shortcut') DEFAULT 'umum',
    judul VARCHAR(255),
    konten TEXT,
    contoh TEXT,
    prioritas INT DEFAULT 0,
    aktif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id)
);

-- Tabel untuk relasi tips dengan soal (untuk tips spesifik)
CREATE TABLE IF NOT EXISTS tips_soal (
    tips_id INT,
    soal_id INT,
    PRIMARY KEY (tips_id, soal_id),
    FOREIGN KEY (tips_id) REFERENCES tips_tricks(id) ON DELETE CASCADE,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
);

-- Insert sample tips & tricks
INSERT INTO tips_tricks (kategori_id, tipe_tips, judul, konten, contoh, prioritas) VALUES
(1, 'umum', 'Tips Menjawab TWK', 'Baca soal dengan teliti dan pahami konteks sejarah dan ideologi bangsa', 'Selalu kaitkan dengan Pancasila dan UUD 1945', 1),
(1, 'strategi', 'Strategi TWK', 'Fokus pada materi sejarah, geografi, dan ideologi negara', 'Pelajari pahlawan nasional dan peristiwa penting', 2),
(2, 'umum', 'Tips Menjawab TIU', 'Gunakan logika matematika dan pola untuk mempercepat penyelesaian', 'Gunakan teknik eliminasi untuk opsi yang jelas salah', 1),
(2, 'shortcut', 'Shortcut TIU', 'Untuk soal deret, cari pola selisih antar angka', 'Contoh: 2,4,6,8 selisihnya 2, angka berikutnya 10', 3),
(3, 'umum', 'Tips Menjawab TKP', 'Jawab sesuai kepribadian dan karakter Anda yang sebenarnya', 'Jangan pura-pura, sistem akan mendeteksi ketidakkonsistenan', 1),
(3, 'strategi', 'Strategi TKP', 'Pahami skala penilaian (1-5) dan konteks situasi kerja', 'Nilai 5 = Sangat Sesuai, Nilai 1 = Sangat Tidak Sesuai', 2);

-- View untuk analisis kelemahan lengkap
CREATE OR REPLACE VIEW v_analisis_kelemahan_lengkap AS
SELECT 
    ak.id,
    ak.user_id,
    ak.sesi_id,
    ak.kategori_id,
    k.nama_kategori,
    ak.total_soal,
    ak.benar,
    ak.salah,
    ak.kosong,
    ak.persen_benar,
    ak.tingkat_kelemahan,
    ak.rekomendasi,
    ak.created_at
FROM analisis_kelemahan ak
JOIN kategori_soal k ON ak.kategori_id = k.id
ORDER BY ak.persen_benar ASC;
