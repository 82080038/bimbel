<?php
/**
 * Check registered users in database
 * Displays last 10 registered users
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>";
echo "<html><head><title>Database Users Check</title>";
echo "<style>";
echo "body { font-family: Arial, sans-serif; margin: 20px; }";
echo "table { border-collapse: collapse; width: 100%; margin-top: 20px; }";
echo "th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }";
echo "th { background-color: #4CAF50; color: white; }";
echo "tr:nth-child(even) { background-color: #f2f2f2; }";
echo ".success { color: green; font-weight: bold; }";
echo ".error { color: red; font-weight: bold; }";
echo "</style></head><body>";

echo "<h1>📊 Database Users Check</h1>";
echo "<hr>";

// Check connection
if (!isset($conn) || $conn->connect_error) {
    echo "<p class='error'>❌ Database connection failed: " . htmlspecialchars($conn->connect_error) . "</p>";
    echo "</body></html>";
    exit;
}

echo "<p class='success'>✅ Database connected successfully</p>";

// Get last 10 users
$sql = "SELECT id, username, nama_lengkap, nomor_hp, jenis_kelamin, tahun_tamat, asal_sekolah, role, created_at 
        FROM users 
        ORDER BY id DESC 
        LIMIT 10";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "<h2>Last 10 Registered Users</h2>";
    echo "<table>";
    echo "<tr>";
    echo "<th>ID</th>";
    echo "<th>Username</th>";
    echo "<th>Nama Lengkap</th>";
    echo "<th>Nomor HP</th>";
    echo "<th>Jenis Kelamin</th>";
    echo "<th>Tahun Tamat</th>";
    echo "<th>Asal Sekolah</th>";
    echo "<th>Role</th>";
    echo "<th>Created At</th>";
    echo "</tr>";
    
    $count = 0;
    while ($row = $result->fetch_assoc()) {
        $count++;
        echo "<tr>";
        echo "<td>" . htmlspecialchars($row['id']) . "</td>";
        echo "<td>" . htmlspecialchars($row['username']) . "</td>";
        echo "<td>" . htmlspecialchars($row['nama_lengkap']) . "</td>";
        echo "<td>" . htmlspecialchars($row['nomor_hp']) . "</td>";
        echo "<td>" . ($row['jenis_kelamin'] == 'L' ? 'Laki-laki' : 'Perempuan') . "</td>";
        echo "<td>" . htmlspecialchars($row['tahun_tamat']) . "</td>";
        echo "<td>" . htmlspecialchars($row['asal_sekolah']) . "</td>";
        echo "<td>" . htmlspecialchars($row['role']) . "</td>";
        echo "<td>" . htmlspecialchars($row['created_at']) . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    echo "<p><strong>Total users found: $count</strong></p>";
    
    // Summary statistics
    echo "<h2>📈 Summary Statistics</h2>";
    
    $stats = $conn->query("SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
        SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as female_count
        FROM users");
    
    if ($stats && $stat = $stats->fetch_assoc()) {
        echo "<table>";
        echo "<tr><th>Metric</th><th>Value</th></tr>";
        echo "<tr><td>Total Users</td><td>" . $stat['total'] . "</td></tr>";
        echo "<tr><td>Admins</td><td>" . $stat['admin_count'] . "</td></tr>";
        echo "<tr><td>Regular Users</td><td>" . $stat['user_count'] . "</td></tr>";
        echo "<tr><td>Male</td><td>" . $stat['male_count'] . "</td></tr>";
        echo "<tr><td>Female</td><td>" . $stat['female_count'] . "</td></tr>";
        echo "</table>";
    }
    
} else {
    echo "<p class='error'>❌ No users found in database</p>";
}

$conn->close();

echo "<hr>";
echo "<p><a href='register.html'>← Back to Registration</a></p>";
echo "</body></html>";
?>
