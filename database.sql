-- Database: ujian_sekolah_kedinasan
CREATE DATABASE IF NOT EXISTS ujian_sekolah_kedinasan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ujian_sekolah_kedinasan;

-- Tabel kategori soal
CREATE TABLE IF NOT EXISTS kategori_soal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    passing_grade INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert kategori soal
INSERT INTO kategori_soal (nama_kategori, deskripsi, passing_grade) VALUES
('TWK', 'Tes Wawasan Kebangsaan - Nasionalisme, Integritas, Bela Negara, Pilar Negara, Bahasa Indonesia', 65),
('TIU', 'Tes Intelegensi Umum - Verbal, Numerik, Figural', 80),
('TKP', 'Tes Karakteristik Pribadi', 166),
('TPA', 'Tes Potensi Akademik - Bahasa, Numerik, Logika', 70),
('PSIKOLOGIS', 'Tes Psikologis - Kepribadian, Motivasi', 166);

-- Tabel soal
CREATE TABLE IF NOT EXISTS soal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT NOT NULL,
    pertanyaan TEXT NOT NULL,
    opsi_a TEXT NOT NULL,
    opsi_b TEXT NOT NULL,
    opsi_c TEXT NOT NULL,
    opsi_d TEXT NOT NULL,
    opsi_e TEXT NOT NULL,
    jawaban_benar CHAR(1) NOT NULL,
    pembahasan TEXT,
    tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id) ON DELETE CASCADE,
    INDEX idx_kategori (kategori_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabel hasil ujian
CREATE TABLE IF NOT EXISTS hasil_ujian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_peserta VARCHAR(100) NOT NULL,
    tanggal_ujian DATETIME DEFAULT CURRENT_TIMESTAMP,
    durasi_menit INT NOT NULL,
    nilai_twk INT DEFAULT 0,
    nilai_tiu INT DEFAULT 0,
    nilai_tkp INT DEFAULT 0,
    nilai_tpa INT DEFAULT 0,
    nilai_psikologis INT DEFAULT 0,
    nilai_total INT DEFAULT 0,
    status_lulus VARCHAR(20) DEFAULT 'TIDAK LULUS',
    jawaban_peserta TEXT,
    INDEX idx_tanggal (tanggal_ujian),
    INDEX idx_status (status_lulus)
);

-- Tabel sesi ujian (untuk tracking real-time)
CREATE TABLE IF NOT EXISTS sesi_ujian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_peserta VARCHAR(100) NOT NULL,
    waktu_mulai DATETIME DEFAULT CURRENT_TIMESTAMP,
    waktu_selesai DATETIME,
    durasi_menit INT NOT NULL,
    soal_teracak TEXT,
    jawaban_sementara TEXT,
    status ENUM('berjalan', 'selesai', 'timeout') DEFAULT 'berjalan',
    INDEX idx_status (status),
    INDEX idx_nama (nama_peserta)
);

-- Tabel tips dan trik umum
CREATE TABLE IF NOT EXISTS tips_umum (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori VARCHAR(50),
    judul VARCHAR(200),
    konten TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert tips umum
INSERT INTO tips_umum (kategori, judul, konten) VALUES
('umum', 'Jangan Terburu-buru', 'Banyak faktor yang mengakibatkan diri kita seakan mengerjakan soal ujian secara cepat dan terburu-buru. Faktor waktu ujian yang tidak sebanding dengan jumlah soal ujian, hingga faktor teman-teman satu ruangan anda yang mungkin selesai secara cepat dan mengakibatkan anda menjadi tertekan untuk bisa menyelesaikannya secara cepat juga. Hal tersebut sebisa mungkin harus anda hindari.'),
('umum', 'Fokus dan Teliti', 'Pada dasarnya, ketika anda merasa tegang ketika menghadapi sesuatu, anda akan sangat sulit untuk berkonsentrasi terhadap keadaan sekitar anda. Perhatikan setiap soal dengan teliti, baik dari segi kosakata hingga tipe soalnya.'),
('umum', 'Kerjakan Soal yang Dapat Dijawab', 'Dalam mengerjakan soal Ujian SKD disarankan untuk mengerjakan soal secara berurutan dari nomor 1 hingga 100. Bila memang terpaksa tidak bisa menjawab soal, bisa melewati terlebih dahulu dan mengerjakan soal berikutnya.'),
('strategi', 'Urutan Pengerjaan Materi', 'Kerjakan terlebih dahulu soal TWK sampai selesai, kemudian loncat mengerjakan soal TKP sampai selesai. Bila kamu mengerjakan dua materi tersebut terlebih dahulu, perkiraan selesai dalam waktu 30-40 menit. Sisa waktu digunakan untuk mengerjakan soal materi TIU.'),
('tiu', 'Tips TIU - Hitung Cepat', 'Untuk soal hitungan cepat, gunakan teknik estimasi dan eliminasi. Jangan menghitung secara detail jika tidak perlu. Perkirakan jawaban yang paling masuk akal.'),
('twk', 'Tips TWK - Pahami Konsep', 'Untuk soal TWK, pahami konsep dasar nasionalisme, integritas, dan bela negara. Baca dengan teliti setiap pertanyaan karena seringkali ada jebakan dalam pemilihan kata.'),
('tkp', 'Tips TKP - Jujur pada Diri Sendiri', 'Soal TKP mengukur kepribadian Anda. Jawablah dengan jujur sesuai dengan karakter Anda. Jangan mencoba menebak jawaban yang dianggap "benar" karena sistem penilaian TKP berbeda dengan TWK dan TIU.'),
('tpa', 'Tips TPA - Latihan Rutin', 'TPA menguji potensi akademik Anda. Latihan soal secara rutin akan membantu meningkatkan kecepatan dan akurasi dalam mengerjakan soal bahasa, numerik, dan logika.'),
('psikologis', 'Tips Psikologis - Tenang dan Waspada', 'Tes psikologis mengukur kepribadian dan motivasi Anda. Tetaplah tenang dan wasapda saat mengerjakan. Jawablah sesuai dengan perasaan dan pemikiran Anda yang sebenarnya.'),
('tpa', 'Tips TPA - Manajemen Waktu', 'Bagi waktu secara proporsional untuk setiap jenis soal TPA. Jangan terjebak terlalu lama pada satu soal yang sulit. Lewati dan kembali lagi jika ada waktu sisa.'),
('psikologis', 'Tips Psikologis - Konsistensi', 'Jawablah soal psikologis dengan konsisten. Jangan berpindah sikap di tengah tes karena ini dapat mempengaruhi hasil penilaian kepribadian Anda.');
