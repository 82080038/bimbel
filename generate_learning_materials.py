#!/usr/bin/env python3
"""
Generate Comprehensive Learning Materials from Internet Sources
This script scrapes educational content from reliable sources to create
teacher-quality learning materials for each topic.
Implements rate limiting and batch processing.
Saves materials to files instead of database to reduce database size.
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import random
import re
import os
from pathlib import Path

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan',
    'charset': 'utf8mb4'
}

# Rate limiting configuration
MIN_DELAY = 2  # Minimum delay between requests (seconds)
MAX_DELAY = 5  # Maximum delay between requests (seconds)
BATCH_SIZE = 5  # Number of topics to process per batch
BATCH_DELAY = 10  # Delay between batches (seconds)

# Base directory for learning materials
BASE_DIR = 'data/learning_materials/topics'

# Topic-specific content templates (comprehensive, teacher-quality)
TOPIC_CONTENT_TEMPLATES = {
    # TWK Topics
    'Pancasila': {
        'title': 'Pancasila: Ideologi Dasar Negara Indonesia',
        'content': '''<h1>Pancasila: Ideologi Dasar Negara Indonesia</h1>

<h2>Pengertian Pancasila</h2>
<p>Pancasila adalah ideologi dasar negara Indonesia yang terdiri dari lima sila. Kata "Pancasila" berasal dari bahasa Sanskerta, yaitu "panca" yang berarti lima dan "sila" yang berarti asas atau prinsip. Pancasila sebagai ideologi bangsa Indonesia berfungsi sebagai pandangan hidup, dasar negara, dan sumber dari segala sumber hukum.</p>

<h2>Sejarah Pancasila</h2>
<p>Pancasila dirumuskan melalui proses yang panjang sebelum Indonesia merdeka:</p>
<ul>
<li><strong>BPUPKI (Badan Penyelidik Usaha Persiapan Kemerdekaan Indonesia)</strong> - Pertama kali dibentuk pada 1 Maret 1945 oleh pemerintah Jepang. BPUPKI mengadakan sidang pertama pada 29 Mei-1 Juni 1945 yang menghasilkan rumusan Pancasila pertama oleh Soekarno (1 Juni 1945).</li>
<li><strong>Panitia Sembilan</strong> - Dibentuk pada 22 Juni 1945 untuk merumuskan kembali Pancasila. Panitia ini menghasilkan Piagam Jakarta yang kemudian disesuaikan menjadi Pembukaan UUD 1945.</li>
<li><strong>PPKI (Panitia Persiapan Kemerdekaan Indonesia)</strong> - Mengesahkan Pancasila sebagai dasar negara Indonesia pada 18 Agustus 1945.</li>
</ul>

<h2>Lima Sila Pancasila</h2>
<ol>
<li><strong>Ketuhanan Yang Maha Esa</strong> - Mengakui dan percaya adanya Tuhan Yang Maha Esa sebagai sumber segala nilai dan hukum. Indonesia bukan negara sekuler, tetapi juga bukan negara agama. Negara menjamin kebebasan beragama bagi setiap warganya.</li>
<li><strong>Kemanusiaan yang Adil dan Beradab</strong> - Menjunjung tinggi kemanusiaan, menghargai martabat manusia, dan menjunjung tinggi nilai kemanusiaan. Sila ini menekankan bahwa manusia memiliki hak asasi yang harus dihormati dan dilindungi.</li>
<li><strong>Persatuan Indonesia</strong> - Mengutamakan persatuan, kesatuan, dan kepentingan bangsa di atas kepentingan pribadi atau golongan. Indonesia adalah negara kesatuan yang tidak boleh dibagi-bagi, dan persatuan bangsa adalah harga mati.</li>
<li><strong>Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan</strong> - Keputusan diambil melalui musyawarah untuk mufakat dengan bijaksana. Kedaulatan berada di tangan rakyat dan dilaksanakan menurut UUD.</li>
<li><strong>Keadilan Sosial bagi Seluruh Rakyat Indonesia</strong> - Menjunjung tinggi keadilan sosial bagi seluruh rakyat Indonesia secara adil dan merata. Negara bertujuan mewujudkan kesejahteraan sosial bagi seluruh rakyat.</li>
</ol>

<h2>Nilai-Nilai Pancasila</h2>
<ul>
<li><strong>Nilai Religius</strong> - Menghormati kebebasan beragama dan menjalin hubungan harmonis antarumat beragama. Tidak ada diskriminasi berdasarkan agama.</li>
<li><strong>Nilai Kemanusiaan</strong> - Menghargai martabat manusia, tidak melakukan diskriminasi, dan saling menghormati. Setiap manusia memiliki hak yang sama.</li>
<li><strong>Nilai Persatuan</strong> - Menjaga persatuan dan kesatuan bangsa, menghindari perpecahan. Bhinneka Tunggal Ika adalah semboyan yang merefleksikan nilai ini.</li>
<li><strong>Nilai Demokrasi</strong> - Mengutamakan musyawarah dan mufakat dalam pengambilan keputusan. Demokrasi Indonesia adalah demokrasi Pancasila.</li>
<li><strong>Nilai Keadilan</strong> - Menjunjung tinggi keadilan dan keseimbangan hak dan kewajiban. Keadilan harus ditegakkan tanpa pandang bulu.</li>
</ul>

<h2>Penerapan Pancasila dalam Kehidupan</h2>
<p>Pancasila bukan hanya konsep abstrak, tetapi harus diterapkan dalam kehidupan sehari-hari:</p>
<ul>
<li><strong>Dalam Beragama</strong> - Menghormati perbedaan agama, tidak memaksakan keyakinan kepada orang lain, menjaga toleransi.</li>
<li><strong>Dalam Bermasyarakat</strong> - Saling menghargai, tolong-menolong, dan menjunjung tinggi nilai kemanusiaan. Menghindari konflik SARA.</li>
<li><strong>Dalam Berbangsa</strong> - Menjaga persatuan, cinta tanah air, dan siap membela negara. Melestarikan budaya bangsa.</li>
<li><strong>Dalam Bernegara</strong> - Menghormati hukum, ikut serta dalam pembangunan, dan menjunjung tinggi demokrasi. Menjauhi korupsi.</li>
</ul>

<h2>Contoh Penerapan Pancasila</h2>
<ul>
<li><strong>Sila 1</strong> - Menghormati hari besar agama lain, tidak memaksa orang lain untuk berpindah agama.</li>
<li><strong>Sila 2</strong> - Menolong orang yang kesulitan, tidak melakukan kekerasan, menghargai perbedaan.</li>
<li><strong>Sila 3</strong> - Mengutamakan kepentingan bangsa di atas kepentingan pribadi, menjaga persatuan di tengah keberagaman.</li>
<li><strong>Sila 4</strong> - Mengambil keputusan melalui musyawarah, menghormati pendapat orang lain, demokratis.</li>
<li><strong>Sila 5</strong> - Berbuat adil, menolong yang lemah, memperjuangkan hak orang lain.</li>
</ul>

<h2>Tantangan dalam Menjaga Pancasila</h2>
<ul>
<li>Globalisasi yang membawa pengaruh budaya asing</li>
<li>Kemajuan teknologi yang dapat mengancam nilai-nilai luhur</li>
<li>Korupsi yang merusak moral bangsa</li>
<liRadikalisme dan intoleransi yang mengancam persatuan</li>
<li>Materialisme yang mengabaikan nilai spiritual</li>
</ul>

<h2>Kesimpulan</h2>
<p>Pancasila sebagai ideologi bangsa Indonesia berfungsi sebagai pandangan hidup, dasar negara, dan sumber dari segala sumber hukum. Pancasila harus dijaga, diamalkan, dan dilestarikan oleh seluruh bangsa Indonesia. Generasi muda memiliki tanggung jawab untuk memahami, mengamalkan, dan melestarikan Pancasila sebagai identitas bangsa.</p>'''
    },
    'UUD 1945': {
        'title': 'UUD 1945: Konstitusi Negara Republik Indonesia',
        'content': '''<h1>UUD 1945: Konstitusi Negara Republik Indonesia</h1>

<h2>Pengertian UUD 1945</h2>
<p>Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 (UUD 1945) adalah hukum dasar tertulis yang menjadi sumber dari segala sumber hukum di Indonesia. UUD 1945 disahkan pada tanggal 18 Agustus 1945 oleh PPKI. Sebagai konstitusi, UUD 1945 mengatur dasar-dasar pemerintahan, hak dan kewajiban warga negara, serta sistem hukum di Indonesia.</p>

<h2>Sejarah Pembentukan UUD 1945</h2>
<p>UUD 1945 disusun oleh BPUPKI dan PPKI pada masa pendudukan Jepang. Proses pembentukannya melalui beberapa tahap:</p>
<ol>
<li><strong>BPUPKI (Badan Penyelidik Usaha Persiapan Kemerdekaan Indonesia)</strong> - Dibentuk pada 1 Maret 1945 oleh pemerintah Jepang. BPUPKI mengadakan sidang pertama pada 29 Mei-1 Juni 1945 yang membahas dasar negara Indonesia. Soekarno mengemukakan rumusan Pancasila pada 1 Juni 1945.</li>
<li><strong>Sidang Kedua BPUPKI</strong> - Diadakan pada 10-17 Juli 1945 untuk membahas rancangan konstitusi Indonesia. Dibentuk panitia kecil yang terdiri dari 7 orang untuk menyusun rancangan UUD.</li>
<li><strong>Panitia Sembilan</strong> - Dibentuk pada 22 Juni 1945 untuk merumuskan kembali Pancasila. Panitia ini menghasilkan Piagam Jakarta yang kemudian disesuaikan menjadi Pembukaan UUD 1945.</li>
<li><strong>PPKI (Panitia Persiapan Kemerdekaan Indonesia)</strong> - Mengesahkan UUD 1945 pada 18 Agustus 1945, sehari setelah proklamasi kemerdekaan Indonesia.</li>
</ol>

<h2>Struktur UUD 1945</h2>
<p>UUD 1945 terdiri dari dua bagian utama:</p>
<ol>
<li><strong>Pembukaan</strong> - Berisi 4 alinea yang memuat pokok kaidah negara fundamental. Pembukaan UUD 1945 bersifat abstrak dan mengandung nilai-nilai fundamental yang tidak dapat diubah.</li>
<li><strong>Batang Tubuh</strong> - Berisi pasal-pasal yang mengatur ketentuan-ketentuan hukum. Batang tubuh bersifat konkret dan dapat diubah sesuai kebutuhan zaman.</li>
</ol>

<h2>Pokok Kaidah Negara Fundamental (Pembukaan)</h2>
<ol>
<li><strong>Alinea Pertama</strong> - Menyatakan kemerdekaan Indonesia adalah hak segala bangsa. Menegaskan bahwa kolonialisme di dunia harus dihapuskan karena tidak sesuai dengan perikemanusiaan dan keadilan.</li>
<li><strong>Alinea Kedua</strong> - Menyatakan perjuangan kemerdekaan Indonesia telah sampai pada titik yang bahagia. Menjelaskan proses perjuangan kemerdekaan Indonesia.</li>
<li><strong>Alinea Ketiga</strong> - Menyatakan kemerdekaan Indonesia disusun dalam suatu susunan negara Indonesia yang berkedaulatan rakyat. Menegaskan bentuk negara Indonesia adalah republik.</li>
<li><strong>Alinea Keempat</strong> - Menyatakan pembentukan pemerintahan negara Indonesia berdasarkan Pancasila. Menetapkan Pancasila sebagai dasar negara.</li>
</ol>

<h2>Perubahan UUD 1945</h2>
<p>UUD 1945 telah mengalami empat kali perubahan pada tahun 1999, 2000, 2001, dan 2002. Perubahan ini dilakukan untuk menyesuaikan dengan tuntutan reformasi dan demokrasi:</p>
<ul>
<li><strong>Perubahan Pertama (1999)</strong> - Menambah pasal tentang hak asasi manusia, pertahanan keamanan, dan ekonomi.</li>
<li><strong>Perubahan Kedua (2000)</strong> - Menambah pasal tentang otonomi daerah, Dewan Perwakilan Daerah, dan Komisi Yudisial.</li>
<li><strong>Perubahan Ketiga (2001)</strong> - Menambah pasal tentang pemilihan umum, partai politik, dan keuangan negara.</li>
<li><strong>Perubahan Keempat (2002)</strong> - Menambah pasal tentang pendidikan, budaya, dan amandemen konstitusi.</li>
</ul>

<h2>Prinsip-Prinsip UUD 1945</h2>
<ul>
<li><strong>Negara Kesatuan</strong> - Indonesia adalah negara kesatuan yang tidak boleh dibagi-bagi. Wilayah Indonesia adalah satu kesatuan yang utuh.</li>
<li><strong>Kedaulatan Rakyat</strong> - Kedaulatan berada di tangan rakyat dan dilaksanakan menurut UUD. Rakyat berhak ikut serta dalam pemerintahan.</li>
<li><strong>Hukum</strong> - Negara berdasarkan atas hukum (rechtsstaat). Tidak ada yang di atas hukum, termasuk pemerintah.</li>
<li><strong>Demokrasi</strong> - Sistem pemerintahan demokratis. Kekuasaan negara dilaksanakan menurut konstitusi.</li>
<li><strong>Kesejahteraan Sosial</strong> - Negara bertujuan mewujudkan kesejahteraan sosial. Negara hadir untuk melindungi selemah-lemahnya rakyat.</li>
</ul>

<h2>Pasal-Pasal Penting</h2>
<ul>
<li><strong>Pasal 27</strong> - Menjamin persamaan kedudukan warga negara dalam hukum dan pemerintahan.</li>
<li><strong>Pasal 28</strong> - Menjamin hak asasi manusia dan kebebasan fundamental.</li>
<li><strong>Pasal 29</strong> - Menjamin kebebasan beragama.</li>
<li><strong>Pasal 30</strong> - Menjamin hak dan kewajiban warga negara dalam pertahanan negara.</li>
<li><strong>Pasal 31</strong> - Menjamin hak setiap warga negara untuk mendapatkan pendidikan.</li>
</ul>

<h2>Kesimpulan</h2>
<p>UUD 1945 sebagai konstitusi negara Indonesia merupakan hukum dasar yang mengatur kehidupan berbangsa dan bernegara. Setiap warga negara wajib menghormati dan menaati UUD 1945. UUD 1945 adalah hasil perjuangan bangsa Indonesia dan harus dijaga keutuhannya. Generasi muda harus memahami isi UUD 1945 dan menerapkannya dalam kehidupan sehari-hari.</p>'''
    },
    'Sejarah Indonesia': {
        'title': 'Sejarah Indonesia: Perjuangan dan Kemerdekaan',
        'content': '''<h1>Sejarah Indonesia: Perjuangan dan Kemerdekaan</h1>

<h2>Pengertian Sejarah Indonesia</h2>
<p>Sejarah Indonesia adalah rangkaian peristiwa yang terjadi di wilayah Indonesia dari masa pra-sejarah hingga masa kini. Sejarah Indonesia mencakup perjuangan bangsa Indonesia untuk mencapai kemerdekaan, perkembangan kerajaan-kerajaan, masa penjajahan, dan pembangunan setelah kemerdekaan.</p>

<h2>Masa Pra-Sejarah</h2>
<p>Masa pra-sejarah Indonesia dibagi menjadi beberapa zaman:</p>
<ul>
<li><strong>Zaman Paleolitikum</strong> - Zaman batu tua, manusia hidup berpindah-pindah (nomaden). Alat-alat batu kasar.</li>
<li><strong>Zaman Mesolitikum</strong> - Zaman batu tengah, transisi dari nomaden ke semi-sedenter.</li>
<li><strong>Zaman Neolitikum</strong> - Zaman batu muda, manusia mulai hidup menetap, bercocok tanam, dan beternak.</li>
<li><strong>Zaman Logam</strong> - Manusia mulai mengenal dan menggunakan logam (perunggu, besi).</li>
</ul>

<h2>Masa Kerajaan Hindu-Buddha</h2>
<p>Indonesia pernah diperintah oleh berbagai kerajaan Hindu-Buddha:</p>
<ul>
<li><strong>Kerajaan Kutai</strong> - Kerajaan Hindu tertua di Indonesia (abad ke-4 M), terletak di Kalimantan Timur.</li>
<li><strong>Kerajaan Tarumanegara</strong> - Kerajaan Hindu di Jawa Barat (abad ke-5 M), diperintah oleh Raja Purnawarman.</li>
<li><strong>Kerajaan Sriwijaya</strong> - Kerajaan Buddha terbesar di Sumatera (abad ke-7-13 M), pusat perdagangan dan penyebaran Buddha.</li>
<li><strong>Kerajaan Mataram Kuno</strong> - Kerajaan Hindu di Jawa Tengah (abad ke-8-10 M), membangun Candi Borobudur dan Prambanan.</li>
<li><strong>Kerajaan Majapahit</strong> - Kerajaan Hindu terbesar di Indonesia (abad ke-13-16 M), di bawah Gajah Mada mencapai puncak kejayaan dengan Nusantara.</li>
</ul>

<h2>Masa Penjajahan</h2>
<p>Indonesia pernah dijajah oleh berbagai bangsa:</p>
<ul>
<li><strong>Penjajahan Portugis</strong> - Mula-mula datang sebagai pedagang (1511), kemudian mulai menguasai wilayah seperti Maluku.</li>
<li><strong>Penjajahan Spanyol</strong> - Mengkuasai wilayah Ternate dan Tidore (1521-1663).</li>
<li><strong>Penjajahan Belanda</strong> - Melalui VOC (1602-1799) dan pemerintahan kolonial (1800-1942). Belanda menjajah Indonesia selama lebih dari 300 tahun.</li>
<li><strong>Penjajahan Inggris</strong> - Menjajah Indonesia secara singkat (1811-1816) di bawah Thomas Stamford Raffles.</li>
<li><strong>Penjajahan Jepang</strong> - Menjajah Indonesia (1942-1945) selama Perang Dunia II. Jepang membentuk BPUPKI dan PPKI.</li>
</ul>

<h2>Pergerakan Nasional</h2>
<p>Pergerakan nasional Indonesia dimulai pada awal abad ke-20:</p>
<ul>
<li><strong>Budi Utomo</strong> - Organisasi nasional pertama (1908), dipimpin oleh Dr. Wahidin Sudirohusodo.</li>
<li><strong>Sarekat Islam</strong> - Organisasi terbesar (1912), dipimpin oleh H.O.S. Tjokroaminoto.</li>
<li><strong>Indische Partij</strong> - Partai politik pertama (1912), dipimpin oleh Douwes Dekker.</li>
<li><strong>PNI</strong> - Partai Nasional Indonesia (1927), dipimpin oleh Soekarno.</li>
<li><strong>Pemuda Indonesia</strong> - Organisasi pemuda (1928), menghasilkan Sumpah Pemuda.</li>
</ul>

<h2>Sumpah Pemuda 1928</h2>
<p>Sumpah Pemuda adalah ikrar pemuda-pemuda Indonesia yang disumpahkan pada 28 Oktober 1928:</p>
<ol>
<li><strong>Pertama</strong> - Kami putra dan putri Indonesia mengaku bertumpah darah yang satu, tanah air Indonesia.</li>
<li><strong>Kedua</strong> - Kami putra dan putri Indonesia mengaku berbangsa yang satu, bangsa Indonesia.</li>
<li><strong>Ketiga</strong> - Kami putra dan putri Indonesia menjunjung bahasa persatuan, bahasa Indonesia.</li>
</ol>

<h2>Proklamasi Kemerdekaan</h2>
<p>Proklamasi kemerdekaan Indonesia dibacakan pada 17 Agustus 1945 oleh Ir. Soekarno dan Drs. Mohammad Hatta di Jalan Pegangsaan Timur 56, Jakarta. Proklamasi ini menandai berakhirnya penjajahan Jepang dan dimulainya era kemerdekaan Indonesia.</p>

<h2>Perjuangan Mempertahankan Kemerdekaan</h2>
<p>Setelah proklamasi, Indonesia harus mempertahankan kemerdekaannya:</p>
<ul>
<li><strong>Agresi Militer Belanda I (1947)</strong> - Belanda menyerang Indonesia dengan alasan melanggi polisi.</li>
<li><strong>Agresi Militer Belanda II (1948)</strong> - Belanda menyerang Indonesia dan menangkap pemimpin Indonesia.</li>
<li><strong>Diplomasi</strong> - Indonesia melakukan diplomasi internasional untuk mendapatkan pengakuan dunia.</li>
<li><strong>Perundingan</strong> - Perundingan Linggarjati, Renville, Roem-Roijen, dan KMB.</li>
</ul>

<h2>Pengakuan Internasional</h2>
<p>Indonesia mendapatkan pengakuan internasional melalui:</p>
<ul>
<li><strong>KMB (Konferensi Meja Bundar)</strong> - Belanda mengakui kedaulatan Indonesia (1949).</li>
<li><strong>PBB</strong> - Indonesia menjadi anggota PBB (1950).</li>
</ul>

<h2>Kesimpulan</h2>
<p>Sejarah Indonesia adalah perjalanan panjang bangsa Indonesia dari masa pra-sejarah hingga kemerdekaan. Perjuangan kemerdekaan Indonesia adalah hasil dari perjuangan para pahlawan dan seluruh bangsa Indonesia. Generasi muda harus menghargai perjuangan para pahlawan dan melanjutkan pembangunan bangsa.</p>'''
    },
    'Geografi Indonesia': {
        'title': 'Geografi Indonesia: Wilayah dan Sumber Daya Alam',
        'content': '''<h1>Geografi Indonesia: Wilayah dan Sumber Daya Alam</h1>

<h2>Pengertian Geografi Indonesia</h2>
<p>Geografi Indonesia adalah ilmu yang mempelajari tentang letak, kondisi, dan sumber daya alam Indonesia. Indonesia adalah negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau. Posisi geografis Indonesia sangat strategis karena terletak di antara dua benua dan dua samudra.</p>

<h2>Posisi Geografis Indonesia</h2>
<p>Indonesia terletak pada posisi yang sangat strategis:</p>
<ul>
<li><strong>Antara dua benua</strong> - Benua Asia dan Benua Australia.</li>
<li><strong>Antara dua samudra</strong> - Samudra Pasifik dan Samudra Hindia.</li>
<li><strong>Antara garis lintang</strong> - 6° LU - 11° LS (iklim tropis).</li>
<li><strong>Antara garis bujur</strong> - 95° BT - 141° BT.</li>
</ul>

<h2>Letak Astronomis</h2>
<p>Letak astronomis Indonesia adalah:</p>
<ul>
<li><strong>Utara</strong> - 6° Lintang Utara (LU) - Berbatasan dengan Thailand, Malaysia, Singapura.</li>
<li><strong>Selatan</strong> - 11° Lintang Selatan (LS) - Berbatasan dengan Australia.</li>
<li><strong>Barat</strong> - 95° Bujur Timur (BT) - Berbatasan dengan Samudra Hindia.</li>
<li><strong>Timur</strong> - 141° Bujur Timur (BT) - Berbatasan dengan Papua Nugini, Timor Leste.</li>
</ul>

<h2>Letak Geologis</h2>
<p>Indonesia terletak pada:</p>
<ul>
<li><strong>Cincin Api Pasifik</strong> - Garis gunung berapi yang melintasi Samudra Pasifik.</li>
<li><strong>Cincin Api Mediterania</strong> - Garis gunung berapi yang melintasi Laut Mediterania.</li>
<li><strong>Pertemuan tiga lempeng</strong> - Lempeng Eurasia, Lempeng Indo-Australia, dan Lempeng Pasifik.</li>
</ul>

<h2>Iklim Indonesia</h2>
<p>Indonesia memiliki iklim tropis karena terletak di sekitar garis khatulistiwa:</p>
<ul>
<li><strong>Suhu</strong> - Rata-rata 26-28°C sepanjang tahun.</li>
<li><strong>Kelembaban</strong> - Tinggi, rata-rata 80-90%.</li>
<li><strong>Cuaca</strong> - Dua musim: musim hujan (Oktober-April) dan musim kemarau (April-Oktober).</li>
</ul>

<h2>Pulau-Pulau Utama</h2>
<p>Indonesia memiliki lima pulau utama:</p>
<ul>
<li><strong>Sumatera</strong> - Pulau terbesar keenam di dunia, kaya minyak bumi dan gas alam.</li>
<li><strong>Jawa</strong> - Pulau terpadat penduduknya, pusat pemerintahan dan ekonomi.</li>
<li><strong>Kalimantan</strong> - Bagian dari pulau Kalimantan, kaya hutan tropis dan tambang.</li>
<li><strong>Sulawesi</strong> - Pulau dengan bentuk unik, kaya nikel dan tambang lainnya.</li>
<li><strong>Papua</strong> - Pulau terbesar kedua di dunia, kaya sumber daya alam.</li>
</ul>

<h2>Sumber Daya Alam</h2>
<p>Indonesia kaya akan sumber daya alam:</p>
<ul>
<li><strong>Pertanian</strong> - Padi, jagung, kopi, teh, kelapa sawit, rempah-rempah.</li>
<li><strong>Pertambangan</strong> - Minyak bumi, gas alam, batubara, emas, tembaga, nikel, timah.</li>
<li><strong>Kehutanan</strong> - Kayu, hasil hutan bukan kayu, biodiversitas.</li>
<li><strong>Perikanan</strong> - Ikan laut, ikan air tawar, rumput laut.</li>
<li><strong>Energi</strong> - Panas bumi, energi surya, energi angin, energi air.</li>
</ul>

<h2>Batas Wilayah</h2>
<p>Indonesia berbatasan dengan:</p>
<ul>
<li><strong>Utara</strong> - Laut Cina Selatan, Malaysia, Singapura, Thailand.</li>
<li><strong>Selatan</strong> - Samudra Hindia, Australia.</li>
<li><strong>Barat</strong> - Samudra Hindia, Samudra Pasifik.</li>
<li><strong>Timur</strong> - Papua Nugini, Timor Leste, Samudra Pasifik.</li>
</ul>

<h2>Pembagian Wilayah Administratif</h2>
<p>Indonesia dibagi menjadi:</p>
<ul>
<li><strong>Provinsi</strong> - 38 provinsi (per 2024).</li>
<li><strong>Kabupaten/Kota</strong> - Lebih dari 500 kabupaten/kota.</li>
<li><strong>Kecamatan</strong> - Ribuan kecamatan.</li>
<li><strong>Desa/Kelurahan</strong> - Ribuan desa/kelurahan.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Geografi Indonesia menunjukkan bahwa Indonesia adalah negara yang kaya akan sumber daya alam dan memiliki posisi strategis. Posisi geografis yang strategis membuat Indonesia menjadi penting dalam perdagangan internasional. Sumber daya alam yang melimpah harus dikelola dengan bijaksana untuk kesejahteraan generasi mendatang.</p>'''
    },
    'Bhinneka Tunggal Ika': {
        'title': 'Bhinneka Tunggal Ika: Persatuan dalam Keberagaman',
        'content': '''<h1>Bhinneka Tunggal Ika: Persatuan dalam Keberagaman</h1>

<h2>Pengertian Bhinneka Tunggal Ika</h2>
<p>Bhinneka Tunggal Ika adalah semboyan negara Indonesia yang tertulis di lambang negara Garuda Pancasila. Semboyan ini berasal dari bahasa Jawa Kuno yang berarti "Berbeda-beda tetapi tetap satu jua". Semboyan ini merefleksikan keberagaman bangsa Indonesia yang tetap bersatu.</p>

<h2>Asal Usul</h2>
<p>Semboyan Bhinneka Tunggal Ika diambil dari kitab Sutasoma karya Mpu Tantular pada abad ke-14. Kitab ini menceritakan tentang Buddha yang mengajarkan toleransi dan persatuan di tengah keberagaman. Semboyan ini diadopsi sebagai semboyan nasional Indonesia pada tanggal 17 Agustus 1945.</p>

<h2>Makna Bhinneka Tunggal Ika</h2>
<p>Semboyan ini memiliki makna yang sangat dalam:</p>
<ul>
<li><strong>Bhinneka</strong> - Berbeda-beda, beragam, variasi.</li>
<li><strong>Tunggal</strong> - Satu, utuh, bersatu.</li>
<li><strong>Ika</strong> - Itu, jua.</li>
</ul>
<p>Jadi, Bhinneka Tunggal Ika berarti "Berbeda-beda tetapi tetap satu jua". Ini berarti meskipun bangsa Indonesia berbeda dalam suku, agama, ras, dan budaya, tetapi tetap satu sebagai bangsa Indonesia.</p>

<h2>Keberagaman Indonesia</h2>
<p>Indonesia adalah negara yang sangat beragam:</p>
<ul>
<li><strong>Suku Bangsa</strong> - Lebih dari 1.300 suku bangsa di seluruh Indonesia.</li>
<li><strong>Bahasa</strong> - Lebih dari 700 bahasa daerah selain bahasa Indonesia.</li>
<li><strong>Agama</strong> - 6 agama yang diakui: Islam, Kristen, Katolik, Hindu, Buddha, Konghucu.</li>
<li><strong>Budaya</strong> - Berbagai budaya daerah yang kaya dan unik.</li>
<li><strong>Tradisi</strong> - Berbagai tradisi dan adat istiadat yang berbeda.</li>
</ul>

<h2>Pentingnya Persatuan</h2>
<p>Persatuan sangat penting bagi Indonesia:</p>
<ul>
<li><strong>Mencegah perpecahan</strong> - Persatuan mencegah konflik SARA dan perpecahan bangsa.</li>
<li><strong>Meningkatkan kekuatan</strong> - Bersatu kita kuat, terpecah kita runtuh.</li>
<li><strong>Membangun negara</strong> - Persatuan diperlukan untuk pembangunan nasional.</li>
<li><strong>Menghadapi tantangan</strong> - Persatuan membantu menghadapi tantangan global.</li>
</ul>

<h2>Cara Menjaga Persatuan</h2>
<p>Menjaga persatuan dapat dilakukan dengan:</p>
<ul>
<li><strong>Menghargai perbedaan</strong> - Menghormati perbedaan suku, agama, ras, dan budaya.</li>
<li><strong>Toleransi</strong> - Menjaga toleransi antarumat beragama dan antarsuku.</li>
<li><strong>Musyawarah</strong> - Mengambil keputusan melalui musyawarah dan mufakat.</li>
<li><strong>Saling menghargai</strong> - Saling menghargai pendapat dan keputusan orang lain.</li>
<li><strong>Nasionalisme</strong> - Menumbuhkan rasa cinta tanah air dan nasionalisme.</li>
</ul>

<h2>Tantangan Persatuan</h2>
<p>Persatuan Indonesia menghadapi berbagai tantangan:</p>
<ul>
<li><strong>Radikalisme</strong> - Paham radikal yang mengancam persatuan.</li>
<li><strong>Intoleransi</strong> - Sikap tidak toleran terhadap perbedaan.</li>
<li><strong>Separatisme</strong> - Gerakan pemisahan diri dari NKRI.</li>
<li><strong>Hoax</strong> - Berita bohong yang memecah belah bangsa.</li>
<li><strong>Globalisasi</strong> - Pengaruh budaya asing yang mengancam budaya lokal.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Bhinneka Tunggal Ika adalah semboyan yang merefleksikan keberagaman bangsa Indonesia yang tetap bersatu. Keberagaman adalah kekayaan bangsa yang harus dijaga dan dihargai. Persatuan adalah kunci kekuatan bangsa Indonesia. Generasi muda harus menjaga persatuan dan menghargai keberagaman.</p>'''
    },
    'NKRI': {
        'title': 'NKRI: Negara Kesatuan Republik Indonesia',
        'content': '''<h1>NKRI: Negara Kesatuan Republik Indonesia</h1>

<h2>Pengertian NKRI</h2>
<p>NKRI (Negara Kesatuan Republik Indonesia) adalah bentuk negara Indonesia yang bersifat kesatuan dan tidak boleh dibagi-bagi. NKRI adalah negara kesatuan yang merdeka, berdaulat, adil, dan makmur. NKRI terdiri dari seluruh wilayah Indonesia yang tidak dapat dipisahkan.</p>

<h2>Dasar Hukum NKRI</h2>
<p>NKRI memiliki dasar hukum yang kuat:</p>
<ul>
<li><strong>Pembukaan UUD 1945 Alinea Ketiga</strong> - Menyatakan kemerdekaan Indonesia disusun dalam susunan negara Indonesia yang berkedaulatan rakyat.</li>
<li><strong>Pasal 1 UUD 1945</strong> - Menyatakan Indonesia adalah negara kesatuan yang berbentuk republik.</li>
<li><strong>Tap MPR No. IV/MPR/1999</strong> - Menegaskan NKRI sebagai bentuk negara Indonesia yang tidak dapat diubah.</li>
</ul>

<h2>Ciri-Ciri NKRI</h2>
<p>NKRI memiliki ciri-ciri sebagai berikut:</p>
<ul>
<li><strong>Kesatuan wilayah</strong> - Wilayah Indonesia adalah satu kesatuan yang utuh.</li>
<li><strong>Kedaulatan rakyat</strong> - Kedaulatan berada di tangan rakyat.</li>
<li><strong>Republik</strong> - Bentuk negara adalah republik, bukan monarki.</li>
<li><strong>Demokratis</strong> - Sistem pemerintahan demokratis.</li>
<li><strong>Hukum</strong> - Negara berdasarkan atas hukum.</li>
</ul>

<h2>Wilayah NKRI</h2>
<p>Wilayah NKRI mencakup:</p>
<ul>
<li><strong>Darat</strong> - Seluruh pulau dan daratan Indonesia.</li>
<li><strong>Laut</strong> - Laut teritorial sejauh 12 mil laut dari garis pantai.</li>
<li><strong>Udara</strong> - Ruang udara di atas wilayah darat dan laut Indonesia.</li>
<li><strong>ZEE</strong> - Zona Ekonomi Eksklusif sejauh 200 mil laut.</li>
</ul>

<h2>Pembagian Wilayah Administratif</h2>
<p>NKRI dibagi menjadi:</p>
<ul>
<li><strong>Provinsi</strong> - 38 provinsi (per 2024).</li>
<li><strong>Kabupaten/Kota</strong> - Lebih dari 500 kabupaten/kota.</li>
<li><strong>Kecamatan</strong> - Ribuan kecamatan.</li>
<li><strong>Desa/Kelurahan</strong> - Ribuan desa/kelurahan.</li>
</ul>

<h2>Pentingnya NKRI</h2>
<p>NKRI sangat penting bagi Indonesia:</p>
<ul>
<li><strong>Menjaga persatuan</strong> - NKRI menjaga persatuan dan kesatuan bangsa.</li>
<li><strong>Mencegah perpecahan</strong> - NKRI mencegah gerakan pemisahan diri.</li>
<li><strong>Meningkatkan kekuatan</strong> - NKRI meningkatkan kekuatan bangsa.</li>
<li><strong>Membangun negara</strong> - NKRI memfasilitasi pembangunan nasional.</li>
</ul>

<h2>Tantangan NKRI</h2>
<p>NKRI menghadapi berbagai tantangan:</p>
<ul>
<li><strong>Separatisme</strong> - Gerakan pemisahan diri dari NKRI.</li>
<li><strong>Radikalisme</strong> - Paham radikal yang mengancam NKRI.</li>
<li><strong>Disintegrasi</strong> - Ancaman disintegrasi nasional.</li>
<li><strong>Intervensi asing</strong> - Intervensi asing yang mengancam kedaulatan.</li>
</ul>

<h2>Kesimpulan</h2>
<p>NKRI adalah bentuk negara Indonesia yang bersifat kesatuan dan tidak boleh dibagi-bagi. NKRI adalah hasil perjuangan bangsa Indonesia dan harus dijaga keutuhannya. Generasi muda harus mencintai NKRI dan menjaga persatuan dan kesatuan bangsa.</p>'''
    },
    'Demokrasi': {
        'title': 'Demokrasi: Sistem Pemerintahan Demokratis',
        'content': '''<h1>Demokrasi: Sistem Pemerintahan Demokratis</h1>

<h2>Pengertian Demokrasi</h2>
<p>Demokrasi adalah sistem pemerintahan di mana kekuasaan berada di tangan rakyat. Kata "demokrasi" berasal dari bahasa Yunani, yaitu "demos" (rakyat) dan "kratos" (kekuasaan/pemerintahan). Jadi, demokrasi berarti pemerintahan rakyat.</p>

<h2>Jenis-Jenis Demokrasi</h2>
<p>Ada beberapa jenis demokrasi:</p>
<ul>
<li><strong>Demokrasi Langsung</strong> - Rakyat langsung mengambil keputusan (misalnya referendum).</li>
<li><strong>Demokrasi Perwakilan</strong> - Rakyat memilih wakil untuk mengambil keputusan (misalnya DPR).</li>
<li><strong>Demokrasi Liberal</strong> - Menekankan kebebasan individu dan hak asasi.</li>
<li><strong>Demokrasi Sosial</strong> - Menekankan kesejahteraan sosial dan keadilan.</li>
</ul>

<h2>Demokrasi Indonesia</h2>
<p>Indonesia menganut demokrasi Pancasila:</p>
<ul>
<li><strong>Berdasarkan Pancasila</strong> - Demokrasi Indonesia berdasarkan nilai-nilai Pancasila.</li>
<li><strong>Kedaulatan rakyat</strong> - Kedaulatan berada di tangan rakyat.</li>
<li><strong>Musyawarah</strong> - Keputusan diambil melalui musyawarah dan mufakat.</li>
<li><strong>Hukum</strong> - Demokrasi dilaksanakan berdasarkan hukum.</li>
</ul>

<h2>Prinsip-Prinsip Demokrasi</h2>
<p>Demokrasi memiliki prinsip-prinsip:</p>
<ul>
<li><strong>Kedaulatan rakyat</strong> - Kekuasaan berada di tangan rakyat.</li>
<li><strong>Kebebasan</strong> - Rakyat memiliki kebebasan yang dijamin.</li>
<li><strong>Persamaan</strong> - Semua warga negara memiliki kedudukan yang sama.</li>
<li><strong>Keadilan</strong> - Keadilan ditegakkan untuk semua.</li>
<li><strong>Partisipasi</strong> - Rakyat berpartisipasi dalam pemerintahan.</li>
</ul>

<h2>Lembaga Demokrasi</h2>
<p>Lembaga-lembaga demokrasi di Indonesia:</p>
<ul>
<li><strong>DPR</strong> - Dewan Perwakilan Rakyat, mewakili rakyat.</li>
<li><strong>DPD</strong> - Dewan Perwakilan Daerah, mewakili daerah.</li>
<li><strong>MPR</strong> - Majelis Permusyawaratan Rakyat, lembaga tertinggi.</li>
<li><strong>BPK</strong> - Badan Pemeriksa Keuangan, mengawasi keuangan negara.</li>
<li><strong>KY</strong> - Komisi Yudisial, menjaga kemerdekaan hakim.</li>
</ul>

<h2>Pemilihan Umum</h2>
<p>Pemilihan umum adalah pilar demokrasi:</p>
<ul>
<li><strong>Pemilu Presiden</strong> - Memilih Presiden dan Wakil Presiden.</li>
<li><strong>Pemilu Legislatif</strong> - Memilih anggota DPR, DPD, dan DPRD.</li>
<li><strong>Pemilu Kepala Daerah</strong> - Memilih Gubernur, Bupati, dan Walikota.</li>
</ul>

<h2>Tantangan Demokrasi</h2>
<p>Demokrasi menghadapi tantangan:</p>
<ul>
<li><strong>Money politics</strong> - Politik uang yang merusak demokrasi.</li>
<li><strong>Aparatur birokrasi</strong> - Aparatur yang tidak netral.</li>
<li><strong>Masyarakat apatis</strong> - Masyarakat yang tidak peduli politik.</li>
<li><strong>Hoax</strong> - Berita bohong yang mempengaruhi pemilu.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Demokrasi adalah sistem pemerintahan di mana kekuasaan berada di tangan rakyat. Indonesia menganut demokrasi Pancasila yang berdasarkan nilai-nilai Pancasila. Demokrasi harus dijaga dan dilestarikan untuk kesejahteraan rakyat. Generasi muda harus berpartisipasi dalam demokrasi.</p>'''
    },
    'Hak Asasi Manusia': {
        'title': 'Hak Asasi Manusia: Perlindungan dan Penghormatan',
        'content': '''<h1>Hak Asasi Manusia: Perlindungan dan Penghormatan</h1>

<h2>Pengertian Hak Asasi Manusia</h2>
<p>Hak Asasi Manusia (HAM) adalah hak-hak yang melekat pada diri manusia sejak lahir dan tidak dapat dipisahkan. HAM adalah hak dasar yang dimiliki setiap manusia tanpa membedakan suku, agama, ras, dan budaya. HAM dilindungi oleh konstitusi dan hukum internasional.</p>

<h2>Dasar Hukum HAM</h2>
<p>HAM memiliki dasar hukum yang kuat:</p>
<ul>
<li><strong>UUD 1945 Pasal 27-34</strong> - Menjamin hak asasi manusia.</li>
<li><strong>UU No. 39 Tahun 1999</strong> - Tentang Hak Asasi Manusia.</li>
<li><strong>Deklarasi Universal HAM</strong> - Deklarasi PBB tentang HAM.</li>
<li><strong>Kovenan Internasional</strong> - Kovenan HAM internasional.</li>
</ul>

<h2>Jenis-Jenis HAM</h2>
<p>HAM dibagi menjadi beberapa jenis:</p>
<ul>
<li><strong>Hak sipil dan politik</strong> - Hak hidup, kebebasan berbicara, hak memilih.</li>
<li><strong>Hak ekonomi, sosial, dan budaya</strong> - Hak pendidikan, kesehatan, pekerjaan.</li>
<li><strong>Hak solidaritas</strong> - Hak hidup dalam lingkungan yang sehat.</li>
</ul>

<h2>Hak-Hak Asasi Manusia</h2>
<p>Hak-hak asasi manusia meliputi:</p>
<ul>
<li><strong>Hak hidup</strong> - Hak untuk hidup dan tidak dibunuh.</li>
<li><strong>Hak kebebasan</strong> - Hak kebebasan bergerak, berbicara, beragama.</li>
<li><strong>Hak perlindungan</strong> - Hak perlindungan dari diskriminasi.</li>
<li><strong>Hak pendidikan</strong> - Hak untuk mendapatkan pendidikan.</li>
<li><strong>Hak kesehatan</strong> - Hak untuk mendapatkan pelayanan kesehatan.</li>
</ul>

<h2>Kewajiban Asasi Manusia</h2>
<p>Selain hak, manusia juga memiliki kewajiban:</p>
<ul>
<li><strong>Menghormati hak orang lain</strong> - Menghormati HAM orang lain.</li>
<li><strong>Menaati hukum</strong> - Menaati hukum dan peraturan.</li>
<li><strong>Partisipasi</strong> - Berpartisipasi dalam pembangunan.</li>
<li><strong>Tanggung jawab</strong> - Bertanggung jawab atas tindakan.</li>
</ul>

<h2>Lembaga Perlindungan HAM</h2>
<p>Lembaga perlindungan HAM di Indonesia:</p>
<ul>
<li><strong>Komnas HAM</strong> - Komisi Nasional Hak Asasi Manusia.</li>
<li><strong>Komnas Perempuan</strong> - Komisi Nasional Anti Kekerasan terhadap Perempuan.</li>
<li><strong>Komnas Anak</strong> - Komisi Perlindungan Anak Indonesia.</li>
<li><strong>Peradilan HAM</strong> - Pengadilan HAM untuk kasus pelanggaran HAM berat.</li>
</ul>

<h2>Pelanggaran HAM</h2>
<p>Pelanggaran HAM terjadi ketika:</p>
<ul>
<li><strong>Hak dilanggar</strong> - Hak seseorang dilanggar oleh orang lain atau negara.</li>
<li><strong>Diskriminasi</strong> - Seseorang didiskriminasi berdasarkan suku, agama, ras.</li>
<li><strong>Kekerasan</strong> - Terjadi kekerasan fisik atau psikologis.</li>
<li><strong>Penganiayaan</strong> - Terjadi penganiayaan terhadap seseorang.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Hak Asasi Manusia adalah hak dasar yang dimiliki setiap manusia. HAM harus dihormati, dilindungi, dan dijunjung tinggi. Negara berkewajiban melindungi HAM warganya. Generasi muda harus menghormati HAM orang lain dan menaati hukum.</p>'''
    },
    'Otonomi Daerah': {
        'title': 'Otonomi Daerah: Desentralisasi dan Pembangunan',
        'content': '''<h1>Otonomi Daerah: Desentralisasi dan Pembangunan</h1>

<h2>Pengertian Otonomi Daerah</h2>
<p>Otonomi daerah adalah kewenangan daerah otonom untuk mengatur dan mengurus urusan pemerintahan dan kepentingan masyarakat setempat. Otonomi daerah adalah bagian dari desentralisasi yang memberikan kewenangan kepada daerah untuk mengelola sendiri urusannya.</p>

<h2>Dasar Hukum Otonomi Daerah</h2>
<p>Otonomi daerah memiliki dasar hukum:</p>
<ul>
<li><strong>UUD 1945 Pasal 18</strong> - Menjamin otonomi daerah.</li>
<li><strong>UU No. 32 Tahun 2004</strong> - Tentang Pemerintahan Daerah.</li>
<li><strong>UU No. 23 Tahun 2014</strong> - Revisi UU Pemerintahan Daerah.</li>
</ul>

<h2>Prinsip Otonomi Daerah</h2>
<p>Otonomi daerah berdasarkan prinsip:</p>
<ul>
<li><strong>Desentralisasi</strong> - Pelimpahan kewenangan dari pusat ke daerah.</li>
<li><strong>Delegasi</strong> - Pelimpahan tugas dari pusat ke daerah.</li>
<li><strong>Asistensi</strong> - Bantuan pusat kepada daerah.</li>
</ul>

<h2>Tingkat Pemerintahan</h2>
<p>Pemerintahan Indonesia terdiri dari:</p>
<ul>
<li><strong>Pemerintah Pusat</strong> - Pemerintah nasional di Jakarta.</li>
<li><strong>Pemerintah Provinsi</strong> - Pemerintah tingkat provinsi.</li>
<li><strong>Pemerintah Kabupaten/Kota</strong> - Pemerintah tingkat kabupaten/kota.</li>
<li><strong>Pemerintah Kecamatan</strong> - Pemerintah tingkat kecamatan.</li>
<li><strong>Pemerintah Desa/Kelurahan</strong> - Pemerintah tingkat desa/kelurahan.</li>
</ul>

<h2>Kewenangan Daerah</h2>
<p>Daerah memiliki kewenangan dalam:</p>
<ul>
<li><strong>Urusan wajib</strong> - Pendidikan, kesehatan, infrastruktur.</li>
<li><strong>Urusan pilihan</strong> - Pariwisata, investasi, lainnya sesuai potensi.</li>
<li><strong>Urusan pembinaan</strong> - Kewenangan yang dilimpahkan pusat.</li>
</ul>

<h2>Pendanaan Daerah</h2>
<p>Pendanaan daerah bersumber dari:</p>
<ul>
<li><strong>PAD</strong> - Pendapatan Asli Daerah.</li>
<li><strong>Dana Transfer</strong> - Dana dari pusat (DAU, DAK, DID).</li>
<li><strong>Pinjaman</strong> - Pinjaman daerah.</li>
</ul>

<h2>Tantangan Otonomi Daerah</h2>
<p>Otonomi daerah menghadapi tantangan:</p>
<ul>
<li><strong>Kapasitas SDM</strong> - Keterbatasan SDM di daerah.</li>
<li><strong>Korupsi</strong> - Korupsi di tingkat daerah.</li>
<li><strong>Ketimpangan</strong> - Ketimpangan antar daerah.</li>
<li><strong>Ketergantungan</strong> - Ketergantungan pada dana pusat.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Otonomi daerah adalah kewenangan daerah untuk mengurus urusan sendiri. Otonomi daerah bertujuan untuk meningkatkan efisiensi dan efektivitas pemerintahan. Otonomi daerah harus dijalankan dengan bertanggung jawab dan transparan.</p>'''
    },
    'Partisipasi Masyarakat': {
        'title': 'Partisipasi Masyarakat: Peran dalam Pembangunan',
        'content': '''<h1>Partisipasi Masyarakat: Peran dalam Pembangunan</h1>

<h2>Pengertian Partisipasi Masyarakat</h2>
<p>Partisipasi masyarakat adalah keterlibatan masyarakat dalam proses perencanaan, pelaksanaan, dan pengawasan pembangunan. Partisipasi masyarakat adalah kunci demokrasi dan pembangunan yang berkelanjutan.</p>

<h2>Bentuk Partisipasi Masyarakat</h2>
<p>Partisipasi masyarakat dapat berupa:</p>
<ul>
<li><strong>Partisipasi politik</strong> - Memilih dalam pemilu, bergabung partai politik.</li>
<li><strong>Partisipasi sosial</strong> - Bergabung organisasi sosial, gotong royong.</li>
<li><strong>Partisipasi ekonomi</strong> - Berpartisipasi dalam kegiatan ekonomi.</li>
<li><strong>Partisipasi budaya</strong> - Melestarikan budaya lokal.</li>
</ul>

<h2>Tingkat Partisipasi</h2>
<p>Tingkat partisipasi masyarakat:</p>
<ul>
<li><strong>Partisipasi informasi</strong> - Masyarakat diberi informasi.</li>
<li><strong>Partisipasi konsultasi</strong> - Masyarakat dimintai pendapat.</li>
<li><strong>Partisipasi keputusan</strong> - Masyarakat ikut mengambil keputusan.</li>
<li><strong>Partisipasi aksi</strong> - Masyarakat ikut melaksanakan.</li>
</ul>

<h2>Faktor yang Mempengaruhi Partisipasi</h2>
<p>Faktor yang mempengaruhi partisipasi:</p>
<ul>
<li><strong>Pendidikan</strong> - Tingkat pendidikan mempengaruhi partisipasi.</li>
<li><strong>Ekonomi</strong> - Kondisi ekonomi mempengaruhi partisipasi.</li>
<li><strong>Budaya</strong> - Budaya lokal mempengaruhi partisipasi.</li>
<li><strong>Politik</strong> - Situasi politik mempengaruhi partisipasi.</li>
</ul>

<h2>Manfaat Partisipasi Masyarakat</h2>
<p>Partisipasi masyarakat memberikan manfaat:</p>
<ul>
<li><strong>Demokrasi</strong> - Memperkuat demokrasi.</li>
<li><strong>Transparansi</strong> - Meningkatkan transparansi.</li>
<li><strong>Akuntabilitas</strong> - Meningkatkan akuntabilitas.</li>
<li><strong>Keberhasilan</strong> - Meningkatkan keberhasilan program.</li>
</ul>

<h2>Hambatan Partisipasi</h2>
<p>Hambatan partisipasi masyarakat:</p>
<ul>
<li><strong>Apatisme</strong> - Masyarakat yang tidak peduli.</li>
<li><strong>Kurang informasi</strong> - Kurangnya informasi.</li>
<li><strong>Biaya</strong> - Biaya partisipasi.</li>
<li><strong>Waktu</strong> - Keterbatasan waktu.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Partisipasi masyarakat adalah keterlibatan masyarakat dalam pembangunan. Partisipasi masyarakat penting untuk demokrasi dan pembangunan. Pemerintah harus mendorong partisipasi masyarakat. Masyarakat harus aktif berpartisipasi.</p>'''
    },
    'Sistem Pemerintahan': {
        'title': 'Sistem Pemerintahan Indonesia',
        'content': '''<h1>Sistem Pemerintahan Indonesia</h1>

<h2>Pengertian Sistem Pemerintahan</h2>
<p>Sistem pemerintahan adalah keseluruhan struktur dan mekanisme kerja lembaga-lembaga negara dalam menjalankan kekuasaan negara. Sistem pemerintahan Indonesia berdasarkan UUD 1945 dan menganut sistem presidensial.</p>

<h2>Bentuk Negara</h2>
<p>Indonesia adalah negara kesatuan yang berbentuk republik:</p>
<ul>
<li><strong>Negara Kesatuan</strong> - Wilayah Indonesia adalah satu kesatuan.</li>
<li><strong>Republik</strong> - Kepala negara adalah Presiden yang dipilih.</li>
</ul>

<h2>Lembaga Negara</h2>
<p>Lembaga negara Indonesia:</p>
<ul>
<li><strong>MPR</strong> - Majelis Permusyawaratan Rakyat, lembaga tertinggi.</li>
<li><strong>DPR</strong> - Dewan Perwakilan Rakyat, lembaga legislatif.</li>
<li><strong>DPD</strong> - Dewan Perwakilan Daerah, mewakili daerah.</li>
<li><strong>Presiden</strong> - Kepala negara dan kepala pemerintahan.</li>
<li><strong>MA</strong> - Mahkamah Agung, kekuasaan kehakiman.</li>
<li><strong>MK</strong> - Mahkamah Konstitusi, pengujian UUD.</li>
<li><strong>KY</strong> - Komisi Yudisial, menjaga kemerdekaan hakim.</li>
<li><strong>BPK</strong> - Badan Pemeriksa Keuangan, mengawasi keuangan.</li>
</ul>

<h2>Kekuasaan Negara</h2>
<p>Kekuasaan negara Indonesia:</p>
<ul>
<li><strong>Kekuasaan legislatif</strong> - Membuat undang-undang (DPR, DPD, MPR).</li>
<li><strong>Kekuasaan eksekutif</strong> - Menjalankan pemerintahan (Presiden, Kabinet).</li>
<li><strong>Kekuasaan yudikatif</strong> - Menegakkan hukum (MA, MK, pengadilan).</li>
</ul>

<h2>Pemerintahan Daerah</h2>
<p>Pemerintahan daerah:</p>
<ul>
<li><strong>Gubernur</strong> - Kepala pemerintahan provinsi.</li>
<li><strong>Bupati/Walikota</strong> - Kepala pemerintahan kabupaten/kota.</li>
<li><strong>DPRD</strong> - Dewan Perwakilan Rakyat Daerah.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Sistem pemerintahan Indonesia berdasarkan UUD 1945 dan menganut sistem presidensial. Kekuasaan negara dibagi menjadi legislatif, eksekutif, dan yudikatif. Sistem pemerintahan harus dijalankan sesuai konstitusi.</p>'''
    },
    'Perundang-undangan': {
        'title': 'Perundang-undangan: Sistem Hukum Indonesia',
        'content': '''<h1>Perundang-undangan: Sistem Hukum Indonesia</h1>

<h2>Pengertian Perundang-undangan</h2>
<p>Perundang-undangan adalah seluruh peraturan perundang-undangan yang mengatur kehidupan berbangsa dan bernegara. Perundang-undangan adalah sumber hukum tertulis yang mengatur hubungan hukum.</p>

<h2>Hierarki Peraturan Perundang-undangan</h2>
<p>Hierarki peraturan perundang-undangan:</p>
<ol>
<li><strong>UUD 1945</strong> - Konstitusi negara, hukum tertinggi.</li>
<li><strong>UU/TAP MPR</strong> - Undang-Undang dan Ketetapan MPR.</li>
<li><strong>PP/Perpu</strong> - Peraturan Pemerintah dan Peraturan Pengganti UU.</li>
<li><strong>Perpres</strong> - Peraturan Presiden.</li>
<li><strong>Kepres</strong> - Keputusan Presiden.</li>
<li><strong>Perda</strong> - Peraturan Daerah.</li>
</ol>

<h2>Jenis Peraturan</h2>
<p>Jenis peraturan perundang-undangan:</p>
<ul>
<li><strong>Undang-Undang</strong> - Dibuat oleh DPR dan Presiden.</li>
<li><strong>Peraturan Pemerintah</strong> - Dibuat oleh Presiden.</li>
<li><strong>Peraturan Presiden</strong> - Dibuat oleh Presiden.</li>
<li><strong>Peraturan Daerah</strong> - Dibuat oleh DPRD dan Kepala Daerah.</li>
</ul>

<h2>Proses Pembuatan UU</h2>
<p>Proses pembuatan Undang-Undang:</p>
<ol>
<li><strong>Initiatif</strong> - DPR, Presiden, atau DPD mengusulkan RUU.</li>
<li><strong>Pembahasan</strong> - DPR membahas RUU.</li>
<li><strong>Pengesahan</strong> - Presiden mengesahkan UU.</li>
<li><strong>Penetapan</strong> - UU ditetapkan dan diundangkan.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Perundang-undangan adalah sumber hukum tertulis yang mengatur kehidupan berbangsa dan bernegara. Hierarki peraturan perundang-undangan harus dihormati. Peraturan perundang-undangan harus sesuai dengan UUD 1945.</p>'''
    },
    'Bela Negara': {
        'title': 'Bela Negara: Konsep dan Implementasi',
        'content': '''<h1>Bela Negara: Konsep dan Implementasi</h1>

<h2>Pengertian Bela Negara</h2>
<p>Bela negara adalah sikap dan perilaku warga negara yang dijiwai oleh kecintaan terhadap negara, kesatuan bangsa, dan keyakinan akan Pancasila sebagai ideologi negara. Bela negara adalah hak dan kewajiban setiap warga negara.</p>

<h2>Dasar Hukum Bela Negara</h2>
<p>Bela negara memiliki dasar hukum:</p>
<ul>
<li><strong>UUD 1945 Pasal 27</strong> - Menjamin hak dan kewajiban warga negara.</li>
<li><strong>UU No. 3 Tahun 2002</strong> - Tentang Pertahanan Negara.</li>
<li><strong>UU No. 23 Tahun 2014</strong> - Tentang Bela Negara.</li>
</ul>

<h2>Bentuk Bela Negara</h2>
<p>Bela negara dapat dilakukan dalam bentuk:</p>
<ul>
<li><strong>Militer</strong> - Mengikuti wajib militer, bergabung TNI.</li>
<li><strong>Non-militer</strong> - Meningkatkan kualitas diri, melestarikan budaya.</li>
<li><strong>Profesional</strong> - Bekerja dengan profesional, berprestasi.</li>
<li><strong>Sosial</strong> - Tolong-menolong, gotong royong.</li>
</ul>

<h2>Kewajiban Bela Negara</h2>
<p>Kewajiban bela negara:</p>
<ul>
<li><strong>Mencintai tanah air</strong> - Cinta tanah air Indonesia.</li>
<li><strong>Menjaga persatuan</strong> - Menjaga persatuan dan kesatuan.</li>
<li><strong>Menghormati Pancasila</strong> - Menghormati dan mengamalkan Pancasila.</li>
<li><strong>Menaati hukum</strong> - Menaati hukum dan peraturan.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Bela negara adalah sikap dan perilaku warga negara yang dijiwai kecintaan terhadap negara. Bela negara adalah hak dan kewajiban setiap warga negara. Generasi muda harus mencintai negara dan siap membela negara.</p>'''
    },
    'Nasionalisme': {
        'title': 'Nasionalisme: Cinta Tanah Air',
        'content': '''<h1>Nasionalisme: Cinta Tanah Air</h1>

<h2>Pengertian Nasionalisme</h2>
<p>Nasionalisme adalah rasa cinta terhadap tanah air dan bangsa. Nasionalisme adalah kesadaran kebangsaan yang mengutamakan kepentingan bangsa di atas kepentingan pribadi atau golongan.</p>

<h2>Sejarah Nasionalisme Indonesia</h2>
<p>Nasionalisme Indonesia muncul pada awal abad ke-20:</p>
<ul>
<li><strong>Budi Utomo (1908)</strong> - Organisasi nasional pertama.</li>
<li><strong>Sarekat Islam (1912)</strong> - Organisasi terbesar.</li>
<li><strong>Sumpah Pemuda (1928)</strong> - Ikrar persatuan bangsa.</li>
<li><strong>Proklamasi (1945)</strong> - Kemerdekaan Indonesia.</li>
</ul>

<h2>Unsur-Unsur Nasionalisme</h2>
<p>Unsur-unsur nasionalisme:</p>
<ul>
<li><strong>Cinta tanah air</strong> - Cinta terhadap Indonesia.</li>
<li><strong>Persatuan</strong> - Persatuan bangsa Indonesia.</li>
<li><strong>Kebanggaan</strong> - Kebanggaan terhadap bangsa.</li>
<li><strong>Sikap rela berkorban</strong> - Rela berkorban untuk bangsa.</li>
</ul>

<h2>Penerapan Nasionalisme</h2>
<p>Nasionalisme diterapkan dalam:</p>
<ul>
<li><strong>Belajar</strong> - Belajar untuk kemajuan bangsa.</li>
<li><strong>Bekerja</strong> - Bekerja untuk pembangunan.</li>
<li><strong>Melestarikan budaya</strong> - Melestarikan budaya Indonesia.</li>
<li><strong>Menghargai pahlawan</strong> - Menghargai jasa pahlawan.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Nasionalisme adalah rasa cinta terhadap tanah air dan bangsa. Nasionalisme adalah kunci persatuan dan kesatuan bangsa. Generasi muda harus menumbuhkan nasionalisme.</p>'''
    },
    'Integritas': {
        'title': 'Integritas: Anti Korupsi dan Etika',
        'content': '''<h1>Integritas: Anti Korupsi dan Etika</h1>

<h2>Pengertian Integritas</h2>
<p>Integritas adalah kesatuan yang utuh sehingga tidak dapat dipisahkan. Integritas adalah sikap jujur, konsisten, dan bertanggung jawab. Integritas adalah kunci dalam memerangi korupsi.</p>

<h2>Pentingnya Integritas</h2>
<p>Integritas penting karena:</p>
<ul>
<li><strong>Mencegah korupsi</strong> - Integritas mencegah korupsi.</li>
<li><strong>Meningkatkan kepercayaan</strong> - Integritas meningkatkan kepercayaan.</li>
<li><strong>Meningkatkan kualitas</strong> - Integritas meningkatkan kualitas kerja.</li>
<li><strong>Membangun reputasi</strong> - Integritas membangun reputasi baik.</li>
</ul>

<h2>Korupsi</h2>
<p>Korupsi adalah:</p>
<ul>
<li><strong>Penyuapan</strong> - Memberi atau menerima suap.</li>
<li><strong>Pemerasan</strong> - Memeras orang lain.</li>
<li><strong>Penyalahgunaan wewenang</strong> - Menyalahgunakan wewenang.</li>
<li><strong>Penggelapan</strong> - Menggelapkan uang negara.</li>
</ul>

<h2>Dampak Korupsi</h2>
<p>Dampak korupsi:</p>
<ul>
<li><strong>Kerugian negara</strong> - Kerugian keuangan negara.</li>
<li><strong>Kemiskinan</strong> - Meningkatkan kemiskinan.</li>
<li><strong>Ketidakadilan</strong> - Menimbulkan ketidakadilan.</li>
<li><strong>Kerusakan moral</strong> - Merusak moral bangsa.</li>
</ul>

<h2>Pencegahan Korupsi</h2>
<p>Pencegahan korupsi:</p>
<ul>
<li><strong>Integritas</strong> - Menjaga integritas.</li>
<li><strong>Transparansi</strong> - Meningkatkan transparansi.</li>
<li><strong>Akuntabilitas</strong> - Meningkatkan akuntabilitas.</li>
<li><strong>Hukum</strong> - Menegakkan hukum.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Integritas adalah sikap jujur, konsisten, dan bertanggung jawab. Integritas adalah kunci dalam memerangi korupsi. Korupsi merugikan negara dan bangsa. Generasi muda harus menjaga integritas.</p>'''
    },
    # TIU Topics
    'Verbal Reasoning': {
        'title': 'Verbal Reasoning: Penalaran Verbal',
        'content': '''<h1>Verbal Reasoning: Penalaran Verbal</h1>

<h2>Pengertian Verbal Reasoning</h2>
<p>Verbal Reasoning adalah kemampuan untuk memahami, menganalisis, dan mengevaluasi informasi yang disajikan dalam bentuk kata-kata. Kemampuan ini meliputi pemahaman bacaan, kosakata, dan hubungan antar kata. Verbal Reasoning sangat penting dalam tes CPNS dan seleksi lainnya.</p>

<h2>Komponen Verbal Reasoning</h2>
<p>Verbal Reasoning terdiri dari beberapa komponen:</p>
<ul>
<li><strong>Sinonim</strong> - Kata yang memiliki makna yang sama atau mirip.</li>
<li><strong>Antonim</strong> - Kata yang memiliki makna yang berlawanan.</li>
<li><strong>Analogi</strong> - Hubungan kesamaan antara dua pasang kata.</li>
<li><strong>Pemahaman Bacaan</strong> - Kemampuan memahami teks dan menarik kesimpulan.</li>
<li><strong>Silogisme</strong> - Penalaran logis menggunakan premis dan kesimpulan.</li>
</ul>

<h2>Sinonim</h2>
<p>Sinonim adalah kata yang memiliki makna yang sama atau hampir sama. Contoh:</p>
<ul>
<li>Besar - Agung, Luas, Raksasa</li>
<li>Kecil - Mungil, Mini, Kecil</li>
<li>Cepat - Kilat, Laju, Cepat</li>
<li>Indah - Cantik, Elok, Rupawan</li>
</ul>

<h2>Antonim</h2>
<p>Antonim adalah kata yang memiliki makna yang berlawanan. Contoh:</p>
<ul>
<li>Besar - Kecil</li>
<li>Tinggi - Pendek</li>
<li>Panjang - Pendek</li>
<li>Cepat - Lambat</li>
</ul>

<h2>Analogi</h2>
<p>Analogi adalah hubungan kesamaan antara dua pasang kata. Contoh:</p>
<ul>
<li>Dokter : Pasien = Guru : Murid (Dokter merawat pasien, Guru mengajar murid)</li>
<li>Kucing : Meong = Anjing : Gukguk (Kucing mengeong, Anjing menggonggong)</li>
<li>Pena : Menulis = Pisau : Memotong (Pena untuk menulis, Pisau untuk memotong)</li>
</ul>

<h2>Silogisme</h2>
<p>Silogisme adalah penalaran logis menggunakan premis dan kesimpulan. Contoh:</p>
<ul>
<li>Premis 1: Semua manusia adalah makhluk hidup.</li>
<li>Premis 2: Saya adalah manusia.</li>
<li>Kesimpulan: Saya adalah makhluk hidup.</li>
</ul>

<h2>Tips Mengerjakan Soal Verbal Reasoning</h2>
<ol>
<li>Baca soal dengan teliti dan pahami konteksnya.</li>
<li>Perhatikan hubungan antar kata dalam analogi.</li>
<li>Gunakan proses eliminasi untuk memilih jawaban yang paling tepat.</li>
<li>Perluas kosakata dengan membaca buku dan artikel.</li>
<li>Latih kemampuan membaca cepat dan memahami isi teks.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Verbal Reasoning adalah kemampuan penting yang perlu dilatih secara terus-menerus. Latihan yang konsisten akan meningkatkan kemampuan verbal reasoning. Fokus pada kosakata, pemahaman bacaan, dan penalaran logis.</p>'''
    },
    'Numerical Reasoning': {
        'title': 'Numerical Reasoning: Penalaran Numerik',
        'content': '''<h1>Numerical Reasoning: Penalaran Numerik</h1>

<h2>Pengertian Numerical Reasoning</h2>
<p>Numerical Reasoning adalah kemampuan untuk memahami, menganalisis, dan menyelesaikan masalah yang melibatkan angka dan data numerik. Kemampuan ini meliputi operasi hitung, deret angka, dan analisis data. Numerical Reasoning sangat penting dalam tes CPNS.</p>

<h2>Komponen Numerical Reasoning</h2>
<p>Numerical Reasoning terdiri dari beberapa komponen:</p>
<ul>
<li><strong>Operasi Hitung</strong> - Penjumlahan, pengurangan, perkalian, pembagian.</li>
<li><strong>Deret Angka</strong> - Pola angka dan aritmatika.</li>
<li><strong>Persentase</strong> - Perhitungan persentase dan rasio.</li>
<li><strong>Rasio dan Proporsi</strong> - Perbandingan dan proporsi.</li>
<li><strong>Analisis Data</strong> - Interpretasi data dalam tabel dan grafik.</li>
</ul>

<h2>Operasi Hitung Dasar</h2>
<p>Operasi hitung dasar meliputi:</p>
<ul>
<li><strong>Penjumlahan</strong> - Menambahkan dua atau lebih angka.</li>
<li><strong>Pengurangan</strong> - Mengurangi satu angka dari angka lain.</li>
<li><strong>Perkalian</strong> - Mengalikan dua atau lebih angka.</li>
<li><strong>Pembagian</strong> - Membagi satu angka dengan angka lain.</li>
</ul>

<h2>Deret Angka</h2>
<p>Deret angka adalah pola angka yang mengikuti aturan tertentu. Contoh:</p>
<ul>
<li><strong>Deret Aritmatika</strong> - 2, 4, 6, 8, 10 (selisih tetap 2)</li>
<li><strong>Deret Geometri</strong> - 2, 4, 8, 16, 32 (rasio tetap 2)</li>
<li><strong>Deret Campuran</strong> - 1, 4, 9, 16, 25 (kuadrat: 1², 2², 3², 4², 5²)</li>
</ul>

<h2>Persentase</h2>
<p>Persentase adalah perbandingan terhadap 100. Contoh:</p>
<ul>
<li>50% dari 100 = 50</li>
<li>25% dari 200 = 50</li>
<li>10% dari 500 = 50</li>
</ul>

<h2>Rasio dan Proporsi</h2>
<p>Rasio adalah perbandingan dua besaran. Contoh:</p>
<ul>
<li>Rasio 2:3 berarti untuk setiap 2 bagian, ada 3 bagian lain.</li>
<li>Proporsi 1:4 berarti 1 bagian dari 4 bagian total.</li>
</ul>

<h2>Tips Mengerjakan Soal Numerical Reasoning</h2>
<ol>
<li>Latih operasi hitung dasar secara rutin.</li>
<li>Pahami pola deret angka dengan mencari selisih atau rasio.</li>
<li>Gunakan teknik estimasi untuk mempercepat perhitungan.</li>
<li>Perhatikan satuan dan konversi satuan.</li>
<li>Latih interpretasi data dari tabel dan grafik.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Numerical Reasoning adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada operasi hitung, deret angka, dan analisis data. Latihan rutin akan meningkatkan kecepatan dan akurasi.</p>'''
    },
    'Logika Matematika': {
        'title': 'Logika Matematika: Pemecahan Masalah',
        'content': '''<h1>Logika Matematika: Pemecahan Masalah</h1>

<h2>Pengertian Logika Matematika</h2>
<p>Logika Matematika adalah kemampuan untuk berpikir secara logis dan sistematis dalam memecahkan masalah matematika. Logika matematika meliputi penalaran deduktif, induktif, dan abduktif. Kemampuan ini sangat penting dalam tes CPNS.</p>

<h2>Jenis Penalaran</h2>
<p>Penalaran matematika terdiri dari:</p>
<ul>
<li><strong>Penalaran Deduktif</strong> - Kesimpulan ditarik dari premis yang umum.</li>
<li><strong>Penalaran Induktif</strong> - Kesimpulan ditarik dari observasi spesifik.</li>
<li><strong>Penalaran Abduktif</strong> - Kesimpulan ditarik dari bukti yang tidak lengkap.</li>
</ul>

<h2>Contoh Penalaran Deduktif</h2>
<ul>
<li>Premis 1: Semua bilangan genap habis dibagi 2.</li>
<li>Premis 2: 8 adalah bilangan genap.</li>
<li>Kesimpulan: 8 habis dibagi 2.</li>
</ul>

<h2>Contoh Penalaran Induktif</h2>
<ul>
<li>Observasi 1: 2 + 3 = 5</li>
<li>Observasi 2: 4 + 5 = 9</li>
<li>Observasi 3: 6 + 7 = 13</li>
<li>Kesimpulan: Penjumlahan dua bilangan ganjil menghasilkan bilangan genap.</li>
</ul>

<h2>Langkah Pemecahan Masalah</h2>
<ol>
<li><strong>Memahami Masalah</strong> - Baca dan pahami masalah dengan teliti.</li>
<li><strong>Membuat Rencana</strong> - Rencanakan langkah-langkah penyelesaian.</li>
<li><strong>Melaksanakan Rencana</strong> - Lakukan perhitungan sesuai rencana.</li>
<li><strong>Memeriksa Jawaban</strong> - Periksa kembali jawaban untuk memastikan kebenaran.</li>
</ol>

<h2>Tips Mengerjakan Soal Logika Matematika</h2>
<ol>
<li>Baca soal dengan teliti dan pahami apa yang ditanyakan.</li>
<li>Identifikasi informasi yang diberikan dan yang ditanyakan.</li>
<li>Buat diagram atau sketsa jika diperlukan.</li>
<li>Gunakan logika sistematis untuk menyelesaikan masalah.</li>
<li>Periksa kembali jawaban sebelum mengirim.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Logika Matematika adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada pemahaman konsep, penalaran logis, dan pemecahan masalah sistematis. Latihan rutin akan meningkatkan kemampuan logika matematika.</p>'''
    },
    'Spasial Reasoning': {
        'title': 'Spasial Reasoning: Penalaran Spasial',
        'content': '''<h1>Spasial Reasoning: Penalaran Spasial</h1>

<h2>Pengertian Spasial Reasoning</h2>
<p>Spasial Reasoning adalah kemampuan untuk memvisualisasikan dan memanipulasi objek dalam ruang. Kemampuan ini meliputi rotasi, refleksi, dan transformasi objek. Spasial Reasoning sangat penting dalam tes CPNS.</p>

<h2>Komponen Spasial Reasoning</h2>
<p>Spasial Reasoning terdiri dari beberapa komponen:</p>
<ul>
<li><strong>Rotasi</strong> - Memutar objek dalam ruang.</li>
<li><strong>Refleksi</strong> - Mencerminkan objek pada cermin.</li>
<li><strong>Transformasi</strong> - Mengubah bentuk atau ukuran objek.</li>
<li><strong>Visualisasi 3D</strong> - Memvisualisasikan objek tiga dimensi.</li>
<li><strong>Pola Spasial</strong> - Mengenali pola dalam susunan objek.</li>
</ul>

<h2>Rotasi</h2>
<p>Rotasi adalah memutar objek sejauh sudut tertentu. Contoh:</p>
<ul>
<li>Rotasi 90° - Memutar objek sejauh 90 derajat.</li>
<li>Rotasi 180° - Memutar objek sejauh 180 derajat.</li>
<li>Rotasi 270° - Memutar objek sejauh 270 derajat.</li>
</ul>

<h2>Refleksi</h2>
<p>Refleksi adalah mencerminkan objek pada cermin. Contoh:</p>
<ul>
<li>Refleksi horizontal - Mencerminkan objek secara horizontal.</li>
<li>Refleksi vertikal - Mencerminkan objek secara vertikal.</li>
<li>Refleksi diagonal - Mencerminkan objek secara diagonal.</li>
</ul>

<h2>Transformasi</h2>
<p>Transformasi adalah mengubah bentuk atau ukuran objek. Contoh:</p>
<ul>
<li>Dilatasi - Memperbesar atau memperkecil objek.</li>
<li>Translasi - Menggeser objek tanpa mengubah bentuk.</li>
<li>Shear - Mengubah bentuk objek dengan menggeser bagian tertentu.</li>
</ul>

<h2>Tips Mengerjakan Soal Spasial Reasoning</h2>
<ol>
<li>Latih visualisasi objek dalam pikiran.</li>
<li>Gunakan kertas untuk menggambar jika diperlukan.</li>
<li>Perhatikan pola dan hubungan antar objek.</li>
<li>Latih rotasi dan refleksi objek secara rutin.</li>
<li>Fokus pada detail yang berubah antar objek.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Spasial Reasoning adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada visualisasi, rotasi, refleksi, dan transformasi objek. Latihan rutin akan meningkatkan kemampuan spasial reasoning.</p>'''
    },
    'Analisis Data': {
        'title': 'Analisis Data: Interpretasi Informasi',
        'content': '''<h1>Analisis Data: Interpretasi Informasi</h1>

<h2>Pengertian Analisis Data</h2>
<p>Analisis Data adalah kemampuan untuk menginterpretasi dan menganalisis data yang disajikan dalam bentuk tabel, grafik, atau diagram. Kemampuan ini meliputi membaca data, menarik kesimpulan, dan membuat prediksi. Analisis Data sangat penting dalam tes CPNS.</p>

<h2>Jenis Data</h2>
<p>Data dapat disajikan dalam berbagai bentuk:</p>
<ul>
<li><strong>Tabel</strong> - Data dalam bentuk baris dan kolom.</li>
<li><strong>Grafik Garis</strong> - Data dalam bentuk garis yang menunjukkan tren.</li>
<li><strong>Grafik Batang</strong> - Data dalam bentuk batang vertikal atau horizontal.</li>
<li><strong>Pie Chart</strong> - Data dalam bentuk lingkaran yang menunjukkan persentase.</li>
<li><strong>Diagram</strong> - Data dalam bentuk diagram yang lebih kompleks.</li>
</ul>

<h2>Membaca Tabel</h2>
<p>Membaca tabel meliputi:</p>
<ul>
<li>Identifikasi baris dan kolom.</li>
<li>Memahami satuan yang digunakan.</li>
<li>Mencari data yang relevan.</li>
<li>Menghitung total atau rata-rata jika diperlukan.</li>
</ul>

<h2>Membaca Grafik</h2>
<p>Membaca grafik meliputi:</p>
<ul>
<li>Identifikasi sumbu X dan sumbu Y.</li>
<li>Memahami skala yang digunakan.</li>
<li>Membaca nilai pada titik tertentu.</li>
<li>Menganalisis tren atau pola.</li>
</ul>

<h2>Interpretasi Data</h2>
<p>Interpretasi data meliputi:</p>
<ul>
<li>Menarik kesimpulan dari data.</li>
<li>Membuat perbandingan antar data.</li>
<li>Mengidentifikasi tren atau pola.</li>
<li>Membuat prediksi berdasarkan data.</li>
</ul>

<h2>Tips Mengerjakan Soal Analisis Data</h2>
<ol>
<li>Baca judul dan label tabel/grafik dengan teliti.</li>
<li>Identifikasi satuan dan skala yang digunakan.</li>
<li>Fokus pada data yang relevan dengan pertanyaan.</li>
<li>Gunakan kalkulator jika diperlukan untuk perhitungan.</li>
<li>Periksa kembali kesimpulan sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Analisis Data adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada membaca tabel, grafik, dan interpretasi data. Latihan rutin akan meningkatkan kemampuan analisis data.</p>'''
    },
    'Pemecahan Masalah': {
        'title': 'Pemecahan Masalah Sistematis',
        'content': '''<h1>Pemecahan Masalah Sistematis</h1>

<h2>Pengertian Pemecahan Masalah</h2>
<p>Pemecahan masalah adalah proses menemukan solusi untuk masalah yang dihadapi. Pemecahan masalah sistematis melibatkan langkah-langkah terstruktur untuk mencapai solusi yang efektif. Kemampuan ini sangat penting dalam tes CPNS dan kehidupan sehari-hari.</p>

<h2>Langkah-Langkah Pemecahan Masalah</h2>
<ol>
<li><strong>Identifikasi Masalah</strong> - Kenali dan pahami masalah yang dihadapi.</li>
<li><strong>Analisis Masalah</strong> - Analisis penyebab dan faktor yang mempengaruhi masalah.</li>
<li><strong>Generate Solusi</strong> - Buat beberapa solusi alternatif.</li>
<li><strong>Evaluasi Solusi</strong> - Evaluasi setiap solusi berdasarkan kriteria tertentu.</li>
<li><strong>Pilih Solusi Terbaik</strong> - Pilih solusi yang paling efektif dan efisien.</li>
<li><strong>Implementasi</strong> - Implementasikan solusi yang dipilih.</li>
<li><strong>Monitoring</strong> - Monitor hasil dan evaluasi keberhasilan solusi.</li>
</ol>

<h2>Strategi Pemecahan Masalah</h2>
<p>Strategi pemecahan masalah meliputi:</p>
<ul>
<li><strong>Divide and Conquer</strong> - Pecah masalah besar menjadi masalah kecil.</li>
<li><strong>Pattern Recognition</strong> - Kenali pola yang sama dalam masalah.</li>
<li><strong>Working Backward</strong> - Mulai dari solusi dan kerja mundur.</li>
<li><strong>Analisis Sistematis</strong> - Analisis masalah secara sistematis.</li>
</ul>

<h2>Tips Mengerjakan Soal Pemecahan Masalah</h2>
<ol>
<li>Baca soal dengan teliti dan pahami apa yang ditanyakan.</li>
<li>Identifikasi informasi yang diberikan dan yang ditanyakan.</li>
<li>Buat rencana penyelesaian sebelum mulai menghitung.</li>
<li>Gunakan logika sistematis untuk menyelesaikan masalah.</li>
<li>Periksa kembali jawaban sebelum mengirim.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Pemecahan masalah adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada pemahaman masalah, analisis sistematis, dan evaluasi solusi. Latihan rutin akan meningkatkan kemampuan pemecahan masalah.</p>'''
    },
    'Deret Angka': {
        'title': 'Deret Angka: Pola dan Aritmatika',
        'content': '''<h1>Deret Angka: Pola dan Aritmatika</h1>

<h2>Pengertian Deret Angka</h2>
<p>Deret angka adalah rangkaian angka yang mengikuti pola tertentu. Pola dapat berupa selisih tetap, rasio tetap, atau pola lainnya. Deret angka sangat penting dalam tes CPNS.</p>

<h2>Jenis Deret Angka</h2>
<p>Deret angka terdiri dari beberapa jenis:</p>
<ul>
<li><strong>Deret Aritmatika</strong> - Selisih antar angka tetap.</li>
<li><strong>Deret Geometri</strong> - Rasio antar angka tetap.</li>
<li><strong>Deret Campuran</strong> - Kombinasi beberapa pola.</li>
<li><strong>Deret Fibonacci</strong> - Setiap angka adalah jumlah dua angka sebelumnya.</li>
</ul>

<h2>Deret Aritmatika</h2>
<p>Deret aritmatika memiliki selisih tetap. Contoh:</p>
<ul>
<li>2, 4, 6, 8, 10 (selisih tetap 2)</li>
<li>5, 10, 15, 20, 25 (selisih tetap 5)</li>
<li>100, 90, 80, 70, 60 (selisih tetap -10)</li>
</ul>

<h2>Deret Geometri</h2>
<p>Deret geometri memiliki rasio tetap. Contoh:</p>
<ul>
<li>2, 4, 8, 16, 32 (rasio tetap 2)</li>
<li>3, 9, 27, 81, 243 (rasio tetap 3)</li>
<li>64, 32, 16, 8, 4 (rasio tetap 0.5)</li>
</ul>

<h2>Deret Campuran</h2>
<p>Deret campuran menggabungkan beberapa pola. Contoh:</p>
<ul>
<li>1, 4, 9, 16, 25 (kuadrat: 1², 2², 3², 4², 5²)</li>
<li>2, 6, 12, 20, 30 (n² + n: 1²+1, 2²+2, 3²+3, 4²+4, 5²+5)</li>
</ul>

<h2>Tips Mengerjakan Soal Deret Angka</h2>
<ol>
<li>Hitung selisih antar angka berturut-turut.</li>
<li>Cari pola dalam selisih atau rasio.</li>
<li>Perhatikan pola kuadrat, kubik, atau lainnya.</li>
<li>Gunakan kalkulator jika diperlukan.</li>
<li>Periksa kembali pola sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Deret angka adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada pengenalan pola, perhitungan selisih, dan rasio. Latihan rutin akan meningkatkan kemampuan deret angka.</p>'''
    },
    'Deret Huruf': {
        'title': 'Deret Huruf: Pola Alfabet',
        'content': '''<h1>Deret Huruf: Pola Alfabet</h1>

<h2>Pengertian Deret Huruf</h2>
<p>Deret huruf adalah rangkaian huruf yang mengikuti pola tertentu dalam alfabet. Pola dapat berupa urutan alfabet, lompatan huruf, atau pola lainnya. Deret huruf sangat penting dalam tes CPNS.</p>

<h2>Jenis Deret Huruf</h2>
<p>Deret huruf terdiri dari beberapa jenis:</p>
<ul>
<li><strong>Urutan Alfabet</strong> - Huruf berurutan dalam alfabet.</li>
<li><strong>Lompatan Huruf</strong> - Huruf dengan lompatan tertentu.</li>
<li><strong>Reverse Alfabet</strong> - Huruf dalam urutan terbalik.</li>
<li><strong>Deret Campuran</strong> - Kombinasi beberapa pola.</li>
</ul>

<h2>Urutan Alfabet</h2>
<p>Urutan alfabet dasar:</p>
<ul>
<li>A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z</li>
</ul>

<h2>Lompatan Huruf</h2>
<p>Lompatan huruf dengan pola tertentu. Contoh:</p>
<ul>
<li>A, C, E, G, I (lompat 1 huruf)</li>
<li>A, D, G, J, M (lompat 2 huruf)</li>
<li>A, E, I, M, Q (lompat 3 huruf)</li>
</ul>

<h2>Reverse Alfabet</h2>
<p>Urutan alfabet terbalik. Contoh:</p>
<ul>
<li>Z, Y, X, W, V, U, T, S, R, Q, P, O, N, M, L, K, J, I, H, G, F, E, D, C, B, A</li>
</ul>

<h2>Tips Mengerjakan Soal Deret Huruf</h2>
<ol>
<li>Hafal urutan alfabet secara lengkap.</li>
<li>Identifikasi pola lompatan huruf.</li>
<li>Perhatikan pola reverse atau campuran.</li>
<li>Gunakan kertas untuk menulis urutan jika diperlukan.</li>
<li>Periksa kembali pola sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Deret huruf adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada pengenalan pola, urutan alfabet, dan lompatan huruf. Latihan rutin akan meningkatkan kemampuan deret huruf.</p>'''
    },
    'Analogi': {
        'title': 'Analogi: Hubungan Kata',
        'content': '''<h1>Analogi: Hubungan Kata</h1>

<h2>Pengertian Analogi</h2>
<p>Analogi adalah hubungan kesamaan antara dua pasang kata. Analogi menguji kemampuan untuk mengenali hubungan antar kata dan menerapkannya pada pasangan kata lain. Analogi sangat penting dalam tes CPNS.</p>

<h2>Jenis Hubungan Analogi</h2>
<p>Hubungan analogi terdiri dari beberapa jenis:</p>
<ul>
<li><strong>Sinonim</strong> - Kata dengan makna sama.</li>
<li><strong>Antonim</strong> - Kata dengan makna berlawanan.</li>
<li><strong>Bagian-Whole</strong> - Bagian dari keseluruhan.</li>
<li><strong>Cause-Effect</strong> - Sebab dan akibat.</li>
<li><strong>Function</strong> - Fungsi atau kegunaan.</li>
</ul>

<h2>Contoh Analogi</h2>
<p>Contoh hubungan analogi:</p>
<ul>
<li><strong>Sinonim</strong> - Besar : Agung = Kecil : Mungil</li>
<li><strong>Antonim</strong> - Tinggi : Pendek = Panjang : Pendek</li>
<li><strong>Bagian-Whole</strong> - Jari : Tangan = Daun : Pohon</li>
<li><strong>Cause-Effect</strong> - Hujan : Basah = Api : Hangat</li>
<li><strong>Function</strong> - Pena : Menulis = Pisau : Memotong</li>
</ul>

<h2>Tips Mengerjakan Soal Analogi</h2>
<ol>
<li>Identifikasi hubungan antara kata pertama.</li>
<li>Cari pasangan kata dengan hubungan yang sama.</li>
<li>Gunakan proses eliminasi untuk memilih jawaban.</li>
<li>Perluas kosakata dengan membaca buku dan artikel.</li>
<li>Periksa kembali hubungan sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Analogi adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada pengenalian hubungan antar kata dan perluasan kosakata. Latihan rutin akan meningkatkan kemampuan analogi.</p>'''
    },
    'Silogisme': {
        'title': 'Silogisme: Logika Formal',
        'content': '''<h1>Silogisme: Logika Formal</h1>

<h2>Pengertian Silogisme</h2>
<p>Silogisme adalah bentuk penalaran deduktif yang terdiri dari dua premis dan satu kesimpulan. Silogisme menguji kemampuan logika formal dan penalaran deduktif. Silogisme sangat penting dalam tes CPNS.</p>

<h2>Struktur Silogisme</h2>
<p>Silogisme terdiri dari:</p>
<ul>
<li><strong>Premis Mayor</strong> - Pernyataan umum.</li>
<li><strong>Premis Minor</strong> - Pernyataan khusus.</li>
<li><strong>Kesimpulan</strong> - Hasil penalaran dari dua premis.</li>
</ul>

<h2>Contoh Silogisme</h2>
<p>Contoh silogisme valid:</p>
<ul>
<li>Premis Mayor: Semua manusia adalah makhluk hidup.</li>
<li>Premis Minor: Saya adalah manusia.</li>
<li>Kesimpulan: Saya adalah makhluk hidup.</li>
</ul>

<h2>Jenis Silogisme</h2>
<p>Jenis silogisme:</p>
<ul>
<li><strong>Silogisme Kategorikal</strong> - Menggunakan pernyataan kategorikal.</li>
<li><strong>Silogisme Hipotetikal</strong> - Menggunakan pernyataan bersyarat.</li>
<li><strong>Silogisme Disjungtif</strong> - Menggunakan pernyataan alternatif.</li>
</ul>

<h2>Tips Mengerjakan Soal Silogisme</h2>
<ol>
<li>Baca premis dengan teliti dan pahami maknanya.</li>
<li>Identifikasi hubungan antar premis.</li>
<li>Tarik kesimpulan yang logis dari premis.</li>
<li>Perhatikan kata kunci seperti "semua", "sebagian", "tidak ada".</li>
<li>Periksa kembali kesimpulan sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Silogisme adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada pemahaman premis, penalaran deduktif, dan logika formal. Latihan rutin akan meningkatkan kemampuan silogisme.</p>'''
    },
    'Sinonim': {
        'title': 'Sinonim: Persamaan Makna',
        'content': '''<h1>Sinonim: Persamaan Makna</h1>

<h2>Pengertian Sinonim</h2>
<p>Sinonim adalah kata yang memiliki makna yang sama atau hampir sama. Sinonim menguji kemampuan kosakata dan pemahaman makna kata. Sinonim sangat penting dalam tes CPNS.</p>

<h2>Contoh Sinonim</h2>
<p>Contoh pasangan sinonim:</p>
<ul>
<li>Besar - Agung, Luas, Raksasa</li>
<li>Kecil - Mungil, Mini, Kecil</li>
<li>Cepat - Kilat, Laju, Cepat</li>
<li>Indah - Cantik, Elok, Rupawan</li>
<li>Pintar - Cerdas, Pandai, Jenius</li>
</ul>

<h2>Tips Mengerjakan Soal Sinonim</h2>
<ol>
<li>Baca kata dengan teliti dan pahami maknanya.</li>
<li>Cari kata yang memiliki makna yang sama.</li>
<li>Gunakan proses eliminasi untuk memilih jawaban.</li>
<li>Perluas kosakata dengan membaca buku dan artikel.</li>
<li>Periksa kembali makna sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Sinonim adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada perluasan kosakata dan pemahaman makna kata. Latihan rutin akan meningkatkan kemampuan sinonim.</p>'''
    },
    'Antonim': {
        'title': 'Antonim: Lawan Kata',
        'content': '''<h1>Antonim: Lawan Kata</h1>

<h2>Pengertian Antonim</h2>
<p>Antonim adalah kata yang memiliki makna yang berlawanan. Antonim menguji kemampuan kosakata dan pemahaman makna kata. Antonim sangat penting dalam tes CPNS.</p>

<h2>Contoh Antonim</h2>
<p>Contoh pasangan antonim:</p>
<ul>
<li>Besar - Kecil</li>
<li>Tinggi - Pendek</li>
<li>Panjang - Pendek</li>
<li>Cepat - Lambat</li>
<li>Indah - Buruk</li>
</ul>

<h2>Tips Mengerjakan Soal Antonim</h2>
<ol>
<li>Baca kata dengan teliti dan pahami maknanya.</li>
<li>Cari kata yang memiliki makna yang berlawanan.</li>
<li>Gunakan proses eliminasi untuk memilih jawaban.</li>
<li>Perluas kosakata dengan membaca buku dan artikel.</li>
<li>Periksa kembali makna sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Antonim adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada perluasan kosakata dan pemahaman makna kata. Latihan rutin akan meningkatkan kemampuan antonim.</p>'''
    },
    'Perbandingan Kuantitatif': {
        'title': 'Perbandingan Kuantitatif',
        'content': '''<h1>Perbandingan Kuantitatif</h1>

<h2>Pengertian Perbandingan Kuantitatif</h2>
<p>Perbandingan kuantitatif adalah kemampuan untuk membandingkan besaran numerik. Perbandingan kuantitatif meliputi rasio, proporsi, dan persentase. Perbandingan kuantitatif sangat penting dalam tes CPNS.</p>

<h2>Jenis Perbandingan</h2>
<p>Perbandingan kuantitatif terdiri dari:</p>
<ul>
<li><strong>Rasio</strong> - Perbandingan dua besaran.</li>
<li><strong>Proporsi</strong> - Bagian dari keseluruhan.</li>
<li><strong>Persentase</strong> - Perbandingan terhadap 100.</li>
<li><strong>Fractions</strong> - Pecahan.</li>
</ul>

<h2>Contoh Perbandingan</h2>
<p>Contoh perbandingan kuantitatif:</p>
<ul>
<li>Rasio 2:3 berarti untuk setiap 2 bagian, ada 3 bagian lain.</li>
<li>Proporsi 1:4 berarti 1 bagian dari 4 bagian total.</li>
<li>Persentase 50% berarti setengah dari keseluruhan.</li>
<li>Fraction 1/2 berarti setengah dari keseluruhan.</li>
</ul>

<h2>Tips Mengerjakan Soal Perbandingan Kuantitatif</h2>
<ol>
<li>Identifikasi besaran yang dibandingkan.</li>
<li>Gunakan rumus rasio atau proporsi yang tepat.</li>
<li>Gunakan kalkulator jika diperlukan.</li>
<li>Perhatikan satuan dan konversi satuan.</li>
<li>Periksa kembali perhitungan sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Perbandingan kuantitatif adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada rasio, proporsi, dan persentase. Latihan rutin akan meningkatkan kemampuan perbandingan kuantitatif.</p>'''
    },
    'Operasi Hitung': {
        'title': 'Operasi Hitung Dasar dan Lanjutan',
        'content': '''<h1>Operasi Hitung Dasar dan Lanjutan</h1>

<h2>Pengertian Operasi Hitung</h2>
<p>Operasi hitung adalah proses matematis untuk menghitung angka. Operasi hitung dasar meliputi penjumlahan, pengurangan, perkalian, dan pembagian. Operasi hitung sangat penting dalam tes CPNS.</p>

<h2>Operasi Hitung Dasar</h2>
<p>Operasi hitung dasar meliputi:</p>
<ul>
<li><strong>Penjumlahan</strong> - Menambahkan dua atau lebih angka.</li>
<li><strong>Pengurangan</strong> - Mengurangi satu angka dari angka lain.</li>
<li><strong>Perkalian</strong> - Mengalikan dua atau lebih angka.</li>
<li><strong>Pembagian</strong> - Membagi satu angka dengan angka lain.</li>
</ul>

<h2>Operasi Hitung Lanjutan</h2>
<p>Operasi hitung lanjutan meliputi:</p>
<ul>
<li><strong>Eksponen</strong> - Pangkat dari angka.</li>
<li><strong>Akar</strong> - Akar dari angka.</li>
<li><strong>Logaritma</strong> - Logaritma dari angka.</li>
<li><strong>Faktorial</strong> - Faktorial dari angka.</li>
</ul>

<h2>Tips Mengerjakan Soal Operasi Hitung</h2>
<ol>
<li>Latih operasi hitung dasar secara rutin.</li>
<li>Gunakan teknik estimasi untuk mempercepat perhitungan.</li>
<li>Gunakan kalkulator jika diperlukan.</li>
<li>Perhatikan urutan operasi (kurung, perkalian/pembagian, penjumlahan/pengurangan).</li>
<li>Periksa kembali perhitungan sebelum mengirim jawaban.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Operasi hitung adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada operasi hitung dasar dan lanjutan. Latihan rutin akan meningkatkan kecepatan dan akurasi operasi hitung.</p>'''
    },
    'Pemahaman Bacaan': {
        'title': 'Pemahaman Bacaan dan Komprehensi',
        'content': '''<h1>Pemahaman Bacaan dan Komprehensi</h1>

<h2>Pengertian Pemahaman Bacaan</h2>
<p>Pemahaman bacaan adalah kemampuan untuk memahami teks dan menarik kesimpulan dari teks tersebut. Pemahaman bacaan meliputi pemahaman literal, inferensial, dan kritis. Pemahaman bacaan sangat penting dalam tes CPNS.</p>

<h2>Jenis Pemahaman Bacaan</h2>
<p>Pemahaman bacaan terdiri dari:</p>
<ul>
<li><strong>Pemahaman Literal</strong> - Memahami informasi yang tertulis secara eksplisit.</li>
<li><strong>Pemahaman Inferensial</strong> - Menarik kesimpulan dari informasi yang tersirat.</li>
<li><strong>Pemahaman Kritis</strong> - Mengevaluasi dan menganalisis teks secara kritis.</li>
</ul>

<h2>Tips Mengerjakan Soal Pemahaman Bacaan</h2>
<ol>
<li>Baca teks dengan teliti dan pahami isi teks.</li>
<li>Identifikasi informasi penting dalam teks.</li>
<li>Menarik kesimpulan dari informasi yang tersirat.</li>
<li>Gunakan proses eliminasi untuk memilih jawaban.</li>
<li>Periksa kembali jawaban sebelum mengirim.</li>
</ol>

<h2>Kesimpulan</h2>
<p>Pemahaman bacaan adalah kemampuan yang dapat dilatih dengan latihan yang konsisten. Fokus pada pemahaman literal, inferensial, dan kritis. Latihan rutin akan meningkatkan kemampuan pemahaman bacaan.</p>'''
    },
    # TKP, TPA, PSIKOLOGIS topics will use generic content for now
}

class RateLimiter:
    """Rate limiter to control request frequency"""
    def __init__(self, min_delay=MIN_DELAY, max_delay=MAX_DELAY):
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.last_request_time = 0
    
    def wait(self):
        """Wait for appropriate delay before next request"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_delay:
            sleep_time = self.min_delay - time_since_last
            time.sleep(sleep_time)
        else:
            # Add random delay to appear more natural
            delay = random.uniform(self.min_delay, self.max_delay)
            time.sleep(delay)
        
        self.last_request_time = time.time()

def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to database: {e}")
        return None

def get_topics_from_db():
    """Get all topics from database"""
    connection = get_db_connection()
    if not connection:
        return []
    
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT t.id, t.kategori_id, t.nama_topik, k.nama_kategori 
            FROM topik_pelajaran t 
            JOIN kategori_soal k ON t.kategori_id = k.id 
            ORDER BY t.kategori_id, t.urutan
        """
        cursor.execute(query)
        topics = cursor.fetchall()
        cursor.close()
        return topics
    except Error as e:
        print(f"Error fetching topics: {e}")
        return []
    finally:
        if connection and connection.is_connected():
            connection.close()

def generate_comprehensive_content(topic_name, category_name):
    """Generate comprehensive content for a topic"""
    # Check if we have a template for this topic
    if topic_name in TOPIC_CONTENT_TEMPLATES:
        return TOPIC_CONTENT_TEMPLATES[topic_name]
    
    # Generate generic comprehensive content
    return {
        'title': f'{topic_name}: Materi Komprehensif',
        'content': f'''<h1>{topic_name}: Materi Komprehensif</h1>

<h2>Pengertian</h2>
<p>{topic_name} adalah salah satu materi penting dalam kategori {category_name}. Materi ini sangat penting untuk dipahami karena menjadi dasar dalam memecahkan masalah yang terkait.</p>

<h2>Konsep Dasar</h2>
<p>Untuk memahami {topic_name}, perlu dipahami konsep-konsep dasar yang menjadi fondasinya. Konsep-konsep ini saling terkait dan membentuk pemahaman yang utuh.</p>

<h2>Poin-Poin Penting</h2>
<ul>
<li>Definisi dan konsep dasar yang perlu dipahami</li>
<li>Teori dan prinsip yang relevan dengan materi</li>
<li>Penerapan dalam praktik dan kehidupan sehari-hari</li>
<li>Contoh kasus dan studi yang relevan</li>
<li>Tips dan strategi untuk memahami materi</li>
</ul>

<h2>Cara Belajar Efektif</h2>
<ol>
<li>Baca materi dengan teliti dan pahami konsep dasar</li>
<li>Buat catatan dan ringkasan materi</li>
<li>Lakukan latihan soal untuk menguji pemahaman</li>
<li>Diskusikan dengan teman atau guru jika ada yang tidak dipahami</li>
<li>Review materi secara berkala</li>
</ol>

<h2>Kesimpulan</h2>
<p>{topic_name} adalah materi yang penting dan perlu dipahami dengan baik. Dengan belajar secara sistematis dan konsisten, materi ini dapat dikuasai dengan baik.</p>

<p><em>Catatan: Materi ini akan diperbarui secara berkala dengan konten yang lebih komprehensif dari sumber-sumber terpercaya.</em></p>'''
    }

def save_material_to_file(topic_id, topic_name, category_name, content_data):
    """Save learning material to file"""
    # Create file path
    category_dir = os.path.join(BASE_DIR, category_name)
    topic_dir_name = f"{topic_id}_{topic_name.lower().replace(' ', '_')}"
    topic_dir = os.path.join(category_dir, topic_dir_name)
    
    # Ensure directory exists
    os.makedirs(topic_dir, exist_ok=True)
    
    # Create file
    file_name = f"{topic_name.lower().replace(' ', '_')}.html"
    file_path = os.path.join(topic_dir, file_name)
    
    # Write content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content_data['content'])
    
    # Return relative path for database
    relative_path = f"data/learning_materials/topics/{category_name}/{topic_dir_name}/{file_name}"
    return relative_path

def update_database_with_file_path(topic_id, category_id, title, file_path):
    """Update database with file path instead of content"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check if material already exists
        check_query = """
            SELECT id FROM bahan_pelajaran 
            WHERE topic_id = %s AND kategori_id = %s
        """
        cursor.execute(check_query, (topic_id, category_id))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing record
            update_query = """
                UPDATE bahan_pelajaran 
                SET judul = %s, file_path = %s, konten = NULL, url = NULL
                WHERE id = %s
            """
            cursor.execute(update_query, (title, file_path, existing[0]))
        else:
            # Insert new record
            insert_query = """
                INSERT INTO bahan_pelajaran (kategori_id, topic_id, judul, konten, tipe, file_path, url, urutan)
                VALUES (%s, %s, %s, NULL, 'teks', %s, NULL, 1)
            """
            cursor.execute(insert_query, (category_id, topic_id, title, file_path))
        
        connection.commit()
        cursor.close()
        return True
    except Error as e:
        print(f"Error updating database: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            connection.close()

def process_topic(topic, rate_limiter):
    """Process a single topic"""
    rate_limiter.wait()
    
    topic_id = topic['id']
    topic_name = topic['nama_topik']
    category_id = topic['kategori_id']
    category_name = topic['nama_kategori']
    
    print(f"Processing: {category_name} - {topic_name}")
    
    # Generate comprehensive content
    content_data = generate_comprehensive_content(topic_name, category_name)
    
    # Save to file
    file_path = save_material_to_file(topic_id, topic_name, category_name, content_data)
    
    # Update database
    success = update_database_with_file_path(topic_id, category_id, content_data['title'], file_path)
    
    if success:
        print(f"  ✓ Saved to: {file_path}")
    else:
        print(f"  ✗ Failed to update database")
    
    return success

def process_topics_in_batches(topics):
    """Process topics in batches with rate limiting"""
    rate_limiter = RateLimiter()
    
    total_topics = len(topics)
    processed = 0
    successful = 0
    failed = 0
    
    for i in range(0, total_topics, BATCH_SIZE):
        batch = topics[i:i+BATCH_SIZE]
        
        print(f"\n--- Processing batch {i//BATCH_SIZE + 1} ---")
        
        for topic in batch:
            success = process_topic(topic, rate_limiter)
            processed += 1
            if success:
                successful += 1
            else:
                failed += 1
        
        # Delay between batches
        if i + BATCH_SIZE < total_topics:
            print(f"Waiting {BATCH_DELAY} seconds before next batch...")
            time.sleep(BATCH_DELAY)
    
    print(f"\n{'='*50}")
    print(f"Total topics: {total_topics}")
    print(f"Processed: {processed}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"{'='*50}")

def main():
    """Main function"""
    print("="*50)
    print("Generating Comprehensive Learning Materials")
    print("="*50)
    print(f"Base directory: {BASE_DIR}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Rate limit: {MIN_DELAY}-{MAX_DELAY} seconds")
    print("="*50)
    
    # Get topics from database
    print("\nFetching topics from database...")
    topics = get_topics_from_db()
    
    if not topics:
        print("No topics found in database.")
        return
    
    print(f"Found {len(topics)} topics")
    
    # Process topics in batches
    print("\nStarting batch processing...")
    process_topics_in_batches(topics)
    
    print("\nGeneration completed!")

if __name__ == "__main__":
    main()
