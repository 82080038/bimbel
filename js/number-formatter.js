/**
 * Number Formatting Helper Functions
 * Indonesian locale formatting with thousand separators and decimal handling
 */

/**
 * Format number with thousand separators and decimal places
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {string} defaultValue - Default value if input is null/undefined (default: '0')
 * @returns {string} Formatted number string
 */
function formatNumber(value, decimals = 0, defaultValue = '0') {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return defaultValue;
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
        return defaultValue;
    }
    
    return num.toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format currency in Indonesian Rupiah
 * @param {number|string} value - The amount to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: 'Rp 0')
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, defaultValue = 'Rp 0') {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return defaultValue;
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
        return defaultValue;
    }
    
    return num.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

/**
 * Format percentage
 * @param {number|string} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {string} defaultValue - Default value if input is null/undefined (default: '0%')
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 1, defaultValue = '0%') {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return defaultValue;
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
        return defaultValue;
    }
    
    return num.toLocaleString('id-ID', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format score/points with thousand separators
 * @param {number|string} value - The score to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '0')
 * @returns {string} Formatted score string
 */
function formatScore(value, defaultValue = '0') {
    return formatNumber(value, 0, defaultValue);
}

/**
 * Format XP (experience points)
 * @param {number|string} value - The XP to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '0')
 * @returns {string} Formatted XP string
 */
function formatXP(value, defaultValue = '0') {
    return formatNumber(value, 0, defaultValue);
}

/**
 * Format time duration in minutes
 * @param {number|string} value - The duration in minutes
 * @param {string} defaultValue - Default value if input is null/undefined (default: '0 menit')
 * @returns {string} Formatted duration string
 */
function formatDuration(value, defaultValue = '0 menit') {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return defaultValue;
    }
    
    const num = parseInt(value);
    if (isNaN(num)) {
        return defaultValue;
    }
    
    return formatNumber(num, 0, defaultValue) + ' menit';
}

/**
 * Format count with thousand separators (for lists, totals, etc.)
 * @param {number|string} value - The count to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '0')
 * @returns {string} Formatted count string
 */
function formatCount(value, defaultValue = '0') {
    return formatNumber(value, 0, defaultValue);
}

/**
 * Safe parse integer with fallback
 * @param {string|number} value - The value to parse
 * @param {number} defaultValue - Default value if parsing fails (default: 0)
 * @returns {number} Parsed integer
 */
function safeParseInt(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Safe parse float with fallback
 * @param {string|number} value - The value to parse
 * @param {number} defaultValue - Default value if parsing fails (default: 0)
 * @returns {number} Parsed float
 */
function safeParseFloat(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Get safe value from object with fallback
 * @param {object} obj - The object to get value from
 * @param {string} key - The key to get
 * @param {*} defaultValue - Default value if key doesn't exist (default: 0)
 * @returns {*} The value or default
 */
function safeValue(obj, key, defaultValue = 0) {
    if (obj === null || obj === undefined) {
        return defaultValue;
    }
    
    const value = obj[key];
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    return value;
}
