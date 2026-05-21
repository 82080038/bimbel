-- Create test users for quick login buttons in login.html
-- These users are used for development testing
-- Password: simulasi123

-- User 1 (TWK)
INSERT INTO `users` (`username`, `password`, `role`, `nama_lengkap`, `nomor_hp`, `jenis_kelamin`, `tahun_tamat`, `asal_sekolah`) 
VALUES ('fresh_user_11778919457', '$2y$10$trI7atMXavi/iZXP4/ShPuV7gjzcgHaMHFqHAy9Z3PGlNNImVoxEC', 'user', 'Test User 1', '08123456789', 'L', 2024, 'SMA Test')
ON DUPLICATE KEY UPDATE 
  `password` = '$2y$10$trI7atMXavi/iZXP4/ShPuV7gjzcgHaMHFqHAy9Z3PGlNNImVoxEC',
  `nama_lengkap` = 'Test User 1',
  `nomor_hp` = '08123456789',
  `jenis_kelamin` = 'L',
  `tahun_tamat` = 2024,
  `asal_sekolah` = 'SMA Test';

-- User 2 (TIU)
INSERT INTO `users` (`username`, `password`, `role`, `nama_lengkap`, `nomor_hp`, `jenis_kelamin`, `tahun_tamat`, `asal_sekolah`) 
VALUES ('fresh_user_21778919457', '$2y$10$trI7atMXavi/iZXP4/ShPuV7gjzcgHaMHFqHAy9Z3PGlNNImVoxEC', 'user', 'Test User 2', '08123456789', 'L', 2024, 'SMA Test')
ON DUPLICATE KEY UPDATE 
  `password` = '$2y$10$trI7atMXavi/iZXP4/ShPuV7gjzcgHaMHFqHAy9Z3PGlNNImVoxEC',
  `nama_lengkap` = 'Test User 2',
  `nomor_hp` = '08123456789',
  `jenis_kelamin` = 'L',
  `tahun_tamat` = 2024,
  `asal_sekolah` = 'SMA Test';
