-- Add image support to soal table
ALTER TABLE soal ADD COLUMN gambar_pertanyaan VARCHAR(255) NULL AFTER pertanyaan;
ALTER TABLE soal ADD COLUMN gambar_opsi_a VARCHAR(255) NULL AFTER opsi_a;
ALTER TABLE soal ADD COLUMN gambar_opsi_b VARCHAR(255) NULL AFTER opsi_b;
ALTER TABLE soal ADD COLUMN gambar_opsi_c VARCHAR(255) NULL AFTER opsi_c;
ALTER TABLE soal ADD COLUMN gambar_opsi_d VARCHAR(255) NULL AFTER opsi_d;
ALTER TABLE soal ADD COLUMN gambar_opsi_e VARCHAR(255) NULL AFTER opsi_e;
ALTER TABLE soal ADD COLUMN gambar_pembahasan VARCHAR(255) NULL AFTER pembahasan;

-- Create media table for tracking uploads
CREATE TABLE IF NOT EXISTS media_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_by INT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create uploads/soal directory if not exists
-- Note: This needs to be done manually or via PHP script
