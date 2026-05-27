# Analisis Tabel Soal dan Bahan Pelajaran
## 26 Mei 2026

### Ringkasan Eksekutif
- **Total Soal:** 2,867 pertanyaan
- **Kategori:** 5 (TWK, TIU, TKP, TPA, PSIKOLOGIS)
- **Learning Materials:** 5 kategori JSON komprehensif di `data/learning_materials`
- **Status:** ✅ SELESAI - Struktur database telah disederhanakan

---

### Analisis Struktur Database

#### Tabel Soal
**Total:** 2,867 soal

**Distribusi materi_id (Setelah Update):**
| materi_id | Kategori | Jumlah Soal | Persentase |
|-----------|----------|-------------|------------|
| 1 | TWK | 528 | 18.4% |
| 2 | TIU | 1,466 | 51.1% |
| 3 | TKP | 567 | 19.8% |
| 4 | TPA | 2 | 0.1% |
| 5 | PSIKOLOGIS | 7 | 0.2% |
| NULL | - | 297 | 10.4% |

**Distribusi Sebelum Update:**
- 120 materi_id berbeda (1-120)
- Hanya materi_id 1-5 yang sesuai dengan kategori_soal
- materi_id 6-120 tidak memiliki mapping ke kategori_soal

---

### Learning Materials

#### File di `data/learning_materials/`
1. **comprehensive_materials_summary.json** - Ringkasan semua kategori
2. **twk_comprehensive.json** - Materi TWK lengkap
3. **tiu_comprehensive.json** - Materi TIU lengkap
4. **tkp_comprehensive.json** - Materi TKP lengkap
5. **tpa_comprehensive.json** - Materi TPA lengkap
6. **psikologis_comprehensive.json** - Materi Psikologis lengkap
7. **topics/** - 65 file topik spesifik

#### Struktur Kategori dalam Learning Materials
- **TWK:** Nasionalisme, Integritas, Pilar Negara, Pancasila, Sejarah, Bhinneka Tunggal Ika, Demokrasi, dll.
- **TIU:** Verbal, Numerik, Deret Gambar, Teori Bilangan, Logika
- **TKP:** Sikap Kerja, Perilaku Sosial, Kepemimpinan, Integritas Moral
- **TPA:** Matematika Dasar, Bahasa Indonesia, Bahasa Inggris, Sains
- **PSIKOLOGIS:** IQ, Logika Aritmatika, Analog Verbal, Wartegg, Spasial, dll.

---

### Kesesuaian Kategori, Topik, dan Materi

#### Analisis materi_id dalam Tabel Soal

**materi_id = 25 (1,176 soal)**
- Analisis: Soal-soal logika dan analogi
- Kategori: TIU
- Action: Update ke materi_id = 2 (TIU)

**materi_id = 49 (481 soal)**
- Analisis: Soal sikap kerja dan perilaku sosial
- Kategori: TKP
- Action: Update ke materi_id = 3 (TKP)

**materi_id = 65 (78 soal)**
- Analisis: Soal verbal dan numerik
- Kategori: TIU
- Action: Update ke materi_id = 2 (TIU)

**materi_id = 97 (60 soal)**
- Analisis: Soal perilaku sosial
- Kategori: TKP
- Action: Update ke materi_id = 3 (TKP)

**materi_id lainnya (6-120)**
- Analisis: Bervariasi, tidak memiliki mapping ke kategori_soal
- Action: Set ke NULL untuk review manual

---

### Tabel yang Dihapus

#### Tabel Redundan (Sudah Dihapus)
1. **bahan_pelajaran** (6,205 records)
   - Alasan: Hanya 5 records dengan konten valid (link ke JSON files)
   - Learning materials sudah tersedia di `data/learning_materials/`
   - Tidak perlu duplikasi di database

2. **materi_pelajaran** (0 records)
   - Alasan: Tabel kosong, tidak digunakan
   - Struktur tidak sesuai dengan kebutuhan

3. **course_materials** (0 records)
   - Alasan: Tabel kosong, tidak digunakan
   - Sistem course tidak aktif

4. **soal_materi_mapping** (0 records)
   - Alasan: Tabel kosong, tidak digunakan
   - Mapping sudah ada di materi_id di tabel soal

5. **user_material_progress** (0 records)
   - Alasan: Tabel kosong, tidak digunakan
   - Sistem tracking progress tidak aktif

6. **v_bahan_pelajaran_lengkap** (View)
   - Alasan: View untuk tabel yang sudah dihapus

---

### Update yang Dilakukan

#### Update materi_id di Tabel Soal
```sql
-- materi_id 25 (TIU - Logika/Analogi) -> 2 (TIU)
UPDATE soal SET materi_id = 2 WHERE materi_id = 25;

-- materi_id 49 (TKP - Sikap Kerja) -> 3 (TKP)
UPDATE soal SET materi_id = 3 WHERE materi_id = 49;

-- materi_id 65 (TIU - Verbal/Numerik) -> 2 (TIU)
UPDATE soal SET materi_id = 2 WHERE materi_id = 65;

-- materi_id 97 (TKP - Perilaku Sosial) -> 3 (TKP)
UPDATE soal SET materi_id = 3 WHERE materi_id = 97;

-- materi_id 81, 73, 89, 33, 34, 26 (TIU) -> 2 (TIU)
UPDATE soal SET materi_id = 2 WHERE materi_id IN (81, 73, 89, 33, 34, 26);

-- materi_id 41, 113 (TKP) -> 3 (TKP)
UPDATE soal SET materi_id = 3 WHERE materi_id IN (41, 113);

-- Set remaining high materi_id values to NULL for manual review
UPDATE soal SET materi_id = NULL WHERE materi_id > 5 AND materi_id NOT IN (25, 49, 65, 97, 81, 73, 89, 33, 34, 26, 41, 113);
```

---

### Hasil Akhir

#### Distribusi Soal Setelah Update
| Kategori | materi_id | Jumlah Soal | Persentase |
|----------|-----------|-------------|------------|
| TWK | 1 | 528 | 18.4% |
| TIU | 2 | 1,466 | 51.1% |
| TKP | 3 | 567 | 19.8% |
| TPA | 4 | 2 | 0.1% |
| PSIKOLOGIS | 5 | 7 | 0.2% |
| Unmapped | NULL | 297 | 10.4% |

#### Tabel yang Tersisa
- **soal** - Tabel utama soal (2,867 records)
- **kategori_soal** - Definisi kategori (5 records)
- **learning_topics** - Topik pembelajaran (7 records)
- **topics** - Topik tambahan
- **passages** - Reading passages

#### Learning Materials
- Tetap di `data/learning_materials/` (JSON files)
- 5 kategori komprehensif
- 65 topik spesifik
- Terintegrasi dengan aplikasi melalui API

---

### Rekomendasi

#### Immediate (Selesai)
- ✅ Update materi_id untuk mapping ke kategori_soal
- ✅ Hapus tabel bahan_pelajaran (redundan)
- ✅ Hapus tabel materi_pelajaran (kosong)
- ✅ Hapus tabel course_materials (kosong)
- ✅ Hapus tabel soal_materi_mapping (kosong)
- ✅ Hapus tabel user_material_progress (kosong)
- ✅ Hapus view v_bahan_pelajaran_lengkap

#### Future
1. **Review 297 soal dengan materi_id NULL**
   - Analisis konten soal
   - Assign ke kategori yang sesuai
   - Update materi_id

2. **Tambah soal TPA dan PSIKOLOGIS**
   - TPA: Hanya 2 soal (0.1%)
   - PSIKOLOGIS: Hanya 7 soal (0.2%)
   - Target: Minimum 100 soal per kategori

3. **Optimasi learning_topics**
   - Hanya 7 topik terdefinisi
   - Tambah topik sesuai learning materials
   - Mapping ke materi_id

---

### Kesimpulan

Struktur database telah disederhanakan dengan menghapus tabel-tabel yang tidak digunakan atau redundant. Learning materials tetap tersedia dalam format JSON di `data/learning_materials/` dan dapat diakses melalui API. 

Mapping materi_id di tabel soal telah diperbaiki untuk mencocokkan dengan kategori_soal. Sebanyak 297 soal (10.4%) masih memiliki materi_id NULL dan memerlukan review manual untuk assignment kategori yang tepat.

**Status:** ✅ SELESAI
