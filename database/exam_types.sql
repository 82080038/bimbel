-- Exam Types Table
-- Created: 2026-05-18
-- Purpose: Store exam type configurations
-- Updated: 2026-05-27 - Updated passing grades to official MENPAN values

CREATE TABLE IF NOT EXISTS exam_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    passing_grade_twk INT DEFAULT 65,
    passing_grade_tiu INT DEFAULT 80,
    passing_grade_tkp INT DEFAULT 166,
    passing_grade_tpa INT DEFAULT 0,
    passing_grade_psikologis INT DEFAULT 0,
    passing_grade_total INT DEFAULT 550,
    durasi_menit INT DEFAULT 100,
    jumlah_soal INT DEFAULT 130,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default exam types with official MENPAN passing grades
INSERT INTO exam_types (code, name, description, icon, color, is_active, passing_grade_twk, passing_grade_tiu, passing_grade_tkp, passing_grade_tpa, passing_grade_psikologis, passing_grade_total, durasi_menit, jumlah_soal) VALUES
('SKD', 'Seleksi Kompetensi Dasar', 'Tes Wawasan Kebangsaan, Tes Intelegensia Umum, Tes Karakteristik Pribadi (Official MENPAN)', 'graduation-cap', '#3498db', TRUE, 65, 80, 166, 0, 0, 550, 100, 130),
('SKB', 'Seleksi Kompetensi Bidang', 'Tes sesuai dengan bidang pekerjaan yang dilamar', 'briefcase', '#e74c3c', TRUE, 0, 0, 0, 10, 10, 0, 90, 100),
('UTBK', 'Ujian Tulis Berbasis Komputer', 'Tes untuk masuk PTN', 'university', '#9b59b6', TRUE, 0, 0, 0, 10, 10, 0, 120, 180),
('TRYOUT', 'Tryout Ujian', 'Simulasi ujian untuk latihan (adjusted for fewer questions)', 'clipboard-list', '#2ecc71', TRUE, 15, 15, 15, 10, 10, 40, 100, 130)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
