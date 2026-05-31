/**
 * Frontend Configuration
 * 
 * This file contains all frontend configurations including base URLs.
 * For production deployment, update the BASE_URL constant.
 * 
 * IMPORTANT: Update BASE_URL when deploying to production!
 */

const AppConfig = {
    // =========================================================================
    // BASE URL CONFIGURATION
    // =========================================================================
    // Update this for production deployment
    // Examples:
    // - Local: 'http://localhost/bimbel'
    // - Production: 'https://ujian.sekolahkedinasan.go.id'
    // - Subfolder: 'https://yourschool.edu/ujian'
    // =========================================================================
    
    BASE_URL: (() => {
        // Auto-detect base URL from current location
        const protocol = window.location.protocol;
        const host = window.location.host;
        const pathname = window.location.pathname;
        
        // Extract base path (e.g., /bimbel from /bimbel/login.html)
        const pathParts = pathname.split('/');
        const basePath = pathParts.length > 1 && pathParts[1] !== '' 
            ? '/' + pathParts[1] 
            : '';
        
        // For production, you can hardcode the URL:
        // return 'https://your-production-domain.com';
        
        return protocol + '//' + host + basePath;
    })(),
    
    // API endpoints
    API_URL: null, // Will be set in init
    
    // Asset paths
    ASSETS_URL: null, // Will be set in init
    
    // =========================================================================
    // ENVIRONMENT
    // =========================================================================
    ENVIRONMENT: (() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        return 'production';
    })(),
    
    // =========================================================================
    // FEATURE FLAGS
    // =========================================================================
    FEATURES: {
        ENABLE_REGISTRATION: true,
        ENABLE_AI_FEATURES: true,
        ENABLE_ANALYTICS: true,
        ENABLE_NOTIFICATIONS: false,
        DEBUG_MODE: null // Will be set based on environment
    },
    
    // =========================================================================
    // API CONFIGURATION
    // =========================================================================
    API: {
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000, // 1 second
        RATE_LIMIT_PUBLIC: 100, // requests per minute
        RATE_LIMIT_AUTH: 1000   // requests per minute
    },
    
    // =========================================================================
    // LOCAL STORAGE KEYS
    // =========================================================================
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USER_ROLE: 'userRole',
        API_KEY: 'apiKey',
        USERNAME: 'username',
        DARK_MODE: 'darkMode',
        LAST_EXAM: 'lastExamData'
    },
    
    // =========================================================================
    // ROUTES
    // =========================================================================
    ROUTES: {
        LOGIN: 'login.html',
        REGISTER: 'register.html',
        DASHBOARD: 'dashboard.html',
        ADMIN: 'admin.html',
        EXAM: 'index.html',
        INDEX: 'index.php'
    },
    
    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    init: function() {
        // Set derived URLs
        this.API_URL = this.BASE_URL + '/api';
        this.ASSETS_URL = this.BASE_URL + '/assets';
        
        // Set debug mode based on environment
        this.FEATURES.DEBUG_MODE = this.ENVIRONMENT === 'development';
        
        // Log configuration in development
        if (this.FEATURES.DEBUG_MODE) {
            console.log('AppConfig initialized:', {
                BASE_URL: this.BASE_URL,
                API_URL: this.API_URL,
                ENVIRONMENT: this.ENVIRONMENT
            });
        }
        
        return this;
    },
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    /**
     * Generate full URL for a path
     * @param {string} path - Path relative to base URL
     * @returns {string} Full URL
     */
    url: function(path) {
        if (!path) return this.BASE_URL;
        if (path.startsWith('http')) return path;
        return this.BASE_URL + '/' + path.replace(/^\/+/, '');
    },
    
    /**
     * Generate API URL
     * @param {string} endpoint - API endpoint
     * @returns {string} Full API URL
     */
    apiUrl: function(endpoint) {
        if (!endpoint) return this.API_URL;
        if (endpoint.startsWith('http')) return endpoint;
        return this.API_URL + '/' + endpoint.replace(/^\/+/, '');
    },
    
    /**
     * Generate asset URL
     * @param {string} path - Asset path
     * @returns {string} Full asset URL
     */
    assetUrl: function(path) {
        if (!path) return this.ASSETS_URL;
        return this.ASSETS_URL + '/' + path.replace(/^\/+/, '');
    },
    
    /**
     * Get route URL
     * @param {string} routeName - Route name from ROUTES
     * @returns {string} Full URL
     */
    route: function(routeName) {
        const route = this.ROUTES[routeName.toUpperCase()];
        return route ? this.url(route) : this.BASE_URL;
    },
    
    /**
     * Check if in production
     * @returns {boolean}
     */
    isProduction: function() {
        return this.ENVIRONMENT === 'production';
    },
    
    /**
     * Check if in development
     * @returns {boolean}
     */
    isDevelopment: function() {
        return this.ENVIRONMENT === 'development';
    },
    
    /**
     * Get storage key
     * @param {string} key - Storage key name
     * @returns {string} Full storage key
     */
    storageKey: function(key) {
        return this.STORAGE_KEYS[key.toUpperCase()] || key;
    },
    
    /**
     * Update configuration for production
     * Call this when deploying to production
     * @param {string} baseUrl - Production base URL
     */
    setProduction: function(baseUrl) {
        this.BASE_URL = baseUrl;
        this.API_URL = baseUrl + '/api';
        this.ASSETS_URL = baseUrl + '/assets';
        this.ENVIRONMENT = 'production';
        this.FEATURES.DEBUG_MODE = false;
        
        // Save to localStorage for persistence
        localStorage.setItem('app_base_url', baseUrl);
        localStorage.setItem('app_environment', 'production');
        
        console.log('AppConfig set to production:', baseUrl);
    },
    
    /**
     * Load configuration from localStorage (if set)
     */
    loadFromStorage: function() {
        const savedBaseUrl = localStorage.getItem('app_base_url');
        const savedEnv = localStorage.getItem('app_environment');
        
        if (savedBaseUrl && savedEnv === 'production') {
            this.BASE_URL = savedBaseUrl;
            this.API_URL = savedBaseUrl + '/api';
            this.ASSETS_URL = savedBaseUrl + '/assets';
            this.ENVIRONMENT = 'production';
            this.FEATURES.DEBUG_MODE = false;
        }
    }
};

// Auto-initialize
AppConfig.init();

// Try to load from storage (in case of production override)
AppConfig.loadFromStorage();

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/bimbel/sw.js')
            .then((registration) => {
                console.log('SW registered:', registration.scope);
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });
    });
}

// Make available globally
window.AppConfig = AppConfig;

// Backward compatibility - alias for old code
window.API_BASE = AppConfig.API_URL;

// Field name mapping for database vs JavaScript consistency
AppConfig.fieldNames = {
    learningTopics: { name: 'topic_name', category: 'kategori', description: 'description' },
    bahanPelajaran: { title: 'judul', type: 'tipe', content: 'konten', categoryName: 'nama_kategori', categoryId: 'kategori_id', filePath: 'file_path', url: 'url' },
    kategori: { code: 'kode', name: 'nama' }
};

// Category ID mapping for filtering
AppConfig.categoryMap = {
    'TWK': 1,
    'TIU': 2,
    'TKP': 3,
    'TPA': 4,
    'PSIKOLOGIS': 5
};

// Centralized fetch helper with error handling
AppConfig.fetchAPI = async function(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : this.apiUrl(endpoint);
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    if (localStorage.getItem('authToken')) {
        defaultOptions.headers['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
    }
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/bimbel/login.html';
                return { success: false, error: 'Unauthorized' };
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        return { success: false, error: error.message };
    }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
