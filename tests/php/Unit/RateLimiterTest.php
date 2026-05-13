<?php
use PHPUnit\Framework\TestCase;

require_once TEST_API_DIR . '/rate_limiter.php';

/**
 * Unit tests for Rate Limiter
 */
class RateLimiterTest extends TestCase {
    
    private $tempDir;
    
    protected function setUp(): void {
        // Create temp directory for rate limit files
        $this->tempDir = sys_get_temp_dir() . '/rate_limit_test_' . uniqid();
        mkdir($this->tempDir, 0755, true);
    }
    
    protected function tearDown(): void {
        // Clean up temp files
        if (is_dir($this->tempDir)) {
            $files = glob($this->tempDir . '/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
            rmdir($this->tempDir);
        }
    }
    
    public function testGetClientIp() {
        // Test with REMOTE_ADDR
        $_SERVER['REMOTE_ADDR'] = '192.168.1.1';
        unset($_SERVER['HTTP_X_FORWARDED_FOR']);
        
        $ip = RateLimiter::getClientIp();
        $this->assertEquals('192.168.1.1', $ip);
        
        // Test with X-Forwarded-For
        $_SERVER['HTTP_X_FORWARDED_FOR'] = '10.0.0.1, 192.168.1.1';
        $ip = RateLimiter::getClientIp();
        $this->assertEquals('10.0.0.1', $ip); // First IP in chain
    }
    
    public function testCheckRateLimitWithinLimit() {
        $limiter = new RateLimiter(5, 60, $this->tempDir);
        $identifier = 'test_user_123';
        
        // First 5 requests should pass
        for ($i = 0; $i < 5; $i++) {
            $result = $limiter->check($identifier);
            $this->assertTrue($result['allowed']);
        }
    }
    
    public function testCheckRateLimitExceedsLimit() {
        $limiter = new RateLimiter(3, 60, $this->tempDir);
        $identifier = 'test_user_456';
        
        // First 3 requests should pass
        for ($i = 0; $i < 3; $i++) {
            $result = $limiter->check($identifier);
            $this->assertTrue($result['allowed']);
        }
        
        // 4th request should be blocked
        $result = $limiter->check($identifier);
        $this->assertFalse($result['allowed']);
        $this->assertGreaterThan(0, $result['retry_after']);
    }
    
    public function testCheckRateLimitDifferentIdentifiers() {
        $limiter = new RateLimiter(2, 60, $this->tempDir);
        
        // Different identifiers should have separate limits
        $result1 = $limiter->check('user_1');
        $this->assertTrue($result1['allowed']);
        
        $result2 = $limiter->check('user_2');
        $this->assertTrue($result2['allowed']);
        
        // Both should still have 1 request remaining
        $result1 = $limiter->check('user_1');
        $this->assertTrue($result1['allowed']);
        
        $result2 = $limiter->check('user_2');
        $this->assertTrue($result2['allowed']);
    }
    
    public function testCleanupOldFiles() {
        // Create old file
        $oldFile = $this->tempDir . '/old_limit_' . (time() - 7200) . '.json';
        file_put_contents($oldFile, json_encode(['requests' => []]));
        
        // Create recent file
        $newFile = $this->tempDir . '/new_limit_' . time() . '.json';
        file_put_contents($newFile, json_encode(['requests' => []]));
        
        $limiter = new RateLimiter(10, 60, $this->tempDir);
        $limiter->cleanupOldFiles(3600); // 1 hour max age
        
        $this->assertFileDoesNotExist($oldFile);
        $this->assertFileExists($newFile);
    }
    
    public function testGetRemainingRequests() {
        $limiter = new RateLimiter(10, 60, $this->tempDir);
        $identifier = 'test_remaining';
        
        // Initially 10 remaining
        $this->assertEquals(10, $limiter->getRemainingRequests($identifier));
        
        // After 3 requests, 7 remaining
        for ($i = 0; $i < 3; $i++) {
            $limiter->check($identifier);
        }
        
        $this->assertEquals(7, $limiter->getRemainingRequests($identifier));
    }
    
    public function testRateLimitInfo() {
        $limiter = new RateLimiter(5, 60, $this->tempDir);
        $identifier = 'test_info';
        
        $info = $limiter->getRateLimitInfo($identifier);
        
        $this->assertArrayHasKey('limit', $info);
        $this->assertArrayHasKey('window', $info);
        $this->assertArrayHasKey('remaining', $info);
        $this->assertArrayHasKey('reset_time', $info);
        
        $this->assertEquals(5, $info['limit']);
        $this->assertEquals(60, $info['window']);
    }
    
    public function testMultipleRequestsInWindow() {
        $limiter = new RateLimiter(5, 60, $this->tempDir);
        $identifier = 'test_multiple';
        
        // Make requests rapidly
        $results = [];
        for ($i = 0; $i < 7; $i++) {
            $results[] = $limiter->check($identifier);
        }
        
        // First 5 should be allowed
        for ($i = 0; $i < 5; $i++) {
            $this->assertTrue($results[$i]['allowed']);
        }
        
        // Last 2 should be blocked
        for ($i = 5; $i < 7; $i++) {
            $this->assertFalse($results[$i]['allowed']);
        }
    }
}
