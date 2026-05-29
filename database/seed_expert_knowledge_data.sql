-- Seed Expert Knowledge Data
-- Sample expert knowledge for learning tips and strategies

-- First, create expert knowledge categories if they don't exist
INSERT INTO expert_knowledge_category (id, nama_kategori, deskripsi) VALUES
(1, 'TWK', 'Tips dan strategi untuk Tes Wawasan Kebangsaan'),
(2, 'TIU', 'Tips dan strategi untuk Tes Intelegensi Umum'),
(3, 'TKP', 'Tips dan strategi untuk Tes Karakteristik Pribadi'),
(4, 'TPA', 'Tips dan strategi untuk Tes Potensi Akademik'),
(5, 'PSIKOLOGIS', 'Tips dan strategi untuk Tes Psikologis')
ON DUPLICATE KEY UPDATE nama_kategori=nama_kategori;

-- Seed expert knowledge
INSERT INTO expert_knowledge (kategori_id, sub_kategori, jenis_pengetahuan, judul, konten, kunci_kata, tingkat_kesulitan, prioritas, is_active, created_by) VALUES
-- TWK Knowledge
(1, 'TWK', 'metode_cepat', 'Metode Cepat Menjawab Soal TWK', 'Untuk soal TWK, fokus pada pemahaman konsep dasar nasionalisme, integritas, dan bela negara. Baca dengan teliti dan pilih jawaban yang paling mencerminkan nilai-nilai Pancasila.', 'TWK, metode_cepat, nasionalisme', 'sedang', 5, 1, 1),
(1, 'TWK', 'tips', 'Tips Menghafal UUD 1945', 'Gunakan teknik mnemonik untuk menghafal pasal-pasal UUD 1945. Kelompokkan pasal-pasal yang berkaitan dan buat cerita singkat untuk memudahkan penghafalan.', 'UUD 1945, hafalan, tips', 'mudah', 3, 1, 1),
(1, 'TWK', 'trik', 'Trik Cepat Menjawab Soal Bahasa Indonesia', 'Perhatikan struktur kalimat dan tata bahasa. Eliminasi jawaban yang jelas salah dengan memperhatikan ejaan dan tanda baca.', 'bahasa, trik, cepat', 'sedang', 4, 1, 1),

-- TIU Knowledge
(2, 'TIU', 'metode_cepat', 'Metode Cepat Menjawab Soal Numerik TIU', 'Untuk soal numerik, kerjakan yang mudah terlebih dahulu. Gunakan estimasi untuk mempercepat perhitungan. Perhatikan satuan dan konversi yang diperlukan.', 'TIU, numerik, metode_cepat', 'sedang', 5, 1, 1),
(2, 'TIU', 'tips', 'Tips Menyelesaikan Soal Verbal', 'Baca seluruh pertanyaan sebelum menjawab. Perhatikan sinonim dan antonim yang sering muncul. Latihan membaca cepat untuk meningkatkan kecepatan.', 'TIU, verbal, tips', 'mudah', 3, 1, 1),
(2, 'TIU', 'trik', 'Trik Menjawab Soal Figural', 'Cari pola berulang dalam gambar. Perhatikan rotasi, refleksi, dan perubahan ukuran. Gambar pola di kertas jika perlu untuk memvisualisasikan.', 'TIU, figural, trik', 'sedang', 4, 1, 1),

-- TKP Knowledge
(3, 'TKP', 'metode_cepat', 'Metode Menjawab Soal TKP', 'Jawab dengan jujur sesuai kepribadian Anda. TKP mengukur karakteristik pribadi, bukan benar-salah. Konsistensi jawaban sangat penting.', 'TKP, metode_cepat, karakter', 'mudah', 5, 1, 1),
(3, 'TKP', 'tips', 'Tips Menjaga Konsistensi Jawaban TKP', 'Sebelum mengerjakan, pahami nilai-nilai yang ingin diukur. Jawab berdasarkan situasi nyata, bukan jawaban ideal. Hindarilah jawaban ekstrem.', 'TKP, konsistensi, tips', 'sedang', 4, 1, 1),

-- TPA Knowledge
(4, 'TPA', 'metode_cepat', 'Metode Menjawab Soal TPA', 'Kelola waktu dengan baik. TPA menguji potensi, bukan pengetahuan. Fokus pada logika dan penalaran, bukan menghafal rumus.', 'TPA, metode_cepat, logika', 'sedang', 5, 1, 1),
(4, 'TPA', 'tips', 'Tips Meningkatkan Skor TPA', 'Latihan soal TPA secara rutin. Pelajari pola soal yang sering muncul. Tingkatkan kecepatan membaca dan berpikir logis.', 'TPA, tips, skor', 'mudah', 3, 1, 1),

-- Psikologis Knowledge
(5, 'PSIKOLOGIS', 'metode_cepat', 'Metode Menghadapi Tes Psikologis', 'Jangan berpura-pura. Jawab sesuai kepribadian asli Anda. Tes psikologis dirancang untuk mendeteksi ketidakkonsistenan.', 'psikotes, metode_cepat, jujur', 'sedang', 5, 1, 1),
(5, 'PSIKOLOGIS', 'tips', 'Tips Menjawab Tes Wartegg', 'Jawab dengan spontan dan jujur. Gambar sesuai urutan tanpa berpikir terlalu lama. Kualitas gambar tidak dinilai, tapi cara Anda menggambar.', 'wartegg, tips, spontan', 'mudah', 4, 1, 1)
ON DUPLICATE KEY UPDATE judul=judul;
