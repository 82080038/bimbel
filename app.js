// Global variables
let soal = [];
let jawabanPeserta = {};
let doubtfulQuestions = new Set();
let bookmarkedQuestions = new Set();
let flaggedQuestions = new Map();
let currentQuestionIndex = 0;
let timerInterval;
let autoSaveInterval;
let waktuTersisa = 100 * 60; // 100 menit dalam detik
let sesiId = null;
let namaPeserta = '';
let apiKey = localStorage.getItem('apiKey') || '';
let csrfToken = '';
let tabSwitchCount = 0;
let blurCount = 0;
let isPracticeMode = false;
let adaptiveDifficultyEnabled = false;
let currentDifficulty = 'sedang';
let consecutiveCorrect = 0;
let consecutiveIncorrect = 0;

// API Base URL
const API_BASE = 'api';

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Initialize dark mode from localStorage
function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    fetchCsrfToken();
    registerServiceWorker();
    loadPaketSelection();
    
    // Check if user is returning from a session
    const savedSession = localStorage.getItem('ujianSession');
    if (savedSession) {
        // Could implement resume functionality here
    }
});

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Load paket selection
async function loadPaketSelection() {
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=get_paket`);
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('paketSelection');
            select.innerHTML = '<option value="">-- Pilih Paket Ujian --</option>';
            
            data.data.forEach(paket => {
                const option = document.createElement('option');
                option.value = paket.id;
                option.textContent = `${paket.nama_paket} (${paket.total_soal} soal, ${paket.durasi} menit)`;
                if (paket.nama_kategori) {
                    option.textContent += ` - ${paket.nama_kategori}`;
                }
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading paket:', error);
    }
}

// Fetch CSRF token
async function fetchCsrfToken() {
    try {
        const response = await fetch(`${API_BASE}/csrf.php?action=get_token`);
        const data = await response.json();
        if (data.csrf_token) {
            csrfToken = data.csrf_token;
        }
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
    }
}

// Anti-cheating measures
function enableAntiCheat() {
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Prevent common shortcuts
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'a')) {
            e.preventDefault();
            return false;
        }
        // Prevent F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    });
    
    // Detect tab switching
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            tabSwitchCount++;
            if (tabSwitchCount >= 3) {
                alert('Peringatan: Anda telah berpindah tab sebanyak 3 kali. Ini akan dicatat.');
                // Could auto-submit or flag for review
            }
        }
    });
    
    // Detect window blur
    window.addEventListener('blur', function() {
        blurCount++;
        if (blurCount >= 5) {
            alert('Peringatan: Jangan beralih ke aplikasi lain selama ujian.');
        }
    });
    
    // Request fullscreen on exam start
    requestFullscreen();
}

function requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Disable copy-paste
function disableCopyPaste() {
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('paste', function(e) {
        e.preventDefault();
        return false;
    });
}

// Mulai ujian
async function mulaiUjian() {
    namaPeserta = document.getElementById('namaPeserta').value.trim();
    const paketId = document.getElementById('paketSelection').value;
    
    if (!namaPeserta) {
        alert('Mohon masukkan nama Anda terlebih dahulu!');
        return;
    }

    if (!paketId) {
        alert('Mohon pilih paket ujian terlebih dahulu!');
        return;
    }

    showLoading();
    
    try {
        // Fetch questions based on selected paket
        const response = await fetch(`${API_BASE}/soal.php?action=get_soal_by_paket&paket_id=${paketId}`);
        
        // Check HTTP status first
        if (response.status === 401) {
            alert('Sesi Anda telah expired atau Anda belum login. Silakan login terlebih dahulu.');
            hideLoading();
            // Optional: redirect to login
            // window.location.href = 'login.html';
            return;
        }
        
        if (response.status === 403) {
            alert('Anda tidak memiliki izin untuk mengakses paket ujian ini.');
            hideLoading();
            return;
        }
        
        if (!response.ok) {
            alert('Terjadi kesalahan saat memuat soal. Status: ' + response.status);
            hideLoading();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            soal = data.data;
            jawabanPeserta = {};
            doubtfulQuestions.clear();
            bookmarkedQuestions.clear();
            currentQuestionIndex = 0;
            
            // Update timer duration based on paket
            waktuTersisa = data.paket.durasi * 60;
            
            // Save session (continue even if session save fails)
            const sessionSaved = await simpanSesi(soal);
            if (!sessionSaved) {
                console.warn('Session not saved, but continuing with exam');
            }
            
            // Start exam
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('examScreen').classList.remove('hidden');
            document.getElementById('displayNama').textContent = namaPeserta;
            
            // Enable anti-cheat measures (only in exam mode)
            if (!isPracticeMode) {
                enableAntiCheat();
                disableCopyPaste();
            }
            
            // Build navigation
            buildQuestionNav();
            
            // Display first question
            tampilkanSoal(currentQuestionIndex);
            
            // Start timer
            mulaiTimer();
            
            // Start auto-save
            startAutoSave();
        } else {
            alert('Gagal memuat soal. ' + (data.error || 'Silakan coba lagi.'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
    
    hideLoading();
}

// Mulai latihan (practice mode tanpa timer)
async function mulaiLatihan() {
    namaPeserta = document.getElementById('namaPeserta').value.trim();
    
    if (!namaPeserta) {
        alert('Mohon masukkan nama Anda terlebih dahulu!');
        return;
    }

    isPracticeMode = true;
    showLoading();
    
    try {
        // Fetch random questions
        const response = await fetch(`${API_BASE}/soal.php?action=get_soal_acak`);
        const data = await response.json();
        
        if (data.success) {
            soal = data.data;
            jawabanPeserta = {};
            doubtfulQuestions.clear();
            bookmarkedQuestions.clear();
            currentQuestionIndex = 0;
            
            // Start practice mode
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('examScreen').classList.remove('hidden');
            document.getElementById('displayNama').textContent = namaPeserta + ' (Mode Latihan)';
            
            // Hide timer in practice mode
            document.querySelector('.timer-display').style.display = 'none';
            document.querySelector('.progress-bar-container').style.display = 'none';
            
            // Disable anti-cheat in practice mode
            // (already handled by not calling enableAntiCheat)
            
            // Build navigation
            buildQuestionNav();
            
            // Display first question
            tampilkanSoal(currentQuestionIndex);
            
            // Don't start timer in practice mode
            // Start auto-save
            startAutoSave();
        } else {
            alert('Gagal memuat soal. Silakan coba lagi.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
    
    hideLoading();
}

// Simpan sesi ujian
async function simpanSesi(soalTeracak) {
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=simpan_sesi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nama_peserta: namaPeserta,
                durasi_menit: 100,
                soal_teracak: soalTeracak
            })
        });
        
        // Handle HTTP errors
        if (response.status === 401) {
            console.error('Sesi expired atau belum login');
            // Tampilkan pesan yang lebih user-friendly
            const lanjutkan = confirm(
                'Sesi Anda telah expired atau Anda belum login.\n\n' +
                'Klik "OK" untuk ke halaman login, atau "Cancel" untuk mencoba melanjutkan tanpa menyimpan sesi.'
            );
            if (lanjutkan) {
                window.location.href = 'login.html';
            }
            return false;
        }
        
        if (response.status === 403) {
            console.error('Akses ditolak');
            alert('Anda tidak memiliki izin untuk mengakses fitur ini.');
            return false;
        }
        
        const data = await response.json();
        if (data.success) {
            sesiId = data.sesi_id;
            return true;
        } else {
            console.error('Gagal menyimpan sesi:', data.error);
            // Tampilkan error tapi jangan block user
            return false;
        }
    } catch (error) {
        console.error('Error saving session:', error);
        alert('Terjadi kesalahan saat menyimpan sesi ujian. Ujian tetap dapat dilanjutkan.');
        return false;
    }
}

// Tampilkan soal
function tampilkanSoal(index) {
    const soalSekarang = soal[index];

    document.getElementById('questionNumber').textContent = soalSekarang.nomor;
    document.getElementById('categoryBadge').textContent = soalSekarang.nama_kategori;
    document.getElementById('categoryBadge').className = `category-badge category-${soalSekarang.nama_kategori}`;
    document.getElementById('questionText').textContent = soalSekarang.pertanyaan;

    // Update ragu-ragu button state
    const raguBtn = document.querySelector('[onclick="toggleRaguRagu()"]');
    if (raguBtn) {
        if (doubtfulQuestions.has(soalSekarang.id)) {
            raguBtn.classList.add('btn-warning');
            raguBtn.classList.remove('btn-outline-warning');
            raguBtn.innerHTML = '<i class="fas fa-question-circle"></i> Ragu-ragu';
        } else {
            raguBtn.classList.remove('btn-warning');
            raguBtn.classList.add('btn-outline-warning');
            raguBtn.innerHTML = '<i class="far fa-question-circle"></i> Tandai Ragu';
        }
    }

    // Build options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const options = [
        { key: 'A', value: soalSekarang.opsi_a },
        { key: 'B', value: soalSekarang.opsi_b },
        { key: 'C', value: soalSekarang.opsi_c },
        { key: 'D', value: soalSekarang.opsi_d },
        { key: 'E', value: soalSekarang.opsi_e }
    ];
    
    options.forEach(opt => {
        const label = document.createElement('label');
        label.className = 'option-label';
        if (jawabanPeserta[soalSekarang.id] === opt.key) {
            label.classList.add('selected');
        }
        
        label.innerHTML = `
            <input type="radio" name="jawaban" value="${opt.key}" 
                   ${jawabanPeserta[soalSekarang.id] === opt.key ? 'checked' : ''}>
            <span>${opt.key}. ${opt.value}</span>
        `;
        
        label.addEventListener('change', () => {
            simpanJawaban(soalSekarang.id, opt.key);
            document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');
            updateNavStatus(soalSekarang.nomor, true);
        });
        
        optionsContainer.appendChild(label);
    });
    
    // Update navigation
    updateNavigation();
}

// Simpan jawaban
function simpanJawaban(soalId, jawaban) {
    jawabanPeserta[soalId] = jawaban;
    
    // Auto-save to localStorage
    localStorage.setItem('currentAnswers', JSON.stringify(jawabanPeserta));
    
    // Track question appearance (correct/incorrect)
    trackQuestionAnswer(soalId, jawaban);
    
    // Adaptive difficulty logic
    if (adaptiveDifficultyEnabled) {
        checkAnswerForAdaptiveDifficulty(soalId, jawaban);
    }
}

// Track question answer for statistics
async function trackQuestionAnswer(soalId, jawaban) {
    const soalSekarang = soal.find(s => s.id === soalId);
    if (!soalSekarang) return;
    
    const isCorrect = jawaban === soalSekarang.jawaban_benar;
    
    try {
        await fetch(`${API_BASE}/soal.php?action=track_question_appearance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                soal_id: soalId,
                is_correct: isCorrect
            })
        });
    } catch (error) {
        console.error('Error tracking question:', error);
    }
}

// Adaptive difficulty logic
function checkAnswerForAdaptiveDifficulty(soalId, jawaban) {
    const soalSekarang = soal.find(s => s.id === soalId);
    if (!soalSekarang) return;
    
    const isCorrect = jawaban === soalSekarang.jawaban_benar;
    
    if (isCorrect) {
        consecutiveCorrect++;
        consecutiveIncorrect = 0;
        
        // If 3 correct in a row, increase difficulty
        if (consecutiveCorrect >= 3 && currentDifficulty !== 'sulit') {
            currentDifficulty = getNextDifficulty(currentDifficulty, true);
            consecutiveCorrect = 0;
            console.log('Difficulty increased to:', currentDifficulty);
        }
    } else {
        consecutiveIncorrect++;
        consecutiveCorrect = 0;
        
        // If 2 incorrect in a row, decrease difficulty
        if (consecutiveIncorrect >= 2 && currentDifficulty !== 'mudah') {
            currentDifficulty = getNextDifficulty(currentDifficulty, false);
            consecutiveIncorrect = 0;
            console.log('Difficulty decreased to:', currentDifficulty);
        }
    }
}

function getNextDifficulty(current, increase) {
    const levels = ['mudah', 'sedang', 'sulit'];
    const currentIndex = levels.indexOf(current);
    
    if (increase && currentIndex < levels.length - 1) {
        return levels[currentIndex + 1];
    } else if (!increase && currentIndex > 0) {
        return levels[currentIndex - 1];
    }
    return current;
}

// Build question navigation
function buildQuestionNav() {
    const navContainer = document.getElementById('questionNav');
    navContainer.innerHTML = '';
    
    soal.forEach((s, index) => {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.textContent = s.nomor;
        navItem.dataset.index = index;
        
        navItem.addEventListener('click', () => {
            currentQuestionIndex = index;
            tampilkanSoal(currentQuestionIndex);
        });
        
        navContainer.appendChild(navItem);
    });
}

// Update navigation status
function updateNavStatus(nomor, answered) {
    const navItem = document.querySelector(`[data-nomor="${nomor}"]`);
    if (navItem) {
        navItem.classList.remove('answered', 'unanswered', 'doubtful');
        
        const soalId = soal.find(s => s.nomor === nomor)?.id;
        const isDoubtful = doubtfulQuestions.has(soalId);
        
        if (isDoubtful) {
            navItem.classList.add('doubtful');
            if (answered) {
                navItem.classList.add('answered');
            }
        } else if (answered) {
            navItem.classList.add('answered');
        } else {
            navItem.classList.add('unanswered');
        }
    }
}

// Update navigation highlighting
function updateNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        if (index === currentQuestionIndex) {
            item.classList.add('current');
        } else {
            item.classList.remove('current');
        }
        
        // Check if answered
        const soalId = soal[index].id;
        if (jawabanPeserta[soalId]) {
            item.classList.add('answered');
        } else {
            item.classList.remove('answered');
        }
        
        // Check if bookmarked
        if (bookmarkedQuestions.has(soalId)) {
            item.classList.add('bookmarked');
        } else {
            item.classList.remove('bookmarked');
        }
        
        // Check if flagged
        const flagKey = `flag_${soalId}`;
        if (flaggedQuestions.has(flagKey)) {
            const flagType = flaggedQuestions.get(flagKey).type;
            const flagColors = {
                'ragu': '#ffc107',
                'skip': '#dc3545',
                'review': '#17a2b8',
                'bookmark': '#28a745'
            };
            item.style.borderColor = flagColors[flagType];
            item.style.borderWidth = '2px';
        } else {
            item.style.borderColor = '';
            item.style.borderWidth = '';
        }
    });
    
    // Update progress bar
    updateProgressBar();
    
    // Update bookmark button
    updateBookmarkButton();
    
    // Update flag buttons
    updateFlagButtons();
}

// Toggle bookmark for current question
function toggleBookmark() {
    const soalId = soal[currentQuestionIndex].id;
    if (bookmarkedQuestions.has(soalId)) {
        bookmarkedQuestions.delete(soalId);
    } else {
        bookmarkedQuestions.add(soalId);
    }
    updateBookmarkButton();
}

// Update bookmark button state
function updateBookmarkButton() {
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (!bookmarkBtn) return;
    
    const soalId = soal[currentQuestionIndex].id;
    if (bookmarkedQuestions.has(soalId)) {
        bookmarkBtn.classList.add('active');
        bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Bookmarked';
    } else {
        bookmarkBtn.classList.remove('active');
        bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Bookmark';
    }
}

// Flag question with different types
function flagQuestion(type) {
    const currentSoal = soal[currentQuestionIndex];
    const flagTypes = {
        'ragu': { color: '#ffc107', icon: '❓' },
        'skip': { color: '#dc3545', icon: '⏭️' },
        'review': { color: '#17a2b8', icon: '🔄' },
        'bookmark': { color: '#28a745', icon: '🔖' }
    };
    
    if (!flagTypes[type]) return;
    
    const flagKey = `flag_${currentSoal.id}`;
    
    if (flaggedQuestions.has(flagKey)) {
        if (flaggedQuestions.get(flagKey).type === type) {
            flaggedQuestions.delete(flagKey);
        } else {
            flaggedQuestions.set(flagKey, { type: type, ...flagTypes[type] });
        }
    } else {
        flaggedQuestions.set(flagKey, { type: type, ...flagTypes[type] });
    }
    
    updateQuestionNav();
    updateFlagButtons();
}

function updateFlagButtons() {
    const currentSoal = soal[currentQuestionIndex];
    const flagKey = `flag_${currentSoal.id}`;
    
    const flagTypes = ['ragu', 'skip', 'review'];
    flagTypes.forEach(type => {
        const button = document.getElementById(`flagButton_${type}`);
        if (button) {
            if (flaggedQuestions.has(flagKey) && flaggedQuestions.get(flagKey).type === type) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    });
}

// Update progress bar
function updateProgressBar() {
    const answeredCount = Object.keys(jawabanPeserta).length;
    const totalQuestions = soal.length;
    const progressPercent = (answeredCount / totalQuestions) * 100;
    
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    
    if (progressBarFill) {
        progressBarFill.style.width = progressPercent + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${answeredCount} / ${totalQuestions} (${Math.round(progressPercent)}%)`;
    }
}

// Navigation buttons
function sebelumnya() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        tampilkanSoal(currentQuestionIndex);
    }
}

function selanjutnya() {
    if (currentQuestionIndex < soal.length - 1) {
        currentQuestionIndex++;
        tampilkanSoal(currentQuestionIndex);
    }
}

// Timer functions
function mulaiTimer() {
    waktuTersisa = 100 * 60; // Reset to 100 minutes
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        waktuTersisa--;
        updateTimerDisplay();
        
        if (waktuTersisa <= 0) {
            clearInterval(timerInterval);
            stopAutoSave();
            alert('Waktu habis! Ujian akan diselesaikan secara otomatis.');
            selesaiUjian();
        }
    }, 1000);
}

// Auto-save answers every 30 seconds
function startAutoSave() {
    // Load any previously saved answers
    const savedAnswers = localStorage.getItem('currentAnswers');
    if (savedAnswers) {
        try {
            jawabanPeserta = JSON.parse(savedAnswers);
            // Update navigation to reflect saved answers
            soal.forEach(s => {
                if (jawabanPeserta[s.id]) {
                    updateNavStatus(s.nomor, true);
                }
            });
        } catch (e) {
            console.error('Error loading saved answers:', e);
        }
    }
    
    // Auto-save to server every 30 seconds
    autoSaveInterval = setInterval(async () => {
        if (Object.keys(jawabanPeserta).length > 0) {
            try {
                await autoSaveJawaban();
            } catch (error) {
                console.error('Auto-save error:', error);
            }
        }
    }, 30000); // 30 seconds
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
    // Clear localStorage
    localStorage.removeItem('currentAnswers');
}

async function autoSaveJawaban() {
    if (!sesiId) return;
    
    const jawabanData = soal.map(s => ({
        soal_id: s.id,
        jawaban: jawabanPeserta[s.id] || null
    }));
    
    // Save to localStorage first
    localStorage.setItem('currentAnswers', JSON.stringify(jawabanPeserta));
    
    // Optionally save to server (would need API endpoint)
    // For now, localStorage is sufficient for ~10 users
}

function updateTimerDisplay() {
    const menit = Math.floor(waktuTersisa / 60);
    const detik = waktuTersisa % 60;
    document.getElementById('timer').textContent = 
        `${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
    
    // Change color when time is running low
    const timerDisplay = document.querySelector('.timer-display');
    if (waktuTersisa <= 300) { // 5 minutes
        timerDisplay.style.background = '#fecaca';
        timerDisplay.style.animation = 'pulse 0.5s infinite';
    }
}

// Selesai ujian
async function selesaiUjian() {
    // Check if all questions are answered
    const jawabanCount = Object.keys(jawabanPeserta).length;
    const totalSoal = soal.length;
    
    if (jawabanCount < totalSoal) {
        const konfirmasi = confirm(`Anda baru menjawab ${jawabanCount} dari ${totalSoal} soal. Apakah Anda yakin ingin menyelesaikan ujian?`);
        if (!konfirmasi) return;
    }
    
    clearInterval(timerInterval);
    stopAutoSave();
    exitFullscreen();
    
    // Save hasil_id to localStorage for certificate generation
    localStorage.setItem('currentHasilId', hasilId);
    
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=selesai_ujian`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                sesi_id: sesiId,
                jawaban: jawabanPeserta
            })
        });
        const data = await response.json();

        if (data.success) {
            tampilkanHasil(data);
        } else {
            alert('Gagal menyelesaikan ujian: ' + (data.error || ''));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menyelesaikan ujian');
    }
}

// Tampilkan hasil
function tampilkanHasil(data) {
    document.getElementById('examScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    
    // Show timer again for next exam
    document.querySelector('.timer-display').style.display = 'block';
    document.querySelector('.progress-bar-container').style.display = 'block';
    
    document.getElementById('resultNama').textContent = namaPeserta + (isPracticeMode ? ' (Mode Latihan)' : '');
    document.getElementById('totalScore').textContent = data.nilai_total;
    document.getElementById('twkScore').textContent = data.nilai_twk;
    document.getElementById('tiuScore').textContent = data.nilai_tiu;
    document.getElementById('tkpScore').textContent = data.nilai_tkp;
    document.getElementById('tpaScore').textContent = data.nilai_tpa || 0;
    document.getElementById('psikologisScore').textContent = data.nilai_psikologis || 0;
    
    const passFail = document.getElementById('passFail');
    if (data.status_lulus === 'LULUS') {
        passFail.textContent = 'LULUS';
        passFail.classList.add('pass');
        passFail.classList.remove('fail');
    } else {
        passFail.textContent = 'TIDAK LULUS';
        passFail.classList.add('fail');
        passFail.classList.remove('pass');
    }
    
    // Fetch and display ranking
    fetchRanking();
    
    // Generate learning recommendations
    generateLearningRecommendations();
    
    // Analyze weaknesses by category
    analyzeWeakness();
}

// Fetch ranking
async function fetchRanking() {
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=get_ranking`);
        const data = await response.json();

        if (data.success) {
            // Find user's rank
            const userScore = parseInt(document.getElementById('totalScore').textContent);
            let rank = 1;
            
            for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].nilai_total < userScore) {
                    rank = i + 1;
                    break;
                }
                if (i === data.data.length - 1) {
                    rank = data.data.length + 1;
                }
            }
            
            document.getElementById('userRank').textContent = rank;
            document.getElementById('totalParticipants').textContent = data.total;
        }
    } catch (error) {
        console.error('Error fetching ranking:', error);
        document.getElementById('userRank').textContent = '-';
        document.getElementById('totalParticipants').textContent = '0';
    }
}

// Lihat pembahasan
async function lihatPembahasan() {
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('discussionScreen').classList.remove('hidden');
    
    showLoading();
    
    try {
        await loadPembahasan('semua');
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat pembahasan. Silakan coba lagi.');
    }
    
    hideLoading();
}

// Load pembahasan
async function loadPembahasan(kategori) {
    const container = document.getElementById('pembahasanContainer');
    container.innerHTML = '';
    
    let filteredSoal = soal;
    if (kategori !== 'semua') {
        filteredSoal = soal.filter(s => s.kategori === kategori);
    }
    
    for (const s of filteredSoal) {
        try {
            const response = await fetch(`${API_BASE}/pembahasan.php?action=get_pembahasan&soal_id=${s.id}`);
            const data = await response.json();
            
            if (data.success) {
                const pembahasan = data.data;
                const jawabanUser = jawabanPeserta[s.id] || '-';
                const isCorrect = jawabanUser === pembahasan.jawaban_benar;
                
                const card = document.createElement('div');
                card.className = 'question-card';
                card.innerHTML = `
                    <span class="question-number">${s.nomor}</span>
                    <span class="category-badge category-${s.kategori}">${s.kategori}</span>
                    <p class="question-text">${pembahasan.pertanyaan}</p>
                    
                    <div class="mb-3">
                        <strong>Jawaban Anda:</strong> 
                        <span class="${isCorrect ? 'text-success fw-bold' : 'text-danger fw-bold'}">${jawabanUser}</span>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Jawaban Benar:</strong> 
                        <span class="text-success fw-bold">${pembahasan.jawaban_benar}</span>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Nilai:</strong> 
                        <span class="text-success fw-bold">${pembahasan.nilai}</span>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Opsi:</strong>
                        <ul>
                            <li>A. ${pembahasan.opsi_a}</li>
                            <li>B. ${pembahasan.opsi_b}</li>
                            <li>C. ${pembahasan.opsi_c}</li>
                            <li>D. ${pembahasan.opsi_d}</li>
                            <li>E. ${pembahasan.opsi_e}</li>
                        </ul>
                    </div>
                    
                    <div class="discussion-card">
                        <h5><i class="fas fa-book-open"></i> Pembahasan:</h5>
                        <p>${pembahasan.pembahasan || 'Pembahasan tidak tersedia.'}</p>
                    </div>
                    
                    ${pembahasan.tips ? `
                    <div class="tips-card">
                        <h5><i class="fas fa-lightbulb"></i> Tips:</h5>
                        <p>${pembahasan.tips}</p>
                    </div>
                    ` : ''}
                `;
                
                container.appendChild(card);
            }
        } catch (error) {
            console.error('Error loading discussion:', error);
        }
    }
}

// Filter pembahasan
function filterPembahasan() {
    const kategori = document.getElementById('filterKategori').value;
    showLoading();
    loadPembahasan(kategori).then(() => hideLoading());
}

// Kembali ke hasil
function kembaliKeHasil() {
    document.getElementById('discussionScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
}

// Ulangi ujian
function ulangUjian() {
    if (confirm('Apakah Anda yakin ingin mengulang ujian? Jawaban Anda akan direset.')) {
        // Reset variables
        soal = [];
        jawabanPeserta = {};
        bookmarkedQuestions.clear();
        currentQuestionIndex = 0;
        isPracticeMode = false;
        
        // Show timer again
        document.querySelector('.timer-display').style.display = 'block';
        document.querySelector('.progress-bar-container').style.display = 'block';
        
        // Show welcome screen
        document.getElementById('resultScreen').classList.add('hidden');
        document.getElementById('welcomeScreen').classList.remove('hidden');
        
        // Exit fullscreen
        exitFullscreen();
    }
}

// Export PDF
function exportPDF() {
    // Create a simple printable version
    const printContent = `
        <html>
        <head>
            <title>Hasil Ujian - ${namaPeserta}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #1e40af; }
                .score-box { border: 2px solid #1e40af; padding: 20px; margin: 20px 0; border-radius: 10px; }
                .score { font-size: 48px; font-weight: bold; color: #1e40af; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
                th { background-color: #1e40af; color: white; }
                .pass { color: green; font-weight: bold; }
                .fail { color: red; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Hasil Ujian Sekolah Kedinasan</h1>
            <p><strong>Nama Peserta:</strong> ${namaPeserta}</p>
            <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
            <p><strong>Mode:</strong> ${isPracticeMode ? 'Latihan' : 'Ujian Resmi'}</p>
            
            <div class="score-box">
                <h2>Nilai Total</h2>
                <div class="score">${document.getElementById('totalScore').textContent}</div>
                <p class="${document.getElementById('passFail').classList.contains('pass') ? 'pass' : 'fail'}">
                    ${document.getElementById('passFail').textContent}
                </p>
            </div>
            
            <table>
                <tr>
                    <th>Kategori</th>
                    <th>Nilai</th>
                    <th>Passing Grade</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td>TWK</td>
                    <td>${document.getElementById('twkScore').textContent}</td>
                    <td>65</td>
                    <td>${parseInt(document.getElementById('twkScore').textContent) >= 65 ? 'LULUS' : 'TIDAK'}</td>
                </tr>
                <tr>
                    <td>TIU</td>
                    <td>${document.getElementById('tiuScore').textContent}</td>
                    <td>80</td>
                    <td>${parseInt(document.getElementById('tiuScore').textContent) >= 80 ? 'LULUS' : 'TIDAK'}</td>
                </tr>
                <tr>
                    <td>TKP</td>
                    <td>${document.getElementById('tkpScore').textContent}</td>
                    <td>166</td>
                    <td>${parseInt(document.getElementById('tkpScore').textContent) >= 166 ? 'LULUS' : 'TIDAK'}</td>
                </tr>
            </table>
            
            <p><em>Generated by Aplikasi Ujian Sekolah Kedinasan</em></p>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Generate learning recommendations
async function generateLearningRecommendations() {
    if (!sesiId) return;
    
    try {
        const doubtfulArray = Array.from(doubtfulQuestions);
        const response = await fetch(`${API_BASE}/soal.php?action=generate_rekomendasi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                sesi_id: sesiId,
                jawaban: jawabanPeserta,
                ragu_questions: doubtfulArray
            })
        });
        const data = await response.json();
        
        if (data.success) {
            console.log(`Generated ${data.generated} learning recommendations`);
        }
    } catch (error) {
        console.error('Error generating recommendations:', error);
    }
}

// Analyze weaknesses by category
async function analyzeWeakness() {
    if (!sesiId) return;
    
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=analyze_weakness`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sesi_id: sesiId
            })
        });
        const data = await response.json();
        
        if (data.success) {
            console.log(`Analyzed weaknesses for ${data.analyzed} categories`);
        }
    } catch (error) {
        console.error('Error analyzing weaknesses:', error);
    }
}

// View learning recommendations
async function lihatRekomendasiBelajar() {
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('learningScreen').classList.remove('hidden');
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=get_rekomendasi_belajar&sesi_id=${sesiId}`);
        const data = await response.json();
        
        if (data.success) {
            displayLearningRecommendations(data.data);
        } else {
            document.getElementById('learningRecommendations').innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Tidak ada rekomendasi belajar untuk saat ini.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        document.getElementById('learningRecommendations').innerHTML = `
            <div class="alert alert-danger">
                Gagal memuat rekomendasi belajar.
            </div>
        `;
    }
    
    hideLoading();
}

async function displayLearningRecommendations(rekomendasi) {
    const container = document.getElementById('learningRecommendations');
    
    // Load category weaknesses
    let weaknesses = [];
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=get_kategori_weakness&user_id=${namaPeserta}`);
        const data = await response.json();
        if (data.success) {
            weaknesses = data.data;
        }
    } catch (error) {
        console.error('Error loading weaknesses:', error);
    }
    
    // Load tips & tricks
    let tips = [];
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=get_tips_tricks`);
        const data = await response.json();
        if (data.success) {
            tips = data.data;
        }
    } catch (error) {
        console.error('Error loading tips:', error);
    }
    
    let html = '';
    
    // Display category weaknesses
    if (weaknesses.length > 0) {
        html += `
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0"><i class="fas fa-chart-line"></i> Analisis Kelemahan Per Kategori</h5>
                </div>
                <div class="card-body">
        `;
        
        weaknesses.forEach(w => {
            const weaknessClass = w.tingkat_kelemahan === 'sangat_tinggi' ? 'danger' : 
                               w.tingkat_kelemahan === 'tinggi' ? 'warning' : 
                               w.tingkat_kelemahan === 'sedang' ? 'info' : 'success';
            html += `
                <div class="mb-3 p-3 bg-light rounded">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="fw-bold mb-0">${w.nama_kategori}</h6>
                        <span class="badge bg-${weaknessClass}">${w.persen_benar}% Benar</span>
                    </div>
                    <p class="mb-1 mt-2"><strong>Kelemahan:</strong> <span class="text-${weaknessClass}">${w.tingkat_kelemahan.toUpperCase()}</span></p>
                    <p class="mb-0"><strong>Rekomendasi:</strong> ${w.rekomendasi}</p>
                </div>
            `;
        });
        
        html += '</div></div>';
    }
    
    // Display tips & tricks
    if (tips.length > 0) {
        html += `
            <div class="card mb-4">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0"><i class="fas fa-lightbulb"></i> Tips & Triks Penyelesaian Soal</h5>
                </div>
                <div class="card-body">
        `;
        
        tips.forEach(t => {
            html += `
                <div class="mb-3 p-3 bg-light rounded">
                    <h6 class="fw-bold"><i class="fas fa-star"></i> ${t.judul}</h6>
                    <p class="mb-1">${t.konten}</p>
                    ${t.contoh ? `<p class="mb-0 text-muted"><em>Contoh: ${t.contoh}</em></p>` : ''}
                </div>
            `;
        });
        
        html += '</div></div>';
    }
    
    if (rekomendasi.length === 0) {
        html += `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Tidak ada rekomendasi belajar untuk saat ini. Anda menjawab semua soal dengan benar!
            </div>
        `;
        container.innerHTML = html;
        return;
    }
    
    // Group by reason
    const salah = rekomendasi.filter(r => r.alasan === 'salah');
    const ragu = rekomendasi.filter(r => r.alasan === 'ragu');
    
    if (salah.length > 0) {
        html += `
            <div class="card mb-4">
                <div class="card-header bg-danger text-white">
                    <h5 class="mb-0"><i class="fas fa-times-circle"></i> Jawaban Salah (${salah.length})</h5>
                </div>
                <div class="card-body">
        `;
        
        for (const r of salah) {
            html += await createLearningMaterialCard(r);
        }
        
        html += '</div></div>';
    }
    
    if (ragu.length > 0) {
        html += `
            <div class="card mb-4">
                <div class="card-header bg-warning">
                    <h5 class="mb-0"><i class="fas fa-question-circle"></i> Ragu-ragu (${ragu.length})</h5>
                </div>
                <div class="card-body">
        `;
        
        for (const r of ragu) {
            html += await createLearningMaterialCard(r);
        }
        
        html += '</div></div>';
    }
    
    container.innerHTML = html;
}

async function createLearningMaterialCard(rekomendasi) {
    // Get learning materials for this question
    let learningMaterials = '';
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=get_bahan_pelajaran&soal_id=${rekomendasi.soal_id}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            learningMaterials = data.data.map(b => `
                <div class="learning-material mt-3 p-3 bg-light rounded">
                    <h6 class="fw-bold"><i class="fas fa-book"></i> ${b.judul}</h6>
                    <p>${b.konten}</p>
                    ${b.url ? `<a href="${b.url}" target="_blank" class="btn btn-sm btn-info"><i class="fas fa-external-link-alt"></i> Baca Selengkapnya</a>` : ''}
                </div>
            `).join('');
        } else {
            learningMaterials = `
                <div class="alert alert-warning mt-3">
                    <i class="fas fa-exclamation-triangle"></i> Bahan pelajaran belum tersedia untuk soal ini.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading learning materials:', error);
    }
    
    return `
        <div class="question-review mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-secondary">${rekomendasi.nama_kategori}</span>
                <span class="badge bg-${rekomendasi.alasan === 'salah' ? 'danger' : 'warning'}">${rekomendasi.alasan.toUpperCase()}</span>
            </div>
            <p class="mt-2">${rekomendasi.pertanyaan.substring(0, 150)}...</p>
            <div class="mb-2">
                <strong>Jawaban Benar:</strong> ${rekomendasi.jawaban_benar}
            </div>
            <div class="mb-2">
                <strong>Pembahasan:</strong>
                <p>${rekomendasi.pembahasan || 'Tidak ada pembahasan'}</p>
            </div>
            ${learningMaterials}
            <button class="btn btn-sm btn-success mt-2" onclick="markAsLearned(${rekomendasi.id})">
                <i class="fas fa-check"></i> Tandai Sudah Dipelajari
            </button>
        </div>
        <hr>
    `;
}

async function markAsLearned(rekomendasiId) {
    try {
        const response = await fetch(`${API_BASE}/soal.php?action=update_rekomendasi_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: rekomendasiId,
                status: 'dipelajari'
            })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Rekomendasi ditandai sebagai sudah dipelajari!');
            lihatRekomendasiBelajar(); // Refresh
        } else {
            alert('Gagal update status');
        }
    } catch (error) {
        console.error('Error marking as learned:', error);
        alert('Gagal update status');
    }
}

function kembaliKeHasil() {
    document.getElementById('learningScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
}

// Download certificate
function downloadCertificate() {
    const score = parseInt(document.getElementById('totalScore').textContent);
    const passFail = document.getElementById('passFail').textContent;
    
    if (passFail === 'TIDAK LULUS') {
        alert('Sertifikat hanya tersedia untuk peserta yang LULUS');
        return;
    }
    
    // Generate certificate with verification code
    generateCertificateForDownload();
}

async function generateCertificateForDownload() {
    try {
        // Get current hasil_id from session or local storage
        const hasil_id = localStorage.getItem('currentHasilId');
        if (!hasil_id) {
            alert('Sesi ujian tidak ditemukan');
            return;
        }
        
        const response = await fetch(`${API_BASE}/soal.php?action=generate_certificate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hasil_id })
        });
        const data = await response.json();
        
        if (data.success) {
            const cert = data.data;
            downloadCertificatePDF(cert.verification_code, cert.qr_code);
        } else {
            alert('Gagal generate sertifikat: ' + (data.error || ''));
        }
    } catch (error) {
        console.error('Error generating certificate:', error);
        alert('Gagal generate sertifikat');
    }
}

function downloadCertificatePDF(verificationCode, qrCodeUrl) {
    const namaPeserta = document.getElementById('resultNama').textContent;
    const score = document.getElementById('totalScore').textContent;
    const passFail = document.getElementById('passFail').textContent;
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sertifikat Kelulusan - ${namaPeserta}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    padding: 40px;
                    text-align: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .certificate {
                    background: white;
                    padding: 50px;
                    max-width: 800px;
                    margin: 0 auto;
                    border: 10px solid #333;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                h1 {
                    color: #333;
                    margin-bottom: 10px;
                }
                .subtitle {
                    color: #666;
                    font-size: 18px;
                    margin-bottom: 40px;
                }
                .name {
                    font-size: 36px;
                    font-weight: bold;
                    color: #667eea;
                    margin: 30px 0;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 10px;
                }
                .score {
                    font-size: 24px;
                    margin: 20px 0;
                }
                .status {
                    font-size: 28px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: ${passFail === 'LULUS' ? '#28a745' : '#dc3545'};
                }
                .verification {
                    margin-top: 40px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
                .verification-code {
                    font-size: 16px;
                    font-weight: bold;
                    color: #333;
                    letter-spacing: 2px;
                }
                .qr-code {
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <h1>SERTIFIKAT KELULUSAN</h1>
                <div class="subtitle">Ujian Sekolah Kedinasan</div>
                
                <div class="name">${namaPeserta}</div>
                
                <div class="score">Nilai: ${score}</div>
                <div class="status">${passFail}</div>
                
                <div class="verification">
                    <p>Kode Verifikasi:</p>
                    <div class="verification-code">${verificationCode}</div>
                    <div class="qr-code">
                        <img src="${qrCodeUrl}" alt="QR Code" width="150" height="150">
                    </div>
                    <p style="margin-top: 10px; font-size: 12px;">Scan QR code untuk verifikasi</p>
                </div>
                
                <div class="footer">
                    Diterbitkan pada: ${new Date().toLocaleDateString('id-ID')}
                </div>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Lihat tips
async function lihatTips() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('tipsScreen').classList.remove('hidden');
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/pembahasan.php?action=get_tips_umum`);
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('tipsContainer');
            container.innerHTML = '';
            
            // Group tips by category
            const tipsByCategory = {};
            data.data.forEach(tip => {
                if (!tipsByCategory[tip.kategori]) {
                    tipsByCategory[tip.kategori] = [];
                }
                tipsByCategory[tip.kategori].push(tip);
            });
            
            // Display tips
            for (const [kategori, tips] of Object.entries(tipsByCategory)) {
                const section = document.createElement('div');
                section.className = 'tips-section';
                
                const kategoriTitle = kategori.charAt(0).toUpperCase() + kategori.slice(1);
                section.innerHTML = `<h4><i class="fas fa-lightbulb"></i> Tips ${kategoriTitle}:</h4>`;
                
                const ul = document.createElement('ul');
                tips.forEach(tip => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${tip.judul}</strong>: ${tip.konten}`;
                    ul.appendChild(li);
                });
                
                section.appendChild(ul);
                container.appendChild(section);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat tips. Silakan coba lagi.');
    }
    
    hideLoading();
}

// Kembali ke welcome screen
function kembaliKeWelcome() {
    document.getElementById('tipsScreen').classList.add('hidden');
    document.getElementById('historyScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    
    // Exit fullscreen if in exam mode
    exitFullscreen();
}

// Lihat riwayat ujian
async function lihatRiwayat() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('historyScreen').classList.remove('hidden');
    
    showLoading();
    
    try {
        // Load statistics
        const statResponse = await fetch(`${API_BASE}/soal.php?action=get_statistik`);
        const statData = await statResponse.json();
        
        if (statData.success) {
            document.getElementById('statTotalExams').textContent = statData.data.total_exams;
            document.getElementById('statAvgScore').textContent = statData.data.average_scores.total;
            document.getElementById('statPassRate').textContent = statData.data.pass_rate + '%';
            document.getElementById('statAvgTWK').textContent = statData.data.average_scores.twk;
        }
        
        // Load history
        const historyResponse = await fetch(`${API_BASE}/soal.php?action=get_riwayat_ujian&limit=10`);
        const historyData = await historyResponse.json();
        
        if (historyData.success) {
            const container = document.getElementById('historyContainer');
            container.innerHTML = '';
            
            if (historyData.data.length === 0) {
                container.innerHTML = '<p class="text-center">Belum ada riwayat ujian.</p>';
            } else {
                historyData.data.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.className = 'question-card';
                    card.innerHTML = `
                        <h5><i class="fas fa-file-alt"></i> Ujian #${historyData.data.length - index}</h5>
                        <p><strong>Nama:</strong> ${item.nama_peserta}</p>
                        <p><strong>Tanggal:</strong> ${item.tanggal_ujian}</p>
                        <div class="row mt-2">
                            <div class="col-md-3">
                                <strong>TWK:</strong> ${item.nilai_twk}
                            </div>
                            <div class="col-md-3">
                                <strong>TIU:</strong> ${item.nilai_tiu}
                            </div>
                            <div class="col-md-3">
                                <strong>TKP:</strong> ${item.nilai_tkp}
                            </div>
                            <div class="col-md-3">
                                <strong>Total:</strong> ${item.nilai_total}
                            </div>
                        </div>
                        <p class="mt-2">
                            <strong>Status:</strong> 
                            <span class="${item.status_lulus === 'LULUS' ? 'text-success fw-bold' : 'text-danger fw-bold'}">${item.status_lulus}</span>
                        </p>
                    `;
                    container.appendChild(card);
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat riwayat ujian. Silakan coba lagi.');
    }
    
    hideLoading();
}

// Loading functions
function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.className = 'loading';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Memuat data...</p>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.remove();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (document.getElementById('examScreen').classList.contains('hidden')) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            sebelumnya();
            break;
        case 'ArrowRight':
            selanjutnya();
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            // Select option (1=A, 2=B, 3=C, 4=D, 5=E)
            const options = ['A', 'B', 'C', 'D', 'E'];
            const optionIndex = parseInt(e.key) - 1;
            if (optionIndex >= 0 && optionIndex < options.length) {
                const soalId = soal[currentQuestionIndex].id;
                simpanJawaban(soalId, options[optionIndex]);
                tampilkanSoal(currentQuestionIndex);
            }
            break;
    }
});
