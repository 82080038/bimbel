-- Tabel untuk tracking frekuensi kemunculan soal
CREATE TABLE IF NOT EXISTS soal_frequency (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soal_id INT NOT NULL,
    muncul_count INT DEFAULT 0,
    benar_count INT DEFAULT 0,
    salah_count INT DEFAULT 0,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE,
    UNIQUE KEY (soal_id)
);

-- Trigger untuk otomatis menambah record jika belum ada
DELIMITER //
CREATE TRIGGER ensure_soal_frequency
AFTER INSERT ON soal
FOR EACH ROW
BEGIN
    INSERT IGNORE INTO soal_frequency (soal_id, muncul_count) VALUES (NEW.id, 0);
END//
DELIMITER ;

-- View untuk statistik frekuensi soal
CREATE OR REPLACE VIEW v_soal_statistics AS
SELECT 
    s.id,
    s.pertanyaan,
    s.kategori_id,
    k.nama_kategori,
    COALESCE(sf.muncul_count, 0) as muncul_count,
    COALESCE(sf.benar_count, 0) as benar_count,
    COALESCE(sf.salah_count, 0) as salah_count,
    CASE 
        WHEN COALESCE(sf.muncul_count, 0) > 0 
        THEN ROUND((COALESCE(sf.benar_count, 0) / COALESCE(sf.muncul_count, 0)) * 100, 2)
        ELSE 0 
    END as persen_benar,
    CASE 
        WHEN COALESCE(sf.muncul_count, 0) > 0 
        THEN ROUND((COALESCE(sf.salah_count, 0) / COALESCE(sf.muncul_count, 0)) * 100, 2)
        ELSE 0 
    END as persen_salah
FROM soal s
LEFT JOIN kategori_soal k ON s.kategori_id = k.id
LEFT JOIN soal_frequency sf ON s.id = sf.soal_id;
