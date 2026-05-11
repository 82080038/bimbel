-- Add tingkat kesulitan column to soal table
ALTER TABLE soal ADD COLUMN tingkat ENUM('mudah', 'sedang', 'sulit') DEFAULT 'sedang';

-- Update existing questions with random difficulty levels
UPDATE soal SET tingkat = 'mudah' WHERE id % 3 = 0;
UPDATE soal SET tingkat = 'sedang' WHERE id % 3 = 1;
UPDATE soal SET tingkat = 'sulit' WHERE id % 3 = 2;
