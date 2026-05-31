<?php
/**
 * AI-based Question Analyzer
 * Analyzes questions deeply and generates learning materials
 * Can be extended with actual AI APIs (OpenAI, Claude, etc.)
 */

header('Content-Type: application/json');
require_once '../config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    switch ($action) {
        case 'analyze':
            analyzeQuestion();
            break;
        case 'generate_materi':
            generateMateriFromQuestion();
            break;
        case 'batch_analyze':
            batchAnalyzeQuestions();
            break;
        case 'get_learning_path':
            getLearningPath();
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function analyzeQuestion() {
    global $conn;
    
    $soal_id = isset($_GET['soal_id']) ? intval($_GET['soal_id']) : 0;
    if ($soal_id == 0) {
        throw new Exception("soal_id is required");
    }
    
    // Get soal data
    $sql = "SELECT * FROM soal WHERE id = $soal_id";
    $result = $conn->query($sql);
    $soal = $result->fetch_assoc();
    
    if (!$soal) {
        throw new Exception("Soal not found");
    }
    
    // Perform deep analysis
    $analysis = performDeepAnalysis($soal);
    
    // Update soal with analysis results
    $bloom_escaped = $conn->real_escape_string($analysis['bloom_level']);
    $cognitive_escaped = $conn->real_escape_string($analysis['cognitive_load']);
    $learning_escaped = $conn->real_escape_string($analysis['learning_objective']);
    $updateSql = "UPDATE soal SET 
                 bloom_level = '{$bloom_escaped}',
                 cognitive_load = '{$cognitive_escaped}',
                 learning_objective = '{$learning_escaped}'
                 WHERE id = $soal_id";
    $conn->query($updateSql);
    
    echo json_encode([
        'success' => true,
        'analysis' => $analysis
    ]);
}

function performDeepAnalysis($soal) {
    $pertanyaan = $soal['pertanyaan'];
    $kategori_id = $soal['kategori_id'];
    $tingkat = $soal['tingkat'];
    
    // Determine Bloom's Taxonomy level
    $bloom_level = determineBloomLevel($pertanyaan);
    
    // Determine cognitive load
    $cognitive_load = determineCognitiveLoad($pertanyaan, $tingkat);
    
    // Generate learning objective
    $learning_objective = generateLearningObjective($pertanyaan, $bloom_level);
    
    // Identify key concepts
    $key_concepts = extractKeyConcepts($pertanyaan);
    
    // Suggest learning materials
    $suggested_materi = suggestLearningMaterials($key_concepts, $kategori_id);
    
    return [
        'bloom_level' => $bloom_level,
        'cognitive_load' => $cognitive_load,
        'learning_objective' => $learning_objective,
        'key_concepts' => $key_concepts,
        'suggested_materi' => $suggested_materi,
        'estimated_study_time' => estimateStudyTime($cognitive_load, $tingkat)
    ];
}

function determineBloomLevel($pertanyaan) {
    $pertanyaan_lower = strtolower($pertanyaan);
    
    // Remember (lowest level)
    if (preg_match('/(apa|siapa|kapan|dimana|sebutkan|tulis|daftar|namakan)/i', $pertanyaan)) {
        return 'remember';
    }
    
    // Understand
    if (preg_match('/(jelaskan|uraikan|mengapa|bagaimana|artikan|deskripsikan)/i', $pertanyaan)) {
        return 'understand';
    }
    
    // Apply
    if (preg_match('/(gunakan|terapkan|hitung|selesaikan|lakukan|praktikkan)/i', $pertanyaan)) {
        return 'apply';
    }
    
    // Analyze
    if (preg_match('/(analisis|bedakan|bandingkan|selidiki|uraikan kembali)/i', $pertanyaan)) {
        return 'analyze';
    }
    
    // Evaluate
    if (preg_match('/(evaluasi|nilai|kritik|taksir|berikan pendapat)/i', $pertanyaan)) {
        return 'evaluate';
    }
    
    // Create (highest level)
    if (preg_match('/(buat|rancang|susun|kembangkan|ciptakan)/i', $pertanyaan)) {
        return 'create';
    }
    
    // Default
    return 'understand';
}

function determineCognitiveLoad($pertanyaan, $tingkat) {
    $length = strlen($pertanyaan);
    $word_count = str_word_count($pertanyaan);
    
    // Base load from difficulty
    $load = 'medium';
    if ($tingkat == 'mudah') {
        $load = 'low';
    } elseif ($tingkat == 'sulit') {
        $load = 'high';
    }
    
    // Adjust based on complexity
    if ($word_count > 30) {
        if ($load == 'low') $load = 'medium';
        elseif ($load == 'medium') $load = 'high';
    }
    
    // Check for complex sentence structures
    if (preg_match('/(yang|yang mana|di mana|apabila|jika|karena|sehingga)/i', $pertanyaan)) {
        if ($load == 'low') $load = 'medium';
        elseif ($load == 'medium') $load = 'high';
    }
    
    return $load;
}

function generateLearningObjective($pertanyaan, $bloom_level) {
    $objectives = [
        'remember' => 'Peserta diharapkan dapat mengingat dan mengidentifikasi informasi yang relevan.',
        'understand' => 'Peserta diharapkan dapat memahami dan menjelaskan konsep yang terkait.',
        'apply' => 'Peserta diharapkan dapat menerapkan pengetahuan dalam situasi konkret.',
        'analyze' => 'Peserta diharapkan dapat menganalisis dan membedakan komponen-komponen penting.',
        'evaluate' => 'Peserta diharapkan dapat mengevaluasi dan memberikan penilaian terhadap situasi.',
        'create' => 'Peserta diharapkan dapat menciptakan atau merancang solusi baru.'
    ];
    
    return isset($objectives[$bloom_level]) ? $objectives[$bloom_level] : $objectives['understand'];
}

function extractKeyConcepts($pertanyaan) {
    $pertanyaan_lower = strtolower($pertanyaan);
    $pertanyaan_lower = preg_replace('/[^a-z0-9\s]/', '', $pertanyaan_lower);
    $words = explode(' ', $pertanyaan_lower);
    
    $stop_words = ['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 'tersebut', 'sebagai', 'oleh', 'dalam', 'akan', 'telah', 'merupakan', 'yaitu', 'yakni', 'serta', 'ataupun', 'bagi', 'terhadap', 'karena', 'sehingga', 'apabila', 'jika', 'kalau', 'bila', 'walaupun', 'meskipun', 'namun', 'tetapi', 'melainkan', 'kecuali', 'selain', 'lain', 'lainnya', 'semua', 'tiap', 'setiap', 'masing-masing', 'sendiri', 'sendirinya', 'ia', 'dia', 'mereka', 'kita', 'kami', 'anda', 'kamu', 'beliau', 'saya', 'aku', 'kita', 'kamu', 'kalian', 'para', 'siapa', 'apa', 'bagaimana', 'mengapa', 'kapan', 'dimana', 'kemana', 'darimana', 'berapa', 'mana', 'yangmana'];
    
    $concepts = [];
    foreach ($words as $word) {
        if (strlen($word) > 4 && !in_array($word, $stop_words)) {
            $concepts[] = $word;
        }
    }
    
    return array_unique(array_slice($concepts, 0, 10));
}

function suggestLearningMaterials($key_concepts, $kategori_id) {
    global $conn;
    
    if (empty($key_concepts)) {
        return [];
    }
    
    // Search for materi with matching keywords
    $materi = [];
    
    foreach ($key_concepts as $concept) {
        $concept_escaped = $conn->real_escape_string($concept);
        $sql = "SELECT id, judul, deskripsi FROM materi 
                WHERE kategori_id = $kategori_id 
                AND is_active = 1 
                AND (judul LIKE '%{$concept_escaped}%' OR deskripsi LIKE '%{$concept_escaped}%')
                LIMIT 3";
        $result = $conn->query($sql);
        
        while ($row = $result->fetch_assoc()) {
            $materi[] = $row;
        }
    }
    
    // Remove duplicates
    $unique_materi = [];
    $seen = [];
    foreach ($materi as $m) {
        if (!in_array($m['id'], $seen)) {
            $seen[] = $m['id'];
            $unique_materi[] = $m;
        }
    }
    
    return array_slice($unique_materi, 0, 5);
}

function estimateStudyTime($cognitive_load, $tingkat) {
    $base_time = 15; // minutes
    
    if ($cognitive_load == 'low') {
        $base_time = 10;
    } elseif ($cognitive_load == 'high') {
        $base_time = 30;
    }
    
    if ($tingkat == 'mudah') {
        $base_time *= 0.8;
    } elseif ($tingkat == 'sulit') {
        $base_time *= 1.5;
    }
    
    return round($base_time);
}

function generateMateriFromQuestion() {
    global $conn;
    
    $soal_id = isset($_GET['soal_id']) ? intval($_GET['soal_id']) : 0;
    if ($soal_id == 0) {
        throw new Exception("soal_id is required");
    }
    
    // Get soal data
    $sql = "SELECT * FROM soal WHERE id = $soal_id";
    $result = $conn->query($sql);
    $soal = $result->fetch_assoc();
    
    if (!$soal) {
        throw new Exception("Soal not found");
    }
    
    // Analyze question
    $analysis = performDeepAnalysis($soal);
    
    // Generate bahan pelajaran content
    $judul = "Pembahasan Soal #{$soal_id} - " . (isset($analysis['key_concepts'][0]) ? $analysis['key_concepts'][0] : 'Umum');
    $konten = generateBahanContent($soal, $analysis);
    
    // Insert into bahan_pelajaran
    $judul_escaped = $conn->real_escape_string($judul);
    $konten_escaped = $conn->real_escape_string($konten);
    
    $sql = "INSERT INTO bahan_pelajaran (soal_id, judul, konten, tipe, urutan)
            VALUES ($soal_id, '$judul_escaped', '$konten_escaped', 'html', 0)";
    
    if ($conn->query($sql)) {
        echo json_encode([
            'success' => true,
            'bahan_pelajaran_id' => $conn->insert_id,
            'analysis' => $analysis
        ]);
    } else {
        throw new Exception("Failed to create bahan pelajaran");
    }
}

function generateBahanContent($soal, $analysis) {
    $html = "<div class='bahan-pelajaran-container'>";
    $html .= "<h2>📚 Pembahasan Soal</h2>";
    
    // Learning objective
    $html .= "<div class='learning-objective'>";
    $html .= "<h3>🎯 Tujuan Pembelajaran</h3>";
    $html .= "<p>{$analysis['learning_objective']}</p>";
    $html .= "</div>";
    
    // Question
    $html .= "<div class='question-section'>";
    $html .= "<h3>❓ Pertanyaan</h3>";
    $html .= "<p class='question-text'>{$soal['pertanyaan']}</p>";
    $html .= "</div>";
    
    // Key concepts
    $html .= "<div class='key-concepts'>";
    $html .= "<h3>🔑 Konsep Kunci</h3>";
    $html .= "<ul>";
    foreach ($analysis['key_concepts'] as $concept) {
        $html .= "<li>{$concept}</li>";
    }
    $html .= "</ul>";
    $html .= "</div>";
    
    // Answer
    if ($soal['jawaban_benar']) {
        $html .= "<div class='answer-section'>";
        $html .= "<h3>✅ Jawaban Benar</h3>";
        $html .= "<p class='correct-answer'><strong>{$soal['jawaban_benar']}</strong></p>";
        $html .= "</div>";
    }
    
    // Explanation
    if ($soal['pembahasan']) {
        $html .= "<div class='explanation-section'>";
        $html .= "<h3>💡 Pembahasan</h3>";
        $html .= "<div class='explanation-content'>{$soal['pembahasan']}</div>";
        $html .= "</div>";
    }
    
    // Tips
    $html .= "<div class='tips-section'>";
    $html .= "<h3>💡 Tips Menjawab</h3>";
    $html .= "<ul>";
    $html .= "<li>Baca pertanyaan dengan teliti dan pahami apa yang ditanyakan</li>";
    $html .= "<li>Identifikasi kata kunci dalam pertanyaan</li>";
    $html .= "<li>Hapus opsi yang jelas salah (eliminasi)</li>";
    $html .= "<li>Pilih jawaban yang paling logis dan sesuai dengan konteks</li>";
    $html .= "</ul>";
    $html .= "</div>";
    
    // Study time estimate
    $html .= "<div class='study-time'>";
    $html .= "<p>⏱️ Estimasi waktu belajar: {$analysis['estimated_study_time']} menit</p>";
    $html .= "</div>";
    
    $html .= "</div>";
    
    return $html;
}

function batchAnalyzeQuestions() {
    global $conn;
    
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $kategori_id = isset($_GET['kategori_id']) ? intval($_GET['kategori_id']) : 0;
    
    $where = "";
    if ($kategori_id > 0) {
        $where = "WHERE kategori_id = $kategori_id";
    }
    
    $sql = "SELECT id FROM soal $where LIMIT $limit";
    $result = $conn->query($sql);
    
    $analyzed = 0;
    $generated = 0;
    
    while ($row = $result->fetch_assoc()) {
        $soal_id = $row['id'];
        
        // Analyze
        $sql_soal = "SELECT * FROM soal WHERE id = $soal_id";
        $soal_result = $conn->query($sql_soal);
        $soal = $soal_result->fetch_assoc();
        
        $analysis = performDeepAnalysis($soal);
        
        $bloom_escaped = $conn->real_escape_string($analysis['bloom_level']);
        $cognitive_escaped = $conn->real_escape_string($analysis['cognitive_load']);
        $learning_escaped = $conn->real_escape_string($analysis['learning_objective']);
        $updateSql = "UPDATE soal SET 
                     bloom_level = '{$bloom_escaped}',
                     cognitive_load = '{$cognitive_escaped}',
                     learning_objective = '{$learning_escaped}'
                     WHERE id = $soal_id";
        $conn->query($updateSql);
        
        $analyzed++;
        
        // Generate bahan pelajaran
        $judul = "Pembahasan Soal #{$soal_id}";
        $konten = generateBahanContent($soal, $analysis);
        $judul_escaped = $conn->real_escape_string($judul);
        $konten_escaped = $conn->real_escape_string($konten);
        
        $insertSql = "INSERT INTO bahan_pelajaran (soal_id, judul, konten, tipe, urutan)
                      VALUES ($soal_id, '$judul_escaped', '$konten_escaped', 'html', 0)";
        
        if ($conn->query($insertSql)) {
            $generated++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'analyzed' => $analyzed,
        'generated' => $generated
    ]);
}

function getLearningPath() {
    global $conn;
    
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if ($user_id == 0) {
        throw new Exception("user_id is required");
    }
    
    // Get user's weak areas from analytics
    $sql = "SELECT kategori_id, AVG(score) as avg_score 
            FROM hasil_ujian 
            WHERE user_id = $user_id 
            GROUP BY kategori_id 
            ORDER BY avg_score ASC 
            LIMIT 3";
    $result = $conn->query($sql);
    
    $weak_areas = [];
    while ($row = $result->fetch_assoc()) {
        $weak_areas[] = $row;
    }
    
    // Suggest learning path
    $learning_path = [];
    foreach ($weak_areas as $area) {
        $kat_id = $area['kategori_id'];
        
        $materiSql = "SELECT * FROM materi WHERE kategori_id = $kat_id AND is_active = 1 ORDER BY tingkat_kesulitan ASC LIMIT 5";
        $materiResult = $conn->query($materiSql);
        
        $materi_list = [];
        while ($m = $materiResult->fetch_assoc()) {
            $materi_list[] = $m;
        }
        
        $learning_path[] = [
            'kategori_id' => $kat_id,
            'avg_score' => $area['avg_score'],
            'recommended_materi' => $materi_list
        ];
    }
    
    echo json_encode([
        'success' => true,
        'learning_path' => $learning_path
    ]);
}
?>
