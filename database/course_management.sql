-- Course Management & Learning Paths Database Schema
-- Created: 14 Mei 2026

-- Table: courses
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    kategori VARCHAR(100),
    tags VARCHAR(500),
    urutan INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: course_modules
CREATE TABLE IF NOT EXISTS course_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    urutan INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Table: course_materials
CREATE TABLE IF NOT EXISTS course_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    konten TEXT,
    tipe ENUM('teks', 'video', 'pdf', 'audio', 'quiz') DEFAULT 'teks',
    file_path VARCHAR(500),
    urutan INT DEFAULT 0,
    soal_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE SET NULL
);

-- Table: course_prerequisites
CREATE TABLE IF NOT EXISTS course_prerequisites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    prerequisite_course_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_prereq (course_id, prerequisite_course_id)
);

-- Table: user_course_progress
CREATE TABLE IF NOT EXISTS user_course_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percent DECIMAL(5,2) DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course (user_id, course_id)
);

-- Table: user_module_progress
CREATE TABLE IF NOT EXISTS user_module_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percent DECIMAL(5,2) DEFAULT 0,
    completed_at DATETIME,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (user_id, module_id)
);

-- Table: user_material_progress
CREATE TABLE IF NOT EXISTS user_material_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    material_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    completed_at DATETIME,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES course_materials(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_material (user_id, material_id)
);

-- Table: learning_paths
CREATE TABLE IF NOT EXISTS learning_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    min_score_twk DECIMAL(5,2),
    min_score_tiu DECIMAL(5,2),
    min_score_tkp DECIMAL(5,2),
    min_score_tpa DECIMAL(5,2),
    min_score_psikologis DECIMAL(5,2),
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: learning_path_courses
CREATE TABLE IF NOT EXISTS learning_path_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    learning_path_id INT NOT NULL,
    course_id INT NOT NULL,
    urutan INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_path_course (learning_path_id, course_id)
);

-- Table: user_learning_paths
CREATE TABLE IF NOT EXISTS user_learning_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    learning_path_id INT NOT NULL,
    status ENUM('assigned', 'in_progress', 'completed') DEFAULT 'assigned',
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_path (user_id, learning_path_id)
);

-- Indexes for better performance
CREATE INDEX idx_courses_kategori ON courses(kategori);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_materials_module ON course_materials(module_id);
CREATE INDEX idx_user_course_progress_user ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_status ON user_course_progress(status);
CREATE INDEX idx_learning_paths_min_scores ON learning_paths(min_score_twk, min_score_tiu, min_score_tkp);
