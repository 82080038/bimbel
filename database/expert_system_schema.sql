-- Sistem Pakar untuk Bimbel CPNS
-- Tabel untuk menyimpan aturan dan pengetahuan pakar

-- Tabel kategori pengetahuan pakar
CREATE TABLE IF NOT EXISTS expert_knowledge_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel pengetahuan pakar (trik, tips, metode cepat)
CREATE TABLE IF NOT EXISTS expert_knowledge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT NOT NULL,
    sub_kategori VARCHAR(100), -- TWK, TIU, TKP, TPA, PSIKOLOGIS
    jenis_pengetahuan ENUM('trik', 'tips', 'metode_cepat', 'logika', 'pembahasan') NOT NULL,
    judul VARCHAR(255) NOT NULL,
    konten TEXT NOT NULL,
    contoh_soaL TEXT,
    contoh_penyelesaian TEXT,
    kunci_kata VARCHAR(255), -- untuk matching dengan pertanyaan
    tingkat_kesulitan ENUM('mudah', 'sedang', 'sulit'),
    prioritas INT DEFAULT 0, -- semakin tinggi semakin prioritas
    is_active TINYINT(1) DEFAULT 1,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES expert_knowledge_category(id)
);

-- Tabel pola pertanyaan untuk automatic matching
CREATE TABLE IF NOT EXISTS question_pattern (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_soal_id INT, -- 1=TWK, 2=TIU, 3=TKP, 4=TPA, 5=PSIKOLOGIS
    tipe_pertanyaan VARCHAR(100), -- analogi, deret, silogisme, trigonometri, dll
    pola_kata VARCHAR(255), -- keywords untuk matching
    expert_knowledge_id INT, -- referensi ke pengetahuan pakar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_soal_id) REFERENCES kategori_soal(id),
    FOREIGN KEY (expert_knowledge_id) REFERENCES expert_knowledge(id)
);

-- Tabel riwayat bantuan pakar (tracking penggunaan)
CREATE TABLE IF NOT EXISTS expert_assistance_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    soal_id INT,
    expert_knowledge_id INT,
    jenis_bantuan ENUM('trik', 'tips', 'pembahasan', 'metode_cepat'),
    rating TINYINT(1), -- 1-5
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (soal_id) REFERENCES soal(id),
    FOREIGN KEY (expert_knowledge_id) REFERENCES expert_knowledge(id)
);

-- Tabel rekomendasi belajar berdasarkan pakar
CREATE TABLE IF NOT EXISTS expert_learning_recommendation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    kategori_kelemahan VARCHAR(100),
    expert_knowledge_id INT,
    prioritas INT DEFAULT 0,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (expert_knowledge_id) REFERENCES expert_knowledge(id)
);

-- Insert initial data
INSERT INTO expert_knowledge_category (nama_kategori, deskripsi) VALUES
('Trik Cepat', 'Metode cepat untuk menyelesaikan soal'),
('Tips Strategis', 'Strategi menjawab berdasarkan tipe soal'),
('Logika Penyelesaian', 'Penjelasan logika di balik jawaban'),
('Pembahasan Detail', 'Pembahasan lengkap dengan langkah-langkah'),
('Metode Bimbel', 'Metode yang digunakan bimbel profesional');

-- Sample data untuk TWK
INSERT INTO expert_knowledge (kategori_id, sub_kategori, jenis_pengetahuan, judul, konten, kunci_kata, tingkat_kesulitan, prioritas) VALUES
(1, 'TWK', 'tips', 'Tips Jawab TWK: Fokus pada UUD 1945', 'Untuk soal TWK tentang UUD 1945, hafalkan pasal-pasal khususnya Pasal 27, 28, 29, 30, 31, 32, 33, 34 yang berkaitan dengan hak warga negara. Kunci: UUD, pasal, hak, warga negara', 'UUD 1945 pasal hak warga negara', 'sedang', 5),
(1, 'TWK', 'trik', 'Trik Cepat: Identifikasi Sila Pancasila', 'Untuk soal tentang sila Pancasila, ingat: Sila 1=Ketuhanan, Sila 2=Kemanusiaan, Sila 3=Persatuan, Sila 4=Kerakyatan, Sila 5=Keadilan. Kunci: Pancasila sila', 'mudah', 5);

-- Sample data untuk TIU
INSERT INTO expert_knowledge (kategori_id, sub_kategori, jenis_pengetahuan, judul, konten, kunci_kata, tingkat_kesulitan, prioritas) VALUES
(1, 'TIU', 'metode_cepat', 'Metode Cepat: Deret Aritmatika', 'Untuk deret aritmatika, cari selisih antar suku. Jika selisih konstan = deret aritmatika. Rumus: Un = a + (n-1)b. Kunci: deret aritmatika selisih', 'sedang', 5),
(1, 'TIU', 'logika', 'Logika Perbandingan', 'Untuk soal perbandingan, gunakan variabel untuk setiap entitas. Buat persamaan berdasarkan informasi soal, lalu selesaikan sistem persamaan. Kunci: perbandingan rasio variabel', 'sedang', 4);

-- Sample data untuk TKP
INSERT INTO expert_knowledge (kategori_id, sub_kategori, jenis_pengetahuan, judul, konten, kunci_kata, tingkat_kesulitan, prioritas) VALUES
(1, 'TKP', 'tips', 'Tips TKP: Fokus pada Kepentingan Institusi', 'Pilih jawaban yang menunjukkan kepentingan perusahaan/instansi di atas kepentingan pribadi. Hindari jawaban yang egois atau tidak profesional. Kunci: sikap perusahaan instansi profesional', 'mudah', 5),
(1, 'TKP', 'metode_cepat', 'Metode Cepat: Eliminasi Jawaban Negatif', 'Hapus jawaban yang menunjukkan sikap negatif, tidak profesional, atau egois. Pilih jawaban yang positif dan konstruktif. Kunci: sikap positif profesional', 'mudah', 4);
