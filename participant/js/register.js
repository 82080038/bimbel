// Use AppConfig - auto-detects base URL
const API_BASE = AppConfig.API_URL;

// Password strength checker
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const strengthBar = document.getElementById('passwordStrength');
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    strengthBar.className = 'password-strength';
    if (strength <= 1) strengthBar.classList.add('strength-weak');
    else if (strength === 2) strengthBar.classList.add('strength-medium');
    else strengthBar.classList.add('strength-strong');
});

// Form validation
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showAlert('Password dan konfirmasi password tidak cocok!', 'danger');
        return;
    }
    
    // Validate username format
    const username = document.getElementById('username').value;
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        showAlert('Username hanya boleh huruf, angka, dan underscore (3-20 karakter)', 'danger');
        return;
    }
    
    // Show loading
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftarkan...';
    btn.disabled = true;
    
    const formData = {
        username: username,
        password: password,
        nama_lengkap: document.getElementById('namaLengkap').value,
        nomor_hp: document.getElementById('nomorHP').value,
        jenis_kelamin: document.getElementById('jenisKelamin').value,
        tahun_tamat: parseInt(document.getElementById('tahunTamat').value),
        asal_sekolah: document.getElementById('asalSekolah').value,
        role: 'user' // Default role for participants
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Registrasi berhasil! Silakan login.', 'success');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 2000);
        } else {
            showAlert(data.error || 'Registrasi gagal. Silakan coba lagi.', 'danger');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Terjadi kesalahan koneksi. Silakan coba lagi.', 'danger');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.style.display = 'block';

    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    }
}
