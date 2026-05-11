-- Phase 1: Critical Foreign Key Fixes
-- Add user_id to sesi_ujian and hasil_ujian
-- Add FK constraints for all user_id columns

-- Step 1: Add user_id to sesi_ujian
ALTER TABLE sesi_ujian ADD COLUMN user_id INT DEFAULT NULL AFTER nama_peserta;
ALTER TABLE sesi_ujian ADD INDEX idx_sesi_user (user_id);
ALTER TABLE sesi_ujian ADD CONSTRAINT fk_sesi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Add user_id to hasil_ujian
ALTER TABLE hasil_ujian ADD COLUMN user_id INT DEFAULT NULL AFTER nama_peserta;
ALTER TABLE hasil_ujian ADD INDEX idx_hasil_user (user_id);
ALTER TABLE hasil_ujian ADD CONSTRAINT fk_hasil_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Add FK constraint to analisis_kelemahan.user_id (already exists, just ensure it's proper)
ALTER TABLE analisis_kelemahan DROP FOREIGN KEY IF EXISTS analisis_kelemahan_ibfk_1;
ALTER TABLE analisis_kelemahan ADD CONSTRAINT fk_analisis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 4: Add FK constraint to rekomendasi_belajar.user_id
ALTER TABLE rekomendasi_belajar DROP FOREIGN KEY IF EXISTS rekomendasi_belajar_ibfk_1;
ALTER TABLE rekomendasi_belajar ADD CONSTRAINT fk_rekomendasi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 5: Add FK constraint to sertifikat.user_id
ALTER TABLE sertifikat DROP FOREIGN KEY IF EXISTS sertifikat_ibfk_1;
ALTER TABLE sertifikat ADD CONSTRAINT fk_sertifikat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 6: Fix leaderboard_optout - change from user_id to nama_peserta for consistency
ALTER TABLE leaderboard_optout DROP FOREIGN KEY IF EXISTS leaderboard_optout_ibfk_1;
ALTER TABLE leaderboard_optout DROP INDEX user_id;
ALTER TABLE leaderboard_optout CHANGE COLUMN user_id nama_peserta VARCHAR(100);
ALTER TABLE leaderboard_optout ADD UNIQUE INDEX idx_leaderboard_nama (nama_peserta);

-- Note: nama_peserta in leaderboard_optout references users.username, not users.id
-- This is intentional as it uses the exam participant name, not user account
