-- Learning Progress Tracking Tables
-- Created: 2026-05-18
-- Purpose: Enable proper learning progress tracking and personalized recommendations

-- Learning progress tracking table
CREATE TABLE IF NOT EXISTS participant_learning_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percent DECIMAL(5,2) DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_topic (user_id, topic_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_topic_status (topic_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Learning recommendations table (replace rekomendasi_belajar)
CREATE TABLE IF NOT EXISTS learning_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    recommendation_type ENUM('weakness', 'priority', 'suggested') DEFAULT 'suggested',
    reason TEXT,
    priority INT DEFAULT 0,
    status ENUM('pending', 'in_progress', 'completed', 'dismissed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_priority (priority),
    INDEX idx_recommendation_type (recommendation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trigger to update learning_recommendations status when topic is completed
DELIMITER //
CREATE TRIGGER IF NOT EXISTS tr_update_recommendation_on_complete
AFTER UPDATE ON participant_learning_progress
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE learning_recommendations 
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND topic_id = NEW.topic_id AND status = 'in_progress';
    END IF;
END//
DELIMITER ;
