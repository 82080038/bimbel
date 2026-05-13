-- Performance Indexes for Ujian Sekolah Kedinasan Database
-- This file adds composite indexes to optimize common queries

USE ujian_sekolah_kedinasan;

-- ============================================
-- SOAL TABLE INDEXES
-- ============================================

-- Composite index for category + difficulty filtering
CREATE INDEX idx_soal_kategori_tingkat ON soal(kategori_id, tingkat);

-- Composite index for category + difficulty + active questions
CREATE INDEX idx_soal_kategori_tingkat_active ON soal(kategori_id, tingkat) WHERE tingkat IS NOT NULL;

-- Index for IRT parameters sorting
CREATE INDEX idx_soal_irt ON soal(irt_b, irt_a);

-- Index for generated questions
CREATE INDEX idx_soal_generated ON soal(generated_by_ai, ai_generated_at);

-- ============================================
-- HASIL_UJIAN TABLE INDEXES
-- ============================================

-- Composite index for user + date filtering
CREATE INDEX idx_hasil_user_tanggal ON hasil_ujian(user_id, tanggal_ujian);

-- Composite index for status filtering
CREATE INDEX idx_hasil_status ON hasil_ujian(status_lulus, tanggal_ujian);

-- Index for verification code lookup
CREATE INDEX idx_hasil_verification ON hasil_ujian(verification_code);

-- Composite index for pass/fail filtering by date
CREATE INDEX idx_hasil_status_tanggal ON hasil_ujian(status_lulus, tanggal_ujian DESC);

-- ============================================
-- SESI_UJIAN TABLE INDEXES
-- ============================================

-- Composite index for user + status filtering
CREATE INDEX idx_sesi_user_status ON sesi_ujian(user_id, status);

-- Composite index for nama_peserta + status filtering
CREATE INDEX idx_sesi_nama_status ON sesi_ujian(nama_peserta, status);

-- Index for active sessions
CREATE INDEX idx_sesi_status ON sesi_ujian(status, waktu_mulai);

-- ============================================
-- ANALISIS_KELEMAHAN TABLE INDEXES
-- ============================================

-- Composite index for user + category analysis
CREATE INDEX idx_analisis_user_kategori ON analisis_kelemahan(user_id, kategori_id);

-- Index for weakness level filtering
CREATE INDEX idx_analisis_tingkat ON analisis_kelemahan(tingkat_kelemahan, persen_benar);

-- ============================================
-- REKOMENDASI_BELAJAR TABLE INDEXES
-- ============================================

-- Composite index for user + status filtering
CREATE INDEX idx_rekomendasi_user_status ON rekomendasi_belajar(user_id, status);

-- Index for reason filtering
CREATE INDEX idx_rekomendasi_alasan ON rekomendasi_belajar(alasan, created_at);

-- ============================================
-- BAHAN_PELAJARAN TABLE INDEXES
-- ============================================

-- Composite index for soal + type filtering
CREATE INDEX idx_bahan_soal_tipe ON bahan_pelajaran(soal_id, tipe);

-- Index for ordering
CREATE INDEX idx_bahan_urutan ON bahan_pelajaran(urutan);

-- ============================================
-- TIPS_TRICKS TABLE INDEXES
-- ============================================

-- Composite index for category + priority filtering
CREATE INDEX idx_tips_kategori_prioritas ON tips_tricks(kategori_id, prioritas DESC);

-- Index for active tips
CREATE INDEX idx_tips_aktif ON tips_tricks(aktif, prioritas DESC);

-- Index for type filtering
CREATE INDEX idx_tips_tipe ON tips_tricks(tipe_tips, prioritas DESC);

-- ============================================
-- SOAL_FREQUENCY TABLE INDEXES
-- ============================================

-- Index for frequency analysis
CREATE INDEX idx_frequency_muncul ON soal_frequency(muncul_count DESC);

-- Composite index for accuracy calculation
CREATE INDEX idx_frequency_accuracy ON soal_frequency(muncul_count, benar_count);

-- ============================================
-- TRYOUT TABLES INDEXES
-- ============================================

-- Learning recommendations
CREATE INDEX idx_learning_rec_user ON learning_recommendations(user_id, priority);

-- Learning progress
CREATE INDEX idx_learning_progress_user ON participant_learning_progress(user_id, studied_at DESC);

-- Tryout sessions
CREATE INDEX idx_tryout_session_user ON tryout_sessions(user_id, created_at DESC);

-- Tryout answers
CREATE INDEX idx_tryout_answers_session ON tryout_answers(tryout_session_id, question_id);

-- ============================================
-- SERTIFIKAT TABLE INDEXES
-- ============================================

-- Composite index for user + verification
CREATE INDEX idx_sertifikat_user ON sertifikat(user_id, issued_at DESC);

-- Index for verification code lookup
CREATE INDEX idx_sertifikat_verification ON sertifikat(verification_code);

-- ============================================
-- USERS TABLE INDEXES
-- ============================================

-- Index for API key lookup
CREATE INDEX idx_users_apikey ON users(api_key);

-- Index for username lookup
CREATE INDEX idx_users_username ON users(username);

-- Index for role filtering
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- LEADERBOARD OPTOUT INDEXES
-- ============================================

-- Index for participant lookup
CREATE INDEX idx_leaderboard_nama ON leaderboard_optout(nama_peserta);

-- ============================================
-- VIEW OPTIMIZATION
-- ============================================

-- Add comments to explain index usage
ALTER TABLE soal COMMENT 'Composite indexes added for category+difficulty and IRT parameter queries';
ALTER TABLE hasil_ujian COMMENT 'Indexes added for user history, status filtering, and verification lookup';
ALTER TABLE sesi_ujian COMMENT 'Indexes added for session tracking and active session queries';
