-- Updated Schema for sesi_ujian and hasil_ujian tables
-- This file contains the corrected CREATE TABLE statements after the refactor
-- Date: 2026-05-21
-- Changes:
--   - Dropped nama_peserta column from both tables (redundant with user_id/users.nama_lengkap)
--   - Added nilai_tpa and nilai_psikologis to hasil_ujian

USE ujian_sekolah_kedinasan;

-- Updated sesi_ujian table (nama_peserta removed)
CREATE TABLE IF NOT EXISTS `sesi_ujian` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `waktu_mulai` datetime DEFAULT current_timestamp(),
  `waktu_selesai` datetime DEFAULT NULL,
  `durasi_menit` int(11) NOT NULL,
  `soal_teracak` text DEFAULT NULL,
  `jawaban_sementara` text DEFAULT NULL,
  `status` enum('berjalan','selesai','timeout') DEFAULT 'berjalan',
  `ability_estimate` decimal(10,4) DEFAULT 0.0000 COMMENT 'estimated ability level',
  `ability_history` text DEFAULT NULL COMMENT 'JSON array of ability estimates during exam',
  `confidence_level` decimal(5,4) DEFAULT 0.0000 COMMENT 'confidence in ability estimate',
  `cat_enabled` tinyint(1) DEFAULT 0 COMMENT 'whether CAT is enabled for this session',
  PRIMARY KEY (`id`),
  KEY `idx_sesi_user` (`user_id`),
  KEY `idx_sesi_status` (`status`),
  CONSTRAINT `fk_sesi_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Exam sessions - nama_peserta column removed, uses user_id instead';

-- Updated hasil_ujian table (nama_peserta removed, nilai_tpa/psikologis added)
CREATE TABLE IF NOT EXISTS `hasil_ujian` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `exam_type_id` int(11) DEFAULT NULL,
  `paket_id` int(11) DEFAULT NULL,
  `tanggal_ujian` datetime DEFAULT current_timestamp(),
  `durasi_menit` int(11) NOT NULL,
  `nilai_twk` int(11) DEFAULT 0,
  `nilai_tiu` int(11) DEFAULT 0,
  `nilai_tkp` int(11) DEFAULT 0,
  `nilai_tpa` int(11) DEFAULT 0,
  `nilai_psikologis` int(11) DEFAULT 0,
  `nilai_total` int(11) DEFAULT 0,
  `status_lulus` varchar(20) DEFAULT 'TIDAK LULUS',
  `jawaban_peserta` text DEFAULT NULL,
  `verification_code` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `verification_code` (`verification_code`),
  KEY `idx_hasil_user` (`user_id`),
  KEY `idx_hasil_tanggal` (`tanggal_ujian`),
  KEY `idx_hasil_exam_type` (`exam_type_id`),
  CONSTRAINT `fk_hasil_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Exam results - nama_peserta removed, TPA/PSIKOLOGIS columns added';
