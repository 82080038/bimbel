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
            'pertanyaan' => $this->modifyQuestion($template['pertanyaan'], $topic),
            'jawaban_a' => $template['jawaban_a'] ?? '',
            'jawaban_b' => $template['jawaban_b'] ?? '',
            'jawaban_c' => $template['jawaban_c'] ?? '',
            'jawaban_d' => $template['jawaban_d'] ?? '',
            'jawaban_e' => $template['jawaban_e'] ?? '',
            'jawaban_benar' => $template['jawaban_benar'] ?? 'A',
            'pembahasan' => $this->generatePembahasan($template['pembahasan'], $topic),
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
        $session_name = $this->conn->real_escape_string($session_name ?: "Tryout " . date('Y-m-d H:i:s'));
        
        $sql = "INSERT INTO tryout_sessions 
                (user_id, topic_id, session_name, total_questions, duration_minutes, status)
                VALUES ($user_id, $topic_id, '$session_name', $total_questions, $duration_minutes, 'created')";
        
        if ($this->conn->query($sql)) {
            $session_id = $this->conn->insert_id;
            
            // Generate questions for this session
            $questions = $this->generateQuestions($user_id, $topic_id, $total_questions);
            
            // Save questions to database
            foreach ($questions as $q) {
                $this->saveGeneratedQuestion($session_id, $q);
            }
            
            return $session_id;
        }
        
        return false;
    }
    
    /**
     * Save a generated question to database
     */
    private function saveGeneratedQuestion($session_id, $question) {
        $topic_id = $question['topic_id'];
        $pertanyaan = $this->conn->real_escape_string($question['pertanyaan']);
        $jawaban_a = $this->conn->real_escape_string($question['jawaban_a'] ?? '');
        $jawaban_b = $this->conn->real_escape_string($question['jawaban_b'] ?? '');
        $jawaban_c = $this->conn->real_escape_string($question['jawaban_c'] ?? '');
        $jawaban_d = $this->conn->real_escape_string($question['jawaban_d'] ?? '');
        $jawaban_e = $this->conn->real_escape_string($question['jawaban_e'] ?? '');
        $jawaban_benar = $this->conn->real_escape_string($question['jawaban_benar'] ?? 'A');
        $pembahasan = $this->conn->real_escape_string($question['pembahasan'] ?? '');
        $difficulty = $this->conn->real_escape_string($question['difficulty'] ?? 'sedang');
        
        $sql = "INSERT INTO ai_generated_questions 
                (tryout_session_id, topic_id, pertanyaan, jawaban_a, jawaban_b, jawaban_c, jawaban_d, jawaban_e, jawaban_benar, pembahasan, difficulty)
                VALUES ($session_id, $topic_id, '$pertanyaan', '$jawaban_a', '$jawaban_b', '$jawaban_c', '$jawaban_d', '$jawaban_e', '$jawaban_benar', '$pembahasan', '$difficulty')";
        
        return $this->conn->query($sql);
    }
    
    /**
     * Start a tryout session
     */
    public function startTryoutSession($session_id) {
        $sql = "UPDATE tryout_sessions 
                SET status = 'in_progress', started_at = NOW() 
                WHERE id = $session_id";
        
        return $this->conn->query($sql);
    }
    
    /**
     * Complete a tryout session
     */
    public function completeTryoutSession($session_id, $score) {
        $sql = "UPDATE tryout_sessions 
                SET status = 'completed', completed_at = NOW(), score = $score 
                WHERE id = $session_id";
        
        return $this->conn->query($sql);
    }
    
    /**
     * Get questions for a tryout session
     */
    public function getTryoutQuestions($session_id) {
        $sql = "SELECT * FROM ai_generated_questions 
                WHERE tryout_session_id = $session_id 
                ORDER BY id";
        
        $result = $this->conn->query($sql);
        $questions = [];
        
        while ($row = $result->fetch_assoc()) {
            $questions[] = $row;
        }
        
        return $questions;
    }
    
    /**
     * Submit answer for a tryout question
     */
    public function submitAnswer($session_id, $question_id, $user_answer, $time_taken = 0) {
        // Get correct answer
        $sql = "SELECT jawaban_benar FROM ai_generated_questions WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $question_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        
        if ($row) {
            $is_correct = ($user_answer === $row['jawaban_benar']);
            
            $sql = "INSERT INTO tryout_answers 
                    (tryout_session_id, question_id, user_answer, is_correct, time_taken_seconds)
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("iisii", $session_id, $question_id, $user_answer, $is_correct ? 1 : 0, $time_taken);
            $result = $stmt->execute();
            $stmt->close();
            
            return $result;
        }
        
        return false;
    }
    
    /**
     * Calculate tryout score
     */
    public function calculateScore($session_id) {
        $sql = "SELECT COUNT(*) as total, 
                       SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
                FROM tryout_answers 
                WHERE tryout_session_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $session_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        
        if ($row['total'] > 0) {
            $score = ($row['correct'] / $row['total']) * 100;
            return round($score, 2);
        }
        
        return 0;
    }
    
    /**
     * Get tryout session info
     */
    public function getTryoutSession($session_id) {
        $sql = "SELECT ts.*, t.topic_name, t.kategori, t.description
                FROM tryout_sessions ts
                JOIN learning_topics t ON ts.topic_id = t.id
                WHERE ts.id = $session_id";
        
        $result = $this->conn->query($sql);
        return $result->fetch_assoc();
    }
    
    /**
     * Get user's tryout history
     */
    public function getUserTryoutHistory($user_id) {
        $sql = "SELECT ts.*, t.topic_name, t.kategori
                FROM tryout_sessions ts
                JOIN learning_topics t ON ts.topic_id = t.id
                WHERE ts.user_id = $user_id
                ORDER BY ts.created_at DESC";
        
        $result = $this->conn->query($sql);
        $history = [];
        
        while ($row = $result->fetch_assoc()) {
            $history[] = $row;
        }
        
        return $history;
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
