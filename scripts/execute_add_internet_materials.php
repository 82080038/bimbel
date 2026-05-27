<?php
// Database configuration
$host = '127.0.0.1';
$user = 'root';
$pass = 'root';
$dbname = 'bimbel_db';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // SQL statements for new materials from internet research
    $sqlStatements = [
        // TWK - Nasionalisme
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (1, 'nasionalisme', 'Nasionalisme dalam konteks TWK SKD CPNS dimaknai sebagai...', 'Kebanggaan berlebihan terhadap bangsa', 'Fanatisme sempit terhadap suku', 'Sikap moderat yang menjunjung persatuan dan menghormati perbedaan', 'Ketaatan mutlak terhadap pemerintah', 'Penolakan terhadap budaya asing', 'C', 'Nasionalisme dalam konteks TWK SKD CPNS dimaknai sebagai sikap moderat yang menjunjung persatuan, menghormati perbedaan, dan mengutamakan kepentingan nasional, bukan sebagai kebanggaan berlebihan atau fanatisme sempit.', NOW())",
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (1, 'nasionalisme', 'Tujuan utama nasionalisme adalah untuk...', 'Memperkuat kepentingan kelompok', 'Menjaga keutuhan NKRI', 'Menolak budaya asing', 'Mengutamakan kepentingan pribadi', 'Mengisolasi negara dari dunia', 'B', 'Tujuan utama nasionalisme adalah untuk menjaga keutuhan NKRI, mempertahankan kedaulatan negara, memperkuat identitas nasional, dan mendorong warga negara berpartisipasi aktif membangun bangsa.', NOW())",
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (1, 'nasionalisme', 'Nasionalisme Indonesia bersifat kebangsaan artinya...', 'Berdasarkan kesamaan suku', 'Berdasarkan kesamaan agama', 'Berdasarkan kesamaan ras', 'Berdasarkan kesamaan nasib bangsa Indonesia', 'Berdasarkan kesamaan wilayah', 'D', 'Nasionalisme Indonesia bersifat kebangsaan, artinya berdasarkan kesamaan nasib bangsa Indonesia, bukan berdasarkan kesamaan suku, agama, atau ras.', NOW())",
        
        // TWK - Integritas Nasional
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (1, 'integritas_nasional', 'Integritas nasional tercermin dalam sikap...', 'Konsisten antara perkataan dan perbuatan', 'Mengikuti keinginan atasan tanpa pertanyaan', 'Mencari pembenaran atas kesalahan', 'Menyembunyikan informasi penting', 'Mengutamakan kepentingan pribadi', 'A', 'Integritas nasional tercermin dalam sikap konsisten antara perkataan dan perbuatan, taat aturan meskipun tidak diawasi, menolak penyimpangan sekecil apa pun, dan berani menanggung risiko demi kebenaran.', NOW())",
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (1, 'integritas_nasional', 'Mengapa integritas nasional sangat penting bagi warga negara...', 'Karena meningkatkan popularitas', 'Karena mendapatkan keuntungan pribadi', 'Karena warga negara memegang kepercayaan publik', 'Karena diwajibkan oleh atasan', 'Karena untuk menghindari hukuman', 'C', 'Integritas nasional sangat penting bagi warga negara karena warga negara memegang kepercayaan publik, penyimpangan berawal dari runtuhnya integritas, sistem yang baik akan rusak bila dijalankan tanpa integritas, dan negara membutuhkan warga yang kokoh secara moral.', NOW())",
        
        // TWK - Pilar Negara
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (1, 'pilar_negara', 'Empat pilar negara meliputi...', 'Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika', 'Pancasila, UUD 1945, NKRI, dan Garuda Pancasila', 'Pancasila, UUD 1945, NKRI, dan Indonesia Raya', 'Pancasila, UUD 1945, NKRI, dan Merah Putih', 'Pancasila, UUD 1945, NKRI, dan NKRI', 'A', 'Empat pilar negara meliputi Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika. Keempat pilar ini saling terkait dan tidak dapat dipisahkan.', NOW())",
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (1, 'pilar_negara', 'Pancasila berperan sebagai pilar negara karena...', 'Sebagai hukum dasar', 'Sebagai dasar filosofis dan sumber dari segala sumber hukum', 'Sebagai bentuk negara', 'Sebagai semangat persatuan', 'Sebagai lambang negara', 'B', 'Pancasila berperan sebagai pilar negara karena berfungsi sebagai dasar filosofis dan sumber dari segala sumber hukum, sebagai ideologi dasar negara Indonesia.', NOW())",
        
        // TIU - Deret Gambar
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (2, 'deret_gambar', 'Bentuk selanjutnya dalam deret rotasi adalah...', 'Rotasi 90 derajat searah jarum jam', 'Rotasi 90 derajat berlawanan jarum jam', 'Rotasi 180 derajat', 'Tidak ada rotasi', 'Rotasi 45 derajat', 'A', 'Dalam deret rotasi, bentuk biasanya berputar 90 derajat searah jarum jam secara konsisten dari satu gambar ke gambar berikutnya.', NOW())",
        
        // TIU - Teori Bilangan
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (2, 'teori_bilangan', 'Hasil dari 15 + (-8) adalah...', '23', '7', '-7', '-23', '8', 'B', '15 + (-8) = 15 - 8 = 7. Penjumlahan bilangan positif dengan negatif sama dengan pengurangan.', NOW())",
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (2, 'teori_bilangan', 'Bilangan prima di antara 10 dan 20 adalah...', '10, 12, 14, 16, 18', '11, 13, 17, 19', '12, 15, 18', '13, 15, 17', '11, 15, 17, 19', 'B', 'Bilangan prima di antara 10 dan 20 adalah 11, 13, 17, dan 19. Bilangan prima adalah bilangan yang hanya dapat dibagi oleh 1 dan dirinya sendiri.', NOW())",
        
        // TIU - Operasi Pecahan
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (2, 'operasi_pecahan', 'Hasil dari 2/3 + 1/4 adalah...', '3/7', '5/12', '11/12', '8/12', '1/2', 'C', '2/3 + 1/4 = (2×4 + 1×3) / (3×4) = (8 + 3) / 12 = 11/12. Samakan penyebut terlebih dahulu.', NOW())",
        
        // TKP - Pelayanan Publik
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (3, 'pelayanan_publik', 'Prinsip pelayanan publik yang mengutamakan keterbukaan informasi adalah...', 'Akuntabilitas', 'Transparansi', 'Partisipatif', 'Non-diskriminatif', 'Kepastian hukum', 'B', 'Prinsip transparansi mengutamakan keterbukaan informasi dalam pelayanan publik, sehingga masyarakat dapat mengakses informasi dengan mudah.', NOW())",
        
        // TKP - Jejaring Kerja
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (3, 'jejaring_kerja', 'Cara membangun jejaring kerja yang baik adalah...', 'Komunikasi yang efektif', 'Saling menghargai', 'Kolaborasi yang baik', 'Semua jawaban benar', 'Hanya a dan b yang benar', 'D', 'Cara membangun jejaring kerja yang baik meliputi komunikasi yang efektif, saling menghargai, kolaborasi yang baik, dan dukungan timbal balik.', NOW())",
        
        // TKP - Sosial Budaya
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (3, 'sosial_budaya', 'Sikap yang menunjukkan penghargaan terhadap keberagaman adalah...', 'Toleransi terhadap perbedaan', 'Menghargai budaya lain', 'Tidak diskriminatif', 'Mempertahankan persatuan', 'Semua jawaban benar', 'E', 'Sikap yang menunjukkan penghargaan terhadap keberagaman meliputi toleransi terhadap perbedaan, menghargai budaya lain, tidak diskriminatif, dan mempertahankan persatuan.', NOW())",
        
        // TKP - Teknologi Informasi
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (3, 'teknologi_informasi', 'Manfaat pemanfaatan TIK dalam pelayanan publik adalah...', 'E-government untuk efisiensi', 'Sistem informasi terpadu', 'Layanan online', 'Digitalisasi arsip', 'Semua jawaban benar', 'E', 'Manfaat pemanfaatan TIK dalam pelayanan publik meliputi e-government untuk efisiensi, sistem informasi terpadu, layanan online, dan digitalisasi arsip.', NOW())",
        
        // TKP - Profesionalisme
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (3, 'profesionalisme', 'Ciri utama seorang profesional adalah...', 'Kompeten dalam bidangnya', 'Etos kerja tinggi', 'Integritas moral', 'Tanggung jawab', 'Semua jawaban benar', 'E', 'Ciri utama seorang profesional meliputi kompeten dalam bidangnya, etos kerja tinggi, integritas moral, tanggung jawab, dan terus belajar dan berkembang.', NOW())",
        
        // TPA - Matematika Dasar
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (4, 'matematika_dasar', 'Jika 2x + 3 = 9, maka nilai x adalah...', '2', '3', '4', '5', '6', 'B', '2x + 3 = 9 → 2x = 9 - 3 → 2x = 6 → x = 6/2 → x = 3', NOW())",
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (4, 'matematika_dasar', 'Hasil dari 15% dari 200 adalah...', '15', '20', '25', '30', '35', 'D', '15% dari 200 = (15/100) × 200 = 0.15 × 200 = 30', NOW())",
        
        // TPA - Bahasa Indonesia
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (4, 'bahasa_indonesia', 'Kalimat yang efektif adalah...', 'Saya pergi ke pasar membeli sayur', 'Saya pergi ke pasar untuk membeli sayur', 'Saya membeli sayur di pasar', 'Ke pasar saya pergi membeli sayur', 'Membeli sayur saya pergi ke pasar', 'B', 'Kalimat efektif adalah "Saya pergi ke pasar untuk membeli sayur" karena struktur kalimat yang jelas dan menggunakan kata penghubung yang tepat.', NOW())",
        
        // TPA - Bahasa Inggris
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (4, 'bahasa_inggris', 'She ___ to the meeting yesterday (go/went/gone)', 'go', 'went', 'gone', 'going', 'goes', 'B', 'She went to the meeting yesterday. Past tense dari "go" adalah "went".', NOW())",
        
        // PSIKOLOGIS - Tes IQ
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_iq', 'Lanjutkan deret angka: 2, 4, 8, 16, ...', '24', '30', '32', '36', '40', 'C', 'Deret mengikuti pola perkalian 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32. Jadi angka selanjutnya adalah 32.', NOW())",
        
        // PSIKOLOGIS - Tes Logika Aritmatika
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_logika_aritmatika', 'Angka selanjutnya dari 3, 6, 12, 24, ... adalah', '30', '36', '42', '48', '54', 'D', 'Deret mengikuti pola perkalian 2: 3×2=6, 6×2=12, 12×2=24, 24×2=48. Jadi angka selanjutnya adalah 48.', NOW())",
        
        // PSIKOLOGIS - Tes Analog Verbal
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_analog_verbal', 'Sinonim dari kata "cepat" adalah', 'lambat', 'pelan', 'kilat', 'tenang', 'santai', 'C', 'Sinonim dari kata "cepat" adalah "kilat", yang memiliki makna serupa yaitu sesuatu yang bergerak dengan kecepatan tinggi.', NOW())",
        
        // PSIKOLOGIS - Tes Wartegg
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_wartegg', 'Tes Wartegg digunakan untuk mengukur...', 'Kecerdasan intelektual', 'Kreativitas dan kepribadian', 'Kemampuan matematika', 'Kemampuan verbal', 'Kemampuan spasial', 'B', 'Tes Wartegg digunakan untuk mengukur kreativitas, ketelitian, dan kepribadian peserta melalui gambar pola sederhana yang harus dilanjutkan menjadi gambar utuh.', NOW())",
        
        // PSIKOLOGIS - Tes Spasial
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_spasial', 'Tes Spasial menguji kemampuan...', 'Imajinasi visual dan kejelian terhadap bentuk', 'Kemampuan verbal', 'Kemampuan matematika', 'Kemampuan logika', 'Kemampuan memori', 'A', 'Tes Spasial menguji kemampuan imajinasi dan kejelian terhadap bentuk atau pola, seperti rotasi bentuk dan susunan pola geometris.', NOW())",
        
        // PSIKOLOGIS - Tes Pauli
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_pauli', 'Tes Pauli (Kraepelin) digunakan untuk mengukur...', 'Konsistensi dan daya tahan', 'Kreativitas', 'Kemampuan verbal', 'Kemampuan matematika', 'Kepribadian', 'A', 'Tes Pauli (Kraepelin) digunakan untuk mengukur konsistensi, daya tahan, dan tingkat konsentrasi peserta melalui penjumlahan angka yang tersusun vertikal.', NOW())",
        
        // PSIKOLOGIS - Tes Gambar Pohon
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_gambar_pohon', 'Tes Gambar Pohon digunakan untuk menggali...', 'Aspek emosional dan kepribadian', 'Kemampuan matematika', 'Kemampuan verbal', 'Kecerdasan intelektual', 'Kemampuan spasial', 'A', 'Tes Gambar Pohon digunakan untuk menggali aspek psikologis yang lebih dalam, seperti aspek emosional, kepribadian, dan persepsi individu terhadap lingkungan sosial.', NOW())",
        
        // PSIKOLOGIS - Tes EPPS
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_epps', 'Tes EPPS digunakan untuk mengukur...', 'Kecenderungan kepribadian dan preferensi', 'Kecerdasan intelektual', 'Kemampuan matematika', 'Kemampuan verbal', 'Kemampuan spasial', 'A', 'Tes Edward Personal Preference Schedule (EPPS) digunakan untuk mengukur kecenderungan kepribadian dan preferensi seseorang melalui pernyataan verbal.', NOW())",
        
        // PSIKOLOGIS - Tes MBTI
        "INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) VALUES (5, 'tes_mbti', 'Tes MBTI mengukur dimensi kepribadian...', 'Introversi-Ekstroversi, Penginderaan-Intuisi, Pemikiran-Perasaan, Penilaian-Persepsi', 'Hanya introversi-ekstroversi', 'Hanya penginderaan-intuisi', 'Hanya pemikiran-perasaan', 'Hanya penilaian-persepsi', 'A', 'Tes MBTI mengukur dimensi kepribadian seperti introversi-ekstroversi, penginderaan-intuisi, pemikiran-perasaan, dan penilaian-persepsi untuk memahami tipe kepribadian dan potensi seseorang.', NOW())"
    ];
    
    $successCount = 0;
    $errorCount = 0;
    $errors = [];
    
    foreach ($sqlStatements as $sql) {
        try {
            $conn->exec($sql);
            $successCount++;
        } catch (PDOException $e) {
            $errorCount++;
            $errors[] = $e->getMessage();
        }
    }
    
    echo "Successfully added $successCount questions to the database\n";
    if ($errorCount > 0) {
        echo "Failed to add $errorCount questions\n";
        echo "Errors: " . implode(", ", $errors) . "\n";
    }
    
    $conn = null;
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
