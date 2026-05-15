-- Create test user for comprehensive testing
-- Username: testuser
-- Password: test123

INSERT INTO `users` (`username`, `password`, `role`, `nama_lengkap`, `nomor_hp`, `jenis_kelamin`, `tahun_tamat`, `asal_sekolah`) 
VALUES ('testuser', '$2y$10$Xj6rPl4Ts9Vm7ApXcwxbGuCF0QyYQ.JvFjIgD2oPLOvPahVwuQDpm', 'user', 'Test User', '08123456789', 'L', 2024, 'SMA Test')
ON DUPLICATE KEY UPDATE 
  `nama_lengkap` = 'Test User',
  `nomor_hp` = '08123456789',
  `jenis_kelamin` = 'L',
  `tahun_tamat` = 2024,
  `asal_sekolah` = 'SMA Test';
