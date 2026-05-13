#!/usr/bin/php
<?php
// CLI Batch Generator for Bahan Pelajaran and Tips
// Usage: php scripts/batch_generate.php --action=generate_bahan --limit=100

require_once __DIR__ . '/../config.php';

// Parse command line arguments
$options = getopt('', ['action:', 'limit:', 'kategori_id:']);
$action = $options['action'] ?? 'generate_bahan';
$limit = intval($options['limit'] ?? 50);
$kategori_id = intval($options['kategori_id'] ?? 0);

echo "=== Batch Generator ===\n";
echo "Action: $action\n";
echo "Limit: $limit\n";
echo "Kategori ID: $kategori_id\n\n";

switch ($action) {
    case 'generate_bahan':
        generateBahanPelajaranBatch($kategori_id, $limit);
        break;
    case 'generate_tips':
        generateTipsBatch($kategori_id, $limit);
        break;
    case 'analyze':
        analyzeSoalTopics($kategori_id);
        break;
    default:
        echo "Unknown action: $action\n";
        echo "Available actions: generate_bahan, generate_tips, analyze\n";
        exit(1);
}

function analyzeSoalTopics($kategori_id) {
    global $conn;
    
    $where = "";
    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = $kategori_id";
    }
    
    echo "Analyzing soal topics...\n";
    
    $sql = "SELECT kategori_id, 
            SUBSTRING(pertanyaan, 1, 100) as preview,
            LENGTH(pertanyaan) as length,
            tingkat
            FROM soal
            $where
            ORDER BY kategori_id, tingkat
            LIMIT 1000";
    $result = $conn->query($sql);
    
    $topic_patterns = [];
    
    while ($row = $result->fetch_assoc()) {
        $preview = $row['preview'];
        $keywords = extractKeywords($preview);
        
        foreach ($keywords as $keyword) {
            if (!isset($topic_patterns[$keyword])) {
                $topic_patterns[$keyword] = 0;
            }
            $topic_patterns[$keyword]++;
        }
    }
    
    arsort($topic_patterns);
    $top_topics = array_slice($topic_patterns, 0, 20, true);
    
    echo "\n=== Top Topics ===\n";
    foreach ($top_topics as $topic => $count) {
        echo "$topic: $count\n";
    }
    
    echo "\nAnalysis complete!\n";
}

function extractKeywords($text) {
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s]/', '', $text);
    $words = explode(' ', $text);
    
    $stop_words = ['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 'tersebut', 'sebagai', 'oleh', 'the', 'of', 'and', 'to', 'in'];
    
    $keywords = [];
    foreach ($words as $word) {
        if (strlen($word) > 3 && !in_array($word, $stop_words)) {
            $keywords[] = $word;
        }
    }
    
    return array_unique($keywords);
}

function generateBahanPelajaranBatch($kategori_id, $limit) {
    global $conn;
    
    $where = "";
    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = $kategori_id";
    }
    
    echo "Generating bahan pelajaran...\n";
    
    $sql = "SELECT s.*, k.nama_kategori 
            FROM soal s
            LEFT JOIN kategori_soal k ON s.kategori_id = k.id
            $where
            ORDER BY RAND()
            LIMIT $limit";
    $result = $conn->query($sql);
    
    $generated_count = 0;
    $soal_processed = [];
    
    while ($row = $result->fetch_assoc()) {
        $soal_id = $row['id'];
        $kategori = $row['nama_kategori'];
        $pertanyaan = $row['pertanyaan'];
        
        $judul = "Pembahasan Soal {$kategori} - Soal #{$soal_id}";
        $konten = generateKontenBahan($pertanyaan, $row['pembahasan'], $row['jawaban_benar'], $soal_id);
        
        // For large content, store as file
        if (strlen($konten) > 1048576) {
            $file_name = "bahan_{$soal_id}_" . time() . '.html';
            $file_path = '../uploads/bahan_pelajaran/text/' . $file_name;
            file_put_contents($file_path, $konten);
            
            $konten_db = ''; // Clear konten since it's in file
            $file_path_db = 'uploads/bahan_pelajaran/text/' . $file_name;
            
            $konten_escaped = '';
            $judul_escaped = $conn->real_escape_string($judul);
            $file_path_escaped = $conn->real_escape_string($file_path_db);
            
            $sql_insert = "INSERT INTO bahan_pelajaran (soal_id, judul, konten, tipe, file_path, urutan)
                           VALUES ($soal_id, '$judul_escaped', '$konten_escaped', 'teks', '$file_path_escaped', 0)";
        } else {
            $konten_escaped = $conn->real_escape_string($konten);
            $judul_escaped = $conn->real_escape_string($judul);
            
            $sql_insert = "INSERT INTO bahan_pelajaran (soal_id, judul, konten, tipe, urutan)
                           VALUES ($soal_id, '$judul_escaped', '$konten_escaped', 'teks', 0)";
        }
        
        if ($conn->query($sql_insert)) {
            $generated_count++;
            $soal_processed[] = $soal_id;
            echo "Generated bahan pelajaran for soal #$soal_id\n";
        }
    }
    
    echo "\n=== Summary ===\n";
    echo "Generated: $generated_count bahan pelajaran\n";
    echo "Soal processed: " . count($soal_processed) . "\n";
}

function findSimilarQuestions($soal_id, $kategori_id, $limit = 3) {
    global $conn;
    
    // Get the current question
    $sql_current = "SELECT pertanyaan, kategori_id FROM soal WHERE id = ?";
    $stmt_current = $conn->prepare($sql_current);
    $stmt_current->bind_param("i", $soal_id);
    $stmt_current->execute();
    $result_current = $stmt_current->get_result();
    $current_soal = $result_current->fetch_assoc();
    $stmt_current->close();
    
    if (!$current_soal) {
        return [];
    }
    
    $current_keywords = extractKeywords($current_soal['pertanyaan']);
    
    // Find similar questions based on keywords
    $similar_questions = [];
    $sql = "SELECT id, pertanyaan, jawaban_benar FROM soal 
            WHERE kategori_id = ? 
            AND id != ?
            LIMIT 100";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $current_soal['kategori_id'], $soal_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $row_keywords = extractKeywords($row['pertanyaan']);
        $common_keywords = array_intersect($current_keywords, $row_keywords);
        
        if (count($common_keywords) >= 2) {
            $similar_questions[] = [
                'id' => $row['id'],
                'pertanyaan' => substr($row['pertanyaan'], 0, 100) . '...',
                'jawaban_benar' => $row['jawaban_benar'],
                'similarity' => count($common_keywords)
            ];
        }
    }
    
    $stmt->close();
    
    // Sort by similarity
    usort($similar_questions, function($a, $b) {
        return $b['similarity'] - $a['similarity'];
    });
    
    return array_slice($similar_questions, 0, $limit);
}

function generateKontenBahan($pertanyaan, $pembahasan, $jawaban_benar, $soal_id) {
    global $conn;
    
    $konten = "<h1>Pembahasan Mendalam</h1>\n";
    $konten .= "<hr>\n\n";
    
    $konten .= "<h2>Pertanyaan</h2>\n";
    $konten .= "<p>{$pertanyaan}</p>\n\n";
    
    // Get similar questions
    $sql_kategori = "SELECT kategori_id FROM soal WHERE id = ?";
    $stmt_kategori = $conn->prepare($sql_kategori);
    $stmt_kategori->bind_param("i", $soal_id);
    $stmt_kategori->execute();
    $result_kategori = $stmt_kategori->get_result();
    $kat_row = $result_kategori->fetch_assoc();
    $kategori_id = $kat_row['kategori_id'];
    $stmt_kategori->close();
    
    $similar_questions = findSimilarQuestions($soal_id, $kategori_id);
    
    if (!empty($similar_questions)) {
        $konten .= "<h2>Soal-soal Mirip</h2>\n";
        $konten .= "<div class='similar-questions'>\n";
        foreach ($similar_questions as $sq) {
            $konten .= "<div class='similar-q'>\n";
            $konten .= "<p><strong>Soal #{$sq['id']}</strong>: {$sq['pertanyaan']}</p>\n";
            $konten .= "<p>Jawaban: <strong>{$sq['jawaban_benar']}</strong></p>\n";
            $konten .= "</div>\n";
        }
        $konten .= "</div>\n\n";
    }
    
    if (!empty($jawaban_benar)) {
        $konten .= "<h2>Jawaban Benar</h2>\n";
        $konten .= "<p class='correct-answer'><strong>{$jawaban_benar}</strong></p>\n\n";
    }
    
    if (!empty($pembahasan)) {
        $konten .= "<h2>Pembahasan Lengkap</h2>\n";
        $konten .= "<div class='explanation'>\n";
        $konten .= "<p>{$pembahasan}</p>\n";
        $konten .= "</div>\n\n";
    }
    
    $konten .= "<h2>Konsep Kunci</h2>\n";
    $konten .= "<ul class='key-concepts'>\n";
    $keywords = extractKeywords($pertanyaan);
    foreach (array_slice($keywords, 0, 5) as $keyword) {
        $konten .= "<li>{$keyword}</li>\n";
    }
    $konten .= "</ul>\n\n";
    
    $konten .= "<h2>Strategi Menjawab</h2>\n";
    $konten .= "<div class='strategy'>\n";
    $konten .= "<p><strong>Langkah-langkah:</strong></p>\n";
    $konten .= "<ol>\n";
    $konten .= "<li>Bacalah pertanyaan dengan teliti dan pahami apa yang ditanyakan</li>\n";
    $konten .= "<li>Identifikasi kata kunci dalam pertanyaan</li>\n";
    $konten .= "<li>Baca semua opsi jawaban sebelum memilih</li>\n";
    $konten .= "<li>Eliminasi jawaban yang jelas salah</li>\n";
    $konten .= "<li>Pilih jawaban yang paling logis dan sesuai dengan konsep</li>\n";
    $konten .= "</ol>\n";
    $konten .= "</div>\n\n";
    
    $konten .= "<h2>Catatan Tambahan</h2>\n";
    $konten .= "<p>Pertanyaan ini menguji pemahaman konsep yang sering muncul dalam ujian. Pastikan untuk mempelajari materi terkait dan latih soal-soal serupa untuk memperdalam pemahaman.</p>\n";
    
    return $konten;
}

function generateTipsBatch($kategori_id, $limit) {
    global $conn;
    
    $where = "";
    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = $kategori_id";
    }
    
    echo "Generating tips...\n";
    
    $sql = "SELECT s.*, k.nama_kategori 
            FROM soal s
            LEFT JOIN kategori_soal k ON s.kategori_id = k.id
            $where
            ORDER BY RAND()
            LIMIT $limit";
    $result = $conn->query($sql);
    
    $tips_generated = 0;
    $tricks_generated = 0;
    
    while ($row = $result->fetch_assoc()) {
        $soal_id = $row['id'];
        $kategori = $row['nama_kategori'];
        $tingkat = $row['tingkat'];
        
        $judul_tips = "Tips Soal {$kategori} ({$tingkat}) - #{$soal_id}";
        $konten_tips = generateTipsContent($row['pertanyaan'], $tingkat);
        
        $judul_escaped = $conn->real_escape_string($judul_tips);
        $konten_escaped = $conn->real_escape_string($konten_tips);
        
        // Add to tips_tricks
        $sql_insert_tricks = "INSERT INTO tips_tricks (kategori_id, tipe_tips, judul, konten, prioritas)
                               VALUES ({$row['kategori_id']}, 'spesifik', '$judul_escaped', '$konten_escaped', 1)";
        
        if ($conn->query($sql_insert_tricks)) {
            $tips_generated++;
            
            // Link to soal if tips_soal table exists
            $sql_link = "INSERT INTO tips_soal (tips_id, soal_id) VALUES (?, ?)";
            $stmt_link = $conn->prepare($sql_link);
            $stmt_link->bind_param("ii", $conn->insert_id, $soal_id);
            $stmt_link->execute();
            $stmt_link->close();
            
            echo "Generated tip for soal #$soal_id\n";
        }
    }
    
    // Generate general tips for each kategori
    $kategori_sql = "SELECT DISTINCT kategori_id FROM soal";
    if (!empty($where)) {
        $kategori_sql .= " " . $where;
    }
    $kategori_result = $conn->query($kategori_sql);
    
    while ($kat_row = $kategori_result->fetch_assoc()) {
        $kat_id = $kat_row['kategori_id'];
        $general_tips = generateGeneralTips($kat_id);
        
        foreach ($general_tips as $tip) {
            $judul_escaped = $conn->real_escape_string($tip['judul']);
            $konten_escaped = $conn->real_escape_string($tip['konten']);
            
            $sql_insert = "INSERT INTO tips_tricks (kategori_id, tipe_tips, judul, konten, prioritas)
                           VALUES ($kat_id, 'umum', '$judul_escaped', '$konten_escaped', 2)";
            
            if ($conn->query($sql_insert)) {
                $tricks_generated++;
            }
        }
    }
    
    echo "\n=== Summary ===\n";
    echo "Tips generated: $tips_generated\n";
    echo "Tricks generated: $tricks_generated\n";
}

function generateTipsContent($pertanyaan, $tingkat) {
    $tips = "Tips untuk menjawab soal tingkat {$tingkat}:\n\n";
    
    if (stripos($pertanyaan, 'bukan') !== false) {
        $tips .= "- Perhatikan kata negatif seperti 'bukan', 'tidak', 'kecuali'\n";
    }
    
    if (stripos($pertanyaan, 'yang') !== false) {
        $tips .= "- Identifikasi subjek yang ditanyakan dengan kata 'yang'\n";
    }
    
    if (stripos($pertanyaan, 'berikut') !== false) {
        $tips .= "- Pilih jawaban yang paling tepat dari pilihan yang tersedia\n";
    }
    
    $tips .= "\nStrategi umum:\n";
    $tips .= "- Baca semua opsi jawaban sebelum memilih\n";
    $tips .= "- Eliminasi jawaban yang jelas salah\n";
    $tips .= "- Pilih jawaban yang paling logis\n";
    
    return $tips;
}

function generateGeneralTips($kategori_id) {
    global $conn;
    
    $tips = [];
    
    $sql = "SELECT nama_kategori FROM kategori_soal WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $kategori_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $kategori = $row['nama_kategori'];
    $stmt->close();
    
    switch ($kategori) {
        case 'TWK':
            $tips[] = [
                'judul' => "Tips TWK - Wawasan Kebangsaan",
                'konten' => "Pelajari sejarah Indonesia, pancasila, UUD 1945, dan budaya nasional. Banyak membaca berita dan artikel tentang kebangsaan."
            ];
            $tips[] = [
                'judul' => "Strategi TWK",
                'konten' => "Fokus pada pemahaman konsep dasar negara dan bangsa. Jangan hafal tanggal dan angka secara kaku, pahami konteksnya."
            ];
            break;
            
        case 'TIU':
            $tips[] = [
                'judul' => "Tips TIU - Tes Intelejensi Umum",
                'konten' => "Latih soal logika, aritmatika, dan deret angka secara rutin. Pahami pola-pola yang sering muncul."
            ];
            $tips[] = [
                'judul' => "Shortcut TIU",
                'konten' => "Untuk soal deret, cari pola selisih antar angka. Untuk soal silogisme, buat diagram jika diperlukan."
            ];
            break;
            
        case 'TKP':
            $tips[] = [
                'judul' => "Tips TKP - Tes Karakteristik Pribadi",
                'konten' => "Jawab dengan jujur sesuai kepribadian asli. TKP tidak ada jawaban salah atau benar, pilih yang paling menggambarkan diri."
            ];
            $tips[] = [
                'judul' => "Strategi TKP",
                'konten' => "Baca setiap pertanyaan dengan seksama. Jangan terburu-buru. Pilih jawaban yang paling sesuai dengan karakter Anda."
            ];
            break;
            
        case 'TPA':
            $tips[] = [
                'judul' => "Tips TPA - Tes Potensi Akademik",
                'konten' => "Latih verbal, numerik, dan logika. TPA mengukur potensi akademik, bukan pengetahuan yang sudah dipelajari."
            ];
            break;
            
        case 'PSIKOLOGIS':
            $tips[] = [
                'judul' => "Tips Psikologis",
                'konten' => "Jawab dengan tenang dan jujur. Tes psikologis mengukur kecocokan kepribadian dengan pekerjaan."
            ];
            break;
    }
    
    return $tips;
}

$conn->close();
echo "\nBatch generation complete!\n";
?>
