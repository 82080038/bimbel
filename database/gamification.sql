-- Gamification System Database Schema
-- Created: 14 Mei 2026

-- Table: user_xp (XP/Points system)
CREATE TABLE IF NOT EXISTS user_xp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_xp INT DEFAULT 0,
    level INT DEFAULT 1,
    xp_to_next_level INT DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_xp (user_id)
);

-- Table: xp_transactions (Track XP earned/spent)
CREATE TABLE IF NOT EXISTS xp_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    xp_amount INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: user_streak (Streak counter)
CREATE TABLE IF NOT EXISTS user_streak (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_streak (user_id)
);

-- Table: badges (Available badges)
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    icon VARCHAR(100),
    kategori VARCHAR(100),
    xp_reward INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_badges (Earned badges)
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (user_id, badge_id)
);

-- Table: achievements (Achievement definitions)
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    kategori VARCHAR(100),
    xp_reward INT DEFAULT 0,
    badge_id INT,
    criteria_type VARCHAR(100),
    criteria_value INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE SET NULL
);

-- Table: user_achievements (Earned achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    progress INT DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Table: daily_challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    challenge_type VARCHAR(100),
    target_value INT NOT NULL,
    xp_reward INT DEFAULT 0,
    date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_challenge (date, challenge_type)
);

-- Table: user_daily_challenges
CREATE TABLE IF NOT EXISTS user_daily_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    progress INT DEFAULT 0,
    completed_at DATETIME,
    claimed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_daily_challenge (user_id, challenge_id)
);

-- Table: level_rewards (Rewards for each level)
CREATE TABLE IF NOT EXISTS level_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level INT NOT NULL,
    reward_type VARCHAR(100),
    reward_value INT,
    reward_name VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_level (level)
);

-- Insert default badges
INSERT INTO badges (nama, deskripsi, icon, kategori, xp_reward) VALUES
('First Exam', 'Menyelesaikan ujian pertama', 'fa-play-circle', 'milestone', 50),
('Scholar', 'Menyelesaikan 10 ujian', 'fa-graduation-cap', 'milestone', 100),
('Master', 'Menyelesaikan 50 ujian', 'fa-trophy', 'milestone', 500),
('Perfect Score', 'Mendapatkan nilai sempurna', 'fa-star', 'performance', 200),
('Week Warrior', 'Streak belajar 7 hari berturut-turut', 'fa-fire', 'streak', 150),
('Month Warrior', 'Streak belajar 30 hari berturut-turut', 'fa-fire-alt', 'streak', 500),
('Quick Learner', 'Menyelesaikan kursus dalam 1 hari', 'fa-bolt', 'speed', 100),
('Dedicated', 'Login 30 hari berturut-turut', 'fa-heart', 'engagement', 300)
ON DUPLICATE KEY UPDATE nama=VALUES(nama);

-- Insert default achievements
INSERT INTO achievements (nama, deskripsi, kategori, xp_reward, criteria_type, criteria_value) VALUES
('First Blood', 'Menyelesaikan ujian pertama', 'milestone', 50, 'exam_count', 1),
('Rising Star', 'Menyelesaikan 5 ujian', 'milestone', 100, 'exam_count', 5),
('Veteran', 'Menyelesaikan 25 ujian', 'milestone', 250, 'exam_count', 25),
('Legend', 'Menyelesaikan 100 ujian', 'milestone', 1000, 'exam_count', 100),
('Top Scorer', 'Mendapatkan nilai 90+ di ujian', 'performance', 200, 'exam_score', 90),
('Perfectionist', 'Mendapatkan nilai 100 di ujian', 'performance', 500, 'exam_score', 100),
('Week Streak', 'Streak belajar 7 hari', 'streak', 150, 'streak_days', 7),
('Month Streak', 'Streak belajar 30 hari', 'streak', 500, 'streak_days', 30),
('Daily Champion', 'Menyelesaikan 30 daily challenges', 'challenges', 300, 'daily_challenges', 30),
('Course Master', 'Menyelesaikan 10 kursus', 'courses', 400, 'course_count', 10)
ON DUPLICATE KEY UPDATE nama=VALUES(nama);

-- Insert default level rewards
INSERT INTO level_rewards (level, reward_type, reward_value, reward_name) VALUES
(1, 'badge', 1, 'Novice Badge'),
(5, 'badge', 2, 'Apprentice Badge'),
(10, 'badge', 3, 'Journeyman Badge'),
(20, 'badge', 4, 'Expert Badge'),
(50, 'badge', 5, 'Master Badge')
ON DUPLICATE KEY UPDATE level=VALUES(level);

-- Indexes for better performance
CREATE INDEX idx_user_xp_user ON user_xp(user_id);
CREATE INDEX idx_user_xp_level ON user_xp(level);
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_date ON xp_transactions(created_at);
CREATE INDEX idx_user_streak_user ON user_streak(user_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_status ON user_achievements(completed_at);
CREATE INDEX idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX idx_user_daily_challenges_user ON user_daily_challenges(user_id);
CREATE INDEX idx_user_daily_challenges_challenge ON user_daily_challenges(challenge_id);
