<?php
/**
 * Input Validation Helper
 * 
 * Provides comprehensive input validation and sanitization functions
 * to prevent injection attacks and ensure data integrity
 */

class Validator {
    /**
     * Validate and sanitize integer input
     */
    public static function int($value, $min = null, $max = null) {
        $value = filter_var($value, FILTER_VALIDATE_INT);
        
        if ($value === false) {
            return null;
        }
        
        if ($min !== null && $value < $min) {
            return null;
        }
        
        if ($max !== null && $value > $max) {
            return null;
        }
        
        return $value;
    }
    
    /**
     * Validate and sanitize string input
     */
    public static function string($value, $minLength = 0, $maxLength = null, $allowEmpty = false) {
        if ($allowEmpty && empty($value)) {
            return '';
        }
        
        if (!$allowEmpty && empty($value)) {
            return null;
        }
        
        $value = trim($value);
        
        if (strlen($value) < $minLength) {
            return null;
        }
        
        if ($maxLength !== null && strlen($value) > $maxLength) {
            return null;
        }
        
        return $value;
    }
    
    /**
     * Validate email address
     */
    public static function email($value) {
        $value = filter_var($value, FILTER_VALIDATE_EMAIL);
        return $value ? $value : null;
    }
    
    /**
     * Validate URL
     */
    public static function url($value) {
        $value = filter_var($value, FILTER_VALIDATE_URL);
        return $value ? $value : null;
    }
    
    /**
     * Validate boolean
     */
    public static function bool($value) {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
    
    /**
     * Validate against whitelist
     */
    public static function whitelist($value, array $allowedValues, $caseSensitive = false) {
        if (!$caseSensitive) {
            $value = strtolower($value);
            $allowedValues = array_map('strtolower', $allowedValues);
        }
        
        return in_array($value, $allowedValues) ? $value : null;
    }
    
    /**
     * Sanitize HTML content
     */
    public static function sanitizeHtml($value) {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate category
     */
    public static function category($value) {
        $validCategories = ['TWK', 'TIU', 'TKP'];
        return self::whitelist($value, $validCategories);
    }
    
    /**
     * Validate difficulty level
     */
    public static function difficulty($value) {
        $validDifficulties = ['mudah', 'sedang', 'sulit'];
        return self::whitelist($value, $validDifficulties);
    }
    
    /**
     * Validate answer option (A, B, C, D, E)
     */
    public static function answer($value) {
        $validAnswers = ['A', 'B', 'C', 'D', 'E'];
        return self::whitelist(strtoupper($value), $validAnswers, true);
    }
    
    /**
     * Validate username
     */
    public static function username($value) {
        $value = trim($value);
        
        // Username must be 3-30 characters, alphanumeric and underscore only
        if (!preg_match('/^[a-zA-Z0-9_]{3,30}$/', $value)) {
            return null;
        }
        
        return $value;
    }
    
    /**
     * Validate password strength
     */
    public static function password($value, $minLength = 8) {
        if (strlen($value) < $minLength) {
            return null;
        }
        
        // At least one letter and one number
        if (!preg_match('/[A-Za-z]/', $value) || !preg_match('/[0-9]/', $value)) {
            return null;
        }
        
        return $value;
    }
    
    /**
     * Validate date
     */
    public static function date($value, $format = 'Y-m-d') {
        $date = DateTime::createFromFormat($format, $value);
        return $date ? $date->format($format) : null;
    }
    
    /**
     * Validate datetime
     */
    public static function datetime($value, $format = 'Y-m-d H:i:s') {
        $date = DateTime::createFromFormat($format, $value);
        return $date ? $date->format($format) : null;
    }
    
    /**
     * Validate IP address
     */
    public static function ip($value) {
        return filter_var($value, FILTER_VALIDATE_IP);
    }
    
    /**
     * Sanitize filename
     */
    public static function filename($value) {
        // Remove any path components
        $value = basename($value);
        
        // Remove dangerous characters
        $value = preg_replace('/[^a-zA-Z0-9._-]/', '', $value);
        
        // Remove double dots
        $value = str_replace('..', '', $value);
        
        return empty($value) ? null : $value;
    }
    
    /**
     * Validate and sanitize array of values
     */
    public static function array($value, $validator = null) {
        if (!is_array($value)) {
            return null;
        }
        
        if ($validator === null) {
            return $value;
        }
        
        $validated = [];
        foreach ($value as $item) {
            $result = call_user_func($validator, $item);
            if ($result !== null) {
                $validated[] = $result;
            }
        }
        
        return $validated;
    }
    
    /**
     * Validate JSON string
     */
    public static function json($value) {
        json_decode($value);
        return json_last_error() === JSON_ERROR_NONE ? $value : null;
    }
}

/**
 * Request Validator Class
 * Validates entire request data structures
 */
class RequestValidator {
    private $errors = [];
    
    /**
     * Validate required field
     */
    public function required($field, $value, $validator = null) {
        if (empty($value)) {
            $this->errors[$field] = "$field is required";
            return false;
        }
        
        if ($validator !== null) {
            $result = call_user_func($validator, $value);
            if ($result === null) {
                $this->errors[$field] = "$field is invalid";
                return false;
            }
            return $result;
        }
        
        return $value;
    }
    
    /**
     * Validate optional field
     */
    public function optional($field, $value, $validator = null) {
        if (empty($value)) {
            return null;
        }
        
        if ($validator !== null) {
            $result = call_user_func($validator, $value);
            return $result; // Can be null if invalid
        }
        
        return $value;
    }
    
    /**
     * Get validation errors
     */
    public function getErrors() {
        return $this->errors;
    }
    
    /**
     * Check if validation passed
     */
    public function passed() {
        return empty($this->errors);
    }
    
    /**
     * Get error as JSON response
     */
    public function getErrorResponse() {
        echo json_encode([
            'success' => false,
            'error' => 'Validation failed',
            'errors' => $this->errors
        ]);
    }
}

// Convenience functions
function validateInt($value, $min = null, $max = null) {
    return Validator::int($value, $min, $max);
}

function validateString($value, $minLength = 0, $maxLength = null, $allowEmpty = false) {
    return Validator::string($value, $minLength, $maxLength, $allowEmpty);
}

function validateEmail($value) {
    return Validator::email($value);
}

function validateCategory($value) {
    return Validator::category($value);
}

function validateDifficulty($value) {
    return Validator::difficulty($value);
}

function validateAnswer($value) {
    return Validator::answer($value);
}

function validateUsername($value) {
    return Validator::username($value);
}

function validatePassword($value, $minLength = 8) {
    return Validator::password($value, $minLength);
}
