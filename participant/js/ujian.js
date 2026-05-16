        // Swipe gesture support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        document.addEventListener('touchend', function(e) {
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
        document.addEventListener('keydown', function(e) {
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

        // Load exam types from database
        async function loadExamTypes() {
            try {
                const response = await fetch('../api/soal.php?action=get_exam_types', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                const data = await response.json();
                const select = document.getElementById('examTypeSelection');
                
                if (data.success && data.data.length > 0) {
                    select.innerHTML = '<option value="">Pilih jenis ujian...</option>';
                    
                    data.data.forEach(type => {
                        const option = document.createElement('option');
                        option.value = type.code;
                        option.textContent = type.name;
                        option.dataset.durasi = type.durasi_menit;
                        option.dataset.jumlah = type.jumlah_soal;
                        select.appendChild(option);
                    });
                    
                    // Enable paket selection after exam type chosen
                    select.addEventListener('change', function() {
                        const paketSelect = document.getElementById('paketSelection');
                        if (this.value) {
                            paketSelect.disabled = false;
                            paketSelect.innerHTML = '<option value="">Pilih paket...</option>';
                            // TODO: Load paket based on exam type
                        } else {
                            paketSelect.disabled = true;
                            paketSelect.innerHTML = '<option value="">Pilih jenis ujian terlebih dahulu</option>';
                        }
                    });
                } else {
                    select.innerHTML = '<option value="skd">SKD (Default)</option>';
                }
            } catch (error) {
                console.error('Error loading exam types:', error);
                document.getElementById('examTypeSelection').innerHTML = 
                    '<option value="skd">SKD (Seleksi Kompetensi Dasar)</option>';
            }
        }

        // Load categories for filter dropdown
        async function loadKategoriFilter() {
            try {
                const response = await fetch('../api/soal.php?action=get_kategori', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const data = await response.json();
                
                const select = document.getElementById('filterKategori');
                if (data.success && data.data.length > 0) {
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

        // DOMContentLoaded handler
        document.addEventListener('DOMContentLoaded', function() {
            // Load exam types from database
            loadExamTypes();
            // Load categories for filter
            loadKategoriFilter();

            // Auto-fill participant name from logged-in user
            const namaPesertaInput = document.getElementById('namaPeserta');
            const username = localStorage.getItem('username');
            const userData = localStorage.getItem('userData');

            if (namaPesertaInput && username) {
                // Try to get full name from userData if available
                let displayName = username;
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        displayName = user.nama_lengkap || user.nama || user.full_name || username;
                    } catch (e) {
                        displayName = username;
                    }
                }
                namaPesertaInput.value = displayName;
                console.log('Auto-filled participant name:', displayName);
            }

            // Check URL parameters to determine which screen to show
            const urlParams = new URLSearchParams(window.location.search);
            const action = urlParams.get('action');

            if (action === 'start_exam') {
                mulaiUjian();
            } else if (action === 'history') {
                lihatRiwayat();
            } else {
                // Show welcome screen by default
            }
        });

        // Display current question
        function displayQuestion() {
            if (!currentQuestions[currentQuestionIndex]) return;
            
            const question = currentQuestions[currentQuestionIndex];
            const questionContainer = document.querySelector('.question-card');
            
            questionContainer.innerHTML = `
                <div class="question-number">Soal ${currentQuestionIndex + 1}/${currentQuestions.length}</div>
                <span class="category-badge category-${question.kategori_id}">${getCategoryName(question.kategori_id)}</span>
                <div class="question-text">${question.pertanyaan}</div>
                <div class="options-container">
                    <label class="option-label">
                        <input type="radio" name="answer" value="A"> ${question.opsi_a}
                    </label>
                    <label class="option-label">
                        <input type="radio" name="answer" value="B"> ${question.opsi_b}
                    </label>
                    <label class="option-label">
                        <input type="radio" name="answer" value="C"> ${question.opsi_c}
                    </label>
                    <label class="option-label">
                        <input type="radio" name="answer" value="D"> ${question.opsi_d}
                    </label>
                    <label class="option-label">
                        <input type="radio" name="answer" value="E"> ${question.opsi_e}
                    </label>
                </div>
            `;
            
            updateFlagButtons();
            updateBookmarkButton();
            updateQuestionNav();
            
            // Add auto-next feature after selecting answer
            setTimeout(() => {
                document.querySelectorAll('input[name="answer"]').forEach(radio => {
                    radio.addEventListener('change', () => {
                        // Save answer to localStorage/session
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
        function saveAnswer(questionIndex, answer) {
            const savedAnswers = JSON.parse(sessionStorage.getItem('examAnswers') || '{}');
            savedAnswers[currentQuestions[questionIndex].id] = answer;
            sessionStorage.setItem('examAnswers', JSON.stringify(savedAnswers));
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
            timeRemaining = 60 * 60; // 60 minutes in seconds
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
            const answers = {};
            const savedAnswers = JSON.parse(sessionStorage.getItem('examAnswers') || '{}');
            
            currentQuestions.forEach((question, index) => {
                // Try to get from current form first
                const selectedAnswer = document.querySelector(`input[name="answer"]:checked`);
                if (selectedAnswer) {
                    answers[question.id] = selectedAnswer.value;
                } else {
                    // Fallback to saved session
                    answers[question.id] = savedAnswers[question.id] || null;
                }
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
        async function showUnansweredDialog(unanswered) {
            const questionNumbers = unanswered.map(u => u.index + 1).join(', ');
            const userChoice = confirm(
                `Anda masih memiliki ${unanswered.length} soal yang belum dijawab (Soal: ${questionNumbers}).\n\n` +
                `Klik "OK" untuk menjawab soal yang belum dijawab.\n` +
                `Klik "Cancel" untuk tetap menyelesaikan ujian.`
            );
            return userChoice; // true = answer unanswered, false = finish anyway
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
                const response = await fetch('../api/soal.php?action=submit_ujian', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({
                        answers: answers,
                        is_practice: isPracticeMode
                    })
                });
                const data = await response.json();
                if (data.success) {
                    showResultScreen(data.data);
                    return data.data; // Return result for further processing
                } else {
                    alert('Gagal menyelesaikan ujian');
                    return null;
                }
            } catch (error) {
                console.error('Error submitting exam:', error);
                alert('Terjadi kesalahan saat menyelesaikan ujian');
                return null;
            }
        }

        // Global variables for unanswered flow
        let unansweredQuestionsList = [];
        let currentUnansweredIndex = 0;

        // Finalize exam - called ONLY when exam is truly finished
        async function finalizeExam() {
            // Clear session storage
            sessionStorage.removeItem('examAnswers');
            
            // Submit exam
            const resultData = await submitExamData();
            
            // Only show expert system after successful submission
            if (resultData) {
                const answers = collectAnswers();
                showExpertAfterExam(resultData, answers);
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
            
            // Populate result screen elements that exist in HTML
            const totalScoreEl = document.getElementById('totalScore');
            const passFailEl = document.getElementById('passFail');
            const twkScoreEl = document.getElementById('twkScore');
            const tiuScoreEl = document.getElementById('tiuScore');
            const tkpScoreEl = document.getElementById('tkpScore');
            const resultNamaEl = document.getElementById('resultNama');
            
            if (totalScoreEl) totalScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_total, 0));
            if (passFailEl) {
                passFailEl.textContent = resultData.status_lulus || 'Belum Dinilai';
                passFailEl.className = 'pass-fail ' + (resultData.status_lulus === 'Lulus' ? 'text-success' : 'text-warning');
            }
            if (twkScoreEl) twkScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_twk, 0));
            if (tiuScoreEl) tiuScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_tiu, 0));
            if (tkpScoreEl) tkpScoreEl.textContent = formatScore(safeParseFloat(resultData.nilai_tkp, 0));
            if (resultNamaEl) resultNamaEl.textContent = localStorage.getItem('username') || 'Peserta';
        }

        // Display tips
        function displayTips(tipsData) {
            const tipsContainer = document.getElementById('tipsContainer');
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

        // Role-based UI updates on page load
        document.addEventListener('DOMContentLoaded', () => {
            const userRole = localStorage.getItem('userRole') || 'guest';
            const authToken = localStorage.getItem('authToken');
            
            // Handle URL parameter to show exam screen
            const urlParams = new URLSearchParams(window.location.search);
            const action = urlParams.get('action');
            
            if (action === 'start_exam') {
                showExamScreen();
            } else if (action === 'history') {
                showHistoryScreen();
            }
            
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
        });

        // Show exam screen
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
        }

        // Show history screen
        function showHistoryScreen() {
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('examScreen').classList.add('hidden');
            document.getElementById('historyScreen').classList.remove('hidden');
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

        // Start exam
        async function mulaiUjian() {
            try {
                const response = await fetch('../api/soal.php?action=get_soal_acak&limit=20', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    currentQuestions = data.data;
                    currentQuestionIndex = 0;
                    showExamScreen();
                    displayQuestion();
                    startTimer();
                } else {
                    alert('Gagal memuat soal');
                }
            } catch (error) {
                console.error('Error loading questions:', error);
                alert('Terjadi kesalahan saat memuat soal');
            }
        }

        // Start practice mode
        async function mulaiLatihan() {
            try {
                const response = await fetch('../api/soal.php?action=get_soal_acak&limit=10', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    currentQuestions = data.data;
                    currentQuestionIndex = 0;
                    isPracticeMode = true;
                    showExamScreen();
                    displayQuestion();
                } else {
                    alert('Gagal memuat soal latihan');
                }
            } catch (error) {
                console.error('Error loading practice questions:', error);
                alert('Terjadi kesalahan saat memuat soal latihan');
            }
        }

        // View tips
        async function lihatTips() {
            try {
                const response = await fetch('../api/soal.php?action=get_tips_tricks', {
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
                    alert('Gagal memuat tips');
                }
            } catch (error) {
                console.error('Error loading tips:', error);
                alert('Terjadi kesalahan saat memuat tips');
            }
        }

        // View history
        async function lihatRiwayat() {
            try {
                const response = await fetch('../api/soal.php?action=get_riwayat_ujian', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    showHistoryScreen();
                    displayHistory(data.data);
                } else {
                    alert('Gagal memuat riwayat ujian');
                }
            } catch (error) {
                console.error('Error loading history:', error);
                alert('Terjadi kesalahan saat memuat riwayat');
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
            
            // Final confirmation
            showConfirm('Apakah Anda yakin ingin menyelesaikan ujian?', async () => {
                // Finalize exam - this will submit and show expert system ONLY after truly finished
                await finalizeExam();
            });
        }

        // View explanation
        function lihatPembahasan() {
            if (!currentQuestions || currentQuestions.length === 0) {
                alert('Tidak ada soal untuk ditampilkan pembahasannya');
                return;
            }
            document.getElementById('resultScreen').classList.add('hidden');
            document.getElementById('discussionScreen').classList.remove('hidden');
            displayPembahasan(currentQuestions);
        }

        // Display pembahasan
        function displayPembahasan(questions) {
            const pembahasanContainer = document.getElementById('pembahasanContainer');
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
                const response = await fetch('../api/soal.php?action=get_my_weakness', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const weaknessData = await response.json();
                
                // Fetch all learning materials (without soal_id filter)
                const materialsResponse = await fetch('../api/soal.php?action=get_all_bahan_pelajaran', {
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
                    alert('Gagal memuat rekomendasi belajar');
                }
            } catch (error) {
                console.error('Error loading recommendations:', error);
                alert('Terjadi kesalahan saat memuat rekomendasi');
            }
        }

        // Display learning recommendations
        function displayRekomendasi(weaknessData, materialsData) {
            const recommendationsContainer = document.getElementById('learningRecommendations');
            
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
                const response = await fetch('../api/soal.php?action=get_riwayat_ujian&limit=1', {
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
                    
                    alert('Hasil ujian berhasil diexport!');
                } else {
                    alert('Tidak ada data ujian untuk diexport');
                }
            } catch (error) {
                console.error('Error exporting PDF:', error);
                alert('Terjadi kesalahan saat export PDF');
            }
        }

        // Download certificate
        async function downloadCertificate() {
            try {
                const response = await fetch('../api/soal.php?action=get_riwayat_ujian&limit=1', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const data = await response.json();
                
                if (data.success && data.data.length > 0) {
                    const examData = data.data[0];
                    
                    if (examData.status_lulus !== 'Lulus') {
                        alert('Sertifikat hanya tersedia untuk peserta yang lulus ujian');
                        return;
                    }
                    
                    // Check if certificate already exists
                    const certResponse = await fetch(`../api/soal.php?action=get_sertifikat&hasil_id=${examData.id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });
                    const certData = await certResponse.json();
                    
                    if (certData.success && certData.data) {
                        // Certificate exists, download it
                        const certificate = certData.data;
                        
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
                        
                        alert('Sertifikat berhasil didownload!');
                    } else {
                        // Generate new certificate
                        const generateResponse = await fetch('../api/soal.php?action=generate_sertifikat', {
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
                            alert('Sertifikat berhasil dibuat! Silakan download kembali.');
                        } else {
                            alert('Gagal membuat sertifikat');
                        }
                    }
                } else {
                    alert('Tidak ada data ujian untuk sertifikat');
                }
            } catch (error) {
                console.error('Error downloading certificate:', error);
                alert('Terjadi kesalahan saat download sertifikat');
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

            modalTitle.textContent = 'Konfirmasi';
            modalMessage.innerHTML = `<i class="fas fa-exclamation-triangle text-warning me-2"></i> ${message}`;

            confirmCallback = onConfirm;

            okButton.onclick = () => {
                if (confirmCallback) confirmCallback();
                bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
            };

            const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
            modal.show();

            modal._element.addEventListener('hidden.bs.modal', function handler() {
                if (onCancel) onCancel();
                modal._element.removeEventListener('hidden.bs.modal', handler);
            }, { once: true });
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
