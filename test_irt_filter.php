<?php
require 'config.php';

// Test IRT filter with kategori=TWK
$conn = new mysqli('127.0.0.1', 'root', 'root', 'ujian_sekolah_kedinasan');

$sql = "SELECT s.id, s.pertanyaan, s.kategori_id, k.nama_kategori,
        s.irt_a, s.irt_b, s.irt_c, s.discrimination_index, s.item_quality,
        sf.muncul_count, sf.benar_count, sf.salah_count,
        CASE WHEN sf.muncul_count > 0 THEN (sf.benar_count / sf.muncul_count) ELSE 0 END as p_benar
        FROM soal s
        LEFT JOIN kategori_soal k ON s.kategori_id = k.id
        LEFT JOIN soal_frequency sf ON s.id = sf.soal_id
        WHERE sf.muncul_count > 0 AND k.nama_kategori = 'TWK'
        ORDER BY s.discrimination_index ASC";

echo "SQL: " . $sql . "\n\n";

$result = $conn->query($sql);
$count = $result->num_rows;

echo "Result count: " . $count . "\n\n";

if ($count > 0) {
    echo "First 5 results:\n";
    $i = 0;
    while ($row = $result->fetch_assoc()) {
        if ($i >= 5) break;
        echo "ID: {$row['id']}, Kategori: {$row['nama_kategori']}, Quality: {$row['item_quality']}\n";
        $i++;
    }
} else {
    echo "No results found\n";
}

// Test without filter
$sql2 = "SELECT s.id, s.kategori_id, k.nama_kategori, COUNT(*) as count
        FROM soal s
        LEFT JOIN kategori_soal k ON s.kategori_id = k.id
        LEFT JOIN soal_frequency sf ON s.id = sf.soal_id
        WHERE sf.muncul_count > 0
        GROUP BY k.nama_kategori";

echo "\n\nCategory distribution:\n";
$result2 = $conn->query($sql2);
while ($row = $result2->fetch_assoc()) {
    echo "{$row['nama_kategori']}: {$row['count']}\n";
}
