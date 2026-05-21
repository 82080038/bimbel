// Profile functionality
let _currentProfileData = null;

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
            _currentProfileData = data.user;
            displayProfile(data.user);
            loadProfileStats();
            loadCourseProgress();
            loadModuleProgress();
        } else {
            throw new Error(data.error || 'Gagal memuat profil');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showProfileError(error.message);
    }
}

function displayProfile(profileData) {
    if (!profileData) {
        showProfileError('Data profil tidak tersedia. Silakan login kembali.');
        return;
    }

    const namaLengkap = profileData.nama_lengkap || profileData.nama || 'Peserta';

    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileJoined = document.getElementById('profileJoined');

    const roleLabel = profileData.role === 'admin' ? 'Administrator' : 'Peserta Ujian';
    const profileRole = document.getElementById('profileRole');

    if (profileName) profileName.textContent = namaLengkap;
    if (profileUsername) profileUsername.textContent = '@' + (profileData.username || 'username');
    if (profileRole) profileRole.textContent = roleLabel;
    if (profileAvatar) profileAvatar.textContent = namaLengkap.charAt(0).toUpperCase();
    if (profileJoined) profileJoined.textContent = 'Bergabung sejak: ' + (profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('id-ID') : '-');

    // Pre-fill edit form
    const formUsername = document.getElementById('formUsername');
    const formNamaLengkap = document.getElementById('formNamaLengkap');
    const formNomorHP = document.getElementById('formNomorHP');
    const formJenisKelamin = document.getElementById('formJenisKelamin');
    const formTahunTamat = document.getElementById('formTahunTamat');
    const formAsalSekolah = document.getElementById('formAsalSekolah');

    if (formUsername) formUsername.value = profileData.username || '';
    if (formNamaLengkap) formNamaLengkap.value = namaLengkap;
    if (formNomorHP) formNomorHP.value = profileData.nomor_hp || '';
    if (formJenisKelamin) formJenisKelamin.value = profileData.jenis_kelamin || '';
    if (formTahunTamat) formTahunTamat.value = profileData.tahun_tamat || '';
    if (formAsalSekolah) formAsalSekolah.value = profileData.asal_sekolah || '';
}

async function loadProfileStats() {
    const statExams = document.getElementById('statExams');
    const statAvgScore = document.getElementById('statAvgScore');
    const statXP = document.getElementById('statXP');
    const statStreak = document.getElementById('statStreak');

    try {
        const [statsRes, gamRes] = await Promise.all([
            fetch(AppConfig.apiUrl('soal.php?action=get_statistik'), { headers: RBAC.getAuthHeaders() }),
            fetch(AppConfig.apiUrl('gamification.php?action=get_user_gamification'), { headers: RBAC.getAuthHeaders() })
        ]);

        const statsData = await statsRes.json();
        if (statsData.success && statsData.data) {
            if (statExams) statExams.textContent = statsData.data.total_exams ?? '0';
            if (statAvgScore) statAvgScore.textContent = statsData.data.average_scores
                ? parseFloat(statsData.data.average_scores.total || 0).toFixed(1)
                : '0';
        }

        const gamData = await gamRes.json();
        if (gamData.success && gamData.data) {
            if (statXP) statXP.textContent = gamData.data.xp ? (gamData.data.xp.total_xp ?? '0') : '0';
            if (statStreak) statStreak.textContent = gamData.data.streak ? (gamData.data.streak.current_streak ?? '0') : '0';
        }
    } catch (e) {
        console.error('Error loading profile stats:', e);
        if (statExams) statExams.textContent = '0';
        if (statAvgScore) statAvgScore.textContent = '0';
        if (statXP) statXP.textContent = '0';
        if (statStreak) statStreak.textContent = '0';
    }
}

async function loadCourseProgress() {
    const list = document.getElementById('courseProgressList');
    if (!list) return;

    try {
        const response = await fetch(AppConfig.apiUrl('courses.php?action=user_course_progress'), {
            headers: RBAC.getAuthHeaders()
        });
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            list.innerHTML = data.data.map(c => `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span class="fw-semibold">${c.nama_kursus || c.course_title || 'Kursus'}</span>
                        <span class="text-muted small">${Math.round(c.progress_percent || 0)}%</span>
                    </div>
                    <div class="progress" style="height: 8px; border-radius: 4px;">
                        <div class="progress-bar" role="progressbar" style="width: ${c.progress_percent || 0}%"></div>
                    </div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="text-center text-muted py-3">Belum ada kursus yang diikuti.</div>';
        }
    } catch (e) {
        list.innerHTML = '<div class="text-center text-muted py-3">Gagal memuat data kursus.</div>';
    }
}

async function loadModuleProgress() {
    const list = document.getElementById('moduleProgressList');
    if (!list) return;

    try {
        const response = await fetch(AppConfig.apiUrl('courses.php?action=user_module_progress'), {
            headers: RBAC.getAuthHeaders()
        });
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            list.innerHTML = data.data.map(m => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <div class="fw-semibold">${m.module_title || 'Modul'}</div>
                        <small class="text-muted">${m.course_title || ''}</small>
                    </div>
                    <span class="badge ${m.status === 'completed' ? 'bg-success' : 'bg-warning text-dark'}">
                        ${m.status === 'completed' ? 'Selesai' : 'Berlangsung'}
                    </span>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="text-center text-muted py-3">Belum ada modul yang diikuti.</div>';
        }
    } catch (e) {
        list.innerHTML = '<div class="text-center text-muted py-3">Gagal memuat data modul.</div>';
    }
}

function editProfile() {
    const formCard = document.getElementById('profileFormCard');
    if (formCard) {
        formCard.style.display = 'block';
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function cancelEdit() {
    const formCard = document.getElementById('profileFormCard');
    if (formCard) formCard.style.display = 'none';
    // Re-fill form from cached data
    if (_currentProfileData) displayProfile(_currentProfileData);
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('username');
    window.location.href = '../login.html';
}

function toggleDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    const isDark = toggle ? toggle.checked : false;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark ? '1' : '0');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const id = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
    container.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);
    const toastEl = document.getElementById(id);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
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
                <button class="btn btn-primary mt-3" onclick="window.location.href='dashboard.html'">
                    <i class="fas fa-home me-2"></i>Kembali ke Dashboard
                </button>
            </div>
        </div>
    `;
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

        // Restore dark mode preference
        const darkMode = localStorage.getItem('darkMode') === '1';
        document.body.classList.toggle('dark-mode', darkMode);
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) darkToggle.checked = darkMode;

        // Attach form submit handler
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', handleProfileFormSubmit);
        }

        // After components are loaded, load the profile data
        loadProfileData();
    } catch (error) {
        console.error('Error loading profile components:', error);
        showProfileError('Gagal memuat komponen profil');
    }
}

async function handleProfileFormSubmit(e) {
    e.preventDefault();

    const formNamaLengkap = document.getElementById('formNamaLengkap');
    const formNomorHP = document.getElementById('formNomorHP');
    const formJenisKelamin = document.getElementById('formJenisKelamin');
    const formTahunTamat = document.getElementById('formTahunTamat');
    const formAsalSekolah = document.getElementById('formAsalSekolah');
    const formPassword = document.getElementById('formPassword');
    const formPasswordConfirm = document.getElementById('formPasswordConfirm');

    const password = formPassword ? formPassword.value : '';
    const passwordConfirm = formPasswordConfirm ? formPasswordConfirm.value : '';

    if (password && password !== passwordConfirm) {
        showToast('Konfirmasi password tidak cocok', 'error');
        return;
    }

    if (password && password.length < 8) {
        showToast('Password minimal 8 karakter', 'error');
        return;
    }

    const payload = {
        id: _currentProfileData ? _currentProfileData.id : null,
        nama_lengkap: formNamaLengkap ? formNamaLengkap.value.trim() : '',
        nomor_hp: formNomorHP ? formNomorHP.value.trim() : '',
        jenis_kelamin: formJenisKelamin ? formJenisKelamin.value : '',
        tahun_tamat: formTahunTamat ? formTahunTamat.value : '',
        asal_sekolah: formAsalSekolah ? formAsalSekolah.value.trim() : ''
    };

    if (password) payload.password = password;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Menyimpan...'; }

    try {
        const response = await fetch(AppConfig.apiUrl('auth.php?action=update_user'), {
            method: 'POST',
            headers: RBAC.getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Profil berhasil diperbarui');
            if (formPassword) formPassword.value = '';
            if (formPasswordConfirm) formPasswordConfirm.value = '';
            cancelEdit();
            loadProfileData();
        } else {
            showToast(data.error || 'Gagal menyimpan perubahan', 'error');
        }
    } catch (err) {
        showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Simpan Perubahan'; }
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
