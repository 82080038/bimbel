<?php
/**
 * Database Backup System
 * 
 * Automated backup of the ujian_sekolah_kedinasan database
 * Can be run via cron job or manually
 */

require_once __DIR__ . '/../config.php';

class DatabaseBackup {
    private $dbHost;
    private $dbName;
    private $dbUser;
    private $dbPass;
    private $backupDir;
    
    public function __construct($dbHost, $dbName, $dbUser, $dbPass, $backupDir = null) {
        $this->dbHost = $dbHost;
        $this->dbName = $dbName;
        $this->dbUser = $dbUser;
        $this->dbPass = $dbPass;
        $this->backupDir = $backupDir ?? __DIR__ . '/../backups/';
        
        // Create backup directory if not exists
        if (!file_exists($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }
    
    /**
     * Create database backup
     */
    public function createBackup($compress = true) {
        $date = date('Y-m-d_H-i-s');
        $backupFile = $this->backupDir . $this->dbName . '_' . $date . '.sql';
        
        // Build mysqldump command
        $command = sprintf(
            'mysqldump -h%s -u%s -p%s %s > %s',
            $this->dbHost,
            $this->dbUser,
            $this->dbPass,
            $this->dbName,
            $backupFile
        );
        
        // Execute backup
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new Exception('Backup failed: ' . implode("\n", $output));
        }
        
        // Compress if requested
        if ($compress) {
            $compressedFile = $backupFile . '.gz';
            $gzipCommand = "gzip $backupFile";
            exec($gzipCommand, $output, $returnCode);
            
            if ($returnCode === 0) {
                $backupFile = $compressedFile;
            }
        }
        
        return $backupFile;
    }
    
    /**
     * List available backups
     */
    public function listBackups() {
        $files = glob($this->backupDir . $this->dbName . '_*.sql*');
        $backups = [];
        
        foreach ($files as $file) {
            $backups[] = [
                'file' => basename($file),
                'path' => $file,
                'size' => filesize($file),
                'date' => filemtime($file)
            ];
        }
        
        // Sort by date (newest first)
        usort($backups, function($a, $b) {
            return $b['date'] - $a['date'];
        });
        
        return $backups;
    }
    
    /**
     * Restore database from backup
     */
    public function restoreBackup($backupFile) {
        if (!file_exists($backupFile)) {
            throw new Exception('Backup file not found: ' . $backupFile);
        }
        
        // Decompress if needed
        $restoreFile = $backupFile;
        if (strpos($backupFile, '.gz') !== false) {
            $restoreFile = str_replace('.gz', '', $backupFile);
            exec("gunzip -c $backupFile > $restoreFile");
        }
        
        // Build mysql command
        $command = sprintf(
            'mysql -h%s -u%s -p%s %s < %s',
            $this->dbHost,
            $this->dbUser,
            $this->dbPass,
            $this->dbName,
            $restoreFile
        );
        
        // Execute restore
        exec($command, $output, $returnCode);
        
        // Clean up decompressed file if it was compressed
        if (strpos($backupFile, '.gz') !== false && $restoreFile !== $backupFile) {
            unlink($restoreFile);
        }
        
        if ($returnCode !== 0) {
            throw new Exception('Restore failed: ' . implode("\n", $output));
        }
        
        return true;
    }
    
    /**
     * Clean up old backups (keep last N days)
     */
    public function cleanup($daysToKeep = 30) {
        $cutoff = time() - ($daysToKeep * 24 * 60 * 60);
        $files = glob($this->backupDir . $this->dbName . '_*.sql*');
        
        $deleted = 0;
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
                $deleted++;
            }
        }
        
        return $deleted;
    }
    
    /**
     * Get backup statistics
     */
    public function getStats() {
        $files = glob($this->backupDir . $this->dbName . '_*.sql*');
        
        $totalSize = 0;
        $count = count($files);
        
        foreach ($files as $file) {
            $totalSize += filesize($file);
        }
        
        return [
            'count' => $count,
            'total_size' => $totalSize,
            'total_size_mb' => round($totalSize / 1024 / 1024, 2),
            'oldest' => $count > 0 ? min(array_map('filemtime', $files)) : null,
            'newest' => $count > 0 ? max(array_map('filemtime', $files)) : null
        ];
    }
}

// CLI Interface
if (php_sapi_name() === 'cli') {
    $backup = new DatabaseBackup(
        DB_HOST,
        DB_NAME,
        DB_USER,
        DB_PASS
    );
    
    $command = $argv[1] ?? 'help';
    
    switch ($command) {
        case 'create':
            echo "Creating backup...\n";
            try {
                $file = $backup->createBackup(true);
                echo "Backup created: $file\n";
            } catch (Exception $e) {
                echo "Error: " . $e->getMessage() . "\n";
                exit(1);
            }
            break;
            
        case 'list':
            echo "Available backups:\n";
            $backups = $backup->listBackups();
            foreach ($backups as $b) {
                $size = round($b['size'] / 1024 / 1024, 2);
                $date = date('Y-m-d H:i:s', $b['date']);
                echo "  {$b['file']} - {$size} MB - {$date}\n";
            }
            break;
            
        case 'restore':
            if (!isset($argv[2])) {
                echo "Usage: php backup.php restore <backup_file>\n";
                exit(1);
            }
            echo "Restoring from {$argv[2]}...\n";
            try {
                $backup->restoreBackup($argv[2]);
                echo "Restore completed successfully\n";
            } catch (Exception $e) {
                echo "Error: " . $e->getMessage() . "\n";
                exit(1);
            }
            break;
            
        case 'cleanup':
            $days = $argv[2] ?? 30;
            echo "Cleaning up backups older than $days days...\n";
            $deleted = $backup->cleanup($days);
            echo "Deleted $d old backup(s)\n";
            break;
            
        case 'stats':
            $stats = $backup->getStats();
            echo "Backup Statistics:\n";
            echo "  Total backups: {$stats['count']}\n";
            echo "  Total size: {$stats['total_size_mb']} MB\n";
            if ($stats['oldest']) {
                echo "  Oldest: " . date('Y-m-d H:i:s', $stats['oldest']) . "\n";
            }
            if ($stats['newest']) {
                echo "  Newest: " . date('Y-m-d H:i:s', $stats['newest']) . "\n";
            }
            break;
            
        case 'help':
        default:
            echo "Database Backup System\n\n";
            echo "Usage: php backup.php <command> [options]\n\n";
            echo "Commands:\n";
            echo "  create          Create a new backup\n";
            echo "  list            List available backups\n";
            echo "  restore <file>  Restore from backup file\n";
            echo "  cleanup [days]  Delete backups older than N days (default: 30)\n";
            echo "  stats           Show backup statistics\n";
            echo "  help            Show this help message\n";
            break;
    }
}
