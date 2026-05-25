-- Add topic_id column to bahan_pelajaran table
-- Migration script: Add topic_id to bahan_pelajaran
-- Date: 2026-05-26

USE ujian_sekolah_kedinasan;

-- Add topic_id column
ALTER TABLE bahan_pelajaran 
ADD COLUMN topic_id INT(11) DEFAULT NULL AFTER kategori_id;

-- Add foreign key constraint
ALTER TABLE bahan_pelajaran 
ADD CONSTRAINT bahan_pelajaran_ibfk_2 FOREIGN KEY (topic_id) REFERENCES topik_pelajaran(id) ON DELETE SET NULL;

-- Add index for better query performance
ALTER TABLE bahan_pelajaran 
ADD INDEX idx_topic_id (topic_id);

-- Verify the change
DESCRIBE bahan_pelajaran;
