-- Tabel untuk bahan pelajaran
CREATE TABLE IF NOT EXISTS bahan_pelajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soal_id INT NOT NULL,
    judul VARCHAR(255),
    konten LONGTEXT,
    tipe ENUM('teks', 'video', 'pdf', 'link') DEFAULT 'teks',
    url VARCHAR(500),
    file_path VARCHAR(255),
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
);

-- Tabel untuk rekomendasi belajar peserta
CREATE TABLE IF NOT EXISTS rekomendasi_belajar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    sesi_id INT,
    soal_id INT,
    alasan ENUM('salah', 'ragu', 'review') NOT NULL,
    status ENUM('pending', 'dipelajari', 'dikuasai') DEFAULT 'pending',
    dipelajari_pada TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
);

-- Tabel untuk topik pelajaran (untuk grouping)
CREATE TABLE IF NOT EXISTS topik_pelajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT,
    nama_topik VARCHAR(200),
    deskripsi TEXT,
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id)
);

-- Relasi soal ke topik
CREATE TABLE IF NOT EXISTS soal_topik (
    soal_id INT,
    topik_id INT,
    PRIMARY KEY (soal_id, topik_id),
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE,
    FOREIGN KEY (topik_id) REFERENCES topik_pelajaran(id) ON DELETE CASCADE
);

-- View untuk bahan pelajaran lengkap dengan info soal
CREATE OR REPLACE VIEW v_bahan_pelajaran_lengkap AS
SELECT 
    bp.id,
    bp.soal_id,
    s.pertanyaan,
    s.kategori_id,
    k.nama_kategori,
    bp.judul,
    bp.konten,
    bp.tipe,
    bp.url,
    bp.file_path,
    bp.urutan,
    s.jawaban_benar,
    s.pembahasan
FROM bahan_pelajaran bp
JOIN soal s ON bp.soal_id = s.id
JOIN kategori_soal k ON s.kategori_id = k.id;

-- View untuk rekomendasi belajar peserta
CREATE OR REPLACE VIEW v_rekomendasi_belajar AS
SELECT 
    rb.id,
    rb.user_id,
    rb.sesi_id,
    rb.soal_id,
    s.pertanyaan,
    s.kategori_id,
    k.nama_kategori,
    rb.alasan,
    rb.status,
    rb.dipelajari_pada,
    rb.created_at,
    s.jawaban_benar,
    s.pembahasan
FROM rekomendasi_belajar rb
JOIN soal s ON rb.soal_id = s.id
JOIN kategori_soal k ON s.kategori_id = k.id;

-- Insert sample topik
INSERT INTO topik_pelajaran (kategori_id, nama_topik, deskripsi, urutan) VALUES
(1, 'Ideologi Pancasila', 'Materi tentang ideologi dan dasar negara', 1),
(1, 'Sejarah Indonesia', 'Sejarah perjuangan dan kemerdekaan Indonesia', 2),
(1, 'Geografi Indonesia', 'Geografi dan wilayah Indonesia', 3),
(2, 'Logika Matematika', 'Pemecahan masalah logis dan matematika', 1),
(2, 'Verbal Reasoning', 'Penalaran verbal dan bahasa', 2),
(2, 'Spasial Reasoning', 'Penalaran spasial dan visual', 3),
(3, 'Kepribadian', 'Asesmen kepribadian dan karakter', 1),
(3, 'Etika Kerja', 'Etika dan profesionalisme kerja', 2);
