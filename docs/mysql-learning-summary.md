# MySQL/MariaDB Learning Summary

## Overview
MySQL and MariaDB are popular open-source relational database management systems. The Aplikasi Ujian Sekolah Kedinasan uses MySQL 5.7+ / MariaDB 10.3+ with 57 tables and 4 views.

## MySQL vs MariaDB

**MariaDB** is a fork of MySQL created by the original MySQL developers. It aims to be a drop-in replacement for MySQL with additional features and better performance.

**Key Differences:**
- MariaDB has more storage engines
- Better performance optimization
- More frequent releases
- GPL license (no proprietary extensions)
- Compatible with MySQL (mostly)

## Database Basics

### 1. Create Database

```sql
CREATE DATABASE ujian_sekolah_kedinasan 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ujian_sekolah_kedinasan;
```

### 2. Create Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'guest') DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Data Types

**Numeric:**
- `TINYINT` - 1 byte (-128 to 127)
- `SMALLINT` - 2 bytes (-32768 to 32767)
- `MEDIUMINT` - 3 bytes
- `INT` - 4 bytes (-2147483648 to 2147483647)
- `BIGINT` - 8 bytes
- `FLOAT` - Floating point number
- `DOUBLE` - Double precision floating point
- `DECIMAL(p, s)` - Fixed-point number

**String:**
- `CHAR(n)` - Fixed-length string (max 255)
- `VARCHAR(n)` - Variable-length string (max 65535)
- `TEXT` - Variable-length string (max 65535)
- `MEDIUMTEXT` - Variable-length string (max 16MB)
- `LONGTEXT` - Variable-length string (max 4GB)
- `ENUM('a', 'b', 'c')` - Enumeration

**Date/Time:**
- `DATE` - YYYY-MM-DD
- `TIME` - HH:MM:SS
- `DATETIME` - YYYY-MM-DD HH:MM:SS
- `TIMESTAMP` - YYYY-MM-DD HH:MM:SS (UTC)
- `YEAR` - YYYY

**Binary:**
- `BLOB` - Binary large object
- `TINYBLOB`, `MEDIUMBLOB`, `LONGBLOB`

**Boolean:**
- `BOOLEAN` / `BOOL` - TRUE/FALSE (stored as TINYINT)

**JSON:**
- `JSON` - JSON data type (MySQL 5.7+)

### 4. Constraints

**Primary Key:**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- or
    id INT,
    PRIMARY KEY (id)
);
```

**Foreign Key:**
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

**Unique:**
```sql
CREATE TABLE users (
    email VARCHAR(100) UNIQUE,
    -- or
    UNIQUE KEY idx_email (email)
);
```

**Not Null:**
```sql
CREATE TABLE users (
    username VARCHAR(50) NOT NULL
);
```

**Default:**
```sql
CREATE TABLE users (
    role ENUM('admin', 'user') DEFAULT 'user'
);
```

**Check:**
```sql
CREATE TABLE products (
    price DECIMAL(10, 2) CHECK (price >= 0)
);
```

### 5. Indexes

```sql
-- Create index
CREATE INDEX idx_username ON users(username);

-- Create composite index
CREATE INDEX idx_name_email ON users(username, email);

-- Unique index
CREATE UNIQUE INDEX idx_email ON users(email);

-- Full-text index (for text search)
CREATE FULLTEXT INDEX idx_content ON articles(content);

-- Drop index
DROP INDEX idx_username ON users;

-- Show indexes
SHOW INDEX FROM users;
```

### 6. CRUD Operations

**Insert:**
```sql
-- Single row
INSERT INTO users (username, email, password_hash, role)
VALUES ('john', 'john@example.com', 'hash', 'user');

-- Multiple rows
INSERT INTO users (username, email, password_hash, role)
VALUES 
    ('john', 'john@example.com', 'hash', 'user'),
    ('jane', 'jane@example.com', 'hash', 'user');

-- With ON DUPLICATE KEY UPDATE
INSERT INTO users (username, email, password_hash, role)
VALUES ('john', 'john@example.com', 'hash', 'user')
ON DUPLICATE KEY UPDATE 
    email = VALUES(email),
    password_hash = VALUES(password_hash);
```

**Select:**
```sql
-- All columns
SELECT * FROM users;

-- Specific columns
SELECT id, username, email FROM users;

-- With WHERE
SELECT * FROM users WHERE role = 'admin';

-- With ORDER BY
SELECT * FROM users ORDER BY created_at DESC;

-- With LIMIT
SELECT * FROM users LIMIT 10;

-- With OFFSET
SELECT * FROM users LIMIT 10 OFFSET 20;

-- With JOIN
SELECT u.username, o.order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN
SELECT u.username, o.order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- With GROUP BY
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- With HAVING
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
HAVING COUNT(*) > 5;

-- With subquery
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);
```

**Update:**
```sql
-- Single column
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- Multiple columns
UPDATE users 
SET email = 'newemail@example.com', role = 'admin' 
WHERE id = 1;

-- With conditions
UPDATE users 
SET last_login = NOW() 
WHERE username = 'john';
```

**Delete:**
```sql
-- Specific row
DELETE FROM users WHERE id = 1;

-- With conditions
DELETE FROM users WHERE role = 'guest';

-- All rows (use with caution)
DELETE FROM users;

-- Truncate (faster, resets auto-increment)
TRUNCATE TABLE users;
```

### 7. Joins

**INNER JOIN:**
```sql
SELECT u.username, o.order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
-- Returns only matching rows
```

**LEFT JOIN:**
```sql
SELECT u.username, o.order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- Returns all users, orders where available
```

**RIGHT JOIN:**
```sql
SELECT u.username, o.order_date
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
-- Returns all orders, users where available
```

**FULL OUTER JOIN:**
```sql
SELECT u.username, o.order_date
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;
-- Returns all users and orders
```

**SELF JOIN:**
```sql
SELECT e1.username as employee, e2.username as manager
FROM users e1
INNER JOIN users e2 ON e1.manager_id = e2.id;
```

### 8. Aggregate Functions

```sql
-- COUNT
SELECT COUNT(*) FROM users;
SELECT COUNT(DISTINCT role) FROM users;

-- SUM
SELECT SUM(total) FROM orders;

-- AVG
SELECT AVG(total) FROM orders;

-- MIN/MAX
SELECT MIN(created_at), MAX(created_at) FROM orders;

-- GROUP BY
SELECT role, COUNT(*) as count, AVG(total) as avg_total
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY role;
```

### 9. Advanced Queries

**UNION:**
```sql
SELECT username FROM admin_users
UNION
SELECT username FROM regular_users;

-- UNION ALL (includes duplicates)
SELECT username FROM admin_users
UNION ALL
SELECT username FROM regular_users;
```

**Subqueries:**
```sql
-- Scalar subquery
SELECT * FROM users 
WHERE id = (SELECT user_id FROM orders WHERE total = (SELECT MAX(total) FROM orders));

-- EXISTS
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- IN
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);
```

**Window Functions (MySQL 8.0+):**
```sql
-- ROW_NUMBER
SELECT 
    username,
    total,
    ROW_NUMBER() OVER (ORDER BY total DESC) as rank
FROM orders;

-- RANK
SELECT 
    username,
    total,
    RANK() OVER (ORDER BY total DESC) as rank
FROM orders;

-- SUM OVER
SELECT 
    username,
    order_date,
    total,
    SUM(total) OVER (PARTITION BY username ORDER BY order_date) as running_total
FROM orders;
```

**CTE (Common Table Expression - MySQL 8.0+):**
```sql
WITH user_stats AS (
    SELECT 
        user_id,
        COUNT(*) as order_count,
        SUM(total) as total_spent
    FROM orders
    GROUP BY user_id
)
SELECT u.username, us.order_count, us.total_spent
FROM user_stats us
JOIN users u ON us.user_id = u.id;
```

### 10. Views

```sql
-- Create view
CREATE VIEW user_orders_view AS
SELECT u.id, u.username, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- Use view
SELECT * FROM user_orders_view WHERE order_count > 5;

-- Drop view
DROP VIEW user_orders_view;

-- Alter view
CREATE OR REPLACE VIEW user_orders_view AS
SELECT u.id, u.username, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

### 11. Stored Procedures

```sql
DELIMITER //

CREATE PROCEDURE GetUserOrders(IN userId INT)
BEGIN
    SELECT * FROM orders WHERE user_id = userId;
END //

DELIMITER ;

-- Call procedure
CALL GetUserOrders(1);

-- Drop procedure
DROP PROCEDURE GetUserOrders;
```

### 12. Transactions

```sql
START TRANSACTION;

INSERT INTO orders (user_id, total) VALUES (1, 100);
INSERT INTO order_items (order_id, product_id, quantity) VALUES (LAST_INSERT_ID(), 1, 2);

COMMIT;
-- or ROLLBACK;
```

### 13. Database Administration

**Backup:**
```bash
# Command line
mysqldump -u root -p ujian_sekolah_kedinasan > backup.sql

# Specific table
mysqldump -u root -p ujian_sekolah_kedinasan users > users_backup.sql
```

**Restore:**
```bash
mysql -u root -p ujian_sekolah_kedinasan < backup.sql
```

**User Management:**
```sql
-- Create user
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'password';

-- Grant privileges
GRANT ALL PRIVILEGES ON ujian_sekolah_kedinasan.* TO 'appuser'@'localhost';

-- Revoke privileges
REVOKE ALL PRIVILEGES ON ujian_sekolah_kedinasan.* FROM 'appuser'@'localhost';

-- Drop user
DROP USER 'appuser'@'localhost';

-- Show users
SELECT user, host FROM mysql.user;
```

**Database Information:**
```sql
-- Show databases
SHOW DATABASES;

-- Show tables
SHOW TABLES;

-- Describe table
DESCRIBE users;
-- or
SHOW COLUMNS FROM users;

-- Show indexes
SHOW INDEX FROM users;

-- Show table status
SHOW TABLE STATUS;

-- Show process list
SHOW PROCESSLIST;

-- Kill process
KILL process_id;
```

### 14. Performance Optimization

**EXPLAIN:**
```sql
EXPLAIN SELECT * FROM users WHERE username = 'john';
```

**Slow Query Log:**
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow query log status
SHOW VARIABLES LIKE 'slow_query_log';
```

**Query Optimization:**
- Use indexes on frequently queried columns
- Avoid SELECT * when not needed
- Use LIMIT for large result sets
- Use appropriate data types
- Normalize data to reduce redundancy
- Use EXPLAIN to analyze queries
- Optimize JOINs
- Use subqueries wisely

### 15. Security

**SQL Injection Prevention:**
- Always use prepared statements in PHP
- Validate user input
- Use parameterized queries
- Sanitize data

**Access Control:**
- Use principle of least privilege
- Create separate users for different applications
- Grant only necessary permissions
- Use strong passwords
- Regularly rotate passwords

**Data Encryption:**
- Use SSL/TLS for connections
- Encrypt sensitive data at rest
- Use proper hashing for passwords (bcrypt, Argon2)

## MySQL in Aplikasi Ujian Sekolah Kedinasan

### Database Schema:
- **57 tables** including:
  - `users` - User accounts
  - `questions` - Question bank
  - `categories` - Question categories
  - `exams` - Exam definitions
  - `exam_sessions` - Active exam sessions
  - `exam_results` - Exam results
  - `courses` - Course management
  - `modules` - Course modules
  - `gamification_xp` - Experience points
  - `gamification_badges` - Badges
  - `notifications` - User notifications
  - `analytics_*` - Analytics tables
  - And many more...

### Current Usage:
- MySQL 5.7+ / MariaDB 10.3+
- InnoDB engine for transaction support
- UTF-8MB4 charset for full Unicode support
- Foreign key constraints for data integrity
- Indexes for performance optimization
- Views for complex queries

### Connection Configuration:
```php
// config.php
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'ujian_sekolah_kedinasan');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_CHARSET', 'utf8mb4');
```

## Resources

**Official Documentation:**
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MariaDB Documentation](https://mariadb.com/kb/en/documentation/)
- [MySQL Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)

**Learning Resources:**
- [MySQL Tutorial - W3Schools](https://www.w3schools.com/mysql/)
- [SQL Tutorial - SQLZoo](https://sqlzoo.net/)
- [MySQL Performance Blog](https://www.percona.com/blog/)

**Tools:**
- [MySQL Workbench](https://www.mysql.com/products/workbench/)
- [phpMyAdmin](https://www.phpmyadmin.net/)
- [DBeaver](https://dbeaver.io/)
- [HeidiSQL](https://www.heidisql.com/)
