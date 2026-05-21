-- Migration: Drop nama_peserta column and ensure TPA/PSIKOLOGIS columns exist
-- This migration aligns database schema with the code refactor
-- Date: 2026-05-21
-- Description:
--   1. Drop nama_peserta from sesi_ujian (redundant with user_id)
--   2. Drop nama_peserta from hasil_ujian (redundant with users.nama_lengkap)
--   3. Ensure nilai_tpa and nilai_psikologis columns exist in hasil_ujian

USE ujian_sekolah_kedinasan;

-- Check and drop nama_peserta from sesi_ujian if exists
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ujian_sekolah_kedinasan' 
    AND TABLE_NAME = 'sesi_ujian' 
    AND COLUMN_NAME = 'nama_peserta'
);

SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE sesi_ujian DROP COLUMN nama_peserta',
    'SELECT "Column nama_peserta already dropped from sesi_ujian" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and drop nama_peserta from hasil_ujian if exists
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ujian_sekolah_kedinasan' 
    AND TABLE_NAME = 'hasil_ujian' 
    AND COLUMN_NAME = 'nama_peserta'
);

SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE hasil_ujian DROP COLUMN nama_peserta',
    'SELECT "Column nama_peserta already dropped from hasil_ujian" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure nilai_tpa column exists in hasil_ujian
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ujian_sekolah_kedinasan' 
    AND TABLE_NAME = 'hasil_ujian' 
    AND COLUMN_NAME = 'nilai_tpa'
);

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE hasil_ujian ADD COLUMN nilai_tpa INT(11) DEFAULT 0 AFTER nilai_tkp',
    'SELECT "Column nilai_tpa already exists in hasil_ujian" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure nilai_psikologis column exists in hasil_ujian
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ujian_sekolah_kedinasan' 
    AND TABLE_NAME = 'hasil_ujian' 
    AND COLUMN_NAME = 'nilai_psikologis'
);

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE hasil_ujian ADD COLUMN nilai_psikologis INT(11) DEFAULT 0 AFTER nilai_tpa',
    'SELECT "Column nilai_psikologis already exists in hasil_ujian" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify schema after migration
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ujian_sekolah_kedinasan' 
AND TABLE_NAME IN ('sesi_ujian', 'hasil_ujian')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Update nilai_total calculation in existing records to include TPA and PSIKOLOGIS
UPDATE hasil_ujian 
SET nilai_total = COALESCE(nilai_twk, 0) + COALESCE(nilai_tiu, 0) + COALESCE(nilai_tkp, 0) + COALESCE(nilai_tpa, 0) + COALESCE(nilai_psikologis, 0)
WHERE nilai_total != (COALESCE(nilai_twk, 0) + COALESCE(nilai_tiu, 0) + COALESCE(nilai_tkp, 0) + COALESCE(nilai_tpa, 0) + COALESCE(nilai_psikologis, 0));

SELECT 'Migration completed successfully' AS status;
