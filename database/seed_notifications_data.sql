-- Seed Notifications Data
-- Sample notifications for users

INSERT INTO notifications (user_id, type, title, message, category, status, created_at) VALUES
-- Admin notifications
(1, 'in_app', 'Welcome Admin', 'Welcome to the admin panel! You can manage users, questions, and courses here.', 'system', 'sent', NOW()),
(1, 'in_app', 'System Update', 'The system has been updated with new features including gamification and course management.', 'system', 'sent', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Test user notifications
(24, 'in_app', 'Welcome to Bimbel', 'Welcome to the Ujian Sekolah Kedinasan preparation platform! Start your journey today.', 'system', 'pending', NOW()),
(24, 'in_app', 'Daily Challenge', 'Complete your daily challenge to earn XP rewards!', 'challenge', 'pending', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(24, 'in_app', 'New Achievement Unlocked', 'You earned the "First Steps" achievement!', 'achievement', 'sent', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(24, 'in_app', 'Exam Reminder', 'Don\'t forget to practice your TWK questions today.', 'exam_reminder', 'pending', DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Other users welcome notifications
(22, 'in_app', 'Welcome to Bimbel', 'Welcome to the Ujian Sekolah Kedinasan preparation platform!', 'system', 'pending', NOW()),
(23, 'in_app', 'Welcome to Bimbel', 'Welcome to the Ujian Sekolah Kedinasan preparation platform!', 'system', 'pending', NOW()),
(27, 'in_app', 'Welcome to Bimbel', 'Welcome to the Ujian Sekolah Kedinasan preparation platform!', 'system', 'pending', NOW()),
(28, 'in_app', 'Welcome to Bimbel', 'Welcome to the Ujian Sekolah Kedinasan preparation platform!', 'system', 'pending', NOW()),
(29, 'in_app', 'Welcome to Bimbel', 'Welcome to the Ujian Sekolah Kedinasan preparation platform!', 'system', 'pending', NOW())
ON DUPLICATE KEY UPDATE title=title;
