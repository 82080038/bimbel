# PHP 8.0+ Learning Summary

## Overview
PHP 8.0+ is the latest major version of PHP, introducing significant performance improvements, new features, and language enhancements. This document covers PHP 8.0+ features relevant to the Aplikasi Ujian Sekolah Kedinasan application.

## Key Features in PHP 8.0+

### 1. JIT (Just-In-Time) Compiler
PHP 8.0 introduces JIT compilation which can significantly improve performance for CPU-intensive tasks.

**Benefits:**
- Improved performance for numerical calculations
- Better performance for long-running scripts
- Minimal impact on typical web applications (most benefit from existing opcache)

### 2. Union Types
Union types allow declaring multiple types for a parameter, property, or return value.

```php
// Before PHP 8.0
/**
 * @param int|float $number
 * @return int|float
 */
function calculate($number) {
    return $number * 2;
}

// PHP 8.0+
function calculate(int|float $number): int|float {
    return $number * 2;
}
```

### 3. Named Arguments
Named arguments allow passing arguments to functions based on parameter names, skipping optional parameters.

```php
// Before PHP 8.0
htmlspecialchars($string, ENT_COMPAT | ENT_HTML401, 'UTF-8', false);

// PHP 8.0+
htmlspecialchars($string, double_encode: false);
```

### 4. Nullsafe Operator
The nullsafe operator `?->` provides safe method/property chaining.

```php
// Before PHP 8.0
$country = null;
if ($session !== null) {
    $user = $session->user;
    if ($user !== null) {
        $address = $user->address;
        if ($address !== null) {
            $country = $address->country;
        }
    }
}

// PHP 8.0+
$country = $session?->user?->address?->country;
```

### 5. Match Expression
Match expression is a more powerful and flexible alternative to switch statement.

```php
// Before PHP 8.0
switch ($status) {
    case 'pending':
        $message = 'Pending';
        break;
    case 'approved':
        $message = 'Approved';
        break;
    case 'rejected':
        $message = 'Rejected';
        break;
    default:
        $message = 'Unknown';
}

// PHP 8.0+
$message = match ($status) {
    'pending' => 'Pending',
    'approved' => 'Approved',
    'rejected' => 'Rejected',
    default => 'Unknown',
};
```

### 6. Constructor Property Promotion
Constructor property promotion reduces boilerplate code by declaring properties directly in constructor parameters.

```php
// Before PHP 8.0
class User {
    public string $name;
    public int $age;
    
    public function __construct(string $name, int $age) {
        $this->name = $name;
        $this->age = $age;
    }
}

// PHP 8.0+
class User {
    public function __construct(
        public string $name,
        public int $age
    ) {}
}
```

### 7. Attributes
Attributes (annotations) provide metadata for classes, methods, properties, etc.

```php
#[Route("/api/users", methods: ["GET"])]
class UserController {
    #[Authorize]
    public function index() {
        // ...
    }
}
```

### 8. Weak Maps
Weak Maps allow creating maps with object keys that don't prevent garbage collection.

```php
$map = new WeakMap();
$obj = new stdClass();
$map[$obj] = 'data';
// When $obj is no longer referenced, the entry is automatically removed
```

### 9. String and Number Comparison Improvements
PHP 8.0 makes comparisons between numbers and strings more consistent.

```php
// Before PHP 8.0
0 == 'foobar' // true (loose comparison)

// PHP 8.0
0 == 'foobar' // false
```

### 10. Mixed Type
The `mixed` type represents any type.

```php
function process(mixed $value): mixed {
    // ...
}
```

## PHP 8.1+ Features

### 1. Readonly Properties
Properties can be declared as readonly to prevent modification after initialization.

```php
class User {
    public readonly string $name;
    
    public function __construct(string $name) {
        $this->name = $name;
    }
}
```

### 2. First-Class Callable Syntax
First-class callables allow referencing functions and methods as callables.

```php
$callback = strlen(...);
$callback('hello'); // 5
```

### 3. Never Return Type
The `never` type indicates a function never returns (always throws or exits).

```php
function redirect(string $url): never {
    header("Location: $url");
    exit();
}
```

### 4. Fibers (Coroutines)
Fibers allow lightweight concurrency.

```php
$fiber = new Fiber(function(): void {
    Fiber::suspend('First');
    Fiber::suspend('Second');
});

$fiber->start(); // 'First'
$fiber->resume(); // 'Second'
```

## PHP 8.2+ Features

### 1. Disjunctive Normal Form (DNF) Types
DNF types allow combining union and intersection types.

```php
function process((A&B)|C $value): (X&Y)|Z {
    // ...
}
```

### 2. Readonly Classes
Classes can be declared as readonly to make all properties readonly.

```php
readonly class User {
    public string $name;
    public int $age;
}
```

### 3. Random Extension
New random number generator extension with better performance and security.

```php
$randomizer = new \Random\Randomizer();
$random = $randomizer->getInt(1, 100);
```

## PHP 8.3+ Features

### 1. Typed Class Constants
Class constants can have types.

```php
class User {
    public const int MAX_LOGIN_ATTEMPTS = 5;
    public readonly string STATUS_ACTIVE = 'active';
}
```

### 2. Override Attribute
The `#[Override]` attribute indicates a method overrides a parent method.

```php
class Child extends Parent {
    #[Override]
    public function method(): void {
        // ...
    }
}
```

## Database Connectivity (PDO)

### PDO Basics
PHP Data Objects (PDO) provides a consistent interface for database access.

```php
// Connection
$pdo = new PDO(
    'mysql:host=127.0.0.1;dbname=ujian_sekolah_kedinasan;charset=utf8mb4',
    'root',
    'root',
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
);

// Prepared Statements (SQL Injection Prevention)
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => $userId]);
$user = $stmt->fetch();

// Insert
$stmt = $pdo->prepare('INSERT INTO users (username, email) VALUES (:username, :email)');
$stmt->execute(['username' => $username, 'email' => $email]);

// Update
$stmt = $pdo->prepare('UPDATE users SET email = :email WHERE id = :id');
$stmt->execute(['email' => $newEmail, 'id' => $userId]);

// Delete
$stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
$stmt->execute(['id' => $userId]);

// Transactions
try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare('INSERT INTO orders (user_id, total) VALUES (:user_id, :total)');
    $stmt->execute(['user_id' => $userId, 'total' => $total]);
    
    $orderId = $pdo->lastInsertId();
    
    $stmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity) VALUES (:order_id, :product_id, :quantity)');
    foreach ($items as $item) {
        $stmt->execute(['order_id' => $orderId, 'product_id' => $item['id'], 'quantity' => $item['quantity']]);
    }
    
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    throw $e;
}
```

## REST API Implementation

### JSON Response
```php
header('Content-Type: application/json');

$response = [
    'success' => true,
    'data' => $data,
    'message' => 'Success'
];

echo json_encode($response, JSON_PRETTY_PRINT);
```

### Request Handling
```php
// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Get query parameters
$page = $_GET['page'] ?? 1;
$limit = $_GET['limit'] ?? 10;

// Get headers
$authToken = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
```

### Error Handling
```php
try {
    // Database operations
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
    exit;
}
```

## Session Management

### Basic Session
```php
session_start();

// Set session data
$_SESSION['user_id'] = $userId;
$_SESSION['user_role'] = 'admin';

// Get session data
$userId = $_SESSION['user_id'] ?? null;

// Destroy session
session_destroy();
unset($_SESSION);
```

### Secure Session
```php
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_strict_mode', 1);
session_start();
```

## Security Best Practices

### 1. SQL Injection Prevention
Always use prepared statements with PDO.

```php
// BAD (vulnerable to SQL injection)
$sql = "SELECT * FROM users WHERE id = " . $_GET['id'];

// GOOD (prepared statement)
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => $_GET['id']]);
```

### 2. XSS Prevention
Escape output when displaying user input.

```php
// BAD (vulnerable to XSS)
echo $_POST['username'];

// GOOD (escaped)
echo htmlspecialchars($_POST['username'], ENT_QUOTES, 'UTF-8');
```

### 3. CSRF Protection
Implement CSRF tokens for state-changing operations.

```php
// Generate token
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

// Validate token
if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    die('CSRF token validation failed');
}
```

### 4. Password Hashing
Use password_hash() and password_verify().

```php
// Hash password
$password = password_hash($plainPassword, PASSWORD_DEFAULT);

// Verify password
if (password_verify($plainPassword, $hashedPassword)) {
    // Valid password
}
```

### 5. Input Validation
Validate and sanitize all user input.

```php
// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die('Invalid email');
}

// Sanitize input
$username = filter_var($_POST['username'], FILTER_SANITIZE_STRING);
```

### 6. File Upload Security
```php
// Validate file type
$allowedTypes = ['image/jpeg', 'image/png'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($_FILES['file']['tmp_name']);

if (!in_array($mimeType, $allowedTypes)) {
    die('Invalid file type');
}

// Generate safe filename
$extension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
$filename = uniqid() . '.' . $extension;
```

## OOP in PHP

### Class Definition
```php
class User {
    private string $id;
    private string $username;
    private string $email;
    
    public function __construct(string $id, string $username, string $email) {
        $this->id = $id;
        $this->username = $username;
        $this->email = $email;
    }
    
    public function getUsername(): string {
        return $this->username;
    }
    
    public function setEmail(string $email): void {
        $this->email = $email;
    }
}
```

### Inheritance
```php
class AdminUser extends User {
    private array $permissions;
    
    public function __construct(string $id, string $username, string $email, array $permissions) {
        parent::__construct($id, $username, $email);
        $this->permissions = $permissions;
    }
    
    public function hasPermission(string $permission): bool {
        return in_array($permission, $this->permissions);
    }
}
```

### Interfaces
```php
interface UserRepositoryInterface {
    public function findById(string $id): ?User;
    public function save(User $user): bool;
    public function delete(string $id): bool;
}

class MySQLUserRepository implements UserRepositoryInterface {
    private PDO $pdo;
    
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }
    
    public function findById(string $id): ?User {
        // Implementation
    }
}
```

### Traits
```php
trait Timestampable {
    private DateTime $createdAt;
    private DateTime $updatedAt;
    
    public function getCreatedAt(): DateTime {
        return $this->createdAt;
    }
    
    public function setUpdatedAt(DateTime $updatedAt): void {
        $this->updatedAt = $updatedAt;
    }
}

class User {
    use Timestampable;
}
```

## Error Handling

### Try-Catch-Finally
```php
try {
    // Code that may throw an exception
    $result = riskyOperation();
} catch (SpecificException $e) {
    // Handle specific exception
    error_log($e->getMessage());
} catch (Exception $e) {
    // Handle general exception
    error_log($e->getMessage());
} finally {
    // Code that always runs
    cleanup();
}
```

### Custom Exceptions
```php
class ValidationException extends Exception {
    private array $errors;
    
    public function __construct(array $errors) {
        $this->errors = $errors;
        parent::__construct('Validation failed');
    }
    
    public function getErrors(): array {
        return $this->errors;
    }
}

throw new ValidationException(['username' => 'Username is required']);
```

## PSR-12 Coding Standards

PSR-12 is the coding standard for PHP code.

### Key Rules:
- Use 4 spaces for indentation (no tabs)
- Lines should not exceed 120 characters
- Opening braces for classes and methods on new line
- Use camelCase for method and variable names
- Use PascalCase for class names
- Use UPPER_CASE for constants
- Add proper docblocks for classes and methods

### Example:
```php
<?php

namespace App\Services;

use PDO;

/**
 * UserService handles user-related operations.
 */
class UserService
{
    private PDO $pdo;

    /**
     * Constructor.
     *
     * @param PDO $pdo Database connection
     */
    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get user by ID.
     *
     * @param string $id User ID
     * @return array|null User data or null if not found
     */
    public function getUserById(string $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);
        
        $user = $stmt->fetch();
        
        return $user ?: null;
    }
}
```

## PHP in Aplikasi Ujian Sekolah Kedinasan

### Current Usage:
- PHP 8.0+ features (union types, named arguments, match expression)
- PDO for database connectivity
- Prepared statements for SQL security
- Session management for authentication
- REST API implementation
- OOP for code organization
- PSR-12 coding standards

### API Structure:
- `api/auth.php` - Authentication
- `api/soal.php` - Question management
- `api/analytics.php` - Analytics
- `api/courses.php` - Course management
- `api/expert.php` - Expert system
- `api/gamification.php` - Gamification
- `api/notifications.php` - Notifications
- `api/rate_limiter.php` - Rate limiting
- `api/validator.php` - Input validation
- `api/pembahasan.php` - Discussion
- `api/batch_generate.php` - Batch generation
- `api/csrf.php` - CSRF protection
- `api/middleware.php` - Authentication middleware

## Resources

**Official Documentation:**
- [PHP Manual](https://www.php.net/manual/en/)
- [PHP 8.0 Migration Guide](https://www.php.net/manual/en/migration80.php)
- [PHP 8.1 Migration Guide](https://www.php.net/manual/en/migration81.php)
- [PHP 8.2 Migration Guide](https://www.php.net/manual/en/migration82.php)
- [PHP 8.3 Migration Guide](https://www.php.net/manual/en/migration83.php)

**Learning Resources:**
- [PHP The Right Way](https://phptherightway.com/)
- [PSR-12 Coding Standard](https://www.php-fig.org/psr/psr-12/)
- [PHP Best Practices](https://phpbestpractices.org/)

**Tools:**
- [PHPStan - Static Analysis](https://phpstan.org/)
- [PHP CS Fixer - Code Style Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer)
- [PHPUnit - Testing Framework](https://phpunit.de/)
