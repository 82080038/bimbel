-- Phase 3: Index Optimization
-- Add performance indexes for frequently queried columns

-- Index on hasil_ujian.tanggal_ujian for date-based queries
CREATE INDEX idx_hasil_tanggal ON hasil_ujian(tanggal_ujian);

-- Index on sesi_ujian.status for filtering by status
CREATE INDEX idx_sesi_status ON sesi_ujian(status);

-- Composite index on soal_frequency for tracking queries
CREATE INDEX idx_soal_freq_seen ON soal_frequency(soal_id, last_seen);

-- Index on soal.irt_b for CAT question selection
CREATE INDEX idx_soal_irt_b ON soal(irt_b);

-- Index on soal.kategori_id for category filtering (already exists, ensuring it's there)
-- ALTER TABLE soal ADD INDEX idx_soal_kategori (kategori_id);

-- Index on sertifikat.verification_code for quick lookups
CREATE INDEX idx_sertifikat_verification ON sertifikat(verification_code);

-- Index on analisis_kelemahan for user queries
CREATE INDEX idx_analisis_user_kategori ON analisis_kelemahan(user_id, kategori_id);

-- Index on rekomendasi_belajar for user queries
CREATE INDEX idx_rekomendasi_user_sesi ON rekomendasi_belajar(user_id, sesi_id);
