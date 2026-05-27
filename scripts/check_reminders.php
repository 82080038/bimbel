<?php
// Check and send pending exam reminders
// This script should be run periodically (e.g., via cron job)
// Run: php scripts/check_reminders.php

require_once '../config.php';

checkDatabaseConnection();

echo "Checking for pending exam reminders...\n";

// Call the notifications API to check pending reminders
$notification_url = dirname($_SERVER['PHP_SELF']) . '/api/notifications.php';

$ch = curl_init($notification_url . '?action=check_pending_reminders');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if ($result && $result['success']) {
    echo "✅ Reminders sent: " . $result['sent'] . "\n";
} else {
    echo "❌ Failed to check reminders\n";
}

echo "Reminder check completed.\n";
?>
