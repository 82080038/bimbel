-- Tabel Paket Tryout
CREATE TABLE IF NOT EXISTS paket_tryout (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_paket VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    durasi INT DEFAULT 100, -- dalam menit
    kategori_id INT,
    total_soal INT DEFAULT 30,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id)
);

-- Insert sample paket data
INSERT INTO paket_tryout (nama_paket, deskripsi, durasi, kategori_id, total_soal) VALUES
('Paket 1 - TWK', 'Tes Wawasan Kebangsaan - Paket 1', 100, 1, 30),
('Paket 2 - TIU', 'Tes Intelegensi Umum - Paket 1', 100, 2, 30),
('Paket 3 - TKP', 'Tes Karakteristik Pribadi - Paket 1', 100, 3, 30),
('Paket 4 - Full SKD', 'Full Seleksi Kompetensi Dasar', 100, NULL, 100),
('Paket 5 - Latihan Mudah', 'Paket latihan dengan tingkat kesulitan mudah', 100, NULL, 50);
