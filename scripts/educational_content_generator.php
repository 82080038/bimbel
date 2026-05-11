#!/usr/bin/php
<?php
// Educational Content Generator for Bahan Pelajaran
// Generates comprehensive, detailed, and educational learning materials
// Stores content as files in uploads/bahan_pelajaran

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/analyze_soal_topics.php';

class EducationalContentGenerator {
    public $conn;
    private $topicAnalyzer;
    
    public function __construct() {
        global $conn;
        $this->conn = $conn;
        $this->topicAnalyzer = new SoalTopicAnalyzer($conn);
    }
    
    /**
     * Generate comprehensive educational content based on question topic
     */
    public function generateEducationalContent($soal_id, $kategori, $tingkat, $pertanyaan, $pembahasan, $jawaban_benar) {
        // Extract topic from question using the advanced topic analyzer
        $topic = $this->topicAnalyzer->analyzeTopic($pertanyaan, $kategori, $tingkat);
        
        // Get detailed topic content
        $topicContent = $this->topicAnalyzer->generateTopicContent($topic, $kategori, $tingkat);
        
        // Generate educational content sections
        $content = $this->generateHTMLStructure($topic, $kategori, $tingkat, $pertanyaan, $pembahasan, $jawaban_benar, $soal_id, $topicContent);
        
        return $content;
    }
    
    /**
     * Extract main topic from question
     */
    private function extractTopic($pertanyaan) {
        // Simple topic extraction based on keywords
        $keywords = $this->extractKeywords($pertanyaan);
        
        // Map keywords to topics
        $topic_map = [
            'pancasila' => 'Pancasila',
            'uud' => 'UUD 1945',
            'ham' => 'Hak Asasi Manusia',
            'sejarah' => 'Sejarah Indonesia',
            'negara' => 'Ketatanegaraan',
            'logika' => 'Logika Matematika',
            'deret' => 'Deret Angka',
            'aritmatika' => 'Aritmatika',
            'silogisme' => 'Silogisme',
            'verbal' => 'Tes Verbal',
            'kerja' => 'Etos Kerja',
            'tim' => 'Kerja Tim',
            'pemimpin' => 'Kepemimpinan',
            'disiplin' => 'Kedisiplinan',
            'bendera' => 'Simbol Negara',
            'bahasa' => 'Bahasa Indonesia',
            'kalimat' => 'Tata Bahasa',
            'budaya' => 'Budaya Nasional'
        ];
        
        foreach ($keywords as $keyword) {
            if (isset($topic_map[$keyword])) {
                return $topic_map[$keyword];
            }
        }
        
        return 'Umum';
    }
    
    /**
     * Extract keywords from text
     */
    private function extractKeywords($text) {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s]/', '', $text);
        $words = explode(' ', $text);
        
        $stop_words = ['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 'tersebut', 'sebagai', 'oleh', 'the', 'of', 'and', 'to', 'in'];
        
        $keywords = [];
        foreach ($words as $word) {
            if (strlen($word) > 3 && !in_array($word, $stop_words)) {
                $keywords[] = $word;
            }
        }
        
        return array_unique($keywords);
    }
    
    /**
     * Generate comprehensive HTML structure
     */
    private function generateHTMLStructure($topic, $kategori, $tingkat, $pertanyaan, $pembahasan, $jawaban_benar, $soal_id, $topicContent = null) {
        $html = "<!DOCTYPE html>\n";
        $html .= "<html lang='id'>\n";
        $html .= "<head>\n";
        $html .= "<meta charset='UTF-8'>\n";
        $html .= "<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n";
        $html .= "<title>Materi Pembelajaran: {$topic}</title>\n";
        $html .= "<style>\n";
        $html .= "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }\n";
        $html .= "h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }\n";
        $html .= "h2 { color: #34495e; margin-top: 30px; border-left: 4px solid #3498db; padding-left: 15px; }\n";
        $html .= "h3 { color: #7f8c8d; }\n";
        $html .= ".question-box { background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }\n";
        $html .= ".answer-box { background: #d5f4e6; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #27ae60; }\n";
        $html .= ".explanation-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #ffc107; }\n";
        $html .= ".concept-box { background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 15px 0; }\n";
        $html .= ".strategy-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; }\n";
        $html .= ".similar-box { background: #f1f8ff; padding: 15px; border-radius: 8px; margin: 15px 0; }\n";
        $html .= "ul, ol { margin: 10px 0; padding-left: 25px; }\n";
        $html .= "li { margin: 8px 0; }\n";
        $html .= "strong { color: #2c3e50; }\n";
        $html .= ".badge { display: inline-block; padding: 5px 10px; background: #3498db; color: white; border-radius: 4px; font-size: 0.9em; margin: 5px; }\n";
        $html .= "</style>\n";
        $html .= "</head>\n";
        $html .= "<body>\n";
        
        // Header
        $html .= "<h1>Materi Pembelajaran: {$topic}</h1>\n";
        $html .= "<div class='badges'>\n";
        $html .= "<span class='badge'>Kategori: {$kategori}</span>\n";
        $html .= "<span class='badge'>Tingkat: {$tingkat}</span>\n";
        $html .= "</div>\n";
        $html .= "<hr>\n\n";
        
        // Educational Introduction with Topic Definition
        $html .= "<h2>Pengantar Materi</h2>\n";
        if ($topicContent && !empty($topicContent['definition'])) {
            $html .= "<div class='concept-box'>\n";
            $html .= "<h3>Definisi Topik</h3>\n";
            $html .= "<p>{$topicContent['definition']}</p>\n";
            $html .= "</div>\n\n";
        } else {
            $html .= $this->generateIntroduction($topic, $kategori);
        }
        
        // Question Section
        $html .= "<h2>Soal Latihan</h2>\n";
        $html .= "<div class='question-box'>\n";
        $html .= "<h3>Pertanyaan:</h3>\n";
        $html .= "<p>{$pertanyaan}</p>\n";
        $html .= "</div>\n\n";
        
        // Answer Section
        if (!empty($jawaban_benar)) {
            $html .= "<h2>Jawaban Benar</h2>\n";
            $html .= "<div class='answer-box'>\n";
            $html .= "<p><strong>Jawaban: {$jawaban_benar}</strong></p>\n";
            $html .= "</div>\n\n";
        }
        
        // Detailed Explanation with Topic Content
        $html .= "<h2>Pembahasan Mendalam</h2>\n";
        $html .= "<div class='explanation-box'>\n";
        if ($topicContent && !empty($topicContent['explanation'])) {
            $html .= "<h3>Penjelasan Materi</h3>\n";
            $html .= "<p>{$topicContent['explanation']}</p>\n";
            $html .= "<hr>\n";
        }
        $html .= "<h3>Penjelasan Soal</h3>\n";
        if (!empty($pembahasan)) {
            $html .= "<p>{$pembahasan}</p>\n";
        } else {
            $html .= $this->generateDetailedExplanation($topic, $kategori, $pembahasan);
        }
        $html .= "</div>\n\n";
        
        // Key Concepts with Topic Content
        $html .= "<h2>Konsep Kunci</h2>\n";
        $html .= "<div class='concept-box'>\n";
        if ($topicContent && !empty($topicContent['examples'])) {
            $html .= "<h3>Poin-poin Penting:</h3>\n";
            $html .= "<ul>\n";
            $html .= "<li>{$topicContent['examples']}</li>\n";
            $html .= "</ul>\n";
        }
        $html .= $this->generateKeyConcepts($topic, $kategori);
        $html .= "</div>\n\n";
        
        // Similar Questions
        $similar_questions = $this->findSimilarQuestions($soal_id);
        if (!empty($similar_questions)) {
            $html .= "<h2>Soal-soal Mirip untuk Latihan</h2>\n";
            $html .= "<div class='similar-box'>\n";
            foreach ($similar_questions as $sq) {
                $html .= "<div style='margin: 15px 0; padding: 10px; background: white; border-radius: 5px;'>\n";
                $html .= "<p><strong>Soal #{$sq['id']}</strong>: {$sq['pertanyaan']}</p>\n";
                $html .= "<p>Jawaban: <strong>{$sq['jawaban_benar']}</strong></p>\n";
                $html .= "</div>\n";
            }
            $html .= "</div>\n\n";
        }
        
        // Strategy with Topic Content
        $html .= "<h2>Strategi Menjawab</h2>\n";
        $html .= "<div class='strategy-box'>\n";
        if ($topicContent && !empty($topicContent['strategy'])) {
            $html .= "<p><strong>Strategi Menjawab {$kategori}:</strong></p>\n";
            $html .= "<p>{$topicContent['strategy']}</p>\n";
        } else {
            $html .= $this->generateStrategy($kategori);
        }
        $html .= "</div>\n\n";
        
        // Additional Resources
        $html .= "<h2>Sumber Belajar Tambahan</h2>\n";
        $html .= $this->generateResources($topic, $kategori);
        
        // Footer
        $html .= "<hr>\n";
        $html .= "<p style='text-align: center; color: #7f8c8d; font-size: 0.9em;'>\n";
        $html .= "Materi ini disusun untuk membantu persiapan ujian. Pelajari dengan teliti dan latih soal-soal serupa untuk pemahaman yang lebih baik.\n";
        $html .= "</p>\n";
        
        $html .= "</body>\n";
        $html .= "</html>\n";
        
        return $html;
    }
    
    /**
     * Generate educational introduction
     */
    private function generateIntroduction($topic, $kategori) {
        $intros = [
            'Pancasila' => "<p>Pancasila adalah ideologi dasar negara Indonesia yang menjadi dasar seluruh peraturan perundang-undangan. Memahami Pancasila sangat penting untuk setiap warga negara Indonesia, terutama untuk calon PNS. Materi ini akan membahas nilai-nilai Pancasila dan implementasinya dalam kehidupan berbangsa dan bernegara.</p>",
            'UUD 1945' => "<p>Undang-Undang Dasar 1945 adalah konstitusi tertulis negara Indonesia yang menjadi landasan hukum tertinggi. Memahami UUD 1945 sangat penting untuk memahami sistem ketatanegaraan Indonesia, hak dan kewajiban warga negara, serta prinsip demokrasi Indonesia.</p>",
            'Hak Asasi Manusia' => "<p>Hak Asasi Manusia (HAM) adalah hak yang melekat pada diri manusia sebagai makhluk Tuhan Yang Maha Esa dan merupakan anugerah dari-Nya. Pemahaman tentang HAM sangat penting dalam kehidupan berbangsa dan bernegara, serta dalam pelayanan publik sebagai PNS.</p>",
            'Sejarah Indonesia' => "<p>Sejarah Indonesia memuat perjalanan bangsa Indonesia dari masa pra-kemerdekaan hingga masa kini. Memahami sejarah bangsa penting untuk membentuk nasionalisme, mempelajari perjuangan para pahlawan, dan mengambil pelajaran dari peristiwa masa lalu.</p>",
            'Ketatanegaraan' => "<p>Ketatanegaraan mempelajari tentang negara, sistem pemerintahan, dan konstitusi. Materi ini penting untuk memahami struktur negara Indonesia, sistem pemerintahan, dan peran lembaga-lembaga negara.</p>",
            'Logika Matematika' => "<p>Logika matematika adalah cabang matematika yang mempelajari tentang penalaran dan deduksi. Kemampuan logika sangat penting dalam mengambil keputusan, memecahkan masalah, dan menganalisis situasi secara sistematis.</p>",
            'Deret Angka' => "<p>Deret angka adalah kumpulan bilangan yang mengikuti pola tertentu. Kemampuan mengenali pola deret sangat penting dalam tes intelegensia dan membantu mengembangkan kemampuan analisis dan abstraksi.</p>",
            'Aritmatika' => "<p>Aritmatika adalah cabang matematika yang mempelajari tentang bilangan dan operasi hitung dasar. Kemampuan aritmatika yang baik sangat penting dalam kehidupan sehari-hari dan dalam berbagai tes seleksi.</p>",
            'Silogisme' => "<p>Silogisme adalah metode penalaran deduktif yang menggunakan dua premis untuk menarik kesimpulan. Kemampuan silogisme menguji kemampuan berpikir logis dan analitis dalam mengambil keputusan berdasarkan informasi yang diberikan.</p>",
            'Tes Verbal' => "<p>Tes verbal mengukur kemampuan bahasa dan pemahaman kata. Kemampuan verbal yang baik penting dalam komunikasi, pemahaman instruksi, dan interpretasi informasi tertulis.</p>",
            'Etos Kerja' => "<p>Etos kerja adalah sikap dan nilai yang mendasari perilaku kerja seseorang. Etos kerja yang baik sangat penting untuk mencapai produktivitas tinggi dan kinerja yang baik dalam pekerjaan.</p>",
            'Kerja Tim' => "<p>Kerja tim adalah kemampuan untuk bekerja sama dengan orang lain untuk mencapai tujuan bersama. Kemampuan kerja tim sangat penting dalam lingkungan kerja dan organisasi.</p>",
            'Kepemimpinan' => "<p>Kepemimpinan adalah kemampuan untuk mempengaruhi dan memimpin orang lain. Kemampuan kepemimpinan penting untuk mengelola tim dan mencapai tujuan organisasi.</p>",
            'Kedisiplinan' => "<p>Kedisiplinan adalah kemampuan untuk mengikuti aturan dan prosedur dengan konsisten. Kedisiplinan sangat penting untuk menciptakan lingkungan kerja yang tertib dan produktif.</p>",
            'Simbol Negara' => "<p>Simbol negara Indonesia seperti Bendera Merah Putih, Garuda Pancasila, dan lagu Indonesia Raya adalah lambang kebanggaan dan identitas bangsa. Memahami simbol negara penting untuk memupuk rasa nasionalisme.</p>",
            'Bahasa Indonesia' => "<p>Bahasa Indonesia adalah bahasa persatuan dan bahasa resmi negara. Kemampuan bahasa Indonesia yang baik penting untuk komunikasi efektif dan pemahaman informasi.</p>",
            'Tata Bahasa' => "<p>Tata bahasa adalah aturan yang mengatur penggunaan bahasa secara benar. Memahami tata bahasa penting untuk komunikasi yang jelas dan efektif.</p>",
            'Budaya Nasional' => "<p>Budaya nasional Indonesia adalah kebudayaan yang tumbuh dan berkembang di Indonesia. Memahami budaya nasional penting untuk memupuk rasa cinta tanah air dan persatuan bangsa.</p>",
            'Umum' => "<p>Materi ini dirancang untuk membantu pemahaman konsep yang diujikan. Pelajari dengan teliti dan latih soal-soal serupa untuk pemahaman yang lebih baik.</p>"
        ];
        
        return $intros[$topic] ?? $intros['Umum'];
    }
    
    /**
     * Generate detailed explanation
     */
    private function generateDetailedExplanation($topic, $kategori, $pembahasan) {
        $explanation = "<h3>Penjelasan Soal</h3>\n";
        $explanation .= "<p>{$pembahasan}</p>\n\n";
        
        $explanation .= "<h3>Pembahasan Konseptual</h3>\n";
        $explanation .= "<p>Untuk menjawab soal ini dengan benar, kita perlu memahami konsep dasar dari materi yang diujikan. Berikut adalah penjelasan konseptual yang membantu memahami soal ini secara mendalam:</p>\n";
        
        $explanation .= "<ul>\n";
        $explanation .= "<li><strong>Analisis Pertanyaan:</strong> Bacalah pertanyaan dengan teliti dan identifikasi apa yang sebenarnya ditanyakan. Perhatikan kata-kata kunci yang dapat memberikan petunjuk tentang jawaban yang diminta.</li>\n";
        $explanation .= "<li><strong>Pemahaman Konsep:</strong> Soal ini menguji pemahaman tentang {$topic}. Pastikan Anda memahami definisi, karakteristik, dan implementasi dari konsep ini dalam konteks yang relevan.</li>\n";
        $explanation .= "<li><strong>Penerapan:</strong> Konsep ini memiliki penerapan praktis dalam kehidupan sehari-hari dan dalam konteks profesional. Memahami penerapannya akan membantu menjawab soal dengan lebih tepat.</li>\n";
        $explanation .= "<li><strong>Kesalahan Umum:</strong> Banyak peserta membuat kesalahan dengan tidak membaca pertanyaan secara menyeluruh atau salah mengartikan konteks. Hindari kesalahan ini dengan membaca secara teliti.</li>\n";
        $explanation .= "</ul>\n";
        
        return $explanation;
    }
    
    /**
     * Generate key concepts
     */
    private function generateKeyConcepts($topic, $kategori) {
        $concepts = [
            'Pancasila' => [
                'Sila Pertama: Ketuhanan Yang Maha Esa',
                'Sila Kedua: Kemanusiaan yang Adil dan Beradab',
                'Sila Ketiga: Persatuan Indonesia',
                'Sila Keempat: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan',
                'Sila Kelima: Keadilan Sosial bagi Seluruh Rakyat Indonesia'
            ],
            'UUD 1945' => [
                'Pembukaan UUD 1945',
                'Batang Tubuh UUD 1945',
                'Amandemen UUD 1945',
                'Hak dan Kewajiban Warga Negara',
                'Sistem Pemerintahan Indonesia'
            ],
            'Hak Asasi Manusia' => [
                'Hak untuk Hidup',
                'Hak atas Kebebasan Pribadi',
                'Hak atas Perlindungan',
                'Kewajiban Manusia',
                'UU No. 39 Tahun 1999 tentang HAM'
            ],
            'Sejarah Indonesia' => [
                'Masa Pra-Kemerdekaan',
                'Perjuangan Kemerdekaan',
                'Masa Pasca-Kemerdekaan',
                'Orde Lama',
                'Orde Baru',
                'Reformasi'
            ],
            'Ketatanegaraan' => [
                'Bentuk Negara',
                'Sistem Pemerintahan',
                'Lembaga Negara',
                'Hubungan Pusat-Daerah',
                'Sistem Demokrasi'
            ]
        ];
        
        $html = "<h3>Poin-poin Penting:</h3>\n";
        $html .= "<ul>\n";
        
        if (isset($concepts[$topic])) {
            foreach ($concepts[$topic] as $concept) {
                $html .= "<li><strong>{$concept}</strong> - Konsep ini merupakan bagian penting dari materi {$topic} dan sering muncul dalam ujian.</li>\n";
            }
        } else {
            $html .= "<li><strong>Definisi Konsep:</strong> Pahami definisi dan ciri-ciri konsep yang diujikan.</li>\n";
            $html .= "<li><strong>Karakteristik:</strong> Pelajari karakteristik dan sifat-sifat dari konsep tersebut.</li>\n";
            $html .= "<li><strong>Penerapan:</strong> Pahami bagaimana konsep ini diterapkan dalam praktik.</li>\n";
            $html .= "<li><strong>Contoh:</strong> Pelajari contoh-contoh konkret untuk pemahaman yang lebih baik.</li>\n";
        }
        
        $html .= "</ul>\n";
        return $html;
    }
    
    /**
     * Generate strategy
     */
    private function generateStrategy($kategori) {
        $strategies = [
            'TWK' => "<p><strong>Strategi Menjawab TWK:</strong></p>
<ul>
<li>Baca pertanyaan dengan teliti dan pahami konteks sejarah atau kebangsaan</li>
<li>Ingat fakta-fakta penting sejarah Indonesia</li>
<li>Pahami nilai-nilai Pancasila dan implementasinya</li>
<li>Kuasai UUD 1945 dan amandemennya</li>
<li>Pahami hak dan kewajiban warga negara</li>
<li>Banyak membaca berita dan artikel tentang kebangsaan</li>
</ul>",
            'TIU' => "<p><strong>Strategi Menjawab TIU:</strong></p>
<ul>
<li>Latih kemampuan logika dan penalaran</li>
<li>Pelajari pola-pola deret angka</li>
<li>Kuasai operasi aritmatika dasar</li>
<li>Latih soal silogisme dan analogi</li>
<li>Gunakan eliminasi untuk menyaring jawaban</li>
<li>Latih secara rutin untuk meningkatkan kecepatan</li>
</ul>",
            'TKP' => "<p><strong>Strategi Menjawab TKP:</strong></p>
<ul>
<li>Jawab dengan jujur sesuai kepribadian asli</li>
<li>TKP tidak ada jawaban salah atau benar</li>
<li>Pilih jawaban yang paling menggambarkan karakter Anda</li>
<li>Baca setiap pertanyaan dengan seksama</li>
<li>Jangan terburu-buru dalam menjawab</li>
<li>Pahami bahwa TKP mengukur kecocokan kepribadian</li>
</ul>",
            'TPA' => "<p><strong>Strategi Menjawab TPA:</strong></p>
<ul>
<li>Latih kemampuan verbal, numerik, dan logika</li>
<li>TPA mengukur potensi akademik, bukan pengetahuan yang sudah dipelajari</li>
<li>Latih soal-soal analogi dan sinonim/antonim</li>
<li>Pelajari pola-pola dalam deret dan matematika</li>
<li>Berlatih secara konsisten untuk meningkatkan skor</li>
</ul>"
        ];
        
        return $strategies[$kategori] ?? $strategies['TIU'];
    }
    
    /**
     * Generate resources
     */
    private function generateResources($topic, $kategori) {
        return "<div class='concept-box'>
<h3>Sumber Belajar:</h3>
<ul>
<li>Buku-buku resmi tentang materi {$kategori}</li>
<li>Website resmi pemerintah terkait materi</li>
<li>Jurnal dan artikel akademik</li>
<li>Video pembelajaran online</li>
<li>Diskusi dengan teman atau mentor</li>
<li>Latihan soal-soal serupa secara rutin</li>
</ul>
</div>";
    }
    
    /**
     * Find similar questions
     */
    private function findSimilarQuestions($soal_id) {
        $sql = "SELECT id, pertanyaan, jawaban_benar FROM soal 
                WHERE id != $soal_id 
                ORDER BY RAND() 
                LIMIT 3";
        $result = $this->conn->query($sql);
        
        $similar = [];
        while ($row = $result->fetch_assoc()) {
            $similar[] = [
                'id' => $row['id'],
                'pertanyaan' => substr($row['pertanyaan'], 0, 150) . '...',
                'jawaban_benar' => $row['jawaban_benar']
            ];
        }
        
        return $similar;
    }
    
    /**
     * Save content as file
     */
    public function saveContentAsFile($soal_id, $content) {
        $file_name = "materi_{$soal_id}_" . time() . '.html';
        $file_path = __DIR__ . '/../uploads/bahan_pelajaran/text/' . $file_name;
        
        // Create directory if not exists
        $dir = dirname($file_path);
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        
        // Save content
        file_put_contents($file_path, $content);
        
        return 'uploads/bahan_pelajaran/text/' . $file_name;
    }
    
    /**
     * Update database with file path
     */
    public function updateDatabaseFilePath($soal_id, $file_path, $judul) {
        $file_path_escaped = $this->conn->real_escape_string($file_path);
        $judul_escaped = $this->conn->real_escape_string($judul);
        
        $sql = "INSERT INTO bahan_pelajaran (soal_id, judul, konten, tipe, file_path, urutan)
                VALUES ($soal_id, '$judul_escaped', '', 'teks', '$file_path_escaped', 0)";
        
        return $this->conn->query($sql);
    }
}

// CLI Interface
if (php_sapi_name() === 'cli') {
    $generator = new EducationalContentGenerator();
    
    $options = getopt('', ['action:', 'soal_id:', 'limit:']);
    $action = $options['action'] ?? 'generate';
    $soal_id = intval($options['soal_id'] ?? 0);
    $limit = intval($options['limit'] ?? 10);
    
    echo "=== Educational Content Generator ===\n";
    echo "Action: $action\n";
    echo "Soal ID: $soal_id\n";
    echo "Limit: $limit\n\n";
    
    switch ($action) {
        case 'generate':
            if ($soal_id > 0) {
                // Generate for specific soal
                $sql = "SELECT s.*, k.nama_kategori FROM soal s 
                        LEFT JOIN kategori_soal k ON s.kategori_id = k.id 
                        WHERE s.id = $soal_id";
                $result = $generator->conn->query($sql);
                $soal = $result->fetch_assoc();
                
                if ($soal) {
                    $content = $generator->generateEducationalContent(
                        $soal['id'],
                        $soal['nama_kategori'],
                        $soal['tingkat'],
                        $soal['pertanyaan'],
                        $soal['pembahasan'],
                        $soal['jawaban_benar']
                    );
                    
                    $file_path = $generator->saveContentAsFile($soal_id, $content);
                    $judul = "Materi Pembelajaran: {$soal['nama_kategori']} - Soal #{$soal_id}";
                    
                    $generator->updateDatabaseFilePath($soal_id, $file_path, $judul);
                    
                    echo "Generated educational content for soal #$soal_id\n";
                    echo "Saved to: $file_path\n";
                    echo "Database updated\n";
                } else {
                    echo "Soal not found\n";
                }
            } else {
                // Generate batch
                $sql = "SELECT s.*, k.nama_kategori FROM soal s 
                        LEFT JOIN kategori_soal k ON s.kategori_id = k.id 
                        ORDER BY RAND() 
                        LIMIT $limit";
                $result = $generator->conn->query($sql);
                
                $generated = 0;
                while ($row = $result->fetch_assoc()) {
                    $content = $generator->generateEducationalContent(
                        $row['id'],
                        $row['nama_kategori'],
                        $row['tingkat'],
                        $row['pertanyaan'],
                        $row['pembahasan'],
                        $row['jawaban_benar']
                    );
                    
                    $file_path = $generator->saveContentAsFile($row['id'], $content);
                    $judul = "Materi Pembelajaran: {$row['nama_kategori']} - Soal #{$row['id']}";
                    
                    $generator->updateDatabaseFilePath($row['id'], $file_path, $judul);
                    
                    $generated++;
                    echo "Generated educational content for soal #{$row['id']}\n";
                }
                
                echo "\n=== Summary ===\n";
                echo "Generated: $generated educational content files\n";
            }
            break;
            
        default:
            echo "Available actions: generate\n";
            break;
    }
}
?>
