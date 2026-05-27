<?php
/**
 * Learning Recommendation System
 * 
 * This system provides personalized learning recommendations based on:
 * - User's performance in different categories
 * - Topics they haven't studied yet
 * - Their weak areas
 * 
 * It also tracks learning progress and generates tryout sessions.
 */

require_once __DIR__ . '/../config.php';

class LearningRecommendationSystem {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    /**
     * Get learning recommendations for a user
     */
    public function getRecommendations($user_id) {
        $recommendations = [];
        
        // Get user's performance by category
        $category_performance = $this->getUserCategoryPerformance($user_id);
        
        // Get topics the user hasn't studied yet
        $unstudied_topics = $this->getUnstudiedTopics($user_id);
        
        // Get user's weak areas
        $weak_areas = $this->identifyWeakAreas($category_performance);
        
        // Generate recommendations
        foreach ($weak_areas as $category => $score) {
            $topics = $this->getTopicsByCategory($category);
            foreach ($topics as $topic) {
                $recommendations[] = [
                    'type' => 'weakness',
                    'topic_id' => $topic['id'],
                    'topic_name' => $topic['topic_name'],
                    'kategori' => $topic['kategori'],
                    'reason' => "Anda memiliki skor rendah di kategori {$category} ({$score}%). Perlu memperkuat pemahaman.",
                    'priority' => 1
                ];
            }
        }
        
        // Add unstudied topics as suggested
        foreach ($unstudied_topics as $topic) {
            $recommendations[] = [
                'type' => 'suggested',
                'topic_id' => $topic['id'],
                'topic_name' => $topic['topic_name'],
                'kategori' => $topic['kategori'],
                'reason' => "Topik ini belum dipelajari. Disarankan untuk mempelajarinya.",
                'priority' => 2
            ];
        }
        
        // Sort by priority
        usort($recommendations, function($a, $b) {
            return $a['priority'] - $b['priority'];
        });
        
        return $recommendations;
    }
    
    /**
     * Get user's performance by category
     */
    private function getUserCategoryPerformance($user_id) {
        $sql = "SELECT 
                    SUM(CASE WHEN nilai_twk > 0 THEN nilai_twk ELSE 0 END) / COUNT(*) * 100 as twk_avg,
                    SUM(CASE WHEN nilai_tiu > 0 THEN nilai_tiu ELSE 0 END) / COUNT(*) * 100 as tiu_avg,
                    SUM(CASE WHEN nilai_tkp > 0 THEN nilai_tkp ELSE 0 END) / COUNT(*) * 100 as tkp_avg,
                    SUM(CASE WHEN nilai_tpa > 0 THEN nilai_tpa ELSE 0 END) / COUNT(*) * 100 as tpa_avg,
                    SUM(CASE WHEN nilai_psikologis > 0 THEN nilai_psikologis ELSE 0 END) / COUNT(*) * 100 as psikologis_avg
                FROM hasil_ujian 
                WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $performance = [];
        
        if ($row = $result->fetch_assoc()) {
            if ($row['twk_avg'] > 0) {
                $performance['TWK'] = round($row['twk_avg'], 2);
            }
            if ($row['tiu_avg'] > 0) {
                $performance['TIU'] = round($row['tiu_avg'], 2);
            }
            if ($row['tkp_avg'] > 0) {
                $performance['TKP'] = round($row['tkp_avg'], 2);
            }
            if ($row['tpa_avg'] > 0) {
                $performance['TPA'] = round($row['tpa_avg'], 2);
            }
            if ($row['psikologis_avg'] > 0) {
                $performance['PSIKOLOGIS'] = round($row['psikologis_avg'], 2);
            }
        }
        
        $stmt->close();
        return $performance;
    }
    
    /**
     * Get topics the user hasn't studied yet
     */
    private function getUnstudiedTopics($user_id) {
        $sql = "SELECT t.* 
                FROM learning_topics t
                WHERE t.id NOT IN (
                    SELECT topic_id 
                    FROM participant_learning_progress 
                    WHERE user_id = ? AND status = 'completed'
                )
                ORDER BY t.kategori, t.topic_name";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $topics = [];
        
        while ($row = $result->fetch_assoc()) {
            $topics[] = $row;
        }
        
        $stmt->close();
        return $topics;
    }
    
    /**
     * Identify user's weak areas
     */
    private function identifyWeakAreas($performance) {
        $weak_areas = [];
        $threshold = 60; // Below 60% is considered weak
        
        foreach ($performance as $category => $score) {
            if ($score < $threshold) {
                $weak_areas[$category] = $score;
            }
        }
        
        return $weak_areas;
    }
    
    /**
     * Get topics by category
     */
    private function getTopicsByCategory($kategori) {
        $sql = "SELECT * FROM learning_topics WHERE kategori = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $kategori);
        $stmt->execute();
        $result = $stmt->get_result();
        $topics = [];
        
        while ($row = $result->fetch_assoc()) {
            $topics[] = $row;
        }
        
        $stmt->close();
        return $topics;
    }
    
    /**
     * Mark topic as studied by user
     */
    public function markTopicAsStudied($user_id, $topic_id, $completion_percentage = 100, $notes = '') {
        $sql = "INSERT INTO participant_learning_progress 
                (user_id, topic_id, status, studied_at, completion_percentage, notes)
                VALUES (?, ?, 'completed', NOW(), ?, ?)
                ON DUPLICATE KEY UPDATE 
                status = 'completed', 
                studied_at = NOW(), 
                completion_percentage = ?,
                notes = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iiisis", $user_id, $topic_id, $completion_percentage, $notes, $completion_percentage, $notes);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }
    
    /**
     * Get learning progress for a user
     */
    public function getLearningProgress($user_id) {
        $sql = "SELECT lp.*, t.topic_name, t.kategori, t.description
                FROM participant_learning_progress lp
                JOIN learning_topics t ON lp.topic_id = t.id
                WHERE lp.user_id = ?
                ORDER BY lp.studied_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $progress = [];
        
        while ($row = $result->fetch_assoc()) {
            $progress[] = $row;
        }
        
        $stmt->close();
        return $progress;
    }
    
    /**
     * Get all available topics
     */
    public function getAllTopics() {
        $sql = "SELECT * FROM learning_topics ORDER BY kategori, topic_name";
        
        $result = $this->conn->query($sql);
        $topics = [];
        
        while ($row = $result->fetch_assoc()) {
            $topics[] = $row;
        }
        
        return $topics;
    }
    
    /**
     * Save recommendations to database
     */
    public function saveRecommendations($user_id, $recommendations) {
        // Rekomendasi disimpan ke rekomendasi_belajar (learning_recommendations sudah dihapus)
        // Hanya simpan jika ada soal_id yang diketahui; skip jika tidak ada
        if (empty($recommendations)) return true;

        $sql = "INSERT IGNORE INTO rekomendasi_belajar (user_id, soal_id, alasan)
                VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);

        foreach ($recommendations as $rec) {
            $soal_id = $rec['soal_id'] ?? null;
            if (!$soal_id) continue;
            $alasan = $rec['alasan'] ?? ($rec['reason'] ?? 'review');
            if (!in_array($alasan, ['salah','ragu','review'])) $alasan = 'review';
            $stmt->bind_param("iis", $user_id, $soal_id, $alasan);
            $stmt->execute();
        }

        $stmt->close();
        return true;
    }
    
    /**
     * Get saved recommendations for a user
     */
    public function getSavedRecommendations($user_id) {
        $sql = "SELECT rb.*, s.pertanyaan, k.nama_kategori
                FROM rekomendasi_belajar rb
                JOIN soal s ON rb.soal_id = s.id
                JOIN kategori_soal k ON s.kategori_id = k.id
                WHERE rb.user_id = ?
                ORDER BY rb.created_at DESC
                LIMIT 20";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $recommendations = [];

        while ($row = $result->fetch_assoc()) {
            $recommendations[] = $row;
        }

        $stmt->close();
        return $recommendations;
    }
}

// CLI Interface
if (php_sapi_name() === 'cli') {
    $system = new LearningRecommendationSystem($conn);
    
    echo "=== Learning Recommendation System ===\n\n";
    
    // Get all topics
    echo "Available Topics:\n";
    $topics = $system->getAllTopics();
    foreach ($topics as $topic) {
        echo "- {$topic['topic_name']} ({$topic['kategori']})\n";
    }
    echo "\n";
    
    // Test with a sample user (user_id = 1)
    $test_user_id = 1;
    echo "Generating recommendations for user #{$test_user_id}...\n";
    $recommendations = $system->getRecommendations($test_user_id);
    
    echo "\nRecommendations:\n";
    foreach ($recommendations as $rec) {
        echo "Type: {$rec['type']}\n";
        echo "Topic: {$rec['topic_name']} ({$rec['kategori']})\n";
        echo "Reason: {$rec['reason']}\n";
        echo "Priority: {$rec['priority']}\n";
        echo "---\n";
    }
    
    // Save recommendations
    echo "\nSaving recommendations to database...\n";
    $system->saveRecommendations($test_user_id, $recommendations);
    echo "Recommendations saved.\n";
}
?>
