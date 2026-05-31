-- Add sample data for courses
INSERT INTO courses (judul, deskripsi, kategori, tags, urutan, status, created_by) VALUES
('Dasar TWK', 'Pengenalan Tes Wawasan Kebangsaan', 'TWK', 'twk, dasar, pemula', 1, 'published', 1),
('Dasar TIU', 'Pengenalan Tes Intelegensia Umum', 'TIU', 'tiu, dasar, pemula', 2, 'published', 1),
('Dasar TKP', 'Pengenalan Tes Karakteristik Pribadi', 'TKP', 'tkp, dasar, pemula', 3, 'published', 1);

-- Add sample data for expert_knowledge
INSERT INTO expert_knowledge (kategori_id, sub_kategori, jenis_pengetahuan, judul, konten, kunci_kata, tingkat_kesulitan, prioritas, is_active, created_by) VALUES
(1, 'TWK', 'trik', 'Trik Cepat TWK', 'Gunakan eliminasi jawaban untuk mempersempit pilihan', 'trik, cepat, eliminasi', 'mudah', 10, 1, 1),
(2, 'TIU', 'trik', 'Trik Cepat TIU', 'Fokus pada pola angka dan deret', 'trik, cepat, pola', 'mudah', 10, 1, 1),
(3, 'TKP', 'trik', 'Trik Cepat TKP', 'Pahami nilai pribadi dan etika kerja', 'trik, cepat, etika', 'mudah', 10, 1, 1),
(1, 'TWK', 'tips', 'Tips TWK', 'Baca soal dengan teliti sebelum menjawab', 'tips, teliti, baca', 'sedang', 5, 1, 1),
(2, 'TIU', 'tips', 'Tips TIU', 'Latihan soal setiap hari untuk meningkatkan kecepatan', 'tips, latihan, kecepatan', 'sedang', 5, 1, 1);
