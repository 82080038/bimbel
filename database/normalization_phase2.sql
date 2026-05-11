-- Phase 2: Category Normalization
-- Normalize tips_umum.kategori to use kategori_id foreign key

-- Step 1: Add kategori_id column
ALTER TABLE tips_umum ADD COLUMN kategori_id INT DEFAULT NULL AFTER kategori;

-- Step 2: Migrate data from kategori VARCHAR to kategori_id
UPDATE tips_umum t
LEFT JOIN kategori_soal k ON UPPER(t.kategori) = UPPER(k.nama_kategori)
SET t.kategori_id = k.id
WHERE t.kategori IS NOT NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE tips_umum ADD INDEX idx_tips_kategori (kategori_id);
ALTER TABLE tips_umum ADD CONSTRAINT fk_tips_kategori FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id) ON DELETE SET NULL;

-- Step 4: Remove old kategori VARCHAR column (after verification)
ALTER TABLE tips_umum DROP COLUMN kategori;
