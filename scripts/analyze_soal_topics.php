<?php
/**
 * Analyze Soal Topics
 * 
 * This script analyzes all soal to determine actual topics and concepts being tested.
 * It creates a topic classification system based on question content analysis.
 */

require_once __DIR__ . '/../config.php';

class SoalTopicAnalyzer {
    private $conn;
    private $topics = [];
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    /**
     * Analyze question content to determine topic
     */
    public function analyzeTopic($pertanyaan, $kategori, $tingkat) {
        $pertanyaan_lower = strtolower($pertanyaan);
        
        // TWK Topics (Tes Wawasan Kebangsaan)
        if ($kategori == 'TWK') {
            return $this->analyzeTWKTopic($pertanyaan_lower);
        }
        
        // TIU Topics (Tes Inteligensia Umum)
        if ($kategori == 'TIU') {
            return $this->analyzeTIUTopic($pertanyaan_lower);
        }
        
        // TKP Topics (Tes Karakteristik Pribadi)
        if ($kategori == 'TKP') {
            return $this->analyzeTKPTopic($pertanyaan_lower);
        }
        
        // TPA Topics (Tes Potensi Akademik)
        if ($kategori == 'TPA') {
            return $this->analyzeTPATopic($pertanyaan_lower);
        }
        
        return 'Umum';
    }
    
    /**
     * Analyze TWK (Tes Wawasan Kebangsaan) topics
     */
    private function analyzeTWKTopic($pertanyaan) {
        // Pancasila
        if (strpos($pertanyaan, 'pancasila') !== false) {
            if (strpos($pertanyaan, 'sila') !== false) {
                return 'Pancasila - Sila-sila Pancasila';
            }
            if (strpos($pertanyaan, 'ideologi') !== false) {
                return 'Pancasila sebagai Ideologi Negara';
            }
            if (strpos($pertanyaan, 'dasar negara') !== false) {
                return 'Pancasila sebagai Dasar Negara';
            }
            return 'Pancasila';
        }
        
        // UUD 1945
        if (strpos($pertanyaan, 'uud') !== false || strpos($pertanyaan, '1945') !== false) {
            if (strpos($pertanyaan, 'amandemen') !== false) {
                return 'UUD 1945 dan Amandemen';
            }
            return 'UUD 1945';
        }
        
        // NKRI & Wawasan Nusantara
        if (strpos($pertanyaan, 'nkri') !== false || strpos($pertanyaan, 'nusantara') !== false) {
            return 'Wawasan Nusantara dan NKRI';
        }
        
        // Sejarah Indonesia
        if (strpos($pertanyaan, 'sejarah') !== false || 
            strpos($pertanyaan, 'kemerdekaan') !== false ||
            strpos($pertanyaan, 'penjajahan') !== false ||
            strpos($pertanyaan, 'perjuangan') !== false) {
            if (strpos($pertanyaan, 'proklamasi') !== false) {
                return 'Sejarah Indonesia - Proklamasi Kemerdekaan';
            }
            if (strpos($pertanyaan, 'organisasi') !== false) {
                return 'Sejarah Indonesia - Organisasi Pergerakan Nasional';
            }
            if (strpos($pertanyaan, 'pahlawan') !== false) {
                return 'Sejarah Indonesia - Pahlawan Nasional';
            }
            return 'Sejarah Indonesia';
        }
        
        // Bhinneka Tunggal Ika
        if (strpos($pertanyaan, 'bhinneka') !== false || strpos($pertanyaan, 'persatuan') !== false) {
            return 'Bhinneka Tunggal Ika dan Persatuan Nasional';
        }
        
        // Bela Negara
        if (strpos($pertanyaan, 'bela negara') !== false || strpos($pertanyaan, 'pertahanan') !== false) {
            return 'Bela Negara';
        }
        
        // Politik & Pemerintahan
        if (strpos($pertanyaan, 'pemerintah') !== false || 
            strpos($pertanyaan, 'politik') !== false ||
            strpos($pertanyaan, 'demokrasi') !== false) {
            return 'Sistem Politik dan Pemerintahan Indonesia';
        }
        
        // Geografi Indonesia
        if (strpos($pertanyaan, 'pulau') !== false || 
            strpos($pertanyaan, 'laut') !== false ||
            strpos($pertanyaan, 'wilayah') !== false) {
            return 'Geografi Indonesia';
        }
        
        // Sosial & Budaya
        if (strpos($pertanyaan, 'budaya') !== false || 
            strpos($pertanyaan, 'sosial') !== false) {
            return 'Sosial dan Budaya Indonesia';
        }
        
        // HAM
        if (strpos($pertanyaan, 'ham') !== false || strpos($pertanyaan, 'hak asasi') !== false) {
            return 'Hak Asasi Manusia';
        }
        
        return 'Wawasan Kebangsaan';
    }
    
    /**
     * Analyze TIU (Tes Inteligensia Umum) topics
     */
    private function analyzeTIUTopic($pertanyaan) {
        // Analogy (Analogi)
        if (strpos($pertanyaan, ':') !== false && strpos($pertanyaan, '=') !== false) {
            if (preg_match('/\w+\s*:\s*\w+\s*=\s*\w+\s*:\s*\.\.\./', $pertanyaan)) {
                return 'Analogi Verbal';
            }
            return 'Analogi';
        }
        
        // Number Series (Deret Angka)
        if (preg_match('/\d+,\s*\d+,\s*\d+/', $pertanyaan)) {
            return 'Deret Angka';
        }
        
        // Syllogism (Silogisme)
        if (strpos($pertanyaan, 'semua') !== false && strpos($pertanyaan, 'beberapa') !== false) {
            if (strpos($pertanyaan, 'kesimpulan') !== false) {
                return 'Silogisme dan Penarikan Kesimpulan';
            }
            return 'Logika Silogisme';
        }
        
        // Verbal Reasoning (Penalaran Verbal)
        if (strpos($pertanyaan, 'premis') !== false || 
            strpos($pertanyaan, 'kesimpulan') !== false ||
            strpos($pertanyaan, 'pernyataan') !== false) {
            return 'Penalaran Verbal';
        }
        
        // Word Relationship (Hubungan Kata)
        if (strpos($pertanyaan, 'hubungan') !== false) {
            return 'Hubungan Kata';
        }
        
        // Arithmetic
        if (preg_match('/\d+/', $pertanyaan) && strpos($pertanyaan, 'hitung') !== false) {
            return 'Aritmatika Dasar';
        }
        
        // Logic
        if (strpos($pertanyaan, 'logika') !== false) {
            return 'Logika Matematika';
        }
        
        return 'Inteligensia Umum';
    }
    
    /**
     * Analyze TKP (Tes Karakteristik Pribadi) topics
     */
    private function analyzeTKPTopic($pertanyaan) {
        // Work Ethics
        if (strpos($pertanyaan, 'kerja') !== false || strpos($pertanyaan, 'tugas') !== false) {
            if (strpos($pertanyaan, 'rekan') !== false) {
                return 'Etika Kerja - Hubungan dengan Rekan Kerja';
            }
            if (strpos($pertanyaan, 'atasan') !== false) {
                return 'Etika Kerja - Hubungan dengan Atasan';
            }
            if (strpos($pertanyaan, 'kesalahan') !== false) {
                return 'Etika Kerja - Menangani Kesalahan';
            }
            return 'Etika Kerja';
        }
        
        // Leadership
        if (strpos($pertanyaan, 'pemimpin') !== false || strpos($pertanyaan, 'kepemimpinan') !== false) {
            return 'Kepemimpinan';
        }
        
        // Teamwork
        if (strpos($pertanyaan, 'tim') !== false || strpos($pertanyaan, 'kerja sama') !== false) {
            return 'Kerja Sama Tim';
        }
        
        // Integrity
        if (strpos($pertanyaan, 'jujur') !== false || strpos($pertanyaan, 'integritas') !== false) {
            return 'Integritas dan Kejujuran';
        }
        
        // Responsibility
        if (strpos($pertanyaan, 'tanggung jawab') !== false) {
            return 'Tanggung Jawab';
        }
        
        // Problem Solving
        if (strpos($pertanyaan, 'masalah') !== false || strpos($pertanyaan, 'solusi') !== false) {
            return 'Pemecahan Masalah';
        }
        
        // Emergency
        if (strpos($pertanyaan, 'darurat') !== false || strpos($pertanyaan, 'emergency') !== false) {
            return 'Penanganan Situasi Darurat';
        }
        
        // Attitude
        if (strpos($pertanyaan, 'sikap') !== false) {
            return 'Sikap dan Perilaku';
        }
        
        return 'Karakteristik Pribadi';
    }
    
    /**
     * Analyze TPA (Tes Potensi Akademik) topics
     */
    private function analyzeTPATopic($pertanyaan) {
        // Synonyms (Sinonim)
        if (strpos($pertanyaan, 'sinonim') !== false) {
            return 'Sinonim Kata';
        }
        
        // Antonyms (Antonim)
        if (strpos($pertanyaan, 'antonim') !== false) {
            return 'Antonim Kata';
        }
        
        // Vocabulary
        if (strpos($pertanyaan, 'kata') !== false) {
            return 'Kosakata';
        }
        
        // Reading Comprehension
        if (strpos($pertanyaan, 'bacaan') !== false || strpos($pertanyaan, 'paragraf') !== false) {
            return 'Pemahaman Bacaan';
        }
        
        return 'Potensi Akademik';
    }
    
    /**
     * Generate detailed educational content based on topic
     */
    public function generateTopicContent($topic, $kategori, $tingkat) {
        $content = $this->getTopicDefinition($topic, $kategori);
        $explanation = $this->getTopicExplanation($topic, $kategori);
        $examples = $this->getTopicExamples($topic, $kategori);
        $strategy = $this->getTopicStrategy($topic, $kategori);
        
        return [
            'topic' => $topic,
            'definition' => $content,
            'explanation' => $explanation,
            'examples' => $examples,
            'strategy' => $strategy
        ];
    }
    
    /**
     * Get topic definition
     */
    private function getTopicDefinition($topic, $kategori) {
        $definitions = [
            // TWK
            'Pancasila' => 'Pancasila adalah ideologi dasar negara Indonesia yang terdiri dari lima sila: Ketuhanan Yang Maha Esa, Kemanusiaan yang Adil dan Beradab, Persatuan Indonesia, Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan, dan Keadilan Sosial bagi Seluruh Rakyat Indonesia.',
            'Pancasila - Sila-sila Pancasila' => 'Sila-sila Pancasila adalah lima prinsip dasar yang menjadi fondasi negara Indonesia. Setiap sila memiliki makna mendalam dan saling terkait satu sama lain.',
            'Pancasila sebagai Ideologi Negara' => 'Pancasila sebagai ideologi terbuka berfungsi sebagai pedoman hidup, pedoman berbangsa dan bernegara, serta pedoman pembangunan nasional. Ideologi ini bersifat terbuka karena dapat disesuaikan dengan perkembangan zaman tanpa menghilangkan nilai-nilai dasarnya.',
            'Pancasila sebagai Dasar Negara' => 'Pancasila sebagai dasar negara berfungsi sebagai sumber dari segala sumber hukum, landasan moral dan etik, serta pedoman dalam penyelenggaraan negara.',
            'UUD 1945' => 'Undang-Undang Dasar 1945 adalah konstitusi tertinggi negara Indonesia yang menjadi landasan hukum dan pemerintahan. UUD 1945 memuat ketentuan mengenai hak dan kewajiban warga negara, lembaga-lembaga negara, serta hubungan antara negara dan warganya.',
            'UUD 1945 dan Amandemen' => 'UUD 1945 telah mengalami empat kali amandemen yang dilakukan pada periode 1999-2002. Amandemen ini bertujuan untuk memperbaiki kelemahan-kelemahan UUD 1945 asli dan menyesuaikannya dengan tuntutan reformasi.',
            'Wawasan Nusantara dan NKRI' => 'Wawasan Nusantara adalah cara pandang dan sikap bangsa Indonesia mengenai diri dan lingkungannya berdasarkan konsep kebinekaan dan kesatuan wilayah. NKRI (Negara Kesatuan Republik Indonesia) adalah bentuk negara Indonesia yang bersifat kesatuan dengan wilayah yang utuh.',
            'Sejarah Indonesia' => 'Sejarah Indonesia mencakup perjalanan bangsa Indonesia dari masa pra-kolonial, masa penjajahan, perjuangan kemerdekaan, hingga masa kemerdekaan. Memahami sejarah penting untuk membangun jati diri dan nasionalisme.',
            'Sejarah Indonesia - Proklamasi Kemerdekaan' => 'Proklamasi Kemerdekaan Indonesia dibacakan oleh Ir. Soekarno pada tanggal 17 Agustus 1945 di Jakarta. Proklamasi ini menandai berakhirnya penjajahan Jepang dan dimulainya era kemerdekaan Indonesia.',
            'Sejarah Indonesia - Organisasi Pergerakan Nasional' => 'Organisasi pergerakan nasional seperti Budi Utomo, Sarekat Islam, dan Indische Party berperan penting dalam membangun kesadaran nasional dan perjuangan kemerdekaan Indonesia.',
            'Sejarah Indonesia - Pahlawan Nasional' => 'Pahlawan nasional adalah tokoh-tokoh yang berjasa dalam perjuangan kemerdekaan Indonesia. Mereka diberi gelar pahlawan sebagai bentuk penghargaan negara atas pengorbanan mereka.',
            'Bhinneka Tunggal Ika dan Persatuan Nasional' => 'Bhinneka Tunggal Ika adalah semboyan negara Indonesia yang berarti "Berbeda-beda tetapi tetap satu juga". Semboyan ini menegaskan pentingnya persatuan di tengah keberagaman bangsa Indonesia.',
            'Bela Negara' => 'Bela negara adalah sikap dan tindakan warga negara yang diwujudkan dalam kesetiaan, cinta, dan kebanggaan terhadap negara, serta kesediaan untuk berkorban demi bangsa dan negara.',
            'Sistem Politik dan Pemerintahan Indonesia' => 'Sistem politik Indonesia berdasarkan demokrasi Pancasila dengan sistem presidensial. Pemerintahan Indonesia terdiri dari lembaga eksekutif (presiden), legislatif (DPR, DPD, MPR), dan yudikatif (Mahkamah Agung).',
            'Geografi Indonesia' => 'Geografi Indonesia mencakup posisi strategis Indonesia di garis khatulistiwa, keberagaman bentuk wilayah (pulau, daratan, laut), serta sumber daya alam yang melimpah.',
            'Sosial dan Budaya Indonesia' => 'Indonesia memiliki keberagaman sosial dan budaya yang mencakup berbagai suku bangsa, bahasa, adat istiadat, dan tradisi. Keberagaman ini adalah kekayaan bangsa yang harus dijaga dan dilestarikan.',
            'Hak Asasi Manusia' => 'Hak Asasi Manusia (HAM) adalah hak-hak dasar yang melekat pada diri manusia sejak lahir dan bersifat kodrati. Di Indonesia, HAM dijamin oleh UUD 1945 dan UU No. 39 Tahun 1999 tentang HAM.',
            
            // TIU
            'Analogi Verbal' => 'Analogi verbal adalah kemampuan untuk menemukan hubungan antara dua kata atau konsep dan menerapkan hubungan yang sama pada pasangan kata lain.',
            'Analogi' => 'Analogi adalah kemampuan untuk menemukan pola hubungan antara dua hal dan menerapkannya pada hal lain.',
            'Deret Angka' => 'Deret angka adalah rangkaian bilangan yang mengikuti pola tertentu. Untuk menyelesaikan deret angka, perlu mengidentifikasi pola penambahan, pengurangan, perkalian, pembagian, atau kombinasi operasi matematika.',
            'Silogisme dan Penarikan Kesimpulan' => 'Silogisme adalah bentuk penalaran deduktif yang terdiri dari premis-premis dan kesimpulan. Penarikan kesimpulan yang valid harus mengikuti aturan logika yang benar dari premis-premis yang diberikan.',
            'Logika Silogisme' => 'Logika silogisme adalah kemampuan untuk menarik kesimpulan dari dua atau lebih premis yang diberikan. Kesimpulan harus logis dan mengikuti aturan penalaran yang valid.',
            'Penalaran Verbal' => 'Penalaran verbal adalah kemampuan untuk memahami informasi verbal, menganalisis hubungan antar pernyataan, dan menarik kesimpulan yang logis.',
            'Hubungan Kata' => 'Hubungan kata adalah kemampuan untuk memahami keterkaitan makna antar kata, seperti sinonim, antonim, bagian-keseluruhan, sebab-akibat, dan lain-lain.',
            'Aritmatika Dasar' => 'Aritmatika dasar mencakup operasi matematika fundamental seperti penambahan, pengurangan, perkalian, dan pembagian, serta penerapannya dalam pemecahan masalah.',
            'Logika Matematika' => 'Logika matematika adalah kemampuan untuk berpikir secara sistematis dan logis dalam menyelesaikan masalah matematika.',
            'Inteligensia Umum' => 'Inteligensia umum mencakup berbagai kemampuan kognitif seperti penalaran, pemecahan masalah, pemahaman konsep, dan kemampuan beradaptasi.',
            
            // TKP
            'Etika Kerja' => 'Etika kerja adalah seperangkat nilai dan prinsip moral yang menuntun perilaku dalam lingkungan kerja profesional.',
            'Etika Kerja - Hubungan dengan Rekan Kerja' => 'Hubungan dengan rekan kerja yang baik meliputi sikap saling menghormati, kerja sama yang baik, komunikasi yang efektif, dan tidak melakukan perbuatan yang merugikan rekan kerja.',
            'Etika Kerja - Hubungan dengan Atasan' => 'Hubungan dengan atasan yang baik meliputi sikap hormat, patuh pada instruksi yang sah, melaporkan hasil kerja dengan jujur, dan bersikap profesional.',
            'Etika Kerja - Menangani Kesalahan' => 'Menangani kesalahan dengan baik meliputi mengakui kesalahan, meminta maaf, memperbaiki kesalahan, dan mengambil pelajaran dari kesalahan tersebut.',
            'Kepemimpinan' => 'Kepemimpinan adalah kemampuan untuk mempengaruhi, memotivasi, dan mengarahkan orang lain untuk mencapai tujuan bersama.',
            'Kerja Sama Tim' => 'Kerja sama tim adalah kemampuan untuk bekerja bersama dengan orang lain secara efektif untuk mencapai tujuan bersama.',
            'Integritas dan Kejujuran' => 'Integritas adalah kesesuaian antara kata dan perbuatan, antara nilai yang dianut dengan perilaku yang ditampilkan. Kejujuran adalah sikap untuk selalu berkata benar dan tidak menyembunyikan fakta.',
            'Tanggung Jawab' => 'Tanggung jawab adalah kesediaan untuk menerima akibat dari tindakan dan keputusan yang diambil, serta kewajiban untuk melaksanakan tugas dengan sebaik-baiknya.',
            'Pemecahan Masalah' => 'Pemecahan masalah adalah kemampuan untuk mengidentifikasi masalah, menganalisis penyebab, mencari solusi, dan menerapkan solusi tersebut.',
            'Penanganan Situasi Darurat' => 'Penanganan situasi darurat adalah kemampuan untuk bertindak cepat dan tepat dalam situasi yang membutuhkan respons segera untuk mencegah kerugian yang lebih besar.',
            'Sikap dan Perilaku' => 'Sikap dan perilaku yang baik mencakup kejujuran, tanggung jawab, kerja sama, disiplin, dan menghormati orang lain.',
            'Karakteristik Pribadi' => 'Karakteristik pribadi adalah sifat-sifat yang melekat pada diri seseorang yang mempengaruhi cara berpikir, bersikap, dan bertindak.',
            
            // TPA
            'Sinonim Kata' => 'Sinonim adalah kata yang memiliki makna yang sama atau mirip dengan kata lain. Memahami sinonim penting untuk memperkaya kosakata dan kemampuan berbahasa.',
            'Antonim Kata' => 'Antonim adalah kata yang memiliki makna yang berlawanan dengan kata lain. Memahami antonim membantu dalam memahami konsep kebalikan dan kontras.',
            'Kosakata' => 'Kosakata adalah kumpulan kata yang dimiliki seseorang. Memiliki kosakata yang luas penting untuk kemampuan berbahasa dan pemahaman bacaan.',
            'Pemahaman Bacaan' => 'Pemahaman bacaan adalah kemampuan untuk memahami, menganalisis, dan menafsirkan informasi dari teks tertulis.',
            'Potensi Akademik' => 'Potensi akademik adalah kemampuan seseorang dalam bidang akademik yang meliputi kemampuan verbal, numerik, dan logis.',
            
            // Default
            'Umum' => 'Materi umum yang mencakup berbagai konsep dasar yang perlu dipahami untuk menjawab soal-soal ujian.',
            'Wawasan Kebangsaan' => 'Wawasan kebangsaan adalah pemahaman tentang sejarah, budaya, politik, dan nilai-nilai kebangsaan Indonesia.',
        ];
        
        return $definitions[$topic] ?? 'Materi pembelajaran untuk membantu pemahaman konsep yang diujikan.';
    }
    
    /**
     * Get topic explanation
     */
    private function getTopicExplanation($topic, $kategori) {
        return $this->getTopicDefinition($topic, $kategori);
    }
    
    /**
     * Get topic examples
     */
    private function getTopicExamples($topic, $kategori) {
        return 'Contoh-contoh soal serupa akan membantu pemahaman yang lebih baik tentang materi ini.';
    }
    
    /**
     * Get topic strategy
     */
    private function getTopicStrategy($topic, $kategori) {
        $strategies = [
            'TWK' => 'Strategi menjawab TWK: Pelajari sejarah Indonesia, pahami nilai-nilai Pancasila, baca UUD 1945, dan ikuti perkembangan politik nasional.',
            'TIU' => 'Strategi menjawab TIU: Latih logika matematika, pelajari pola deret angka, kuasai analogi verbal, dan latih penarikan kesimpulan logis.',
            'TKP' => 'Strategi menjawab TKP: Pilih jawaban yang mencerminkan sikap positif, profesional, dan bertanggung jawab. Hindari jawaban yang menunjukkan sikap negatif atau egois.',
            'TPA' => 'Strategi menjawab TPA: Perbanyak kosakata, pelajari sinonim dan antonim, latih pemahaman bacaan, dan kuasai tata bahasa Indonesia.',
        ];
        
        return $strategies[$kategori] ?? 'Latih secara rutin untuk meningkatkan pemahaman dan kecepatan menjawab.';
    }
    
    /**
     * Analyze all soal and generate topic mapping
     */
    public function analyzeAllSoal() {
        $sql = "SELECT s.id, s.pertanyaan, k.nama_kategori, s.tingkat 
                FROM soal s 
                JOIN kategori_soal k ON s.kategori_id = k.id";
        $result = $this->conn->query($sql);
        
        $topic_mapping = [];
        $topic_counts = [];
        
        while ($row = $result->fetch_assoc()) {
            $topic = $this->analyzeTopic($row['pertanyaan'], $row['nama_kategori'], $row['tingkat']);
            
            $topic_mapping[$row['id']] = [
                'topic' => $topic,
                'kategori' => $row['nama_kategori'],
                'tingkat' => $row['tingkat']
            ];
            
            if (!isset($topic_counts[$topic])) {
                $topic_counts[$topic] = 0;
            }
            $topic_counts[$topic]++;
        }
        
        return [
            'mapping' => $topic_mapping,
            'counts' => $topic_counts
        ];
    }
}

// CLI Interface
if (php_sapi_name() === 'cli') {
    $analyzer = new SoalTopicAnalyzer($conn);
    
    echo "=== Analisis Topik Soal ===\n\n";
    
    // Analyze all soal
    echo "Menganalisis semua soal...\n";
    $result = $analyzer->analyzeAllSoal();
    
    echo "\n=== Hasil Analisis Topik ===\n";
    echo "Total soal: " . count($result['mapping']) . "\n";
    echo "Total topik unik: " . count($result['counts']) . "\n\n";
    
    echo "=== Distribusi Topik ===\n";
    arsort($result['counts']);
    foreach ($result['counts'] as $topic => $count) {
        echo "$topic: $count soal\n";
    }
    
    // Save topic mapping to file
    $output_file = __DIR__ . '/../data/soal_topic_mapping.json';
    $output_dir = dirname($output_file);
    if (!file_exists($output_dir)) {
        mkdir($output_dir, 0777, true);
    }
    
    file_put_contents($output_file, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "\nTopic mapping saved to: $output_file\n";
    
    // Test with a sample question
    echo "\n=== Contoh Analisis ===\n";
    $sample_sql = "SELECT s.id, s.pertanyaan, k.nama_kategori, s.tingkat 
                   FROM soal s 
                   JOIN kategori_soal k ON s.kategori_id = k.id 
                   LIMIT 5";
    $sample_result = $conn->query($sample_sql);
    
    while ($row = $sample_result->fetch_assoc()) {
        $topic = $analyzer->analyzeTopic($row['pertanyaan'], $row['nama_kategori'], $row['tingkat']);
        echo "Soal #{$row['id']}: $topic\n";
        echo "Kategori: {$row['nama_kategori']}\n";
        echo "Pertanyaan: " . substr($row['pertanyaan'], 0, 100) . "...\n\n";
    }
}
?>
