// Global variables
let soal = [];
let jawabanPeserta = {};
let bookmarkedQuestions = new Set();
let currentQuestionIndex = 0;
let timerInterval;
let waktuTersisa = 100 * 60; // 100 menit dalam detik
let sesiId = null;
let namaPeserta = '';

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
    
    // Check if user is returning from a session
    const savedSession = localStorage.getItem('ujianSession');
    if (savedSession) {
        // Could implement resume functionality here
    }
});

// Mulai ujian
async function mulaiUjian() {
    namaPeserta = document.getElementById('namaPeserta').value.trim();
    
    if (!namaPeserta) {
        alert('Mohon masukkan nama Anda terlebih dahulu!');
        return;
    }

    showLoading();
    
    try {
        // Fetch random questions
        const response = await fetch(`${API_BASE}/soal.php?action=get_soal_acak`);
        const data = await response.json();
        
        if (data.success) {
            soal = data.data;
            jawabanPeserta = {};
            currentQuestionIndex = 0;
            
            // Save session
            await simpanSesi(soal);
            
            // Start exam
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('examScreen').classList.remove('hidden');
            document.getElementById('displayNama').textContent = namaPeserta;
            
            // Build navigation
            buildQuestionNav();
            
            // Display first question
            tampilkanSoal(currentQuestionIndex);
            
            // Start timer
            mulaiTimer();
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
        
        const data = await response.json();
        if (data.success) {
            sesiId = data.sesi_id;
        }
    } catch (error) {
        console.error('Error saving session:', error);
    }
}

// Tampilkan soal
function tampilkanSoal(index) {
    if (index < 0 || index >= soal.length) return;
    
    const soalSekarang = soal[index];
    
    document.getElementById('questionNumber').textContent = soalSekarang.nomor;
    document.getElementById('categoryBadge').textContent = soalSekarang.kategori;
    document.getElementById('categoryBadge').className = `category-badge category-${soalSekarang.kategori}`;
    document.getElementById('questionText').textContent = soalSekarang.pertanyaan;
    
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
function updateNavStatus(nomor, isAnswered) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (parseInt(item.textContent) === nomor) {
            if (isAnswered) {
                item.classList.add('answered');
                item.classList.remove('unanswered');
            }
        }
    });
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
    });
    
    // Update progress bar
    updateProgressBar();
    
    // Update bookmark button
    updateBookmarkButton();
}

// Toggle bookmark for current question
function toggleBookmark() {
    const soalId = soal[currentQuestionIndex].id;
    if (bookmarkedQuestions.has(soalId)) {
        bookmarkedQuestions.delete(soalId);
    } else {
        bookmarkedQuestions.add(soalId);
    }
    updateNavigation();
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
            alert('Waktu habis! Ujian akan diselesaikan secara otomatis.');
            selesaiUjian();
        }
    }, 1000);
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
    showLoading();
    
    try {
        // Prepare answers data
        const jawabanData = soal.map(s => ({
            soal_id: s.id,
            jawaban: jawabanPeserta[s.id] || null
        }));
        
        const response = await fetch(`${API_BASE}/soal.php?action=selesai_ujian`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nama_peserta: namaPeserta,
                jawaban: jawabanData,
                sesi_id: sesiId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            tampilkanHasil(data);
        } else {
            alert('Gagal menyimpan hasil ujian. Silakan coba lagi.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
    
    hideLoading();
}

// Tampilkan hasil
function tampilkanHasil(data) {
    document.getElementById('examScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    
    document.getElementById('resultNama').textContent = namaPeserta;
    document.getElementById('totalScore').textContent = data.nilai_total;
    document.getElementById('twkScore').textContent = data.nilai_twk;
    document.getElementById('tiuScore').textContent = data.nilai_tiu;
    document.getElementById('tkpScore').textContent = data.nilai_tkp;
    document.getElementById('tpaScore').textContent = data.nilai_tpa || 0;
    document.getElementById('psikologisScore').textContent = data.nilai_psikologis || 0;
    
    const passFail = document.getElementById('passFail');
    if (data.status_lulus === 'LULUS') {
        passFail.textContent = 'LULUS';
        passFail.className = 'pass-fail pass';
    } else {
        passFail.textContent = 'TIDAK LULUS';
        passFail.className = 'pass-fail fail';
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
        document.getElementById('resultScreen').classList.add('hidden');
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('namaPeserta').value = '';
        
        // Reset variables
        soal = [];
        jawabanPeserta = {};
        currentQuestionIndex = 0;
        sesiId = null;
    }
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

// Kembali ke welcome
function kembaliKeWelcome() {
    document.getElementById('tipsScreen').classList.add('hidden');
    document.getElementById('historyScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
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
