/**
 * Global Error Handler for Network Failures
 * Menangani error jaringan dan menampilkan pesan yang user-friendly
 */

// Network error handler
function handleNetworkError(error) {
    console.error('Network Error:', error);
    
    let message = 'Terjadi kesalahan jaringan. Silakan periksa koneksi internet Anda.';
    
    if (error.message.includes('Failed to fetch')) {
        message = 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.';
    } else if (error.message.includes('timeout')) {
        message = 'Waktu permintaan habis. Silakan coba lagi.';
    } else if (error.message.includes('NetworkError')) {
        message = 'Koneksi jaringan terputus. Silakan periksa koneksi internet Anda.';
    }
    
    // Show error toast
    if (typeof showToast === 'function') {
        showToast('error', message, 5000);
    } else {
        // Fallback to alert if showToast not available
        alert(message);
    }
}

// API error handler
function handleApiError(response, data) {
    console.error('API Error:', response.status, data);
    
    let message = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    
    if (response.status === 401) {
        message = 'Sesi Anda telah berakhir. Silakan login kembali.';
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = '/ujian/login.html';
        }, 2000);
    } else if (response.status === 403) {
        message = 'Anda tidak memiliki akses untuk melakukan aksi ini.';
    } else if (response.status === 404) {
        message = 'Data tidak ditemukan.';
    } else if (response.status === 500) {
        message = 'Terjadi kesalahan pada server. Silakan hubungi administrator.';
    } else if (data && data.error) {
        message = data.error;
    }
    
    // Show error toast
    if (typeof showToast === 'function') {
        showToast('error', message, 5000);
    } else {
        alert(message);
    }
}

// Enhanced fetch with error handling
async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            handleApiError(response, data);
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return response;
    } catch (error) {
        if (error.message.includes('HTTP')) {
            throw error; // Re-throw API errors
        }
        handleNetworkError(error);
        throw error;
    }
}

// Global error event listener
window.addEventListener('error', function(event) {
    console.error('Global Error:', event.error);
    
    // Only handle network-related errors
    if (event.error && event.error.message && 
        (event.error.message.includes('fetch') || 
         event.error.message.includes('network') ||
         event.error.message.includes('Network'))) {
        handleNetworkError(event.error);
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    
    if (event.reason && event.reason.message) {
        handleNetworkError(event.reason);
    }
});

// Online/offline detection
window.addEventListener('online', function() {
    if (typeof showToast === 'function') {
        showToast('success', 'Koneksi internet telah kembali.', 3000);
    }
});

window.addEventListener('offline', function() {
    if (typeof showToast === 'function') {
        showToast('warning', 'Koneksi internet terputus. Beberapa fitur mungkin tidak berfungsi.', 5000);
    }
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleNetworkError,
        handleApiError,
        safeFetch
    };
}
