// Logout function
        function logout() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            window.location.href = '../login.html';
        }

        // Mobile section navigation
        function showMobileSection(section) {
            document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
            event.target.closest('.nav-item').classList.add('active');
            
            if (section === 'dashboard') {
                // Already on dashboard
            } else if (section === 'profile') {
                window.location.href = 'profile.html';
            }
        }

        // Accessibility functions
        function toggleAccessibilityMenu() {
            const menu = document.getElementById('accessibilityMenu');
            menu.classList.toggle('hidden');
        }

        function changeFontSize(size) {
            document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
            document.body.classList.add('font-' + size);
            localStorage.setItem('fontSize', size);
        }

        function changeContrast(contrast) {
            document.body.classList.remove('high-contrast');
            if (contrast === 'high') {
                document.body.classList.add('high-contrast');
            }
            localStorage.setItem('contrast', contrast);
        }

        let textToSpeechEnabled = false;
        let speechSynthesis = window.speechSynthesis;

        function toggleTextToSpeech(enabled) {
            textToSpeechEnabled = enabled;
            localStorage.setItem('textToSpeech', enabled);
            if (!enabled) {
                speechSynthesis.cancel();
            }
        }

        function speakText(text) {
            if (textToSpeechEnabled && speechSynthesis) {
                speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'id-ID';
                speechSynthesis.speak(utterance);
            }
        }

        // Load saved accessibility preferences
        function loadAccessibilityPreferences() {
            const fontSize = localStorage.getItem('fontSize') || 'medium';
            const contrast = localStorage.getItem('contrast') || 'normal';
            const textToSpeech = localStorage.getItem('textToSpeech') === 'true';

            const fontSizeSelect = document.getElementById('fontSizeSelect');
            const contrastSelect = document.getElementById('contrastSelect');
            const textToSpeechCheckbox = document.getElementById('textToSpeech');

            if (fontSizeSelect) {
                fontSizeSelect.value = fontSize;
            }
            if (contrastSelect) {
                contrastSelect.value = contrast;
            }
            if (textToSpeechCheckbox) {
                textToSpeechCheckbox.checked = textToSpeech;
            }

            changeFontSize(fontSize);
            changeContrast(contrast);
            toggleTextToSpeech(textToSpeech);
        }

        // Initialize Dashboard
        document.addEventListener('DOMContentLoaded', function() {
            // Check authentication
            if (!RBAC.isAuthenticated()) {
                logout();
                return;
            }

            // Load accessibility preferences
            loadAccessibilityPreferences();

            // Load dashboard components (which will then load dashboard data)
            loadDashboardComponents();
        });

        async function updateUserInfo() {
            try {
                const response = await fetch(AppConfig.apiUrl('auth.php?action=get_profile'), {
                    headers: RBAC.getAuthHeaders()
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        const user = data.user;
                        
                        // Set avatar initials
                        const userAvatarEl = document.getElementById('userAvatar');
                        if (userAvatarEl) {
                            const initials = (user.nama_lengkap || user.username || 'Pengguna').substring(0, 2).toUpperCase();
                            userAvatarEl.textContent = initials;
                        }
                        
                        // Set welcome message
                        const userNameEl = document.getElementById('userName');
                        if (userNameEl) {
                            userNameEl.textContent = `Selamat Datang, ${user.nama_lengkap || user.username || 'Pengguna'}!`;
                        }
                        
                        // Set user detail
                        const detailParts = [];
                        if (user.asal_sekolah) detailParts.push(user.asal_sekolah);
                        if (user.tahun_tamat) detailParts.push(`Lulusan ${user.tahun_tamat}`);
                        const userDetailEl = document.getElementById('userDetail');
                        if (userDetailEl) {
                            userDetailEl.textContent = detailParts.length > 0 ? detailParts.join(' • ') : 'Peserta Ujian';
                        }
                    }
                } else {
                    // Fallback to localStorage if API fails
                    const username = localStorage.getItem('username') || 'Pengguna';
                    const initials = username.substring(0, 2).toUpperCase();
                    const userAvatarEl = document.getElementById('userAvatar');
                    if (userAvatarEl) userAvatarEl.textContent = initials;
                    const userNameEl = document.getElementById('userName');
                    if (userNameEl) userNameEl.textContent = `Selamat Datang, ${username}!`;
                    const userDetailEl = document.getElementById('userDetail');
                    if (userDetailEl) userDetailEl.textContent = 'Peserta Ujian';
                }
            } catch (error) {
                console.error('Error loading user info:', error);
                // Fallback to localStorage
                const username = localStorage.getItem('username') || 'Pengguna';
                const initials = username.substring(0, 2).toUpperCase();
                const userAvatarEl = document.getElementById('userAvatar');
                if (userAvatarEl) userAvatarEl.textContent = initials;
                const userNameEl = document.getElementById('userName');
                if (userNameEl) userNameEl.textContent = `Selamat Datang, ${username}!`;
                const userDetailEl = document.getElementById('userDetail');
                if (userDetailEl) userDetailEl.textContent = 'Peserta Ujian';
            }
        }

        function updateProgressChart(examData = []) {
            initProgressChart(examData);
        }

        function initProgressChart(examData = []) {
            const ctx = document.getElementById('progressChart');
            
            // Check if canvas element exists
            if (!ctx) {
                console.warn('Progress chart canvas element not found');
                return;
            }
            
            // Destroy existing chart before creating new one
            const existingChart = Chart.getChart(ctx);
            if (existingChart) {
                existingChart.destroy();
            }
            
            // Prepare chart data from actual exam history
            let labels = [];
            let scoreData = [];
            let avgData = [];

            if (examData && examData.length > 0) {
                const recentExams = examData.slice(-10).reverse();
                let runningSum = 0;
                recentExams.forEach((exam, index) => {
                    const d = new Date(exam.tanggal_ujian);
                    labels.push(formatDate(exam.tanggal_ujian, 'medium'));
                    const score = exam.nilai_total || 0;
                    scoreData.push(score);
                    runningSum += score;
                    avgData.push(Math.round(runningSum / (index + 1)));
                });
            } else {
                labels = ['Belum ada data'];
                scoreData = [0];
                avgData = [0];
            }
            
            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Skor Ujian',
                        data: scoreData,
                        borderColor: '#1e40af',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Rata-rata',
                        data: avgData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMax: Math.max(500, ...scoreData) + 50
                        }
                    }
                }
            });
        }

        function updateAIAssessment(weaknessData) {
            const aiRecommendationEl = document.getElementById('aiRecommendation');
            const aiConfidenceEl = document.getElementById('aiConfidence');
            const aiConfidenceBarEl = document.getElementById('aiConfidenceBar');
            const readinessScoreEl = document.getElementById('readinessScore');
            const daysRemainingEl = document.getElementById('daysRemaining');

            if (!weaknessData || weaknessData.length === 0) {
                if (aiRecommendationEl) aiRecommendationEl.textContent = 'Belum cukup data untuk analisis AI. Ikuti ujian untuk mendapatkan rekomendasi.';
                if (aiConfidenceEl) aiConfidenceEl.innerHTML = '<i class="fas fa-info-circle"></i> Data tidak cukup';
                if (aiConfidenceBarEl) aiConfidenceBarEl.style.width = '0%';
                if (readinessScoreEl) readinessScoreEl.textContent = '-';
                if (daysRemainingEl) daysRemainingEl.textContent = '-';
                return;
            }

            // Calculate average accuracy with validation - convert to numbers properly
            const validScores = weaknessData.map(w => {
                const score = parseFloat(w.persen_benar);
                return isNaN(score) ? 0 : score;
            }).filter(s => !isNaN(s) && isFinite(s));
            const avgAccuracy = validScores.length > 0 ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length : 0;

            // Find weakest category
            const weakest = weaknessData.reduce((min, w) => {
                const minScore = parseFloat(min.persen_benar) || 0;
                const wScore = parseFloat(w.persen_benar) || 0;
                return (wScore < minScore) ? w : min;
            }, weaknessData[0]);

            // Calculate readiness score with validation
            let readinessScore = 0;
            try {
                readinessScore = isNaN(avgAccuracy) || !isFinite(avgAccuracy) ? 0 : Math.min(100, Math.round(avgAccuracy + (weaknessData.length * 5)));
                readinessScore = isNaN(readinessScore) ? 0 : readinessScore;
            } catch (e) {
                console.error('Error calculating readiness score:', e);
                readinessScore = 0;
            }

            // Calculate days remaining (simplified - 30 days from first exam)
            const daysRemaining = Math.max(0, 30 - weaknessData.length);

            // Generate recommendation
            let recommendation = '';
            if (avgAccuracy < 50) {
                recommendation = `Perlu perhatian khusus pada ${weakest.nama_kategori || 'materi dasar'}. Fokus pada materi dasar dan latihan soal intensif.`;
            } else if (avgAccuracy < 70) {
                recommendation = `${weakest.nama_kategori || 'Beberapa materi'} masih perlu ditingkatkan. Review materi dan latihan soal rutin.`;
            } else {
                recommendation = `Performa Anda sudah cukup baik. Pertahankan dan tingkatkan dengan soal yang lebih sulit.`;
            }

            if (aiRecommendationEl) aiRecommendationEl.textContent = recommendation;
            const finalAvgAccuracy = isNaN(avgAccuracy) || !isFinite(avgAccuracy) ? 0 : avgAccuracy;
            if (aiConfidenceEl) aiConfidenceEl.innerHTML = `<i class="fas fa-check-circle"></i> Tingkat Kepercayaan: ${Math.round(finalAvgAccuracy)}%`;
            if (aiConfidenceBarEl) aiConfidenceBarEl.style.width = `${finalAvgAccuracy}%`;
            if (readinessScoreEl) {
                const finalScore = isNaN(readinessScore) || !isFinite(readinessScore) ? 0 : readinessScore;
                readinessScoreEl.textContent = `${finalScore}%`;
            }
            if (daysRemainingEl) daysRemainingEl.textContent = daysRemaining;
        }

        async function loadDashboardData() {
            try {
                // Fetch statistics data (from dedicated statistik endpoint)
                const statsResponse = await fetch(AppConfig.apiUrl('soal.php?action=get_statistik'), {
                    headers: RBAC.getAuthHeaders()
                });
                
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    if (statsData.success && statsData.data) {
                        updateStats(statsData.data);
                    }
                }

                // Fetch last exam data
                const response = await fetch(AppConfig.apiUrl('soal.php?action=get_riwayat_ujian&limit=1'), {
                    headers: RBAC.getAuthHeaders()
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data && data.data.length > 0) {
                        updateLastExamCard(data.data[0]);
                    } else {
                        updateLastExamCard(null);
                    }
                }

                // Fetch weakness analysis
                try {
                    const weaknessResponse = await fetch(AppConfig.apiUrl('soal.php?action=get_my_weakness'), {
                        headers: RBAC.getAuthHeaders()
                    });

                    if (weaknessResponse.ok) {
                        const weaknessData = await weaknessResponse.json();
                        if (weaknessData.success && weaknessData.data) {
                            updateWeaknessAnalysis(weaknessData.data);
                            updateAIAssessment(weaknessData.data);
                        } else {
                            updateWeaknessAnalysis([]);
                            updateAIAssessment([]);
                        }
                    } else {
                        updateWeaknessAnalysis([]);
                        updateAIAssessment([]);
                    }
                } catch (error) {
                    console.error('Error loading weakness analysis:', error);
                    updateWeaknessAnalysis([]);
                    updateAIAssessment([]);
                }

                // Fetch learning materials
                try {
                    const materialsResponse = await fetch(AppConfig.apiUrl('soal.php?action=get_all_bahan_pelajaran'), {
                        headers: RBAC.getAuthHeaders()
                    });

                    if (materialsResponse.ok) {
                        const materialsData = await materialsResponse.json();
                        if (materialsData.success && materialsData.data) {
                            updateLearningMaterials(materialsData.data);
                        } else {
                            updateLearningMaterials([]);
                        }
                    }
                } catch (error) {
                    console.error('Error loading learning materials:', error);
                    updateLearningMaterials([]);
                }

                // Fetch activity timeline
                try {
                    const activityResponse = await fetch(AppConfig.apiUrl('soal.php?action=get_riwayat_ujian&limit=5'), {
                        headers: RBAC.getAuthHeaders()
                    });

                    if (activityResponse.ok) {
                        const activityData = await activityResponse.json();
                        if (activityData.success && activityData.data) {
                            updateActivityTimeline(activityData.data);
                            updateProgressChart(activityData.data);
                        } else {
                            updateActivityTimeline([]);
                            updateProgressChart([]);
                        }
                    }
                } catch (error) {
                    console.error('Error loading activity timeline:', error);
                    updateActivityTimeline([]);
                    updateProgressChart([]);
                }

                // Fetch learning path
                try {
                    const learningPathResponse = await fetch(AppConfig.apiUrl('courses.php?action=get_user_learning_path'), {
                        headers: RBAC.getAuthHeaders()
                    });

                    if (learningPathResponse.ok) {
                        const learningPathData = await learningPathResponse.json();
                        if (learningPathData.success && learningPathData.data) {
                            updateLearningPath(learningPathData.data);
                        } else {
                            updateLearningPath(null);
                        }
                    }
                } catch (error) {
                    console.error('Error loading learning path:', error);
                    updateLearningPath(null);
                }

                // Fetch gamification data
                const gamificationResponse = await fetch(AppConfig.apiUrl('gamification.php?action=get_user_gamification'), {
                    headers: RBAC.getAuthHeaders()
                });
                
                if (gamificationResponse.ok) {
                    const gamificationData = await gamificationResponse.json();
                    if (gamificationData.success && gamificationData.data) {
                        updateGamificationStats(gamificationData.data);
                        updateBadges(gamificationData.data.badges);
                        updateDailyChallenges(gamificationData.data.daily_challenges);
                    }
                }

                // Update streak
                await updateStreak();

                // Fetch notifications
                const notificationsResponse = await fetch(AppConfig.apiUrl('notifications.php?action=get_notifications&limit=5'), {
                    headers: RBAC.getAuthHeaders()
                });
                
                if (notificationsResponse.ok) {
                    const notificationsData = await notificationsResponse.json();
                    if (notificationsData.success && notificationsData.data) {
                        updateNotifications(notificationsData.data);
                    }
                }

                // Fetch notification preferences
                const prefsResponse = await fetch(AppConfig.apiUrl('notifications.php?action=get_preferences'), {
                    headers: RBAC.getAuthHeaders()
                });
                
                if (prefsResponse.ok) {
                    const prefsData = await prefsResponse.json();
                    if (prefsData.success && prefsData.data) {
                        loadNotificationPreferences(prefsData.data);
                    }
                }

            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        async function loadDashboardComponents() {
            try {
                const contentResponse = await fetch('sections/dashboard-content.html');
                const contentHTML = await contentResponse.text();
                const dashboardContent = document.getElementById('dashboardContent');
                if (dashboardContent) {
                    dashboardContent.innerHTML = contentHTML;
                }

                const modalsResponse = await fetch('components/modals.html');
                const modalsHTML = await modalsResponse.text();
                const modalsContainer = document.getElementById('modalsContainer');
                if (modalsContainer) {
                    modalsContainer.innerHTML = modalsHTML;
                }

                // Update UI with user data after components are loaded
                updateUserInfo();

                // Initialize AI Assessment with default values after components are loaded
                updateAIAssessment([]);

                // Initialize Progress Chart after components are loaded
                initProgressChart([]);

                // Load dashboard data after components are loaded
                loadDashboardData();
            } catch (error) {
                console.error('Error loading dashboard components:', error);
            }
        }

        function updateStats(statsData) {
            // Accepts format from get_statistik: {total_exams, average_scores, pass_rate}
            const totalExamsElement = document.getElementById('totalExams');
            const averageScoreElement = document.getElementById('averageScore');
            const totalExamsChangeElement = document.getElementById('totalExamsChange');
            const averageScoreChangeElement = document.getElementById('averageScoreChange');

            if (!statsData || (!statsData.total_exams && !Array.isArray(statsData))) {
                if (totalExamsElement) totalExamsElement.textContent = formatCount(0);
                if (averageScoreElement) averageScoreElement.textContent = formatNumber(0, 1);
                return;
            }

            const totalExams = safeParseInt(statsData.total_exams, 0);
            const avgTotal = safeParseFloat(statsData.average_scores ? (statsData.average_scores.total || 0) : 0, 0);
            const passRate = safeParseFloat(statsData.pass_rate, 0);

            if (totalExamsElement) totalExamsElement.textContent = formatCount(totalExams);
            if (averageScoreElement) averageScoreElement.textContent = formatNumber(avgTotal, 1);

            if (totalExamsChangeElement) totalExamsChangeElement.innerHTML = `<i class="fas fa-check"></i> Data aktual`;
            if (averageScoreChangeElement) averageScoreChangeElement.innerHTML = `<i class="fas fa-check"></i> Lulus: ${formatPercentage(passRate / 100, 1)}`;
        }

        function updateGamificationStats(gamificationData) {
            const userXPElement = document.getElementById('userXP');
            const userLevelElement = document.getElementById('userLevel');
            const userLevelChangeElement = document.getElementById('userLevelChange');
            const userStreakElement = document.getElementById('userStreak');
            const userStreakChangeElement = document.getElementById('userStreakChange');

            if (!gamificationData || !gamificationData.xp) {
                if (userXPElement) userXPElement.textContent = formatXP(0);
                if (userLevelElement) userLevelElement.textContent = '1';
                return;
            }

            const xp = gamificationData.xp;
            if (userXPElement) userXPElement.textContent = formatXP(safeValue(xp, 'total_xp', 0));
            if (userLevelElement) userLevelElement.textContent = safeValue(xp, 'level', 1);
            if (userLevelChangeElement) userLevelChangeElement.innerHTML = `<i class="fas fa-arrow-up"></i> Level ${safeValue(xp, 'level', 1)}`;

            if (gamificationData.streak) {
                if (userStreakElement) userStreakElement.textContent = formatCount(safeValue(gamificationData.streak, 'current_streak', 0));
                if (userStreakChangeElement) userStreakChangeElement.innerHTML = `<i class="fas fa-fire"></i> ${formatCount(safeValue(gamificationData.streak, 'longest_streak', 0))} hari terbaik`;
            }
        }

        function updateBadges(badges) {
            const badgesList = document.getElementById('badgesList');
            if (!badgesList) return;
            
            if (!badges || badges.length === 0) {
                badgesList.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-medal fa-2x mb-2"></i>
                        <p>Belum ada badge</p>
                        <small>Selesaikan ujian dan tantangan untuk mendapatkan badge</small>
                    </div>
                `;
                return;
            }
            
            badgesList.innerHTML = badges.slice(0, 6).map(badge => `
                <div class="badge-item d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded">
                    <div class="badge-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--warning-color); display: flex; align-items: center; justify-content: center; color: white;">
                        <i class="fas ${badge.icon || 'fa-medal'}"></i>
                    </div>
                    <div class="badge-content">
                        <div class="badge-title font-weight-bold small">${badge.nama}</div>
                        <div class="badge-date text-muted" style="font-size: 0.75rem;">${formatDate(badge.earned_at, 'short')}</div>
                    </div>
                </div>
            `).join('');
        }

        function updateDailyChallenges(challenges) {
            const challengesList = document.getElementById('dailyChallengesList');
            if (!challengesList) return;
            
            if (!challenges || challenges.length === 0) {
                challengesList.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-tasks fa-2x mb-2"></i>
                        <p>Tidak ada tantangan hari ini</p>
                        <small>Kembali besok untuk tantangan baru</small>
                    </div>
                `;
                return;
            }
            
            challengesList.innerHTML = challenges.map(challenge => {
                const progress = safeParseInt(challenge.progress, 0);
                const targetValue = safeParseInt(challenge.target_value, 0);
                const progressPercent = targetValue > 0 ? (progress / targetValue) * 100 : 0;
                const isCompleted = progress >= targetValue;
                const isClaimed = challenge.claimed_at !== null;
                const xpReward = safeParseInt(challenge.xp_reward, 0);

                return `
                    <div class="challenge-card mb-3 p-3 border rounded">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="mb-0">${challenge.title}</h6>
                            <span class="badge ${isCompleted ? 'bg-success' : 'bg-primary'}">${isCompleted ? 'Selesai' : 'Berjalan'}</span>
                        </div>
                        <div class="progress" style="height: 5px;">
                            <div class="progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}" style="width: ${progressPercent}%;" role="progressbar"></div>
                        </div>
                        <div class="d-flex justify-content-between mt-1">
                            <small class="text-muted">${formatCount(progress)}/${formatCount(targetValue)}</small>
                            <small class="text-muted">+${formatXP(xpReward)} XP</small>
                        </div>
                        ${isCompleted && !isClaimed ? `<button class="btn btn-sm btn-primary mt-1" onclick="claimChallenge(${challenge.id})">Klaim XP</button>` : ''}
                    </div>
                `;
            }).join('');
        }

        async function updateStreak() {
            try {
                const response = await fetch(AppConfig.apiUrl('gamification.php?action=update_streak'), {
                    method: 'POST',
                    headers: RBAC.getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        const userStreakElement = document.getElementById('userStreak');
                        const userStreakChangeElement = document.getElementById('userStreakChange');
                        if (userStreakElement) userStreakElement.textContent = data.current_streak;
                        if (userStreakChangeElement) userStreakChangeElement.innerHTML = `<i class="fas fa-fire"></i> Streak hari ini`;
                    }
                }
            } catch (error) {
                console.error('Error updating streak:', error);
            }
        }

        async function claimChallenge(challengeId) {
            try {
                const response = await fetch(AppConfig.apiUrl('gamification.php?action=claim_daily_challenge'), {
                    method: 'POST',
                    headers: RBAC.getAuthHeaders(),
                    body: JSON.stringify({ challenge_id: challengeId })
                });
                
                const data = await response.json();
                if (data.success) {
                    alert(`XP diklaim! +${data.xp_rewarded} XP`);
                    // Reload gamification data
                    loadDashboardData();
                } else {
                    alert('Gagal mengklaim: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error claiming challenge:', error);
                alert('Terjadi kesalahan saat mengklaim tantangan');
            }
        }

        function updateNotifications(notifications) {
            const notificationsList = document.getElementById('notificationsList');
            if (!notificationsList) return;
            
            if (!notifications || notifications.length === 0) {
                notificationsList.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-bell fa-2x mb-2"></i>
                        <p>Tidak ada notifikasi</p>
                        <small>Anda akan menerima notifikasi untuk aktivitas penting</small>
                    </div>
                `;
                return;
            }
            
            notificationsList.innerHTML = notifications.map(notif => `
                <div class="notification-item mb-2 p-2 bg-light rounded ${notif.status === 'pending' ? 'border-left border-4 border-primary' : ''}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="notification-title font-weight-bold small">${notif.title}</div>
                            <div class="notification-message text-muted small">${notif.message}</div>
                            <div class="notification-date text-muted" style="font-size: 0.7rem;">${formatDate(notif.created_at, 'datetime')}</div>
                        </div>
                        ${notif.status === 'pending' ? '<span class="badge bg-primary">New</span>' : ''}
                    </div>
                </div>
            `).join('');
        }

        function loadNotificationPreferences(prefs) {
            if (!prefs) return;

            const emailExamReminder = document.getElementById('emailExamReminder');
            const emailExamResult = document.getElementById('emailExamResult');
            const emailCertificate = document.getElementById('emailCertificate');
            const emailAchievement = document.getElementById('emailAchievement');
            const inAppExamReminder = document.getElementById('inAppExamReminder');
            const inAppExamResult = document.getElementById('inAppExamResult');
            const inAppAchievement = document.getElementById('inAppAchievement');
            const pushExamReminder = document.getElementById('pushExamReminder');
            const pushExamResult = document.getElementById('pushExamResult');
            const reminderHoursBefore = document.getElementById('reminderHoursBefore');

            if (emailExamReminder) emailExamReminder.checked = prefs.email_exam_reminder === 1;
            if (emailExamResult) emailExamResult.checked = prefs.email_exam_result === 1;
            if (emailCertificate) emailCertificate.checked = prefs.email_certificate === 1;
            if (emailAchievement) emailAchievement.checked = prefs.email_achievement === 1;
            if (inAppExamReminder) inAppExamReminder.checked = prefs.in_app_exam_reminder === 1;
            if (inAppExamResult) inAppExamResult.checked = prefs.in_app_exam_result === 1;
            if (inAppAchievement) inAppAchievement.checked = prefs.in_app_achievement === 1;
            if (pushExamReminder) pushExamReminder.checked = prefs.push_exam_reminder === 1;
            if (pushExamResult) pushExamResult.checked = prefs.push_exam_result === 1;
            if (reminderHoursBefore) reminderHoursBefore.value = prefs.reminder_hours_before || 24;
        }

        async function saveNotificationPreferences() {
            try {
                const emailExamReminder = document.getElementById('emailExamReminder');
                const emailExamResult = document.getElementById('emailExamResult');
                const emailCertificate = document.getElementById('emailCertificate');
                const emailAchievement = document.getElementById('emailAchievement');
                const inAppExamReminder = document.getElementById('inAppExamReminder');
                const inAppExamResult = document.getElementById('inAppExamResult');
                const inAppAchievement = document.getElementById('inAppAchievement');
                const pushExamReminder = document.getElementById('pushExamReminder');
                const pushExamResult = document.getElementById('pushExamResult');
                const reminderHoursBefore = document.getElementById('reminderHoursBefore');

                if (!emailExamReminder || !emailExamResult || !emailCertificate || !emailAchievement ||
                    !inAppExamReminder || !inAppExamResult || !inAppAchievement ||
                    !pushExamReminder || !pushExamResult || !reminderHoursBefore) {
                    alert('Form elements not found');
                    return;
                }

                const response = await fetch(AppConfig.apiUrl('notifications.php?action=update_preferences'), {
                    method: 'POST',
                    headers: RBAC.getAuthHeaders(),
                    body: JSON.stringify({
                        email_exam_reminder: emailExamReminder.checked ? 1 : 0,
                        email_exam_result: emailExamResult.checked ? 1 : 0,
                        email_certificate: emailCertificate.checked ? 1 : 0,
                        email_achievement: emailAchievement.checked ? 1 : 0,
                        in_app_exam_reminder: inAppExamReminder.checked ? 1 : 0,
                        in_app_exam_result: inAppExamResult.checked ? 1 : 0,
                        in_app_achievement: inAppAchievement.checked ? 1 : 0,
                        push_exam_reminder: pushExamReminder.checked ? 1 : 0,
                        push_exam_result: pushExamResult.checked ? 1 : 0,
                        reminder_hours_before: parseInt(reminderHoursBefore.value)
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Notification preferences saved successfully!');
                } else {
                    alert('Failed to save preferences: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error saving preferences:', error);
                alert('Terjadi kesalahan saat menyimpan preferensi notifikasi');
            }
        }

        function updateLastExamCard(examData) {
            const lastExamCard = document.getElementById('lastExamCard');
            if (!lastExamCard) return;
            
            if (!examData) {
                lastExamCard.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-file-alt fa-3x mb-3"></i>
                        <p>Belum ada data ujian</p>
                        <button class="btn btn-primary-custom mt-2" onclick="startNewExam()">
                            Mulai Ujian Sekarang
                        </button>
                    </div>
                `;
                return;
            }
            
            const kategoriNames = {
                'TWK': 'Tes Wawasan Kebangsaan',
                'TIU': 'Tes Intelegensia Umum',
                'TKP': 'Tes Karakteristik Pribadi',
                'TPA': 'Tes Potensi Akademik',
                'PSIKOLOGIS': 'Tes Psikologis'
            };
            
            const statusClass = examData.status_lulus === 'Lulus' ? 'success' : 'warning';
            const statusIcon = examData.status_lulus === 'Lulus' ? 'fa-check-circle' : 'fa-clock';
            
            lastExamCard.innerHTML = `
                <div class="last-exam-info">
                    <div class="exam-category">
                        <span class="badge bg-primary">${kategoriNames[examData.kategori] || 'Ujian Umum'}</span>
                    </div>
                    <div class="exam-score">
                        <h3>${formatScore(safeParseFloat(examData.nilai_total, 0))}</h3>
                        <span class="score-label">Nilai Total</span>
                    </div>
                    <div class="exam-details">
                        <div class="detail-item">
                            <span class="detail-label">TWK:</span>
                            <span class="detail-value">${formatScore(safeParseFloat(examData.nilai_twk, 0))}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">TIU:</span>
                            <span class="detail-value">${formatScore(safeParseFloat(examData.nilai_tiu, 0))}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">TKP:</span>
                            <span class="detail-value">${formatScore(safeParseFloat(examData.nilai_tkp, 0))}</span>
                        </div>
                        ${safeParseFloat(examData.nilai_tpa, 0) > 0 ? '<div class="detail-item"><span class="detail-label">TPA:</span><span class="detail-value">' + formatScore(safeParseFloat(examData.nilai_tpa, 0)) + '</span></div>' : ''}
                        ${safeParseFloat(examData.nilai_psikologis, 0) > 0 ? '<div class="detail-item"><span class="detail-label">PSIKOLOGIS:</span><span class="detail-value">' + formatScore(safeParseFloat(examData.nilai_psikologis, 0)) + '</span></div>' : ''}
                    </div>
                    <div class="exam-status">
                        <i class="fas ${statusIcon} text-${statusClass}"></i>
                        <span class="status-text text-${statusClass}">${examData.status_lulus || 'Belum Dinilai'}</span>
                    </div>
                    <div class="exam-date">
                        <small class="text-muted">${formatDate(examData.tanggal_ujian, 'datetime')}</small>
                    </div>
                </div>
            `;
        }

        function updateWeaknessAnalysis(weaknessData) {
            const weaknessList = document.getElementById('weaknessList');
            if (!weaknessList) return;
            
            if (!weaknessData || weaknessData.length === 0) {
                weaknessList.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
                        <p>Belum ada data kelemahan</p>
                        <small>Ikuti ujian untuk melihat analisis kelemahan</small>
                    </div>
                `;
                return;
            }
            
            // Expert System for Evaluation and Suggestions
            const expertSuggestions = weaknessData.map(weakness => {
                let suggestion = '';
                let priority = '';
                let icon = '';
                
                if (weakness.persen_benar < 50) {
                    priority = 'high';
                    icon = 'fa-exclamation-triangle';
                    suggestion = `Perlu perhatian khusus pada ${weakness.nama_kategori}. Fokus pada materi dasar dan latihan soal intensif.`;
                } else if (weakness.persen_benar < 70) {
                    priority = 'medium';
                    icon = 'fa-info-circle';
                    suggestion = `${weakness.nama_kategori} masih perlu ditingkatkan. Review materi dan latihan soal rutin.`;
                } else {
                    priority = 'low';
                    icon = 'fa-check-circle';
                    suggestion = `${weakness.nama_kategori} sudah cukup baik. Pertahankan dan tingkatkan dengan soal yang lebih sulit.`;
                }
                
                return {
                    ...weakness,
                    suggestion,
                    priority,
                    icon
                };
            });
            
            // Sort by priority (high first)
            expertSuggestions.sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            
            weaknessList.innerHTML = expertSuggestions.map(weakness => {
                const priorityColors = {
                    high: 'danger',
                    medium: 'warning',
                    low: 'success'
                };
                
                return `
                    <div class="weakness-item">
                        <div class="weakness-icon">
                            <i class="fas ${weakness.icon}"></i>
                        </div>
                        <div class="weakness-content">
                            <div class="weakness-title">${weakness.nama_kategori}</div>
                            <div class="weakness-stats">
                                <span class="weakness-score">${formatNumber(safeParseFloat(weakness.persen_benar, 0), 0)}% Benar</span>
                                <span class="weakness-count">${formatCount(safeParseInt(weakness.muncul_count, 0))} kali muncul</span>
                            </div>
                            <div class="weakness-suggestion text-${priorityColors[weakness.priority]}">
                                <i class="fas fa-lightbulb"></i> ${weakness.suggestion}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateLearningMaterials(materials) {
            const materialsList = document.getElementById('materialsList');
            if (!materialsList) return;
            
            if (!materials || materials.length === 0) {
                materialsList.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-book fa-2x mb-2"></i>
                        <p>Belum ada bahan ajar</p>
                        <small>Bahan ajar akan ditampilkan sesuai kelemahan Anda</small>
                    </div>
                `;
                return;
            }
            
            materialsList.innerHTML = materials.slice(0, 5).map(material => {
                const iconClass = material.jenis_file === 'pdf' ? 'pdf' : 'text';
                return `
                    <div class="material-item">
                        <div class="material-icon ${iconClass}">
                            <i class="fas fa-file-${material.jenis_file === 'pdf' ? 'pdf' : 'alt'}"></i>
                        </div>
                        <div class="material-content">
                            <div class="material-title">${material.judul}</div>
                            <div class="material-meta">
                                <span>${material.kategori || 'Umum'}</span>
                                <span>•</span>
                                <span>${formatDate(material.created_at, 'short')}</span>
                            </div>
                        </div>
                        <a href="${material.file_path}" target="_blank" class="material-link">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                `;
            }).join('');
        }

        function updateActivityTimeline(activities) {
            const timeline = document.querySelector('.timeline');
            if (!timeline) return;
            
            if (!activities || activities.length === 0) {
                timeline.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-history fa-2x mb-2"></i>
                        <p>Belum ada aktivitas</p>
                        <small>Mulai ujian untuk melihat aktivitas Anda</small>
                    </div>
                `;
                return;
            }
            
            timeline.innerHTML = activities.map(activity => {
                const kategoriNames = {
                    'TWK': 'Tes Wawasan Kebangsaan',
                    'TIU': 'Tes Intelegensia Umum',
                    'TKP': 'Tes Karakteristik Pribadi',
                    'TPA': 'Tes Potensi Akademik',
                    'PSIKOLOGIS': 'Tes Psikologis'
                };
                
                const statusClass = activity.status_lulus === 'Lulus' ? 'success' : 'warning';
                const statusIcon = activity.status_lulus === 'Lulus' ? 'fa-check' : 'fa-clock';
                
                return `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Selesai ${kategoriNames[activity.kategori] || 'Ujian'}</div>
                            <div class="timeline-date">${formatDate(activity.tanggal_ujian, 'long')}</div>
                            <div class="timeline-score">
                                <span class="badge bg-${statusClass}">${formatScore(safeParseFloat(activity.nilai_total, 0))}</span>
                                <span class="text-muted">poin</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateLearningPath(learningPathData) {
            const learningPathList = document.getElementById('learningPathList');
            if (!learningPathList) return;
            
            if (!learningPathData) {
                learningPathList.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-road fa-2x mb-2"></i>
                        <p>Belum ada learning path</p>
                        <small>Ikuti ujian untuk mendapatkan learning path yang sesuai</small>
                    </div>
                `;
                return;
            }
            
            let html = `<div class="learning-path-info mb-3">
                <h6>${learningPathData.judul || 'Learning Path Anda'}</h6>
                <p class="text-muted small">${learningPathData.deskripsi || ''}</p>
            </div>`;
            
            if (learningPathData.courses && learningPathData.courses.length > 0) {
                html += learningPathData.courses.map((course, index) => {
                    const progress = course.progress ? course.progress.progress_percent || 0 : 0;
                    const status = course.progress ? course.progress.status || 'not_started' : 'not_started';
                    const statusClass = status === 'completed' ? 'success' : (status === 'in_progress' ? 'primary' : 'secondary');
                    
                    return `
                        <div class="course-path-item mb-2">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="small">${index + 1}. ${course.judul}</span>
                                <span class="badge bg-${statusClass}">${status}</span>
                            </div>
                            <div class="progress" style="height: 5px;">
                                <div class="progress-bar" role="progressbar" style="width: ${progress}%;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <small class="text-muted">${progress}% selesai</small>
                        </div>
                    `;
                }).join('');
            }
            
            learningPathList.innerHTML = html;
        }

        function startNewExam() {
            window.location.href = 'ujian.html';
        }

        function viewHistory() {
            window.location.href = 'ujian.html?action=history';
        }

        // Modal functions for detailed views
        function showLearningPathModal() {
            window.location.href = 'materi.html';
        }

        function showBadgesModal() {
            window.location.href = 'achievements.html';
        }

        function showChallengesModal() {
            window.location.href = 'achievements.html#challenges';
        }

        function showNotificationsModal() {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            fetch(AppConfig.apiUrl('notifications.php?action=get_notifications&limit=10'), {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    const count = (d.data || []).length;
                    if (count === 0) {
                        showToast('Tidak ada notifikasi baru.', 'info');
                    } else {
                        showToast(`${count} notifikasi tersedia. Lihat di profil.`, 'info', 4000);
                    }
                }
            })
            .catch(() => showToast('Gagal memuat notifikasi.', 'error'));
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

        // Auto refresh data every 5 minutes
        setInterval(loadDashboardData, 300000);
