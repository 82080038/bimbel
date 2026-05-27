-- Notification System Database Schema
-- Created: 14 Mei 2026

-- Table: notifications (Store all notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('email', 'in_app', 'push', 'sms') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('exam_reminder', 'exam_result', 'certificate', 'system', 'achievement', 'challenge', 'course') NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at DATETIME,
    error_message TEXT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: notification_preferences (User notification settings)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email_exam_reminder BOOLEAN DEFAULT TRUE,
    email_exam_result BOOLEAN DEFAULT TRUE,
    email_certificate BOOLEAN DEFAULT TRUE,
    email_achievement BOOLEAN DEFAULT TRUE,
    in_app_exam_reminder BOOLEAN DEFAULT TRUE,
    in_app_exam_result BOOLEAN DEFAULT TRUE,
    in_app_achievement BOOLEAN DEFAULT TRUE,
    push_exam_reminder BOOLEAN DEFAULT TRUE,
    push_exam_result BOOLEAN DEFAULT TRUE,
    sms_exam_reminder BOOLEAN DEFAULT FALSE,
    sms_exam_result BOOLEAN DEFAULT FALSE,
    reminder_hours_before INT DEFAULT 24,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_prefs (user_id)
);

-- Table: notification_templates (Email/Push notification templates)
CREATE TABLE IF NOT EXISTS notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('exam_reminder', 'exam_result', 'certificate', 'system', 'achievement', 'challenge', 'course') NOT NULL,
    type ENUM('email', 'in_app', 'push', 'sms') NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: exam_reminders (Scheduled exam reminders)
CREATE TABLE IF NOT EXISTS exam_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT,
    reminder_type ENUM('before', 'after') DEFAULT 'before',
    hours_before INT,
    scheduled_at DATETIME NOT NULL,
    sent_at DATETIME,
    status ENUM('pending', 'sent', 'skipped', 'failed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default notification templates
INSERT INTO notification_templates (name, category, type, subject, body) VALUES
('Exam Reminder Email', 'exam_reminder', 'email', 'Pengingat Ujian: {exam_name}', 'Halo {user_name},<br><br>Ujian {exam_name} akan dimulai dalam {hours_before} jam.<br><br>Jangan lupa untuk mempersiapkan diri Anda.<br><br>Salam,<br>Tim Ujian Sekolah Kedinasan'),
('Exam Result Email', 'exam_result', 'email', 'Hasil Ujian: {exam_name}', 'Halo {user_name},<br><br>Hasil ujian Anda untuk {exam_name} telah tersedia.<br><br>Nilai: {score}<br>Status: {status}<br><br>Login ke dashboard untuk melihat detail lengkap.<br><br>Salam,<br>Tim Ujian Sekolah Kedinasan'),
('Certificate Email', 'certificate', 'email', 'Sertifikat Tersedia', 'Halo {user_name},<br><br>Sertifikat Anda untuk {exam_name} telah tersedia.<br><br>Login ke dashboard untuk mengunduh sertifikat Anda.<br><br>Salam,<br>Tim Ujian Sekolah Kedinasan'),
('Achievement Unlocked', 'achievement', 'email', 'Achievement Baru: {achievement_name}', 'Halo {user_name},<br><br>Selamat! Anda telah membuka achievement baru: {achievement_name}<br><br>XP Reward: {xp_reward}<br><br>Login ke dashboard untuk melihat semua achievement Anda.<br><br>Salam,<br>Tim Ujian Sekolah Kedinasan'),
('Exam Reminder Push', 'exam_reminder', 'push', 'Pengingat Ujian', 'Ujian {exam_name} akan dimulai dalam {hours_before} jam'),
('Exam Result Push', 'exam_result', 'push', 'Hasil Ujian Tersedia', 'Hasil ujian Anda untuk {exam_name} telah tersedia. Nilai: {score}'),
('Achievement Unlocked Push', 'achievement', 'push', 'Achievement Baru', 'Selamat! Anda membuka achievement: {achievement_name}')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Indexes for better performance
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_exam_reminders_user ON exam_reminders(user_id);
CREATE INDEX idx_exam_reminders_scheduled ON exam_reminders(scheduled_at);
CREATE INDEX idx_exam_reminders_status ON exam_reminders(status);
