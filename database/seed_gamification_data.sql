-- Seed Gamification Data
-- Achievements
INSERT INTO achievements (id, nama, deskripsi, kategori, xp_reward, badge_id, criteria_type, criteria_value) VALUES
(1, 'First Steps', 'Complete your first exam', 'exam', 50, NULL, 'exam_count', 1),
(2, 'Quick Learner', 'Complete 5 exams', 'exam', 100, NULL, 'exam_count', 5),
(3, 'Dedicated Student', 'Complete 10 exams', 'exam', 200, NULL, 'exam_count', 10),
(4, 'High Scorer', 'Score above 80 in any exam', 'score', 150, NULL, 'min_score', 80),
(5, 'Perfect Score', 'Get a perfect score', 'score', 500, NULL, 'min_score', 100),
(6, 'Week Warrior', 'Study for 7 days in a row', 'streak', 300, NULL, 'streak_days', 7),
(7, 'Month Master', 'Study for 30 days in a row', 'streak', 1000, NULL, 'streak_days', 30)
ON DUPLICATE KEY UPDATE nama=nama;

-- Badges
INSERT INTO badges (id, nama, deskripsi, icon, kategori, xp_reward) VALUES
(1, 'Bronze Learner', 'Beginner level achievement', 'fa-medal', 'learning', 50),
(2, 'Silver Scholar', 'Intermediate level achievement', 'fa-medal', 'learning', 100),
(3, 'Gold Master', 'Advanced level achievement', 'fa-medal', 'learning', 200),
(4, 'Diamond Expert', 'Expert level achievement', 'fa-gem', 'learning', 500),
(5, 'Speed Demon', 'Fast completion', 'fa-rocket', 'speed', 150),
(6, 'Perfectionist', 'Perfect scores', 'fa-check-double', 'accuracy', 500)
ON DUPLICATE KEY UPDATE nama=nama;

-- Daily Challenges
INSERT INTO daily_challenges (id, judul, deskripsi, challenge_type, target_value, xp_reward, date) VALUES
(1, 'Daily Practice', 'Complete at least 1 exam today', 'exam_count', 1, 50, CURDATE()),
(2, 'Score Hunter', 'Score above 70 in any exam', 'min_score', 70, 100, CURDATE()),
(3, 'Category Master', 'Complete 5 TWK questions', 'category_questions', 5, 75, CURDATE()),
(4, 'Quick Study', 'Complete an exam in under 30 minutes', 'max_duration', 30, 80, CURDATE())
ON DUPLICATE KEY UPDATE judul=judul;

-- User XP for existing users
INSERT INTO user_xp (user_id, total_xp, level, xp_to_next_level) VALUES
(1, 500, 2, 200),
(24, 100, 1, 100),
(22, 0, 1, 100),
(23, 0, 1, 100),
(27, 0, 1, 100),
(28, 0, 1, 100),
(29, 0, 1, 100)
ON DUPLICATE KEY UPDATE total_xp=total_xp;

-- User Streak
INSERT INTO user_streak (user_id, current_streak, longest_streak, last_activity_date) VALUES
(1, 3, 5, CURDATE()),
(24, 1, 1, CURDATE()),
(22, 0, 0, NULL),
(23, 0, 0, NULL),
(27, 0, 0, NULL),
(28, 0, 0, NULL),
(29, 0, 0, NULL)
ON DUPLICATE KEY UPDATE current_streak=current_streak;

-- User Achievements (admin gets some achievements)
INSERT INTO user_achievements (user_id, achievement_id, completed_at) VALUES
(1, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, 4, DATE_SUB(CURDATE(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE completed_at=completed_at;

-- User Badges
INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES
(1, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE earned_at=earned_at;
