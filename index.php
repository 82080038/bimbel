<?php
/**
 * Root Redirector with Session & RBAC Check
 * Redirects users based on authentication status and role
 */

// Load database configuration first (if not already loaded)
require_once __DIR__ . '/config.php';

// Load application configuration
require_once __DIR__ . '/config/app.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication and role
$isLoggedIn = isset($_SESSION['user_id']);
$userRole = isset($_SESSION['role']) ? $_SESSION['role'] : 'guest';

// Redirect based on authentication status and role
if (!$isLoggedIn) {
    // Guest -> login
    header('Location: login.html');
    exit;
} elseif ($userRole === 'admin') {
    // Admin -> admin panel
    header('Location: admin/admin.html');
    exit;
} else {
    // User -> dashboard
    header('Location: participant/dashboard.html');
    exit;
}
