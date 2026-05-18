<?php
require_once __DIR__ . '/../config.php';

$username = 'testuser';
$password = 'test123';

// Hash the password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Update the user
$sql = "UPDATE users SET password = ? WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $hashed_password, $username);

if ($stmt->execute()) {
    echo "Password updated successfully for user: $username\n";
    echo "New password hash: $hashed_password\n";
} else {
    echo "Error updating password: " . $conn->error . "\n";
}

$stmt->close();
$conn->close();
?>
