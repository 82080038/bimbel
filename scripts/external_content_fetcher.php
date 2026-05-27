#!/usr/bin/php
<?php
// External Content Fetcher for Bahan Pelajaran
// This script fetches detailed content from external sources (Wikipedia, educational sites, etc.)
// Note: This requires API keys or web scraping setup

require_once __DIR__ . '/../config.php';

class ExternalContentFetcher {
    private $conn;
    
    public function __construct() {
        global $conn;
        $this->conn = $conn;
    }
    
    /**
     * Fetch content from Wikipedia API
     * Requires no API key, limited to Wikipedia content
     */
    public function fetchWikipediaContent($keyword, $lang = 'id') {
        $url = "https://{$lang}.wikipedia.org/api/rest_v1/page/summary/" . urlencode($keyword);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        curl_close($ch);
        
        if ($response) {
            $data = json_decode($response, true);
            if (isset($data['extract'])) {
                return [
                    'source' => 'wikipedia',
                    'title' => $data['title'] ?? $keyword,
                    'content' => $data['extract'] ?? '',
                    'url' => $data['content_urls']['desktop']['page'] ?? ''
                ];
            }
        }
        
        return null;
    }
    
    /**
     * Fetch content using generic web scraping
     * Note: This is a basic implementation and may need adjustment based on target sites
     */
    public function fetchGenericContent($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; UjianSekolahKedinasan/1.0)');
        $response = curl_exec($ch);
        curl_close($ch);
        
        if ($response) {
            // Extract main content (basic implementation)
            // This would need to be customized based on target site structure
            $content = strip_tags($response);
            $content = preg_replace('/\s+/', ' ', $content);
            $content = trim($content);
            
            return [
                'source' => 'web_scrape',
                'content' => substr($content, 0, 5000), // Limit to 5000 chars
                'url' => $url
            ];
        }
        
        return null;
    }
    
    /**
     * Generate enhanced content for a question using external sources
     */
    public function generateEnhancedContent($soal_id, $keywords) {
        $enhanced_content = [];
        
        // Try to fetch content from Wikipedia for each keyword
        foreach (array_slice($keywords, 0, 3) as $keyword) {
            $wiki_content = $this->fetchWikipediaContent($keyword);
            if ($wiki_content) {
                $enhanced_content[] = [
                    'keyword' => $keyword,
                    'source' => 'wikipedia',
                    'title' => $wiki_content['title'],
                    'content' => $wiki_content['content'],
                    'url' => $wiki_content['url']
                ];
            }
        }
        
        return $enhanced_content;
    }
    
    /**
     * Save external content as file
     */
    public function saveExternalContent($soal_id, $content, $type = 'text') {
        $file_name = "external_{$soal_id}_" . time() . '.txt';
        $file_path = __DIR__ . '/../uploads/bahan_pelajaran/text/' . $file_name;
        
        // Create directory if not exists
        $dir = dirname($file_path);
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        
        // Save content
        $content_text = is_array($content) ? json_encode($content, JSON_PRETTY_PRINT) : $content;
        file_put_contents($file_path, $content_text);
        
        return 'uploads/bahan_pelajaran/text/' . $file_name;
    }
}

// CLI Interface
if (php_sapi_name() === 'cli') {
    $fetcher = new ExternalContentFetcher();
    
    $options = getopt('', ['action:', 'soal_id:', 'keyword:']);
    $action = $options['action'] ?? 'fetch';
    $soal_id = intval($options['soal_id'] ?? 0);
    $keyword = $options['keyword'] ?? '';
    
    echo "=== External Content Fetcher ===\n";
    echo "Action: $action\n";
    echo "Soal ID: $soal_id\n";
    echo "Keyword: $keyword\n\n";
    
    switch ($action) {
        case 'fetch_wiki':
            if (empty($keyword)) {
                echo "Error: keyword is required\n";
                exit(1);
            }
            $content = $fetcher->fetchWikipediaContent($keyword);
            if ($content) {
                echo "Wikipedia Content:\n";
                echo "Title: {$content['title']}\n";
                echo "Content: " . substr($content['content'], 0, 500) . "...\n";
                echo "URL: {$content['url']}\n";
            } else {
                echo "Failed to fetch content\n";
            }
            break;
            
        case 'fetch_soal':
            if ($soal_id === 0) {
                echo "Error: soal_id is required\n";
                exit(1);
            }
            
            // Get soal keywords
            $sql = "SELECT pertanyaan FROM soal WHERE id = $soal_id";
            $result = $fetcher->conn->query($sql);
            $soal = $result->fetch_assoc();
            
            if ($soal) {
                $keywords = extractKeywords($soal['pertanyaan']);
                $enhanced = $fetcher->generateEnhancedContent($soal_id, $keywords);
                
                echo "Enhanced Content for Soal #$soal_id:\n";
                foreach ($enhanced as $item) {
                    echo "Keyword: {$item['keyword']}\n";
                    echo "Source: {$item['source']}\n";
                    echo "Title: {$item['title']}\n";
                    echo "Content: " . substr($item['content'], 0, 200) . "...\n";
                    echo "URL: {$item['url']}\n\n";
                }
                
                // Save to file
                $file_path = $fetcher->saveExternalContent($soal_id, $enhanced);
                echo "Saved to: $file_path\n";
            } else {
                echo "Soal not found\n";
            }
            break;
            
        default:
            echo "Available actions: fetch_wiki, fetch_soal\n";
            break;
    }
}

function extractKeywords($text) {
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s]/', '', $text);
    $words = explode(' ', $text);
    
    $stop_words = ['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 'tersebut', 'sebagai', 'oleh'];
    
    $keywords = [];
    foreach ($words as $word) {
        if (strlen($word) > 3 && !in_array($word, $stop_words)) {
            $keywords[] = $word;
        }
    }
    
    return array_unique($keywords);
}
?>
