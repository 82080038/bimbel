# Sistem Ujian Sekolah Kedinasan - Overview

## Arsitektur Sistem

Sistem telah dikembangkan menjadi platform ujian modern dengan:
- **RBAC (Role-Based Access Control)**
- **Dashboard Komprehensif**
- **AI Integration**
- **Analytics & Reporting**

---

## Alur Sistem

### 1. Entry Point (http://localhost/bimbel/)

```
┌─────────────────────────────────────────┐
│           index.php                     │
│  ├─ Cek Session/Auth                   │
│  ├─ Jika tidak login → login.html       │
│  └─ Jika login → Periksa Role           │
└─────────────────┬───────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        ↓                   ↓
┌───────────────┐   ┌───────────────┐
│  role=admin   │   │  role=user     │
│      ↓        │   │      ↓        │
│  admin.html   │   │ dashboard.html│
│(Admin Panel)  │   │(User Dashboard│
└───────────────┘   └───────────────┘
```

### 2. User Flow (Peserta)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Akses http://localhost/bimbel/                       │
│    └─ Redirect ke login.html (jika belum login)         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Login/Register                                       │
│    ├─ login.html → Autentikasi                          │
│    └─ register.html → Registrasi peserta baru          │
│        (Data: Nama, HP, Jenis Kelamin, Tahun, Sekolah)  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Dashboard Peserta (dashboard.html)                   │
│    ├─ Statistik ujian                                  │
│    ├─ Info ujian terakhir                              │
│    ├─ Analisis kelemahan                               │
│    ├─ Bahan ajar                                       │
│    ├─ Penilaian AI                                     │
│    └─ Mulai ujian baru                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Ujian (index.html)                                   │
│    ├─ Pilih paket ujian                                │
│    ├─ Kerjakan soal                                    │
│    ├─ Auto-save progress                               │
│    └─ Submit & lihat hasil                             │
└─────────────────────────────────────────────────────────┘
```

---

## Fitur Dashboard Peserta

### 1. 📊 Statistik Overview
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Total Ujian │ │Rata-rata    │ │ Jam Belajar │ │  Peringkat  │
│     12      │ │   85.5      │ │   24.5      │ │    #15      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### 2. 📝 Info Ujian Terakhir
- Tanggal ujian
- Skor & persentase
n- Jumlah benar/salah
- Waktu pengerjaan
- Trend improvement

### 3. 📈 Progress Chart
- Visualisasi progress mingguan/bulanan
- Perbandingan dengan rata-rata
- Multiple kategori (TWK, TIU, TKP)

### 4. ⚠️ Analisis Kelemahan
```
┌─────────────────────────────────────────────────────┐
│ 🔴 TWK - Sejarah Indonesia                         │
│    Akurasi 65% - Butuh peningkatan                 │
│    [Pelajari Sekarang]                             │
├─────────────────────────────────────────────────────┤
│ 🟡 TIU - Logika Matematika                         │
│    Akurasi 70% - Latihan lebih banyak              │
│    [Pelajari Sekarang]                             │
└─────────────────────────────────────────────────────┘
```

### 5. 📚 Bahan Ajar
- Dokumen PDF (modul lengkap)
- Video tutorial
- Bank soal dengan rating
- Meta informasi (halaman, durasi, views)

### 6. 🤖 Penilaian AI
```
┌─────────────────────────────────────────────────────┐
│ 🤖 AI Assessment                                    │
│                                                      │
│ "Berdasarkan analisis, fokus pada TWK - Sejarah    │
│  Indonesia. Peningkatan 15% dalam 2 minggu."        │
│                                                      │
│ Confidence: 92% ████████████████████░░░             │
│                                                      │
│ ┌─────────────┐  ┌─────────────┐                     │
│ │ Kesiapan    │  │  Hari       │                     │
│ │    78%      │  │  Tersisa 12 │                     │
│ └─────────────┘  └─────────────┘                     │
└─────────────────────────────────────────────────────┘
```

### 7. 📅 Timeline Aktivitas
- Riwayat ujian
- Aktivitas belajar
- Progress milestone

---

## File Sistem

### Entry Points
| File | Fungsi |
|------|--------|
| `index.php` | Root redirector dengan session & RBAC |
| `login.html` | Halaman login dengan auto-redirect |
| `register.html` | Registrasi peserta baru |

### Dashboard & Panels
| File | Fungsi |
|------|--------|
| `dashboard.html` | Dashboard peserta lengkap |
| `admin.html` | Admin panel (CRUD soal, statistik) |
| `index.html` | Halaman ujian (pilih paket & kerjakan) |

### Sistem RBAC
| File | Fungsi |
|------|--------|
| `js/rbac.js` | Role-based access control system |
| `api/auth.php` | Autentikasi & registrasi API |

---

## RBAC (Role-Based Access Control)

### Role Definitions
```javascript
ROLES = {
    ADMIN: 'admin',    // Full access
    USER: 'user',      // Peserta ujian
    GUEST: 'guest'     // Belum login
}
```

### Access Matrix

| Halaman | Admin | User | Guest |
|---------|-------|------|-------|
| `/` (root) | ✅ → admin.html | ✅ → dashboard.html | ✅ → login.html |
| `login.html` | ✅ (auto-redirect) | ✅ (auto-redirect) | ✅ |
| `register.html` | ✅ | ✅ | ✅ |
| `dashboard.html` | ✅ | ✅ | ❌ → login.html |
| `admin.html` | ✅ | ❌ → dashboard.html | ❌ → login.html |
| `index.html` (ujian) | ✅ | ✅ | ❌ → login.html |

### Redirect Logic

```php
// index.php
if (!$isLoggedIn) {
    header('Location: login.html');
} elseif ($userRole === 'admin') {
    header('Location: admin.html');
} else {
    header('Location: dashboard.html');
}
```

---

## Database Schema (Updated)

### Tabel: users
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,        -- bcrypt hash
    role VARCHAR(20) DEFAULT 'user',        -- admin/user
    api_key VARCHAR(64) UNIQUE,
    
    -- Data Peserta (NEW)
    nama_lengkap VARCHAR(100),
    nomor_hp VARCHAR(15),
    jenis_kelamin CHAR(1),                  -- L/P
    tahun_tamat INT,
    asal_sekolah VARCHAR(200),
    
    created_at DATETIME DEFAULT NOW(),
    last_login DATETIME,
    
    INDEX idx_role (role),
    INDEX idx_nomor_hp (nomor_hp)
);
```

### Tabel: hasil_ujian
```sql
CREATE TABLE hasil_ujian (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    paket_id INT NOT NULL,
    nama_peserta VARCHAR(100),
    nilai_twk DECIMAL(5,2),
    nilai_tiu DECIMAL(5,2),
    nilai_tkp DECIMAL(5,2),
    nilai_total DECIMAL(5,2),
    status_lulus BOOLEAN,
    waktu_pengerjaan INT,                  -- dalam menit
    tanggal_ujian DATETIME DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_tanggal (user_id, tanggal_ujian)
);
```

---

## API Endpoints

### Authentication
| Endpoint | Method | Akses | Keterangan |
|----------|--------|-------|------------|
| `auth.php?action=login` | POST | Public | Login dengan username/password |
| `auth.php?action=register` | POST | Public | Registrasi peserta baru |
| `auth.php?action=verify` | GET | Auth | Verifikasi token |

### Dashboard Data
| Endpoint | Method | Akses | Keterangan |
|----------|--------|-------|------------|
| `soal.php?action=get_riwayat_ujian` | GET | Auth | Riwayat ujian user |
| `soal.php?action=analyze_weakness` | GET | Auth | Analisis kelemahan |
| `soal.php?action=get_rekomendasi_belajar` | GET | Auth | Rekomendasi AI |
| `soal.php?action=get_statistik` | GET | Auth | Statistik belajar |

### Ujian
| Endpoint | Method | Akses | Keterangan |
|----------|--------|-------|------------|
| `soal.php?action=get_paket` | GET | Public | List paket ujian |
| `soal.php?action=get_soal_by_paket` | GET | Public | Ambil soal |
| `soal.php?action=simpan_sesi` | POST | Auth | Simpan sesi |
| `soal.php?action=selesai_ujian` | POST | Auth | Submit jawaban |

---

## Teknologi Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling dengan CSS Grid & Flexbox
- **Bootstrap 5** - UI components
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

### Backend
- **PHP 8.x** - Server-side logic
- **MySQL** - Database
- **JSON API** - RESTful endpoints

### Keamanan
- **bcrypt** - Password hashing
- **JWT-style tokens** - Session management
- **Prepared Statements** - SQL injection protection
- **XSS Protection** - htmlspecialchars()

---

## Cara Menggunakan

### Untuk Peserta (User)

1. **Registrasi**
   ```
   http://localhost/bimbel/register.html
   ```
   Isi data lengkap: Nama, HP, Jenis Kelamin, Tahun Tamat, Asal Sekolah

2. **Login**
   ```
   http://localhost/bimbel/
   ```
   Auto-redirect ke login jika belum login

3. **Dashboard**
   Setelah login, akan masuk ke `dashboard.html` dengan:
   - Statistik performa
   - Analisis kelemahan
   - Bahan ajar
   - Penilaian AI

4. **Mulai Ujian**
   Klik "Mulai Ujian Baru" → Pilih paket → Kerjakan soal

### Untuk Admin

1. **Login sebagai Admin**
   ```
   http://localhost/bimbel/login.html
   ```

2. **Admin Panel**
   Auto-redirect ke `admin.html` dengan:
   - Manajemen soal (CRUD)
   - Statistik peserta
   - Manajemen paket
   - Laporan & analytics
   - Content Generation (Generate Soal, Bahan Pelajaran, Tips, Educational Content)
   - System Maintenance (Backup, Cleanup, Storage Analysis, System Status)

---

## Pengembangan Masa Depan

### Planned Features
1. **Real-time Notifications** - WebSocket untuk notifikasi ujian
2. **Mobile App** - PWA atau Flutter
3. **AI Chatbot** - Asisten belajar 24/7
4. **Video Conference** - Ujian dengan proctoring
5. **Blockchain Certificate** - Sertifikat terverifikasi blockchain

### Performance Optimization
1. **Redis Caching** - Cache frequently accessed data
2. **CDN** - Static assets delivery
3. **Database Indexing** - Query optimization
4. **Lazy Loading** - Dashboard components

---

## Status Implementasi

| Komponen | Status |
|----------|--------|
| Root Redirector (index.php) | ✅ |
| RBAC System | ✅ |
| Login/Register | ✅ |
| User Dashboard | ✅ |
| Admin Panel | ✅ |
| API Endpoints | ✅ |
| Database Schema | ✅ |
| Security Layer | ✅ |

---

## Catatan Penting

### Keamanan
- Selalu gunakan HTTPS di production
- Rotate API keys periodically
- Monitor failed login attempts
- Backup database regularly

### Performance
- Optimize images untuk mobile
- Minify CSS/JS
- Enable gzip compression
- Use browser caching

### Accessibility
- ARIA labels untuk screen readers
- Keyboard navigation support
- High contrast mode option
- Font size adjustments

---

*Sistem Ujian Sekolah Kedinasan - Modern Learning Platform*
**Versi: 2.0 - Enhanced with RBAC & AI**
*Updated: 14 Mei 2026*
