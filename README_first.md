# Aplikasi Ujian Sekolah Kedinasan

Aplikasi ujian berbasis web untuk persiapan Seleksi Kompetensi Dasar (SKD) sekolah kedinasan di Indonesia.

## Fitur

- ✅ **Sistem Pilihan Ganda** - Soal dengan 5 opsi jawaban (A-E)
- ✅ **Timer Durasi** - 100 menit sesuai standar SKD
- ✅ **Pengacakan Soal** - Soal diacak setiap sesi ujian
- ✅ **Pembahasan Lengkap** - Penjelasan detail untuk setiap soal
- ✅ **Tips & Trik** - Strategi menyelesaikan soal TWK, TIU, TKP
- ✅ **Modern UI** - Antarmuka responsif dan user-friendly
- ✅ **Real-time Scoring** - Hasil langsung dengan passing grade

## Kategori Soal

### TWK (Tes Wawasan Kebangsaan) - 30 Soal
- Passing Grade: 65
- Materi: Nasionalisme, Integritas, Bela Negara, Pilar Negara, Bahasa Indonesia

### TIU (Tes Intelegensi Umum) - 35 Soal
- Passing Grade: 80
- Materi: Verbal, Numerik, Figural

### TKP (Tes Karakteristik Pribadi) - 35 Soal
- Passing Grade: 166
- Materi: Karakteristik kepribadian

## Cara Install

### 1. Start XAMPP
```bash
sudo /opt/lampp/lampp start
```

### 2. Setup Database
Buka browser dan akses phpMyAdmin:
```
http://localhost/phpmyadmin
```

Import file `database.sql` atau jalankan perintah:
```bash
/opt/lampp/bin/mysql -u root -p < database.sql
```

### 3. Import Sample Questions
Setelah database berhasil dibuat, jalankan script untuk import sample questions:
```
http://localhost/ujian/seed_questions.php
```

Atau via command line:
```bash
/opt/lampp/bin/php seed_questions.php
```

### 4. Akses Aplikasi
Buka browser dan akses:
```
http://localhost/ujian/
```

## Struktur File

```
ujian/
├── api/
│   ├── soal.php          # API untuk mengambil dan menyimpan soal
│   └── pembahasan.php    # API untuk pembahasan dan tips
├── config.php            # Konfigurasi database
├── database.sql          # Struktur database
├── seed_questions.php    # Script import sample questions
├── index.html            # Frontend HTML
├── app.js                # Frontend JavaScript
└── README.md             # Dokumentasi
```

## Konfigurasi Database

Edit file `config.php` jika perlu mengubah koneksi database:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // Ganti dengan password MySQL Anda
define('DB_NAME', 'ujian_sekolah_kedinasan');
```

## Cara Menambah Soal Baru

### Via phpMyAdmin
1. Buka phpMyAdmin
2. Pilih database `ujian_sekolah_kedinasan`
3. Buka tabel `soal`
4. Klik "Insert" untuk menambah soal baru

### Via Script
Tambahkan soal baru di file `seed_questions.php` dan jalankan ulang script.

## API Endpoints

### `/api/soal.php`
- `GET ?action=get_soal_by_kategori&kategori=TWK&limit=30` - Ambil soal per kategori
- `GET ?action=get_soal_acak` - Ambil soal teracak untuk ujian
- `GET ?action=get_soal_by_id&id=1` - Ambil detail soal
- `POST ?action=simpan_sesi` - Simpan sesi ujian
- `GET ?action=get_sesi&sesi_id=1` - Ambil data sesi
- `POST ?action=selesai_ujian` - Selesaikan ujian dan hitung nilai

### `/api/pembahasan.php`
- `GET ?action=get_pembahasan&soal_id=1` - Ambil pembahasan soal
- `GET ?action=get_pembahasan_kategori&kategori=TWK&limit=10` - Ambil pembahasan per kategori
- `GET ?action=get_tips_umum&kategori=umum` - Ambil tips umum

## Keyboard Shortcuts

Saat ujian berlangsung:
- `←` (Panah Kiri) - Soal sebelumnya
- `→` (Panah Kanan) - Soal selanjutnya
- `1-5` - Pilih jawaban (1=A, 2=B, 3=C, 4=D, 5=E)

## Troubleshooting

### MySQL Connection Error
Jika muncul error koneksi MySQL:
1. Pastikan XAMPP sudah berjalan: `sudo /opt/lampp/lampp start`
2. Cek password MySQL di `config.php`
3. Pastikan database sudah dibuat

### Soal Tidak Muncul
1. Pastikan database sudah di-import
2. Jalankan `seed_questions.php` untuk import sample questions
3. Cek error di console browser (F12)

### Timer Tidak Berjalan
1. Pastikan JavaScript tidak di-block oleh browser
2. Cek console browser untuk error

## Passing Grade

- **TWK**: Minimal 65
- **TIU**: Minimal 80
- **TKP**: Minimal 166
- **Total**: Minimal 311

## Tips Mengerjakan Ujian

1. **Jangan terburu-buru** - Kelola waktu dengan baik
2. **Fokus dan teliti** - Perhatikan setiap soal
3. **Kerjakan yang bisa dulu** - Lewati soal sulit
4. **Urutan strategis** - TWK → TKP → TIU

## Teknologi yang Digunakan

- **Backend**: PHP 7.4+
- **Database**: MySQL/MariaDB
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome 6

## License

Aplikasi ini dibuat untuk keperluan pendidikan dan persiapan ujian sekolah kedinasan.

## Support

Untuk pertanyaan atau masalah, silakan hubungi administrator sistem.
