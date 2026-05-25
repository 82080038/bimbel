<?php
// Populate topik_pelajaran with comprehensive topics
// Access via: http://localhost/bimbel/populate_comprehensive_topics.php
// Date: 2026-05-26

require_once 'config.php';

header('Content-Type: text/plain');

// Comprehensive topics for each category
$topics = [
    // TWK (Tes Wawasan Kebangsaan) - kategori_id: 1
    [
        'kategori_id' => 1,
        'topics' => [
            ['nama_topik' => 'Pancasila', 'deskripsi' => 'Ideologi dasar negara Indonesia dan nilai-nilainya', 'urutan' => 1],
            ['nama_topik' => 'UUD 1945', 'deskripsi' => 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945', 'urutan' => 2],
            ['nama_topik' => 'Sejarah Indonesia', 'deskripsi' => 'Sejarah perjuangan dan kemerdekaan Indonesia', 'urutan' => 3],
            ['nama_topik' => 'Geografi Indonesia', 'deskripsi' => 'Geografi, wilayah, dan sumber daya alam Indonesia', 'urutan' => 4],
            ['nama_topik' => 'Bhinneka Tunggal Ika', 'deskripsi' => 'Semboyan negara dan persatuan dalam keberagaman', 'urutan' => 5],
            ['nama_topik' => 'NKRI', 'deskripsi' => 'Negara Kesatuan Republik Indonesia dan kedaulatan', 'urutan' => 6],
            ['nama_topik' => 'Demokrasi', 'deskripsi' => 'Sistem demokrasi dan partisipasi politik', 'urutan' => 7],
            ['nama_topik' => 'Hak Asasi Manusia', 'deskripsi' => 'Hak asasi manusia dan perlindungannya', 'urutan' => 8],
            ['nama_topik' => 'Otonomi Daerah', 'deskripsi' => 'Otonomi daerah dan desentralisasi', 'urutan' => 9],
            ['nama_topik' => 'Partisipasi Masyarakat', 'deskripsi' => 'Peran serta masyarakat dalam pembangunan', 'urutan' => 10],
            ['nama_topik' => 'Sistem Pemerintahan', 'deskripsi' => 'Sistem pemerintahan Indonesia dan lembaga negara', 'urutan' => 11],
            ['nama_topik' => 'Perundang-undangan', 'deskripsi' => 'Sistem hukum dan peraturan perundang-undangan', 'urutan' => 12],
            ['nama_topik' => 'Bela Negara', 'deskripsi' => 'Konsep bela negara dan pertahanan', 'urutan' => 13],
            ['nama_topik' => 'Nasionalisme', 'deskripsi' => 'Semangat nasionalisme dan cinta tanah air', 'urutan' => 14],
            ['nama_topik' => 'Integritas', 'deskripsi' => 'Integritas nasional dan anti korupsi', 'urutan' => 15],
        ]
    ],
    // TIU (Tes Intelegensi Umum) - kategori_id: 2
    [
        'kategori_id' => 2,
        'topics' => [
            ['nama_topik' => 'Verbal Reasoning', 'deskripsi' => 'Penalaran verbal dan kemampuan bahasa', 'urutan' => 1],
            ['nama_topik' => 'Numerical Reasoning', 'deskripsi' => 'Penalaran numerik dan kemampuan angka', 'urutan' => 2],
            ['nama_topik' => 'Logika Matematika', 'deskripsi' => 'Pemecahan masalah logis dan matematika', 'urutan' => 3],
            ['nama_topik' => 'Spasial Reasoning', 'deskripsi' => 'Penalaran spasial dan visual', 'urutan' => 4],
            ['nama_topik' => 'Analisis Data', 'deskripsi' => 'Analisis data dan interpretasi informasi', 'urutan' => 5],
            ['nama_topik' => 'Pemecahan Masalah', 'deskripsi' => 'Kemampuan pemecahan masalah sistematis', 'urutan' => 6],
            ['nama_topik' => 'Deret Angka', 'deskripsi' => 'Pola deret angka dan aritmatika', 'urutan' => 7],
            ['nama_topik' => 'Deret Huruf', 'deskripsi' => 'Pola deret huruf dan alfabet', 'urutan' => 8],
            ['nama_topik' => 'Analogi', 'deskripsi' => 'Analogi verbal dan hubungan kata', 'urutan' => 9],
            ['nama_topik' => 'Silogisme', 'deskripsi' => 'Penalaran silogistik dan logika formal', 'urutan' => 10],
            ['nama_topik' => 'Sinonim', 'deskripsi' => 'Kata-kata sinonim dan persamaan makna', 'urutan' => 11],
            ['nama_topik' => 'Antonim', 'deskripsi' => 'Kata-kata antonim dan lawan kata', 'urutan' => 12],
            ['nama_topik' => 'Perbandingan Kuantitatif', 'deskripsi' => 'Perbandingan dan proporsi kuantitatif', 'urutan' => 13],
            ['nama_topik' => 'Operasi Hitung', 'deskripsi' => 'Operasi hitung dasar dan lanjutan', 'urutan' => 14],
            ['nama_topik' => 'Pemahaman Bacaan', 'deskripsi' => 'Pemahaman bacaan dan komprehensi teks', 'urutan' => 15],
        ]
    ],
    // TKP (Tes Karakteristik Pribadi) - kategori_id: 3
    [
        'kategori_id' => 3,
        'topics' => [
            ['nama_topik' => 'Kepribadian', 'deskripsi' => 'Asesmen kepribadian dan karakter individu', 'urutan' => 1],
            ['nama_topik' => 'Etika Kerja', 'deskripsi' => 'Etika dan profesionalisme dalam bekerja', 'urutan' => 2],
            ['nama_topik' => 'Sikap Kerja', 'deskripsi' => 'Sikap dan perilaku dalam lingkungan kerja', 'urutan' => 3],
            ['nama_topik' => 'Integritas Moral', 'deskripsi' => 'Integritas moral dan etika perilaku', 'urutan' => 4],
            ['nama_topik' => 'Perilaku Sosial', 'deskripsi' => 'Perilaku sosial dan hubungan interpersonal', 'urutan' => 5],
            ['nama_topik' => 'Kepemimpinan', 'deskripsi' => 'Kemampuan kepemimpinan dan manajemen', 'urutan' => 6],
            ['nama_topik' => 'Kerjasama Tim', 'deskripsi' => 'Kerjasama tim dan kolaborasi', 'urutan' => 7],
            ['nama_topik' => 'Motivasi', 'deskripsi' => 'Motivasi kerja dan pencapaian target', 'urutan' => 8],
            ['nama_topik' => 'Pengendalian Diri', 'deskripsi' => 'Pengendalian emosi dan manajemen stres', 'urutan' => 9],
            ['nama_topik' => 'Adaptabilitas', 'deskripsi' => 'Kemampuan adaptasi dan fleksibilitas', 'urutan' => 10],
            ['nama_topik' => 'Komunikasi', 'deskripsi' => 'Kemampuan komunikasi efektif', 'urutan' => 11],
            ['nama_topik' => 'Manajemen Waktu', 'deskripsi' => 'Manajemen waktu dan produktivitas', 'urutan' => 12],
            ['nama_topik' => 'Orientasi Pelayanan', 'deskripsi' => 'Orientasi pelayanan dan kepedulian', 'urutan' => 13],
            ['nama_topik' => 'Profesionalisme', 'deskripsi' => 'Sikap profesional dan tanggung jawab', 'urutan' => 14],
            ['nama_topik' => 'Inisiatif', 'deskripsi' => 'Inisiatif dan proaktif dalam bekerja', 'urutan' => 15],
        ]
    ],
    // TPA (Tes Potensi Akademik) - kategori_id: 4
    [
        'kategori_id' => 4,
        'topics' => [
            ['nama_topik' => 'Matematika Dasar', 'deskripsi' => 'Matematika dasar dan konsep fundamental', 'urutan' => 1],
            ['nama_topik' => 'Bahasa Indonesia', 'deskripsi' => 'Bahasa Indonesia dan tata bahasa', 'urutan' => 2],
            ['nama_topik' => 'Bahasa Inggris', 'deskripsi' => 'Bahasa Inggris dan tata bahasa', 'urutan' => 3],
            ['nama_topik' => 'Sains', 'deskripsi' => 'Ilmu pengetahuan alam dan sains dasar', 'urutan' => 4],
            ['nama_topik' => 'Logika', 'deskripsi' => 'Logika dan penalaran abstrak', 'urutan' => 5],
            ['nama_topik' => 'Kemampuan Kuantitatif', 'deskripsi' => 'Kemampuan kuantitatif dan statistik', 'urutan' => 6],
            ['nama_topik' => 'Kemampuan Verbal', 'deskripsi' => 'Kemampuan verbal dan kosakata', 'urutan' => 7],
            ['nama_topik' => 'Pemahaman Konsep', 'deskripsi' => 'Pemahaman konsep dan teori', 'urutan' => 8],
            ['nama_topik' => 'Analisis Kritis', 'deskripsi' => 'Analisis kritis dan evaluasi', 'urutan' => 9],
            ['nama_topik' => 'Pemecahan Masalah Akademik', 'deskripsi' => 'Pemecahan masalah akademik', 'urutan' => 10],
        ]
    ],
    // PSIKOLOGIS (Tes Psikologis) - kategori_id: 5
    [
        'kategori_id' => 5,
        'topics' => [
            ['nama_topik' => 'Kepribadian', 'deskripsi' => 'Asesmen kepribadian dan karakter', 'urutan' => 1],
            ['nama_topik' => 'Motivasi', 'deskripsi' => 'Motivasi dan dorongan perilaku', 'urutan' => 2],
            ['nama_topik' => 'Pengendalian Diri', 'deskripsi' => 'Pengendalian diri dan regulasi emosi', 'urutan' => 3],
            ['nama_topik' => 'Kepemimpinan', 'deskripsi' => 'Potensi kepemimpinan', 'urutan' => 4],
            ['nama_topik' => 'Kreativitas', 'deskripsi' => 'Kreativitas dan pemikiran inovatif', 'urutan' => 5],
            ['nama_topik' => 'Inteligensi', 'deskripsi' => 'Inteligensi dan kemampuan kognitif', 'urutan' => 6],
            ['nama_topik' => 'Stabilitas Emosi', 'deskripsi' => 'Stabilitas emosi dan kesehatan mental', 'urutan' => 7],
            ['nama_topik' => 'Sikap Sosial', 'deskripsi' => 'Sikap sosial dan hubungan interpersonal', 'urutan' => 8],
            ['nama_topik' => 'Adaptasi', 'deskripsi' => 'Kemampuan adaptasi dan fleksibilitas', 'urutan' => 9],
            ['nama_topik' => 'Stress Management', 'deskripsi' => 'Manajemen stres dan coping', 'urutan' => 10],
        ]
    ]
];

try {
    // Clear existing topics (optional - comment out if you want to keep existing)
    echo "Clearing existing topics...\n";
    $conn->query("DELETE FROM topik_pelajaran");
    echo "✓ Cleared existing topics\n\n";
    
    // Insert new topics
    echo "Inserting comprehensive topics...\n";
    $totalInserted = 0;
    
    foreach ($topics as $category) {
        $kategori_id = $category['kategori_id'];
        echo "\nCategory ID: $kategori_id\n";
        
        foreach ($category['topics'] as $topic) {
            $nama_topik = $conn->real_escape_string($topic['nama_topik']);
            $deskripsi = $conn->real_escape_string($topic['deskripsi']);
            $urutan = $topic['urutan'];
            
            $sql = "INSERT INTO topik_pelajaran (kategori_id, nama_topik, deskripsi, urutan) 
                    VALUES ($kategori_id, '$nama_topik', '$deskripsi', $urutan)";
            
            if ($conn->query($sql)) {
                echo "  ✓ Inserted: $nama_topik\n";
                $totalInserted++;
            } else {
                echo "  ✗ Failed to insert: $nama_topik - " . $conn->error . "\n";
            }
        }
    }
    
    echo "\n========================================\n";
    echo "Total topics inserted: $totalInserted\n";
    echo "========================================\n";
    
    // Verify
    $result = $conn->query("SELECT k.nama_kategori, COUNT(t.id) as topic_count 
                            FROM kategori_soal k 
                            LEFT JOIN topik_pelajaran t ON k.id = t.kategori_id 
                            GROUP BY k.id, k.nama_kategori 
                            ORDER BY k.id");
    
    echo "\nTopic count by category:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- {$row['nama_kategori']}: {$row['topic_count']} topics\n";
    }
    
    echo "\nMigration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
