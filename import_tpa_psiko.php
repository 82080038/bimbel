<?php
require_once 'config.php';

echo "<h1>Import Soal TPA dan Psikologis</h1>";
echo "<p>Menghubungkan ke database...</p>";

if ($conn->connect_error) {
    die("<p style='color:red'>Koneksi gagal: " . $conn->connect_error . "</p>");
}

echo "<p style='color:green'>Koneksi berhasil!</p>";

// TPA Questions (Tes Potensi Akademik)
$tpa_questions = [
    [
        'kategori_id' => 4,
        'pertanyaan' => 'Sinonim dari kata "redundan" adalah...',
        'opsi_a' => 'Berlebihan',
        'opsi_b' => 'Pas-pasan',
        'opsi_c' => 'Hilang',
        'opsi_d' => 'Kurang',
        'opsi_e' => 'Sedikit',
        'jawaban_benar' => 'A',
        'pembahasan' => 'Redundan berarti berlebihan atau berulang. Sinonim yang paling tepat adalah berlebihan.',
        'tips' => 'Untuk soal sinonim, pahami makna kata dalam konteks yang berbeda. Jangan hanya mengandalkan hafalan.'
    ],
    [
        'kategori_id' => 4,
        'pertanyaan' => 'Antonim dari kata "ekspansif" adalah...',
        'opsi_a' => 'Menyempit',
        'opsi_b' => 'Meluas',
        'opsi_c' => 'Besar',
        'opsi_d' => 'Luas',
        'opsi_e' => 'Tinggi',
        'jawaban_benar' => 'A',
        'pembahasan' => 'Ekspansif berarti meluas atau berkembang. Lawan katunya (antonim) adalah menyempit.',
        'tips' => 'Untuk soal antonim, cari lawan kata yang paling tepat dalam konteks makna.'
    ],
    [
        'kategori_id' => 4,
        'pertanyaan' => 'Pisau : Memotong = Pulpen : ...',
        'opsi_a' => 'Menghapus',
        'opsi_b' => 'Menulis',
        'opsi_c' => 'Membaca',
        'opsi_d' => 'Menggambar',
        'opsi_e' => 'Menandai',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Hubungan fungsi: Pisau berfungsi untuk memotong, Pulpen berfungsi untuk menulis. Ini adalah analogi fungsi.',
        'tips' => 'Untuk soal analogi, identifikasi hubungan antar kata (fungsi, bagian-keseluruhan, sebab-akibat, dll).'
    ],
    [
        'kategori_id' => 4,
        'pertanyaan' => 'Deret angka: 2, 4, 8, 16, ..., 64, 128. Angka yang tepat untuk mengisi titik-titik adalah...',
        'opsi_a' => '24',
        'opsi_b' => '30',
        'opsi_c' => '32',
        'opsi_d' => '36',
        'opsi_e' => '40',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Pola deret adalah dikali 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32, 32×2=64, 64×2=128.',
        'tips' => 'Untuk deret angka, cari pola perkalian, penjumlahan, atau kombinasi keduanya.'
    ],
    [
        'kategori_id' => 4,
        'pertanyaan' => '24 ÷ 4 × 6 = ...',
        'opsi_a' => '16',
        'opsi_b' => '24',
        'opsi_c' => '30',
        'opsi_d' => '36',
        'opsi_e' => '40',
        'jawaban_benar' => 'D',
        'pembahasan' => 'Hitung dari kiri ke kanan: 24 ÷ 4 = 6, lalu 6 × 6 = 36.',
        'tips' => 'Untuk operasi hitung campuran, ikuti urutan operasi matematika dan hitung dari kiri ke kanan.'
    ],
    [
        'kategori_id' => 4,
        'pertanyaan' => 'Jika semua A adalah B, dan semua B adalah C, maka...',
        'opsi_a' => 'Semua A adalah C',
        'opsi_b' => 'Semua C adalah A',
        'opsi_c' => 'Sebagian A adalah C',
        'opsi_d' => 'Tidak ada hubungan',
        'opsi_e' => 'Sebagian C adalah A',
        'jawaban_benar' => 'A',
        'pembahasan' => 'Ini adalah silogisme logika dasar. Jika semua A termasuk B, dan semua B termasuk C, maka semua A juga termasuk C.',
        'tips' => 'Untuk soal logika, gunakan diagram Venn atau aturan silogisme untuk memvisualisasikan hubungan.'
    ],
    [
        'kategori_id' => 4,
        'pertanyaan' => 'Dokter : Pasien = Guru : ...',
        'opsi_a' => 'Siswa',
        'opsi_b' => 'Sekolah',
        'opsi_c' => 'Buku',
        'opsi_d' => 'Papan tulis',
        'opsi_e' => 'Kelas',
        'jawaban_benar' => 'A',
        'pembahasan' => 'Dokter menangani pasien, Guru membimbing siswa. Hubungan profesional-objek layanan.',
        'tips' => 'Untuk analogi profesi, identifikasi hubungan kerja antar profesi dan objek yang dilayani.'
    ],
    [
        'kategori_id' => 4,
        'pertanyaan' => 'Deret huruf: A, C, E, G, ..., K. Huruf yang tepat adalah...',
        'opsi_a' => 'H',
        'opsi_b' => 'I',
        'opsi_c' => 'J',
        'opsi_d' => 'L',
        'opsi_e' => 'M',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Pola melompat 2 huruf dalam alfabet: A→C→E→G→I→K.',
        'tips' => 'Untuk deret huruf, hitung jarak antar huruf dalam alfabet.'
    ]
];

// Psikologis Questions
$psiko_questions = [
    [
        'kategori_id' => 5,
        'pertanyaan' => 'Saat menghadapi tekanan di tempat kerja, Anda cenderung...',
        'opsi_a' => 'Panik dan tidak bisa berpikir jernih',
        'opsi_b' => 'Menghindari masalah dengan menunda',
        'opsi_c' => 'Menganalisis masalah dan mencari solusi',
        'opsi_d' => 'Menyalahkan orang lain',
        'opsi_e' => 'Menyerah begitu saja',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan kemampuan coping yang baik, ketenangan di bawah tekanan, dan problem solving skill.',
        'tips' => 'Untuk tes psikologis, pilih jawaban yang menunjukkan sikap positif, tanggung jawab, dan kemampuan adaptasi.'
    ],
    [
        'kategori_id' => 5,
        'pertanyaan' => 'Dalam tim, jika ada perbedaan pendapat, Anda akan...',
        'opsi_a' => 'Mengabaikan pendapat orang lain',
        'opsi_b' => 'Memaksa pendapat Anda diterima',
        'opsi_c' => 'Mendiskusikan dan mencari solusi bersama',
        'opsi_d' => 'Keluar dari tim',
        'opsi_e' => 'Menyimpan dendam',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan kemampuan kolaborasi, komunikasi yang baik, dan sikap terbuka terhadap perbedaan.',
        'tips' => 'Pilih jawaban yang menunjukkan kemampuan bekerja sama dan menghargai perbedaan pendapat.'
    ],
    [
        'kategori_id' => 5,
        'pertanyaan' => 'Motivasi utama Anda ingin bekerja di sekolah kedinasan adalah...',
        'opsi_a' => 'Ingin gaji tinggi',
        'opsi_b' => 'Ingin mengabdi untuk negara',
        'opsi_c' => 'Ingin popularitas',
        'opsi_d' => 'Tidak ada pekerjaan lain',
        'opsi_e' => 'Ikutan teman saja',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Jawaban B menunjukkan motivasi yang sesuai dengan nilai-nilai sekolah kedinasan: pengabdian kepada negara.',
        'tips' => 'Untuk soal motivasi, pilih jawaban yang menunjukkan dedikasi, tanggung jawab, dan nilai positif.'
    ],
    [
        'kategori_id' => 5,
        'pertanyaan' => 'Jika atasan memberikan kritik, reaksi Anda adalah...',
        'opsi_a' => 'Marah dan tersinggung',
        'opsi_b' => 'Mengabaikan kritik',
        'opsi_c' => 'Menerima dan memperbaiki diri',
        'opsi_d' => 'Mencari alasan',
        'opsi_e' => 'Menggosipkan atasan',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan keterbukaan terhadap masukan, kemauan berkembang, dan kedewasaan emosional.',
        'tips' => 'Pilih jawaban yang menunjukkan sikap menerima masukan dan kemauan untuk self-improvement.'
    ],
    [
        'kategori_id' => 5,
        'pertanyaan' => 'Saat bekerja, Anda lebih suka...',
        'opsi_a' => 'Bekerja sendiri tanpa gangguan',
        'opsi_b' => 'Bekerja dalam tim dengan kolaborasi',
        'opsi_c' => 'Hanya mengikuti instruksi',
        'opsi_d' => 'Menunda pekerjaan',
        'opsi_e' => 'Mencari pekerjaan orang lain',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Jawaban B menunjukkan kemampuan teamwork, kolaborasi, dan sikap kooperatif.',
        'tips' => 'Pilih jawaban yang menunjukkan kemampuan bekerja sama dan kontribusi positif dalam tim.'
    ],
    [
        'kategori_id' => 5,
        'pertanyaan' => 'Jika ada kesempatan untuk belajar hal baru, Anda akan...',
        'opsi_a' => 'Mengabaikan karena sudah cukup',
        'opsi_b' => 'Mengambil kesempatan dengan antusias',
        'opsi_c' => 'Menunda untuk nanti',
        'opsi_d' => 'Minta orang lain belajar',
        'opsi_e' => 'Merasa tidak perlu',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Jawaban B menunjukkan growth mindset, motivasi belajar, dan antusiasme untuk pengembangan diri.',
        'tips' => 'Pilih jawaban yang menunjukkan motivasi belajar dan growth mindset.'
    ],
    [
        'kategori_id' => 5,
        'pertanyaan' => 'Saat menghadapi kegagalan, Anda akan...',
        'opsi_a' => 'Menyerah dan putus asa',
        'opsi_b' => 'Menyalahkan keadaan',
        'opsi_c' => 'Belajar dan mencoba lagi',
        'opsi_d' => 'Menghindari situasi serupa',
        'opsi_e' => 'Melupakan begitu saja',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan resilience, ketangguhan, dan kemampuan belajar dari kegagalan.',
        'tips' => 'Pilih jawaban yang menunjukkan ketangguhan dan kemampuan bangkit dari kegagalan.'
    ],
    [
        'kategori_id' => 5,
        'pertanyaan' => 'Dalam mengambil keputusan, Anda cenderung...',
        'opsi_a' => 'Mengikuti kata orang lain',
        'opsi_b' => 'Menganalisis dan mempertimbangkan dengan teliti',
        'opsi_c' => 'Mengambil keputusan cepat tanpa pikir',
        'opsi_d' => 'Menghindari pengambilan keputusan',
        'opsi_e' => 'Menunggu instruksi',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Jawaban B menunjukkan kemampuan analytical thinking, pertimbangan yang matang, dan tanggung jawab.',
        'tips' => 'Pilih jawaban yang menunjukkan kemampuan analitis dan pertimbangan yang matang dalam pengambilan keputusan.'
    ]
];

echo "<h2>Import TPA Questions</h2>";
$tpa_count = 0;
foreach ($tpa_questions as $q) {
    $sql = "INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, tips) 
            VALUES ('" . $q['kategori_id'] . "', 
                    '" . $conn->real_escape_string($q['pertanyaan']) . "', 
                    '" . $conn->real_escape_string($q['opsi_a']) . "', 
                    '" . $conn->real_escape_string($q['opsi_b']) . "', 
                    '" . $conn->real_escape_string($q['opsi_c']) . "', 
                    '" . $conn->real_escape_string($q['opsi_d']) . "', 
                    '" . $conn->real_escape_string($q['opsi_e']) . "', 
                    '" . $conn->real_escape_string($q['jawaban_benar']) . "', 
                    '" . $conn->real_escape_string($q['pembahasan']) . "', 
                    '" . $conn->real_escape_string($q['tips']) . "')";
    if ($conn->query($sql)) {
        $tpa_count++;
    } else {
        echo "<p style='color:red'>Error TPA: " . $conn->error . "</p>";
    }
}
echo "<p style='color:green'>TPA: $tpa_count soal berhasil di-import</p>";

echo "<h2>Import Psikologis Questions</h2>";
$psiko_count = 0;
foreach ($psiko_questions as $q) {
    $sql = "INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, tips) 
            VALUES ('" . $q['kategori_id'] . "', 
                    '" . $conn->real_escape_string($q['pertanyaan']) . "', 
                    '" . $conn->real_escape_string($q['opsi_a']) . "', 
                    '" . $conn->real_escape_string($q['opsi_b']) . "', 
                    '" . $conn->real_escape_string($q['opsi_c']) . "', 
                    '" . $conn->real_escape_string($q['opsi_d']) . "', 
                    '" . $conn->real_escape_string($q['opsi_e']) . "', 
                    '" . $conn->real_escape_string($q['jawaban_benar']) . "', 
                    '" . $conn->real_escape_string($q['pembahasan']) . "', 
                    '" . $conn->real_escape_string($q['tips']) . "')";
    if ($conn->query($sql)) {
        $psiko_count++;
    } else {
        echo "<p style='color:red'>Error Psikologis: " . $conn->error . "</p>";
    }
}
echo "<p style='color:green'>Psikologis: $psiko_count soal berhasil di-import</p>";

$total = $tpa_count + $psiko_count;
echo "<h2 style='color:green'>Total: $total soal baru berhasil di-import!</h2>";
echo "<p><a href='index.html'>Kembali ke Aplikasi</a></p>";
?>
