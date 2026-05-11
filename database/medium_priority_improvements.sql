-- MEDIUM Priority Improvements Database Schema

-- 1. IRT parameters for tracking frequency
-- Add IRT parameters to soal table
ALTER TABLE soal ADD COLUMN irt_a DECIMAL(5,4) DEFAULT NULL COMMENT 'discrimination parameter';
ALTER TABLE soal ADD COLUMN irt_b DECIMAL(5,4) DEFAULT NULL COMMENT 'difficulty parameter';
ALTER TABLE soal ADD COLUMN irt_c DECIMAL(5,4) DEFAULT NULL COMMENT 'guessing parameter';
ALTER TABLE soal ADD COLUMN discrimination_index DECIMAL(5,4) DEFAULT NULL COMMENT 'point-biserial correlation';
ALTER TABLE soal ADD COLUMN item_quality ENUM('excellent', 'good', 'fair', 'poor') DEFAULT NULL;

-- Update soal_frequency table with IRT data
ALTER TABLE soal_frequency ADD COLUMN irt_a DECIMAL(5,4) DEFAULT NULL;
ALTER TABLE soal_frequency ADD COLUMN irt_b DECIMAL(5,4) DEFAULT NULL;
ALTER TABLE soal_frequency ADD COLUMN irt_c DECIMAL(5,4) DEFAULT NULL;
ALTER TABLE soal_frequency ADD COLUMN discrimination_index DECIMAL(5,4) DEFAULT NULL;

-- Note: Multiple flag types will be implemented in frontend using localStorage/session
-- since answers are stored in hasil_ujian.jawaban_peserta as JSON text

