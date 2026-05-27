-- Reset User Data Script
-- This script deletes all user-related data and creates a fresh test user

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Delete from dependent tables first (only if they exist)
DELETE FROM analisis_kelemahan WHERE 1=1;
DELETE FROM sertifikat WHERE 1=1;
DELETE FROM hasil_ujian WHERE 1=1;
DELETE FROM sesi_ujian WHERE 1=1;
DELETE FROM user_achievements WHERE 1=1;
DELETE FROM user_badges WHERE 1=1;
DELETE FROM user_streak WHERE 1=1;
DELETE FROM user_course_progress WHERE 1=1;
DELETE FROM user_module_progress WHERE 1=1;
DELETE FROM user_learning_paths WHERE 1=1;
DELETE FROM user_daily_challenges WHERE 1=1;
DELETE FROM xp_transactions WHERE 1=1;

-- Delete users (except admin)
DELETE FROM users WHERE role != 'admin';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify deletion
SELECT 'Users deleted (except admin): ' AS message, COUNT(*) AS count FROM users WHERE role != 'admin';
SELECT 'Hasil ujian deleted: ' AS message, COUNT(*) AS count FROM hasil_ujian;
SELECT 'Sesi ujian deleted: ' AS message, COUNT(*) AS count FROM sesi_ujian;
