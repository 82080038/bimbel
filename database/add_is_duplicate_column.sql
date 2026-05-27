-- Add is_duplicate column to soal table
ALTER TABLE soal ADD COLUMN is_duplicate TINYINT(1) DEFAULT 0;

-- Mark 799 duplicate soal
UPDATE soal s 
LEFT JOIN soal_duplicate_check d ON s.id = d.soal_id 
SET s.is_duplicate = 1 
WHERE d.soal_id IS NULL;
