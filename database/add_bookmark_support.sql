-- Add bookmark support to jawaban_user table
ALTER TABLE jawaban_user ADD COLUMN IF NOT EXISTS is_bookmarked TINYINT(1) DEFAULT 0;
ALTER TABLE jawaban_user ADD INDEX idx_bookmarked (is_bookmarked);

-- Add bookmark support to sesi_ujian table for quick access
ALTER TABLE sesi_ujian ADD COLUMN IF NOT EXISTS bookmarked_questions TEXT DEFAULT NULL;
