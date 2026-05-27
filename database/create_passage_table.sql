-- Tabel untuk menyimpan cerita/passage untuk soal reading comprehension
CREATE TABLE IF NOT EXISTS passages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi_cerita TEXT NOT NULL,
    kategori_id INT NOT NULL,
    topic_id INT NULL,
    materi_id INT NULL,
    sumber VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topik_pelajaran(id) ON DELETE SET NULL,
    FOREIGN KEY (materi_id) REFERENCES materi_pelajaran(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tambahkan kolom passage_id ke tabel soal
ALTER TABLE soal ADD COLUMN passage_id INT NULL AFTER materi_id;
ALTER TABLE soal ADD INDEX idx_passage_id (passage_id);
ALTER TABLE soal ADD FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL;

-- Tambahkan kolom nomor_urutan_dalam_passage untuk mengurutkan soal dalam satu passage
ALTER TABLE soal ADD COLUMN nomor_urutan_dalam_passage INT NULL AFTER passage_id;

-- Sample data untuk passages (TWK - Sejarah Indonesia)
INSERT INTO passages (judul, isi_cerita, kategori_id, topic_id, materi_id, sumber) VALUES
('Proklamasi Kemerdekaan Indonesia', 
'Pada tanggal 17 Agustus 1945, Indonesia memproklamasikan kemerdekaannya. Proklamasi ini dibacakan oleh Ir. Soekarno didampingi oleh Drs. Mohammad Hatta di Jalan Pegangsaan Timur No. 56, Jakarta. Peristiwa ini merupakan puncak dari perjuangan bangsa Indonesia selama ratusan tahun terhadap penjajahan kolonial.

Persiapan proklamasi dilakukan dalam beberapa tahap. Pertama, Jepang menyerah tanpa syarat kepada Sekutu pada tanggal 14 Agustus 1945 setelah bom atom dijatuhkan di Hiroshima dan Nagasaki. Kedua, golongan muda mendesak Soekarno-Hatta untuk segera memproklamasikan kemerdekaan. Ketiga, terjadinya peristiwa Rengasdengklok pada tanggal 16 Agustus 1945 di mana Soekarno-Hatta dibawa oleh golongan muda untuk segera memproklamasikan kemerdekaan.

Naskah proklamasi ditulis oleh Soekarno sendiri di rumah Laksamana Maeda. Teks proklamasi berbunyi: "Kami bangsa Indonesia dan seluruh Indonesia menjunjung tinggi kemerdekaan itu, atau sekarang sudah sampai pada saatnya untuk menyatakan kemerdekaan Indonesia. Hal-hal jelas mengenai pemindahan kekuasaan dan sebagainya diselenggarakan dengan cara seksama dan dalam tempo yang sesingkat-singkatnya."

Setelah proklamasi, Indonesia menghadapi berbagai tantangan termasuk agresi militer Belanda yang ingin kembali menjajah Indonesia. Perjuangan fisik dan diplomasi dilakukan untuk mempertahankan kemerdekaan. Akhirnya, pada tanggal 27 Desember 1949, Belanda secara resmi mengakui kedaulatan Indonesia.',
1, 2, 1, 'Buku Sejarah Indonesia'),

('Pancasila sebagai Dasar Negara',
'Pancasila adalah ideologi dasar negara Indonesia. Pancasila terdiri dari lima sila yang dirumuskan oleh para pendiri bangsa Indonesia. Kelima sila tersebut adalah: 1) Ketuhanan Yang Maha Esa, 2) Kemanusiaan yang Adil dan Beradab, 3) Persatuan Indonesia, 4) Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan, dan 5) Keadilan Sosial bagi Seluruh Rakyat Indonesia.

Pancasila bersumber dari nilai-nilai luhur bangsa Indonesia yang telah hidup sejak lama. Nilai-nilai tersebut antara lain gotong royong, musyawarah, toleransi, dan keadilan. Pancasila juga dipengaruhi oleh budaya Barat, budaya Timur, dan budaya Indonesia sendiri.

Pancasila memiliki kedudukan sebagai dasar negara, sumber dari segala sumber hukum, pandangan hidup bangsa, dan kesepakatan dasar bangsa. Pancasila juga berfungsi sebagai pedoman penyelenggaraan negara, pedoman hidup bagi masyarakat, dan alat pemersatu bangsa.

Dalam praktiknya, Pancasila diimplementasikan dalam berbagai aspek kehidupan berbangsa dan bernegara. Dalam bidang politik, Pancasila menjadi dasar sistem demokrasi Indonesia. Dalam bidang ekonomi, Pancasila menjadi dasar sistem ekonomi kerakyatan. Dalam bidang hukum, Pancasila menjadi sumber dari segala peraturan perundang-undangan.',
1, 1, 1, 'Buku Pendidikan Kewarganegaraan'),

('Bacaan TIU - Logika Matematika',
'Dalam sebuah kelas terdapat 40 siswa. 25 siswa menyukai matematika, 20 siswa menyukai bahasa, dan 15 siswa menyukai sains. 10 siswa menyukai matematika dan bahasa, 8 siswa menyukai matematika dan sains, 5 siswa menyukai bahasa dan sains. 3 siswa menyukai ketiga mata pelajaran tersebut.

Pertanyaan yang sering muncul adalah berapa banyak siswa yang tidak menyukai mata pelajaran manapun. Untuk menjawabnya, kita perlu menggunakan prinsip inklusi-eksklusi. Rumus dasarnya adalah: Total = A + B + C - (A∩B) - (A∩C) - (B∩C) + (A∩B∩C).

Selain itu, dalam logika matematika juga terdapat konsep deret bilangan. Deret aritmatika adalah deret dengan selisih antar suku yang konstan. Deret geometri adalah deret dengan rasio antar suku yang konstan. Deret Fibonacci adalah deret di mana setiap suku adalah jumlah dua suku sebelumnya.

Dalam menyelesaikan masalah logika, penting untuk memahami pola yang ada. Pola bisa berupa pola angka, pola bentuk, atau pola hubungan antar elemen. Kemampuan mengidentifikasi pola adalah kunci dalam menyelesaikan soal-soal logika matematika.',
2, 4, 1, 'Buku Logika Matematika'),

('Bacaan TPA - Verbal Reasoning',
'Sinonim adalah kata yang memiliki makna yang sama atau mirip. Contoh sinonim: besar dan gedang, cepat dan laju, tinggi dan rendah (antonym). Antonim adalah kata yang memiliki makna yang berlawanan. Contoh antonim: tinggi dan rendah, panas dan dingin, cepat dan lambat.

Analogi kata adalah hubungan kata yang memiliki kesamaan pola. Contoh analogi: Dokter : Pasien = Guru : Murid. Hubungan dalam analogi bisa berupa bagian-keseluruhan, sebab-akibat, fungsi, atau sifat.

Dalam memahami bacaan, penting untuk mengidentifikasi ide pokok, ide penjelas, dan kesimpulan. Ide pokok adalah gagasan utama yang menjadi fokus bacaan. Ide penjelas adalah gagasan pendukung yang menjelaskan ide pokok. Kesimpulan adalah rangkuman dari seluruh isi bacaan.

Informasi tersurat adalah informasi yang secara eksplisit tertulis dalam bacaan. Informasi tersirat adalah informasi yang tidak tertulis secara eksplisit tetapi dapat disimpulkan dari bacaan. Kemampuan membedakan informasi tersurat dan tersirat penting dalam memahami bacaan secara mendalam.',
4, 9, 1, 'Buku Bahasa Indonesia'),

('Bacaan TKP - Kepribadian',
'Kepribadian adalah keseluruhan cara seseorang merespons lingkungan, baik secara sadar maupun tidak sadar. Kepribadian mencakup pola pikir, perasaan, dan perilaku yang konsisten dari waktu ke waktu. Teori kepribadian yang terkenal antara lain teori psikoanalitik Freud, teori behavioristik Skinner, dan teori humanistik Maslow.

Introvert adalah tipe kepribadian yang cenderung fokus pada dunia dalam diri sendiri. Orang introvert biasanya lebih suka sendirian, berpikir sebelum bertindak, dan memiliki energi yang terisi dari waktu sendiri. Ekstrovert adalah tipe kepribadian yang cenderung fokus pada dunia luar. Orang ekstrovert biasanya lebih suka interaksi sosial, bertindak cepat, dan memiliki energi yang terisi dari interaksi dengan orang lain.

Ambivert adalah tipe kepribadian yang berada di antara introvert dan ekstrovert. Orang ambivert dapat menyesuaikan diri dengan situasi, kadang-kadang lebih introvert dan kadang-kadang lebih ekstrovert.

Dalam konteks seleksi CPNS, tes kepribadian bertujuan untuk mengetahui kesesuaian antara kepribadian pelamar dengan tuntutan pekerjaan. Tes kepribadian bukan untuk menilai baik-buruk seseorang, tetapi untuk memahami karakteristik dan potensi seseorang.',
3, 7, 1, 'Buku Psikologi');
