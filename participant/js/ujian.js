// Swipe gesture support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    const swipeThreshold = 100;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next question
            if (currentQuestionIndex < questions.length - 1) {
                goToQuestion(currentQuestionIndex + 1);
            }
        } else {
            // Swipe right - previous question
            if (currentQuestionIndex > 0) {
                goToQuestion(currentQuestionIndex - 1);
            }
        }
    }
}

// Keyboard navigation for mobile
document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        goToQuestion(currentQuestionIndex + 1);
    } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        goToQuestion(currentQuestionIndex - 1);
    }
});

// Global variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let flaggedQuestions = {};
let bookmarkedQuestions = {};
let isPracticeMode = false;
let timerInterval = null;
let timeRemaining = 0;
let selectedExamTypeId = null;
let selectedPaketId = null;
let selectedExamTypeDurasi = 60; // Will be updated from exam type selection
let selectedExamTypeData = null; // Store full exam type data
let currentSessionId = null;
let currentAbility = 0; // CAT ability estimate
// ==========================================
// ANTI-CHEAT SYSTEM
// ==========================================
let antiCheatViolations = 0;
const MAX_VIOLATIONS = 3;
let isFullscreen = false;

function initAntiCheat() {
    // Prevent right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        logAntiCheatViolation('Right click detected');
        showToast('Right click tidak diperbolehkan saat ujian!', 'error');
        return false;
    });

    // Prevent copy, cut, paste
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        logAntiCheatViolation('Copy detected');
        showToast('Copy tidak diperbolehkan saat ujian!', 'error');
        return false;
    });

    document.addEventListener('cut', (e) => {
        e.preventDefault();
        logAntiCheatViolation('Cut detected');
        showToast('Cut tidak diperbolehkan saat ujian!', 'error');
        return false;
    });

    document.addEventListener('paste', (e) => {
        e.preventDefault();
        logAntiCheatViolation('Paste detected');
        showToast('Paste tidak diperbolehkan saat ujian!', 'error');
        return false;
    });

    // Detect tab switch / visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            logAntiCheatViolation('Tab switch detected');
            showAntiCheatWarning('Anda beralih ke tab lain. Jangan lakukan ini lagi!');
        }
    });

    // Detect window blur (clicked outside)
    window.addEventListener('blur', () => {
        logAntiCheatViolation('Window blur detected');
    });

    // Prevent keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Prevent F12 (DevTools)
        if (e.key === 'F12') {
            e.preventDefault();
            logAntiCheatViolation('F12 (DevTools) pressed');
            return false;
        }

        // Prevent Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            logAntiCheatViolation('Ctrl+Shift+I detected');
            return false;
        }

        // Prevent Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            logAntiCheatViolation('Ctrl+U detected');
            return false;
        }

        // Prevent Ctrl+C (Copy)
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            logAntiCheatViolation('Ctrl+C detected');
            return false;
        }

        // Prevent Ctrl+V (Paste)
        if (e.ctrlKey && e.key === 'v') {
            e.preventDefault();
            logAntiCheatViolation('Ctrl+V detected');
            return false;
        }

        // Prevent Ctrl+P (Print)
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            logAntiCheatViolation('Ctrl+P detected');
            return false;
        }

        // Prevent Alt+Tab simulation (Alt key alone)
        if (e.key === 'Alt') {
            e.preventDefault();
            return false;
        }
    });

    // Request fullscreen on exam start
    requestFullscreen();

    // Monitor fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
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
    isFullscreen = true;
}

function handleFullscreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement &&
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        isFullscreen = false;
        logAntiCheatViolation('Fullscreen exited');
        showAntiCheatWarning('Anda keluar dari mode fullscreen. Masuk kembali atau ujian akan diakhiri!');

        // Auto-submit exam after 3 violations
        if (antiCheatViolations >= MAX_VIOLATIONS) {
            showToast('Banyak pelanggaran terdeteksi. Ujian akan diakhiri!', 'error');
            setTimeout(() => forceSubmitExam(), 3000);
        } else {
            // Try to re-enter fullscreen
            setTimeout(() => requestFullscreen(), 1000);
        }
    } else {
        isFullscreen = true;
    }
}

function logAntiCheatViolation(type) {
    antiCheatViolations++;
    console.warn(`Anti-cheat violation #${antiCheatViolations}: ${type}`);

    // Log to server
    fetch(AppConfig.apiUrl('soal.php?action=log_anticheat'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
            session_id: currentSessionId,
            violation_type: type,
            violation_count: antiCheatViolations,
            question_index: currentQuestionIndex,
            timestamp: new Date().toISOString()
        })
    }).catch(err => console.error('Failed to log anti-cheat:', err));
}

function showAntiCheatWarning(message) {
    // Create warning overlay
    let warning = document.getElementById('anticheat-warning');
    if (!warning) {
        warning = document.createElement('div');
        warning.id = 'anticheat-warning';
        warning.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(220, 53, 69, 0.95);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 99999;
                    font-size: 24px;
                    text-align: center;
                    padding: 20px;
                `;
        document.body.appendChild(warning);
    }

    warning.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; margin-bottom: 20px;"></i>
                <h2>PERINGATAN!</h2>
                <p>${message}</p>
                <p>Pelanggaran ke-${antiCheatViolations} dari ${MAX_VIOLATIONS}</p>
                <button onclick="this.parentElement.style.display='none'; requestFullscreen();" 
                        style="margin-top: 20px; padding: 15px 30px; font-size: 18px; cursor: pointer;">
                    Lanjutkan Ujian
                </button>
            `;
    warning.style.display = 'flex';
}

function forceSubmitExam() {
    // Force submit the exam due to violations
    finalizeExam(true); // true = forced submit
}

// ==========================================
// END ANTI-CHEAT SYSTEM
// ==========================================



// Load exam types from database
async function loadExamTypes() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_exam_types'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();
        const select = document.getElementById('examTypeSelection');

        if (data.success && data.data.length > 0) {
            if (select) select.innerHTML = '<option value="">Pilih jenis ujian...</option>';

            data.data.forEach(type => {
                const option = document.createElement('option');
                option.value = type.code;
                option.textContent = type.name;
                option.dataset.durasi = type.durasi_menit;
                option.dataset.jumlah = type.jumlah_soal;
                if (select) select.appendChild(option);
            });

            // Load paket when exam type is selected
            select.addEventListener('change', function () {
                // Store selected exam type data
                const selectedOption = this.options[this.selectedIndex];
                selectedExamTypeDurasi = parseInt(selectedOption.dataset.durasi) || 60;
                selectedExamTypeData = {
                    code: this.value,
                    durasi: selectedExamTypeDurasi,
                    jumlah: parseInt(selectedOption.dataset.jumlah) || 130
                };
                console.log('Selected exam type:', selectedExamTypeData);

                // Load passing grades for selected exam type
                loadPassingGrades(this.value);

                const paketSelect = document.getElementById('paketSelection');
                if (!paketSelect) return;
                if (this.value) {
                    paketSelect.disabled = true;
                    paketSelect.innerHTML = '<option value="">Memuat paket...</option>';
                    loadPaketByExamType(this.value, paketSelect);
                } else {
                    paketSelect.disabled = true;
                    paketSelect.innerHTML = '<option value="">Pilih jenis ujian terlebih dahulu</option>';
                }
            });
        } else {
            if (select) select.innerHTML = '<option value="skd">SKD (Default)</option>';
        }
    } catch (error) {
        console.error('Error loading exam types:', error);
        const examTypeSelection = document.getElementById('examTypeSelection');
        if (examTypeSelection) examTypeSelection.innerHTML =
            '<option value="skd">SKD (Seleksi Kompetensi Dasar)</option>';
    }
}

// Load passing grades dynamically from database
async function loadPassingGrades(examTypeCode) {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_kategori'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();

        if (data.success && data.data) {
            // Update passing grades in UI
            data.data.forEach(kat => {
                const passingGrade = kat.passing_grade || 0;
                const soalCount = kat.jumlah_soal_default || 30;

                switch (kat.nama.toUpperCase()) {
                    case 'TWK':
                        updatePassingGradeElement('twkPassingGrade', passingGrade);
                        updatePassingGradeElement('twkSoalCount', soalCount);
                        break;
                    case 'TIU':
                        updatePassingGradeElement('tiuPassingGrade', passingGrade);
                        updatePassingGradeElement('tiuSoalCount', soalCount);
                        break;
                    case 'TKP':
                        updatePassingGradeElement('tkpPassingGrade', passingGrade);
                        updatePassingGradeElement('tkpSoalCount', soalCount);
                        break;
                    case 'TPA':
                        updatePassingGradeElement('tpaPassingGrade', passingGrade);
                        break;
                    case 'PSIKOLOGIS':
                        updatePassingGradeElement('psikologisPassingGrade', passingGrade);
                        break;
                }
            });

            console.log('Passing grades updated from database');
        }
    } catch (error) {
        console.error('Error loading passing grades:', error);
        // Keep default values if API fails
    }
}

// Helper to update passing grade element
function updatePassingGradeElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Load categories for filter dropdown
async function loadKategoriFilter() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_kategori'), {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const data = await response.json();

        const select = document.getElementById('filterKategori');
        if (select && data.success && data.data.length > 0) {
            // Keep "Semua Kategori" option
            select.innerHTML = '<option value="semua">Semua Kategori</option>';

            data.data.forEach(kat => {
                const option = document.createElement('option');
                option.value = kat.nama;
                option.textContent = kat.nama + (kat.deskripsi ? ` - ${kat.deskripsi}` : '');
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading kategori:', error);
    }
}


// Display current question
function displayQuestion() {
    if (!currentQuestions[currentQuestionIndex]) return;

    const question = currentQuestions[currentQuestionIndex];
    const questionContainer = document.querySelector('.question-card');

    if (!questionContainer) return;

    const savedAns = getSavedAnswer(question.id);
    const opts = [
        { val: 'A', text: question.opsi_a },
        { val: 'B', text: question.opsi_b },
        { val: 'C', text: question.opsi_c },
        { val: 'D', text: question.opsi_d },
        { val: 'E', text: question.opsi_e },
    ];
    const optionsHTML = opts.map(o => {
        const optionImageKey = `gambar_opsi_${o.val.toLowerCase()}`;
        const optionImage = question[optionImageKey];
        let optionImageHTML = '';
        if (optionImage) {
            optionImageHTML = `<img src="../${optionImage}" alt="Opsi ${o.val}" class="option-image" onerror="this.style.display='none'">`;
        }
        return `
                    <label class="option-label${savedAns === o.val ? ' selected' : ''}">
                        <input type="radio" name="answer" value="${o.val}"${savedAns === o.val ? ' checked' : ''}>
                        <span class="option-letter">${o.val}.</span> ${o.text}
                        ${optionImageHTML}
                    </label>`;
    }).join('');

    // Handle passage display
    let passageHTML = '';
    if (question.passage_id && question.passage_judul && question.passage_isi) {
        // Check if this is a new passage (different from previous question)
        const prevQuestion = currentQuestionIndex > 0 ? currentQuestions[currentQuestionIndex - 1] : null;
        const isNewPassage = !prevQuestion || prevQuestion.passage_id !== question.passage_id;

        if (isNewPassage) {
            passageHTML = `
                        <div class="passage-container">
                            <div class="passage-header">
                                <h5><i class="fas fa-book-open"></i> ${question.passage_judul}</h5>
                            </div>
                            <div class="passage-content">
                                ${question.passage_isi.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `;
        }
    }

    // Add question image if exists
    let questionImageHTML = '';
    if (question.gambar_pertanyaan) {
        questionImageHTML = `
                    <div class="question-image-container">
                        <img src="../${question.gambar_pertanyaan}" alt="Gambar Soal" class="question-image" onerror="this.style.display='none'">
                    </div>
                `;
    }

    questionContainer.innerHTML = `
                <div class="question-number">Soal ${currentQuestionIndex + 1}/${currentQuestions.length}</div>
                <span class="category-badge category-${question.kategori_id}">${getCategoryName(question.kategori_id)}</span>
                ${passageHTML}
                ${questionImageHTML}
                <div class="question-text">${question.pertanyaan}</div>
                <div class="options-container">${optionsHTML}
                </div>
            `;

    // Add bookmark button
    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'btn btn-outline-warning bookmark-btn';
    bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Bookmark';
    bookmarkBtn.onclick = () => toggleBookmark(currentQuestionIndex);
    if (bookmarkedQuestions[currentQuestionIndex]) {
        bookmarkBtn.classList.add('active');
        bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Bookmarked';
    }

    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        actionButtons.insertBefore(bookmarkBtn, actionButtons.firstChild);
    }

    updateFlagButtons();
    updateBookmarkButton();
    updateQuestionNav();

    // Add selected class highlight + auto-save + auto-next
    setTimeout(() => {
        document.querySelectorAll('input[name="answer"]').forEach(radio => {
            radio.addEventListener('change', () => {
                // Highlight selected label
                document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
                radio.closest('.option-label').classList.add('selected');
                // Save answer
                saveAnswer(currentQuestionIndex, radio.value);
                // Auto next after 0.5s delay
                setTimeout(() => {
                    if (currentQuestionIndex < currentQuestions.length - 1) {
                        selanjutnya();
                    }
                }, 500);
            });
        });
    }, 100);
}

// Save answer to session storage
async function saveAnswer(questionIndex, answer) {
    const savedAnswers = JSON.parse(sessionStorage.getItem('examAnswers') || '{}');
    savedAnswers[currentQuestions[questionIndex].id] = answer;
    sessionStorage.setItem('examAnswers', JSON.stringify(savedAnswers));

    // Track question appearance for analytics
    if (currentSessionId && !isPracticeMode) {
        try {
            const question = currentQuestions[questionIndex];
            await fetch(AppConfig.apiUrl('soal.php?action=track_question_appearance'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    sesi_id: currentSessionId,
                    soal_id: question.id,
                    is_correct: (answer === question.jawaban_benar)
                })
            }).catch(err => console.error('Error tracking question:', err));
        } catch (error) {
            console.error('Error tracking question:', error);
        }
    }

    // Update ability estimate using CAT (if session exists)
    if (currentSessionId && !isPracticeMode) {
        try {
            const question = currentQuestions[questionIndex];
            const isCorrect = (answer === question.jawaban_benar);

            await fetch(AppConfig.apiUrl('soal.php?action=update_ability_estimate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    sesi_id: currentSessionId,
                    soal_id: question.id,
                    is_correct: isCorrect,
                    current_ability: currentAbility
                })
            }).then(response => response.json())
                .then(data => {
                    if (data.success && data.new_ability !== undefined) {
                        currentAbility = data.new_ability;
                    }
                }).catch(err => {
                    console.error('Error updating ability estimate:', err);
                });
        } catch (error) {
            console.error('Error updating ability estimate:', error);
        }
    }

    // Update navigation to show answered status
    updateQuestionNav();
}

// Get saved answer
function getSavedAnswer(questionId) {
    const savedAnswers = JSON.parse(sessionStorage.getItem('examAnswers') || '{}');
    return savedAnswers[questionId] || null;
}

// Get category name
function getCategoryName(kategoriId) {
    const categories = {
        1: 'TWK',
        2: 'TIU',
        3: 'TKP',
        4: 'TPA',
        5: 'PSIKOLOGIS'
    };
    return categories[kategoriId] || 'UMUM';
}

// Start timer
function startTimer() {
    // Use duration from selected exam type, default to 60 minutes
    timeRemaining = (selectedExamTypeDurasi || 60) * 60; // Convert minutes to seconds
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            selesaiUjian();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerDisplay = document.querySelector('.timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Collect answers (from current form + saved session)
function collectAnswers() {
    // Save current question answer first before collecting all
    const currentRadio = document.querySelector('input[name="answer"]:checked');
    if (currentRadio && currentQuestions[currentQuestionIndex]) {
        saveAnswer(currentQuestionIndex, currentRadio.value);
    }

    const answers = {};
    const savedAnswers = JSON.parse(sessionStorage.getItem('examAnswers') || '{}');
    currentQuestions.forEach((question) => {
        answers[question.id] = savedAnswers[question.id] || null;
    });
    return answers;
}

// Get list of unanswered questions
function getUnansweredQuestions() {
    const answers = collectAnswers();
    const unanswered = [];
    currentQuestions.forEach((question, index) => {
        if (!answers[question.id]) {
            unanswered.push({ index, question });
        }
    });
    return unanswered;
}

// Show unanswered question dialog
function showUnansweredDialog(unanswered) {
    return new Promise(resolve => {
        const questionNumbers = unanswered.map(u => u.index + 1).join(', ');
        showConfirm(
            `Anda masih memiliki ${unanswered.length} soal yang belum dijawab (Soal: ${questionNumbers}).<br><small>Klik <b>OK</b> untuk kembali menjawab, atau <b>Batal</b> untuk tetap menyelesaikan ujian.</small>`,
            () => resolve(true),
            () => resolve(false)
        );
    });
}

// Show specific unanswered question
function showUnansweredQuestion(unansweredIndex) {
    const { index, question } = unansweredQuestionsList[unansweredIndex];
    currentQuestionIndex = index;
    displayQuestion();

    // Restore saved answer if any
    const savedAnswer = getSavedAnswer(question.id);
    if (savedAnswer) {
        const radio = document.querySelector(`input[name="answer"][value="${savedAnswer}"]`);
        if (radio) radio.checked = true;
    }

    // Show dialog for this question
    updateUnansweredDialog(unansweredIndex);
}

// Update dialog for unanswered question mode
function updateUnansweredDialog(currentIdx) {
    const total = unansweredQuestionsList.length;
    const isLast = currentIdx === total - 1;

    // Modify navigation buttons
    const navButtons = document.querySelector('.exam-navigation');
    if (navButtons) {
        navButtons.innerHTML = `
                    <button class="btn btn-secondary-custom btn-custom" onclick="skipUnanswered()">
                        <i class="fas fa-forward"></i> Lewati
                    </button>
                    <span class="unanswered-counter">${currentIdx + 1}/${total} soal tersisa</span>
                    <button class="btn btn-success-custom btn-custom" onclick="finishAfterUnanswered()">
                        <i class="fas fa-check"></i> ${isLast ? 'Selesai' : 'Lanjut'}
                    </button>
                `;
    }
}

// Skip current unanswered question
function skipUnanswered() {
    currentUnansweredIndex++;
    if (currentUnansweredIndex < unansweredQuestionsList.length) {
        showUnansweredQuestion(currentUnansweredIndex);
    } else {
        finishAfterUnanswered();
    }
}

// Finish after answering unanswered questions
function finishAfterUnanswered() {
    // Restore original navigation
    const navButtons = document.querySelector('.exam-navigation');
    if (navButtons) {
        navButtons.innerHTML = `
                    <button class="btn btn-secondary-custom btn-custom" onclick="sebelumnya()">
                        <i class="fas fa-arrow-left"></i> Sebelumnya
                    </button>
                    <button class="btn btn-primary-custom btn-custom" onclick="selanjutnya()">
                        Selanjutnya <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="btn btn-success-custom btn-custom" onclick="selesaiUjian()">
                        <i class="fas fa-check"></i> Selesai Ujian
                    </button>
                `;
    }

    // Submit exam and show expert after truly finished
    finalizeExam();
}

// Submit exam data (without showing expert - expert shown after finalize)
async function submitExamData() {
    try {
        const answers = collectAnswers();
        const response = await fetch(AppConfig.apiUrl('soal.php?action=submit_ujian'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                answers: answers,
                is_practice: isPracticeMode,
                exam_type_id: selectedExamTypeId,
                paket_id: selectedPaketId
            })
        });
        const data = await response.json();
        if (data.success) {
            showResultScreen(data.data);
            return data.data; // Return result for further processing
        } else {
            showToast('Gagal menyelesaikan ujian', 'error');
            return null;
        }
    } catch (error) {
        console.error('Error submitting exam:', error);
        showToast('Terjadi kesalahan saat menyelesaikan ujian', 'error');
        return null;
    }
}

// Global variables for unanswered flow
let unansweredQuestionsList = [];
let currentUnansweredIndex = 0;

// Finalize exam - called ONLY when exam is truly finished
async function finalizeExam(forcedSubmit = false) {
    // Practice mode: show answers immediately, don't save to hasil_ujian
    if (isPracticeMode) {
        showPracticeModeResults();
        return;
    }
    // Deactivate beforeunload — exam ended normally
    examIsActive = false;
    window.onbeforeunload = null;

    // Clear session storage
    sessionStorage.removeItem('examAnswers');

    // Submit exam
    const resultData = await submitExamData();

    // Redirect to resume page with result ID
    // submit_ujian returns {success: true, data: {id: ...}}
    const resultId = resultData?.data?.id || resultData?.id;
    if (resultId) {
        window.location.href = `resume-ujian.html?id=${resultId}`;
    } else {
        // Fallback: show expert system if redirect fails
        if (resultData) {
            const answers = collectAnswers();
            showExpertAfterExam(resultData, answers);
        }
    }
}

// Show expert system after exam with wrong answers
async function showExpertAfterExam(resultData, userAnswers) {
    // Get wrong answers
    const wrongAnswers = [];
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[question.id];
        if (userAnswer && userAnswer !== question.jawaban_benar) {
            wrongAnswers.push({
                question: question,
                userAnswer: userAnswer,
                correctAnswer: question.jawaban_benar
            });
        }
    });

    if (wrongAnswers.length > 0 && typeof expertAssistant !== 'undefined') {
        // Show expert assistant with analysis of wrong answers
        expertAssistant.showPostExamAnalysis(wrongAnswers);
    }
}

// Show result screen
function showResultScreen(resultData) {
    document.getElementById('examScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');

    if (!resultData) return;

    // Load passing grades dynamically
    loadPassingGrades();

    // Populate result screen elements that exist in HTML
    const totalScoreEl = document.getElementById('totalScore');
    const passFailEl = document.getElementById('passFail');
    const twkScoreEl = document.getElementById('twkScore');
    const tiuScoreEl = document.getElementById('tiuScore');
    const tkpScoreEl = document.getElementById('tkpScore');
    const tpaScoreEl = document.getElementById('tpaScore');
    const psikologisScoreEl = document.getElementById('psikologisScore');
    const resultNamaEl = document.getElementById('resultNama');

    if (totalScoreEl) totalScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_total, 0));
    if (passFailEl) {
        passFailEl.textContent = resultData.status_lulus || 'Belum Dinilai';
        passFailEl.className = 'pass-fail ' + (resultData.status_lulus === 'Lulus' ? 'text-success' : 'text-warning');
    }
    if (twkScoreEl) twkScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_twk, 0));
    if (tiuScoreEl) tiuScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_tiu, 0));
    if (tkpScoreEl) tkpScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_tkp, 0));
    if (tpaScoreEl) tpaScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_tpa, 0));
    if (psikologisScoreEl) psikologisScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_psikologis, 0));
    if (resultNamaEl) resultNamaEl.textContent = localStorage.getItem('username') || 'Peserta';
}

// Load passing grades
async function loadPassingGrades() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_passing_grades'));
        const data = await response.json();

        if (data.success && data.data) {
            const pgTWK = document.getElementById('passingGradeTWK');
            const pgTIU = document.getElementById('passingGradeTIU');
            const pgTKP = document.getElementById('passingGradeTKP');
            const pgTPA = document.getElementById('passingGradeTPA');
            const pgPsikologis = document.getElementById('passingGradePsikologis');

            if (pgTWK) pgTWK.textContent = data.data.passing_grade_twk || 65;
            if (pgTIU) pgTIU.textContent = data.data.passing_grade_tiu || 80;
            if (pgTKP) pgTKP.textContent = data.data.passing_grade_tkp || 166;
            if (pgTPA) pgTPA.textContent = data.data.passing_grade_tpa || 0;
            if (pgPsikologis) pgPsikologis.textContent = data.data.passing_grade_psikologis || 0;
        }
    } catch (error) {
        console.error('Error loading passing grades:', error);
    }
}

// Display tips
function displayTips(tipsData) {
    const tipsContainer = document.getElementById('tipsContainer');
    if (!tipsContainer) return;

    tipsContainer.innerHTML = tipsData.map(tip => `
                <div class="tip-item">
                    <div class="tip-header">
                        <h4>${tip.judul}</h4>
                        <span class="badge bg-info">${tip.tipe_tips}</span>
                    </div>
                    <div class="tip-content">${tip.konten}</div>
                    ${tip.contoh ? `<div class="tip-example"><strong>Contoh:</strong> ${tip.contoh}</div>` : ''}
                </div>
            `).join('');
}

// Display history
function displayHistory(historyData) {
    const historyContainer = document.getElementById('historyContainer');
    if (!historyContainer) return;

    historyContainer.innerHTML = historyData.map(exam => `
                <div class="history-item">
                    <div class="history-header">
                        <h4>${getCategoryName(exam.kategori)}</h4>
                        <span class="history-date">${formatDate(exam.tanggal_ujian, 'long')}</span>
                    </div>
                    <div class="history-details">
                        <div class="history-detail">
                            <span>Nilai:</span>
                            <span class="badge ${exam.status_lulus === 'Lulus' ? 'bg-success' : 'bg-warning'}">${exam.nilai_total || 0}</span>
                        </div>
                        <div class="history-detail">
                            <span>Status:</span>
                            <span>${exam.status_lulus || 'Belum Dinilai'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
}

// Update flag buttons
function updateFlagButtons() {
    if (!currentQuestions[currentQuestionIndex]) return;

    const questionId = currentQuestions[currentQuestionIndex].id;
    const flags = flaggedQuestions[questionId] || [];

    ['ragu', 'skip', 'review'].forEach(flagType => {
        const btn = document.getElementById(`flagButton_${flagType}`);
        if (btn) {
            if (flags.includes(flagType)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// Update bookmark button
function updateBookmarkButton() {
    if (!currentQuestions[currentQuestionIndex]) return;

    const questionId = currentQuestions[currentQuestionIndex].id;
    const bookmarkBtn = document.getElementById('bookmarkBtn');

    if (bookmarkBtn) {
        if (bookmarkedQuestions[questionId]) {
            bookmarkBtn.classList.add('btn-primary');
            bookmarkBtn.classList.remove('btn-outline-primary');
        } else {
            bookmarkBtn.classList.remove('btn-primary');
            bookmarkBtn.classList.add('btn-outline-primary');
        }
    }
}

// Update question navigation
function updateQuestionNav() {
    const questionNav = document.getElementById('questionNav');
    if (!questionNav) return;

    const savedAnswers = JSON.parse(sessionStorage.getItem('examAnswers') || '{}');

    questionNav.innerHTML = currentQuestions.map((question, index) => {
        let classes = 'nav-item';
        if (index === currentQuestionIndex) classes += ' current';
        if (flaggedQuestions[question.id]?.length > 0) classes += ' doubtful';
        if (bookmarkedQuestions[question.id]) classes += ' bookmarked';

        // Check if question is answered
        const hasAnswer = savedAnswers[question.id] || (document.querySelector(`input[name="answer"]:checked`) && currentQuestionIndex === index);
        if (hasAnswer) {
            classes += ' answered';
        } else if (index !== currentQuestionIndex) {
            classes += ' unanswered';
        }

        return `<button class="${classes}" onclick="goToQuestion(${index})" title="${hasAnswer ? 'Sudah dijawab' : 'Belum dijawab'}">${index + 1}</button>`;
    }).join('');
}

// Go to specific question
function goToQuestion(index) {
    if (index >= 0 && index < currentQuestions.length) {
        currentQuestionIndex = index;
        displayQuestion();
    }
}

// Load participant name from API profile, fallback to localStorage
async function loadParticipantName(authToken) {
    const display = document.getElementById('namaPesertaDisplay');
    const hidden = document.getElementById('namaPeserta');

    // Coba ambil dari localStorage dulu (cepat, tidak perlu fetch)
    let displayName = null;
    const cached = localStorage.getItem('namaLengkap') || localStorage.getItem('username');
    if (cached) displayName = cached;

    // Fetch dari API untuk data terbaru
    if (authToken) {
        try {
            const res = await fetch(AppConfig.apiUrl('auth.php?action=get_profile'), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    displayName = data.user.nama_lengkap || data.user.username || displayName;
                    // Update cache
                    localStorage.setItem('namaLengkap', displayName);
                }
            }
        } catch (e) { /* gunakan cache */ }
    }

    if (display) display.textContent = displayName || 'Pengguna';
    if (hidden) hidden.value = displayName || '';
}

// Called by ujian.html after loadExamComponents() finishes injecting the DOM
function initUIAfterLoad() {
    // Require authentication
    if (!RBAC.isAuthenticated()) {
        window.location.href = '../login.html';
        return;
    }

    const userRole = localStorage.getItem('userRole') || 'guest';
    const authToken = localStorage.getItem('authToken');

    // Load exam types and categories (DOM elements now exist)
    loadExamTypes();
    loadKategoriFilter();

    // Load passing grades from database (will update default values)
    setTimeout(() => loadPassingGrades('default'), 500);

    // Load participant name from API profile
    loadParticipantName(authToken);

    // Handle URL parameter to show correct screen
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    // Wait for content to load before handling URL parameters
    const checkContentLoaded = setInterval(() => {
        const historyScreen = document.getElementById('historyScreen');
        const welcomeScreen = document.getElementById('welcomeScreen');

        if (historyScreen && welcomeScreen) {
            clearInterval(checkContentLoaded);

            if (action === 'start_exam') {
                if (!authToken) {
                    window.location.href = '../login.html';
                    return;
                }
                // Clean the action= param from URL so back/forward won't re-trigger
                history.replaceState(null, '', 'ujian.html');
                mulaiUjian();
            } else if (action === 'history') {
                // Show history screen regardless of auth status for testing
                showHistoryScreen();

                if (!authToken) {
                    window.location.href = '../login.html';
                    return;
                }
                // Clean URL
                history.replaceState(null, '', 'ujian.html?action=history');
                lihatRiwayat();
            }
        }
    }, 100);

    // Update welcome message based on role
    const welcomeTitle = document.querySelector('.header-section h1');
    if (welcomeTitle) {
        if (userRole === 'admin') {
            welcomeTitle.innerHTML = '<i class="fas fa-user-shield"></i> Selamat Datang, Administrator!';
        } else if (userRole === 'user' && authToken) {
            welcomeTitle.innerHTML = '<i class="fas fa-user-graduate"></i> Selamat Datang, Peserta Ujian!';
        }
    }

    // Show/hide admin button based on role
    const adminBtn = document.getElementById('adminPanelBtn');
    if (adminBtn) {
        adminBtn.style.display = userRole === 'admin' ? 'inline-block' : 'none';
    }

    // Update login/logout button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        if (authToken) {
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginBtn.onclick = () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
                window.location.href = '../login.html';
            };
        } else {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginBtn.onclick = () => {
                window.location.href = '../login.html';
            };
        }
    }
}

// Initialize anti-cheat system
initAntiCheat();

// Show exam screen
// Track whether exam is actively running (for beforeunload)
let examIsActive = false;

function showExamScreen() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('historyScreen').classList.add('hidden');
    document.getElementById('examScreen').classList.remove('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('discussionScreen').classList.add('hidden');

    // Set display nama peserta
    const displayNama = document.getElementById('displayNama');
    const namaInput = document.getElementById('namaPeserta');
    if (displayNama) {
        const nama = namaInput && namaInput.value ? namaInput.value :
            localStorage.getItem('username') || 'Peserta';
        displayNama.textContent = nama;
    }

    // Activate beforeunload warning
    examIsActive = true;
    window.onbeforeunload = function (e) {
        if (!examIsActive) return undefined;
        const msg = 'Ujian sedang berlangsung! Jika Anda meninggalkan halaman ini, progress ujian akan hilang.';
        e.preventDefault();
        e.returnValue = msg;
        return msg;
    };
}

// Batalkan ujian yang sedang berlangsung
async function batalkanUjian() {
    if (!examIsActive) return;

    const soalDijawab = Object.keys(JSON.parse(sessionStorage.getItem('examAnswers') || '{}')).length;
    const totalSoal = currentQuestions.length;

    showConfirm(
        `<strong>Batalkan Ujian?</strong><br><br>` +
        `Anda sudah menjawab <strong>${soalDijawab} dari ${totalSoal} soal</strong>.<br>` +
        `<span class="text-danger">Semua jawaban akan hilang dan tidak dinilai.</span><br><br>` +
        `Apakah Anda yakin ingin membatalkan ujian ini?`,
        async function () {
            // Confirmed — clear exam state
            examIsActive = false;
            window.onbeforeunload = null;
            clearInterval(timerInterval);
            timerInterval = null;
            sessionStorage.removeItem('examAnswers');
            currentQuestions = [];
            currentQuestionIndex = 0;
            isPracticeMode = false;

            // Cancel exam session if exists
            if (currentSessionId) {
                try {
                    await fetch(AppConfig.apiUrl('soal.php?action=cancel_exam'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({ sesi_id: currentSessionId })
                    }).catch(err => console.error('Error canceling exam:', err));
                } catch (error) {
                    console.error('Error canceling exam:', error);
                }
            }

            // Return to welcome screen — hide all other screens
            ['examScreen', 'historyScreen', 'resultScreen', 'discussionScreen'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
            document.getElementById('welcomeScreen').classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast('Ujian dibatalkan. Anda kembali ke menu utama.', 'warning', 4000);
        },
        null // Cancel button does nothing — stay in exam
    );
}

// Show history screen
function showHistoryScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const examScreen = document.getElementById('examScreen');
    const resultScreen = document.getElementById('resultScreen');
    const discussionScreen = document.getElementById('discussionScreen');
    const historyScreen = document.getElementById('historyScreen');

    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (examScreen) examScreen.classList.add('hidden');
    if (resultScreen) resultScreen.classList.add('hidden');
    if (discussionScreen) discussionScreen.classList.add('hidden');
    if (historyScreen) {
        historyScreen.classList.remove('hidden');
        historyScreen.classList.add('visible');
        historyScreen.style.display = 'block';
        historyScreen.style.visibility = 'visible';

        // Ensure the button is visible
        const historyBtn = document.querySelector('#historyScreen .btn-primary-custom');
        if (historyBtn) {
            historyBtn.classList.remove('hidden');
            historyBtn.classList.add('visible');
            historyBtn.style.display = 'inline-block';
            historyBtn.style.visibility = 'visible';
            historyBtn.style.opacity = '1';
        }
    }
}

// Show history screen with retry for dynamic content
function showHistoryScreenWithRetry(maxRetries = 5, delay = 100) {
    let retries = 0;

    function tryShow() {
        const historyScreen = document.getElementById('historyScreen');
        if (historyScreen) {
            showHistoryScreen();
            return true;
        }

        if (retries < maxRetries) {
            retries++;
            setTimeout(tryShow, delay);
        }
        return false;
    }

    return tryShow();
}

// Go back to welcome screen
function kembaliKeWelcome() {
    document.getElementById('examScreen').classList.add('hidden');
    document.getElementById('historyScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Mapping exam type code → kategori names yang relevan
const EXAM_TYPE_KATEGORI_MAP = {
    'SKD': ['TWK', 'TIU', 'TKP', 'SKD'],
    'SKB': ['SKB', 'TKB'],
    'UTBK': ['TPA', 'UTBK', 'SAINTEK', 'SOSHUM'],
    'TRYOUT': [], // kosong = tampilkan semua
};

// Load paket list filtered by exam type code
async function loadPaketByExamType(examTypeCode, paketSelect) {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_paket'));
        const data = await response.json();
        if (data.success && data.data.length > 0) {
            const allowedKategori = EXAM_TYPE_KATEGORI_MAP[examTypeCode.toUpperCase()] || [];
            const filtered = allowedKategori.length === 0
                ? data.data  // TRYOUT atau unknown → tampilkan semua
                : data.data.filter(p => {
                    if (!p.nama_kategori) return true; // paket campuran/full selalu tampil
                    return allowedKategori.includes(p.nama_kategori.toUpperCase());
                });
            const list = filtered.length > 0 ? filtered : data.data;
            paketSelect.innerHTML = '<option value="">-- Acak (semua paket) --</option>';
            list.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.nama_paket + (p.deskripsi ? ' — ' + p.deskripsi : '');
                paketSelect.appendChild(opt);
            });
            paketSelect.disabled = false;
        } else {
            paketSelect.innerHTML = '<option value="">Tidak ada paket tersedia</option>';
            paketSelect.disabled = true;
        }
    } catch (e) {
        console.error('Error loading paket:', e);
        paketSelect.innerHTML = '<option value="">Gagal memuat paket</option>';
        paketSelect.disabled = true;
    }
}

// Start exam
async function mulaiUjian() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    const examTypeSelect = document.getElementById('examTypeSelection');
    selectedExamTypeId = (examTypeSelect && examTypeSelect.value) ? parseInt(examTypeSelect.value) : null;

    // Validate exam type selection
    if (!selectedExamTypeId || !examTypeSelect.value) {
        showToast('Pilih jenis ujian terlebih dahulu!', 'error');
        examTypeSelect?.focus();
        return;
    }

    // Validate exam type data has duration
    if (!selectedExamTypeDurasi || selectedExamTypeDurasi < 1) {
        showToast('Data durasi ujian tidak valid', 'error');
        return;
    }

    const paketSelect = document.getElementById('paketSelection');
    const paketId = paketSelect && paketSelect.value ? paketSelect.value : null;
    selectedPaketId = paketId ? parseInt(paketId) : null;

    const url = paketId
        ? AppConfig.apiUrl(`soal.php?action=get_soal_by_paket&paket_id=${paketId}`)
        : AppConfig.apiUrl('soal.php?action=get_soal_acak');

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            window.location.href = '../login.html';
            return;
        }
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            currentQuestions = data.data;
            currentQuestionIndex = 0;
            currentAbility = 0; // Reset ability for new exam

            // Create exam session for CAT tracking
            if (!isPracticeMode) {
                try {
                    const sessionResponse = await fetch(AppConfig.apiUrl('soal.php?action=simpan_sesi'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            soal_teracak: JSON.stringify(currentQuestions.map(q => q.id))
                        })
                    });
                    const sessionData = await sessionResponse.json();
                    if (sessionData.success && sessionData.sesi_id) {
                        currentSessionId = sessionData.sesi_id;

                        // Enable CAT for this session
                        await fetch(AppConfig.apiUrl('soal.php?action=enable_cat'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                sesi_id: currentSessionId,
                                enabled: true
                            })
                        });
                    }
                } catch (error) {
                    console.error('Error creating session:', error);
                }
            }

            showExamScreen();
            displayQuestion();
            startTimer();
            // Hide Jawab Random button in production (only show in practice mode)
            if (!isPracticeMode) {
                const jawabRandomBtn = document.getElementById('jawabRandomBtn');
                if (jawabRandomBtn) jawabRandomBtn.style.display = 'none';
            }
        } else {
            showToast(data.error || 'Tidak ada soal tersedia untuk paket ini', 'error');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('Terjadi kesalahan saat memuat soal', 'error');
    }
}

// Start practice mode
async function mulaiLatihan() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_soal_acak&limit=10'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();
        if (data.success) {
            currentQuestions = data.data;
            currentQuestionIndex = 0;
            isPracticeMode = true;
            // Practice mode settings
            console.log('Practice mode enabled - no timer, instant feedback');
            showExamScreen();
            displayQuestion();
            // Show Jawab Random button during development
            document.getElementById('jawabRandomBtn').style.display = 'inline-block';
        } else {
            showToast('Gagal memuat soal latihan', 'error');
        }
    } catch (error) {
        console.error('Error loading practice questions:', error);
        showToast('Terjadi kesalahan saat memuat soal latihan', 'error');
    }
}

// Jawab Random - Development/testing feature
async function jawabRandom() {
    if (!currentQuestions || currentQuestions.length === 0) {
        showToast('Tidak ada soal untuk dijawab', 'warning');
        return;
    }

    const confirmed = await new Promise(resolve => {
        showConfirm('Anda yakin ingin menjawab semua soal secara random? Ini akan menyelesaikan ujian secara otomatis.', () => resolve(true), () => resolve(false));
    });
    if (!confirmed) return;

    // Randomly answer all questions
    const options = ['A', 'B', 'C', 'D', 'E'];
    for (let i = 0; i < currentQuestions.length; i++) {
        const randomOption = options[Math.floor(Math.random() * options.length)];
        currentQuestions[i].userAnswer = randomOption;

        // Update the UI to show the answer
        if (i === currentQuestionIndex) {
            const optionElement = document.querySelector(`input[value="${randomOption}"]`);
            if (optionElement) {
                optionElement.checked = true;
            }
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Auto-submit the exam with fallback
    try {
        showToast('Semua soal telah dijawab secara random. Mensubmit ujian...', 'info');
        await finalizeExam();
    } catch (error) {
        console.error('Error in finalizeExam:', error);
        showToast('Terjadi kesalahan saat submit otomatis. Selesaikan ujian secara manual.', 'error');
    }
}

// View tips
async function lihatTips() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_tips_tricks'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();
        if (data.success) {
            // Show tips screen
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('tipsScreen').classList.remove('hidden');
            displayTips(data.data);
        } else {
            showToast('Gagal memuat tips', 'error');
        }
    } catch (error) {
        console.error('Error loading tips:', error);
        showToast('Terjadi kesalahan saat memuat tips', 'error');
    }
}

// View history
async function lihatRiwayat() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_riwayat_ujian'), {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            window.location.href = '../login.html';
            return;
        }
        const data = await response.json();
        // Show history screen regardless of data success
        showHistoryScreen();
        if (data.success) {
            displayHistory(data.data);
        } else {
            console.error('Gagal memuat riwayat ujian:', data.error);
        }
    } catch (error) {
        console.error('Error loading history:', error);
        // Still show history screen even on error with retry
        showHistoryScreenWithRetry();
    }
}

// Flag question
function flagQuestion(flagType) {
    if (!currentQuestions[currentQuestionIndex]) return;

    const questionId = currentQuestions[currentQuestionIndex].id;
    if (!flaggedQuestions[questionId]) {
        flaggedQuestions[questionId] = [];
    }

    const index = flaggedQuestions[questionId].indexOf(flagType);
    if (index > -1) {
        flaggedQuestions[questionId].splice(index, 1);
    } else {
        flaggedQuestions[questionId].push(flagType);
    }

    // Add bookmark button
    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'btn btn-outline-warning bookmark-btn';
    bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Bookmark';
    bookmarkBtn.onclick = () => toggleBookmark(currentQuestionIndex);
    if (bookmarkedQuestions[currentQuestionIndex]) {
        bookmarkBtn.classList.add('active');
        bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Bookmarked';
    }

    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        actionButtons.insertBefore(bookmarkBtn, actionButtons.firstChild);
    }

    updateFlagButtons();
}

// Toggle bookmark
function toggleBookmark() {
    if (!currentQuestions[currentQuestionIndex]) return;

    const questionId = currentQuestions[currentQuestionIndex].id;
    bookmarkedQuestions[questionId] = !bookmarkedQuestions[questionId];

    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (bookmarkedQuestions[questionId]) {
        bookmarkBtn.classList.add('btn-primary');
        bookmarkBtn.classList.remove('btn-outline-primary');
    } else {
        bookmarkBtn.classList.remove('btn-primary');
        bookmarkBtn.classList.add('btn-outline-primary');
    }
}

// Previous question
function sebelumnya() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Next question
function selanjutnya() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

// Complete exam - with unanswered question check
async function selesaiUjian() {
    // Check for unanswered questions
    unansweredQuestionsList = getUnansweredQuestions();

    if (unansweredQuestionsList.length > 0) {
        // Show dialog: answer unanswered or finish anyway
        const shouldAnswer = await showUnansweredDialog(unansweredQuestionsList);

        if (shouldAnswer) {
            // Start answering unanswered questions
            currentUnansweredIndex = 0;
            showUnansweredQuestion(0);
            return; // Don't finish yet
        }
        // If user clicks Cancel, continue to finish anyway
    }

    // Final confirmation with warning if there are still unanswered questions
    const confirmationMessage = unansweredQuestionsList.length > 0
        ? `Anda masih memiliki ${unansweredQuestionsList.length} soal yang belum dijawab. Apakah Anda yakin ingin menyelesaikan ujian?`
        : 'Apakah Anda yakin ingin menyelesaikan ujian?';

    showConfirm(confirmationMessage, async () => {
        // Finalize exam - this will submit and show expert system ONLY after truly finished
        await finalizeExam();
    });
}

// View explanation
function lihatPembahasan() {
    if (!currentQuestions || currentQuestions.length === 0) {
        showToast('Tidak ada soal untuk ditampilkan pembahasannya', 'warning');
        return;
    }
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('discussionScreen').classList.remove('hidden');
    displayPembahasan(currentQuestions);
}

// Display pembahasan
function displayPembahasan(questions) {
    const pembahasanContainer = document.getElementById('pembahasanContainer');
    if (!pembahasanContainer) return;

    pembahasanContainer.innerHTML = questions.map((question, index) => `
                <div class="pembahasan-item">
                    <div class="pembahasan-header">
                        <h5>Soal ${index + 1}</h5>
                        <span class="badge bg-info">${getCategoryName(question.kategori_id)}</span>
                    </div>
                    <div class="pembahasan-question">${question.pertanyaan}</div>
                    <div class="pembahasan-answer">
                        <strong>Jawaban Benar:</strong> ${question.jawaban_benar}
                    </div>
                    <div class="pembahasan-explanation">
                        <strong>Pembahasan:</strong>
                        ${question.pemabahasan || 'Belum ada pembahasan'}
                    </div>
                </div>
            `).join('');
}

// View learning recommendations
async function lihatRekomendasiBelajar() {
    try {
        // Fetch weakness data
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_my_weakness'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const weaknessData = await response.json();

        // Fetch category weakness for detailed analysis
        let categoryWeaknessData = null;
        try {
            const catResponse = await fetch(AppConfig.apiUrl('soal.php?action=get_kategori_weakness'), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            categoryWeaknessData = await catResponse.json();
        } catch (catError) {
            console.log('Category weakness not available:', catError);
        }

        // Fetch all learning materials (without soal_id filter)
        const materialsResponse = await fetch(AppConfig.apiUrl('soal.php?action=get_all_bahan_pelajaran'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const materialsData = await materialsResponse.json();

        if (weaknessData.success && materialsData.success) {
            document.getElementById('resultScreen').classList.add('hidden');
            document.getElementById('learningScreen').classList.remove('hidden');
            displayRekomendasi(weaknessData.data, materialsData.data);
        } else {
            showToast('Gagal memuat rekomendasi belajar', 'error');
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        showToast('Terjadi kesalahan saat memuat rekomendasi', 'error');
    }
}

// Display learning recommendations
function displayRekomendasi(weaknessData, materialsData) {
    const recommendationsContainer = document.getElementById('learningRecommendations');
    if (!recommendationsContainer) return;

    // Filter materials based on weak categories
    const weakCategories = weaknessData.filter(w => w.persen_benar < 70).map(w => w.nama_kategori);
    const relevantMaterials = materialsData.filter(m =>
        weakCategories.includes(m.kategori) || !m.kategori
    );

    if (relevantMaterials.length === 0) {
        recommendationsContainer.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-check-circle fa-3x mb-3"></i>
                        <p>Tidak ada rekomendasi belajar saat ini</p>
                        <small>Performa Anda sudah baik!</small>
                    </div>
                `;
        return;
    }

    recommendationsContainer.innerHTML = relevantMaterials.map(material => {
        // Construct file path based on the uploads folder structure
        const filePath = material.file_path || `../uploads/bahan_pelajaran/text/${material.file_name}`;

        return `
                <div class="recommendation-item">
                    <div class="recommendation-header">
                        <h5>${material.judul || material.nama}</h5>
                        <span class="badge bg-primary">${material.kategori || 'Umum'}</span>
                    </div>
                    <div class="recommendation-content">
                        <p>${material.deskripsi || material.konten || 'Bahan pelajaran untuk meningkatkan pemahaman'}</p>
                        <a href="${filePath}" target="_blank" class="btn btn-primary-custom btn-sm">
                            <i class="fas fa-download"></i> Download
                        </a>
                    </div>
                </div>
            `;
    }).join('');
}

// Retry exam
function ulangUjian() {
    kembaliKeWelcome();
}

// Export PDF
async function exportPDF() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_riwayat_ujian&limit=1'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const examData = data.data[0];

            // Create PDF content
            const pdfContent = `
                        HASIL UJIAN - SEKOLAH KEDINASAN
                        =================================
                        
                        Nama Peserta: ${localStorage.getItem('username') || 'User'}
                        Tanggal Ujian: ${formatDate(examData.tanggal_ujian, 'long')}
                        
                        HASIL UJIAN
                        -----------
                        Nilai Total: ${examData.nilai_total || 0}
                        Status: ${examData.status_lulus || 'Belum Dinilai'}
                        
                        DETAIL NILAI
                        ------------
                        TWK: ${examData.nilai_twk || 0}
                        TIU: ${examData.nilai_tiu || 0}
                        TKP: ${examData.nilai_tkp || 0}
                        TPA: ${examData.nilai_tpa || 0}
                        PSIKOLOGIS: ${examData.nilai_psikologis || 0}
                        
                        Keterangan:
                        - Lulus jika nilai TWK >= 65, TIU >= 80, TKP >= 166
                        - Hasil ini sah dan dapat digunakan sebagai referensi
                    `;

            // Create download link
            const blob = new Blob([pdfContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hasil_ujian_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Hasil ujian berhasil diexport!', 'success');
        } else {
            showToast('Tidak ada data ujian untuk diexport', 'warning');
        }
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showToast('Terjadi kesalahan saat export PDF', 'error');
    }
}

// Download certificate
async function downloadCertificate() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_riwayat_ujian&limit=1'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const examData = data.data[0];

            if (examData.status_lulus !== 'Lulus') {
                showToast('Sertifikat hanya tersedia untuk peserta yang lulus ujian', 'warning');
                return;
            }

            // Check if certificate already exists
            const certResponse = await fetch(AppConfig.apiUrl(`soal.php?action=get_sertifikat&hasil_id=${examData.id}`), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const certData = await certResponse.json();

            if (certData.success && certData.data) {
                // Certificate exists, download it
                const certificate = certData.data;

                // Verify certificate validity
                try {
                    const verifyResponse = await fetch(AppConfig.apiUrl('soal.php?action=verify_certificate'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({ hasil_id: examData.id })
                    });
                    const verifyData = await verifyResponse.json();
                    if (verifyData.success && !verifyData.data.valid) {
                        showToast('Sertifikat tidak valid. Silakan generate ulang.', 'warning');
                    }
                } catch (verifyError) {
                    console.log('Certificate verification not available:', verifyError);
                }

                // Create certificate content
                const certContent = `
                            ╔══════════════════════════════════════════════════════════════╗
                            ║              SERTIFIKAT KELULUSAN                      ║
                            ║           UJIAN SEKOLAH KEDINASAN                     ║
                            ╠══════════════════════════════════════════════════════════════╣
                            ║                                                           ║
                            ║  Diberikan kepada:                                       ║
                            ║  ${localStorage.getItem('username') || 'Peserta'}           ║
                            ║                                                           ║
                            ║  Atas kelulusan dalam ujian Sekolah Kedinasan           ║
                            ║                                                           ║
                            ║  Nilai Total: ${examData.nilai_total || 0}                       ║
                            ║  Tanggal: ${formatDate(examData.tanggal_ujian, 'long')}              ║
                            ║                                                           ║
                            ║  Kode Verifikasi: ${certificate.verification_code || 'N/A'}                ║
                            ║                                                           ║
                            ╠══════════════════════════════════════════════════════════════╣
                            ║  Sertifikat ini sah dan dapat digunakan sebagai bukti   ║
                            ║  kelulusan peserta ujian Sekolah Kedinasan             ║
                            ╚══════════════════════════════════════════════════════════════╝
                        `;

                // Create download link
                const blob = new Blob([certContent], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sertifikat_${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                showToast('Sertifikat berhasil didownload!', 'success');
            } else {
                // Generate new certificate using generate_certificate endpoint
                try {
                    const generateResponse = await fetch(AppConfig.apiUrl('soal.php?action=generate_certificate'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            hasil_id: examData.id,
                            nama_peserta: localStorage.getItem('username') || 'Peserta'
                        })
                    });
                    const generateData = await generateResponse.json();

                    if (generateData.success) {
                        showToast('Sertifikat berhasil dibuat! Silakan download kembali.', 'success');
                    } else {
                        // Fallback to generate_sertifikat
                        const fallbackResponse = await fetch(AppConfig.apiUrl('soal.php?action=generate_sertifikat'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                            },
                            body: JSON.stringify({
                                hasil_id: examData.id,
                                nama_peserta: localStorage.getItem('username') || 'Peserta'
                            })
                        });
                        const fallbackData = await fallbackResponse.json();

                        if (fallbackData.success) {
                            showToast('Sertifikat berhasil dibuat! Silakan download kembali.', 'success');
                        } else {
                            showToast('Gagal membuat sertifikat: ' + (fallbackData.error || 'Unknown error'), 'error');
                        }
                    }
                } catch (certError) {
                    console.error('Error with generate_certificate, trying fallback:', certError);
                    // Fallback to generate_sertifikat
                    const fallbackResponse = await fetch(AppConfig.apiUrl('soal.php?action=generate_sertifikat'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            hasil_id: examData.id,
                            nama_peserta: localStorage.getItem('username') || 'Peserta'
                        })
                    });
                    const fallbackData = await fallbackResponse.json();

                    if (fallbackData.success) {
                        showToast('Sertifikat berhasil dibuat! Silakan download kembali.', 'success');
                    } else {
                        showToast('Gagal membuat sertifikat: ' + (fallbackData.error || 'Unknown error'), 'error');
                    }
                }
            }
        } else {
            showToast('Tidak ada data ujian untuk sertifikat', 'warning');
        }
    } catch (error) {
        console.error('Error downloading certificate:', error);
        showToast('Terjadi kesalahan saat download sertifikat', 'error');
    }
}

// Return to result screen
function kembaliKeHasil() {
    document.getElementById('discussionScreen').classList.add('hidden');
    document.getElementById('learningScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
}

// Toast Notification Helper
function showToast(message, type = 'success', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toastId = 'toast_' + Date.now();
    const typeMap = {
        'success': { bg: 'text-success', icon: 'fa-check-circle' },
        'error': { bg: 'text-danger', icon: 'fa-times-circle' },
        'warning': { bg: 'text-warning', icon: 'fa-exclamation-triangle' },
        'info': { bg: 'text-info', icon: 'fa-info-circle' }
    };

    const toastHTML = `
                <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong class="me-auto ${typeMap[type].bg}">
                            <i class="fas ${typeMap[type].icon}"></i> ${type.charAt(0).toUpperCase() + type.slice(1)}
                        </strong>
                        <small>Just now</small>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                </div>
            `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: duration });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// Confirm Modal Helper
let confirmCallback = null;

function showConfirm(message, onConfirm, onCancel = null) {
    const modalTitle = document.querySelector('#confirmModal .modal-title');
    const modalMessage = document.getElementById('confirmModalMessage');
    const okButton = document.getElementById('confirmModalOK');

    if (modalTitle) modalTitle.textContent = 'Konfirmasi';
    if (modalMessage) modalMessage.innerHTML = `<i class="fas fa-exclamation-triangle text-warning me-2"></i> ${message}`;

    confirmCallback = onConfirm;

    if (okButton) {
        okButton.onclick = () => {
            if (confirmCallback) confirmCallback();
            const confirmModal = document.getElementById('confirmModal');
            if (confirmModal) bootstrap.Modal.getInstance(confirmModal).hide();
        };
    }

    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        const modal = new bootstrap.Modal(confirmModal);
        modal.show();

        modal._element.addEventListener('hidden.bs.modal', function handler() {
            if (onCancel) onCancel();
            modal._element.removeEventListener('hidden.bs.modal', handler);
        }, { once: true });
    }
}

// Loading Modal Helper
let loadingModalInstance = null;

function showLoading(message = 'Memuat...') {
    document.getElementById('loadingModalMessage').textContent = message;
    loadingModalInstance = new bootstrap.Modal(document.getElementById('loadingModal'), {
        backdrop: 'static',
        keyboard: false
    });
    loadingModalInstance.show();
    return loadingModalInstance;
}

function hideLoading() {
    if (loadingModalInstance) {
        loadingModalInstance.hide();
        loadingModalInstance = null;
    }
}
