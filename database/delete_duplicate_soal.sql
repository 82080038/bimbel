-- Delete 799 duplicate soal from database
DELETE FROM soal WHERE is_duplicate = 1;
