-- Seed Courses Data
-- Sample courses for learning

INSERT INTO courses (id, judul, deskripsi, kategori, tags, status, urutan, created_at) VALUES
(1, 'Dasar Tes Wawasan Kebangsaan', 'Pelajari fundamental TWK: nasionalisme, integritas, bela negara', 'TWK', 'beginner,nasionalisme', 'published', 1, NOW()),
(2, 'Strategi Menjawab TIU', 'Teknik cepat menyelesaikan soal TIU: verbal, numerik, figural', 'TIU', 'intermediate,strategi', 'published', 2, NOW()),
(3, 'Menguasai TKP', 'Pahami karakteristik pribadi dan cara menjawab TKP', 'TKP', 'beginner,karakter', 'published', 3, NOW()),
(4, 'TPA untuk Pemula', 'Dasar Tes Potensi Akademik: bahasa, numerik, logika', 'TPA', 'beginner,dasar', 'published', 4, NOW()),
(5, 'Advanced TIU', 'Soal-soal sulit TIU dengan strategi penyelesaian', 'TIU', 'advanced,lanjut', 'published', 5, NOW()),
(6, 'Psikotes Preparation', 'Persiapan tes psikologi untuk sekolah kedinasan', 'PSIKOLOGIS', 'intermediate,psikotes', 'published', 6, NOW())
ON DUPLICATE KEY UPDATE judul=judul;

-- Course Modules
INSERT INTO course_modules (id, course_id, judul, deskripsi, urutan) VALUES
-- TWK Course Modules
(1, 1, 'Pilar Negara', 'Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika', 1),
(2, 1, 'Nasionalisme', 'Semangat cinta tanah air dan bangsa', 2),
(3, 1, 'Integritas', 'Konsistensi antara ucapan dan tindakan', 3),
(4, 1, 'Bela Negara', 'Siap sedia membela negara', 4),
(5, 1, 'Bahasa Indonesia', 'Penguasaan bahasa Indonesia yang baik dan benar', 5),

-- TIU Course Modules
(6, 2, 'Tes Verbal', 'Sinonim, antonim, analogi, klasifikasi kata', 1),
(7, 2, 'Tes Numerik', 'Aritmetika, aljabar, deret angka', 2),
(8, 2, 'Tes Figural', 'Pola gambar, hubungan spasial', 3),
(9, 2, 'Logika Analitis', 'Penalaran logis dan analitis', 4),

-- TKP Course Modules
(10, 3, 'Karakteristik Pribadi', 'Memahami diri sendiri', 1),
(11, 3, 'Sikap Kerja', 'Etos kerja dan profesionalisme', 2),
(12, 3, 'Interaksi Sosial', 'Komunikasi dan kerjasama', 3),

-- TPA Course Modules
(13, 4, 'Bahasa', 'Pemahaman bacaan dan struktur kalimat', 1),
(14, 4, 'Numerik', 'Operasi matematika dan problem solving', 2),
(15, 4, 'Logika', 'Penalaran abstrak dan konkrit', 3),
(16, 4, 'Spasial', 'Visualisasi dan rotasi objek', 4),

-- Advanced TIU Modules
(17, 5, 'Soal Sulit Verbal', 'Tantangan verbal tingkat lanjut', 1),
(18, 5, 'Soal Sulit Numerik', 'Matematika kompleks', 2),
(19, 5, 'Soal Sulit Figural', 'Pola gambar rumit', 3),
(20, 5, 'Strategi Cepat', 'Tips dan trik penyelesaian', 4),

-- Psikotes Modules
(21, 6, 'Kepribadian', 'Tes Wartegg dan tes kepribadian lain', 1),
(22, 6, 'Motivasi', 'Motivasi kerja dan tujuan karir', 2),
(23, 6, 'Pengendalian Diri', 'Manajemen emosi dan stres', 3)
ON DUPLICATE KEY UPDATE judul=judul;

-- Course Materials
INSERT INTO course_materials (id, module_id, judul, konten, tipe, urutan) VALUES
-- Sample materials for first module
(1, 1, 'Pancasila sebagai Dasar Negara', 'Pancasila adalah ideologi dasar negara Indonesia yang terdiri dari 5 sila: Ketuhanan Yang Maha Esa, Kemanusiaan yang Adil dan Beradab, Persatuan Indonesia, Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan, dan Keadilan Sosial bagi Seluruh Rakyat Indonesia.', 'teks', 1),
(2, 1, 'UUD 1945', 'Undang-Undang Dasar 1945 adalah konstitusi tertulis negara Indonesia yang menjadi sumber dari segala sumber hukum. UUD 1945 mengatur tentang tatanan negara, kedaulatan rakyat, dan hak asasi manusia.', 'teks', 2),
(3, 6, 'Sinonim', 'Sinonim adalah kata yang memiliki makna yang sama atau mirip. Contoh: besar = agung, kecil = mungil, cepat = kilat. Tips: sering membaca kamus dan literatur untuk memperkaya kosakata.', 'teks', 1),
(4, 6, 'Antonim', 'Antonim adalah kata yang memiliki makna yang berlawanan. Contoh: besar ↔ kecil, cepat ↔ lambat, tinggi ↔ rendah. Tips: perhatikan konteks kalimat untuk menentukan antonim yang tepat.', 'teks', 2)
ON DUPLICATE KEY UPDATE judul=judul;

-- Learning Paths
INSERT INTO learning_paths (id, judul, deskripsi) VALUES
(1, 'Path to SKD Success', 'Learning path lengkap untuk persiapan SKD'),
(2, 'TWK Mastery', 'Fokus khusus pada TWK'),
(3, 'TIU Excellence', 'Fokus khusus pada TIU'),
(4, 'Complete Beginner', 'Untuk pemula total')
ON DUPLICATE KEY UPDATE judul=judul;

-- User Learning Paths (assign to test user)
INSERT INTO user_learning_paths (user_id, learning_path_id) VALUES
(24, 1),
(24, 4)
ON DUPLICATE KEY UPDATE status=status;
