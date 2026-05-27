-- ============================================================================
-- DATABASE PERFORMANCE INDEXES
-- Adds indexes to frequently queried columns for better performance
-- ============================================================================

-- Users table indexes
ALTER TABLE users ADD INDEX idx_users_email (email);
ALTER TABLE users ADD INDEX idx_users_role (role);
ALTER TABLE users ADD INDEX idx_users_api_key (api_key);
ALTER TABLE users ADD INDEX idx_users_status (status);

-- Soal (Questions) table indexes
ALTER TABLE soal ADD INDEX idx_soal_kategori (kategori_id);
ALTER TABLE soal ADD INDEX idx_soal_paket (paket_id);
ALTER TABLE soal ADD INDEX idx_soal_tingkat (tingkat_kesulitan);
ALTER TABLE soal ADD INDEX idx_soal_status (status);
ALTER TABLE soal ADD INDEX idx_soal_kategori_tingkat (kategori_id, tingkat_kesulitan);

-- Hasil Ujian (Exam Results) indexes
ALTER TABLE hasil_ujian ADD INDEX idx_hasil_user (user_id);
ALTER TABLE hasil_ujian ADD INDEX idx_hasil_paket (paket_id);
ALTER TABLE hasil_ujian ADD INDEX idx_hasil_tanggal (created_at);
ALTER TABLE hasil_ujian ADD INDEX idx_hasil_user_paket (user_id, paket_id);
ALTER TABLE hasil_ujian ADD INDEX idx_hasil_user_tanggal (user_id, created_at);

-- Sesi Ujian (Exam Sessions) indexes
ALTER TABLE sesi_ujian ADD INDEX idx_sesi_user (user_id);
ALTER TABLE sesi_ujian ADD INDEX idx_sesi_paket (paket_id);
ALTER TABLE sesi_ujian ADD INDEX idx_sesi_status (status);
ALTER TABLE sesi_ujian ADD INDEX idx_sesi_token (token_ujian);

-- Jawaban User (User Answers) indexes
ALTER TABLE jawaban_user ADD INDEX idx_jawaban_hasil (hasil_id);
ALTER TABLE jawaban_user ADD INDEX idx_jawaban_soal (soal_id);
ALTER TABLE jawaban_user ADD INDEX idx_jawaban_benar (benar);

-- Paket Tryout (Exam Packages) indexes
ALTER TABLE paket_tryout ADD INDEX idx_paket_status (status);
ALTER TABLE paket_tryout ADD INDEX idx_paket_kategori (kategori_id);

-- Kategori Soal (Question Categories) indexes
ALTER TABLE kategori_soal ADD INDEX idx_kategori_nama (nama_kategori);
ALTER TABLE kategori_soal ADD INDEX idx_kategori_status (is_active);

-- Gamification - User XP indexes
ALTER TABLE user_xp ADD INDEX idx_xp_user (user_id);
ALTER TABLE user_xp ADD INDEX idx_xp_total (total_xp);

-- Gamification - User Badges indexes
ALTER TABLE user_badges ADD INDEX idx_ub_user (user_id);
ALTER TABLE user_badges ADD INDEX idx_ub_badge (badge_id);
ALTER TABLE user_badges ADD INDEX idx_ub_user_badge (user_id, badge_id);

-- Gamification - User Achievements indexes
ALTER TABLE user_achievements ADD INDEX idx_ua_user (user_id);
ALTER TABLE user_achievements ADD INDEX idx_ua_achievement (achievement_id);

-- Notifications indexes
ALTER TABLE notifications ADD INDEX idx_notif_user (user_id);
ALTER TABLE notifications ADD INDEX idx_notif_status (is_read);
ALTER TABLE notifications ADD INDEX idx_notif_user_status (user_id, is_read);
ALTER TABLE notifications ADD INDEX idx_notif_tanggal (created_at);

-- Analytics indexes
ALTER TABLE question_analytics ADD INDEX idx_qa_question (question_id);
ALTER TABLE question_analytics ADD INDEX idx_qa_paket (paket_id);
ALTER TABLE user_analytics ADD INDEX idx_ua_user (user_id);

-- Course Management indexes
ALTER TABLE courses ADD INDEX idx_courses_status (status);
ALTER TABLE course_modules ADD INDEX idx_cm_course (course_id);
ALTER TABLE course_modules ADD INDEX idx_cm_order (urutan);
ALTER TABLE course_materials ADD INDEX idx_cmat_module (module_id);
ALTER TABLE user_course_progress ADD INDEX idx_ucp_user (user_id);
ALTER TABLE user_course_progress ADD INDEX idx_ucp_course (course_id);
ALTER TABLE user_course_progress ADD INDEX idx_ucp_user_course (user_id, course_id);

-- Content Management indexes
ALTER TABLE content_versions ADD INDEX idx_cv_content (content_type, content_id);
ALTER TABLE content_versions ADD INDEX idx_cv_author (author_id);

-- Exam related indexes
ALTER TABLE tryout_sessions ADD INDEX idx_ts_user (user_id);
ALTER TABLE tryout_sessions ADD INDEX idx_ts_status (status);
ALTER TABLE tryout_answers ADD INDEX idx_ta_session (session_id);
ALTER TABLE tryout_answers ADD INDEX idx_ta_soal (soal_id);

-- Tips and Tricks indexes
ALTER TABLE tips_soal ADD INDEX idx_tips_kategori (kategori_id);
ALTER TABLE tips_soal ADD INDEX idx_tips_tingkat (tingkat_kesulitan);

-- Bahan Pelajaran (Learning Materials) indexes
ALTER TABLE bahan_pelajaran ADD INDEX idx_bp_kategori (kategori_id);
ALTER TABLE bahan_pelajaran ADD INDEX idx_bp_tipe (tipe);

-- Expert Knowledge indexes
ALTER TABLE expert_knowledge ADD INDEX idx_ek_category (category);
ALTER TABLE expert_knowledge ADD INDEX idx_ek_kategori (kategori_id);
ALTER TABLE expert_knowledge ADD INDEX idx_ek_tags (tags(100));

-- Daily Challenges indexes
ALTER TABLE daily_challenges ADD INDEX idx_dc_date (challenge_date);
ALTER TABLE daily_challenges ADD INDEX idx_dc_active (is_active);
ALTER TABLE user_daily_challenges ADD INDEX idx_udc_user (user_id);
ALTER TABLE user_daily_challenges ADD INDEX idx_udc_challenge (challenge_id);

-- Leaderboard indexes
ALTER TABLE leaderboard_optout ADD INDEX idx_lo_user (user_id);

-- Sertifikat (Certificates) indexes
ALTER TABLE sertifikat ADD INDEX idx_sert_user (user_id);
ALTER TABLE sertifikat ADD INDEX idx_sert_kode (kode_verifikasi);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- For exam result queries with filtering
ALTER TABLE hasil_ujian ADD INDEX idx_hasil_composite (user_id, paket_id, created_at);

-- For question retrieval with difficulty filtering
ALTER TABLE soal ADD INDEX idx_soal_composite (kategori_id, paket_id, tingkat_kesulitan);

-- For user progress tracking
ALTER TABLE user_xp ADD INDEX idx_xp_composite (user_id, total_xp, level);

-- For notification inbox queries
ALTER TABLE notifications ADD INDEX idx_notif_composite (user_id, is_read, created_at);

-- For course enrollment queries
ALTER TABLE user_course_progress ADD INDEX idx_ucp_composite (user_id, course_id, status, progress_percentage);
