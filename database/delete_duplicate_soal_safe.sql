-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete 799 duplicate soal from database
DELETE FROM soal WHERE is_duplicate = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
