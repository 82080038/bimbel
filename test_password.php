<?php
require_once __DIR__ . '/config.php';

$username = 'testuser';
$password = 'test123';

// Get current user from database
$sql = "SELECT id, username, password FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    echo "User found: " . $user['username'] . "\n";
    echo "Current hash: " . $user['password'] . "\n";
    echo "Password verify result: " . (password_verify($password, $user['password']) ? 'true' : 'false') . "\n";
    
    // Generate new hash
    $new_hash = password_hash($password, PASSWORD_DEFAULT);
    echo "New hash: " . $new_hash . "\n";
    echo "New hash verify: " . (password_verify($password, $new_hash) ? 'true' : 'false') . "\n";
    
    // Update with new hash
    $sql_update = "UPDATE users SET password = ? WHERE username = ?";
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param("ss", $new_hash, $username);
    if ($stmt_update->execute()) {
        echo "Password updated successfully\n";
    }
} else {
    echo "User not found\n";
}

$stmt->close();
$conn->close();
?>
