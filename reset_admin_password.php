<?php
/**
 * Reset Admin Password for Testing
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

$newPassword = 'admin123'; // Test password

echo "<h1>Reset Admin Password</h1>";
echo "<hr>";

if (!isset($conn) || $conn->connect_error) {
    die("Database connection failed");
}

// Update admin password
$username = 'admin';
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

$sql = "UPDATE users SET password = ? WHERE username = 'admin' AND role = 'admin'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $hashedPassword);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo "<p style='color: green;'>✅ Admin password updated successfully!</p>";
        echo "<p><strong>Username:</strong> admin</p>";
        echo "<p><strong>New Password:</strong> $newPassword</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ No admin user found to update</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Failed to update password: " . $conn->error . "</p>";
}

$stmt->close();
$conn->close();

echo "<hr>";
echo "<p><a href='login.html'>← Go to Login</a></p>";
?>
