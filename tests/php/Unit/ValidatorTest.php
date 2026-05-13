<?php
use PHPUnit\Framework\TestCase;

require_once TEST_API_DIR . '/validator.php';

/**
 * Unit tests for Validator class
 */
class ValidatorTest extends TestCase {
    
    public function testValidateInt() {
        $this->assertEquals(42, Validator::int('42'));
        $this->assertEquals(42, Validator::int(42));
        $this->assertNull(Validator::int('not a number'));
        $this->assertNull(Validator::int('42abc'));
    }
    
    public function testValidateIntWithRange() {
        $this->assertEquals(50, Validator::int('50', 0, 100));
        $this->assertNull(Validator::int('150', 0, 100));
        $this->assertNull(Validator::int('-10', 0, 100));
    }
    
    public function testValidateString() {
        $this->assertEquals('hello', Validator::string('hello'));
        $this->assertEquals('hello', Validator::string('  hello  '));
        $this->assertNull(Validator::string(''));
        $this->assertNull(Validator::string('ab', 3)); // min length
    }
    
    public function testValidateStringWithLength() {
        $this->assertEquals('hello', Validator::string('hello', 0, 10));
        $this->assertNull(Validator::string('hello world', 0, 5));
    }
    
    public function testValidateEmail() {
        $this->assertEquals('test@example.com', Validator::email('test@example.com'));
        $this->assertEquals('user+tag@domain.co.id', Validator::email('user+tag@domain.co.id'));
        $this->assertNull(Validator::email('not-an-email'));
        $this->assertNull(Validator::email('test@'));
        $this->assertNull(Validator::email('@example.com'));
    }
    
    public function testValidateCategory() {
        $this->assertEquals('TWK', Validator::category('TWK'));
        $this->assertEquals('TIU', Validator::category('TIU'));
        $this->assertEquals('TKP', Validator::category('TKP'));
        $this->assertEquals('twk', Validator::category('twk')); // case insensitive
        $this->assertNull(Validator::category('INVALID'));
        $this->assertNull(Validator::category(''));
    }
    
    public function testValidateDifficulty() {
        $this->assertEquals('mudah', Validator::difficulty('mudah'));
        $this->assertEquals('sedang', Validator::difficulty('sedang'));
        $this->assertEquals('sulit', Validator::difficulty('sulit'));
        $this->assertNull(Validator::difficulty('impossible'));
    }
    
    public function testValidateAnswer() {
        $this->assertEquals('A', Validator::answer('A'));
        $this->assertEquals('B', Validator::answer('b')); // case insensitive
        $this->assertEquals('E', Validator::answer('E'));
        $this->assertNull(Validator::answer('F'));
        $this->assertNull(Validator::answer('1'));
    }
    
    public function testValidateUsername() {
        $this->assertEquals('testuser', Validator::username('testuser'));
        $this->assertEquals('user_123', Validator::username('user_123'));
        $this->assertNull(Validator::username('ab')); // too short
        $this->assertNull(Validator::username('user@email')); // invalid chars
        $this->assertNull(Validator::username('user name')); // space not allowed
    }
    
    public function testValidatePassword() {
        $this->assertNotNull(Validator::password('Password123'));
        $this->assertNotNull(Validator::password('SecurePass1'));
        $this->assertNull(Validator::password('short')); // too short
        $this->assertNull(Validator::password('nouppercase123')); // no uppercase
        $this->assertNull(Validator::password('NoNumbersHere')); // no numbers
    }
    
    public function testSanitizeHtml() {
        $this->assertEquals('&lt;script&gt;alert(1)&lt;/script&gt;', 
            Validator::sanitizeHtml('<script>alert(1)</script>'));
        $this->assertEquals('&quot;quoted&quot;', 
            Validator::sanitizeHtml('"quoted"'));
    }
    
    public function testValidateWhitelist() {
        $allowed = ['option1', 'option2', 'option3'];
        $this->assertEquals('option1', Validator::whitelist('option1', $allowed));
        $this->assertEquals('option2', Validator::whitelist('OPTION2', $allowed)); // case insensitive
        $this->assertNull(Validator::whitelist('invalid', $allowed));
    }
    
    public function testValidateDate() {
        $this->assertEquals('2024-05-13', Validator::date('2024-05-13'));
        $this->assertNull(Validator::date('invalid-date'));
        $this->assertNull(Validator::date('2024-13-45'));
    }
    
    public function testValidateFilename() {
        $this->assertEquals('document.pdf', Validator::filename('document.pdf'));
        $this->assertEquals('file_name.txt', Validator::filename('file_name.txt'));
        $this->assertEquals('doc-123.jpg', Validator::filename('doc-123.jpg'));
        $this->assertNull(Validator::filename('../etc/passwd')); // path traversal attempt
        $this->assertNull(Validator::filename('file<script>.pdf')); // script injection
    }
    
    public function testValidateJson() {
        $validJson = '{"key": "value", "number": 123}';
        $this->assertEquals($validJson, Validator::json($validJson));
        
        $this->assertNull(Validator::json('not json'));
        $this->assertNull(Validator::json('{invalid json}'));
    }
    
    public function testValidateUrl() {
        $this->assertEquals('https://example.com', Validator::url('https://example.com'));
        $this->assertEquals('http://localhost:8080', Validator::url('http://localhost:8080'));
        $this->assertNull(Validator::url('not-a-url'));
    }
    
    public function testValidateBool() {
        $this->assertTrue(Validator::bool('true'));
        $this->assertTrue(Validator::bool('1'));
        $this->assertTrue(Validator::bool(1));
        $this->assertFalse(Validator::bool('false'));
        $this->assertFalse(Validator::bool('0'));
        $this->assertFalse(Validator::bool(0));
    }
    
    /**
     * Test RequestValidator class
     */
    public function testRequestValidatorRequired() {
        $validator = new RequestValidator();
        
        $result = $validator->required('username', 'testuser', function($v) { 
            return Validator::username($v); 
        });
        
        $this->assertEquals('testuser', $result);
        $this->assertTrue($validator->passed());
    }
    
    public function testRequestValidatorRequiredEmpty() {
        $validator = new RequestValidator();
        
        $result = $validator->required('username', '');
        
        $this->assertFalse($result);
        $this->assertFalse($validator->passed());
        $this->assertArrayHasKey('username', $validator->getErrors());
    }
    
    public function testRequestValidatorOptional() {
        $validator = new RequestValidator();
        
        $result = $validator->optional('nickname', 'test', function($v) {
            return Validator::string($v, 2, 20);
        });
        
        $this->assertEquals('test', $result);
    }
    
    public function testRequestValidatorOptionalEmpty() {
        $validator = new RequestValidator();
        
        $result = $validator->optional('nickname', '');
        
        $this->assertNull($result);
        $this->assertTrue($validator->passed()); // Optional empty is OK
    }
    
    /**
     * Test convenience functions
     */
    public function testConvenienceFunctions() {
        $this->assertEquals(42, validateInt('42'));
        $this->assertEquals('hello', validateString('hello'));
        $this->assertEquals('test@example.com', validateEmail('test@example.com'));
        $this->assertEquals('TWK', validateCategory('TWK'));
        $this->assertEquals('sedang', validateDifficulty('sedang'));
        $this->assertEquals('A', validateAnswer('A'));
        $this->assertEquals('testuser', validateUsername('testuser'));
        $this->assertNotNull(validatePassword('Password123'));
    }
}
