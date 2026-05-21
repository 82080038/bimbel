// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = '../login.html';
}

// Go to dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Retake exam
function retakeExam() {
    window.location.href = 'ujian.html';
}

// Get exam result ID from URL
function getExamResultId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('result_id') || urlParams.get('id');
}

// Load exam result details
async function loadExamResult() {
    const resultId = getExamResultId();
    
    if (!resultId) {
        showError('ID hasil ujian tidak ditemukan');
        return;
    }

    try {
        // Fetch exam result details
        const response = await fetch(AppConfig.apiUrl(`soal.php?action=get_exam_result&id=${resultId}`), {
            headers: RBAC.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Gagal memuat hasil ujian');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Gagal memuat hasil ujian');
        }

        displayExamResult(data.data);
    } catch (error) {
        console.error('Error loading exam result:', error);
        showError(error.message);
    }
}

// Display exam result
function displayExamResult(result) {
    const content = document.getElementById('examResultContent');
    
    const passed = result.status_lulus === 'LULUS';
    const passClass = passed ? 'text-success' : 'text-danger';
    const passIcon = passed ? 'fa-check-circle' : 'fa-times-circle';
    
    content.innerHTML = `
        <div class="container-fluid py-4">
            <!-- Exam Summary -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title mb-4">
                                <i class="fas fa-file-alt me-2"></i>Hasil Ujian
                            </h4>
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center p-3">
                                        <h2 class="${passClass} mb-0">
                                            <i class="fas ${passIcon}"></i> ${passed ? 'LULUS' : 'TIDAK LULUS'}
                                        </h2>
                                        <p class="text-muted">Status Kelulusan</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3">
                                        <h2 class="text-primary mb-0">${result.nilai_total || 0}</h2>
                                        <p class="text-muted">Nilai Total</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3">
                                        <h2 class="text-info mb-0">${result.nilai_twk || 0}</h2>
                                        <p class="text-muted">TWK</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3">
                                        <h2 class="text-warning mb-0">${result.nilai_tiu || 0}</h2>
                                        <p class="text-muted">TIU</p>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-3">
                                    <div class="text-center p-3">
                                        <h2 class="text-success mb-0">${result.nilai_tkp || 0}</h2>
                                        <p class="text-muted">TKP</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3">
                                        <h2 class="text-secondary mb-0">${result.durasi_menit || 0}</h2>
                                        <p class="text-muted">Durasi (menit)</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3">
                                        <h2 class="text-dark mb-0">${result.nama_peserta || '-'}</h2>
                                        <p class="text-muted">Nama Peserta</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3">
                                        <h2 class="text-muted mb-0">${formatDate(result.tanggal_ujian)}</h2>
                                        <p class="text-muted">Tanggal Ujian</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Question Categories and Materials -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-list me-2"></i>Kategori Soal dan Materi
                            </h5>
                            <div id="categoriesContainer">
                                <div class="text-center py-3">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Memuat kategori soal...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Unanswered Questions -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-question-circle me-2"></i>Soal Tidak Dijawab
                            </h5>
                            <div id="unansweredContainer">
                                <div class="text-center py-3">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Memuat soal tidak dijawab...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Wrong Answers by Category -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-times-circle me-2"></i>Jawaban Salah per Kategori
                            </h5>
                            <div id="wrongAnswersContainer">
                                <div class="text-center py-3">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Memuat jawaban salah...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Study Recommendations -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-book me-2"></i>Rekomendasi Belajar
                            </h5>
                            <div id="recommendationsContainer">
                                <div class="text-center py-3">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Memuat rekomendasi...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Question Generator -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-robot me-2"></i>Generator Soal AI
                            </h5>
                            <p class="text-muted mb-3">Buat soal latihan berdasarkan materi yang Anda salah jawab</p>
                            <div id="aiGeneratorContainer">
                                <button class="btn btn-primary" onclick="generateAIQuestions()">
                                    <i class="fas fa-magic me-2"></i>Buat Soal Latihan
                                </button>
                                <div id="aiQuestionsResult" class="mt-3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load detailed analysis
    loadQuestionAnalysis(result.id);
}

// Load question analysis
async function loadQuestionAnalysis(resultId) {
    try {
        const response = await fetch(AppConfig.apiUrl(`soal.php?action=get_question_analysis&result_id=${resultId}`), {
            headers: RBAC.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
        }

        const data = await response.json();

        if (data.success) {
            displayCategories(data.data.categories || []);
            displayUnansweredQuestions(data.data.unanswered || []);
            displayWrongAnswers(data.data.wrong_answers || []);
            displayRecommendations(data.data.recommendations || []);
        }
    } catch (error) {
        console.error('Error loading question analysis:', error);
        // Show empty states if analysis fails
        displayCategories([]);
        displayUnansweredQuestions([]);
        displayWrongAnswers([]);
        displayRecommendations([]);
    }
}

// Display question categories
function displayCategories(categories) {
    const container = document.getElementById('categoriesContainer');
    
    if (!categories || categories.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Tidak ada data kategori</p>';
        return;
    }

    let html = '<div class="row">';
    categories.forEach(cat => {
        html += `
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h6 class="card-title">${cat.nama_kategori || cat.name || '-'}</h6>
                        <p class="text-muted mb-2">Jumlah Soal: ${cat.jumlah_soal || 0}</p>
                        <div class="progress">
                            <div class="progress-bar bg-primary" style="width: ${cat.persen_benar || 0}%"></div>
                        </div>
                        <small class="text-muted">${cat.persen_benar || 0}% benar</small>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Display unanswered questions
function displayUnansweredQuestions(unanswered) {
    const container = document.getElementById('unansweredContainer');
    
    if (!unanswered || unanswered.length === 0) {
        container.innerHTML = '<p class="text-success text-center"><i class="fas fa-check-circle me-2"></i>Semua soal telah dijawab!</p>';
        return;
    }

    let html = `<div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${unanswered.length} soal tidak dijawab
    </div>`;
    
    html += '<div class="list-group">';
    unanswered.forEach(q => {
        html += `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Soal #${q.soal_id}</h6>
                    <small class="text-muted">${q.nama_kategori || q.kategori || '-'}</small>
                </div>
                <p class="mb-1 text-muted small">${q.materi || '-'}</p>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Display wrong answers grouped by category
function displayWrongAnswers(wrongAnswers) {
    const container = document.getElementById('wrongAnswersContainer');
    
    if (!wrongAnswers || wrongAnswers.length === 0) {
        container.innerHTML = '<p class="text-success text-center"><i class="fas fa-check-circle me-2"></i>Tidak ada jawaban salah!</p>';
        return;
    }

    // Group by category
    const grouped = {};
    wrongAnswers.forEach(item => {
        const category = item.nama_kategori || item.kategori || 'Uncategorized';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(item);
    });

    let html = '';
    Object.keys(grouped).forEach(category => {
        html += `
            <div class="card mb-3">
                <div class="card-header bg-danger text-white">
                    <h6 class="mb-0">${category} (${grouped[category].length} salah)</h6>
                </div>
                <div class="card-body">
                    <div class="list-group">
        `;
        grouped[category].forEach(item => {
            html += `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Soal #${item.soal_id}</h6>
                        <small class="text-muted">Jawaban: ${item.jawaban_peserta || '-'} | Benar: ${item.jawaban_benar || '-'}</small>
                    </div>
                    <p class="mb-1 text-muted small">${item.materi || '-'}</p>
                </div>
            `;
        });
        html += `
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Display study recommendations
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendationsContainer');
    
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Tidak ada rekomendasi saat ini</p>';
        return;
    }

    let html = '<div class="row">';
    recommendations.forEach(rec => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="fas fa-lightbulb text-warning me-2"></i>
                            ${rec.kategori || '-'}
                        </h6>
                        <p class="card-text small">${rec.rekomendasi || rec.description || '-'}</p>
                        <a href="${rec.link_materi || '#'}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-book-open me-1"></i>Pelajari
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Generate AI questions
async function generateAIQuestions() {
    const resultId = getExamResultId();
    const container = document.getElementById('aiQuestionsResult');
    
    container.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Membuat soal...</p></div>';
    
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=generate_practice_questions&result_id=' + resultId), {
            method: 'POST',
            headers: RBAC.getAuthHeaders()
        });

        const data = await response.json();

        if (data.success) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    ${data.data.questions_count || 0} soal latihan berhasil dibuat!
                </div>
                <a href="ujian.html?practice_id=${data.data.practice_id || ''}" class="btn btn-primary">
                    <i class="fas fa-play me-2"></i>Mulai Latihan
                </a>
            `;
        } else {
            container.innerHTML = `<div class="alert alert-danger">${data.error || 'Gagal membuat soal'}</div>`;
        }
    } catch (error) {
        console.error('Error generating AI questions:', error);
        container.innerHTML = `<div class="alert alert-danger">Gagal membuat soal: ${error.message}</div>`;
    }
}

// Show error message
function showError(message) {
    const content = document.getElementById('examResultContent');
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

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!RBAC.isAuthenticated()) {
        logout();
        return;
    }

    // Load user info
    loadUserInfo();
    
    // Load exam result
    loadExamResult();
});

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch(AppConfig.apiUrl('auth.php?action=get_profile'), {
            headers: RBAC.getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                const user = data.user;
                const initials = (user.nama_lengkap || user.username || 'User').substring(0, 2).toUpperCase();
                document.getElementById('userAvatar').textContent = initials;
                document.getElementById('userName').textContent = `Selamat Datang, ${user.nama_lengkap || user.username || 'User'}!`;
                
                const detailParts = [];
                if (user.asal_sekolah) detailParts.push(user.asal_sekolah);
                if (user.tahun_tamat) detailParts.push(`Lulusan ${user.tahun_tamat}`);
                document.getElementById('userDetail').textContent = detailParts.length > 0 ? detailParts.join(' • ') : 'Peserta Ujian';
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}
