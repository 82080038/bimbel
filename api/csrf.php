<?php
session_start();

function generateCsrfToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCsrfToken($token) {
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

function getCsrfToken() {
    return generateCsrfToken();
}

// Get CSRF token endpoint - only output when directly accessed
if (basename($_SERVER['PHP_SELF']) === 'csrf.php') {
    if (isset($_GET['action']) && $_GET['action'] === 'get_token') {
        header('Content-Type: application/json');
        echo json_encode(['csrf_token' => getCsrfToken()]);
    } else {
        // Return error if called without action parameter
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Invalid action. Use ?action=get_token']);
    }
}
?>
