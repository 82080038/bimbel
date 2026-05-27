-- Sistem Materi Pembelajaran Fleksibel
-- Database hanya menyimpan referensi/link, konten ada di file/external

-- 1. Tabel Materi (Learning Materials)
CREATE TABLE IF NOT EXISTS materi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    kategori_id INT,
    topic_id INT,
    tipe_materi ENUM('text', 'video', 'audio', 'pdf', 'image', 'interactive', 'external') DEFAULT 'text',
    sumber_materi ENUM('wikipedia', 'youtube', 'local', 'custom', 'ai_generated') DEFAULT 'custom',
    file_path VARCHAR(500),  -- Path ke file lokal
    external_url VARCHAR(500),  -- URL external (Wikipedia, YouTube, dll)
    embed_code TEXT,  -- Untuk embed video/interactive content
    durasi_menit INT,  -- Estimasi durasi pembelajaran
    tingkat_kesulitan ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    urutan INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    INDEX idx_kategori (kategori_id),
    INDEX idx_topic (topic_id),
    INDEX idx_tipe (tipe_materi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Materi Sections (untuk materi panjang yang dibagi section)
CREATE TABLE IF NOT EXISTS materi_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materi_id INT NOT NULL,
    judul_section VARCHAR(255) NOT NULL,
    konten TEXT,  -- HTML content untuk section
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE,
    INDEX idx_materi (materi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Learning Progress (tracking progress murid)
CREATE TABLE IF NOT EXISTS learning_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    materi_id INT NOT NULL,
    section_id INT,  -- NULL jika materi tanpa section
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percent INT DEFAULT 0,  -- 0-100
    waktu_detalik INT DEFAULT 0,  -- Waktu yang dihabiskan (detik)
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (materi_id) REFERENCES materi(id),
    FOREIGN KEY (section_id) REFERENCES materi_sections(id),
    UNIQUE KEY unique_user_materi (user_id, materi_id, section_id),
    INDEX idx_user (user_id),
    INDEX idx_materi (materi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Quiz/Assessment untuk setiap materi
CREATE TABLE IF NOT EXISTS materi_quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materi_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tipe_quiz ENUM('pre_test', 'post_test', 'practice') DEFAULT 'practice',
    passing_score INT DEFAULT 70,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE,
    INDEX idx_materi (materi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Quiz Questions
CREATE TABLE IF NOT EXISTS materi_quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    soal_id INT,  -- Link ke tabel soal existing
    pertanyaan TEXT,  -- Atau custom question
    opsi_a TEXT,
    opsi_b TEXT,
    opsi_c TEXT,
    opsi_d TEXT,
    opsi_e TEXT,
    jawaban_benar CHAR(1),
    urutan INT DEFAULT 0,
    FOREIGN KEY (quiz_id) REFERENCES materi_quiz(id) ON DELETE CASCADE,
    FOREIGN KEY (soal_id) REFERENCES soal(id),
    INDEX idx_quiz (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Quiz Results
CREATE TABLE IF NOT EXISTS materi_quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT,
    total_questions INT,
    correct_answers INT,
    waktu_detik INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES materi_quiz(id),
    INDEX idx_user (user_id),
    INDEX idx_quiz (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Notes/Highlights (seperti catatan murid)
CREATE TABLE IF NOT EXISTS learning_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    materi_id INT NOT NULL,
    section_id INT,
    note_text TEXT,
    highlight_text TEXT,
    timestamp_position INT,  -- Posisi dalam video/audio (detik)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (materi_id) REFERENCES materi(id),
    FOREIGN KEY (section_id) REFERENCES materi_sections(id),
    INDEX idx_user (user_id),
    INDEX idx_materi (materi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Tabel Recommendations (AI-based learning path)
CREATE TABLE IF NOT EXISTS learning_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    materi_id INT NOT NULL,
    alasan TEXT,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_viewed TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (materi_id) REFERENCES materi(id),
    INDEX idx_user (user_id),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample materi dari Wikipedia scraping
INSERT INTO materi (judul, deskripsi, kategori_id, tipe_materi, sumber_materi, external_url, file_path, tingkat_kesulitan) VALUES
('Pancasila', 'Nilai-nilai Pancasila sebagai dasar negara', 1, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Pancasila', 'data/learning_materials/pancasila.json', 'intermediate'),
('UUD 1945', 'Ketentuan-ketentuan dalam Undang-Undang Dasar 1945', 1, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Undang-Undang_Dasar_1945', 'data/learning_materials/uud_1945.json', 'intermediate'),
('Sejarah Indonesia', 'Peristiwa-peristiwa penting dalam sejarah Indonesia', 1, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Sejarah_Indonesia', 'data/learning_materials/sejarah_indonesia.json', 'intermediate'),
('Bela Negara', 'Konsep dan implementasi bela negara', 1, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Bela_negara', 'data/learning_materials/bela_negara.json', 'intermediate'),
('Nasionalisme', 'Semangat nasionalisme dan cinta tanah air', 1, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Nasionalisme', 'data/learning_materials/nasionalisme.json', 'intermediate'),
('Deret Angka', 'Pola deret angka dan logika matematika', 2, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Barisan_(matematika)', 'data/learning_materials/deret_angka.json', 'intermediate'),
('Analogi', 'Hubungan analogi antara dua kata atau konsep', 2, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Analogi', 'data/learning_materials/analogi.json', 'intermediate'),
('Logika', 'Prinsip-prinsip logika dan penalaran', 2, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Logika', 'data/learning_materials/logika.json', 'intermediate'),
('Kepribadian', 'Aspek-aspek kepribadian manusia', 3, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Kepribadian', 'data/learning_materials/kepribadian.json', 'intermediate'),
('Motivasi', 'Teori dan prinsip motivasi', 3, 'text', 'wikipedia', 'https://id.wikipedia.org/wiki/Motivasi', 'data/learning_materials/motivasi.json', 'intermediate');
