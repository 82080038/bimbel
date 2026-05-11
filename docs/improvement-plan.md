# Improvement Plan Berdasarkan Riset Best Practices

## Ringkasan Riset

Berikut adalah hasil riset mendalam tentang best practices untuk fitur yang telah diimplementasikan:

---

## 1. Tombol Ragu-ragu (Doubtful Question Flag)

### Best Practices dari Riset:
- **Color-coded flagging system**: Gunakan warna berbeda untuk tipe flag berbeda (kuning untuk ragu, merah untuk skip, dll)
- **Should not affect scoring**: Flag hanya untuk navigasi, tidak mempengaruhi nilai
- **Quick filtering**: Allow filtering to show only flagged questions
- **Multiple flag types**: Review, unsure, skip, bookmark

### Improvement yang Dapat Diterapkan:
- [ ] Tambah tipe flag: "Ragu", "Skip", "Review"
- [ ] Warna berbeda untuk setiap tipe flag
- [ ] Filter cepat untuk melihat hanya soal yang diflag
- [ ] Summary flag di akhir ujian (berapa yang ragu, skip, dll)
- [ ] Auto-navigate ke flagged questions saat review

---

## 2. Sistem Ranking Peserta

### Best Practices dari Riset:
- **Micro-level vs macro-level**: Ranking per activity vs overall
- **Privacy options**: Opt-in/opt-out untuk leaderboard
- **Time-based rankings**: Daily, weekly, monthly, all-time
- **Percentiles**: Tampilkan persentil, bukan hanya rank
- **Demotivation prevention**: Hindari shaming bottom performers

### Improvement yang Dapat Diterapkan:
- [ ] Opt-in/opt-out untuk leaderboard
- [ ] Time-based ranking (mingguan, bulanan, all-time)
- [ ] Tampilkan persentil (top 10%, top 25%, dll)
- [ ] Anonymous mode untuk privacy
- [ ] Rank per kategori, bukan hanya total
- [ ] Progress chart per peserta

---

## 3. Sertifikat Digital

### Best Practices dari Riset:
- **Unique verification codes**: Setiap sertifikat punya kode unik
- **Digital signatures**: Tanda tangan digital untuk authenticity
- **QR codes**: Scan untuk verifikasi online
- **Standard formats**: PDF dengan metadata
- **Expiration dates**: Sertifikat dengan tanggal kadaluarsa
- **Shareable**: Mudah dibagikan via link/email

### Improvement yang Dapat Diterapkan:
- [ ] Generate unique verification code per sertifikat
- [ ] Tambah QR code untuk verifikasi online
- [ ] Database sertifikat untuk verifikasi
- [ ] Tambah metadata ke PDF (issued by, valid until)
- [ ] Option untuk share via link/email
- [ ] Watermark untuk security
- [ ] Download dalam format lain (PNG, SVG)

---

## 4. Paket Tryout (Test Bank Management)

### Best Practices dari Riset:
- **Blueprinting capability**: Pastikan coverage learning objectives
- **Version control**: Track versi soal
- **Item banking workflow**: Review workflow untuk kualitas
- **Content balancing**: Balance soal per kategori
- **Item exposure control**: Mencegah soal terlalu sering muncul

### Improvement yang Dapat Diterapkan:
- [ ] Blueprint paket (target per kategori)
- [ ] Version control untuk soal
- [ ] Review workflow (draft → review → approved)
- [ ] Content balancing validation sebelum publish
- [ ] Item exposure rate limit
- [ ] Paket template untuk cepat create
- [ ] Clone paket untuk variasi

---

## 5. Adaptive Difficulty (CAT)

### Best Practices dari Riset:
- **Item Response Theory (IRT)**: Algoritma lebih akurat untuk adaptive testing
- **Minimum/maximum exposure**: Batasi item exposure
- **Content balancing**: Balance soal per kategori
- **Ability estimation**: Estimasi ability peserta secara real-time
- **Uniform precision**: Memberikan skor yang presisi

### Improvement yang Dapat Diterapkan:
- [ ] Implementasi Item Response Theory (IRT)
- [ ] 3PL model (a, b, c parameters)
- [ ] Ability estimation dengan Bayesian methods
- [ ] Content balancing constraints
- [ ] Item exposure rate control
- [ ] Stopping rules (confidence threshold)
- [ ] Preview difficulty sebelum mulai

---

## 6. Tingkat Kesulitan Soal

### Best Practices dari Riset:
- **Bloom's Taxonomy**: 6 level cognitive (remember → create)
- **Multiple dimensions**: Cognitive, difficulty, time required
- **Calibration**: Kalibrasi menggunakan statistical methods
- **Regular re-calibration**: Update berdasarkan performance data
- **Expert review**: Validasi oleh subject matter expert

### Improvement yang Dapat Diterapkan:
- [ ] Mapping ke Bloom's Taxonomy
- [ ] Tambah dimensi: waktu rata-rata, cognitive level
- [ ] IRT parameters (a, b, c) untuk setiap soal
- [ ] Auto-calibration berdasarkan performance
- [ ] Expert review workflow
- [ ] Difficulty heatmap per kategori
- [ ] Tagging untuk learning objectives

---

## 7. AI Generator Soal

### Best Practices dari Riset:
- **LLM with fine-tuning**: Fine-tune untuk domain-specific
- **Human review**: Review oleh human sebelum publish
- **Plausible distractors**: Distractor yang masuk akal tapi jelas salah
- **Learning objectives alignment**: Sesuai dengan learning objectives
- **Template-based**: Gunakan template dengan variable substitution

### Improvement yang Dapat Diterapkan:
- [ ] Integrasi OpenAI/GPT API untuk generate soal
- [ ] Human review workflow sebelum publish
- [ ] Quality scoring untuk generated questions
- [ ] Generate dari learning materials (PDF, doc)
- [ ] Distractor generation dengan AI
- [ ] Bloom's taxonomy tagging otomatis
- [ ] Batch generate dengan quality filter

---

## 8. Sistem Tracking Frekuensi Soal

### Best Practices dari Riset:
- **Item Response Theory (IRT)**: Analisis psychometric
- **Discrimination parameter**: Seberapa well soal membedakan ability
- **Difficulty parameter**: Tingkat kesulitan statistik
- **Guessing parameter**: Probabilitas guess
- **Item quality assessment**: Identifikasi soal yang perlu revision

### Improvement yang Dapat Diterapkan:
- [ ] Implementasi IRT analysis (a, b, c parameters)
- [ ] Discrimination index per soal
- [ Point-biserial correlation
- [ ] Item characteristic curves (ICC)
- [ ] Automated item quality assessment
- [ ] Flag soal dengan poor discrimination
- [ ] Recommend soal untuk removal

---

## Prioritas Implementasi

### HIGH PRIORITY (Immediate):
1. **Sertifikat Digital Improvements**:
   - QR code verification
   - Unique verification code
   - Database sertifikat

2. **Sistem Ranking Improvements**:
   - Opt-in/opt-out
   - Time-based ranking
   - Percentiles

3. **Paket Tryout Improvements**:
   - Blueprint validation
   - Content balancing
   - Item exposure control

### MEDIUM PRIORITY (Next Sprint):
4. **Tombol Ragu-ragu Improvements**:
   - Multiple flag types
   - Color-coded flags
   - Quick filtering

5. **Tracking Frekuensi Improvements**:
   - IRT parameters
   - Discrimination index
   - Item quality assessment

### LOW PRIORITY (Future):
6. **Adaptive Difficulty CAT**:
   - Full IRT implementation
   - Ability estimation
   - Stopping rules

7. **AI Generator Advanced**:
   - LLM integration
   - Human review workflow
   - Quality scoring

8. **Tingkat Kesulitan Advanced**:
   - Bloom's taxonomy mapping
   - Multi-dimensional difficulty
   - Expert review

---

## Catatan Teknis

### Database Schema Updates Needed:
- `sertifikat`: id, user_id, verification_code, qr_code, issued_at, expires_at
- `soal_irt`: soal_id, a_param, b_param, c_param, discrimination
- `soal_version`: soal_id, version, content, created_by, status
- `paket_blueprint`: paket_id, kategori_id, target_count, min_difficulty, max_difficulty
- `leaderboard_optout`: user_id, opted_out_at

### API Endpoints Needed:
- `/api/certificate/verify` - Verifikasi sertifikat
- `/api/certificate/generate` - Generate sertifikat
- `/api/irt/analyze` - IRT analysis
- `/api/ranking/optout` - Opt-out leaderboard
- `/api/paket/validate_blueprint` - Validate paket blueprint

### Frontend Components Needed:
- Certificate verification page
- Leaderboard settings (opt-in/opt-out)
- Paket blueprint editor
- IRT analysis dashboard
- Flag management UI

---

## References

1. Examity Flag System - https://www.examity.com/features/flag-system/
2. Leaderboard Design Principles - https://pmc.ncbi.nlm.nih.gov/articles/PMC8097522/
3. Digital Certificate Best Practices - https://www.verifyed.io/blog/automatic-certificate
4. Computer Adaptive Testing - https://assess.com/computerized-adaptive-testing/
5. Bloom's Taxonomy Questions - https://tophat.com/blog/blooms-taxonomy-question-stems/
6. AI Question Generator - https://quizbot.ai/
7. Item Banking Platform - https://assess.com/item-banking/
8. Item Response Theory - https://en.wikipedia.org/wiki/Item_response_theory
