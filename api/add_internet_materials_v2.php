<?php
/**
 * API Endpoint with Protection Layer
 * Auto-generated with rate limiting, validation, and caching
 */

require_once __DIR__ . '/api_protection.php';

// Apply rate limiting for this endpoint
$protection = apiProtection();
$protection->applyRateLimit('default');
$protection->checkSuspiciousActivity();

header('Content-Type: application/json');

$host = '127.0.0.1';
$user = 'root';
$pass = 'root';
$dbname = 'ujian_sekolah_kedinasan';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $successCount = 0;
    $errorCount = 0;
    $errors = [];
    
    // Questions data
    $questions = [
        ['kat' => 1, 'sub' => 'nasionalisme', 'q' => 'Nasionalisme dalam konteks TWK SKD CPNS dimaknai sebagai...', 'a' => 'Kebanggaan berlebihan terhadap bangsa', 'b' => 'Fanatisme sempit terhadap suku', 'c' => 'Sikap moderat yang menjunjung persatuan dan menghormati perbedaan', 'd' => 'Ketaatan mutlak terhadap pemerintah', 'e' => 'Penolakan terhadap budaya asing', 'ans' => 'C', 'exp' => 'Nasionalisme dalam konteks TWK SKD CPNS dimaknai sebagai sikap moderat yang menjunjung persatuan, menghormati perbedaan, dan mengutamakan kepentingan nasional, bukan sebagai kebanggaan berlebihan atau fanatisme sempit.'],
        ['kat' => 1, 'sub' => 'nasionalisme', 'q' => 'Tujuan utama nasionalisme adalah untuk...', 'a' => 'Memperkuat kepentingan kelompok', 'b' => 'Menjaga keutuhan NKRI', 'c' => 'Menolak budaya asing', 'd' => 'Mengutamakan kepentingan pribadi', 'e' => 'Mengisolasi negara dari dunia', 'ans' => 'B', 'exp' => 'Tujuan utama nasionalisme adalah untuk menjaga keutuhan NKRI, mempertahankan kedaulatan negara, memperkuat identitas nasional, dan mendorong warga negara berpartisipasi aktif membangun bangsa.'],
        ['kat' => 1, 'sub' => 'nasionalisme', 'q' => 'Nasionalisme Indonesia bersifat kebangsaan artinya...', 'a' => 'Berdasarkan kesamaan suku', 'b' => 'Berdasarkan kesamaan agama', 'c' => 'Berdasarkan kesamaan ras', 'd' => 'Berdasarkan kesamaan nasib bangsa Indonesia', 'e' => 'Berdasarkan kesamaan wilayah', 'ans' => 'D', 'exp' => 'Nasionalisme Indonesia bersifat kebangsaan, artinya berdasarkan kesamaan nasib bangsa Indonesia, bukan berdasarkan kesamaan suku, agama, atau ras.'],
        ['kat' => 1, 'sub' => 'integritas_nasional', 'q' => 'Integritas nasional tercermin dalam sikap...', 'a' => 'Konsisten antara perkataan dan perbuatan', 'b' => 'Mengikuti keinginan atasan tanpa pertanyaan', 'c' => 'Mencari pembenaran atas kesalahan', 'd' => 'Menyembunyikan informasi penting', 'e' => 'Mengutamakan kepentingan pribadi', 'ans' => 'A', 'exp' => 'Integritas nasional tercermin dalam sikap konsisten antara perkataan dan perbuatan, taat aturan meskipun tidak diawasi, menolak penyimpangan sekecil apa pun, dan berani menanggung risiko demi kebenaran.'],
        ['kat' => 1, 'sub' => 'integritas_nasional', 'q' => 'Mengapa integritas nasional sangat penting bagi warga negara...', 'a' => 'Karena meningkatkan popularitas', 'b' => 'Karena mendapatkan keuntungan pribadi', 'c' => 'Karena warga negara memegang kepercayaan publik', 'd' => 'Karena diwajibkan oleh atasan', 'e' => 'Karena untuk menghindari hukuman', 'ans' => 'C', 'exp' => 'Integritas nasional sangat penting bagi warga negara karena warga negara memegang kepercayaan publik, penyimpangan berawal dari runtuhnya integritas, sistem yang baik akan rusak bila dijalankan tanpa integritas, dan negara membutuhkan warga yang kokoh secara moral.'],
        ['kat' => 1, 'sub' => 'pilar_negara', 'q' => 'Empat pilar negara meliputi...', 'a' => 'Pancasila, UUD 1945, NKRI, dan Garuda Pancasila', 'b' => 'Pancasila, UUD 1945, NKRI, dan Indonesia Raya', 'c' => 'Pancasila, UUD 1945, NKRI, dan Merah Putih', 'd' => 'Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika', 'e' => 'Pancasila, UUD 1945, NKRI, dan NKRI', 'ans' => 'D', 'exp' => 'Empat pilar negara meliputi Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika. Keempat pilar ini saling terkait dan tidak dapat dipisahkan.'],
        ['kat' => 1, 'sub' => 'pilar_negara', 'q' => 'Pancasila berperan sebagai pilar negara karena...', 'a' => 'Sebagai hukum dasar', 'b' => 'Sebagai dasar filosofis dan sumber dari segala sumber hukum', 'c' => 'Sebagai bentuk negara', 'd' => 'Sebagai semangat persatuan', 'e' => 'Sebagai lambang negara', 'ans' => 'B', 'exp' => 'Pancasila berperan sebagai pilar negara karena berfungsi sebagai dasar filosofis dan sumber dari segala sumber hukum, sebagai ideologi dasar negara Indonesia.'],
        ['kat' => 2, 'sub' => 'deret_gambar', 'q' => 'Bentuk selanjutnya dalam deret rotasi adalah...', 'a' => 'Rotasi 90 derajat searah jarum jam', 'b' => 'Rotasi 90 derajat berlawanan jarum jam', 'c' => 'Rotasi 180 derajat', 'd' => 'Tidak ada rotasi', 'e' => 'Rotasi 45 derajat', 'ans' => 'A', 'exp' => 'Dalam deret rotasi, bentuk biasanya berputar 90 derajat searah jarum jam secara konsisten dari satu gambar ke gambar berikutnya.'],
        ['kat' => 2, 'sub' => 'teori_bilangan', 'q' => 'Hasil dari 15 + (-8) adalah...', 'a' => '23', 'b' => '7', 'c' => '-7', 'd' => '-23', 'e' => '8', 'ans' => 'B', 'exp' => '15 + (-8) = 15 - 8 = 7. Penjumlahan bilangan positif dengan negatif sama dengan pengurangan.'],
        ['kat' => 2, 'sub' => 'teori_bilangan', 'q' => 'Bilangan prima di antara 10 dan 20 adalah...', 'a' => '10, 12, 14, 16, 18', 'b' => '11, 13, 17, 19', 'c' => '12, 15, 18', 'd' => '13, 15, 17', 'e' => '11, 15, 17, 19', 'ans' => 'B', 'exp' => 'Bilangan prima di antara 10 dan 20 adalah 11, 13, 17, dan 19. Bilangan prima adalah bilangan yang hanya dapat dibagi oleh 1 dan dirinya sendiri.'],
        ['kat' => 2, 'sub' => 'operasi_pecahan', 'q' => 'Hasil dari 2/3 + 1/4 adalah...', 'a' => '3/7', 'b' => '5/12', 'c' => '11/12', 'd' => '8/12', 'e' => '1/2', 'ans' => 'C', 'exp' => '2/3 + 1/4 = (2x4 + 1x3) / (3x4) = (8 + 3) / 12 = 11/12. Samakan penyebut terlebih dahulu.'],
        ['kat' => 3, 'sub' => 'pelayanan_publik', 'q' => 'Prinsip pelayanan publik yang mengutamakan keterbukaan informasi adalah...', 'a' => 'Akuntabilitas', 'b' => 'Transparansi', 'c' => 'Partisipatif', 'd' => 'Non-diskriminatif', 'e' => 'Kepastian hukum', 'ans' => 'B', 'exp' => 'Prinsip transparansi mengutamakan keterbukaan informasi dalam pelayanan publik, sehingga masyarakat dapat mengakses informasi dengan mudah.'],
        ['kat' => 3, 'sub' => 'jejaring_kerja', 'q' => 'Cara membangun jejaring kerja yang baik adalah...', 'a' => 'Komunikasi yang efektif', 'b' => 'Saling menghargai', 'c' => 'Kolaborasi yang baik', 'd' => 'Semua jawaban benar', 'e' => 'Hanya a dan b yang benar', 'ans' => 'D', 'exp' => 'Cara membangun jejaring kerja yang baik meliputi komunikasi yang efektif, saling menghargai, kolaborasi yang baik, dan dukungan timbal balik.'],
        ['kat' => 3, 'sub' => 'sosial_budaya', 'q' => 'Sikap yang menunjukkan penghargaan terhadap keberagaman adalah...', 'a' => 'Toleransi terhadap perbedaan', 'b' => 'Menghargai budaya lain', 'c' => 'Tidak diskriminatif', 'd' => 'Mempertahankan persatuan', 'e' => 'Semua jawaban benar', 'ans' => 'E', 'exp' => 'Sikap yang menunjukkan penghargaan terhadap keberagaman meliputi toleransi terhadap perbedaan, menghargai budaya lain, tidak diskriminatif, dan mempertahankan persatuan.'],
        ['kat' => 3, 'sub' => 'teknologi_informasi', 'q' => 'Manfaat pemanfaatan TIK dalam pelayanan publik adalah...', 'a' => 'E-government untuk efisiensi', 'b' => 'Sistem informasi terpadu', 'c' => 'Layanan online', 'd' => 'Digitalisasi arsip', 'e' => 'Semua jawaban benar', 'ans' => 'E', 'exp' => 'Manfaat pemanfaatan TIK dalam pelayanan publik meliputi e-government untuk efisiensi, sistem informasi terpadu, layanan online, dan digitalisasi arsip.'],
        ['kat' => 3, 'sub' => 'profesionalisme', 'q' => 'Ciri utama seorang profesional adalah...', 'a' => 'Kompeten dalam bidangnya', 'b' => 'Etos kerja tinggi', 'c' => 'Integritas moral', 'd' => 'Tanggung jawab', 'e' => 'Semua jawaban benar', 'ans' => 'E', 'exp' => 'Ciri utama seorang profesional meliputi kompeten dalam bidangnya, etos kerja tinggi, integritas moral, tanggung jawab, dan terus belajar dan berkembang.'],
        ['kat' => 4, 'sub' => 'matematika_dasar', 'q' => 'Jika 2x + 3 = 9, maka nilai x adalah...', 'a' => '2', 'b' => '3', 'c' => '4', 'd' => '5', 'e' => '6', 'ans' => 'B', 'exp' => '2x + 3 = 9 -> 2x = 9 - 3 -> 2x = 6 -> x = 6/2 -> x = 3'],
        ['kat' => 4, 'sub' => 'matematika_dasar', 'q' => 'Hasil dari 15% dari 200 adalah...', 'a' => '15', 'b' => '20', 'c' => '25', 'd' => '30', 'e' => '35', 'ans' => 'D', 'exp' => '15% dari 200 = (15/100) x 200 = 0.15 x 200 = 30'],
        ['kat' => 4, 'sub' => 'bahasa_indonesia', 'q' => 'Kalimat yang efektif adalah...', 'a' => 'Saya pergi ke pasar membeli sayur', 'b' => 'Saya pergi ke pasar untuk membeli sayur', 'c' => 'Saya membeli sayur di pasar', 'd' => 'Ke pasar saya pergi membeli sayur', 'e' => 'Membeli sayur saya pergi ke pasar', 'ans' => 'B', 'exp' => 'Kalimat efektif adalah Saya pergi ke pasar untuk membeli sayur karena struktur kalimat yang jelas dan menggunakan kata penghubung yang tepat.'],
        ['kat' => 4, 'sub' => 'bahasa_inggris', 'q' => 'She ___ to the meeting yesterday (go/went/gone)', 'a' => 'go', 'b' => 'went', 'c' => 'gone', 'd' => 'going', 'e' => 'goes', 'ans' => 'B', 'exp' => 'She went to the meeting yesterday. Past tense dari go adalah went.'],
        ['kat' => 5, 'sub' => 'tes_iq', 'q' => 'Lanjutkan deret angka: 2, 4, 8, 16, ...', 'a' => '24', 'b' => '30', 'c' => '32', 'd' => '36', 'e' => '40', 'ans' => 'C', 'exp' => 'Deret mengikuti pola perkalian 2: 2x2=4, 4x2=8, 8x2=16, 16x2=32. Jadi angka selanjutnya adalah 32.'],
        ['kat' => 5, 'sub' => 'tes_logika_aritmatika', 'q' => 'Angka selanjutnya dari 3, 6, 12, 24, ... adalah', 'a' => '30', 'b' => '36', 'c' => '42', 'd' => '48', 'e' => '54', 'ans' => 'D', 'exp' => 'Deret mengikuti pola perkalian 2: 3x2=6, 6x2=12, 12x2=24, 24x2=48. Jadi angka selanjutnya adalah 48.'],
        ['kat' => 5, 'sub' => 'tes_analog_verbal', 'q' => 'Sinonim dari kata cepat adalah', 'a' => 'lambat', 'b' => 'pelan', 'c' => 'kilat', 'd' => 'tenang', 'e' => 'santai', 'ans' => 'C', 'exp' => 'Sinonim dari kata cepat adalah kilat, yang memiliki makna serupa yaitu sesuatu yang bergerak dengan kecepatan tinggi.'],
        ['kat' => 5, 'sub' => 'tes_wartegg', 'q' => 'Tes Wartegg digunakan untuk mengukur...', 'a' => 'Kecerdasan intelektual', 'b' => 'Kreativitas dan kepribadian', 'c' => 'Kemampuan matematika', 'd' => 'Kemampuan verbal', 'e' => 'Kemampuan spasial', 'ans' => 'B', 'exp' => 'Tes Wartegg digunakan untuk mengukur kreativitas, ketelitian, dan kepribadian peserta melalui gambar pola sederhana yang harus dilanjutkan menjadi gambar utuh.'],
        ['kat' => 5, 'sub' => 'tes_spasial', 'q' => 'Tes Spasial menguji kemampuan...', 'a' => 'Imajinasi visual dan kejelian terhadap bentuk', 'b' => 'Kemampuan verbal', 'c' => 'Kemampuan matematika', 'd' => 'Kemampuan logika', 'e' => 'Kemampuan memori', 'ans' => 'A', 'exp' => 'Tes Spasial menguji kemampuan imajinasi dan kejelian terhadap bentuk atau pola, seperti rotasi bentuk dan susunan pola geometris.'],
        ['kat' => 5, 'sub' => 'tes_pauli', 'q' => 'Tes Pauli (Kraepelin) digunakan untuk mengukur...', 'a' => 'Konsistensi dan daya tahan', 'b' => 'Kreativitas', 'c' => 'Kemampuan verbal', 'd' => 'Kemampuan matematika', 'e' => 'Kepribadian', 'ans' => 'A', 'exp' => 'Tes Pauli (Kraepelin) digunakan untuk mengukur konsistensi, daya tahan, dan tingkat konsentrasi peserta melalui penjumlahan angka yang tersusun vertikal.'],
        ['kat' => 5, 'sub' => 'tes_gambar_pohon', 'q' => 'Tes Gambar Pohon digunakan untuk menggali...', 'a' => 'Aspek emosional dan kepribadian', 'b' => 'Kemampuan matematika', 'c' => 'Kemampuan verbal', 'd' => 'Kecerdasan intelektual', 'e' => 'Kemampuan spasial', 'ans' => 'A', 'exp' => 'Tes Gambar Pohon digunakan untuk menggali aspek psikologis yang lebih dalam, seperti aspek emosional, kepribadian, dan persepsi individu terhadap lingkungan sosial.'],
        ['kat' => 5, 'sub' => 'tes_epps', 'q' => 'Tes EPPS digunakan untuk mengukur...', 'a' => 'Kecenderungan kepribadian dan preferensi', 'b' => 'Kecerdasan intelektual', 'c' => 'Kemampuan matematika', 'd' => 'Kemampuan verbal', 'e' => 'Kemampuan spasial', 'ans' => 'A', 'exp' => 'Tes Edward Personal Preference Schedule (EPPS) digunakan untuk mengukur kecenderungan kepribadian dan preferensi seseorang melalui pernyataan verbal.'],
        ['kat' => 5, 'sub' => 'tes_mbti', 'q' => 'Tes MBTI mengukur dimensi kepribadian...', 'a' => 'Introversi-Ekstroversi, Penginderaan-Intuisi, Pemikiran-Perasaan, Penilaian-Persepsi', 'b' => 'Hanya introversi-ekstroversi', 'c' => 'Hanya penginderaan-intuisi', 'd' => 'Hanya pemikiran-perasaan', 'e' => 'Hanya penilaian-persepsi', 'ans' => 'A', 'exp' => 'Tes MBTI mengukur dimensi kepribadian seperti introversi-ekstroversi, penginderaan-intuisi, pemikiran-perasaan, dan penilaian-persepsi untuk memahami tipe kepribadian dan potensi seseorang.']
    ];
    
    $stmt = $conn->prepare("INSERT INTO soal (kategori_id, sub_materi, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    
    foreach ($questions as $q) {
        try {
            $stmt->execute([$q['kat'], $q['sub'], $q['q'], $q['a'], $q['b'], $q['c'], $q['d'], $q['e'], $q['ans'], $q['exp']]);
            $successCount++;
        } catch (PDOException $e) {
            $errorCount++;
            $errors[] = $e->getMessage();
        }
    }
    
    echo json_encode([
        'success' => true,
        'successCount' => $successCount,
        'errorCount' => $errorCount,
        'errors' => $errors,
        'message' => "Successfully added $successCount questions to the database"
    ]);
    
    $conn = null;
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
