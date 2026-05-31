<?php
$sql = file_get_contents('bimbel_db.sql');

// Remove all CREATE VIEW statements and their INSERT statements
$lines = explode("\n", $sql);
$cleanedLines = [];
$viewNames = [];

// First pass: collect all view names
foreach ($lines as $line) {
    if (stripos($line, 'VIEW') !== false && stripos($line, 'CREATE') !== false) {
        if (preg_match('/VIEW\s+`?(\w+)`?/i', $line, $matches)) {
            $viewNames[] = $matches[1];
        }
    }
}

echo "Found " . count($viewNames) . " views: " . implode(', ', $viewNames) . "\n";

// Second pass: remove view-related statements
foreach ($lines as $line) {
    $skip = false;
    
    // Skip CREATE VIEW statements
    if (stripos($line, 'CREATE VIEW') !== false) {
        $cleanedLines[] = '-- VIEW REMOVED: ' . $line;
        continue;
    }
    
    // Skip INSERT into views
    foreach ($viewNames as $viewName) {
        if (stripos($line, 'INSERT INTO') !== false) {
            if (stripos($line, '`' . $viewName . '`') !== false || 
                stripos($line, ' `' . $viewName . ' ') !== false ||
                preg_match('/INSERT INTO\s+' . $viewName . '\s/i', $line)) {
                $cleanedLines[] = '-- INSERT INTO VIEW REMOVED: ' . $line;
                $skip = true;
                break;
            }
        }
    }
    
    if ($skip) {
        continue;
    }
    
    // Skip table structure comments for views
    if (stripos($line, 'Table structure for table') !== false) {
        foreach ($viewNames as $viewName) {
            if (stripos($line, $viewName) !== false) {
                $cleanedLines[] = '-- VIEW TABLE STRUCTURE REMOVED: ' . $line;
                $skip = true;
                break;
            }
        }
    }
    
    if ($skip) {
        continue;
    }
    
    // Skip dumping data comments for views
    if (stripos($line, 'Dumping data for table') !== false) {
        foreach ($viewNames as $viewName) {
            if (stripos($line, $viewName) !== false) {
                $cleanedLines[] = '-- VIEW DATA REMOVED: ' . $line;
                $skip = true;
                break;
            }
        }
    }
    
    if ($skip) {
        continue;
    }
    
    $cleanedLines[] = $line;
}

$cleanedSql = implode("\n", $cleanedLines);
file_put_contents('bimbel_db_clean.sql', $cleanedSql);
echo 'Cleaned SQL file created';
?>
