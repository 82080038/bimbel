#!/usr/bin/env python3
"""
Script untuk membuat soal berbasis cerita (passage-based questions)
Satu cerita dapat memiliki banyak pertanyaan terkait
"""

import mysql.connector
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan',
    'charset': 'utf8mb4'
}

# Soal berbasis passage untuk setiap passage
PASSAGE_QUESTIONS = {
    1: {  # Proklamasi Kemerdekaan Indonesia
        'kategori_id': 1,
        'topic_id': 2,
        'materi_id': 1,
        'questions': [
            {
                'nomor_urutan': 1,
                'pertanyaan': 'Kapan Proklamasi Kemerdekaan Indonesia dibacakan?',
                'opsi_a': '14 Agustus 1945',
                'opsi_b': '16 Agustus 1945',
                'opsi_c': '17 Agustus 1945',
                'opsi_d': '27 Desember 1949',
                'opsi_e': '18 Agustus 1945',
                'jawaban': 'C',
                'pembahasan': 'Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal 17 Agustus 1945.'
            },
            {
                'nomor_urutan': 2,
                'pertanyaan': 'Siapa yang membacakan teks Proklamasi Kemerdekaan Indonesia?',
                'opsi_a': 'Drs. Mohammad Hatta',
                'opsi_b': 'Ir. Soekarno',
                'opsi_c': 'Mr. Soepomo',
                'opsi_d': 'Ki Hajar Dewantara',
                'opsi_e': 'Mr. Muhammad Yamin',
                'jawaban': 'B',
                'pembahasan': 'Proklamasi Kemerdekaan dibacakan oleh Ir. Soekarno didampingi oleh Drs. Mohammad Hatta.'
            },
            {
                'nomor_urutan': 3,
                'pertanyaan': 'Di mana Proklamasi Kemerdekaan Indonesia dibacakan?',
                'opsi_a': 'Gedung Merdeka',
                'opsi_b': 'Jalan Pegangsaan Timur No. 56',
                'opsi_c': 'Istana Negara',
                'opsi_d': 'Lapangan Ikada',
                'opsi_e': 'Gedung Agung',
                'jawaban': 'B',
                'pembahasan': 'Proklamasi dibacakan di Jalan Pegangsaan Timur No. 56, Jakarta.'
            },
            {
                'nomor_urutan': 4,
                'pertanyaan': 'Peristiwa apa yang terjadi pada tanggal 16 Agustus 1945?',
                'opsi_a': 'Jepang menyerah kepada Sekutu',
                'opsi_b': 'Peristiwa Rengasdengklok',
                'opsi_c': 'Proklamasi Kemerdekaan',
                'opsi_d': 'Agresi militer Belanda',
                'opsi_e': 'Pengakuan kedaulatan Indonesia',
                'jawaban': 'B',
                'pembahasan': 'Pada tanggal 16 Agustus 1945 terjadi peristiwa Rengasdengklok di mana Soekarno-Hatta dibawa oleh golongan muda.'
            },
            {
                'nomor_urutan': 5,
                'pertanyaan': 'Siapa yang menulis naskah Proklamasi?',
                'opsi_a': 'Mohammad Hatta',
                'opsi_b': 'Ahmad Soebardjo',
                'opsi_c': 'Soekarno',
                'opsi_d': 'Mr. Soepomo',
                'opsi_e': 'Golongan muda',
                'jawaban': 'C',
                'pembahasan': 'Naskah proklamasi ditulis oleh Soekarno sendiri di rumah Laksamana Maeda.'
            },
            {
                'nomor_urutan': 6,
                'pertanyaan': 'Kapan Jepang menyerah tanpa syarat kepada Sekutu?',
                'opsi_a': '14 Agustus 1945',
                'opsi_b': '16 Agustus 1945',
                'opsi_c': '17 Agustus 1945',
                'opsi_d': '18 Agustus 1945',
                'opsi_e': '27 Desember 1949',
                'jawaban': 'A',
                'pembahasan': 'Jepang menyerah tanpa syarat kepada Sekutu pada tanggal 14 Agustus 1945 setelah bom atom dijatuhkan.'
            },
            {
                'nomor_urutan': 7,
                'pertanyaan': 'Apa isi teks Proklamasi?',
                'opsi_a': 'Indonesia merdeka',
                'opsi_b': 'Kami bangsa Indonesia dan seluruh Indonesia menjunjung tinggi kemerdekaan itu',
                'opsi_c': 'Merdeka atau mati',
                'opsi_d': 'Bersatu kita teguh',
                'opsi_e': 'Satu nusa satu bangsa',
                'jawaban': 'B',
                'pembahasan': 'Teks proklamasi berbunyi: "Kami bangsa Indonesia dan seluruh Indonesia menjunjung tinggi kemerdekaan itu..."'
            },
            {
                'nomor_urutan': 8,
                'pertanyaan': 'Kapan Belanda mengakui kedaulatan Indonesia?',
                'opsi_a': '17 Agustus 1945',
                'opsi_b': '16 Agustus 1945',
                'opsi_c': '27 Desember 1949',
                'opsi_d': '14 Agustus 1945',
                'opsi_e': '18 Agustus 1945',
                'jawaban': 'C',
                'pembahasan': 'Belanda secara resmi mengakui kedaulatan Indonesia pada tanggal 27 Desember 1949.'
            },
            {
                'nomor_urutan': 9,
                'pertanyaan': 'Di rumah siapa naskah Proklamasi ditulis?',
                'opsi_a': 'Ir. Soekarno',
                'opsi_b': 'Drs. Mohammad Hatta',
                'opsi_c': 'Laksamana Maeda',
                'opsi_d': 'Ahmad Soebardjo',
                'opsi_e': 'Mr. Soepomo',
                'jawaban': 'C',
                'pembahasan': 'Naskah proklamasi ditulis di rumah Laksamana Maeda.'
            },
            {
                'nomor_urutan': 10,
                'pertanyaan': 'Apa yang dilakukan Indonesia setelah proklamasi?',
                'opsi_a': 'Menyerah kepada Belanda',
                'opsi_b': 'Melakukan perjuangan fisik dan diplomasi',
                'opsi_c': 'Mengadakan pemilihan umum',
                'opsi_d': 'Membentuk pemerintahan baru',
                'opsi_e': 'Menandatangani perjanjian damai',
                'jawaban': 'B',
                'pembahasan': 'Setelah proklamasi, Indonesia menghadapi agresi militer Belanda dan melakukan perjuangan fisik dan diplomasi.'
            }
        ]
    },
    2: {  # Pancasila sebagai Dasar Negara
        'kategori_id': 1,
        'topic_id': 1,
        'materi_id': 1,
        'questions': [
            {
                'nomor_urutan': 1,
                'pertanyaan': 'Berapa sila yang terdapat dalam Pancasila?',
                'opsi_a': '3',
                'opsi_b': '4',
                'opsi_c': '5',
                'opsi_d': '6',
                'opsi_e': '7',
                'jawaban': 'C',
                'pembahasan': 'Pancasila terdiri dari lima sila.'
            },
            {
                'nomor_urutan': 2,
                'pertanyaan': 'Sila pertama Pancasila adalah...',
                'opsi_a': 'Kemanusiaan yang Adil dan Beradab',
                'opsi_b': 'Persatuan Indonesia',
                'opsi_c': 'Ketuhanan Yang Maha Esa',
                'opsi_d': 'Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan',
                'opsi_e': 'Keadilan Sosial bagi Seluruh Rakyat Indonesia',
                'jawaban': 'C',
                'pembahasan': 'Sila pertama Pancasila adalah Ketuhanan Yang Maha Esa.'
            },
            {
                'nomor_urutan': 3,
                'pertanyaan': 'Apa fungsi Pancasila sebagai dasar negara?',
                'opsi_a': 'Sebagai hukum adat',
                'opsi_b': 'Sebagai hukum tertulis',
                'opsi_c': 'Sebagai sumber dari segala sumber hukum',
                'opsi_d': 'Sebagai hukum internasional',
                'opsi_e': 'Sebagai hukum perdata',
                'jawaban': 'C',
                'pembahasan': 'Pancasila berfungsi sebagai sumber dari segala sumber hukum negara.'
            },
            {
                'nomor_urutan': 4,
                'pertanyaan': 'Nilai-nilai apa yang menjadi sumber Pancasila?',
                'opsi_a': 'Nilai asing',
                'opsi_b': 'Nilai luhur bangsa Indonesia',
                'opsi_c': 'Nilai Barat saja',
                'opsi_d': 'Nilai Timur saja',
                'opsi_e': 'Nilai modern',
                'jawaban': 'B',
                'pembahasan': 'Pancasila bersumber dari nilai-nilai luhur bangsa Indonesia yang telah hidup sejak lama.'
            },
            {
                'nomor_urutan': 5,
                'pertanyaan': 'Contoh nilai luhur bangsa Indonesia adalah...',
                'opsi_a': 'Individualisme',
                'opsi_b': 'Gotong royong',
                'opsi_c': 'Kompetisi',
                'opsi_d': 'Materialisme',
                'opsi_e': 'Sekularisme',
                'jawaban': 'B',
                'pembahasan': 'Contoh nilai luhur bangsa Indonesia antara lain gotong royong, musyawarah, toleransi, dan keadilan.'
            },
            {
                'nomor_urutan': 6,
                'pertanyaan': 'Pancasila dipengaruhi oleh budaya...',
                'opsi_a': 'Barat saja',
                'opsi_b': 'Timur saja',
                'opsi_c': 'Indonesia saja',
                'opsi_d': 'Barat, Timur, dan Indonesia',
                'opsi_e': 'Internasional',
                'jawaban': 'D',
                'pembahasan': 'Pancasila dipengaruhi oleh budaya Barat, budaya Timur, dan budaya Indonesia sendiri.'
            },
            {
                'nomor_urutan': 7,
                'pertanyaan': 'Dalam bidang politik, Pancasila menjadi dasar...',
                'opsi_a': 'Sistem monarki',
                'opsi_b': 'Sistem demokrasi Indonesia',
                'opsi_c': 'Sistem komunis',
                'opsi_d': 'Sistem liberal',
                'opsi_e': 'Sistem oligarki',
                'jawaban': 'B',
                'pembahasan': 'Dalam bidang politik, Pancasila menjadi dasar sistem demokrasi Indonesia.'
            },
            {
                'nomor_urutan': 8,
                'pertanyaan': 'Dalam bidang ekonomi, Pancasila menjadi dasar...',
                'opsi_a': 'Sistem kapitalis',
                'opsi_b': 'Sistem sosialis',
                'opsi_c': 'Sistem ekonomi kerakyatan',
                'opsi_d': 'Sistem ekonomi liberal',
                'opsi_e': 'Sistem ekonomi komando',
                'jawaban': 'C',
                'pembahasan': 'Dalam bidang ekonomi, Pancasila menjadi dasar sistem ekonomi kerakyatan.'
            },
            {
                'nomor_urutan': 9,
                'pertanyaan': 'Pancasila berfungsi sebagai...',
                'opsi_a': 'Alat pemecah belah bangsa',
                'opsi_b': 'Alat pemersatu bangsa',
                'opsi_c': 'Alat propaganda',
                'opsi_d': 'Alat politik',
                'opsi_e': 'Alat ekonomi',
                'jawaban': 'B',
                'pembahasan': 'Pancasila berfungsi sebagai alat pemersatu bangsa.'
            },
            {
                'nomor_urutan': 10,
                'pertanyaan': 'Siapa yang merumuskan Pancasila?',
                'opsi_a': 'Penjajah Belanda',
                'opsi_b': 'Para pendiri bangsa Indonesia',
                'opsi_c': 'Pemerintah Jepang',
                'opsi_d': 'Pemerintah Amerika',
                'opsi_e': 'Pemerintah Inggris',
                'jawaban': 'B',
                'pembahasan': 'Pancasila dirumuskan oleh para pendiri bangsa Indonesia.'
            }
        ]
    },
    3: {  # Bacaan TIU - Logika Matematika
        'kategori_id': 2,
        'topic_id': 4,
        'materi_id': 1,
        'questions': [
            {
                'nomor_urutan': 1,
                'pertanyaan': 'Berapa banyak siswa yang menyukai matematika?',
                'opsi_a': '15',
                'opsi_b': '20',
                'opsi_c': '25',
                'opsi_d': '30',
                'opsi_e': '40',
                'jawaban': 'C',
                'pembahasan': 'Dalam teks disebutkan 25 siswa menyukai matematika.'
            },
            {
                'nomor_urutan': 2,
                'pertanyaan': 'Berapa banyak siswa yang menyukai ketiga mata pelajaran?',
                'opsi_a': '3',
                'opsi_b': '5',
                'opsi_c': '8',
                'opsi_d': '10',
                'opsi_e': '15',
                'jawaban': 'A',
                'pembahasan': 'Dalam teks disebutkan 3 siswa menyukai ketiga mata pelajaran tersebut.'
            },
            {
                'nomor_urutan': 3,
                'pertanyaan': 'Berapa banyak siswa yang menyukai matematika dan bahasa?',
                'opsi_a': '5',
                'opsi_b': '8',
                'opsi_c': '10',
                'opsi_d': '15',
                'opsi_e': '20',
                'jawaban': 'C',
                'pembahasan': 'Dalam teks disebutkan 10 siswa menyukai matematika dan bahasa.'
            },
            {
                'nomor_urutan': 4,
                'pertanyaan': 'Apa rumus dasar prinsip inklusi-eksklusi?',
                'opsi_a': 'Total = A + B + C',
                'opsi_b': 'Total = A + B + C - (A∩B) - (A∩C) - (B∩C)',
                'opsi_c': 'Total = A + B + C - (A∩B) - (A∩C) - (B∩C) + (A∩B∩C)',
                'opsi_d': 'Total = A × B × C',
                'opsi_e': 'Total = A / B / C',
                'jawaban': 'C',
                'pembahasan': 'Rumus dasar prinsip inklusi-eksklusi adalah: Total = A + B + C - (A∩B) - (A∩C) - (B∩C) + (A∩B∩C).'
            },
            {
                'nomor_urutan': 5,
                'pertanyaan': 'Apa ciri deret aritmatika?',
                'opsi_a': 'Rasio konstan',
                'opsi_b': 'Selisih konstan',
                'opsi_c': 'Jumlah dua suku sebelumnya',
                'opsi_d': 'Pola acak',
                'opsi_e': 'Perkalian konstan',
                'jawaban': 'B',
                'pembahasan': 'Deret aritmatika adalah deret dengan selisih antar suku yang konstan.'
            },
            {
                'nomor_urutan': 6,
                'pertanyaan': 'Apa ciri deret geometri?',
                'opsi_a': 'Selisih konstan',
                'opsi_b': 'Rasio konstan',
                'opsi_c': 'Jumlah dua suku sebelumnya',
                'opsi_d': 'Pola acak',
                'opsi_e': 'Pengurangan konstan',
                'jawaban': 'B',
                'pembahasan': 'Deret geometri adalah deret dengan rasio antar suku yang konstan.'
            },
            {
                'nomor_urutan': 7,
                'pertanyaan': 'Apa ciri deret Fibonacci?',
                'opsi_a': 'Selisih konstan',
                'opsi_b': 'Rasio konstan',
                'opsi_c': 'Setiap suku adalah jumlah dua suku sebelumnya',
                'opsi_d': 'Pola acak',
                'opsi_e': 'Perkalian konstan',
                'jawaban': 'C',
                'pembahasan': 'Deret Fibonacci adalah deret di mana setiap suku adalah jumlah dua suku sebelumnya.'
            },
            {
                'nomor_urutan': 8,
                'pertanyaan': 'Apa kunci dalam menyelesaikan soal logika matematika?',
                'opsi_a': 'Menghafal rumus',
                'opsi_b': 'Mengidentifikasi pola',
                'opsi_c': 'Menghitung cepat',
                'opsi_d': 'Menebak jawaban',
                'opsi_e': 'Membaca cepat',
                'jawaban': 'B',
                'pembahasan': 'Kemampuan mengidentifikasi pola adalah kunci dalam menyelesaikan soal-soal logika matematika.'
            },
            {
                'nomor_urutan': 9,
                'pertanyaan': 'Pola bisa berupa...',
                'opsi_a': 'Pola angka saja',
                'opsi_b': 'Pola bentuk saja',
                'opsi_c': 'Pola hubungan antar elemen saja',
                'opsi_d': 'Pola angka, bentuk, atau hubungan antar elemen',
                'opsi_e': 'Pola acak',
                'jawaban': 'D',
                'pembahasan': 'Pola bisa berupa pola angka, pola bentuk, atau pola hubungan antar elemen.'
            },
            {
                'nomor_urutan': 10,
                'pertanyaan': 'Berapa total siswa dalam kelas tersebut?',
                'opsi_a': '30',
                'opsi_b': '35',
                'opsi_c': '40',
                'opsi_d': '45',
                'opsi_e': '50',
                'jawaban': 'C',
                'pembahasan': 'Dalam teks disebutkan dalam sebuah kelas terdapat 40 siswa.'
            }
        ]
    },
    4: {  # Bacaan TPA - Verbal Reasoning
        'kategori_id': 4,
        'topic_id': 9,
        'materi_id': 1,
        'questions': [
            {
                'nomor_urutan': 1,
                'pertanyaan': 'Apa itu sinonim?',
                'opsi_a': 'Kata yang berlawanan makna',
                'opsi_b': 'Kata yang memiliki makna sama atau mirip',
                'opsi_c': 'Kata yang tidak memiliki makna',
                'opsi_d': 'Kata yang memiliki makna ganda',
                'opsi_e': 'Kata yang tidak umum',
                'jawaban': 'B',
                'pembahasan': 'Sinonim adalah kata yang memiliki makna yang sama atau mirip.'
            },
            {
                'nomor_urutan': 2,
                'pertanyaan': 'Contoh sinonim adalah...',
                'opsi_a': 'Tinggi dan rendah',
                'opsi_b': 'Besar dan gedang',
                'opsi_c': 'Panas dan dingin',
                'opsi_d': 'Cepat dan lambat',
                'opsi_e': 'Baik dan buruk',
                'jawaban': 'B',
                'pembahasan': 'Contoh sinonim: besar dan gedang, cepat dan laju.'
            },
            {
                'nomor_urutan': 3,
                'pertanyaan': 'Apa itu antonim?',
                'opsi_a': 'Kata yang memiliki makna sama',
                'opsi_b': 'Kata yang berlawanan makna',
                'opsi_c': 'Kata yang tidak memiliki makna',
                'opsi_d': 'Kata yang memiliki makna ganda',
                'opsi_e': 'Kata yang tidak umum',
                'jawaban': 'B',
                'pembahasan': 'Antonim adalah kata yang memiliki makna yang berlawanan.'
            },
            {
                'nomor_urutan': 4,
                'pertanyaan': 'Contoh antonim adalah...',
                'opsi_a': 'Besar dan gedang',
                'opsi_b': 'Cepat dan laju',
                'opsi_c': 'Tinggi dan rendah',
                'opsi_d': 'Baik dan bagus',
                'opsi_e': 'Indah dan cantik',
                'jawaban': 'C',
                'pembahasan': 'Contoh antonim: tinggi dan rendah, panas dan dingin, cepat dan lambat.'
            },
            {
                'nomor_urutan': 5,
                'pertanyaan': 'Apa itu analogi kata?',
                'opsi_a': 'Hubungan kata yang berlawanan',
                'opsi_b': 'Hubungan kata yang memiliki kesamaan pola',
                'opsi_c': 'Kata yang tidak memiliki makna',
                'opsi_d': 'Kata yang memiliki makna ganda',
                'opsi_e': 'Kata yang tidak umum',
                'jawaban': 'B',
                'pembahasan': 'Analogi kata adalah hubungan kata yang memiliki kesamaan pola.'
            },
            {
                'nomor_urutan': 6,
                'pertanyaan': 'Contoh analogi adalah...',
                'opsi_a': 'Dokter : Pasien',
                'opsi_b': 'Dokter : Guru',
                'opsi_c': 'Dokter : Obat',
                'opsi_d': 'Dokter : Rumah Sakit',
                'opsi_e': 'Dokter : Penyakit',
                'jawaban': 'A',
                'pembahasan': 'Contoh analogi: Dokter : Pasien = Guru : Murid.'
            },
            {
                'nomor_urutan': 7,
                'pertanyaan': 'Apa itu ide pokok?',
                'opsi_a': 'Gagasan pendukung',
                'opsi_b': 'Gagasan utama yang menjadi fokus bacaan',
                'opsi_c': 'Rangkuman bacaan',
                'opsi_d': 'Contoh bacaan',
                'opsi_e': 'Penutup bacaan',
                'jawaban': 'B',
                'pembahasan': 'Ide pokok adalah gagasan utama yang menjadi fokus bacaan.'
            },
            {
                'nomor_urutan': 8,
                'pertanyaan': 'Apa itu informasi tersurat?',
                'opsi_a': 'Informasi yang tidak tertulis',
                'opsi_b': 'Informasi yang secara eksplisit tertulis dalam bacaan',
                'opsi_c': 'Informasi yang disimpulkan',
                'opsi_d': 'Informasi yang tidak relevan',
                'opsi_e': 'Informasi yang salah',
                'jawaban': 'B',
                'pembahasan': 'Informasi tersurat adalah informasi yang secara eksplisit tertulis dalam bacaan.'
            },
            {
                'nomor_urutan': 9,
                'pertanyaan': 'Apa itu informasi tersirat?',
                'opsi_a': 'Informasi yang secara eksplisit tertulis',
                'opsi_b': 'Informasi yang tidak tertulis secara eksplisit tetapi dapat disimpulkan',
                'opsi_c': 'Informasi yang tidak relevan',
                'opsi_d': 'Informasi yang salah',
                'opsi_e': 'Informasi yang tidak ada',
                'jawaban': 'B',
                'pembahasan': 'Informasi tersirat adalah informasi yang tidak tertulis secara eksplisit tetapi dapat disimpulkan dari bacaan.'
            },
            {
                'nomor_urutan': 10,
                'pertanyaan': 'Hubungan dalam analogi bisa berupa...',
                'opsi_a': 'Bagian-keseluruhan saja',
                'opsi_b': 'Sebab-akibat saja',
                'opsi_c': 'Fungsi saja',
                'opsi_d': 'Bagian-keseluruhan, sebab-akibat, fungsi, atau sifat',
                'opsi_e': 'Tidak ada hubungan',
                'jawaban': 'D',
                'pembahasan': 'Hubungan dalam analogi bisa berupa bagian-keseluruhan, sebab-akibat, fungsi, atau sifat.'
            }
        ]
    },
    5: {  # Bacaan TKP - Kepribadian
        'kategori_id': 3,
        'topic_id': 7,
        'materi_id': 1,
        'questions': [
            {
                'nomor_urutan': 1,
                'pertanyaan': 'Apa itu kepribadian?',
                'opsi_a': 'Cara seseorang berpakaian',
                'opsi_b': 'Keseluruhan cara seseorang merespons lingkungan',
                'opsi_c': 'Cara seseorang berbicara',
                'opsi_d': 'Cara seseorang berjalan',
                'opsi_e': 'Cara seseorang makan',
                'jawaban': 'B',
                'pembahasan': 'Kepribadian adalah keseluruhan cara seseorang merespons lingkungan, baik secara sadar maupun tidak sadar.'
            },
            {
                'nomor_urutan': 2,
                'pertanyaan': 'Apa ciri orang introvert?',
                'opsi_a': 'Suka interaksi sosial',
                'opsi_b': 'Bertindak cepat',
                'opsi_c': 'Lebih suka sendirian',
                'opsi_d': 'Energi terisi dari interaksi',
                'opsi_e': 'Suka keramaian',
                'jawaban': 'C',
                'pembahasan': 'Orang introvert biasanya lebih suka sendirian, berpikir sebelum bertindak, dan memiliki energi yang terisi dari waktu sendiri.'
            },
            {
                'nomor_urutan': 3,
                'pertanyaan': 'Apa ciri orang ekstrovert?',
                'opsi_a': 'Lebih suka sendirian',
                'opsi_b': 'Berpikir sebelum bertindak',
                'opsi_c': 'Suka interaksi sosial',
                'opsi_d': 'Energi terisi dari waktu sendiri',
                'opsi_e': 'Suka ketenangan',
                'jawaban': 'C',
                'pembahasan': 'Orang ekstrovert biasanya lebih suka interaksi sosial, bertindak cepat, dan memiliki energi yang terisi dari interaksi dengan orang lain.'
            },
            {
                'nomor_urutan': 4,
                'pertanyaan': 'Apa itu ambivert?',
                'opsi_a': 'Orang yang sangat introvert',
                'opsi_b': 'Orang yang sangat ekstrovert',
                'opsi_c': 'Tipe kepribadian di antara introvert dan ekstrovert',
                'opsi_d': 'Orang yang tidak memiliki kepribadian',
                'opsi_e': 'Orang yang selalu berubah',
                'jawaban': 'C',
                'pembahasan': 'Ambivert adalah tipe kepribadian yang berada di antara introvert dan ekstrovert.'
            },
            {
                'nomor_urutan': 5,
                'pertanyaan': 'Teori kepribadian yang terkenal adalah...',
                'opsi_a': 'Teori gravitasi',
                'opsi_b': 'Teori psikoanalitik Freud',
                'opsi_c': 'Teori evolusi',
                'opsi_d': 'Teori relativitas',
                'opsi_e': 'Teori kuantum',
                'jawaban': 'B',
                'pembahasan': 'Teori kepribadian yang terkenal antara lain teori psikoanalitik Freud, teori behavioristik Skinner, dan teori humanistik Maslow.'
            },
            {
                'nomor_urutan': 6,
                'pertanyaan': 'Siapa yang mencetuskan teori psikoanalitik?',
                'opsi_a': 'Skinner',
                'opsi_b': 'Maslow',
                'opsi_c': 'Freud',
                'opsi_d': 'Jung',
                'opsi_e': 'Adler',
                'jawaban': 'C',
                'pembahasan': 'Teori psikoanalitik dicetuskan oleh Freud.'
            },
            {
                'nomor_urutan': 7,
                'pertanyaan': 'Tujuan tes kepribadian dalam seleksi CPNS adalah...',
                'opsi_a': 'Menilai baik-buruk seseorang',
                'opsi_b': 'Mengetahui kesesuaian dengan tuntutan pekerjaan',
                'opsi_c': 'Menghukum pelamar',
                'opsi_d': 'Mendiskriminasi pelamar',
                'opsi_e': 'Mencari kesalahan pelamar',
                'jawaban': 'B',
                'pembahasan': 'Tes kepribadian bertujuan untuk mengetahui kesesuaian antara kepribadian pelamar dengan tuntutan pekerjaan.'
            },
            {
                'nomor_urutan': 8,
                'pertanyaan': 'Tes kepribadian bukan untuk...',
                'opsi_a': 'Memahami karakteristik',
                'opsi_b': 'Memahami potensi',
                'opsi_c': 'Menilai baik-buruk seseorang',
                'opsi_d': 'Mengetahui kesesuaian',
                'opsi_e': 'Mengidentifikasi tipe kepribadian',
                'jawaban': 'C',
                'pembahasan': 'Tes kepribadian bukan untuk menilai baik-buruk seseorang, tetapi untuk memahami karakteristik dan potensi.'
            },
            {
                'nomor_urutan': 9,
                'pertanyaan': 'Orang ambivert dapat...',
                'opsi_a': 'Hanya menjadi introvert',
                'opsi_b': 'Hanya menjadi ekstrovert',
                'opsi_c': 'Menyesuaikan diri dengan situasi',
                'opsi_d': 'Tidak dapat beradaptasi',
                'opsi_e': 'Selalu bingung',
                'jawaban': 'C',
                'pembahasan': 'Orang ambivert dapat menyesuaikan diri dengan situasi, kadang-kadang lebih introvert dan kadang-kadang lebih ekstrovert.'
            },
            {
                'nomor_urutan': 10,
                'pertanyaan': 'Kepribadian mencakup...',
                'opsi_a': 'Pola pikir saja',
                'opsi_b': 'Perasaan saja',
                'opsi_c': 'Perilaku saja',
                'opsi_d': 'Pola pikir, perasaan, dan perilaku',
                'opsi_e': 'Penampilan saja',
                'jawaban': 'D',
                'pembahasan': 'Kepribadian mencakup pola pikir, perasaan, dan perilaku yang konsisten dari waktu ke waktu.'
            }
        ]
    }
}

def save_question_to_db(question_data, passage_id, kategori_id, topic_id, materi_id):
    """Simpan soal ke database"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    query = """
    INSERT INTO soal (kategori_id, topic_id, materi_id, passage_id, nomor_urutan_dalam_passage, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    cursor.execute(query, (
        kategori_id,
        topic_id,
        materi_id,
        passage_id,
        question_data['nomor_urutan'],
        question_data['pertanyaan'],
        question_data['opsi_a'],
        question_data['opsi_b'],
        question_data['opsi_c'],
        question_data['opsi_d'],
        question_data['opsi_e'],
        question_data['jawaban'],
        question_data['pembahasan'],
        datetime.now()
    ))
    
    conn.commit()
    soal_id = cursor.lastrowid
    
    cursor.close()
    conn.close()
    
    return soal_id

def main():
    print("=== MEMBUAT SOAL BERBASIS CERITA (PASSAGE-BASED QUESTIONS) ===\n")
    
    total_created = 0
    
    for passage_id, passage_data in PASSAGE_QUESTIONS.items():
        kategori_id = passage_data['kategori_id']
        topic_id = passage_data['topic_id']
        materi_id = passage_data['materi_id']
        questions = passage_data['questions']
        
        print(f"Memproses Passage ID {passage_id}:")
        print(f"  Kategori ID: {kategori_id}")
        print(f"  Topic ID: {topic_id}")
        print(f"  Materi ID: {materi_id}")
        print(f"  Jumlah soal: {len(questions)}\n")
        
        for question_data in questions:
            soal_id = save_question_to_db(question_data, passage_id, kategori_id, topic_id, materi_id)
            print(f"  ✓ Soal ID {soal_id} - Nomor {question_data['nomor_urutan']}")
            total_created += 1
        
        print()
    
    print(f"=== HASIL ===")
    print(f"Total soal berbasis cerita yang dibuat: {total_created}")
    print(f"Total passage: {len(PASSAGE_QUESTIONS)}")
    print(f"Rata-rata soal per passage: {total_created // len(PASSAGE_QUESTIONS)}")

if __name__ == "__main__":
    main()
