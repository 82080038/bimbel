-- Update testuser password to known hash for 'test123'
-- This hash is generated using password_hash('test123', PASSWORD_DEFAULT)

UPDATE users 
SET password = '$2y$10$Xj6rPl4Ts9Vm7ApXcwxbGuCF0QyYQ.JvFjIgD2oPLOvPahVwuQDpm'
WHERE username = 'testuser';

-- Verify update
SELECT username, LEFT(password, 20) as password_hash FROM users WHERE username = 'testuser';
