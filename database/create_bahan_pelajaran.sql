-- Tabel bahan_pelajaran untuk menyimpan materi pembelajaran per soal
CREATE TABLE IF NOT EXISTS bahan_pelajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soal_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    konten TEXT,
    tipe ENUM('teks', 'video', 'audio', 'interactive', 'html') DEFAULT 'teks',
    file_path VARCHAR(500),
    external_url VARCHAR(500),
    urutan INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE,
    INDEX idx_soal (soal_id),
    INDEX idx_tipe (tipe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel materi_soal untuk relasi many-to-many antara materi dan soal
CREATE TABLE IF NOT EXISTS materi_soal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materi_id INT NOT NULL,
    soal_id INT NOT NULL,
    relevance_score DECIMAL(3,2) DEFAULT 1.00,
    auto_linked TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE,
    UNIQUE KEY unique_materi_soal (materi_id, soal_id),
    INDEX idx_materi (materi_id),
    INDEX idx_soal (soal_id),
    INDEX idx_relevance (relevance_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel topic_keywords untuk auto-detection topik baru
CREATE TABLE IF NOT EXISTS topic_keywords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(100) NOT NULL,
    materi_id INT,
    frequency INT DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE SET NULL,
    UNIQUE KEY unique_keyword (keyword),
    INDEX idx_keyword (keyword),
    INDEX idx_frequency (frequency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
