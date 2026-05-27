/**
 * Indonesian Formatting Helper Functions
 * Comprehensive formatting for Indonesian locale including numbers, dates, text, phone numbers, and more
 */

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

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

// ============================================================================
// DATE/TIME FORMATTING (Indonesian)
// ============================================================================

/**
 * Format date in Indonesian locale
 * @param {Date|string|number} value - The date to format
 * @param {string} format - Format type: 'full', 'long', 'medium', 'short', 'date', 'time', 'datetime' (default: 'long')
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Formatted date string
 */
function formatDate(value, format = 'long', defaultValue = '-') {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return defaultValue;
    }
    
    const formatOptions = {
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' },
        long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        medium: { year: 'numeric', month: 'short', day: 'numeric' },
        short: { year: 'numeric', month: 'numeric', day: 'numeric' },
        date: { year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        datetime: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    
    const options = formatOptions[format] || formatOptions.long;
    return date.toLocaleDateString('id-ID', options);
}

/**
 * Format relative time (e.g., "2 jam yang lalu")
 * @param {Date|string|number} value - The date to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Formatted relative time string
 */
function formatRelativeTime(value, defaultValue = '-') {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return defaultValue;
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${formatCount(diffDays)} hari yang lalu`;
    if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
    return `${diffYears} tahun yang lalu`;
}

/**
 * Format date range in Indonesian
 * @param {Date|string|number} startDate - Start date
 * @param {Date|string|number} endDate - End date
 * @param {string} defaultValue - Default value if inputs are null/undefined (default: '-')
 * @returns {string} Formatted date range string
 */
function formatDateRange(startDate, endDate, defaultValue = '-') {
    if (!startDate || !endDate) {
        return defaultValue;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return defaultValue;
    }
    
    const startStr = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const endStr = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return `${startStr} - ${endStr}`;
}

/**
 * Format time in Indonesian (24-hour format)
 * @param {Date|string|number} value - The time to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Formatted time string
 */
function formatTime(value, defaultValue = '-') {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return defaultValue;
    }
    
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Format day name in Indonesian
 * @param {Date|string|number} value - The date
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Day name in Indonesian
 */
function formatDayName(value, defaultValue = '-') {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return defaultValue;
    }
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
}

/**
 * Format month name in Indonesian
 * @param {Date|string|number} value - The date
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Month name in Indonesian
 */
function formatMonthName(value, defaultValue = '-') {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return defaultValue;
    }
    
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[date.getMonth()];
}

// ============================================================================
// TEXT/STRING FORMATTING (Indonesian)
// ============================================================================

/**
 * Format text to title case (Indonesian style)
 * @param {string} text - The text to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '')
 * @returns {string} Formatted text in title case
 */
function formatTitleCase(text, defaultValue = '') {
    if (text === null || text === undefined || text === '') {
        return defaultValue;
    }
    
    const words = text.toLowerCase().split(' ');
    const exceptions = ['di', 'ke', 'dari', 'untuk', 'dan', 'atau', 'yang', 'dengan', 'pada', 'dalam'];
    
    return words.map((word, index) => {
        if (exceptions.includes(word) && index !== 0) {
            return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Format text to uppercase (Indonesian style)
 * @param {string} text - The text to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '')
 * @returns {string} Formatted text in uppercase
 */
function formatUpperCase(text, defaultValue = '') {
    if (text === null || text === undefined || text === '') {
        return defaultValue;
    }
    
    return text.toUpperCase();
}

/**
 * Format text to lowercase
 * @param {string} text - The text to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '')
 * @returns {string} Formatted text in lowercase
 */
function formatLowerCase(text, defaultValue = '') {
    if (text === null || text === undefined || text === '') {
        return defaultValue;
    }
    
    return text.toLowerCase();
}

/**
 * Truncate text with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @param {string} defaultValue - Default value if input is null/undefined (default: '')
 * @returns {string} Truncated text
 */
function formatTruncate(text, maxLength = 50, defaultValue = '') {
    if (text === null || text === undefined || text === '') {
        return defaultValue;
    }
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

// ============================================================================
// PHONE NUMBER FORMATTING (Indonesian)
// ============================================================================

/**
 * Format Indonesian phone number
 * @param {string} phone - The phone number to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Formatted phone number
 */
function formatPhone(phone, defaultValue = '-') {
    if (phone === null || phone === undefined || phone === '') {
        return defaultValue;
    }
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid Indonesian phone number
    if (cleaned.length < 10 || cleaned.length > 13) {
        return phone; // Return original if invalid format
    }
    
    // Format based on length
    if (cleaned.startsWith('0')) {
        // Local format: 08xx-xxxx-xxxx
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 11) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
        } else if (cleaned.length === 12) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
        } else if (cleaned.length === 13) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
        }
    } else if (cleaned.startsWith('62')) {
        // International format: +62 8xx-xxxx-xxxx
        const localNumber = cleaned.slice(2);
        if (localNumber.length === 10) {
            return `+62 ${localNumber.slice(0, 4)}-${localNumber.slice(4, 7)}-${localNumber.slice(7)}`;
        } else if (localNumber.length === 11) {
            return `+62 ${localNumber.slice(0, 4)}-${localNumber.slice(4, 8)}-${localNumber.slice(8)}`;
        } else if (localNumber.length === 12) {
            return `+62 ${localNumber.slice(0, 4)}-${localNumber.slice(4, 8)}-${localNumber.slice(8)}`;
        }
    }
    
    return phone; // Return original if format doesn't match
}

/**
 * Format phone number for display (simple format)
 * @param {string} phone - The phone number to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Formatted phone number
 */
function formatPhoneSimple(phone, defaultValue = '-') {
    if (phone === null || phone === undefined || phone === '') {
        return defaultValue;
    }
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
        return phone;
    }
    
    if (cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
    } else if (cleaned.startsWith('62')) {
        return `+62 ${cleaned.slice(2).replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3')}`;
    }
    
    return phone;
}

// ============================================================================
// SAFE PARSING FUNCTIONS
// ============================================================================

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

/**
 * Safe string with fallback
 * @param {string} value - The string to check
 * @param {string} defaultValue - Default value if input is null/undefined (default: '')
 * @returns {string} The string or default
 */
function safeString(value, defaultValue = '') {
    if (value === null || value === undefined) {
        return defaultValue;
    }
    
    return String(value);
}

// ============================================================================
// ADDRESS FORMATTING (Indonesian)
// ============================================================================

/**
 * Format Indonesian address
 * @param {object} address - Address object with street, city, province, postalCode
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Formatted address
 */
function formatAddress(address, defaultValue = '-') {
    if (!address || typeof address !== 'object') {
        return defaultValue;
    }
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.province) parts.push(address.province);
    if (address.postalCode) parts.push(address.postalCode);
    
    return parts.length > 0 ? parts.join(', ') : defaultValue;
}

// ============================================================================
// NAME FORMATTING (Indonesian)
// ============================================================================

/**
 * Format Indonesian name (proper case)
 * @param {string} name - The name to format
 * @param {string} defaultValue - Default value if input is null/undefined (default: '-')
 * @returns {string} Formatted name
 */
function formatName(name, defaultValue = '-') {
    if (name === null || name === undefined || name === '') {
        return defaultValue;
    }
    
    return formatTitleCase(name, defaultValue);
}

/**
 * Format full name with title (Indonesian style)
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} defaultValue - Default value if inputs are null/undefined (default: '-')
 * @returns {string} Formatted full name
 */
function formatFullName(firstName, lastName, defaultValue = '-') {
    if (!firstName && !lastName) {
        return defaultValue;
    }
    
    const parts = [];
    if (firstName) parts.push(formatName(firstName));
    if (lastName) parts.push(formatName(lastName));
    
    return parts.join(' ');
}
