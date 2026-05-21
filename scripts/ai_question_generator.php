<?php
/**
 * AI Question Generator for Tryout
 * 
 * This system generates new questions based on topics that participants have studied.
 * It uses templates and patterns from existing questions to create similar questions.
 */

require_once __DIR__ . '/../config.php';

class AIQuestionGenerator {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    /**
     * Generate questions for a tryout session
     */
    public function generateQuestions($user_id, $topic_id, $num_questions = 10, $difficulty = 'sedang') {
        // Get topic information
        $topic = $this->getTopic($topic_id);
        
        // Get existing questions for this topic to use as templates
        $template_questions = $this->getTemplateQuestions($topic['kategori'], $num_questions * 2);
        
        // Generate new questions based on templates
        $generated_questions = [];
        
        for ($i = 0; $i < $num_questions; $i++) {
            if (!empty($template_questions)) {
                $template = $template_questions[array_rand($template_questions)];
                $new_question = $this->generateFromTemplate($template, $topic, $difficulty);
                $generated_questions[] = $new_question;
            }
        }
        
        return $generated_questions;
    }
    
    /**
     * Get topic information
     */
    private function getTopic($topic_id) {
        $sql = "SELECT * FROM learning_topics WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $topic_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row;
    }
    
    /**
     * Get template questions for a category
     */
    private function getTemplateQuestions($kategori, $limit) {
        $sql = "SELECT * FROM soal s 
                JOIN kategori_soal k ON s.kategori_id = k.id 
                WHERE k.nama_kategori = ? 
                ORDER BY RAND() 
                LIMIT ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $kategori, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $questions = [];
        
        while ($row = $result->fetch_assoc()) {
            $questions[] = $row;
        }
        
        $stmt->close();
        return $questions;
    }
    
    /**
     * Generate a new question from a template
     */
    private function generateFromTemplate($template, $topic, $difficulty) {
        // This is a simplified AI generation that modifies the template
        // In a real implementation, you might use an actual AI API
        
        $new_question = [
            'topic_id' => $topic['id'],
            'kategori_id' => $template['kategori_id'],
            'pertanyaan' => $this->modifyQuestion($template['pertanyaan'], $topic),
            'opsi_a' => $template['opsi_a'] ?? '',
            'opsi_b' => $template['opsi_b'] ?? '',
            'opsi_c' => $template['opsi_c'] ?? '',
            'opsi_d' => $template['opsi_d'] ?? '',
            'opsi_e' => $template['opsi_e'] ?? '',
            'jawaban_benar' => $template['jawaban_benar'] ?? 'A',
            'pembahasan' => $this->generatePembahasan($template['pembahasan'], $topic),
            'expert_tips' => $this->getExpertTips($template['kategori_id']),
            'difficulty' => $difficulty
        ];
        
        return $new_question;
    }
    
    /**
     * Modify question text based on topic
     */
    private function modifyQuestion($original_question, $topic) {
        // Add topic context to the question
        $topic_context = $this->getTopicContext($topic);
        
        // Simple modification - in real implementation, use AI to generate variations
        $modified = $original_question;
        
        // Add topic-specific prefix if not already present
        if (strpos($modified, $topic['topic_name']) === false) {
            $modified = "Berdasarkan materi {$topic['topic_name']}: " . $modified;
        }
        
        return $modified;
    }
    
    /**
     * Get topic context for question generation
     */
    private function getTopicContext($topic) {
        $contexts = [
            'Pancasila' => 'nilai-nilai Pancasila sebagai dasar negara',
            'UUD 1945' => 'ketentuan-ketentuan dalam Undang-Undang Dasar 1945',
            'Sejarah Indonesia' => 'peristiwa-peristiwa penting dalam sejarah Indonesia',
            'Deret Angka' => 'pola deret angka dan logika matematika',
            'Analogi' => 'hubungan analogi antara dua kata atau konsep',
            'Etika Kerja' => 'nilai-nilai etika dalam lingkungan kerja',
            'Kepemimpinan' => 'prinsip-prinsip kepemimpinan yang efektif',
            'default' => 'materi yang dipelajari'
        ];
        
        return $contexts[$topic['topic_name']] ?? $contexts['default'];
    }
    
    /**
     * Get expert tips for a category
     */
    private function getExpertTips($kategori_id) {
        $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
        $sub_kategori = $kategori_map[$kategori_id] ?? '';
        
        $sql = "SELECT judul, konten, jenis_pengetahuan 
                FROM expert_knowledge 
                WHERE sub_kategori = ? AND is_active = 1 
                ORDER BY prioritas DESC 
                LIMIT 3";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $sub_kategori);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $tips = [];
        while ($row = $result->fetch_assoc()) {
            $tips[] = [
                'judul' => $row['judul'],
                'konten' => $row['konten'],
                'jenis' => $row['jenis_pengetahuan']
            ];
        }
        
        $stmt->close();
        return $tips;
    }
    
    /**
     * Generate explanation (pembahasan) for the question
     */
    private function generatePembahasan($original_pembahasan, $topic) {
        $pembahasan = $original_pembahasan;
        
        // Add topic-specific context to explanation
        if (!empty($topic['description'])) {
            $pembahasan = $topic['description'] . "\n\n" . $pembahasan;
        }
        
        return $pembahasan;
    }
    
    /**
     * Create a tryout session
     */
    public function createTryoutSession($user_id, $topic_id, $session_name = '', $total_questions = 10, $duration_minutes = 30) {
        // Simpan sesi ke sesi_ujian (tryout_sessions sudah dihapus)
        $nama = $session_name ?: ('Tryout ' . date('Y-m-d H:i:s'));

        $sql = "INSERT INTO sesi_ujian (user_id, durasi_menit, soal_teracak, status)
                VALUES (?, ?, ?, 'berjalan')";
        $stmt = $this->conn->prepare($sql);
        $soal_placeholder = json_encode([]);
        $stmt->bind_param("iis", $user_id, $duration_minutes, $soal_placeholder);

        if ($stmt->execute()) {
            $session_id = $this->conn->insert_id;
            $stmt->close();

            // Generate questions for this session
            $questions = $this->generateQuestions($user_id, $topic_id, $total_questions);

            // Save questions and record soal_ids
            $soal_ids = [];
            foreach ($questions as $q) {
                $qid = $this->saveGeneratedQuestion($session_id, $q);
                if ($qid) $soal_ids[] = $qid;
            }

            // Update soal_teracak with actual question IDs
            $soal_json = json_encode($soal_ids);
            $stmt2 = $this->conn->prepare("UPDATE sesi_ujian SET soal_teracak = ? WHERE id = ?");
            $stmt2->bind_param('si', $soal_json, $session_id);
            $stmt2->execute();
            $stmt2->close();

            return $session_id;
        }

        return false;
    }
    
    /**
     * Save a generated question to database
     */
    private function saveGeneratedQuestion($session_id, $question) {
        $topic_id    = intval($question['topic_id'] ?? 0);
        $kategori_id = intval($question['kategori_id'] ?? 1);
        $expert_tips = isset($question['expert_tips']) ? json_encode($question['expert_tips']) : null;
        $difficulty  = $question['difficulty'] ?? 'sedang';

        $sql = "INSERT INTO ai_generated_questions
                (sesi_id, topic_id, kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, expert_tips, difficulty)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $pertanyaan   = $question['pertanyaan'] ?? '';
        $opsi_a       = $question['opsi_a'] ?? '';
        $opsi_b       = $question['opsi_b'] ?? '';
        $opsi_c       = $question['opsi_c'] ?? '';
        $opsi_d       = $question['opsi_d'] ?? '';
        $opsi_e       = $question['opsi_e'] ?? '';
        $jawaban_benar = $question['jawaban_benar'] ?? 'A';
        $pembahasan   = $question['pembahasan'] ?? '';
        $stmt->bind_param('iiisssssssss',
            $session_id, $topic_id, $kategori_id,
            $pertanyaan, $opsi_a, $opsi_b, $opsi_c, $opsi_d, $opsi_e,
            $jawaban_benar, $pembahasan, $expert_tips, $difficulty
        );
        $stmt->execute();
        $id = $this->conn->insert_id;
        $stmt->close();
        return $id ?: false;
    }
    
    /**
     * Start a tryout session
     */
    public function startTryoutSession($session_id) {
        $sql = "UPDATE sesi_ujian SET status = 'berjalan', waktu_mulai = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $session_id);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }
    
    /**
     * Complete a tryout session
     */
    public function completeTryoutSession($session_id, $score) {
        $sql = "UPDATE sesi_ujian SET status = 'selesai', waktu_selesai = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $session_id);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }
    
    /**
     * Get questions for a tryout session
     */
    public function getTryoutQuestions($session_id) {
        $sql = "SELECT * FROM ai_generated_questions WHERE sesi_id = ? ORDER BY id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $session_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $questions = [];
        while ($row = $result->fetch_assoc()) {
            $questions[] = $row;
        }
        $stmt->close();
        return $questions;
    }

    /**
     * Submit answer — simpan ke jawaban_sementara (JSON) di sesi_ujian
     */
    public function submitAnswer($session_id, $question_id, $user_answer, $time_taken = 0) {
        // Ambil jawaban_sementara yang ada
        $stmt = $this->conn->prepare("SELECT jawaban_sementara FROM sesi_ujian WHERE id = ?");
        $stmt->bind_param('i', $session_id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) return false;

        $current = json_decode($row['jawaban_sementara'] ?? '{}', true) ?: [];
        $current[(string)$question_id] = $user_answer;
        $json = json_encode($current);

        $stmt2 = $this->conn->prepare("UPDATE sesi_ujian SET jawaban_sementara = ? WHERE id = ?");
        $stmt2->bind_param('si', $json, $session_id);
        $result = $stmt2->execute();
        $stmt2->close();
        return $result;
    }

    /**
     * Calculate tryout score dari jawaban_sementara vs ai_generated_questions
     */
    public function calculateScore($session_id) {
        $stmt = $this->conn->prepare("SELECT jawaban_sementara FROM sesi_ujian WHERE id = ?");
        $stmt->bind_param('i', $session_id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) return 0;
        $jawaban = json_decode($row['jawaban_sementara'] ?? '{}', true) ?: [];
        if (empty($jawaban)) return 0;

        $questions = $this->getTryoutQuestions($session_id);
        $total = count($questions);
        if ($total === 0) return 0;

        $correct = 0;
        foreach ($questions as $q) {
            $user_ans = $jawaban[(string)$q['id']] ?? '';
            if ($user_ans === $q['jawaban_benar']) $correct++;
        }

        return round(($correct / $total) * 100, 2);
    }
    
    /**
     * Get tryout session info
     */
    public function getTryoutSession($session_id) {
        $sql = "SELECT * FROM sesi_ujian WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $session_id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $row;
    }
    
    /**
     * Get user's tryout history
     */
    public function getUserTryoutHistory($user_id) {
        $sql = "SELECT * FROM sesi_ujian WHERE user_id = ? ORDER BY waktu_mulai DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $history = [];
        
        while ($row = $result->fetch_assoc()) {
            $history[] = $row;
        }
        
        return $history;
    }
    
    /**
     * Generate question for admin (save to main soal table)
     */
    public function generateQuestionForAdmin($kategori_id, $num_questions = 1, $difficulty = 'sedang', $created_by = null) {
        $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
        $kategori_nama = $kategori_map[$kategori_id] ?? 'UMUM';
        
        // Get template questions from main soal table
        $sql = "SELECT * FROM soal WHERE kategori_id = ? ORDER BY RAND() LIMIT ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $kategori_id, $num_questions);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $generated_questions = [];
        $template_questions = [];
        
        while ($row = $result->fetch_assoc()) {
            $template_questions[] = $row;
        }
        
        $stmt->close();
        
        // Generate new questions based on templates
        for ($i = 0; $i < $num_questions; $i++) {
            if (!empty($template_questions)) {
                $template = $template_questions[array_rand($template_questions)];
                $new_question = $this->generateFromTemplateForAdmin($template, $difficulty, $created_by);
                
                // Save to main soal table
                $question_id = $this->saveQuestionToSoalTable($new_question);
                
                if ($question_id) {
                    $new_question['id'] = $question_id;
                    $generated_questions[] = $new_question;
                }
            }
        }
        
        return $generated_questions;
    }
    
    /**
     * Generate question from template for admin
     */
    private function generateFromTemplateForAdmin($template, $difficulty, $created_by) {
        // Modify question to create variation
        $pertanyaan = $this->varyQuestion($template['pertanyaan']);
        
        $new_question = [
            'kategori_id' => $template['kategori_id'],
            'pertanyaan' => $pertanyaan,
            'opsi_a' => $template['opsi_a'],
            'opsi_b' => $template['opsi_b'],
            'opsi_c' => $template['opsi_c'],
            'opsi_d' => $template['opsi_d'],
            'opsi_e' => $template['opsi_e'],
            'jawaban_benar' => $template['jawaban_benar'],
            'pembahasan' => $template['pembahasan'],
            'created_by' => $created_by,
            'expert_tips' => $this->getExpertTips($template['kategori_id'])
        ];
        
        return $new_question;
    }
    
    /**
     * Vary question text to create variation
     */
    private function varyQuestion($original_question) {
        // Simple variation - in real implementation use AI
        $variations = [
            'Jelaskan' => 'Terangkan',
            'Apa' => 'Bagaimana',
            'Mengapa' => 'Kenapa',
            'Siapa' => 'Tentang siapa',
            'Kapan' => 'Pada waktu kapan'
        ];
        
        $varied = $original_question;
        foreach ($variations as $from => $to) {
            if (strpos($varied, $from) === 0) {
                $varied = str_replace($from, $to, $varied, 1);
                break;
            }
        }
        
        return $varied;
    }
    
    /**
     * Save question to main soal table
     */
    private function saveQuestionToSoalTable($question) {
        $kategori_id = intval($question['kategori_id']);
        $pertanyaan  = $question['pertanyaan'] ?? '';
        $opsi_a      = $question['opsi_a'] ?? '';
        $opsi_b      = $question['opsi_b'] ?? '';
        $opsi_c      = $question['opsi_c'] ?? '';
        $opsi_d      = $question['opsi_d'] ?? '';
        $opsi_e      = $question['opsi_e'] ?? '';
        $jawaban_benar = $question['jawaban_benar'] ?? '';
        $pembahasan  = $question['pembahasan'] ?? '';
        $created_by  = isset($question['created_by']) ? intval($question['created_by']) : null;

        $sql = "INSERT INTO soal
                (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("issssssssi", $kategori_id, $pertanyaan, $opsi_a, $opsi_b, $opsi_c, $opsi_d, $opsi_e, $jawaban_benar, $pembahasan, $created_by);

        if ($stmt->execute()) {
            $id = $this->conn->insert_id;
            $stmt->close();
            return $id;
        }

        $stmt->close();
        return false;
    }
    
    /**
     * Generate practice question for participant (not saved to database)
     */
    public function generatePracticeQuestion($kategori_id, $difficulty = 'sedang') {
        $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
        $kategori_nama = $kategori_map[$kategori_id] ?? 'UMUM';
        
        // Get random question from soal table as template
        $sql = "SELECT * FROM soal WHERE kategori_id = ? ORDER BY RAND() LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $kategori_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($template = $result->fetch_assoc()) {
            $practice_question = $this->generateFromTemplateForAdmin($template, $difficulty, null);
            $practice_question['expert_tips'] = $this->getExpertTips($kategori_id);
            $practice_question['template_id'] = $template['id'];
            
            $stmt->close();
            return $practice_question;
        }
        
        $stmt->close();
        return null;
    }
}

// CLI Interface
if (php_sapi_name() === 'cli') {
    $generator = new AIQuestionGenerator($conn);
    
    echo "=== AI Question Generator for Tryout ===\n\n";
    
    // Test with a sample user and topic
    $test_user_id = 1;
    $test_topic_id = 1; // Pancasila
    
    echo "Creating tryout session for user #{$test_user_id} on topic #{$test_topic_id}...\n";
    $session_id = $generator->createTryoutSession($test_user_id, $test_topic_id, 'Test Tryout', 5, 10);
    
    if ($session_id) {
        echo "Session created with ID: $session_id\n";
        
        echo "\nGenerating questions...\n";
        $questions = $generator->getTryoutQuestions($session_id);
        
        foreach ($questions as $q) {
            echo "Question #{$q['id']}: " . substr($q['pertanyaan'], 0, 100) . "...\n";
            echo "Correct answer: {$q['jawaban_benar']}\n";
            echo "---\n";
        }
        
        echo "\nTotal questions generated: " . count($questions) . "\n";
    } else {
        echo "Failed to create tryout session.\n";
    }
}
?>
