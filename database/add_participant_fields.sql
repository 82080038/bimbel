-- Update table users to add participant data fields
-- Run this SQL to add the new columns for participant registration

-- Check if columns exist, if not add them
SET @dbname = DATABASE();
SET @tablename = 'users';

-- Add nama_lengkap column if not exists
SET @columnname = 'nama_lengkap';
SET @sql = CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN IF NOT EXISTS ', @columnname, ' VARCHAR(100) AFTER role');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add nomor_hp column if not exists
SET @columnname = 'nomor_hp';
SET @sql = CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN IF NOT EXISTS ', @columnname, ' VARCHAR(15) AFTER nama_lengkap');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add jenis_kelamin column if not exists
SET @columnname = 'jenis_kelamin';
SET @sql = CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN IF NOT EXISTS ', @columnname, ' CHAR(1) AFTER nomor_hp');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add tahun_tamat column if not exists
SET @columnname = 'tahun_tamat';
SET @sql = CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN IF NOT EXISTS ', @columnname, ' INT AFTER jenis_kelamin');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add asal_sekolah column if not exists
SET @columnname = 'asal_sekolah';
SET @sql = CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN IF NOT EXISTS ', @columnname, ' VARCHAR(200) AFTER tahun_tamat');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Alternative: Simple ALTER statements (MySQL 8.0+)
-- Uncomment these if the prepared statements don't work

-- ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(100) AFTER role;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS nomor_hp VARCHAR(15) AFTER nama_lengkap;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS jenis_kelamin CHAR(1) AFTER nomor_hp;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS tahun_tamat INT AFTER jenis_kelamin;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS asal_sekolah VARCHAR(200) AFTER tahun_tamat;

-- Add index for nomor_hp for faster lookup
CREATE INDEX IF NOT EXISTS idx_nomor_hp ON users(nomor_hp);

-- Show updated table structure
DESCRIBE users;
