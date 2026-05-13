<?php
/**
 * Cleanup Unused Files Analyzer
 * 
 * Analyzes the application to identify files that are no longer needed
 * and provides recommendations for cleanup
 */

class CleanupAnalyzer {
    private $baseDir;
    private $unusedFiles = [];
    private $suspiciousFiles = [];
    private $largeFiles = [];
    private $duplicates = [];
    private $orphanedImports = [];
    
    public function __construct($baseDir = __DIR__ . '/..') {
        $this->baseDir = realpath($baseDir);
    }
    
    /**
     * Run full cleanup analysis
     */
    public function analyze() {
        echo "🔍 Starting Cleanup Analysis...\n\n";
        
        $this->findUnusedImportScripts();
        $this->findLargeFiles();
        $this->findPotentialDuplicates();
        $this->findUnusedDatabaseFiles();
        $this->findUnusedUploads();
        $this->analyzeImportsAndRequires();
        
        return [
            'unused' => $this->unusedFiles,
            'suspicious' => $this->suspiciousFiles,
            'large' => $this->largeFiles,
            'duplicates' => $this->duplicates,
            'orphaned' => $this->orphanedImports
        ];
    }
    
    /**
     * Find unused import scripts (import_*.php, cli_import.php, etc.)
     */
    private function findUnusedImportScripts() {
        echo "📁 Checking import scripts...\n";
        
        $importFiles = [
            'cli_import.php' => 'CLI import - was for initial setup, now replaced by web import',
            'import_database.php' => 'Import helper - was for initial setup',
            'web_import.php' => 'Web import - was for initial database setup',
            'import_soal.php' => 'Bulk soal import - check if still used',
            'import_tpa_psiko.php' => 'TPA import - check if still used'
        ];
        
        foreach ($importFiles as $file => $description) {
            $path = $this->baseDir . '/' . $file;
            if (file_exists($path)) {
                $this->unusedFiles[] = [
                    'file' => $file,
                    'path' => $path,
                    'size' => filesize($path),
                    'reason' => $description,
                    'action' => 'review'
                ];
            }
        }
        
        echo "   Found " . count($this->unusedFiles) . " import scripts to review\n\n";
    }
    
    /**
     * Find large files that might need optimization
     */
    private function findLargeFiles() {
        echo "📦 Finding large files...\n";
        
        $threshold = 500 * 1024; // 500KB
        
        $largeFiles = [
            'bulk_import_questions.php',
            'bulk_import_tpa_psikologis.py',
            'bulk_import_umptn_sbmptn.py',
            'scrape_bank_soal.py',
            'seed_questions.php',
            'seed_questions.sql'
        ];
        
        foreach ($largeFiles as $file) {
            $path = $this->baseDir . '/' . $file;
            if (file_exists($path) && filesize($path) > $threshold) {
                $this->largeFiles[] = [
                    'file' => $file,
                    'path' => $path,
                    'size' => $this->formatBytes(filesize($path)),
                    'size_bytes' => filesize($path),
                    'suggestion' => filesize($path) > 1024 * 1024 
                        ? 'Consider moving to data/ or archiving' 
                        : 'OK - but monitor size'
                ];
            }
        }
        
        // Sort by size
        usort($this->largeFiles, function($a, $b) {
            return $b['size_bytes'] - $a['size_bytes'];
        });
        
        echo "   Found " . count($this->largeFiles) . " large files\n\n";
    }
    
    /**
     * Find potential duplicate files
     */
    private function findPotentialDuplicates() {
        echo "🔎 Checking for duplicates...\n";
        
        // Check for multiple README files
        $readmeFiles = glob($this->baseDir . '/README*');
        if (count($readmeFiles) > 1) {
            $this->duplicates[] = [
                'type' => 'Documentation',
                'files' => array_map('basename', $readmeFiles),
                'suggestion' => 'Consolidate into single README.md'
            ];
        }
        
        // Check for duplicate SQL files in database/
        $sqlFiles = glob($this->baseDir . '/database/*.sql');
        $byPrefix = [];
        foreach ($sqlFiles as $sql) {
            $base = basename($sql);
            $prefix = preg_replace('/_\d+\.sql$/', '', $base);
            if (!isset($byPrefix[$prefix])) {
                $byPrefix[$prefix] = [];
            }
            $byPrefix[$prefix][] = $base;
        }
        
        foreach ($byPrefix as $prefix => $files) {
            if (count($files) > 1 && $prefix !== 'complete_setup') {
                $this->duplicates[] = [
                    'type' => 'SQL Migrations',
                    'files' => $files,
                    'suggestion' => 'Consider consolidating migrations'
                ];
            }
        }
        
        echo "   Found " . count($this->duplicates) . " potential duplicates\n\n";
    }
    
    /**
     * Find unused database SQL files
     */
    private function findUnusedDatabaseFiles() {
        echo "🗄️ Checking database files...\n";
        
        $dbFiles = glob($this->baseDir . '/database/*.sql');
        $essentialFiles = [
            'complete_setup.sql',
            'performance_indexes.sql'
        ];
        
        foreach ($dbFiles as $file) {
            $base = basename($file);
            if (!in_array($base, $essentialFiles)) {
                $age = time() - filemtime($file);
                $days = floor($age / 86400);
                
                if ($days > 90) { // Older than 90 days
                    $this->unusedFiles[] = [
                        'file' => 'database/' . $base,
                        'path' => $file,
                        'size' => filesize($file),
                        'age_days' => $days,
                        'reason' => "Old migration file ({$days} days)",
                        'action' => 'archive'
                    ];
                }
            }
        }
        
        echo "   Checked " . count($dbFiles) . " database files\n\n";
    }
    
    /**
     * Analyze uploads directory for unused files
     */
    private function findUnusedUploads() {
        echo "☁️ Analyzing uploads directory...\n";
        
        $uploadsDir = $this->baseDir . '/uploads';
        if (!is_dir($uploadsDir)) {
            echo "   Uploads directory not found\n\n";
            return;
        }
        
        // Count files in uploads
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($uploadsDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        $count = 0;
        $totalSize = 0;
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $count++;
                $totalSize += $file->getSize();
            }
        }
        
        $this->suspiciousFiles[] = [
            'location' => 'uploads/',
            'count' => $count,
            'total_size' => $this->formatBytes($totalSize),
            'suggestion' => 'Review for orphaned files not referenced in database'
        ];
        
        echo "   Uploads: {$count} files, {$this->formatBytes($totalSize)}\n\n";
    }
    
    /**
     * Analyze PHP files for orphaned includes
     */
    private function analyzeImportsAndRequires() {
        echo "🔗 Analyzing PHP imports...\n";
        
        $phpFiles = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->baseDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        $allRequires = [];
        $allFiles = [];
        
        foreach ($phpFiles as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $content = file_get_contents($file->getPathname());
                $relativePath = str_replace($this->baseDir . '/', '', $file->getPathname());
                $allFiles[] = $relativePath;
                
                // Find all require/include statements
                preg_match_all('/(?:require|include)(?:_once)?\s*\(?\s*[\'"]([^\'"]+)[\'"]/', $content, $matches);
                
                foreach ($matches[1] as $required) {
                    $allRequires[] = [
                        'file' => $relativePath,
                        'requires' => $required
                    ];
                }
            }
        }
        
        // Check for files that might not be used
        $unused = [];
        $commonUnused = [
            'cli_import.php',
            'import_database.php',
            'web_import.php',
            'generate-icons.php',
            'setup.sh'
        ];
        
        foreach ($commonUnused as $file) {
            if (file_exists($this->baseDir . '/' . $file)) {
                $unused[] = $file;
            }
        }
        
        $this->orphanedImports = $unused;
        
        echo "   Analyzed " . count($allFiles) . " PHP files\n";
        echo "   Found " . count($allRequires) . " imports/requires\n\n";
    }
    
    /**
     * Format bytes to human readable
     */
    private function formatBytes($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;
        
        while ($bytes >= 1024 && $unitIndex < count($units) - 1) {
            $bytes /= 1024;
            $unitIndex++;
        }
        
        return round($bytes, 2) . ' ' . $units[$unitIndex];
    }
    
    /**
     * Generate cleanup report
     */
    public function generateReport() {
        $analysis = $this->analyze();
        
        echo "\n" . str_repeat('=', 70) . "\n";
        echo "CLEANUP ANALYSIS REPORT\n";
        echo str_repeat('=', 70) . "\n\n";
        
        // Large Files
        echo "📦 LARGE FILES (Over 500KB):\n";
        echo str_repeat('-', 70) . "\n";
        foreach ($analysis['large'] as $file) {
            echo "• {$file['file']}\n";
            echo "  Size: {$file['size']}\n";
            echo "  Suggestion: {$file['suggestion']}\n\n";
        }
        
        // Duplicate Files
        echo "\n🔎 POTENTIAL DUPLICATES:\n";
        echo str_repeat('-', 70) . "\n";
        foreach ($analysis['duplicates'] as $dup) {
            echo "• {$dup['type']}:\n";
            echo "  Files: " . implode(', ', $dup['files']) . "\n";
            echo "  Suggestion: {$dup['suggestion']}\n\n";
        }
        
        // Unused Files
        echo "\n🗑️ UNUSED/DEPRECATED FILES:\n";
        echo str_repeat('-', 70) . "\n";
        foreach ($analysis['unused'] as $file) {
            echo "• {$file['file']}\n";
            echo "  Reason: {$file['reason']}\n";
            echo "  Action: {$file['action']}\n\n";
        }
        
        // Orphaned Imports
        echo "\n🔗 POTENTIALLY UNUSED FILES:\n";
        echo str_repeat('-', 70) . "\n";
        foreach ($analysis['orphaned'] as $file) {
            echo "• {$file} - No references found\n";
        }
        
        // Suspicious
        echo "\n⚠️ SUSPICIOUS FILES/DIRECTORIES:\n";
        echo str_repeat('-', 70) . "\n";
        foreach ($analysis['suspicious'] as $item) {
            echo "• {$item['location']}\n";
            echo "  Count: {$item['count']}, Size: {$item['total_size']}\n";
            echo "  Suggestion: {$item['suggestion']}\n\n";
        }
        
        // Summary
        echo str_repeat('=', 70) . "\n";
        echo "SUMMARY\n";
        echo str_repeat('=', 70) . "\n";
        echo "Large files: " . count($analysis['large']) . "\n";
        echo "Potential duplicates: " . count($analysis['duplicates']) . "\n";
        echo "Unused files: " . count($analysis['unused']) . "\n";
        echo "Orphaned files: " . count($analysis['orphaned']) . "\n";
        echo "Suspicious items: " . count($analysis['suspicious']) . "\n";
        
        return $analysis;
    }
    
    /**
     * Generate cleanup commands
     */
    public function generateCleanupCommands() {
        $commands = [];
        
        $commands[] = "# Create backup of files before cleanup";
        $commands[] = "mkdir -p backup/cleanup-$(date +%Y%m%d)";
        $commands[] = "";
        
        $commands[] = "# Move old import scripts to backup";
        $commands[] = "mv cli_import.php web_import.php import_database.php backup/cleanup-$(date +%Y%m%d)/ 2>/dev/null || true";
        $commands[] = "";
        
        $commands[] = "# Consolidate README files";
        $commands[] = "# Keep only README.md, move others to docs/";
        $commands[] = "mv README_first.md docs/ 2>/dev/null || true";
        $commands[] = "";
        
        $commands[] = "# Archive old database migrations";
        $commands[] = "mkdir -p database/archive";
        $commands[] = "# Move migration files older than 90 days to archive/";
        $commands[] = "";
        
        $commands[] = "# Clean up uploads directory (manual review required)";
        $commands[] = "# Check database references before deleting any files";
        
        return $commands;
    }
}

// Run if called from CLI
if (php_sapi_name() === 'cli') {
    $analyzer = new CleanupAnalyzer();
    $analysis = $analyzer->generateReport();
    
    echo "\n";
    
    // Generate cleanup commands
    echo "\n" . str_repeat('=', 70) . "\n";
    echo "RECOMMENDED CLEANUP COMMANDS:\n";
    echo str_repeat('=', 70) . "\n";
    foreach ($analyzer->generateCleanupCommands() as $cmd) {
        echo $cmd . "\n";
    }
    
    // Save report
    $reportFile = __DIR__ . '/../cleanup-report-' . date('Y-m-d') . '.json';
    file_put_contents($reportFile, json_encode($analysis, JSON_PRETTY_PRINT));
    echo "\n📄 Report saved to: $reportFile\n";
}

// Return for include
return new CleanupAnalyzer();
