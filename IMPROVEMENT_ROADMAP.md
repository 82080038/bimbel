
# Roadmap Perbaikan dan Kelengkapan Aplikasi

Berdasarkan penelitian internet tentang best practices untuk Exam Management System, Learning Management System, dan PWA.

---

## 🔴 Prioritas Tinggi

### 1. Course Management & Learning Paths
- [x] Struktur kursus hierarkis (modul → materi → soal)
- [x] Learning path terstruktur berdasarkan hasil ujian
- [x] Progress tracking per kursus
- [x] Prerequisite courses (kursus harus diselesaikan sebelum lanjut)
- [x] Course categorization dan tagging

### 2. Gamification Lengkap
- [x] Badges/achievements (lulus ujian pertama, streak belajar, dll)
- [x] XP/points system untuk aktivitas belajar
- [x] Level system berdasarkan XP
- [x] Daily challenges dan missions
- [x] Streak counter untuk motivasi
- [x] Achievement showcase di profil

### 3. Sistem Notifikasi
- [x] Email notifications (pengingat ujian, hasil ujian, sertifikat)
- [x] In-app notifications (push notifications untuk PWA)
- [x] SMS notifications (opsional untuk pengingat penting)
- [x] Reminder otomatis sebelum ujian
- [x] Notification preferences per user
- [x] Notification history

### 4. Social Learning Features
- [ ] Discussion forum per topik/materi
- [ ] Peer-to-peer Q&A
- [ ] Study groups
- [ ] Share results (opsional)
- [ ] Comment system pada materi
- [ ] Upvote/downvote untuk jawaban forum
- [ ] @mention system

### 5. Advanced Proctoring
- [ ] AI-powered proctoring (deteksi wajah, deteksi objek asing)
- [ ] Browser lockdown (prevent tab switching, copy-paste)
- [ ] Webcam proctoring (opsional untuk ujian high-stakes)
- [ ] Audio monitoring (deteksi background noise/suara asing)
- [ ] Session recording untuk review
- [ ] Suspicious activity flagging
- [ ] Proctoring settings per exam

---

## 🟡 Prioritas Sedang

### 6. PWA Enhancement
- [ ] Custom offline page (bukan default browser)
- [ ] Offline caching untuk materi dan soal
- [ ] Background sync untuk jawaban saat offline
- [ ] Install prompt yang lebih baik
- [ ] App shortcuts dan share targets
- [ ] Push notification support
- [ ] Service worker optimization

### 7. Certification & Compliance Tracking
- [ ] Sertifikat digital dengan QR code verification
- [ ] Compliance tracking untuk materi wajib
- [ ] Expiration date untuk sertifikat
- [ ] Renewal reminders
- [ ] Badge system untuk kompetensi tertentu
- [ ] Certificate templates customization
- [ ] Digital signature support

### 8. Mobile Responsiveness
- [x] Touch-friendly UI (button sizes, gestures)
- [x] Mobile-first navigation (bottom navigation bar)
- [x] Swipe gestures untuk navigasi soal
- [x] Portrait mode optimization
- [x] Keyboard handling untuk mobile
- [x] Hamburger menu untuk mobile
- [x] Responsive table views

### 9. Integration Capabilities
- [ ] LMS lain (Moodle, Canvas) via LTI
- [ ] Payment gateway untuk kursus berbayar
- [ ] Calendar apps (Google Calendar, Outlook)
- [ ] Single Sign-On (SSO) dengan Google, Microsoft
- [ ] HRIS systems untuk corporate training
- [ ] Webhook support untuk integrasi custom
- [ ] API documentation

### 10. Accessibility (A11y)
- [x] WCAG 2.1 AA compliance
- [x] Screen reader support
- [x] Keyboard navigation lengkap
- [x] High contrast mode
- [x] Text-to-speech untuk soal
- [x] Font size adjustment
- [x] ARIA labels dan roles
- [x] Focus indicators

---

## 🟢 Prioritas Rendah

### 11. Performance Optimization
- [x] Lazy loading untuk gambar dan konten
- [ ] Code splitting untuk JavaScript
- [ ] CDN untuk static assets
- [ ] Database query optimization
- [ ] Caching layer (Redis/Memcached)
- [ ] Image compression dan optimization
- [x] Minification CSS/JS

### 12. Advanced Analytics
- [x] Heatmap untuk jawaban peserta
- [ ] A/B testing untuk UI
- [x] Funnel analysis untuk drop-off points
- [x] Predictive analytics untuk performa siswa
- [ ] Custom report builder
- [ ] Real-time analytics dashboard
- [x] Export analytics data (CSV, PDF, Excel)

### 13. Content Management
- [ ] Rich text editor untuk materi
- [ ] Media library management
- [x] Version control untuk materi
- [ ] Content approval workflow
- [ ] Bulk content operations
- [ ] Content scheduling

### 14. Internationalization
- [x] Localized date/time formats
- [x] Translation management system
- [ ] Language detection otomatis
- [ ] Language-specific content
- [ ] RTL (Right-to-Left) support
- [ ] Currency localization

### 15. Advanced Question Types
- [x] Pilihan ganda (5 opsi A-E) - Sudah ada
- [x] Soal bergambar (image-based) - Sudah ada
- [x] Soal cerita (passage-based) - Sudah ada
- [ ] Soal benar/salah (True/False) - Prioritas Tinggi
- [ ] Soal isian singkat (Short Answer) - Prioritas Tinggi
- [ ] Soal matching (Menjodohkan) - Prioritas Sedang
- [ ] Soal fill in the blank (Isian kosong) - Prioritas Sedang
- [ ] Soal audio (Listening) - Prioritas Sedang
- [ ] Drag and drop ordering - Prioritas Rendah
- [ ] Hotspot questions - Prioritas Rendah
- [ ] File upload answers - Prioritas Rendah
- [ ] Audio recording answers - Prioritas Rendah
- [ ] Essay questions with AI grading - Prioritas Rendah
- [ ] Case study questions - Prioritas Rendah
- [ ] Soal video - Prioritas Rendah

**Database Schema yang Diperlukan:**
- Tabel `tipe_soal` untuk mengelola tipe soal
- Update tabel `soal` dengan kolom `tipe_soal_id`
- Tabel `soal_matching` untuk soal menjodohkan
- Tabel `soal_fill_blank` untuk soal isian kosong
- Kolom `file_audio` dan `file_video` di tabel `soal`

**Rekomendasi Implementasi:**
- Fase 1: Soal benar/salah dan isian singkat (mudah, cepat)
- Fase 2: Soal matching dan fill in the blank (untuk variasi)
- Fase 3: Soal audio (untuk listening comprehension)
- Fase 4: Tipe soal kompleks (essay, video, drag-drop)

**Lihat detail lengkap:** `QUESTION_TYPES_ANALYSIS.md`

---

## 📊 Status Implementasi

### Fase 1 (Sudah Selesai ✅)
- [x] Sistem notifikasi in-app
- [x] Gamification badges & achievements & XP
- [x] Course management & learning paths
- [x] Bookmarks soal (tabel `answer_heatmap`, kolom bookmark di DB)
- [x] Passages / soal cerita (tabel `passages`)
- [x] Exam types (tabel `exam_types`)
- [x] Sertifikat (tabel `sertifikat`, halaman `sertifikat-print.html`)
- [x] Expert system / AI recommendation
- [x] Analytics & funnel analysis

### Fase 2 (Dalam Progress / Prioritas Tinggi)
- [ ] Anti-cheat saat ujian (browser lockdown, tab switching detection)
- [ ] Mode latihan terpisah dari ujian resmi
- [ ] Rate limiter aktif di login (`api/auth.php`)
- [ ] Import soal dari Excel/CSV
- [ ] Verifikasi OTP saat registrasi

### Fase 3 (Backlog)
- [ ] Forum diskusi / tanya jawab peserta
- [ ] Pembayaran / paket premium (Midtrans/Xendit)
- [ ] Countdown jadwal ujian resmi (CPNS, IPDN, UTBK)
- [ ] CAT (Adaptive Testing) aktif di frontend
- [ ] SSO Google / Microsoft

---

## 📝 Catatan

- **Status saat ini (29 Mei 2026)**: 68 tabel DB aktif, 2.867 soal, fitur inti (ujian, gamification, notifikasi, course, expert system, sertifikat, analytics) sudah live
- **Prioritas sekarang**: Anti-cheat, mode latihan, rate limiter login — effort rendah, impact tinggi
- **Testing**: Playwright tersedia di `tests/`, jalankan dengan `npx playwright test`
- **Git**: Push ke `main` branch di `https://github.com/82080038/bimbel.git`

---

## 🚀 Rencana Selanjutnya — Hasil Analisis Gap Lapangan (24 Mei 2026)

> Berdasarkan analisis mendalam kode sumber vs praktik nyata bimbel kedinasan di lapangan.

---

### ⚡ Prioritas 1 — Effort Rendah, Impact Tinggi (Target: 1–3 hari per item)

#### A. Anti-Cheat Dasar saat Ujian
- [ ] Deteksi pindah tab / minimize browser (`visibilitychange` event) → peringatan + catat log
- [ ] Paksa mode fullscreen saat ujian berjalan (`requestFullscreen`)
- [ ] Disable klik kanan (`contextmenu`) dan copy-paste (`copy`, `paste` event) selama ujian
- [ ] Hitung jumlah pelanggaran → auto-submit jika melebihi batas
- [ ] Tampilkan peringatan kepada peserta sebelum ujian dimulai
- **File target**: `participant/js/ujian.js`, `participant/sections/ujian-content.html`

#### B. Mode Latihan Berbeda dari Ujian Resmi
- [ ] Fungsi `mulaiLatihan()` saat ini identik dengan ujian — pisahkan logikanya
- [ ] Mode latihan: pembahasan muncul langsung setelah jawab tiap soal
- [ ] Mode latihan: tanpa timer, bisa ulangi soal
- [ ] Mode latihan: tidak tercatat di `hasil_ujian` (rekam di tabel terpisah atau flag `is_latihan`)
- **File target**: `participant/js/ujian.js`

#### C. Hubungkan Rate Limiter ke Login
- [ ] `api/rate_limiter.php` sudah ada tapi tidak dipakai di `api/auth.php`
- [ ] Tambahkan `require_once 'rate_limiter.php'` dan panggil check di action `login`
- [ ] Blokir sementara IP setelah 5x gagal login
- **File target**: `api/auth.php`

#### D. Bookmark / Favorit Soal
- [ ] Tambah kolom `is_bookmarked TINYINT(1) DEFAULT 0` di tabel `jawaban_user`
- [ ] Tombol bookmark di tiap soal saat ujian / latihan
- [ ] Halaman "Soal Favorit" di dashboard peserta
- **File target**: `participant/js/ujian.js`, `api/soal.php`, `participant/sections/dashboard-content.html`

---

### 🗓️ Prioritas 2 — Effort Sedang (Target: 3–7 hari per item)

#### E. Countdown Jadwal Ujian Resmi
- [ ] Tabel `jadwal_ujian` (nama, tanggal, link pendaftaran, instansi)
- [ ] Widget countdown di dashboard peserta menuju ujian terdekat (CPNS, IPDN, UTBK, dll.)
- [ ] Admin bisa tambah/edit jadwal ujian dari panel
- **File target**: `admin/sections/`, `participant/sections/dashboard-content.html`, `api/soal.php`

#### F. Sertifikat Digital — Template Printable
- [ ] Halaman HTML template sertifikat yang bisa di-print / export PDF (via `window.print()` atau `jsPDF`)
- [ ] QR code mandiri (generate dari server, bukan api.qrserver.com eksternal)
- [ ] Peserta bisa akses & unduh sertifikat sendiri dari dashboard
- [ ] Halaman verifikasi publik: `verify.php?code=XXXX`
- **File target**: `participant/sections/`, `api/soal.php`

#### G. Verifikasi OTP Registrasi
- [ ] Kirim OTP ke nomor HP via WhatsApp API (Fonnte/WA Gateway) atau SMS
- [ ] Tambah kolom `is_verified`, `otp_code`, `otp_expired_at` di tabel `users`
- [ ] Flow: register → kirim OTP → input OTP → aktif
- **File target**: `api/auth.php`, `participant/js/register.js`

#### H. Import Soal dari Excel/CSV
- [ ] Install `PHPSpreadsheet` via Composer atau include manual
- [ ] Script `api/import_soal.php` untuk parse file `.xlsx` / `.csv`
- [ ] Upload field di admin panel section `soal`
- [ ] Template Excel contoh untuk admin
- **File target**: `admin/sections/soal.html`, `api/` (file baru)

---

### 🏗️ Prioritas 3 — Effort Tinggi (Target: 1–3 minggu)

#### I. Forum Diskusi / Tanya Jawab
- [ ] Tabel `forum_thread` (judul, topik, user, tanggal), `forum_reply` (thread_id, user, isi, upvote)
- [ ] Halaman forum di dashboard peserta (per kategori soal / materi)
- [ ] Peserta bisa tanya, jawab, dan upvote
- [ ] Admin/mentor bisa tandai jawaban sebagai "terbaik"
- **File target**: `participant/` (halaman baru), `api/` (file baru)

#### J. Sistem Pembayaran / Paket Premium
- [ ] Tambah kolom `harga`, `is_premium` di tabel `paket_tryout`
- [ ] Integrasi Midtrans atau Xendit untuk payment
- [ ] Tabel `transaksi` (user, paket, nominal, status, tanggal)
- [ ] Halaman checkout & riwayat transaksi peserta
- [ ] Admin bisa set paket gratis / berbayar
- **File target**: `api/` (file baru), `participant/`, `admin/sections/`

#### K. Adaptive Testing (CAT) Aktif di Frontend
- [ ] Backend IRT sudah ada (`calculateIRT`, `enableCAT` di `api/soal.php`)
- [ ] Tambah toggle "Mode CAT" di admin per paket (`paket_tryout.is_cat = 1`)
- [ ] `ujian.js` deteksi mode CAT → fetch soal satu per satu adaptif via `get_cat_question`
- [ ] Tampilkan estimasi kemampuan (`theta`) di hasil ujian CAT
- **File target**: `participant/js/ujian.js`, `admin/sections/exam-packages.html`

---

### 📊 Ringkasan Status (Update 29 Mei 2026)

| Kategori | Status |
|----------|--------|
| Core exam system (ujian, timer, auto-save) | ✅ Selesai |
| Gamification (XP, badges, streak) | ✅ Selesai |
| Notifikasi in-app | ✅ Selesai |
| RBAC & autentikasi | ✅ Selesai |
| Course management & learning paths | ✅ Selesai |
| Expert system / AI recommendation | ✅ Selesai |
| Analytics & heatmap | ✅ Selesai |
| Passages / soal cerita | ✅ Selesai |
| Exam types | ✅ Selesai |
| Sertifikat digital | ✅ Selesai (tabel + halaman print) |
| IRT / CAT backend | ✅ Selesai (belum terhubung ke frontend) |
| Anti-cheat ujian | ❌ Belum |
| Mode latihan terpisah | ❌ Belum |
| OTP verifikasi registrasi | ❌ Belum |
| Import Excel soal | ❌ Belum |
| Forum diskusi | ❌ Belum |
| Pembayaran / paket premium | ❌ Belum |
| Countdown jadwal ujian | ❌ Belum |
| Rate limiter aktif di login | ❌ Belum (file ada, belum dipakai di auth.php) |

---

**Last Updated**: 29 Mei 2026  
**Version**: 1.3
