<?php
// PWA Icon Generator using ImageMagick
// This script generates icon-192.png and icon-512.png

function generatePWAIcon($size, $filename) {
    // Create SVG content
    $svg = '<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="' . $size . '" height="' . $size . '" viewBox="0 0 ' . $size . ' ' . $size . '">
  <rect width="' . $size . '" height="' . $size . '" fill="#1e40af"/>
  <rect x="0" y="0" width="' . $size . '" height="' . $size . '" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="' . ($size * 0.4) . '" font-weight="bold" fill="white">U</text>
  <rect x="' . ($size * 0.1) . '" y="' . ($size * 0.1) . '" width="' . ($size * 0.8) . '" height="' . ($size * 0.8) . '" fill="none" stroke="white" stroke-width="' . ($size * 0.05) . '" rx="' . ($size * 0.1) . '"/>
</svg>';

    // Save SVG temporarily
    $svgFile = tempnam(sys_get_temp_dir(), 'icon');
    file_put_contents($svgFile, $svg);

    // Convert SVG to PNG using ImageMagick
    try {
        $command = "convert -background none -size {$size}x{$size} $svgFile $filename";
        exec($command, $output, $returnCode);
        
        if ($returnCode === 0) {
            echo "Generated $filename ($size x $size)\n";
        } else {
            echo "ImageMagick not available, copying SVG instead\n";
            copy($svgFile, $filename . '.svg');
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
        // Copy SVG as fallback
        copy($svgFile, $filename . '.svg');
    }
    
    // Cleanup
    unlink($svgFile);
}

// Generate both sizes
generatePWAIcon(192, __DIR__ . '/icon-192.png');
generatePWAIcon(512, __DIR__ . '/icon-512.png');

echo "\nPWA icons generated successfully!\n";
?>
