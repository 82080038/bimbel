-- Recreate views that were removed during import

-- View 1: v_analisis_kelemahan_lengkap
CREATE OR REPLACE VIEW `v_analisis_kelemahan_lengkap` AS
SELECT 
    ak.id, ak.user_id, ak.sesi_id, ak.kategori_id, k.nama_kategori,
    ak.total_soal, ak.benar, ak.salah, ak.kosong, ak.persen_benar,
    ak.tingkat_kelemahan, ak.rekomendasi, ak.created_at
FROM analisis_kelemahan ak
JOIN kategori_soal k ON ak.kategori_id = k.id
ORDER BY ak.persen_benar;

-- View 2: v_bahan_pelajaran_lengkap
CREATE OR REPLACE VIEW `v_bahan_pelajaran_lengkap` AS
SELECT 
    bp.id, bp.soal_id, s.pertanyaan, s.kategori_id, k.nama_kategori,
    bp.judul, bp.konten, bp.tipe, bp.url, bp.file_path, bp.urutan,
    s.jawaban_benar, s.pembahasan
FROM bahan_pelajaran bp
JOIN soal s ON bp.soal_id = s.id
JOIN kategori_soal k ON s.kategori_id = k.id;

-- View 3: v_rekomendasi_belajar
CREATE OR REPLACE VIEW `v_rekomendasi_belajar` AS
SELECT 
    rb.id, rb.user_id, rb.sesi_id, rb.soal_id, s.pertanyaan, s.kategori_id, k.nama_kategori,
    rb.alasan, rb.status, rb.dipelajari_pada, rb.created_at,
    s.jawaban_benar, s.pembahasan
FROM rekomendasi_belajar rb
JOIN soal s ON rb.soal_id = s.id
JOIN kategori_soal k ON s.kategori_id = k.id;

-- View 4: v_soal_statistics
CREATE OR REPLACE VIEW `v_soal_statistics` AS
SELECT 
    s.id, s.pertanyaan, s.kategori_id, k.nama_kategori,
    COALESCE(sf.muncul_count, 0) AS muncul_count,
    COALESCE(sf.benar_count, 0) AS benar_count,
    COALESCE(sf.salah_count, 0) AS salah_count,
    CASE WHEN COALESCE(sf.muncul_count, 0) > 0 
        THEN ROUND(COALESCE(sf.benar_count, 0) / COALESCE(sf.muncul_count, 0) * 100, 2) 
        ELSE 0 END AS persen_benar,
    CASE WHEN COALESCE(sf.muncul_count, 0) > 0 
        THEN ROUND(COALESCE(sf.salah_count, 0) / COALESCE(sf.muncul_count, 0) * 100, 2) 
        ELSE 0 END AS persen_salah
FROM soal s
LEFT JOIN kategori_soal k ON s.kategori_id = k.id
LEFT JOIN soal_frequency sf ON s.id = sf.soal_id;
