<?php
/**
 * Simple File-Based Caching System
 * 
 * Provides caching for frequently accessed data
 * to improve application performance
 */

class Cache {
    private $cacheDir;
    private $defaultTTL;
    
    public function __construct($cacheDir = null, $defaultTTL = 3600) {
        $this->cacheDir = $cacheDir ?? __DIR__ . '/../cache/data/';
        $this->defaultTTL = $defaultTTL;
        
        // Create cache directory if not exists
        if (!file_exists($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    /**
     * Get data from cache
     */
    public function get($key) {
        $file = $this->getCacheFile($key);
        
        if (!file_exists($file)) {
            return null;
        }
        
        $data = unserialize(file_get_contents($file));
        
        // Check if expired
        if ($data['expires'] < time()) {
            unlink($file);
            return null;
        }
        
        return $data['value'];
    }
    
    /**
     * Store data in cache
     */
    public function set($key, $value, $ttl = null) {
        $file = $this->cacheDir . $this->sanitizeKey($key) . '.cache';
        $ttl = $ttl ?? $this->defaultTTL;
        
        $data = [
            'expires' => time() + $ttl,
            'value' => $value
        ];
        
        file_put_contents($file, serialize($data), LOCK_EX);
        return true;
    }
    
    /**
     * Delete specific cache
     */
    public function delete($key) {
        $file = $this->getCacheFile($key);
        if (file_exists($file)) {
            return unlink($file);
        }
        return false;
    }
    
    /**
     * Clear all cache or by pattern
     */
    public function clear($pattern = null) {
        $files = glob($this->cacheDir . '*.cache');
        $deleted = 0;
        
        foreach ($files as $file) {
            if ($pattern === null || strpos(basename($file), $pattern) !== false) {
                unlink($file);
                $deleted++;
            }
        }
        
        return $deleted;
    }
    
    /**
     * Get or set cache (convenience method)
     */
    public function remember($key, $callback, $ttl = null) {
        $value = $this->get($key);
        
        if ($value === null) {
            $value = $callback();
            $this->set($key, $value, $ttl);
        }
        
        return $value;
    }
    
    /**
     * Cache database query results
     */
    public function rememberQuery($key, $sql, $params = [], $ttl = 300) {
        return $this->remember("query_" . md5($key . $sql . json_encode($params)), function() use ($sql, $params) {
            global $conn;
            $stmt = $conn->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            return $result->fetch_all(MYSQLI_ASSOC);
        }, $ttl);
    }
    
    /**
     * Get cache statistics
     */
    public function getStats() {
        $files = glob($this->cacheDir . '*.cache');
        $totalSize = 0;
        $totalFiles = count($files);
        $expired = 0;
        
        foreach ($files as $file) {
            $totalSize += filesize($file);
            $data = unserialize(file_get_contents($file));
            if ($data['expires'] < time()) {
                $expired++;
            }
        }
        
        return [
            'total_files' => $totalFiles,
            'expired_files' => $expired,
            'total_size_bytes' => $totalSize,
            'total_size_mb' => round($totalSize / 1024 / 1024, 2)
        ];
    }
    
    /**
     * Clean up expired cache files
     */
    public function cleanup() {
        $files = glob($this->cacheDir . '*.cache');
        $deleted = 0;
        
        foreach ($files as $file) {
            $data = unserialize(file_get_contents($file));
            if ($data['expires'] < time()) {
                unlink($file);
                $deleted++;
            }
        }
        
        return $deleted;
    }
    
    /**
     * Get cache file path
     */
    private function getCacheFile($key) {
        return $this->cacheDir . $this->sanitizeKey($key) . '.cache';
    }
    
    /**
     * Sanitize cache key for filename
     */
    private function sanitizeKey($key) {
        return preg_replace('/[^a-zA-Z0-9_-]/', '_', $key);
    }
}

// Global cache instance
$cache = new Cache();

// Convenience functions
function cacheGet($key) {
    global $cache;
    return $cache->get($key);
}

function cacheSet($key, $value, $ttl = 3600) {
    global $cache;
    return $cache->set($key, $value, $ttl);
}

function cacheRemember($key, $callback, $ttl = 3600) {
    global $cache;
    return $cache->remember($key, $callback, $ttl);
}

function cacheForget($key) {
    global $cache;
    return $cache->delete($key);
}

function cacheClear($pattern = null) {
    global $cache;
    return $cache->clear($pattern);
}
