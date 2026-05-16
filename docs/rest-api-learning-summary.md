# REST API Learning Summary

## Overview
REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use HTTP methods to perform operations on resources, typically returning JSON data. The Aplikasi Ujian Sekolah Kedinasan uses REST APIs for all backend communication.

## REST Principles

### 1. Client-Server Architecture
- Separation of concerns between client and server
- Client handles UI, server handles data and business logic
- Allows independent evolution of both

### 2. Stateless
- Each request contains all information needed to understand the request
- Server does not store client context between requests
- Scalability improved as server doesn't need to maintain session state

### 3. Cacheable
- Responses should indicate if they can be cached
- Improves performance and reduces server load
- HTTP cache headers: Cache-Control, ETag, Last-Modified

### 4. Uniform Interface
- Consistent interface across all resources
- Uses standard HTTP methods
- Resource identification through URIs
- Self-descriptive messages
- HATEOAS (Hypermedia as the Engine of Application State)

### 5. Layered System
- Architecture can be composed of multiple layers
- Client cannot see beyond the immediate layer
- Enables load balancing, caching, security layers

### 6. Code on Demand (Optional)
- Server can extend client functionality by sending code (scripts)
- Rarely used in practice

## HTTP Methods

### GET
- Retrieve resource representation
- Safe and idempotent
- Should not modify server state
- Can be cached

```http
GET /api/users HTTP/1.1
Host: api.example.com
Authorization: Bearer token123
```

### POST
- Create new resource
- Not idempotent
- Returns created resource with location header

```http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

### PUT
- Update entire resource
- Idempotent
- Replaces entire resource

```http
PUT /api/users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123

{
  "username": "john",
  "email": "john@example.com",
  "role": "admin"
}
```

### PATCH
- Partial update of resource
- Not idempotent
- Updates only specified fields

```http
PATCH /api/users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123

{
  "email": "newemail@example.com"
}
```

### DELETE
- Delete resource
- Idempotent
- Returns 204 No Content on success

```http
DELETE /api/users/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer token123
```

## HTTP Status Codes

### 2xx Success
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Request succeeded, no content returned
- `206 Partial Content` - Partial content returned (range requests)

### 3xx Redirection
- `301 Moved Permanently` - Resource moved to new URL permanently
- `302 Found` - Resource temporarily moved
- `304 Not Modified` - Resource not modified (conditional GET)

### 4xx Client Error
- `400 Bad Request` - Malformed request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not supported
- `409 Conflict` - Conflict with current state
- `422 Unprocessable Entity` - Semantic errors
- `429 Too Many Requests` - Rate limit exceeded

### 5xx Server Error
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable
- `504 Gateway Timeout` - Gateway timeout

## REST API Design Best Practices

### 1. Resource Naming
- Use nouns, not verbs
- Use plural nouns for collections
- Use kebab-case for multi-word names
- Keep URLs consistent

```
Good:
GET /api/users
GET /api/users/123
GET /api/users/123/orders

Bad:
GET /api/getUser
GET /api/getUserById
GET /api/user/123/getOrders
```

### 2. Versioning
- Include version in URL
- Use semantic versioning

```
/api/v1/users
/api/v2/users
```

### 3. Filtering, Sorting, Pagination
- Use query parameters for filtering
- Use query parameters for sorting
- Use query parameters for pagination

```
GET /api/users?role=admin&status=active
GET /api/users?sort=name&order=asc
GET /api/users?page=1&limit=10
```

### 4. Field Selection
- Allow clients to select fields they need
- Reduces payload size

```
GET /api/users?fields=id,username,email
```

### 5. Consistent Response Format
- Use consistent structure for all responses
- Include metadata for pagination

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 6. Error Handling
- Return consistent error format
- Include error code and message

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": "Invalid email format"
    }
  }
}
```

## REST API in PHP

### Basic Structure

```php
<?php
// api/users.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get action from query parameter
$action = $_GET['action'] ?? '';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    switch ($method) {
        case 'GET':
            handleGet($pdo, $action);
            break;
        case 'POST':
            handlePost($pdo, $action);
            break;
        case 'PUT':
            handlePut($pdo, $action);
            break;
        case 'DELETE':
            handleDelete($pdo, $action);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
```

### GET Request Handler

```php
function handleGet($pdo, $action) {
    switch ($action) {
        case 'get_users':
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 10;
            $offset = ($page - 1) * $limit;
            
            $stmt = $pdo->prepare("SELECT * FROM users LIMIT :limit OFFSET :offset");
            $stmt->execute(['limit' => $limit, 'offset' => $offset]);
            $users = $stmt->fetchAll();
            
            $totalStmt = $pdo->query("SELECT COUNT(*) FROM users");
            $total = $totalStmt->fetchColumn();
            
            echo json_encode([
                'success' => true,
                'data' => $users,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);
            break;
            
        case 'get_user':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID required']);
                return;
            }
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $user = $stmt->fetch();
            
            if (!$user) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'User not found']);
                return;
            }
            
            echo json_encode(['success' => true, 'data' => $user]);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
}
```

### POST Request Handler

```php
function handlePost($pdo, $action) {
    switch ($action) {
        case 'create_user':
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            if (empty($input['username']) || empty($input['email']) || empty($input['password'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing required fields']);
                return;
            }
            
            // Check if username exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
            $stmt->execute(['username' => $input['username']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'error' => 'Username already exists']);
                return;
            }
            
            // Hash password
            $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);
            
            // Insert user
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, role) VALUES (:username, :email, :password_hash, :role)");
            $result = $stmt->execute([
                'username' => $input['username'],
                'email' => $input['email'],
                'password_hash' => $passwordHash,
                'role' => $input['role'] ?? 'user'
            ]);
            
            if ($result) {
                $userId = $pdo->lastInsertId();
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'data' => ['id' => $userId],
                    'message' => 'User created successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to create user']);
            }
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
}
```

### PUT Request Handler

```php
function handlePut($pdo, $action) {
    switch ($action) {
        case 'update_user':
            $id = $_GET['id'] ?? null;
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID required']);
                return;
            }
            
            // Build update query dynamically
            $fields = [];
            $params = ['id' => $id];
            
            if (isset($input['username'])) {
                $fields[] = 'username = :username';
                $params['username'] = $input['username'];
            }
            if (isset($input['email'])) {
                $fields[] = 'email = :email';
                $params['email'] = $input['email'];
            }
            if (isset($input['password'])) {
                $fields[] = 'password_hash = :password_hash';
                $params['password_hash'] = password_hash($input['password'], PASSWORD_DEFAULT);
            }
            if (isset($input['role'])) {
                $fields[] = 'role = :role';
                $params['role'] = $input['role'];
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'No fields to update']);
                return;
            }
            
            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute($params);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to update user']);
            }
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
}
```

### DELETE Request Handler

```php
function handleDelete($pdo, $action) {
    switch ($action) {
        case 'delete_user':
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID required']);
                return;
            }
            
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
            $result = $stmt->execute(['id' => $id]);
            
            if ($result) {
                if ($stmt->rowCount() > 0) {
                    http_response_code(204);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'User not found']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to delete user']);
            }
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
}
```

## Authentication

### Bearer Token Authentication

```php
function authenticate() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }
    
    $token = $matches[1];
    
    // Validate token (implement your validation logic)
    if (!validateToken($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid token']);
        exit;
    }
    
    return getUserIdFromToken($token);
}
```

### JWT Authentication

```php
// Using firebase/php-jwt library
require_once 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function generateToken($userId, $userRole) {
    $payload = [
        'user_id' => $userId,
        'role' => $userRole,
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24) // 24 hours
    ];
    
    return JWT::encode($payload, 'your-secret-key', 'HS256');
}

function validateToken($token) {
    try {
        $decoded = JWT::decode($token, new Key('your-secret-key', 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        return false;
    }
}
```

## Rate Limiting

### Simple Rate Limiting

```php
function checkRateLimit($userId, $maxRequests = 100, $timeWindow = 3600) {
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379);
    
    $key = "rate_limit:{$userId}";
    $requests = $redis->incr($key);
    
    if ($requests === 1) {
        $redis->expire($key, $timeWindow);
    }
    
    if ($requests > $maxRequests) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Rate limit exceeded']);
        exit;
    }
}
```

## Input Validation

### Server-Side Validation

```php
function validateUserInput($input) {
    $errors = [];
    
    if (empty($input['username'])) {
        $errors['username'] = 'Username is required';
    } elseif (strlen($input['username']) < 3) {
        $errors['username'] = 'Username must be at least 3 characters';
    } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $input['username'])) {
        $errors['username'] = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (empty($input['email'])) {
        $errors['email'] = 'Email is required';
    } elseif (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Invalid email format';
    }
    
    if (empty($input['password'])) {
        $errors['password'] = 'Password is required';
    } elseif (strlen($input['password']) < 8) {
        $errors['password'] = 'Password must be at least 8 characters';
    }
    
    return $errors;
}

// Usage
$errors = validateUserInput($input);
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Validation failed', 'details' => $errors]);
    exit;
}
```

## CORS (Cross-Origin Resource Sharing)

### Enable CORS

```php
// Allow all origins (not recommended for production)
header('Access-Control-Allow-Origin: *');

// Allow specific origin
header('Access-Control-Allow-Origin: https://example.com');

// Allow specific methods
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Allow specific headers
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

## REST API in Aplikasi Ujian Sekolah Kedinasan

### API Structure:
```
api/
├── auth.php - Authentication (login, register, verify, logout)
├── soal.php - Question management (CRUD operations)
├── analytics.php - Analytics (dashboard stats, exam analytics)
├── courses.php - Course management (CRUD operations)
├── expert.php - Expert system (AI assistant)
├── gamification.php - Gamification (XP, badges, achievements)
├── notifications.php - Notifications (send, get, mark read)
├── rate_limiter.php - Rate limiting
├── validator.php - Input validation
├── pembahasan.php - Discussion/explanation
├── batch_generate.php - Batch question generation
├── csrf.php - CSRF protection
└── middleware.php - Authentication middleware
```

### Authentication Flow:
1. Client sends credentials to `/api/auth.php?action=login`
2. Server validates credentials and returns JWT token
3. Client stores token in LocalStorage
4. Client includes token in Authorization header for subsequent requests
5. Server validates token and processes request

### Example API Calls:

```javascript
// Login
fetch('../api/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, password })
})
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('authToken', data.token);
        }
    });

// Get questions with token
fetch('../api/soal.php?action=get_soal', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
})
    .then(response => response.json())
    .then(data => console.log(data));
```

## Resources

**Official Documentation:**
- [REST API Tutorial - RESTful API](https://restfulapi.net/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

**Learning Resources:**
- [REST API Design Best Practices](https://restfulapi.net/)
- [API Design Guidelines - Microsoft](https://github.com/Microsoft/api-guidelines)
- [REST API Tutorial - YouTube](https://www.youtube.com/results?search_query=rest+api+tutorial)

**Tools:**
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Swagger/OpenAPI](https://swagger.io/)
- [JSON Server](https://github.com/typicode/json-server)
