// Profile functionality
async function loadProfileData() {
    try {
        const response = await fetch(AppConfig.apiUrl('auth.php?action=get_profile'), {
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

    if (!profileData) {
        content.innerHTML = `
            <div class="container-fluid py-4">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Data profil tidak tersedia. Silakan login kembali.
                </div>
            </div>
        `;
        return;
    }

    // Try to update existing elements from profile-content.html
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileJoined = document.getElementById('profileJoined');

    if (profileName && profileUsername) {
        // Update existing profile-content.html elements
        profileName.textContent = profileData.nama || 'Peserta';
        profileUsername.textContent = '@' + (profileData.username || 'username');
        if (profileAvatar) profileAvatar.textContent = (profileData.nama || 'P').charAt(0).toUpperCase();
        if (profileJoined) profileJoined.textContent = 'Bergabung sejak: ' + (profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('id-ID') : '-');

        // Update stat elements if they exist
        const statExams = document.getElementById('statExams');
        const statAvgScore = document.getElementById('statAvgScore');
        const statXP = document.getElementById('statXP');
        const statStreak = document.getElementById('statStreak');

        if (statExams) statExams.textContent = profileData.total_exams || '0';
        if (statAvgScore) statAvgScore.textContent = profileData.average_score ? profileData.average_score.toFixed(1) : '0';
        if (statXP) statXP.textContent = profileData.xp || '0';
        if (statStreak) statStreak.textContent = profileData.streak || '0';
    } else {
        // Fallback: create new HTML structure if profile-content.html elements not found
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

// Load profile components (HTML and modals)
async function loadProfileComponents() {
    try {
        const contentResponse = await fetch('sections/profile-content.html');
        const contentHTML = await contentResponse.text();
        const profileContent = document.getElementById('profileContent');
        if (profileContent) {
            profileContent.innerHTML = contentHTML;
        }

        const modalsResponse = await fetch('components/modals-shared.html');
        const modalsHTML = await modalsResponse.text();
        const modalsContainer = document.getElementById('modalsContainer');
        if (modalsContainer) {
            modalsContainer.innerHTML = modalsHTML;
        }

        // After components are loaded, load the profile data
        loadProfileData();
    } catch (error) {
        console.error('Error loading profile components:', error);
        showProfileError('Gagal memuat komponen profil');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!RBAC.isAuthenticated()) {
        window.location.href = '../login.html';
        return;
    }

    // Load components first (which will then load data)
    loadProfileComponents();
});
