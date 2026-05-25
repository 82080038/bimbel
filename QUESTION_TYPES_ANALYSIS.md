# Analisis Jenis Soal yang Perlu Disiapkan

## Jenis Soal yang Sudah Diimplementasikan

### 1. Pilihan Ganda (Multiple Choice)
- **Status:** ✅ Sudah ada
- **Fitur:** 5 opsi (A-E), satu jawaban benar
- **Kategori:** Semua kategori (TWK, TIU, TKP, TPA, PSIKOLOGIS)

### 2. Soal Bergambar (Image-Based Questions)
- **Status:** ✅ Sudah ada
- **Fitur:** Gambar untuk pertanyaan, opsi, dan pembahasan
- **Kategori:** Terutama TIU (spasial), TPA (spasial), TWK (sejarah/peta)

### 3. Soal Cerita (Passage-Based Questions)
- **Status:** ✅ Sudah ada
- **Fitur:** Satu cerita dengan banyak pertanyaan terkait
- **Kategori:** TWK (bacaan sejarah), TIU (bacaan logika), TPA (bacaan verbal), TKP (bacaan kepribadian)

## Jenis Soal yang Perlu Disiapkan

### 1. Soal Benar/Salah (True/False)
- **Urgensi:** Tinggi
- **Penggunaan:** TKP (psikologi), TWK (fakta sejarah)
- **Implementasi:**
  - Tambah kolom `tipe_soal` di tabel soal
  - Opsi: Benar/Salah
  - Jawaban: B (Benar) atau S (Salah)

### 2. Soal Isian Singkat (Short Answer)
- **Urgensi:** Sedang
- **Penggunaan:** TIU (matematika), TPA (bahasa)
- **Implementasi:**
  - Input text untuk jawaban
  - Validasi jawaban (case-insensitive)
  - Bisa multiple correct answers

### 3. Soal Matching (Menjodohkan)
- **Urgensi:** Sedang
- **Penggunaan:** TWK (tokoh-sejarah), TPA (sinonim-antonim)
- **Implementasi:**
  - Tabel soal_matching dengan pasangan
  - Drag and drop atau klik untuk menjodohkan
  - Skor per pasangan yang benar

### 4. Soal Essay/Uraian
- **Urgensi:** Rendah (untuk ujian tertulis, bukan CAT)
- **Penggunaan:** Ujian tertulis tradisional
- **Implementasi:**
  - Textarea untuk jawaban
  - Manual grading oleh admin
  - Feedback tertulis

### 5. Soal Audio (Listening)
- **Urgensi:** Sedang
- **Penggunaan:** TPA (listening comprehension), TOEFL
- **Implementasi:**
  - Upload file audio
  - Audio player di frontend
  - Soal berdasarkan audio

### 6. Soal Video
- **Urgensi:** Rendah
- **Penggunaan:** Video pembelajaran, case study
- **Implementasi:**
  - Upload file video
  - Video player di frontend
  - Soal berdasarkan video

### 7. Soal Drag and Drop
- **Urgensi:** Sedang
- **Penggunaan:** TIU (spasial), TKP (psikologi)
- **Implementasi:**
  - Elemen yang bisa di-drag
  - Drop zone
  - Validasi posisi

### 8. Soal Fill in the Blank (Isian Kosong)
- **Urgensi:** Sedang
- **Penggunaan:** TPA (bahasa), TWK (sejarah)
- **Implementasi:**
  - Teks dengan blank spaces
  - Dropdown atau input untuk tiap blank
  - Multiple correct answers

## Prioritas Implementasi

### Prioritas Tinggi (Segera)
1. **Soal Benar/Salah** - Mudah diimplementasikan, sering digunakan di TKP
2. **Soal Isian Singkat** - Untuk matematika dan bahasa

### Prioritas Sedang (Menengah)
3. **Soal Matching** - Untuk sinonim/antonim dan tokoh sejarah
4. **Soal Fill in the Blank** - Untuk bahasa dan sejarah
5. **Soal Audio** - Untuk listening comprehension

### Prioritas Rendah (Opsional)
6. **Soal Essay** - Manual grading, tidak cocok untuk CAT
7. **Soal Video** - File besar, bandwidth tinggi
8. **Soal Drag and Drop** - Kompleks, butuh UI khusus

## Database Schema yang Perlu Ditambahkan

### Tabel `tipe_soal`
```sql
CREATE TABLE tipe_soal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_tipe VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tipe_soal (nama_tipe, deskripsi) VALUES
('pilihan_ganda', 'Pilihan ganda dengan 5 opsi'),
('benar_salah', 'Pernyataan benar atau salah'),
('isian_singkat', 'Jawaban singkat/text'),
('matching', 'Menjodohkan dua kolom'),
('essay', 'Jawaban uraian panjang'),
('audio', 'Soal berbasis audio'),
('video', 'Soal berbasis video'),
('drag_drop', 'Drag and drop elements'),
('fill_blank', 'Isian kosong dalam teks');
```

### Update Tabel `soal`
```sql
ALTER TABLE soal ADD COLUMN tipe_soal_id INT DEFAULT 1;
ALTER TABLE soal ADD FOREIGN KEY (tipe_soal_id) REFERENCES tipe_soal(id);
```

### Tabel Tambahan untuk Tipe Soal Khusus

#### Untuk Matching
```sql
CREATE TABLE soal_matching (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soal_id INT NOT NULL,
    item_kiri VARCHAR(255) NOT NULL,
    item_kanan VARCHAR(255) NOT NULL,
    urutan INT NOT NULL,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
);
```

#### Untuk Fill in the Blank
```sql
CREATE TABLE soal_fill_blank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soal_id INT NOT NULL,
    posisi_blank INT NOT NULL,
    jawaban_benar VARCHAR(255) NOT NULL,
    alternatif_jawaban TEXT, -- JSON array of alternative answers
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
);
```

#### Untuk Audio/Video
```sql
ALTER TABLE soal ADD COLUMN file_audio VARCHAR(255);
ALTER TABLE soal ADD COLUMN file_video VARCHAR(255);
```

## Rekomendasi

Untuk fase pertama, fokus pada:
1. **Soal Benar/Salah** - Mudah, cepat, sering dipakai
2. **Soal Isian Singkat** - Untuk matematika dan bahasa
3. **Soal Fill in the Blank** - Untuk bahasa Indonesia

Ini sudah cukup untuk variasi soal dalam ujian CAT.
