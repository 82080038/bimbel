-- Advanced Analytics Database Schema
-- Created: 14 Mei 2026

-- Table: question_analytics (Track question performance)
CREATE TABLE IF NOT EXISTS question_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    total_attempts INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    skipped_answers INT DEFAULT 0,
    avg_time_seconds DECIMAL(10,2) DEFAULT 0,
    difficulty_score DECIMAL(5,2) DEFAULT 50.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES soal(id) ON DELETE CASCADE
);

-- Table: user_analytics (Track user performance)
CREATE TABLE IF NOT EXISTS user_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_exams INT DEFAULT 0,
    avg_score DECIMAL(5,2) DEFAULT 0,
    total_study_time INT DEFAULT 0, -- in minutes
    weak_categories JSON,
    strong_categories JSON,
    improvement_rate DECIMAL(5,2) DEFAULT 0,
    predicted_score DECIMAL(5,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: exam_analytics (Track exam performance)
CREATE TABLE IF NOT EXISTS exam_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT,
    category VARCHAR(10),
    total_participants INT DEFAULT 0,
    avg_score DECIMAL(5,2) DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0,
    avg_time_minutes DECIMAL(10,2) DEFAULT 0,
    drop_off_rate DECIMAL(5,2) DEFAULT 0,
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: answer_heatmap (Track answer patterns)
CREATE TABLE IF NOT EXISTS answer_heatmap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_a_count INT DEFAULT 0,
    option_b_count INT DEFAULT 0,
    option_c_count INT DEFAULT 0,
    option_d_count INT DEFAULT 0,
    option_e_count INT DEFAULT 0,
    correct_option VARCHAR(1),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES soal(id) ON DELETE CASCADE
);

-- Table: funnel_analytics (Track user journey)
CREATE TABLE IF NOT EXISTS funnel_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stage ENUM('landing', 'signup', 'dashboard', 'exam_start', 'exam_complete', 'certificate_download'),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_question_analytics_question ON question_analytics(question_id);
CREATE INDEX idx_user_analytics_user ON user_analytics(user_id);
CREATE INDEX idx_exam_analytics_date ON exam_analytics(date);
CREATE INDEX idx_answer_heatmap_question ON answer_heatmap(question_id);
CREATE INDEX idx_funnel_analytics_user ON funnel_analytics(user_id);
CREATE INDEX idx_funnel_analytics_timestamp ON funnel_analytics(timestamp);
