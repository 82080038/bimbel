-- Performance Optimization Indexes
-- Created: 2026-05-18
-- Purpose: Add indexes to improve query performance

-- Indexes for soal table (frequently queried)
CREATE INDEX IF NOT EXISTS idx_soal_kategori ON soal(kategori_id);
CREATE INDEX IF NOT EXISTS idx_soal_tingkat ON soal(tingkat);
CREATE INDEX IF NOT EXISTS idx_soal_generated ON soal(generated_by_ai);
CREATE INDEX IF NOT EXISTS idx_soal_kategori_tingkat ON soal(kategori_id, tingkat);

-- Indexes for hasil_ujian table (frequently queried for analytics)
CREATE INDEX IF NOT EXISTS idx_hasil_ujian_user ON hasil_ujian(user_id);
CREATE INDEX IF NOT EXISTS idx_hasil_ujian_tanggal ON hasil_ujian(tanggal_ujian);
CREATE INDEX IF NOT EXISTS idx_hasil_ujian_user_tanggal ON hasil_ujian(user_id, tanggal_ujian);

-- Indexes for sesi_ujian table
CREATE INDEX IF NOT EXISTS idx_sesi_ujian_user ON sesi_ujian(user_id);
CREATE INDEX IF NOT EXISTS idx_sesi_ujian_status ON sesi_ujian(status);
CREATE INDEX IF NOT EXISTS idx_sesi_ujian_waktu ON sesi_ujian(waktu_mulai);

-- Indexes for bahan_pelajaran table (large table, needs optimization)
CREATE INDEX IF NOT EXISTS idx_bahan_soal ON bahan_pelajaran(soal_id);
CREATE INDEX IF NOT EXISTS idx_bahan_judul ON bahan_pelajaran(judul(100));
CREATE INDEX IF NOT EXISTS idx_bahan_tipe ON bahan_pelajaran(tipe);
CREATE INDEX IF NOT EXISTS idx_bahan_created ON bahan_pelajaran(created_at);

-- Indexes for user_xp table
CREATE INDEX IF NOT EXISTS idx_user_xp_user ON user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_level ON user_xp(level);
CREATE INDEX IF NOT EXISTS idx_user_xp_total ON user_xp(total_xp);

-- Indexes for user_streak table
CREATE INDEX IF NOT EXISTS idx_user_streak_user ON user_streak(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streak_last ON user_streak(last_activity_date);

-- Indexes for user_badges table
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at);

-- Indexes for user_achievements table
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(completed_at);

-- Indexes for courses table
CREATE INDEX IF NOT EXISTS idx_courses_kategori ON courses(kategori);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at);

-- Indexes for user_course_progress table
CREATE INDEX IF NOT EXISTS idx_user_course_user ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_course ON user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_status ON user_course_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_course_user_status ON user_course_progress(user_id, status);

-- Indexes for participant_learning_progress table (new table)
CREATE INDEX IF NOT EXISTS idx_participant_learning_user ON participant_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_participant_learning_topic ON participant_learning_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_participant_learning_status ON participant_learning_progress(status);
CREATE INDEX IF NOT EXISTS idx_participant_learning_user_status ON participant_learning_progress(user_id, status);

-- Indexes for learning_recommendations table (new table)
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_user ON learning_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_topic ON learning_recommendations(topic_id);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_status ON learning_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_priority ON learning_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_type ON learning_recommendations(recommendation_type);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);

-- Indexes for xp_transactions table
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created ON xp_transactions(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_soal_kategori_tingkat_generated ON soal(kategori_id, tingkat, generated_by_ai);
CREATE INDEX IF NOT EXISTS idx_hasil_ujian_user_tanggal ON hasil_ujian(user_id, tanggal_ujian);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge ON user_badges(user_id, badge_id);
