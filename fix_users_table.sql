-- Fix users table - Add missing columns for participant registration
-- Run this if registration fails with "Unknown column" error

-- Check if columns exist before adding
SET @dbname = DATABASE();
SET @tablename = 'users';

-- Add nama_lengkap if not exists
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'nama_lengkap') = 0,
    'ALTER TABLE users ADD COLUMN nama_lengkap VARCHAR(100) AFTER role',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add nomor_hp if not exists
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'nomor_hp') = 0,
    'ALTER TABLE users ADD COLUMN nomor_hp VARCHAR(15) AFTER nama_lengkap',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add jenis_kelamin if not exists
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'jenis_kelamin') = 0,
    'ALTER TABLE users ADD COLUMN jenis_kelamin CHAR(1) AFTER nomor_hp',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add tahun_tamat if not exists
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'tahun_tamat') = 0,
    'ALTER TABLE users ADD COLUMN tahun_tamat INT AFTER jenis_kelamin',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add asal_sekolah if not exists
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'asal_sekolah') = 0,
    'ALTER TABLE users ADD COLUMN asal_sekolah VARCHAR(200) AFTER tahun_tamat',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show updated table structure
DESCRIBE users;
