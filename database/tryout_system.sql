-- Tryout System Database Schema
-- This schema supports the tryout learning system with recommendations and AI-generated questions

-- Table: learning_topics
-- Stores the topics that participants can study
CREATE TABLE IF NOT EXISTS learning_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL,
    kategori VARCHAR(50) NOT NULL, -- TWK, TIU, TKP, TPA
    description TEXT,
    difficulty_level ENUM('mudah', 'sedang', 'sulit') DEFAULT 'sedang',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_kategori (kategori),
    INDEX idx_difficulty (difficulty_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: participant_learning_progress
-- Tracks which topics each participant has studied
CREATE TABLE IF NOT EXISTS participant_learning_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    studied_at TIMESTAMP NULL,
    completion_percentage INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_topic (user_id, topic_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: learning_recommendations
-- Stores recommendations for what participants should study
CREATE TABLE IF NOT EXISTS learning_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    recommendation_type ENUM('weakness', 'priority', 'suggested') DEFAULT 'suggested',
    reason TEXT,
    priority INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_priority (priority),
    INDEX idx_type (recommendation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: tryout_sessions
-- Stores tryout sessions for participants
CREATE TABLE IF NOT EXISTS tryout_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    session_name VARCHAR(255),
    total_questions INT DEFAULT 10,
    duration_minutes INT DEFAULT 30,
    score INT,
    status ENUM('created', 'in_progress', 'completed', 'cancelled') DEFAULT 'created',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: ai_generated_questions
-- Stores AI-generated questions for tryouts
CREATE TABLE IF NOT EXISTS ai_generated_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tryout_session_id INT NOT NULL,
    topic_id INT NOT NULL,
    pertanyaan TEXT NOT NULL,
    jawaban_a TEXT,
    jawaban_b TEXT,
    jawaban_c TEXT,
    jawaban_d TEXT,
    jawaban_e TEXT,
    jawaban_benar CHAR(1),
    pembahasan TEXT,
    difficulty ENUM('mudah', 'sedang', 'sulit') DEFAULT 'sedang',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tryout_session_id) REFERENCES tryout_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE,
    INDEX idx_session_id (tryout_session_id),
    INDEX idx_topic_id (topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: tryout_answers
-- Stores participant answers to tryout questions
CREATE TABLE IF NOT EXISTS tryout_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tryout_session_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer CHAR(1),
    is_correct BOOLEAN,
    time_taken_seconds INT,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tryout_session_id) REFERENCES tryout_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES ai_generated_questions(id) ON DELETE CASCADE,
    INDEX idx_session_id (tryout_session_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial learning topics based on the topic analysis
INSERT IGNORE INTO learning_topics (topic_name, kategori, description, difficulty_level) VALUES
-- TWK Topics
('Pancasila', 'TWK', 'Pancasila adalah ideologi dasar negara Indonesia yang terdiri dari lima sila.', 'sedang'),
('Pancasila - Sila-sila Pancasila', 'TWK', 'Sila-sila Pancasila adalah lima prinsip dasar yang menjadi fondasi negara Indonesia.', 'sedang'),
('Pancasila sebagai Ideologi Negara', 'TWK', 'Pancasila sebagai ideologi terbuka berfungsi sebagai pedoman hidup dan bernegara.', 'sulit'),
('UUD 1945', 'TWK', 'Undang-Undang Dasar 1945 adalah konstitusi tertinggi negara Indonesia.', 'sedang'),
('UUD 1945 dan Amandemen', 'TWK', 'UUD 1945 telah mengalami empat kali amandemen pada periode 1999-2002.', 'sulit'),
('Wawasan Nusantara dan NKRI', 'TWK', 'Wawasan Nusantara adalah cara pandang bangsa Indonesia mengenai diri dan lingkungannya.', 'sedang'),
('Sejarah Indonesia', 'TWK', 'Sejarah Indonesia mencakup perjalanan bangsa dari masa pra-kolonial hingga kini.', 'sedang'),
('Sejarah Indonesia - Proklamasi Kemerdekaan', 'TWK', 'Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal 17 Agustus 1945.', 'sedang'),
('Sejarah Indonesia - Organisasi Pergerakan Nasional', 'TWK', 'Organisasi pergerakan nasional berperan penting dalam perjuangan kemerdekaan.', 'sedang'),
('Bhinneka Tunggal Ika dan Persatuan Nasional', 'TWK', 'Bhinneka Tunggal Ika adalah semboyan negara Indonesia yang berarti "Berbeda-beda tetapi tetap satu".', 'sedang'),
('Bela Negara', 'TWK', 'Bela negara adalah sikap dan tindakan warga negara yang diwujudkan dalam kesetiaan dan cinta tanah air.', 'sedang'),
('Sistem Politik dan Pemerintahan Indonesia', 'TWK', 'Sistem politik Indonesia berdasarkan demokrasi Pancasila dengan sistem presidensial.', 'sulit'),
('Geografi Indonesia', 'TWK', 'Geografi Indonesia mencakup posisi strategis dan keberagaman wilayah.', 'mudah'),
('Sosial dan Budaya Indonesia', 'TWK', 'Indonesia memiliki keberagaman sosial dan budaya yang kaya.', 'mudah'),
('Hak Asasi Manusia', 'TWK', 'Hak Asasi Manusia adalah hak-hak dasar yang melekat pada diri manusia.', 'sedang'),
('Wawasan Kebangsaan', 'TWK', 'Wawasan kebangsaan adalah pemahaman tentang sejarah, budaya, dan nilai-nilai kebangsaan Indonesia.', 'sedang'),

-- TIU Topics
('Analogi Verbal', 'TIU', 'Analogi verbal adalah kemampuan untuk menemukan hubungan antara dua kata atau konsep.', 'sedang'),
('Analogi', 'TIU', 'Analogi adalah kemampuan untuk menemukan pola hubungan antara dua hal.', 'sedang'),
('Deret Angka', 'TIU', 'Deret angka adalah rangkaian bilangan yang mengikuti pola tertentu.', 'sedang'),
('Silogisme dan Penarikan Kesimpulan', 'TIU', 'Silogisme adalah bentuk penalaran deduktif yang terdiri dari premis-premis dan kesimpulan.', 'sulit'),
('Logika Silogisme', 'TIU', 'Logika silogisme adalah kemampuan untuk menarik kesimpulan dari premis yang diberikan.', 'sulit'),
('Penalaran Verbal', 'TIU', 'Penalaran verbal adalah kemampuan untuk memahami informasi verbal dan menarik kesimpulan logis.', 'sedang'),
('Hubungan Kata', 'TIU', 'Hubungan kata adalah kemampuan untuk memahami keterkaitan makna antar kata.', 'mudah'),
('Aritmatika Dasar', 'TIU', 'Aritmatika dasar mencakup operasi matematika fundamental.', 'mudah'),
('Logika Matematika', 'TIU', 'Logika matematika adalah kemampuan untuk berpikir secara sistematis dan logis.', 'sedang'),
('Inteligensia Umum', 'TIU', 'Inteligensia umum mencakup berbagai kemampuan kognitif seperti penalaran dan pemecahan masalah.', 'sedang'),

-- TKP Topics
('Etika Kerja', 'TKP', 'Etika kerja adalah seperangkat nilai dan prinsip moral yang menuntun perilaku dalam lingkungan kerja.', 'sedang'),
('Etika Kerja - Hubungan dengan Rekan Kerja', 'TKP', 'Hubungan dengan rekan kerja yang baik meliputi sikap saling menghormati dan kerja sama.', 'sedang'),
('Etika Kerja - Hubungan dengan Atasan', 'TKP', 'Hubungan dengan atasan yang baik meliputi sikap hormat dan patuh pada instruksi yang sah.', 'sedang'),
('Etika Kerja - Menangani Kesalahan', 'TKP', 'Menangani kesalahan dengan baik meliputi mengakui kesalahan dan memperbaikinya.', 'sedang'),
('Kepemimpinan', 'TKP', 'Kepemimpinan adalah kemampuan untuk mempengaruhi, memotivasi, dan mengarahkan orang lain.', 'sulit'),
('Kerja Sama Tim', 'TKP', 'Kerja sama tim adalah kemampuan untuk bekerja bersama dengan orang lain secara efektif.', 'sedang'),
('Integritas dan Kejujuran', 'TKP', 'Integritas adalah kesesuaian antara kata dan perbuatan. Kejujuran adalah sikap untuk selalu berkata benar.', 'sedang'),
('Tanggung Jawab', 'TKP', 'Tanggung jawab adalah kesediaan untuk menerima akibat dari tindakan dan keputusan yang diambil.', 'sedang'),
('Pemecahan Masalah', 'TKP', 'Pemecahan masalah adalah kemampuan untuk mengidentifikasi masalah dan mencari solusi.', 'sedang'),
('Penanganan Situasi Darurat', 'TKP', 'Penanganan situasi darurat adalah kemampuan untuk bertindak cepat dan tepat dalam situasi yang membutuhkan respons segera.', 'sedang'),
('Sikap dan Perilaku', 'TKP', 'Sikap dan perilaku yang baik mencakup kejujuran, tanggung jawab, dan kerja sama.', 'sedang'),
('Karakteristik Pribadi', 'TKP', 'Karakteristik pribadi adalah sifat-sifat yang melekat pada diri seseorang yang mempengaruhi cara berpikir dan bertindak.', 'sedang'),

-- TPA Topics
('Sinonim Kata', 'TPA', 'Sinonim adalah kata yang memiliki makna yang sama atau mirip dengan kata lain.', 'mudah'),
('Antonim Kata', 'TPA', 'Antonim adalah kata yang memiliki makna yang berlawanan dengan kata lain.', 'mudah'),
('Kosakata', 'TPA', 'Kosakata adalah kumpulan kata yang dimiliki seseorang.', 'mudah'),
('Pemahaman Bacaan', 'TPA', 'Pemahaman bacaan adalah kemampuan untuk memahami, menganalisis, dan menafsirkan informasi dari teks tertulis.', 'sedang'),
('Potensi Akademik', 'TPA', 'Potensi akademik adalah kemampuan seseorang dalam bidang akademik yang meliputi kemampuan verbal, numerik, dan logis.', 'sedang');
