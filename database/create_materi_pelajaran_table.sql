-- Tabel materi_pelajaran untuk struktur 3-level: kategori -> topic -> materi
-- Created: 2026-05-25

CREATE TABLE IF NOT EXISTS materi_pelajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT NOT NULL,
    topic_id INT NOT NULL,
    nama_materi VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topik_pelajaran(id) ON DELETE CASCADE,
    UNIQUE KEY unique_materi (kategori_id, topic_id, nama_materi),
    INDEX idx_kategori_topic (kategori_id, topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data materi untuk TWK (Kategori 1)
INSERT INTO materi_pelajaran (kategori_id, topic_id, nama_materi, deskripsi, urutan) VALUES
-- Ideologi Pancasila (Topic ID: 1)
(1, 1, 'Arti Kata dan Asal Usul Pancasila', 'Memahami etimologi dan sejarah perumusan Pancasila', 1),
(1, 1, 'Kedudukan dan Fungsi Pancasila', 'Pancasila sebagai dasar negara, ideologi, dan pandangan hidup', 2),
(1, 1, 'Nilai-Nilai dalam Pancasila', 'Nilai ketuhanan, kemanusiaan, persatuan, demokrasi, keadilan', 3),
(1, 1, 'Pancasila sebagai Ideologi Negara', 'Pancasila sebagai ideologi terbuka dan integralistik', 4),
(1, 1, 'HAM dalam Pancasila', 'Hak asasi manusia dalam sila-sila Pancasila', 5),
(1, 1, 'Lambang Negara', 'Garuda Pancasila dan makna simboliknya', 6),
(1, 1, 'Sejarah Perumusan Pancasila', 'BPUPKI, PPKI, dan proses perumusan 1945', 7),
(1, 1, 'Pengamalan Pancasila', 'Butir-butir pengamalan Pancasila dalam kehidupan sehari-hari', 8),

-- Sejarah Indonesia (Topic ID: 2)
(1, 2, 'Kerajaan Hindu-Buddha', 'Majapahit, Sriwijaya, dan kerajaan lain di Nusantara', 1),
(1, 2, 'Periode Penjajahan', 'Portugis, VOC, Belanda, dan Jepang', 2),
(1, 2, 'Pergerakan Nasional', 'Budi Utomo, Sarekat Islam, PNI, dan organisasi pergerakan', 3),
(1, 2, 'Proklamasi Kemerdekaan', '17 Agustus 1945 dan peristiwa sekitarnya', 4),
(1, 2, 'Revolusi Kemerdekaan', 'Perang kemerdekaan dan pertahanan negara', 5),
(1, 2, 'Orde Lama', 'Demokrasi Liberal dan Demokrasi Terpimpin', 6),
(1, 2, 'Orde Baru', 'Pembangunan dan stabilitas politik', 7),
(1, 2, 'Reformasi', 'Gerakan reformasi 1998 dan perubahan politik', 8),

-- Geografi Indonesia (Topic ID: 3)
(1, 3, 'Letak Astronomis', 'Posisi Indonesia di garis lintang dan bujur', 1),
(1, 3, 'Letak Geografis', 'Posisi Indonesia di Asia Tenggara dan dunia', 2),
(1, 3, 'Letak Geologis', 'Pertemuan lempeng tektonik dan gempa bumi', 3),
(1, 3, 'Pulau-Pulau Besar', 'Jawa, Sumatera, Kalimantan, Sulawesi, Papua', 4),
(1, 3, 'Laut dan Selat', 'Samudra, selat, dan perairan Indonesia', 5),
(1, 3, 'Gunung dan Pegunungan', 'Gunung berapi dan pegunungan di Indonesia', 6),
(1, 3, 'Iklim Indonesia', 'Iklim tropis dan musim di Indonesia', 7),
(1, 3, 'Pembagian Wilayah', 'Provinsi dan administrasi wilayah Indonesia', 8);

-- Data materi untuk TIU (Kategori 2)
INSERT INTO materi_pelajaran (kategori_id, topic_id, nama_materi, deskripsi, urutan) VALUES
-- Logika Matematika (Topic ID: 4)
(2, 4, 'Operasi Bilangan', 'Penjumlahan, pengurangan, perkalian, pembagian', 1),
(2, 4, 'Deret Aritmatika', 'Pol deret angka dan aritmatika', 2),
(2, 4, 'Deret Geometri', 'Pol deret geometri dan rasio', 3),
(2, 4, 'Persamaan Linear', 'Persamaan satu dan dua variabel', 4),
(2, 4, 'Persentase dan Rasio', 'Perhitungan persentase dan proporsi', 5),
(2, 4, 'Faktor dan Kelipatan', 'Faktor persekutuan, KPK, FPB', 6),
(2, 4, 'Bilangan Prima', 'Identifikasi dan sifat bilangan prima', 7),
(2, 4, 'Pangkat dan Akar', 'Operasi pangkat dan akar bilangan', 8),

-- Verbal Reasoning (Topic ID: 5)
(2, 5, 'Sinonim', 'Kata yang memiliki makna sama', 1),
(2, 5, 'Antonim', 'Kata yang memiliki makna berlawanan', 2),
(2, 5, 'Analogi Kata', 'Hubungan antar kata dan pola analogi', 3),
(2, 5, 'Padanan Kata', 'Mencari padanan kata yang tepat', 4),
(2, 5, 'Makna Kata', 'Memahami arti dan konteks kata', 5),
(2, 5, 'Bacaan dan Pemahaman', 'Membaca teks dan memahami isi', 6),
(2, 5, 'Kesimpulan Bacaan', 'Menarik kesimpulan dari teks bacaan', 7),
(2, 5, 'Informasi Tersurat dan Tersirat', 'Informasi eksplisit dan implisit dalam teks', 8),

-- Spasial Reasoning (Topic ID: 6)
(2, 6, 'Bentuk Geometri', 'Segitiga, persegi, lingkaran, dan bangun datar', 1),
(2, 6, 'Kubus dan Balok', 'Volume, luas permukaan, dan sifat bangun ruang', 2),
(2, 7, 'Rotasi dan Putaran', 'Rotasi bangun 2D dan 3D', 3),
(2, 6, 'Cermin dan Refleksi', 'Pencerminan bangun geometri', 4),
(2, 6, 'Lipatan dan Folding', 'Pola lipatan dan bayangan', 5),
(2, 6, 'Pola Spasial', 'Mengenali pola visual dan spasial', 6),
(2, 6, 'Proyeksi 3D', 'Proyeksi bangun ruang ke bidang datar', 7),
(2, 6, 'Dimensi Ruang', 'Konsep 2D dan 3D dalam spasial', 8);

-- Data materi untuk TKP (Kategori 3)
INSERT INTO materi_pelajaran (kategori_id, topic_id, nama_materi, deskripsi, urutan) VALUES
-- Kepribadian (Topic ID: 7)
(3, 7, 'Introvert vs Ekstrovert', 'Tipe kepribadian dan karakteristiknya', 1),
(3, 7, 'Ambivert', 'Kepribadian di antara introvert dan ekstrovert', 2),
(3, 7, 'Sifat dan Karakter', 'Perbedaan sifat dan karakter pribadi', 3),
(3, 7, 'Perilaku dan Sikap', 'Hubungan antara perilaku dan sikap', 4),
(3, 7, 'Temperamen', 'Sifat dasar dan reaksi emosional', 5),
(3, 7, 'Nilai Hidup', 'Prinsip dan nilai yang dipegang', 6),
(3, 7, 'Pengembangan Diri', 'Pertumbuhan dan pengembangan kepribadian', 7),
(3, 7, 'Psikologi Dasar', 'Konsep dasar psikologi kepribadian', 8),

-- Etika Kerja (Topic ID: 8)
(3, 8, 'Profesionalisme', 'Sikap profesional di tempat kerja', 1),
(3, 8, 'Disiplin Kerja', 'Kedisiplinan dan ketepatan waktu', 2),
(3, 8, 'Tanggung Jawab', 'Akuntabilitas dan tanggung jawab', 3),
(3, 8, 'Kerja Tim', 'Kolaborasi dan teamwork', 4),
(3, 8, 'Komunikasi Kerja', 'Komunikasi efektif di kantor', 5),
(3, 8, 'Hubungan Atasan-Bawahan', 'Etika hubungan hierarki kerja', 6),
(3, 8, 'Lingkungan Kerja', 'Adaptasi dengan lingkungan kantor', 7),
(3, 8, 'Etika Profesi', 'Kode etik dan standar profesi', 8);

-- Data materi untuk TPA (Kategori 4)
INSERT INTO materi_pelajaran (kategori_id, topic_id, nama_materi, deskripsi, urutan) VALUES
-- Bahasa Indonesia (Topic ID: 9)
(4, 9, 'Tatabahasa', 'Aturan dan struktur bahasa Indonesia', 1),
(4, 9, 'Kalimat Efektif', 'Struktur kalimat yang baik dan benar', 2),
(4, 9, 'Ejaan yang Disempurnakan', 'EYD dan aturan penulisan', 3),
(4, 9, 'Imbuhan', 'Awalan, akhiran, sisipan, dan konfiks', 4),
(4, 9, 'Sinonim dan Antonim', 'Kata padanan dan lawan kata', 5),
(4, 9, 'Homonym dan Polisemi', 'Kata dengan makna ganda', 6),
(4, 9, 'Denotasi dan Konotasi', 'Makna harfiah dan figuratif', 7),
(4, 9, 'Peribahasa dan Idiom', 'Ungkapan dan peribahasa Indonesia', 8),

-- Numerik (Topic ID: 10)
(4, 10, 'Statistik Dasar', 'Mean, median, modus', 1),
(4, 10, 'Probabilitas', 'Teori peluang dan kombinatorik', 2),
(4, 10, 'Deret Angka', 'Pol deret dan urutan bilangan', 3),
(4, 10, 'Pangkat dan Akar', 'Operasi pangkat dan akar', 4),
(4, 10, 'Logaritma', 'Sifat dan operasi logaritma', 5),
(4, 10, 'Pecahan dan Desimal', 'Operasi pecahan dan desimal', 6),
(4, 10, 'Aljabar Dasar', 'Persamaan dan pertidaksamaan', 7),
(4, 10, 'Kombinasi dan Permutasi', 'Prinsip pengelompokan dan pengurutan', 8),

-- Logika (Topic ID: 11)
(4, 11, 'Silogisme', 'Penalaran deduktif dengan premis', 1),
(4, 11, 'Deduksi dan Induksi', 'Metode penalaran logis', 2),
(4, 11, 'Analisis dan Sintesis', 'Metode berpikir analitis', 3),
(4, 11, 'Argumen Valid', 'Validitas dan kebenaran argumen', 4),
(4, 11, 'Sebab-Akibat', 'Hubungan kausalitas', 5),
(4, 11, 'Kondisi dan Syarat', 'Syarat cukup dan perlu', 6),
(4, 11, 'Kesimpulan Logis', 'Menarik kesimpulan yang valid', 7),
(4, 11, 'Paradoks', 'Kontradiksi dan paradoks logis', 8),

-- Spasial (Topic ID: 12)
(4, 12, 'Bangun Ruang', 'Kubus, balok, tabung, kerucut, bola', 1),
(4, 12, 'Volume dan Luas', 'Perhitungan volume dan luas permukaan', 2),
(4, 12, 'Diagonal dan Rusuk', 'Sifat geometri bangun ruang', 3),
(4, 12, 'Proyeksi', 'Proyeksi 3D ke 2D', 4),
(4, 12, 'Rotasi 3D', 'Rotasi bangun ruang', 5),
(4, 12, 'Dimensi', 'Konsep 2D dan 3D', 6),
(4, 12, 'Bidang dan Sisi', 'Sifat bidang dan sisi bangun', 7),
(4, 12, 'Sudut dan Garis', 'Sudut dan garis dalam geometri', 8);

-- Data materi untuk PSIKOLOGIS (Kategori 5)
INSERT INTO materi_pelajaran (kategori_id, topic_id, nama_materi, deskripsi, urutan) VALUES
-- Kepribadian (Topic ID: 13)
(5, 13, 'Teori Kepribadian', 'Teori Freud, Jung, dan teori lainnya', 1),
(5, 13, 'Tipe Kepribadian', 'Klasifikasi dan tipe kepribadian', 2),
(5, 13, 'Trait Theory', 'Teori sifat kepribadian', 3),
(5, 13, 'Self-Concept', 'Konsep diri dan identitas', 4),
(5, 13, 'Emosi', 'Jenis dan pengelolaan emosi', 5),
(5, 13, 'Perasaan', 'Perbedaan emosi dan perasaan', 6),
(5, 13, 'Sikap dan Pendirian', 'Formation dan perubahan sikap', 7),
(5, 13, 'Nilai dan Motivasi', 'Sistem nilai dan motivasi intrinsik', 8),

-- Motivasi (Topic ID: 14)
(5, 14, 'Teori Motivasi', 'Maslow, Herzberg, dan teori lainnya', 1),
(5, 14, 'Motivasi Intrinsik', 'Motivasi dari dalam diri', 2),
(5, 14, 'Motivasi Ekstrinsik', 'Motivasi dari luar', 3),
(5, 14, 'Achievement Motivation', 'Motivasi berprestasi', 4),
(5, 14, 'Goal Setting', 'Penetapan tujuan', 5),
(5, 14, 'Self-Efficacy', 'Keyakinan diri', 6),
(5, 14, 'Cita-cita dan Aspirasi', 'Masa depan dan impian', 7),
(5, 14, 'Growth Mindset', 'Pola pikir berkembang', 8),

-- Pengendalian Diri (Topic ID: 15)
(5, 15, 'Emotional Intelligence', 'Kecerdasan emosional', 1),
(5, 15, 'Stress Management', 'Manajemen stres', 2),
(5, 15, 'Resilience', 'Ketahanan mental', 3),
(5, 15, 'Self-Regulation', 'Pengaturan diri', 4),
(5, 15, 'Impulse Control', 'Kontrol impuls', 5),
(5, 15, 'Coping Mechanisms', 'Mekanisme koping', 6),
(5, 15, 'Mindfulness', 'Kesadaran penuh', 7),
(5, 15, 'Optimism vs Pessimism', 'Optimisme dan pesimisme', 8);
