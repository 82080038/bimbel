/**
 * RBAC (Role-Based Access Control) System
 * 
 * Manages user roles and access permissions
 */

// Global flag to prevent infinite loop across all RBAC instances
let _rbacValidationRun = false;
let _rbacCurrentPage = '';

const RBAC = {
    // Role definitions
    ROLES: {
        ADMIN: 'admin',
        USER: 'user',
        GUEST: 'guest'
    },

    // Page access permissions
    PERMISSIONS: {
        'admin.html': ['admin'],
        'dashboard.html': ['user', 'admin'],
        'ujian.html': ['user', 'admin'],
        'login.html': ['guest', 'admin', 'user'],
        'register.html': ['guest'],
        'index.html': ['admin', 'user', 'guest'],
        'exam.html': ['admin', 'user']
    },

    /**
     * Get current user role from localStorage
     */
    getCurrentRole() {
        return localStorage.getItem('userRole') || this.ROLES.GUEST;
    },

    /**
     * Get auth token
     */
    getAuthToken() {
        return localStorage.getItem('authToken');
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getAuthToken();
    },

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.getCurrentRole() === role;
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles) {
        return roles.includes(this.getCurrentRole());
    },

    /**
     * Check if user can access a page
     */
    canAccessPage(page) {
        const allowedRoles = this.PERMISSIONS[page] || ['admin'];
        return this.hasAnyRole(allowedRoles);
    },

    /**
     * Validate access to current page
     * Redirects if not authorized
     */
    validatePageAccess() {
        // Prevent infinite loop - only run once per page load
        // Reset flag if page changed
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (_rbacValidationRun && _rbacCurrentPage === currentPage) {
            return true;
        }
        
        _rbacValidationRun = true;
        _rbacCurrentPage = currentPage;

        const userRole = this.getCurrentRole();
        const isLoggedIn = this.isAuthenticated();

        // Login page - only for guests
        if (currentPage === 'login.html') {
            if (isLoggedIn) {
                // Already logged in, redirect to appropriate page
                if (userRole === this.ROLES.ADMIN) {
                    window.location.href = 'admin/admin.html';
                } else {
                    window.location.href = 'participant/dashboard.html';
                }
                return false;
            }
            return true;
        }

        // Admin page - only for admins
        if (currentPage === 'admin.html') {
            if (!isLoggedIn || userRole !== this.ROLES.ADMIN) {
                alert('Akses ditolak: Halaman ini hanya untuk administrator');
                window.location.href = '../login.html';
                return false;
            }
            return true;
        }

        // Dashboard page - require login
        if (currentPage === 'dashboard.html') {
            if (!isLoggedIn) {
                window.location.href = '../login.html';
                return false;
            }
            return true;
        }

        return true;
    },

    /**
     * Update UI elements based on user role
     */
    updateUIForRole(role) {
        // Show/hide admin panel link
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(el => {
            el.style.display = role === this.ROLES.ADMIN ? 'block' : 'none';
        });

        // Show/hide user elements
        const userElements = document.querySelectorAll('.user-only');
        userElements.forEach(el => {
            el.style.display = (role === this.ROLES.USER || role === this.ROLES.ADMIN) ? 'block' : 'none';
        });

        // Update welcome message
        const welcomeEl = document.getElementById('welcomeMessage');
        if (welcomeEl) {
            if (role === this.ROLES.ADMIN) {
                welcomeEl.textContent = 'Selamat datang, Administrator!';
            } else if (role === this.ROLES.USER) {
                welcomeEl.textContent = 'Selamat datang, Peserta!';
            }
        }

        // Show user info in navbar
        this.showUserInfo();
    },

    /**
     * Display user info in navbar/header
     */
    showUserInfo() {
        const userInfoContainer = document.getElementById('userInfo');
        if (!userInfoContainer) return;

        const role = this.getCurrentRole();
        const token = this.getAuthToken();

        if (token && role !== this.ROLES.GUEST) {
            userInfoContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user"></i> 
                        ${role === this.ROLES.ADMIN ? 'Administrator' : 'Peserta'}
                    </button>
                    <ul class="dropdown-menu">
                        ${role === this.ROLES.ADMIN ? '<li><a class="dropdown-item" href="admin.html"><i class="fas fa-cog"></i> Admin Panel</a></li>' : ''}
                        <li><a class="dropdown-item" href="#" onclick="RBAC.logout()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                    </ul>
                </div>
            `;
            userInfoContainer.style.display = 'block';
        } else {
            userInfoContainer.innerHTML = `
                <a href="login.html" class="btn btn-outline-light">
                    <i class="fas fa-sign-in-alt"></i> Login
                </a>
            `;
            userInfoContainer.style.display = 'block';
        }
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('apiKey');
        window.location.href = 'login.html';
    },

    /**
     * Store login data
     */
    storeLoginData(token, role, userData = {}) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        if (userData.apiKey) {
            localStorage.setItem('apiKey', userData.apiKey);
        }
        if (userData.username) {
            localStorage.setItem('username', userData.username);
        }
        if (userData.nama_lengkap) {
            localStorage.setItem('namaLengkap', userData.nama_lengkap);
        }
        // Store full user data for pages that need more detail
        localStorage.setItem('userData', JSON.stringify(userData));
    },

    /**
     * Get auth headers for API requests
     */
    getAuthHeaders() {
        const token = this.getAuthToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    },

    /**
     * Check if user can perform action
     */
    canPerformAction(action) {
        const role = this.getCurrentRole();
        
        const actionPermissions = {
            'create_question': ['admin'],
            'edit_question': ['admin'],
            'delete_question': ['admin'],
            'view_statistics': ['admin', 'user'],
            'take_exam': ['admin', 'user'],
            'view_results': ['admin', 'user'],
            'manage_users': ['admin'],
            'system_settings': ['admin']
        };

        const allowedRoles = actionPermissions[action] || ['admin'];
        return allowedRoles.includes(role);
    },

    /**
     * Protect element - hide if user doesn't have permission
     */
    protectElement(elementId, allowedRoles) {
        const element = document.getElementById(elementId);
        if (element && !this.hasAnyRole(allowedRoles)) {
            element.style.display = 'none';
        }
    },

    /**
     * Require login - redirect if not logged in
     */
    requireLogin(redirectUrl = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },

    /**
     * Require admin - redirect if not admin
     */
    requireAdmin(redirectUrl = 'index.html') {
        if (this.getCurrentRole() !== this.ROLES.ADMIN) {
            alert('Akses ditolak: Hanya administrator yang dapat mengakses halaman ini');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },

    /**
     * Initialize RBAC on page load
     */
    init() {
        // Add logout handler to all logout buttons
        document.querySelectorAll('[data-action="logout"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Validate page access
        return this.validatePageAccess();
    }
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    RBAC.init();
});

// Make RBAC available globally
window.RBAC = RBAC;
