<?php
/**
 * Add materi for Post-SMA categories (SNBT, TNI, Polri, BUMN)
 */

require_once __DIR__ . '/../config.php';

$conn = new mysqli('127.0.0.1', DB_USER, DB_PASS, DB_NAME, 3306);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== ADDING POST-SMA MATERI ===\n\n";

$materiData = [
    // SNBT TPS
    [
        'judul' => 'Penalaran Umum SNBT',
        'deskripsi' => 'Materi penalaran umum untuk Tes Potensi Skolastik',
        'kategori_id' => 16,
        'tipe_materi' => 'text',
        'sumber_materi' => 'local',
        'file_path' => null,
        'external_url' => null,
        'tingkat_kesulitan' => 'intermediate'
    ],
    [
        'judul' => 'Pengetahuan Kuantitatif SNBT',
        'deskripsi' => 'Materi matematika dasar untuk SNBT',
        'kategori_id' => 16,
        'tipe_materi' => 'text',
        'sumber_materi' => 'local',
        'file_path' => null,
        'external_url' => null,
        'tingkat_kesulitan' => 'intermediate'
    ],
    // TNI AKADEMIK
    [
        'judul' => 'Pengetahuan Umum TNI',
        'deskripsi' => 'Materi pengetahuan umum tentang TNI',
        'kategori_id' => 20,
        'tipe_materi' => 'text',
        'sumber_materi' => 'local',
        'file_path' => null,
        'external_url' => null,
        'tingkat_kesulitan' => 'intermediate'
    ],
    [
        'judul' => 'Matematika Dasar TNI',
        'deskripsi' => 'Materi matematika untuk tes akademik TNI',
        'kategori_id' => 20,
        'tipe_materi' => 'text',
        'sumber_materi' => 'local',
        'file_path' => null,
        'external_url' => null,
        'tingkat_kesulitan' => 'intermediate'
    ],
    // POLRI AKADEMIK
    [
        'judul' => 'Pengetahuan Kepolisian',
        'deskripsi' => 'Materi pengetahuan tentang Polri',
        'kategori_id' => 22,
        'tipe_materi' => 'text',
        'sumber_materi' => 'local',
        'file_path' => null,
        'external_url' => null,
        'tingkat_kesulitan' => 'intermediate'
    ],
    [
        'judul' => 'Bahasa Indonesia Polri',
        'deskripsi' => 'Materi bahasa Indonesia untuk tes akademik Polri',
        'kategori_id' => 22,
        'tipe_materi' => 'text',
        'sumber_materi' => 'local',
        'file_path' => null,
        'external_url' => null,
        'tingkat_kesulitan' => 'intermediate'
    ],
    // BUMN TPA
    [
        'judul' => 'Verbal BUMN',
        'deskripsi' => 'Materi tes verbal untuk seleksi BUMN',
        'kategori_id' => 24,
        'tipe_materi' => 'text',
        'sumber_materi' => 'local',
        'file_path' => null,
        'external_url' => null,
        'tingkat_kesulitan' => 'intermediate'
    ],
    [
        'judul' => 'Numerik BUMN',
        'deskripsi' => 'Materi tes numerik untuk seleksi BUMN',
        'kategori_id' => 24,
        'tipe_materi' => 'text',
        'sumber_materi' => 'local',
        'file_path' => null,
        'external_url' => null,
        'tingkat_kesulitan' => 'intermediate'
    ]
];

$added = 0;

foreach ($materiData as $materi) {
    $sql = "INSERT INTO materi (judul, deskripsi, kategori_id, tipe_materi, sumber_materi, file_path, external_url, tingkat_kesulitan, is_active, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssssssss', 
        $materi['judul'],
        $materi['deskripsi'],
        $materi['kategori_id'],
        $materi['tipe_materi'],
        $materi['sumber_materi'],
        $materi['file_path'],
        $materi['external_url'],
        $materi['tingkat_kesulitan']
    );
    
    if ($stmt->execute()) {
        echo "✅ Added: {$materi['judul']}\n";
        $added++;
    } else {
        echo "❌ Failed: {$materi['judul']} - {$stmt->error}\n";
    }
}

echo "\n=== COMPLETE ===\n";
echo "Total materi added: {$added}\n";

$conn->close();
?>
