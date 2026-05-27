-- Add new exam types to kategori_soal table
-- Based on post-SMA exam types research

-- Insert new exam types if not exists
INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('SNBT_TPS', 'Tes Potensi Skolastik - Seleksi Nasional Berbasis Tes', 'Mengukur kemampuan berpikir, penalaran umum, kuantitatif, verbal, dan pemahaman umum', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('SNBT_LITERASI', 'Tes Literasi - Seleksi Nasional Berbasis Tes', 'Mengukur literasi bahasa Indonesia, bahasa Inggris, dan penalaran matematika', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('SNBT_SAINTEK', 'Tes Kompetensi Akademik Saintek - SNBT', 'Matematika, Fisika, Kimia, Biologi', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('SNBT_SOSHUM', 'Tes Kompetensi Akademik Soshum - SNBT', 'Sosiologi, Sejarah, Geografi, Ekonomi', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('TNI_AKADEMIK', 'Tes Akademik TNI', 'Matematika, Bahasa Indonesia, Bahasa Inggris, IPA, IPS', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('TNI_PSIKOLOGI', 'Tes Psikologi TNI', 'IQ, kepribadian, minat bakat, ketahanan mental', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('POLRI_AKADEMIK', 'Tes Akademik Polri', 'Matematika, Bahasa Indonesia, Bahasa Inggris, Pengetahuan Umum', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('POLRI_PSIKOLOGI', 'Tes Psikologi Polri', 'Psikotes kecerdasan, kepribadian, minat bakat', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

INSERT INTO kategori_soal (nama_kategori, deskripsi, materi_description, passing_grade) VALUES
('BUMN_TPA', 'Tes Potensi Akademik BUMN', 'Verbal, numerik, logika, spatial', 0) ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

-- Add soal_source table to track question sources
CREATE TABLE IF NOT EXISTS soal_source (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL,
    source_url VARCHAR(500),
    source_type ENUM('official', 'practice', 'news', 'youtube', 'other') DEFAULT 'other',
    last_scraped TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,
    INDEX idx_source_name (source_name),
    INDEX idx_source_type (source_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add soal_duplicate_check table for duplicate detection
CREATE TABLE IF NOT EXISTS soal_duplicate_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soal_hash VARCHAR(64) NOT NULL UNIQUE,
    soal_id INT,
    source_id INT,
    found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_soal_hash (soal_hash),
    INDEX idx_soal_id (soal_id),
    INDEX idx_source_id (source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial sources
INSERT INTO soal_source (source_name, source_url, source_type) VALUES
('Detik Edu', 'https://www.detik.com/edu', 'news'),
('CNN Indonesia Edukasi', 'https://www.cnnindonesia.com/edukasi', 'news'),
('Tempo', 'https://www.tempo.co', 'news'),
('Zenius', 'https://zenius.net', 'practice'),
('Danacita', 'https://danacita.co.id', 'practice'),
('Skill Academy', 'https://skillacademy.com', 'practice'),
('LTMPT', 'https://ltmpt.ac.id', 'official'),
('BKN', 'https://bkn.go.id', 'official'),
('TNI', 'https://tni-ad.mil.id', 'official'),
('Polri', 'https://polri.go.id', 'official'),
('BUMN', 'https://bumn.go.id', 'official')
ON DUPLICATE KEY UPDATE source_name = source_name;
