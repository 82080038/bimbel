<?php
require_once 'config.php';

echo "<h1>Import Soal ke Database</h1>";
echo "<p>Menghubungkan ke database...</p>";

if ($conn->connect_error) {
    die("<p style='color:red'>Koneksi gagal: " . $conn->connect_error . "</p>");
}

echo "<p style='color:green'>Koneksi berhasil!</p>";

// Sample TWK Questions
$twk_questions = [
    [
        'kategori_id' => 1,
        'pertanyaan' => 'Negara X adalah sebuah negara yang baru saja merdeka dan sedang berusaha membangun rasa nasionalisme di kalangan warganya. Proses ini dilakukan melalui implementasi berbagai program pemerintah dan penyebaran nilai-nilai patriotisme dalam pendidikan. Namun, beberapa tantangan tampaknya menjadi penghambat dalam upaya tersebut. Antara lain: Banyak warga Negara X yang memilih untuk bekerja di negara lain dan mengadopsi gaya hidup serta budaya negara tersebut. Sebagian masyarakat Negara X lebih tertarik pada barang-barang impor dibandingkan produk lokal. Penyiaran dan media di Negara X banyak didominasi oleh konten dari luar negeri. Konflik internal antara berbagai kelompok etnis dan agama yang berbeda. Pengetahuan dan apresiasi terhadap sejarah dan budaya lokal cukup tinggi di kalangan masyarakat berusia. Berdasarkan kasus di atas, mana faktor yang paling mungkin menjadi penghambat utama dalam membangun semangat nasionalisme di Negara X?',
        'opsi_a' => 'Globalisasi',
        'opsi_b' => 'Kesenjangan sosial',
        'opsi_c' => 'Pendidikan yang kurang efektif',
        'opsi_d' => 'Sumber daya manusia yang kurang',
        'opsi_e' => 'Kurangnya dukungan dari pemerintah',
        'jawaban_benar' => 'A',
        'pembahasan' => 'Globalisasi merupakan fenomena di mana dunia semakin terhubung dari segi teknologi, ekonomi, dan budaya. Dalam kasus Negara X, globalisasi memiliki pengaruh yang signifikan sebagai penghambat perkembangan nasionalisme. Hal ini dapat dilihat dari beberapa indikasi: 1) Migrasi tenaga kerja: Banyak warga Negara X yang memilih untuk bekerja di negara lain. Migrasi tenaga kerja ini cenderung membuat mereka mengadopsi gaya hidup serta budaya negara di mana mereka bekerja, yang dapat berpotensi mengurangi ikatan mereka dengan Negara X. 2) Dominasi barang dan layanan impor: Ketertarikan masyarakat Negara X terhadap barang-barang impor di atas produk lokal menunjukkan dampak globalisasi. 3) Dominasi konten media asing: Media memainkan peran penting dalam membentuk persepsi masyarakat. Melalui tiga indikasi ini, dapat disimpulkan bahwa globalisasi adalah faktor utama yang menghambat pembangunan semangat nasionalisme di Negara X.',
        'tips' => 'Untuk soal TWK tentang nasionalisme, perhatikan konteks globalisasi dan dampaknya terhadap identitas nasional. Cari indikator-indikator yang menunjukkan pengaruh asing terhadap kehidupan lokal.'
    ],
    [
        'kategori_id' => 1,
        'pertanyaan' => 'Pada masa penjajahan, beberapa pemuda Indonesia seperti Ernest Douwes Dekker, Soewardi Soerjaningrat dan Tjipto Mangunkusumo mendirikan organisasi yang bernama Indische Party. Organisasi ini dikenal sebagai organisasi pertama yang mencetuskan konsep merdeka, yaitu bebas dari penjajahan Belanda dan menjadi fondasi penting dalam paham nasionalisme Indonesia. Peran Indische Party dan konsep merdeka memiliki pengaruh yang signifikan dalam sejarah kemerdekaan Indonesia. Bagaimanakah dampak konsep merdeka dan paham nasionalisme yang ditetapkan oleh Indische Party dalam perjuangan bangsa Indonesia hingga hari ini?',
        'opsi_a' => 'Menginspirasi pembuatan Pancasila sebagai dasar negara',
        'opsi_b' => 'Mendorong pertumbuhan partai-partai politik di Indonesia',
        'opsi_c' => 'Mendorong terbentuknya kesadaran kolektif untuk merdeka',
        'opsi_d' => 'Mendorong penggunaan Bahasa Indonesia sebagai bahasa resmi',
        'opsi_e' => 'Menstimulasi pembentukan lembaga-lembaga pemerintahan setelah kemerdekaan',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Konsep merdeka dan paham nasionalisme yang disuarakan oleh Indische Party dapat dianggap sebagai gerakan awal yang signifikan dalam mendorong terbentuknya kesadaran kolektif untuk merdeka di Indonesia. Kesadaran kolektif ini merujuk pada pemahaman bersama di antara penduduk Indonesia bahwa mereka menginginkan dan berhak atas kemerdekaan negara mereka sendiri, bebas dari penjajahan asing. Paham nasionalisme ini meletakkan dasar bagi perjuangan Indonesia untuk mendapatkan kemerdekaan. Ide-ide dari Indische Party, termasuk konsep merdeka dan nasionalisme, membantu menguatkan perlawanan terhadap penjajah dan membentuk pergerakan nasionalis yang lebih besar yang akhirnya sukses memenangkan kemerdekaan Indonesia.',
        'tips' => 'Untuk soal sejarah pergerakan nasional, pahami konsep dasar dari setiap organisasi dan dampaknya terhadap kesadaran kolektif bangsa.'
    ],
    [
        'kategori_id' => 1,
        'pertanyaan' => 'Pada 2021 silam, seorang aparat bernama Briptu Nikmal Idwan diduga melakukan pemerkosaan terhadap seorang remaja perempuan berusia 16 tahun di Mapolsek Jailolo Selatan, Halmahera Barat, Maluku Utara. Tindakan aparat ini jelas sekali bertentangan dengan....',
        'opsi_a' => 'UUD 1945 pasal 27 ayat 3',
        'opsi_b' => 'UUD 1945 pasal 30 ayat 3',
        'opsi_c' => 'UUD 1945 pasal 30 ayat 4',
        'opsi_d' => 'UU nomor 3 2002 pasal 9 ayat 1',
        'opsi_e' => 'UU nomor 3 2002 pasal 9 ayat 2',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Bunyi masing-masing pasal: UUD 1945 pasal 27 ayat 3: Setiap warga negara berhak dan wajib ikut serta dalam pembelaan negara. UUD 1945 pasal 30 ayat 3: Tentara Nasional Indonesia terdiri atas Angkatan Darat, Angkatan Laut, dan Angkatan Udara sebagai alat negara yang bertugas mempertahankan, melindungi, dan memelihara keutuhan dan kedaulatan negara. UUD 1945 pasal 30 ayat 4: Kepolisian Negara Republik Indonesia sebagai alat negara yang menjaga keamanan dan ketertiban masyarakat bertugas melindungi, mengayomi, melayani masyarakat, serta menegakkan hukum. Tindakan pemerkosaan yang dilakukan oleh oknum aparat tersebut jelas melanggar UUD 1945 pasal 30 ayat 4. Polisi seharusnya melindungi dan mengayomi masyarakat, tetapi justru menjadi ancaman dan pelaku kriminal.',
        'tips' => 'Untuk soal hukum/tata negara, hafalkan pasal-pasal penting dalam UUD 1945 terutama yang berkaitan dengan tugas dan fungsi lembaga negara.'
    ],
    [
        'kategori_id' => 1,
        'pertanyaan' => 'Nama Pandawara Group seringkali menjadi perbincangan dan trending topik di sosial media berkat aksi-aksi heroiknya dalam membersihkan sampah. Beranggotakan lima orang pemuda, yaitu Ikhsan Destian, Gliang Rahma, Muhammad Rifqi, Rafly Pasya, dan Agung Permana, tak jarang Pandawara Group mengajak masyarakat dan netizen untuk turut serta turun ke lapangan membersihkan sampah. Aksi kelompok pemuda ini mencerminkan salah satu nilai bela negara, yaitu....',
        'opsi_a' => 'cinta tanah air',
        'opsi_b' => 'kesadaran berbangsa dan bernegara',
        'opsi_c' => 'rela berkorban',
        'opsi_d' => 'memiliki kemampuan bela negara',
        'opsi_e' => 'memiliki kemampuan awal bela negara',
        'jawaban_benar' => 'A',
        'pembahasan' => 'Dalam kasus tersebut, Pandawara Group berupaya menjaga dan melestarikan lingkungan hidup. Aksi mereka ini sesuai dengan salah satu indikator cinta tanah air. Indikatornya adalah sebagai berikut: Mencintai, menjaga dan melestarikan Lingkungan Hidup, Menghargai dan menggunakan karya anak bangsa, Menggunakan produk dalam negeri, Menjaga dan memahami seluruh ruang wilayah NKRI, Menjaga nama baik bangsa dan negara, Mengenal wilayah tanah air tanpa rasa fanatisme kedaerahan.',
        'tips' => 'Untuk soal bela negara, pahami indikator-indikator dari setiap nilai bela negara seperti cinta tanah air, kesadaran berbangsa, dan rela berkorban.'
    ],
    [
        'kategori_id' => 1,
        'pertanyaan' => 'Sikap di bawah ini yang berlandaskan nasionalisme yang berpengaruh pada kebijakan fiskal negara ialah....',
        'opsi_a' => 'Melakukan pembayaran pajak tepat pada waktu yang ditentukan',
        'opsi_b' => 'Melakukan suatu pekerjaan yang tidak bertentangan dengan hukum',
        'opsi_c' => 'Membeli produk-produk buatan dalam negeri',
        'opsi_d' => 'Menggunakan hak pilih pada pemilihan umum (pemilu)',
        'opsi_e' => 'Memiliki sikap toleransi tinggi terhadap orang/masyarakat yang berbeda keyakinan',
        'jawaban_benar' => 'A',
        'pembahasan' => 'Kebijakan fiskal adalah kebijakan yang dibuat oleh pemerintah untuk mengarahkan ekonomi suatu negara melalui pengeluaran (expenditure) dan pendapatan (income) dalam bentuk pajak oleh pemerintah. Jadi, membayar pajak tepat pada waktunya merupakan salah satu tindakan nasionalisme yang berpengaruh pada kebijakan fiskal negara.',
        'tips' => 'Pahami definisi kebijakan fiskal (berkaitan dengan pajak dan pengeluaran negara) untuk membedakan dengan kebijakan moneter.'
    ]
];

// Sample TIU Questions
$tiu_questions = [
    [
        'kategori_id' => 2,
        'pertanyaan' => 'API : ... = ... : TERBASAHI',
        'opsi_a' => 'PANAS – CAIRAN',
        'opsi_b' => 'TERBAKAR – AIR',
        'opsi_c' => 'BERBAHAYA – GENANGAN',
        'opsi_d' => 'DIHINDARI – DIDEKATI',
        'opsi_e' => 'GAS – CAIR',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Kata pertama kelompok kiri adalah API yang merupakan sebuah nomina atau kata benda, kata kedua di kelompok kanan adalah kata kerja. Berdasarkan hal tersebut, untuk mengisi bagian rumpang dibutuhkan kata benda dan kata kerja yang cocok sehingga TERBAKAR dan AIR dapat dipilih untuk melengkapi bagian rumpang. Hubungan: API menyebabkan terbakar, AIR mencegah terbakar/terbasahi.',
        'tips' => 'Untuk soal analogi kata, identifikasi hubungan antar kata (sebab-akibat, sinonim, antonim, bagian-keseluruhan, dll) lalu cari pasangan dengan hubungan yang sama.'
    ],
    [
        'kategori_id' => 2,
        'pertanyaan' => 'KULKAS : SATU PINTU : DUA PINTU = ...',
        'opsi_a' => 'APEL : SATU KERANJANG : DUA KERANJANG',
        'opsi_b' => 'ES KRIM : DINGIN : PANAS',
        'opsi_c' => 'RODA : BULAT : KOTAK',
        'opsi_d' => 'KASUR : RANJANG : ALAS TIDUR',
        'opsi_e' => 'MESIN CUCI : BUKAAN ATAS : BUKAAN DEPAN',
        'jawaban_benar' => 'E',
        'pembahasan' => 'Hubungan antara "KULKAS", "SATU PINTU", "DUA PINTU" adalah Kulkas memiliki jenis 1 pintu dan jenis 2 pintu. Hubungan ini sama seperti "MESIN CUCI", "BUKAAN ATAS", "BUKAAN DEPAN", mesin cuci memiliki jenis bukaan atas dan bukaan depan.',
        'tips' => 'Untuk soal analogi tiga kata, identifikasi pola hubungan: objek memiliki variasi/jenis, lalu cari opsi dengan pola yang sama.'
    ],
    [
        'kategori_id' => 2,
        'pertanyaan' => 'Hubungan yang terdapat pada kalimat ikan adalah ekor sama seperti hubungan pada kalimat....',
        'opsi_a' => 'Manusia adalah kaki.',
        'opsi_b' => 'Kucing adalah buntut.',
        'opsi_c' => 'Daun adalah helai.',
        'opsi_d' => 'Bunga adalah buah.',
        'opsi_e' => 'Rumah adalah hunian.',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Hubungan yang terdapat dalam kalimat ikan adalah ekor yang paling mungkin adalah ikan menggunakan penggolongan ekor dalam perhitungannya. Kalimat yang memiliki hubungan yang sama yaitu Daun adalah helai karena daun menggunakan penggolongan helai dalam perhitungannya. Ini adalah hubungan bagian-keseluruhan dengan satuan hitung.',
        'tips' => 'Perhatikan hubungan semantik antar kata. Dalam soal ini, hubungan adalah objek-bagian dengan satuan penghitungan.'
    ],
    [
        'kategori_id' => 2,
        'pertanyaan' => 'Perhatikan pernyataan berikut! Setiap manusia di dunia pernah mengalami gigi rontok. Beberapa manusia di dunia adalah orang yang sangat tampan. Jadi,....',
        'opsi_a' => 'Beberapa manusia yang sangat tampan tidak pernah mengalami rontok gigi.',
        'opsi_b' => 'Beberapa manusia yang sangat tampan pernah mengalami rontok gigi.',
        'opsi_c' => 'Semua manusia yang sangat tampan tidak pernah mengalami rontok gigi.',
        'opsi_d' => 'Semua manusia yang sangat tampan pernah mengalami rontok gigi.',
        'opsi_e' => 'Semua manusia yang pernah mengalami rontok gigi adalah manusia yang sangat tampan.',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Kesimpulan yang tepat berdasarkan kedua informasi adalah Beberapa manusia yang sangat tampan pernah mengalami rontok gigi. Kesimpulan ini ditarik berdasarkan pernyataan bahwa Setiap manusia di dunia pernah mengalami gigi rontok. Karena Beberapa manusia di dunia adalah orang yang sangat tampan, maka orang tersebut tetap pernah mengalami rontok gigi. Ini adalah silogisme dengan premis universal dan partikular.',
        'tips' => 'Untuk soal silogisme, gunakan aturan logika: dari "semua A adalah B" dan "beberapa A adalah C" dapat disimpulkan "beberapa C adalah B".'
    ],
    [
        'kategori_id' => 2,
        'pertanyaan' => 'Orang-orang yang rajin membaca buku pasti memiliki pengetahuan yang luas. Orang yang memiliki pengetahuan luas sering kali lebih kreatif dalam memecahkan masalah. Hal ini membuat seseorang sukses dalam kariernya. Kesimpulan yang dapat ditarik dari premis-premis di atas adalah....',
        'opsi_a' => 'Orang yang sukses dalam kariernya pasti rajin membaca buku.',
        'opsi_b' => 'Orang yang rajin membaca buku sukses dalam kariernya.',
        'opsi_c' => 'Orang yang kreatif dalam memecahkan masalah pasti memiliki pengetahuan luas.',
        'opsi_d' => 'Orang yang sukses dalam karier pasti sering kali lebih kreatif dalam memecahkan masalah.',
        'opsi_e' => 'Orang yang sukses dalam karier sering kali rajin membaca buku.',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Premis pertama menyatakan bahwa orang yang rajin membaca buku (p) memiliki pengetahuan luas (q). Premis kedua menyatakan bahwa orang yang memiliki pengetahuan luas (q) lebih kreatif dalam memecahkan masalah (r). Premis ketiga menyatakan bahwa Hal ini (orang yang kreatif dalam memecahkan masalah) (r) membuat seseorang sukses dalam kariernya (s). P1: p → q, P2: q → r, P3: r → s. Dari P1, P2 dan P3 dapat kita ambil kesimpulan sehingga berlaku p → s, kesimpulan ini memiliki bentuk kalimat Orang yang rajin membaca buku sukses dalam kariernya.',
        'tips' => 'Untuk silogisme berantai, gabungkan semua premis: jika A→B, B→C, C→D, maka A→D.'
    ],
    [
        'kategori_id' => 2,
        'pertanyaan' => '65, 60, 45, 40, ..., 20, 10, 5',
        'opsi_a' => '5',
        'opsi_b' => '25',
        'opsi_c' => '30',
        'opsi_d' => '35',
        'opsi_e' => '40',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Bilangan deret terbentuk dengan pola angka dimana angka setelahnya (sepasang) memiliki selisih 5 atau -5. Pola: 65-60=5, 60-45=15, 45-40=5, 40-?=15, ?-20=5, 20-10=10, 10-5=5. Pola selisih: 5, 15, 5, 15, 5, 10, 5. Untuk ? = 25, maka 40-25=15 dan 25-20=5. Pola konsisten.',
        'tips' => 'Untuk deret angka, cari pola selisih antar angka. Perhatikan apakah ada pola berulang atau naik-turun.'
    ],
    [
        'kategori_id' => 2,
        'pertanyaan' => 'Suap : Politik = .......... : ..........',
        'opsi_a' => 'Korupsi : nepotisme',
        'opsi_b' => 'Sontek : Ujian',
        'opsi_c' => 'Perampok : Polisi',
        'opsi_d' => 'Culas : Sifat',
        'opsi_e' => 'Joki : Ganti',
        'jawaban_benar' => 'B',
        'pembahasan' => 'Suap dilarang dalam Politik. Sontek dilarang dalam ujian. Hubungan: perbuatan negatif yang dilarang dalam konteks tertentu.',
        'tips' => 'Identifikasi hubungan: X dilarang dalam Y. Cari pasangan dengan hubungan yang sama.'
    ],
    [
        'kategori_id' => 2,
        'pertanyaan' => 'Asia : Jepang : Sapporo = ..... : ...... : .........',
        'opsi_a' => 'Asia : Baghdah : Khalifah',
        'opsi_b' => 'Eropa : London : Coloseum',
        'opsi_c' => 'Amerika : Amerika Serikat : Liberty',
        'opsi_d' => 'Kelimutu : Flores : Indonesia',
        'opsi_e' => 'Benua : Pulau : Berpenduduk',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Salah satu Negara yang ada di benua ASIA adalah Jepang yang memiliki ikon wisata Sapporo. Salah satu Negara yang ada di benua Amerika adalah Amerika Serikat yang memiliki ikon wisata Liberty. Hubungan: Benua : Negara di benua tersebut : Ikon/kota terkenal.',
        'tips' => 'Untuk analogi tiga kata, identifikasi hierarki: Benua → Negara → Ikon/Kota.'
    ]
];

// Sample TKP Questions
$tkp_questions = [
    [
        'kategori_id' => 3,
        'pertanyaan' => 'Saat Anda menghadapi situasi sulit di tempat kerja, apa yang akan Anda lakukan?',
        'opsi_a' => 'Mengeluh dan mencari kesalahan orang lain',
        'opsi_b' => 'Menghindar dan menunda penyelesaian masalah',
        'opsi_c' => 'Menganalisis masalah dan mencari solusi dengan tenang',
        'opsi_d' => 'Meminta bantuan tanpa mencoba menyelesaikan sendiri',
        'opsi_e' => 'Menyerah dan mencari pekerjaan lain',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan sikap tanggung jawab, kemampuan problem solving, dan ketenangan dalam menghadapi masalah. Ini adalah karakteristik yang diinginkan untuk pegawai negeri/sekolah kedinasan.',
        'tips' => 'Untuk soal TKP, pilih jawaban yang menunjukkan sikap positif, tanggung jawab, jujur, dan profesional.'
    ],
    [
        'kategori_id' => 3,
        'pertanyaan' => 'Rekan kerja Anda melakukan kesalahan yang tidak disengaja. Apa tindakan Anda?',
        'opsi_a' => 'Melaporkan ke atasan untuk mendapatkan keuntungan pribadi',
        'opsi_b' => 'Menertawakan dan mengumumkan kesalahan tersebut',
        'opsi_c' => 'Memberi tahu rekan tersebut dan menawarkan bantuan',
        'opsi_d' => 'Pura-pura tidak tahu dan membiarkan saja',
        'opsi_e' => 'Mencari-cari kesalahan lain dari rekan tersebut',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan sikap kepedulian, kerjasama, dan integritas. Memberi tahu dengan cara yang baik dan menawarkan bantuan adalah sikap yang profesional.',
        'tips' => 'TKP mengukur karakteristik pribadi. Pilih jawaban yang menunjukkan sikap kolaboratif, empati, dan integritas tinggi.'
    ],
    [
        'kategori_id' => 3,
        'pertanyaan' => 'Anda mendapatkan tugas baru yang menantang. Sikap Anda adalah....',
        'opsi_a' => 'Menolak tugas tersebut karena terlalu sulit',
        'opsi_b' => 'Menerima tapi tidak serius mengerjakannya',
        'opsi_c' => 'Menerima dengan antusias dan belajar untuk menyelesaikannya',
        'opsi_d' => 'Menunda mengerjakan sampai deadline dekat',
        'opsi_e' => 'Minta orang lain mengerjakan untuk Anda',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan sikap antusias, motivasi belajar, dan tanggung jawab. Ini adalah karakteristik yang dicari untuk pegawai kedinasan.',
        'tips' => 'Pilih jawaban yang menunjukkan motivasi, antusiasme, dan kemauan untuk belajar dan berkembang.'
    ],
    [
        'kategori_id' => 3,
        'pertanyaan' => 'Atasan memberikan kritik terhadap pekerjaan Anda. Reaksi Anda adalah....',
        'opsi_a' => 'Marah dan merasa tersinggung',
        'opsi_b' => 'Mengabaikan kritik dan tetap melakukan cara sendiri',
        'opsi_c' => 'Menerima kritik dengan terbuka dan memperbaiki diri',
        'opsi_d' => 'Mencari alasan untuk membela diri',
        'opsi_e' => 'Menggosipkan atasan di belakang',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan sikap terbuka terhadap masukan, kemauan untuk memperbaiki diri, dan kedewasaan emosional.',
        'tips' => 'Untuk soal TKP tentang kritik/masukan, pilih jawaban yang menunjukkan keterbukaan, kedewasaan, dan kemauan untuk berkembang.'
    ],
    [
        'kategori_id' => 3,
        'pertanyaan' => 'Dalam situasi darurat, apa yang akan Anda lakukan?',
        'opsi_a' => 'Panik dan tidak bisa berpikir jernih',
        'opsi_b' => 'Menunggu instruksi dari orang lain tanpa inisiatif',
        'opsi_c' => 'Tetap tenang dan mengambil tindakan yang diperlukan',
        'opsi_d' => 'Lari dari situasi tersebut',
        'opsi_e' => 'Menyalahkan keadaan',
        'jawaban_benar' => 'C',
        'pembahasan' => 'Jawaban C menunjukkan kemampuan mengontrol emosi, ketenangan di bawah tekanan, dan kemampuan pengambilan keputusan.',
        'tips' => 'Pilih jawaban yang menunjukkan ketenangan, kemampuan pengambilan keputusan, dan tanggung jawab dalam situasi darurat.'
    ]
];

echo "<h2>Import TWK Questions</h2>";
$twk_count = 0;
foreach ($twk_questions as $q) {
    $sql = "INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, tips) 
            VALUES ('" . $q['kategori_id'] . "', 
                    '" . $conn->real_escape_string($q['pertanyaan']) . "', 
                    '" . $conn->real_escape_string($q['opsi_a']) . "', 
                    '" . $conn->real_escape_string($q['opsi_b']) . "', 
                    '" . $conn->real_escape_string($q['opsi_c']) . "', 
                    '" . $conn->real_escape_string($q['opsi_d']) . "', 
                    '" . $conn->real_escape_string($q['opsi_e']) . "', 
                    '" . $conn->real_escape_string($q['jawaban_benar']) . "', 
                    '" . $conn->real_escape_string($q['pembahasan']) . "', 
                    '" . $conn->real_escape_string($q['tips']) . "')";
    if ($conn->query($sql)) {
        $twk_count++;
    } else {
        echo "<p style='color:red'>Error TWK: " . $conn->error . "</p>";
    }
}
echo "<p style='color:green'>TWK: $twk_count soal berhasil di-import</p>";

echo "<h2>Import TIU Questions</h2>";
$tiu_count = 0;
foreach ($tiu_questions as $q) {
    $sql = "INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, tips) 
            VALUES ('" . $q['kategori_id'] . "', 
                    '" . $conn->real_escape_string($q['pertanyaan']) . "', 
                    '" . $conn->real_escape_string($q['opsi_a']) . "', 
                    '" . $conn->real_escape_string($q['opsi_b']) . "', 
                    '" . $conn->real_escape_string($q['opsi_c']) . "', 
                    '" . $conn->real_escape_string($q['opsi_d']) . "', 
                    '" . $conn->real_escape_string($q['opsi_e']) . "', 
                    '" . $conn->real_escape_string($q['jawaban_benar']) . "', 
                    '" . $conn->real_escape_string($q['pembahasan']) . "', 
                    '" . $conn->real_escape_string($q['tips']) . "')";
    if ($conn->query($sql)) {
        $tiu_count++;
    } else {
        echo "<p style='color:red'>Error TIU: " . $conn->error . "</p>";
    }
}
echo "<p style='color:green'>TIU: $tiu_count soal berhasil di-import</p>";

echo "<h2>Import TKP Questions</h2>";
$tkp_count = 0;
foreach ($tkp_questions as $q) {
    $sql = "INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, tips) 
            VALUES ('" . $q['kategori_id'] . "', 
                    '" . $conn->real_escape_string($q['pertanyaan']) . "', 
                    '" . $conn->real_escape_string($q['opsi_a']) . "', 
                    '" . $conn->real_escape_string($q['opsi_b']) . "', 
                    '" . $conn->real_escape_string($q['opsi_c']) . "', 
                    '" . $conn->real_escape_string($q['opsi_d']) . "', 
                    '" . $conn->real_escape_string($q['opsi_e']) . "', 
                    '" . $conn->real_escape_string($q['jawaban_benar']) . "', 
                    '" . $conn->real_escape_string($q['pembahasan']) . "', 
                    '" . $conn->real_escape_string($q['tips']) . "')";
    if ($conn->query($sql)) {
        $tkp_count++;
    } else {
        echo "<p style='color:red'>Error TKP: " . $conn->error . "</p>";
    }
}
echo "<p style='color:green'>TKP: $tkp_count soal berhasil di-import</p>";

$total = $twk_count + $tiu_count + $tkp_count;
echo "<h2 style='color:green'>Total: $total soal berhasil di-import!</h2>";
echo "<p><a href='index.html'>Kembali ke Aplikasi</a></p>";
?>
