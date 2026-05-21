<?php
// Generate password hash for 'simulasi123'
$hash = password_hash('simulasi123', PASSWORD_DEFAULT);
echo "Password hash for 'simulasi123':\n";
echo $hash . "\n";
?>
