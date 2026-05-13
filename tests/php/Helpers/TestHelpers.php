<?php
/**
 * Test Helper Functions
 */

class TestHelpers {
    /**
     * Create a mock database connection
     */
    public static function createMockConnection() {
        $mock = new class {
            public $queries = [];
            public $results = [];
            
            public function prepare($sql) {
                $this->queries[] = $sql;
                return new class($this) {
                    private $parent;
                    
                    public function __construct($parent) {
                        $this->parent = $parent;
                    }
                    
                    public function bind_param($types, ...$params) {
                        return true;
                    }
                    
                    public function execute() {
                        return true;
                    }
                    
                    public function get_result() {
                        return new class {
                            public function fetch_assoc() {
                                return ['id' => 1, 'username' => 'test'];
                            }
                            
                            public function fetch_all() {
                                return [];
                            }
                            
                            public function num_rows() {
                                return 1;
                            }
                        };
                    }
                    
                    public function close() {
                        return true;
                    }
                };
            }
            
            public function query($sql) {
                $this->queries[] = $sql;
                return true;
            }
            
            public function real_escape_string($string) {
                return addslashes($string);
            }
            
            public function close() {
                return true;
            }
        };
        
        return $mock;
    }
    
    /**
     * Create test user data
     */
    public static function createTestUser($overrides = []) {
        $default = [
            'id' => 1,
            'username' => 'testuser',
            'email' => 'test@example.com',
            'role' => 'user',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        return array_merge($default, $overrides);
    }
    
    /**
     * Create test question data
     */
    public static function createTestQuestion($overrides = []) {
        $default = [
            'id' => 1,
            'pertanyaan' => 'Test question?',
            'pilihan_a' => 'Option A',
            'pilihan_b' => 'Option B',
            'pilihan_c' => 'Option C',
            'pilihan_d' => 'Option D',
            'pilihan_e' => 'Option E',
            'jawaban_benar' => 'A',
            'kategori_id' => 1,
            'tingkat' => 'sedang'
        ];
        
        return array_merge($default, $overrides);
    }
    
    /**
     * Create test paket data
     */
    public static function createTestPaket($overrides = []) {
        $default = [
            'id' => 1,
            'nama' => 'Test Paket',
            'kategori' => 'TWK',
            'jumlah_soal' => 30,
            'waktu' => 60,
            'deskripsi' => 'Test description'
        ];
        
        return array_merge($default, $overrides);
    }
    
    /**
     * Simulate POST request
     */
    public static function simulatePost($data) {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_POST = $data;
        return true;
    }
    
    /**
     * Simulate GET request
     */
    public static function simulateGet($data) {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET = $data;
        return true;
    }
    
    /**
     * Assert JSON response
     */
    public static function assertJsonResponse($response, $expectedKeys = []) {
        $decoded = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON response: " . json_last_error_msg());
        }
        
        foreach ($expectedKeys as $key) {
            if (!isset($decoded[$key])) {
                throw new Exception("Missing key in response: $key");
            }
        }
        
        return $decoded;
    }
    
    /**
     * Generate random string
     */
    public static function randomString($length = 10) {
        return substr(str_shuffle(str_repeat($x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length / strlen($x)))), 1, $length);
    }
    
    /**
     * Create temporary file for upload testing
     */
    public static function createTempFile($content = 'test content', $extension = 'txt') {
        $tempFile = tempnam(sys_get_temp_dir(), 'test_') . '.' . $extension;
        file_put_contents($tempFile, $content);
        return $tempFile;
    }
    
    /**
     * Clean up temporary files
     */
    public static function cleanupTempFiles() {
        $tempDir = sys_get_temp_dir();
        $files = glob($tempDir . '/test_*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    }
}
