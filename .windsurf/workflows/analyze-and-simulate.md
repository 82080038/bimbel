---
description: Analisis Aplikasi Bimbel dan Simulasi Puppeteer
---

# Workflow: Analisis dan Simulasi Aplikasi Bimbel

## Aturan Utama
**apabila melakukan perbaikan atau update, periksa bagian lain di aplikasi, yang butuh perbaikan, dan pastikan efeknya terhadap file lain juga diperbaiki, kemudian lakukan tes atas perbaikan tersebut**

## Langkah-langkah:

1. **Analisis Struktur Aplikasi**
   - Periksa file di direktori: admin/, participant/, api/, js/
   - Identifikasi file yang perlu update atau delete
   - Cek file yang obsolete atau duplikat

2. **Analisis Dampak Lintas**
   - Cari semua penggunaan fungsi/variabel yang diubah
   - Update endpoint API terkait jika backend berubah
   - Update komponen frontend terkait jika frontend berubah
   - Cek breaking changes di shared utilities

3. **Update Konfigurasi**
   - Update .windsurf/rules.json jika ada perubahan struktur
   - Update README.md dengan fitur terbaru
   - Update dokumentasi yang relevan

4. **Database Migration**
   - Cek file SQL di database/ yang belum dijalankan
   - Jalankan SQL migration yang belum dijalankan via terminal:
     ```bash
     mysql -u root -p ujian_sekolah_kedinasan < database/nama_file.sql
     ```
   - Export database dari phpMyAdmin ke database/
   - Timpa file database yang sudah ada

5. **Testing**
   - Jalankan test untuk modul yang terpengaruh
   - Verifikasi tidak ada regression di fungsi yang sudah ada
   - Jalankan simulasi Puppeteer untuk critical paths

6. **Dokumentasi**
   - Update dokumentasi jika ada perubahan
   - Catat perubahan yang dilakukan
   - Catat file yang dihapus/diupdate

## Checklist Cross-Impact Analysis:
- [ ] Search for all usages of modified functions/variables
- [ ] Update related API endpoints if backend changes
- [ ] Update related frontend components if frontend changes
- [ ] Check for breaking changes in shared utilities
- [ ] Update documentation if needed
- [ ] Run tests for affected modules
- [ ] Verify no regression in existing functionality
- Review database schema
- Check API endpoints

## Step 2: Update Windsurf Configuration
// turbo
- Update .windsurf/rules.json dengan analisis terbaru
- Konfigurasi project settings
- Setup editor preferences

## Step 3: Create Puppeteer Simulation Scripts
- Buat tests/simulation/admin-simulation.js
- Buat tests/simulation/participant-simulation.js
- Buat tests/simulation/tryout-packages.js
- Setup test data fixtures

## Step 4: Run Simulations
// turbo
- Jalankan simulasi admin (headed mode)
- Jalankan simulasi peserta (headed mode)
- Simulasikan berbagai paket tryout
- Capture screenshots dan logs

## Step 5: Error Analysis and Fixes
- Analisa error dari simulasi
- Perbaiki bugs yang ditemukan
- Update test scripts jika diperlukan
- Re-run simulasi untuk verifikasi

## Step 6: Cleanup Unused Files
// turbo
- Identifikasi file yang tidak digunakan
- Review imports dan dependencies
- Hapus file obsolete
- Update documentation
