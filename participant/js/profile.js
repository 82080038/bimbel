// Profile functionality
async function loadProfileData() {
    try {
        const response = await fetch(`${AppConfig.apiUrl}/auth.php?action=get_profile`, {
            headers: RBAC.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Gagal memuat profil');
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayProfile(data.data);
        } else {
            throw new Error(data.error || 'Gagal memuat profil');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showProfileError(error.message);
    }
}

function displayProfile(profileData) {
    const content = document.getElementById('profileContent');
    
    if (!content) return;
    
    content.innerHTML = `
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="profile-avatar mb-3">
                                <i class="fas fa-user fa-4x"></i>
                            </div>
                            <h4>${profileData.nama || 'Peserta'}</h4>
                            <p class="text-muted">${profileData.username || 'username'}</p>
                            <span class="badge bg-primary">Level ${profileData.level || 1}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-4">Informasi Peserta</h5>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nama Lengkap</label>
                                    <input type="text" class="form-control" value="${profileData.nama || ''}" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-control" value="${profileData.username || ''}" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" value="${profileData.email || ''}" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Terdaftar Sejak</label>
                                    <input type="text" class="form-control" value="${profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('id-ID') : '-'}" readonly>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showProfileError(message) {
    const content = document.getElementById('profileContent');
    
    if (!content) return;
    
    content.innerHTML = `
        <div class="container-fluid py-5">
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h4>Error</h4>
                <p>${message}</p>
                <button class="btn btn-primary mt-3" onclick="goToDashboard()">
                    <i class="fas fa-home me-2"></i>Kembali ke Dashboard
                </button>
            </div>
        </div>
    `;
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!RBAC.isAuthenticated()) {
        window.location.href = '../login.html';
        return;
    }
    
    loadProfileData();
});
