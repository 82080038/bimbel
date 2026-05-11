-- HIGH PRIORITY Improvements Database Schema

-- 1. Sertifikat Digital Improvements
CREATE TABLE IF NOT EXISTS sertifikat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_peserta VARCHAR(100),
    hasil_id INT,
    verification_code VARCHAR(32) UNIQUE,
    qr_code TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (hasil_id) REFERENCES hasil_ujian(id)
);

-- 2. Leaderboard Opt-out
CREATE TABLE IF NOT EXISTS leaderboard_optout (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_peserta VARCHAR(100) UNIQUE,
    opted_out_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Paket Blueprint
CREATE TABLE IF NOT EXISTS paket_blueprint (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paket_id INT,
    kategori_id INT,
    target_count INT DEFAULT 0,
    min_difficulty ENUM('mudah', 'sedang', 'sulit') DEFAULT 'sedang',
    max_difficulty ENUM('mudah', 'sedang', 'sulit') DEFAULT 'sedang',
    FOREIGN KEY (paket_id) REFERENCES paket_tryout(id) ON DELETE CASCADE,
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id)
);

-- Update existing hasil_ujian with verification codes
UPDATE hasil_ujian SET verification_code = MD5(CONCAT(id, nama_peserta, tanggal_ujian)) WHERE verification_code IS NULL;
