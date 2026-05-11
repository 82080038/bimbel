# Database Analysis & Normalization Plan
## Database: ujian_sekolah_kedinasan

### Current Tables (22 tables, 4 views)

**Core Tables:**
- users - User authentication & authorization
- sesi_ujian - Exam sessions with CAT support
- soal - Questions with IRT parameters
- hasil_ujian - Exam results
- kategori_soal - Question categories
- paket_tryout - Test packages
- paket_blueprint - Package blueprints for validation

**Learning & Analysis:**
- analisis_kelemahan - Weakness analysis by category
- bahan_pelajaran - Learning materials
- rekomendasi_belajar - Study recommendations
- topik_pelajaran - Learning topics
- soal_topik - Question-topic mapping
- soal_frequency - Question frequency tracking
- tips_tricks - Tips & tricks for solving questions
- tips_soal - Tips-question mapping
- tips_umum - General tips (denormalized)

**Advanced Features:**
- sertifikat - Certificate management with verification
- leaderboard_optout - Leaderboard opt-out settings

**Views:**
- v_analisis_kelemahan_lengkap
- v_bahan_pelajaran_lengkap
- v_rekomendasi_belajar
- v_soal_statistics

---

## Normalization Issues Identified

### 1. **Redundant Data - nama_peserta** (HIGH PRIORITY)
**Issue:** `nama_peserta` stored in both `sesi_ujian` and `hasil_ujian` tables
**Impact:** Data redundancy, potential inconsistency
**Solution:** 
- Add `user_id` foreign key to both tables
- Remove `nama_peserta` from both tables
- Get nama_peserta via JOIN with users table

### 2. **Missing Foreign Key Constraints** (HIGH PRIORITY)
**Issue:** Several tables have `user_id` without proper FK constraint to `users`
**Tables affected:**
- analisis_kelemahan.user_id
- rekomendasi_belajar.user_id
- sertifikat.user_id
- leaderboard_optout.user_id

**Solution:** Add proper foreign key constraints with ON DELETE CASCADE

### 3. **Denormalized kategori in tips_umum** (MEDIUM PRIORITY)
**Issue:** `tips_umum.kategori` is VARCHAR instead of foreign key to `kategori_soal`
**Impact:** Cannot enforce referential integrity, potential typos
**Solution:** 
- Add `kategori_id` INT foreign key to `kategori_soal`
- Migrate existing data
- Remove `kategori` VARCHAR column

### 4. **Inconsistent Column Naming** (LOW PRIORITY)
**Issue:** 
- `leaderboard_optout` uses `user_id` but should reference `users` by `nama_peserta` or actual user_id
- `sertifikat` has both `user_id` and `nama_peserta` - redundant

**Solution:** Standardize to use `user_id` consistently

### 5. **JSON Storage in jawaban_peserta** (ACCEPTABLE)
**Issue:** `hasil_ujian.jawaban_peserta` stores JSON as TEXT
**Impact:** Cannot query individual answers easily
**Note:** This is acceptable for this use case, but could be normalized to `jawaban_user` table

### 6. **Missing Indexes** (MEDIUM PRIORITY)
**Issue:** Some frequently queried columns lack indexes
**Recommendations:**
- Add index on `hasil_ujian.tanggal_ujian`
- Add index on `soal.kategori_id` (already exists)
- Add index on `sesi_ujian.status`
- Add composite index on `soal_frequency.soal_id, last_seen`

### 7. **Data Type Inconsistencies** (LOW PRIORITY)
**Issue:** Some columns use INT while others use INT(11)
**Impact:** Minor, inconsistent across tables
**Solution:** Standardize to INT (MySQL default)

---

## Normalization Plan

### Phase 1: Critical Foreign Key Fixes
1. Add `user_id` to `sesi_ujian` and `hasil_ujian`
2. Add FK constraints for all user_id columns
3. Remove redundant `nama_peserta` columns

### Phase 2: Category Normalization
1. Add `kategori_id` to `tips_umum`
2. Migrate data from `kategori` VARCHAR to `kategori_id`
3. Remove `kategori` VARCHAR column

### Phase 3: Index Optimization
1. Add performance indexes
2. Add composite indexes for common queries

### Phase 4: Data Type Standardization
1. Standardize INT to INT(11) where needed
2. Ensure consistent VARCHAR lengths

---

## Proposed Schema Changes

### New Tables Needed (Optional for Full Normalization)

```sql
-- Optional: Separate table for user answers (full normalization)
CREATE TABLE jawaban_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesi_id INT NOT NULL,
    soal_id INT NOT NULL,
    jawaban CHAR(1),
    waktu_jawab INT,
    ragu TINYINT(1) DEFAULT 0,
    flag_type ENUM('ragu','skip','review','bookmark') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sesi_id) REFERENCES sesi_ujian(id) ON DELETE CASCADE,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE,
    UNIQUE KEY (sesi_id, soal_id)
);
```

### Schema Modifications

```sql
-- Phase 1: Add user_id and FK constraints
ALTER TABLE sesi_ujian ADD COLUMN user_id INT;
ALTER TABLE sesi_ujian ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE hasil_ujian ADD COLUMN user_id INT;
ALTER TABLE hasil_ujian ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE analisis_kelemahan ADD CONSTRAINT fk_analisis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE rekomendasi_belajar ADD CONSTRAINT fk_rekomendasi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE sertifikat ADD CONSTRAINT fk_sertifikat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE leaderboard_optout ADD CONSTRAINT fk_leaderboard_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Phase 1: Remove redundant nama_peserta (after migration)
-- First migrate data: UPDATE sesi_ujian SET user_id = (SELECT id FROM users WHERE username = nama_peserta);
-- Then: ALTER TABLE sesi_ujian DROP COLUMN nama_peserta;
-- Same for hasil_ujian

-- Phase 2: Normalize tips_umum
ALTER TABLE tips_umum ADD COLUMN kategori_id INT;
ALTER TABLE tips_umum ADD FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id);
-- Migrate data then drop kategori VARCHAR

-- Phase 3: Add indexes
CREATE INDEX idx_hasil_tanggal ON hasil_ujian(tanggal_ujian);
CREATE INDEX idx_sesi_status ON sesi_ujian(status);
CREATE INDEX idx_soal_freq_seen ON soal_frequency(soal_id, last_seen);
```

---

## Integration Requirements

### Middleware (API) Updates Needed:
1. Update all queries to use `user_id` instead of `nama_peserta`
2. Update JOIN statements to include users table
3. Update response structures to include user data
4. Update CAT functions to use user_id

### Frontend Updates Needed:
1. Update localStorage to store user_id instead of just nama_peserta
2. Update API calls to send user_id
3. Update display logic to get nama_peserta from user object
4. Update certificate generation to use user_id

---

## Data Migration Steps

1. **Backup database**
2. **Add new columns** (user_id, kategori_id)
3. **Migrate data** from old columns to new
4. **Add foreign key constraints**
5. **Update application code** (middleware & FE)
6. **Test thoroughly**
7. **Remove old columns** (after verification)
8. **Update views** to reflect new schema
