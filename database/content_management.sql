-- Content Management Database Schema
-- Created: 14 Mei 2026

-- Table: content_versions (Version control for materials)
CREATE TABLE IF NOT EXISTS content_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_type ENUM('materi', 'tips', 'soal', 'course') NOT NULL,
    content_id INT NOT NULL,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    change_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: translations (Translation management)
CREATE TABLE IF NOT EXISTS translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_type ENUM('materi', 'tips', 'soal', 'course', 'ui') NOT NULL,
    content_id INT,
    content_key VARCHAR(255) NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'id',
    translated_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_translation (content_type, content_id, content_key, language_code)
);

-- Table: supported_languages (Supported languages)
CREATE TABLE IF NOT EXISTS supported_languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language_code VARCHAR(10) UNIQUE NOT NULL,
    language_name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default languages
INSERT INTO supported_languages (language_code, language_name, native_name, is_active) VALUES
('id', 'Indonesian', 'Bahasa Indonesia', TRUE),
('en', 'English', 'English', TRUE),
('ar', 'Arabic', 'العربية', FALSE),
('zh', 'Chinese', '中文', FALSE)
ON DUPLICATE KEY UPDATE language_name=VALUES(language_name);

-- Indexes
CREATE INDEX idx_content_versions_content ON content_versions(content_type, content_id);
CREATE INDEX idx_content_versions_author ON content_versions(author_id);
CREATE INDEX idx_translations_content ON translations(content_type, content_id);
CREATE INDEX idx_translations_language ON translations(language_code);
CREATE INDEX idx_translations_key ON translations(content_key);
