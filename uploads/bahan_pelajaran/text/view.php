<?php
// Simple file viewer for educational content
$filename = $_GET['file'] ?? '';

if (empty($filename) || !preg_match('/^materi_\d+_\d+\.html$/', $filename)) {
    die('Invalid filename');
}

$filepath = __DIR__ . '/' . $filename;

if (!file_exists($filepath)) {
    die('File not found');
}

header('Content-Type: text/html; charset=utf-8');
readfile($filepath);
?>
