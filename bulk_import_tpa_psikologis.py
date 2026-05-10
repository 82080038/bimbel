#!/usr/bin/env python3
"""
Bulk Import Script untuk Soal TPA dan PSIKOLOGIS
Aplikasi Ujian Sekolah Kedinasan
"""

import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan'
}

# Kategori IDs
KATEGORI_TPA = 4
KATEGORI_PSIKOLOGIS = 5

# Soal TPA (Tes Potensi Akademik)
TPA_QUESTIONS = [
    {
        "pertanyaan": "Jika semua A adalah B, dan semua B adalah C, maka...",
        "opsi_a": "Semua A adalah C",
        "opsi_b": "Semua C adalah A",
        "opsi_c": "Sebagian A adalah C",
        "opsi_d": "Tidak ada hubungan",
        "opsi_e": "Sebagian C adalah A",
        "jawaban_benar": "A",
        "pembahasan": "Dalam logika silogisme, jika semua A adalah B dan semua B adalah C, maka semua A adalah C. Ini adalah aturan transitivitas.",
        "tips": "Gunakan diagram Venn untuk memvisualisasikan hubungan antar himpunan."
    },
    {
        "pertanyaan": "Antonim dari kata \"ekspansif\" adalah...",
        "opsi_a": "Menyempit",
        "opsi_b": "Meluas",
        "opsi_c": "Besar",
        "opsi_d": "Luas",
        "opsi_e": "Tinggi",
        "jawaban_benar": "A",
        "pembahasan": "Ekspansif berarti cenderung meluas atau berkembang. Antonimnya adalah menyempit atau kontraktif.",
        "tips": "Pelajari kata-kata berantonim dan sinonim secara teratur."
    },
    {
        "pertanyaan": "Sinonim dari kata \"redundan\" adalah...",
        "opsi_a": "Berlebihan",
        "opsi_b": "Pas-pasan",
        "opsi_c": "Hilang",
        "opsi_d": "Kurang",
        "opsi_e": "Sedikit",
        "jawaban_benar": "A",
        "pembahasan": "Redundan berarti berlebihan atau berulang. Sinonimnya adalah berlebihan, berlelehan, atau berulang.",
        "tips": "Perbanyak kosakata dengan membaca buku dan artikel berkualitas."
    },
    {
        "pertanyaan": "Dokter : Pasien = Guru : ...",
        "opsi_a": "Siswa",
        "opsi_b": "Sekolah",
        "opsi_c": "Buku",
        "opsi_d": "Papan tulis",
        "opsi_e": "Kelas",
        "jawaban_benar": "A",
        "pembahasan": "Hubungan antara dokter dan pasien adalah pelayanan. Hubungan yang sama antara guru dan siswa adalah juga pelayanan/pendidikan.",
        "tips": "Analisis hubungan kata sebelum mencari jawaban yang memiliki hubungan serupa."
    },
    {
        "pertanyaan": "Deret huruf: A, C, E, G, ..., K. Huruf yang tepat adalah...",
        "opsi_a": "H",
        "opsi_b": "I",
        "opsi_c": "J",
        "opsi_d": "L",
        "opsi_e": "M",
        "jawaban_benar": "B",
        "pembahasan": "Deret ini melompat satu huruf setiap kali (A-B-C, C-D-E, E-F-G, G-H-I). Jadi huruf berikutnya adalah I.",
        "tips": "Identifikasi pola dalam deret huruf atau angka."
    },
    {
        "pertanyaan": "Deret angka: 2, 4, 8, 16, ..., 64, 128. Angka yang tepat untuk mengisi titik-titik adalah...",
        "opsi_a": "24",
        "opsi_b": "30",
        "opsi_c": "32",
        "opsi_d": "36",
        "opsi_e": "40",
        "jawaban_benar": "C",
        "pembahasan": "Deret ini adalah kelipatan 2 (2×2=4, 4×2=8, 8×2=16, 16×2=32, 32×2=64, 64×2=128).",
        "tips": "Cari pola perkalian, penjumlahan, atau operasi lain dalam deret angka."
    },
    {
        "pertanyaan": "24 ÷ 4 × 6 = ...",
        "opsi_a": "16",
        "opsi_b": "24",
        "opsi_c": "30",
        "opsi_d": "36",
        "opsi_e": "40",
        "jawaban_benar": "D",
        "pembahasan": "Ikuti urutan operasi dari kiri ke kanan: 24 ÷ 4 = 6, kemudian 6 × 6 = 36.",
        "tips": "Selalu ikuti urutan operasi matematika (kali/bagi sebelum tambah/kurang, kiri ke kanan)."
    },
    {
        "pertanyaan": "Pisau : Memotong = Pulpen : ...",
        "opsi_a": "Menghapus",
        "opsi_b": "Menulis",
        "opsi_c": "Membaca",
        "opsi_d": "Menggambar",
        "opsi_e": "Menandai",
        "jawaban_benar": "B",
        "pembahasan": "Pisau berfungsi untuk memotong. Pulpen berfungsi untuk menulis. Ini adalah hubungan alat-fungsi.",
        "tips": "Analisis hubungan kata (alat-fungsi, sebab-akibat, bagian-keseluruhan, dll)."
    },
    {
        "pertanyaan": "Jika x + 5 = 12, maka x = ...",
        "opsi_a": "5",
        "opsi_b": "6",
        "opsi_c": "7",
        "opsi_d": "8",
        "opsi_e": "17",
        "jawaban_benar": "C",
        "pembahasan": "x + 5 = 12, maka x = 12 - 5 = 7.",
        "tips": "Pindahkan konstanta ke sisi lain dengan mengubah tanda operasi."
    },
    {
        "pertanyaan": "Sebuah segitiga memiliki alas 10 cm dan tinggi 8 cm. Luas segitiga tersebut adalah...",
        "opsi_a": "40 cm²",
        "opsi_b": "80 cm²",
        "opsi_c": "18 cm²",
        "opsi_d": "20 cm²",
        "opsi_e": "45 cm²",
        "jawaban_benar": "A",
        "pembahasan": "Luas segitiga = ½ × alas × tinggi = ½ × 10 × 8 = 40 cm².",
        "tips": "Hafalkan rumus-rumus geometri dasar."
    },
    {
        "pertanyaan": "Persentase dari 25 adalah 5, maka persentase tersebut adalah...",
        "opsi_a": "10%",
        "opsi_b": "15%",
        "opsi_c": "20%",
        "opsi_d": "25%",
        "opsi_e": "30%",
        "jawaban_benar": "C",
        "pembahasan": "(5/25) × 100% = 0.2 × 100% = 20%.",
        "tips": "Untuk mencari persentase, bagi nilai dengan total lalu kalikan 100%."
    },
    {
        "pertanyaan": "Bilangan prima di antara 10 dan 20 adalah...",
        "opsi_a": "11, 13, 17, 19",
        "opsi_b": "11, 13, 15, 17",
        "opsi_c": "12, 13, 17, 19",
        "opsi_d": "11, 14, 17, 19",
        "opsi_e": "13, 15, 17, 19",
        "jawaban_benar": "A",
        "pembahasan": "Bilangan prima adalah bilangan yang hanya habis dibagi oleh 1 dan dirinya sendiri. Antara 10 dan 20: 11, 13, 17, 19.",
        "tips": "Hafalkan bilangan prima hingga 100 untuk mempercepat perhitungan."
    },
    {
        "pertanyaan": "Jarak antara dua kota adalah 120 km. Jika ditempuh dengan kecepatan 60 km/jam, waktu yang dibutuhkan adalah...",
        "opsi_a": "1 jam",
        "opsi_b": "1.5 jam",
        "opsi_c": "2 jam",
        "opsi_d": "2.5 jam",
        "opsi_e": "3 jam",
        "jawaban_benar": "C",
        "pembahasan": "Waktu = Jarak ÷ Kecepatan = 120 ÷ 60 = 2 jam.",
        "tips": "Gunakan rumus Waktu = Jarak ÷ Kecepatan untuk soal perjalanan."
    },
    {
        "pertanyaan": "Sebuah lingkaran memiliki jari-jari 7 cm. Keliling lingkaran tersebut adalah...",
        "opsi_a": "14 cm",
        "opsi_b": "22 cm",
        "opsi_c": "44 cm",
        "opsi_d": "49 cm",
        "opsi_e": "154 cm",
        "jawaban_benar": "C",
        "pembahasan": "Keliling lingkaran = 2 × π × r = 2 × 22/7 × 7 = 44 cm.",
        "tips": "Gunakan π = 22/7 untuk mempermudah perhitungan jika jari-jari adalah kelipatan 7."
    },
    {
        "pertanyaan": "Sinonim dari kata \"inovatif\" adalah...",
        "opsi_a": "Kuno",
        "opsi_b": "Kreatif",
        "opsi_c": "Statis",
        "opsi_d": "Biasa",
        "opsi_e": "Lambat",
        "jawaban_benar": "B",
        "pembahasan": "Inovatif berarti memiliki inovasi atau kreativitas. Sinonimnya adalah kreatif, inovatif, atau penuh gagasan baru.",
        "tips": "Kembangkan kosakata dengan membaca berbagai jenis teks."
    },
    {
        "pertanyaan": "Antonim dari kata \"stabil\" adalah...",
        "opsi_a": "Tetap",
        "opsi_b": "Kuat",
        "opsi_c": "Labil",
        "opsi_d": "Kokoh",
        "opsi_e": "Mapan",
        "jawaban_benar": "C",
        "pembahasan": "Stabil berarti mantap atau tidak berubah. Antonimnya adalah labil atau tidak stabil.",
        "tips": "Pelajari kata-kata dengan lawan kata (antonim) dan kata searti (sinonim)."
    },
    {
        "pertanyaan": "Sinonim dari kata \"efisien\" adalah...",
        "opsi_a": "Boros",
        "opsi_b": "Tepat guna",
        "opsi_c": "Lambat",
        "opsi_d": "Sia-sia",
        "opsi_e": "Tidak efektif",
        "jawaban_benar": "B",
        "pembahasan": "Efisien berarti tepat guna atau tidak boros. Sinonimnya adalah tepat guna, hemat, atau produktif.",
        "tips": "Pelajari kata-kata teknis dan istilah dalam konteks yang tepat."
    },
    {
        "pertanyaan": "Antonim dari kata \"komprehensif\" adalah...",
        "opsi_a": "Lengkap",
        "opsi_b": "Terperinci",
        "opsi_c": "Sempit",
        "opsi_d": "Luas",
        "opsi_e": "Menyeluruh",
        "jawaban_benar": "C",
        "pembahasan": "Komprehensif berarti lengkap atau menyeluruh. Antonimnya adalah sempit atau terbatas.",
        "tips": "Kembangkan kosakata dengan membaca teks akademik dan profesional."
    },
    {
        "pertanyaan": "Mobil : Bensin = Komputer : ...",
        "opsi_a": "Listrik",
        "opsi_b": "Mouse",
        "opsi_c": "Keyboard",
        "opsi_d": "Monitor",
        "opsi_e": "Printer",
        "jawaban_benar": "A",
        "pembahasan": "Mobil membutuhkan bensin untuk berjalan. Komputer membutuhkan listrik untuk beroperasi. Ini adalah hubungan benda-sumber daya.",
        "tips": "Analisis hubungan fungsional antar kata."
    },
    {
        "pertanyaan": "Deret angka: 3, 6, 9, 12, ..., 18. Angka yang tepat adalah...",
        "opsi_a": "13",
        "opsi_b": "14",
        "opsi_c": "15",
        "opsi_d": "16",
        "opsi_e": "17",
        "jawaban_benar": "C",
        "pembahasan": "Deret ini bertambah 3 setiap langkah (3+3=6, 6+3=9, 9+3=12, 12+3=15, 15+3=18).",
        "tips": "Identifikasi selisih antar angka untuk menemukan pola deret aritmatika."
    },
    {
        "pertanyaan": "Deret huruf: B, D, F, H, ..., L. Huruf yang tepat adalah...",
        "opsi_a": "I",
        "opsi_b": "J",
        "opsi_c": "K",
        "opsi_d": "M",
        "opsi_e": "N",
        "jawaban_benar": "B",
        "pembahasan": "Deret ini melompat satu huruf (B-C-D, D-E-F, F-G-H, H-I-J). Jadi huruf berikutnya adalah J.",
        "tips": "Perhatikan pola lompatan dalam deret huruf alfabet."
    },
    {
        "pertanyaan": "15 + 3 × 5 = ...",
        "opsi_a": "30",
        "opsi_b": "75",
        "opsi_c": "90",
        "opsi_d": "18",
        "opsi_e": "45",
        "jawaban_benar": "A",
        "pembahasan": "Ikuti urutan operasi: 3 × 5 = 15, kemudian 15 + 15 = 30.",
        "tips": "Selalu lakukan perkalian sebelum penjumlahan."
    },
    {
        "pertanyaan": "Sebuah persegi panjang memiliki panjang 12 cm dan lebar 8 cm. Luasnya adalah...",
        "opsi_a": "20 cm²",
        "opsi_b": "40 cm²",
        "opsi_c": "96 cm²",
        "opsi_d": "48 cm²",
        "opsi_e": "80 cm²",
        "jawaban_benar": "C",
        "pembahasan": "Luas persegi panjang = panjang × lebar = 12 × 8 = 96 cm².",
        "tips": "Hafalkan rumus-rumus geometri dasar."
    },
    {
        "pertanyaan": "20% dari 150 adalah...",
        "opsi_a": "20",
        "opsi_b": "30",
        "opsi_c": "40",
        "opsi_d": "50",
        "opsi_e": "60",
        "jawaban_benar": "B",
        "pembahasan": "20% dari 150 = (20/100) × 150 = 0.2 × 150 = 30.",
        "tips": "Untuk menghitung persentase, kalikan nilai dengan persen/100."
    },
    {
        "pertanyaan": "Jika 5x = 25, maka x = ...",
        "opsi_a": "3",
        "opsi_b": "4",
        "opsi_c": "5",
        "opsi_d": "6",
        "opsi_e": "20",
        "jawaban_benar": "C",
        "pembahasan": "5x = 25, maka x = 25 ÷ 5 = 5.",
        "tips": "Untuk mencari variabel, bagi kedua sisi dengan koefisien variabel."
    },
    {
        "pertanyaan": "Buku : Membaca = Radio : ...",
        "opsi_a": "Menulis",
        "opsi_b": "Mendengarkan",
        "opsi_c": "Melihat",
        "opsi_d": "Menyentuh",
        "opsi_e": "Mencium",
        "jawaban_benar": "B",
        "pembahasan": "Buku berfungsi untuk dibaca. Radio berfungsi untuk didengarkan. Ini adalah hubungan alat-fungsi.",
        "tips": "Identifikasi fungsi utama dari setiap objek."
    },
    {
        "pertanyaan": "Sebuah balok memiliki panjang 10 cm, lebar 5 cm, dan tinggi 4 cm. Volumenya adalah...",
        "opsi_a": "20 cm³",
        "opsi_b": "50 cm³",
        "opsi_c": "200 cm³",
        "opsi_d": "100 cm³",
        "opsi_e": "150 cm³",
        "jawaban_benar": "C",
        "pembahasan": "Volume balok = panjang × lebar × tinggi = 10 × 5 × 4 = 200 cm³.",
        "tips": "Hafalkan rumus volume untuk berbagai bangun ruang."
    },
    {
        "pertanyaan": "Sinonim dari kata \"analitis\" adalah...",
        "opsi_a": "Emosional",
        "opsi_b": "Kritis",
        "opsi_c": "Spontan",
        "opsi_d": "Acak",
        "opsi_e": "Tidak teratur",
        "jawaban_benar": "B",
        "pembahasan": "Analitis berarti bersifat analisis atau kritis. Sinonimnya adalah kritis, teliti, atau detail.",
        "tips": "Pelajari kata-kata yang berkaitan dengan kemampuan berpikir."
    },
    {
        "pertanyaan": "Antonim dari kata \"proaktif\" adalah...",
        "opsi_a": "Aktif",
        "opsi_b": "Reaktif",
        "opsi_c": "Positif",
        "opsi_d": "Produktif",
        "opsi_e": "Kreatif",
        "jawaban_benar": "B",
        "pembahasan": "Proaktif berarti mengambil inisiatif. Antonimnya adalah reaktif (hanya bereaksi).",
        "tips": "Pelajari kata-kata yang berkaitan dengan sikap dan perilaku."
    },
    {
        "pertanyaan": "Deret angka: 1, 4, 9, 16, ..., 36. Angka yang tepat adalah...",
        "opsi_a": "20",
        "opsi_b": "24",
        "opsi_c": "25",
        "opsi_d": "30",
        "opsi_e": "32",
        "jawaban_benar": "C",
        "pembahasan": "Deret ini adalah kuadrat sempurna (1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36).",
        "tips": "Kenali pola kuadrat, kubik, dan fungsi lain dalam deret angka."
    }
]

# Soal PSIKOLOGIS (Tes Psikologi)
PSIKOLOGIS_QUESTIONS = [
    {
        "pertanyaan": "Saat menghadapi tekanan di tempat kerja, Anda cenderung...",
        "opsi_a": "Panik dan tidak bisa berpikir jernih",
        "opsi_b": "Menghindari masalah dengan menunda",
        "opsi_c": "Menganalisis masalah dan mencari solusi",
        "opsi_d": "Menyalahkan orang lain",
        "opsi_e": "Menyerah begitu saja",
        "jawaban_benar": "C",
        "pembahasan": "Jawaban C menunjukkan kemampuan coping yang baik dan sikap problem-solving yang positif.",
        "tips": "Kembangkan kemampuan problem-solving dan manajemen stress."
    },
    {
        "pertanyaan": "Jika atasan memberikan kritik, reaksi Anda adalah...",
        "opsi_a": "Marah dan tersinggung",
        "opsi_b": "Mengabaikan kritik",
        "opsi_c": "Menerima dan memperbaiki diri",
        "opsi_d": "Mencari alasan",
        "opsi_e": "Menggosipkan atasan",
        "jawaban_benar": "C",
        "pembahasan": "Menerima kritik secara positif menunjukkan sikap terbuka untuk belajar dan berkembang.",
        "tips": "Anggap kritik sebagai masukan untuk perbaikan diri."
    },
    {
        "pertanyaan": "Saat bekerja, Anda lebih suka...",
        "opsi_a": "Bekerja sendiri tanpa gangguan",
        "opsi_b": "Bekerja dalam tim dengan kolaborasi",
        "opsi_c": "Hanya mengikuti instruksi",
        "opsi_d": "Menunda pekerjaan",
        "opsi_e": "Mencari pekerjaan orang lain",
        "jawaban_benar": "B",
        "pembahasan": "Kerja tim menunjukkan kemampuan kolaborasi yang penting di lingkungan kerja.",
        "tips": "Kembangkan kemampuan kerja tim dan komunikasi."
    },
    {
        "pertanyaan": "Saat menghadapi kegagalan, Anda akan...",
        "opsi_a": "Menyerah dan putus asa",
        "opsi_b": "Menyalahkan keadaan",
        "opsi_c": "Belajar dan mencoba lagi",
        "opsi_d": "Menghindari situasi serupa",
        "opsi_e": "Melupakan begitu saja",
        "jawaban_benar": "C",
        "pembahasan": "Sikap yang positif terhadap kegagalan adalah belajar dari pengalaman dan mencoba lagi.",
        "tips": "Kembangkan growth mindset dan ketahanan mental."
    },
    {
        "pertanyaan": "Dalam mengambil keputusan, Anda cenderung...",
        "opsi_a": "Mengikuti kata orang lain",
        "opsi_b": "Menganalisis dan mempertimbangkan dengan teliti",
        "opsi_c": "Mengambil keputusan cepat tanpa pikir",
        "opsi_d": "Menghindari pengambilan keputusan",
        "opsi_e": "Menunggu instruksi",
        "jawaban_benar": "B",
        "pembahasan": "Menganalisis keputusan dengan teliti menunjukkan kemampuan berpikir kritis dan tanggung jawab.",
        "tips": "Latih kemampuan analisis dan pertimbangan dalam pengambilan keputusan."
    },
    {
        "pertanyaan": "Motivasi utama Anda ingin bekerja di sekolah kedinasan adalah...",
        "opsi_a": "Ingin gaji tinggi",
        "opsi_b": "Ingin mengabdi untuk negara",
        "opsi_c": "Ingin popularitas",
        "opsi_d": "Tidak ada pekerjaan lain",
        "opsi_e": "Ikutan teman saja",
        "jawaban_benar": "B",
        "pembahasan": "Motivasi untuk mengabdi pada negara menunjukkan komitmen dan integritas yang tinggi.",
        "tips": "Kembangkan motivasi intrinsik yang positif dalam karir."
    },
    {
        "pertanyaan": "Dalam tim, jika ada perbedaan pendapat, Anda akan...",
        "opsi_a": "Mengabaikan pendapat orang lain",
        "opsi_b": "Memaksa pendapat Anda diterima",
        "opsi_c": "Mendiskusikan dan mencari solusi bersama",
        "opsi_d": "Keluar dari tim",
        "opsi_e": "Menyimpan dendam",
        "jawaban_benar": "C",
        "pembahasan": "Diskusi dan mencari solusi bersama menunjukkan kemampuan negosiasi dan kerja tim yang baik.",
        "tips": "Kembangkan kemampuan komunikasi dan konflik resolution."
    },
    {
        "pertanyaan": "Jika ada kesempatan untuk belajar hal baru, Anda akan...",
        "opsi_a": "Mengabaikan karena sudah cukup",
        "opsi_b": "Mengambil kesempatan dengan antusias",
        "opsi_c": "Menunda untuk nanti",
        "opsi_d": "Minta orang lain belajar",
        "opsi_e": "Merasa tidak perlu",
        "jawaban_benar": "B",
        "pembahasan": "Antusiasme untuk belajar hal baru menunjukkan sikap growth mindset dan keinginan untuk berkembang.",
        "tips": "Jadilah pembelajar seumur hidup."
    },
    {
        "pertanyaan": "Saat ada rekan yang kesulitan, tindakan Anda adalah...",
        "opsi_a": "Mengabaikan",
        "opsi_b": "Menertawakan",
        "opsi_c": "Membantu jika memungkinkan",
        "opsi_d": "Melaporkan ke atasan",
        "opsi_e": "Mencari kesalahan mereka",
        "jawaban_benar": "C",
        "pembahasan": "Membantu rekan yang kesulitan menunjukkan empati dan sikap gotong royong.",
        "tips": "Kembangkan empati dan kepedulian terhadap orang lain."
    },
    {
        "pertanyaan": "Saat menerima tugas baru yang menantang, reaksi Anda adalah...",
        "opsi_a": "Menolak karena terlalu sulit",
        "opsi_b": "Mengeluh dan mencari alasan",
        "opsi_c": "Menerima sebagai tantangan untuk berkembang",
        "opsi_d": "Menunda sebisa mungkin",
        "opsi_e": "Mencoba menolak dengan halus",
        "jawaban_benar": "C",
        "pembahasan": "Menerima tantangan sebagai kesempatan berkembang menunjukkan sikap positif dan growth mindset.",
        "tips": "Lihat tantangan sebagai kesempatan untuk belajar dan berkembang."
    },
    {
        "pertanyaan": "Dalam bekerja, Anda lebih mengutamakan...",
        "opsi_a": "Cepat selesai walau hasil kurang",
        "opsi_b": "Hasil sempurna walau butuh waktu lama",
        "opsi_c": "Keseimbangan antara kualitas dan waktu",
        "opsi_d": "Mengikuti cara orang lain",
        "opsi_e": "Mengerjakan sesedikit mungkin",
        "jawaban_benar": "C",
        "pembahasan": "Keseimbangan kualitas dan waktu menunjukkan kemampuan manajemen waktu yang baik.",
        "tips": "Kembangkan kemampuan manajemen waktu dan prioritas."
    },
    {
        "pertanyaan": "Jika atasan memberikan tugas tambahan, Anda akan...",
        "opsi_a": "Marah dan menolak",
        "opsi_b": "Mengeluh kepada rekan",
        "opsi_c": "Menerima dengan baik jika masih mampu",
        "opsi_d": "Mengerjakan dengan setengah hati",
        "opsi_e": "Mencari cara menolak",
        "jawaban_benar": "C",
        "pembahasan": "Menerima tugas tambahan dengan bijak menunjukkan fleksibilitas dan tanggung jawab.",
        "tips": "Kembangkan kemampuan manajemen beban kerja."
    },
    {
        "pertanyaan": "Saat bekerja di bawah tekanan deadline, Anda...",
        "opsi_a": "Panik dan bingung",
        "opsi_b": "Mencari alasan untuk menunda",
        "opsi_c": "Fokus dan bekerja lebih efisien",
        "opsi_d": "Menyerah begitu saja",
        "opsi_e": "Menyalahkan deadline",
        "jawaban_benar": "C",
        "pembahasan": "Fokus dan bekerja efisien di bawah tekanan menunjukkan kemampuan manajemen stress.",
        "tips": "Latih kemampuan kerja di bawah tekanan."
    },
    {
        "pertanyaan": "Dalam menghadapi perubahan di tempat kerja, Anda...",
        "opsi_a": "Menolak perubahan",
        "opsi_b": "Mengeluh tentang perubahan",
        "opsi_c": "Beradaptasi dan mencari peluang",
        "opsi_d": "Menunggu orang lain beradaptasi",
        "opsi_e": "Mencari cara menghindari perubahan",
        "jawaban_benar": "C",
        "pembahasan": "Adaptasi terhadap perubahan menunjukkan fleksibilitas dan growth mindset.",
        "tips": "Kembangkan kemampuan adaptasi terhadap perubahan."
    },
    {
        "pertanyaan": "Saat ada kesalahan dalam pekerjaan, Anda akan...",
        "opsi_a": "Menyembunyikan kesalahan",
        "opsi_b": "Menyalahkan orang lain",
        "opsi_c": "Mengakui dan mencari solusi perbaikan",
        "opsi_d": "Mengabaikan kesalahan",
        "opsi_e": "Menunggu kesalahan diketahui orang lain",
        "jawaban_benar": "C",
        "pembahasan": "Mengakui kesalahan dan mencari solusi menunjukkan integritas dan tanggung jawab.",
        "tips": "Kembangkan sikap jujur dan tanggung jawab."
    },
    {
        "pertanyaan": "Motivasi utama Anda dalam bekerja adalah...",
        "opsi_a": "Hanya untuk gaji",
        "opsi_b": "Untuk mencapai target pribadi",
        "opsi_c": "Untuk kontribusi pada organisasi",
        "opsi_d": "Untuk popularitas",
        "opsi_e": "Karena tidak ada pilihan lain",
        "jawaban_benar": "C",
        "pembahasan": "Motivasi untuk berkontribusi pada organisasi menunjukkan komitmen dan loyalitas.",
        "tips": "Kembangkan motivasi yang positif dan berorientasi pada kontribusi."
    },
    {
        "pertanyaan": "Saat bekerja dengan rekan yang memiliki pendapat berbeda, Anda akan...",
        "opsi_a": "Mengabaikan pendapatnya",
        "opsi_b": "Memaksa pendapat Anda diterima",
        "opsi_c": "Mendengarkan dan mencari titik temu",
        "opsi_d": "Melaporkan ke atasan",
        "opsi_e": "Menjauh dari rekan tersebut",
        "jawaban_benar": "C",
        "pembahasan": "Mendengarkan dan mencari titik temu menunjukkan kemampuan komunikasi dan kerja tim yang baik.",
        "tips": "Kembangkan kemampuan negosiasi dan kompromi."
    },
    {
        "pertanyaan": "Jika ada tugas yang sulit dan menantang, sikap Anda adalah...",
        "opsi_a": "Menghindari tugas tersebut",
        "opsi_b": "Menyerah sebelum mencoba",
        "opsi_c": "Mencari strategi dan solusi",
        "opsi_d": "Menunda sebisa mungkin",
        "opsi_e": "Meminta orang lain mengerjakan",
        "jawaban_benar": "C",
        "pembahasan": "Mencari strategi dan solusi menunjukkan problem-solving skill dan growth mindset.",
        "tips": "Tantang diri Anda dengan tugas yang sulit untuk berkembang."
    },
    {
        "pertanyaan": "Saat menerima pujian dari atasan, reaksi Anda adalah...",
        "opsi_a": "Sombong dan membanggakan diri",
        "opsi_b": "Mengabaikan pujian",
        "opsi_c": "Menerima dengan rendah hati",
        "opsi_d": "Meminta pujian lebih",
        "opsi_e": "Mencari kesalahan diri",
        "jawaban_benar": "C",
        "pembahasan": "Menerima pujian dengan rendah hati menunjukkan sikap yang profesional dan tidak sombong.",
        "tips": "Jaga sikap rendah hati dalam situasi apapun."
    },
    {
        "pertanyaan": "Dalam bekerja, Anda lebih suka...",
        "opsi_a": "Bekerja sendirian tanpa komunikasi",
        "opsi_b": "Bekerja dengan kolaborasi tim",
        "opsi_c": "Hanya mengikuti instruksi pasif",
        "opsi_d": "Menghindari tanggung jawab",
        "opsi_e": "Menunggu instruksi detail",
        "jawaban_benar": "B",
        "pembahasan": "Kolaborasi tim menunjukkan kemampuan kerja sama dan komunikasi yang baik.",
        "tips": "Kembangkan kemampuan kerja tim dan komunikasi efektif."
    },
    {
        "pertanyaan": "Saat ada kesempatan promosi, sikap Anda adalah...",
        "opsi_a": "Menghalangi rekan lain",
        "opsi_b": "Menunggu diberikan tanpa usaha",
        "opsi_c": "Bekerja keras dan profesional",
        "opsi_d": "Mencari jalan pintas",
        "opsi_e": "Mengeluh jika tidak dipromosikan",
        "jawaban_benar": "C",
        "pembahasan": "Bekerja keras dan profesional menunjukkan integritas dan dedikasi.",
        "tips": "Fokus pada kinerja dan profesionalisme, bukan pada promosi."
    },
    {
        "pertanyaan": "Jika rekan kerja melakukan kesalahan, tindakan Anda adalah...",
        "opsi_a": "Menertawakan dan mengumumkan kesalahan",
        "opsi_b": "Mengabaikan kesalahan tersebut",
        "opsi_c": "Membantu dan memberi saran",
        "opsi_d": "Melaporkan ke atasan tanpa memberi tahu",
        "opsi_e": "Mencari kesalahan rekan lain",
        "jawaban_benar": "C",
        "pembahasan": "Membantu dan memberi saran menunjukkan empati dan sikap kolaboratif.",
        "tips": "Kembangkan budaya saling membantu di tempat kerja."
    },
    {
        "pertanyaan": "Saat menghadapi konflik dengan rekan, Anda akan...",
        "opsi_a": "Menyerang rekan secara personal",
        "opsi_b": "Menghindari konflik sepenuhnya",
        "opsi_c": "Mengkomunikasikan dan mencari solusi",
        "opsi_d": "Menyebar gosip tentang rekan",
        "opsi_e": "Menunggu orang lain menyelesaikan",
        "jawaban_benar": "C",
        "pembahasan": "Mengkomunikasikan dan mencari solusi menunjukkan kemampuan konflik resolution yang baik.",
        "tips": "Latih kemampuan komunikasi dan manajemen konflik."
    },
    {
        "pertanyaan": "Dalam mengatur waktu, Anda cenderung...",
        "opsi_a": "Mengerjakan tugas secara acak",
        "opsi_b": "Menunda semua tugas",
        "opsi_c": "Mengatur prioritas dan deadline",
        "opsi_d": "Mengerjakan tugas yang mudah saja",
        "opsi_e": "Mengikuti orang lain",
        "jawaban_benar": "C",
        "pembahasan": "Mengatur prioritas dan deadline menunjukkan kemampuan manajemen waktu yang baik.",
        "tips": "Gunakan teknik manajemen waktu seperti Eisenhower Matrix."
    },
    {
        "pertanyaan": "Saat atasan memberikan tugas baru padahal sudah sibuk, Anda akan...",
        "opsi_a": "Menolak dengan marah",
        "opsi_b": "Mengeluh kepada semua orang",
        "opsi_c": "Berkomunikasi dan bernegosiasi prioritas",
        "opsi_d": "Mengerjakan dengan kualitas buruk",
        "opsi_e": "Menolak diam-diam",
        "jawaban_benar": "C",
        "pembahasan": "Berkomunikasi dan bernegosiasi prioritas menunjukkan kemampuan manajemen beban kerja.",
        "tips": "Kembangkan kemampuan komunikasi dan negosiasi dengan atasan."
    },
    {
        "pertanyaan": "Saat ada perubahan kebijakan di tempat kerja, sikap Anda adalah...",
        "opsi_a": "Menolak dan mengeluh",
        "opsi_b": "Mengabaikan perubahan",
        "opsi_c": "Mempelajari dan beradaptasi",
        "opsi_d": "Menunggu orang lain beradaptasi",
        "opsi_e": "Mencari cara menghindari perubahan",
        "jawaban_benar": "C",
        "pembahasan": "Mempelajari dan beradaptasi menunjukkan fleksibilitas dan growth mindset.",
        "tips": "Lihat perubahan sebagai kesempatan untuk belajar hal baru."
    },
    {
        "pertanyaan": "Dalam bekerja, integritas Anda ditunjukkan dengan...",
        "opsi_a": "Mengikuti atasan saja",
        "opsi_b": "Menyembunyikan kesalahan",
        "opsi_c": "Jujur dan transparan",
        "opsi_d": "Mencari keuntungan pribadi",
        "opsi_e": "Mengikuti arus saja",
        "jawaban_benar": "C",
        "pembahasan": "Jujur dan transparan menunjukkan integritas yang tinggi.",
        "tips": "Jaga integritas dalam semua situasi kerja."
    },
    {
        "pertanyaan": "Saat rekan kerja membutuhkan bantuan padahal Anda juga sibuk, Anda akan...",
        "opsi_a": "Mengabaikan rekan tersebut",
        "opsi_b": "Menertawakan kesulitan rekan",
        "opsi_c": "Membantu jika memungkinkan",
        "opsi_d": "Menolak dengan kasar",
        "opsi_e": "Melaporkan ke atasan",
        "jawaban_benar": "C",
        "pembahasan": "Membantu jika memungkinkan menunjukkan empati dan sikap gotong royong.",
        "tips": "Kembangkan budaya saling membantu di lingkungan kerja."
    },
    {
        "pertanyaan": "Dalam mengambil keputusan penting, Anda akan...",
        "opsi_a": "Mengikuti kata orang lain",
        "opsi_b": "Mengambil keputusan impulsif",
        "opsi_c": "Menganalisis dan mempertimbangkan",
        "opsi_d": "Menghindari pengambilan keputusan",
        "opsi_e": "Menunggu instruksi detail",
        "jawaban_benar": "C",
        "pembahasan": "Menganalisis dan mempertimbangkan menunjukkan kemampuan berpikir kritis dan tanggung jawab.",
        "tips": "Gunakan proses berpikir sistematis dalam pengambilan keputusan."
    },
    {
        "pertanyaan": "Saat ada kesempatan untuk belajar skill baru, sikap Anda adalah...",
        "opsi_a": "Mengabaikan karena sudah cukup",
        "opsi_b": "Menunda untuk nanti",
        "opsi_c": "Mengambil kesempatan dengan antusias",
        "opsi_d": "Merasa tidak perlu belajar",
        "opsi_e": "Minta orang lain belajar untuk Anda",
        "jawaban_benar": "C",
        "pembahasan": "Mengambil kesempatan dengan antusias menunjukkan growth mindset dan keinginan berkembang.",
        "tips": "Jadilah pembelajar seumur hidup."
    },
    {
        "pertanyaan": "Dalam menghadapi stress di tempat kerja, Anda akan...",
        "opsi_a": "Panik dan tidak bisa bekerja",
        "opsi_b": "Menyalahkan orang lain",
        "opsi_c": "Mencari cara mengelola stress",
        "opsi_d": "Menyerah begitu saja",
        "opsi_e": "Mengeluh terus menerus",
        "jawaban_benar": "C",
        "pembahasan": "Mencari cara mengelola stress menunjukkan kemampuan manajemen stress yang baik.",
        "tips": "Pelajari teknik manajemen stress seperti mindfulness dan exercise."
    }
]

def connect_database():
    """Menghubungkan ke database MySQL"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("✓ Berhasil terhubung ke database")
            return connection
    except Error as e:
        print(f"✗ Gagal terhubung ke database: {e}")
        return None

def insert_question(connection, question, kategori_id):
    """Memasukkan soal ke database"""
    try:
        cursor = connection.cursor()
        
        sql = """
        INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, tips)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            kategori_id,
            question['pertanyaan'],
            question['opsi_a'],
            question['opsi_b'],
            question['opsi_c'],
            question['opsi_d'],
            question['opsi_e'],
            question['jawaban_benar'],
            question.get('pembahasan', ''),
            question.get('tips', '')
        )
        
        cursor.execute(sql, values)
        connection.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"✗ Gagal memasukkan soal: {e}")
        return None
    finally:
        if cursor:
            cursor.close()

def import_questions(connection, questions, kategori_id, nama_kategori):
    """Import soal ke database"""
    print(f"\n{'='*60}")
    print(f"Memulai import soal {nama_kategori}")
    print(f"{'='*60}")
    
    success_count = 0
    fail_count = 0
    
    for i, question in enumerate(questions, 1):
        question_id = insert_question(connection, question, kategori_id)
        if question_id:
            success_count += 1
            print(f"✓ Soal {i}/{len(questions)} berhasil diimport (ID: {question_id})")
        else:
            fail_count += 1
            print(f"✗ Soal {i}/{len(questions)} gagal diimport")
    
    print(f"\n{'='*60}")
    print(f"Summary Import {nama_kategori}:")
    print(f"  Total: {len(questions)} soal")
    print(f"  Berhasil: {success_count} soal")
    print(f"  Gagal: {fail_count} soal")
    print(f"{'='*60}\n")
    
    return success_count

def check_existing_questions(connection, kategori_id):
    """Cek jumlah soal yang sudah ada"""
    try:
        cursor = connection.cursor()
        sql = "SELECT COUNT(*) FROM soal WHERE kategori_id = %s"
        cursor.execute(sql, (kategori_id,))
        count = cursor.fetchone()[0]
        cursor.close()
        return count
    except Error as e:
        print(f"✗ Gagal mengecek soal: {e}")
        return 0

def main():
    """Fungsi utama"""
    print("="*60)
    print("BULK IMPORT SOAL TPA DAN PSIKOLOGIS")
    print("Aplikasi Ujian Sekolah Kedinasan")
    print("="*60)
    print(f"Waktu: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Koneksi ke database
    connection = connect_database()
    if not connection:
        return
    
    try:
        # Cek soal yang sudah ada
        print("\nCek soal yang sudah ada di database:")
        existing_tpa = check_existing_questions(connection, KATEGORI_TPA)
        existing_psiko = check_existing_questions(connection, KATEGORI_PSIKOLOGIS)
        print(f"  TPA: {existing_tpa} soal")
        print(f"  PSIKOLOGIS: {existing_psiko} soal")
        
        # Import soal TPA
        tpa_imported = import_questions(connection, TPA_QUESTIONS, KATEGORI_TPA, "TPA")
        
        # Import soal PSIKOLOGIS
        psiko_imported = import_questions(connection, PSIKOLOGIS_QUESTIONS, KATEGORI_PSIKOLOGIS, "PSIKOLOGIS")
        
        # Cek setelah import
        print("\nJumlah soal setelah import:")
        new_tpa = check_existing_questions(connection, KATEGORI_TPA)
        new_psiko = check_existing_questions(connection, KATEGORI_PSIKOLOGIS)
        print(f"  TPA: {new_tpa} soal (+{new_tpa - existing_tpa})")
        print(f"  PSIKOLOGIS: {new_psiko} soal (+{new_psiko - existing_psiko})")
        
        print("\n" + "="*60)
        print("IMPORT SELESAI")
        print("="*60)
        
    except Exception as e:
        print(f"✗ Terjadi error: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()
            print("✓ Koneksi database ditutup")

if __name__ == "__main__":
    main()
