<?php
// Asset Minification Script
// Run this script to minify CSS and JS files

function minifyCSS($css) {
    // Remove comments
    $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
    // Remove whitespace
    $css = str_replace(array("\r\n", "\r", "\n", "\t"), '', $css);
    $css = preg_replace('/\s+/', ' ', $css);
    return trim($css);
}

function minifyJS($js) {
    // Remove single-line comments
    $js = preg_replace('/\/\/.*$/m', '', $js);
    // Remove multi-line comments
    $js = preg_replace('/\/\*[\s\S]*?\*\//', '', $js);
    // Remove whitespace
    $js = str_replace(array("\r\n", "\r", "\n", "\t"), '', $js);
    $js = preg_replace('/\s+/', ' ', $js);
    return trim($js);
}

// Minify CSS files
$cssFiles = [
    '../participant/dashboard.html' => 'embedded CSS',
];

foreach ($cssFiles as $file => $type) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        
        if ($type === 'embedded CSS') {
            // Extract and minify embedded CSS
            preg_match('/<style>(.*?)<\/style>/s', $content, $matches);
            if (isset($matches[1])) {
                $minifiedCSS = minifyCSS($matches[1]);
                $content = str_replace($matches[1], $minifiedCSS, $content);
                file_put_contents($file, $content);
                echo "✅ Minified embedded CSS in $file\n";
            }
        }
    }
}

// Minify JS files
$jsFiles = [
    '../js/config.js',
    '../js/rbac.js',
];

foreach ($jsFiles as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $minifiedJS = minifyJS($content);
        file_put_contents($file, $minifiedJS);
        echo "✅ Minified $file\n";
    }
}

echo "\nAsset minification completed.\n";
?>
