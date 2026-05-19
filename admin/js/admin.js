const API_BASE = '../api';
let authToken = '';
let userRole = '';
let csrfToken = '';
let currentPage = 1;
const perPage = 10;

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

        // Simple RBAC Protection - Admin only
        document.addEventListener('DOMContentLoaded', function() {
            // Get auth data from localStorage
            authToken = localStorage.getItem('authToken') || '';
            userRole = localStorage.getItem('userRole') || '';
            
            // Check if user is logged in and is admin
            if (!authToken || userRole !== 'admin') {
                window.location.href = '../login.html';
                return;
            }
            
            fetchCsrfToken();
            loadKategoriDropdowns();
            hideAllSections();
            showSection('dashboard');
            
            // Update admin UI
            const userRoleDisplay = document.getElementById('userRoleDisplay');
            if (userRoleDisplay) {
                userRoleDisplay.textContent = 'Administrator';
            }
        });

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

        // Load kategori for all dropdowns
        async function loadKategoriDropdowns() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_kategori`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                console.log('loadKategoriDropdowns response:', data);
                
                if (data.success && data.data.length > 0) {
                    // Store categories globally for dynamic lookups
                    window.categoriesData = data.data;
                    
                    // Update all kategori dropdowns
                    const dropdownIds = [
                        'filterKategori', 
                        'statsKategori', 
                        'tipsKategoriFilter', 
                        'irtKategoriFilter', 
                        'bahanKategoriFilter', 
                        'filterCourseCategory',
                        'filterPackageCategory',
                        'batchGenerateKategori',
                        'bahanGenerateKategori',
                        'tipsGenerateKategori',
                        'bahanKategoriId',
                        'tipsKategori',
                        'examPackageCategory',
                        'aiGeneratorModalKategori'
                    ];
                    
                    dropdownIds.forEach(id => {
                        const select = document.getElementById(id);
                        if (select) {
                            const currentValue = select.value;
                            // Keep first option ("All/Semua/Pilih")
                            const firstOption = select.options[0];
                            select.innerHTML = '';
                            select.appendChild(firstOption);
                            
                            // Add categories
                            data.data.forEach(kat => {
                                const option = document.createElement('option');
                                option.value = kat.nama; // Use nama for consistency
                                option.textContent = `${kat.nama} - ${kat.deskripsi || ''}`;
                                select.appendChild(option);
                            });
                            
                            console.log(`Loaded ${select.options.length - 1} categories into ${id}`);
                            
                            // Restore previously selected value if it still exists
                            if (currentValue) {
                                const exists = Array.from(select.options).some(opt => opt.value === currentValue);
                                if (exists) {
                                    select.value = currentValue;
                                }
                            }
                        } else {
                            console.warn(`Dropdown ${id} not found`);
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading kategori:', error);
            }
        }

        // Logout
        function logout() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            window.location.href = '../login.html';
        }

        // Show section
        function showSection(section) {
            hideAllSections();
            
            if (section === 'dashboard') {
                document.getElementById('dashboardSection').classList.remove('hidden');
                loadDashboard();
            } else if (section === 'userManagement') {
                document.getElementById('userManagementSection').classList.remove('hidden');
                loadUsers();
            } else if (section === 'participants') {
                document.getElementById('participantsSection').classList.remove('hidden');
                loadParticipants();
            } else if (section === 'questions') {
                document.getElementById('questionsSection').classList.remove('hidden');
                loadQuestions();
            } else if (section === 'categories') {
                document.getElementById('categoriesSection').classList.remove('hidden');
                loadCategories();
            } else if (section === 'statistics') {
                document.getElementById('statisticsSection').classList.remove('hidden');
                loadSoalStatistics();
            } else if (section === 'leaderboardSettings') {
                document.getElementById('leaderboardSettingsSection').classList.remove('hidden');
                loadLeaderboardSettings();
            } else if (section === 'blueprint') {
                document.getElementById('blueprintSection').classList.remove('hidden');
                loadBlueprints();
            } else if (section === 'examPackages') {
                document.getElementById('examPackagesSection').classList.remove('hidden');
                loadExamPackages();
            } else if (section === 'examSessions') {
                document.getElementById('examSessionsSection').classList.remove('hidden');
                loadExamSessions();
            } else if (section === 'irt') {
                document.getElementById('irtSection').classList.remove('hidden');
                loadIRTAnalysis();
            } else if (section === 'bahanPelajaran') {
                document.getElementById('bahanPelajaranSection').classList.remove('hidden');
                loadBahanPelajaran(1);
            } else if (section === 'tips') {
                document.getElementById('tipsSection').classList.remove('hidden');
                loadTipsTricks();
            } else if (section === 'results') {
                document.getElementById('resultsSection').classList.remove('hidden');
                loadResults();
            } else if (section === 'contentGeneration') {
                document.getElementById('contentGenerationSection').classList.remove('hidden');
                loadContentGeneration();
            } else if (section === 'systemMaintenance') {
                document.getElementById('systemMaintenanceSection').classList.remove('hidden');
                loadSystemMaintenance();
            } else if (section === 'courseManagement') {
                document.getElementById('courseManagementSection').classList.remove('hidden');
                loadCourses();
            } else if (section === 'gamificationTracking') {
                document.getElementById('gamificationTrackingSection').classList.remove('hidden');
                loadGamificationTracking();
            } else if (section === 'notifications') {
                document.getElementById('notificationsSection').classList.remove('hidden');
                loadNotifications();
            }

            // Update nav active state and scroll to center
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[onclick*="${section}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                // Scroll the active menu item into view and center it
                activeLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Load dashboard stats
        async function loadDashboard() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_statistik`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response is not JSON');
                }
                
                const text = await response.text();
                console.log('API Response:', text);
                
                const data = JSON.parse(text);

                if (data.success && data.data) {
                    document.getElementById('totalUjian').textContent = formatCount(safeParseInt(data.data.total_exams, 0));
                    document.getElementById('avgScore').textContent = formatNumber(safeParseFloat(data.data.average_scores?.total, 0), 1);
                    document.getElementById('passRate').textContent = formatPercentage(safeParseFloat(data.data.pass_rate, 0) / 100, 1);
                    
                    // Load category analytics
                    loadCategoryAnalytics();
                    
                    // Load performance trend
                    loadPerformanceTrend();
                    
                    // Load recent exams
                    loadRecentExams();
                } else {
                    console.warn('API returned no data or failed');
                }
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }

            document.getElementById('totalSoal').textContent = formatCount(16534);
        }

        // Load category analytics
        async function loadCategoryAnalytics() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_statistik`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data && data.data.average_scores) {
                    const avgScores = data.data.average_scores;
                    const categories = data.data.categories || [];
                    
                    // Filter out 'total' from category scores for charts
                    const categoryLabels = categories.filter(cat => cat !== 'total');
                    const categoryScores = categoryLabels.map(cat => avgScores[cat.toLowerCase()] || 0);
                    
                    // Generate dynamic colors for categories
                    const colors = generateColors(categoryLabels.length);
                    
                    // Destroy existing charts before creating new ones
                    const ctx1 = document.getElementById('categoryScoreChart');
                    if (ctx1) {
                        const existingChart = Chart.getChart(ctx1);
                        if (existingChart) {
                            existingChart.destroy();
                        }
                    }
                    
                    const ctx2 = document.getElementById('categoryPassChart');
                    if (ctx2) {
                        const existingChart = Chart.getChart(ctx2);
                        if (existingChart) {
                            existingChart.destroy();
                        }
                    }
                    
                    if (!ctx1) return;
                    
                    // Category score chart
                    new Chart(ctx1.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: categoryLabels,
                            datasets: [{
                                label: 'Nilai Rata-rata',
                                data: categoryScores,
                                backgroundColor: colors
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 200
                                }
                            }
                        }
                    });

                    if (!ctx2) return;
                    
                    // Category pass chart
                    new Chart(ctx2.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: categoryLabels,
                            datasets: [{
                                data: categoryScores,
                                backgroundColor: colors
                            }]
                        },
                        options: {
                            responsive: true
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading category analytics:', error);
            }
        }
        
        // Generate colors dynamically for charts
        function generateColors(count) {
            const baseColors = [
                '#1e40af', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
                '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'
            ];
            const colors = [];
            for (let i = 0; i < count; i++) {
                colors.push(baseColors[i % baseColors.length]);
            }
            return colors;
        }

        // Load performance trend
        async function loadPerformanceTrend() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_riwayat_ujian&limit=7`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    const recentExams = data.data.reverse();
                    
                    // Destroy existing chart before creating new one
                    const ctx = document.getElementById('performanceTrendChart');
                    if (ctx) {
                        const existingChart = Chart.getChart(ctx);
                        if (existingChart) {
                            existingChart.destroy();
                        }
                    }
                    
                    new Chart(ctx.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: recentExams.map(e => formatDate(e.tanggal_ujian, 'short')),
                            datasets: [{
                                label: 'Nilai Total',
                                data: recentExams.map(e => e.nilai_total),
                                borderColor: '#1e40af',
                                backgroundColor: 'rgba(30, 64, 175, 0.1)',
                                fill: true,
                                tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 500
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading performance trend:', error);
            }
        }

        // Load recent exams
        async function loadRecentExams() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_riwayat_ujian&limit=5`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    document.getElementById('recentExamsTable').innerHTML = data.data.map(row => `
                        <tr>
                            <td>${formatDate(row.tanggal_ujian, 'short')}</td>
                            <td>${row.nama_peserta}</td>
                            <td>${formatScore(safeParseFloat(row.nilai_total, 0))}</td>
                            <td><span class="badge ${row.status_lulus === 'LULUS' ? 'bg-success' : 'bg-danger'}">${row.status_lulus}</span></td>
                        </tr>
                    `).join('');
                } else {
                    document.getElementById('recentExamsTable').innerHTML = '<tr><td colspan="4" class="text-center">Belum ada data ujian</td></tr>';
                }
            } catch (error) {
                console.error('Error loading recent exams:', error);
            }
        }

        // Load questions
        async function loadQuestions(page = 1) {
            const kategori = document.getElementById('filterKategori').value;
            const search = document.getElementById('searchSoal').value;
            
            let url = `${API_BASE}/soal.php?action=list_questions&page=${page}&limit=${perPage}`;
            if (kategori) url += `&kategori=${kategori}`;
            if (search) url += `&search=${search}`;
            
            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success) {
                    displayQuestions(data.data);
                    displayPagination(data.pagination);
                    currentPage = page;
                } else {
                    document.getElementById('questionsTable').innerHTML = `
                        <tr><td colspan="5" class="text-center text-danger">${data.error}</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('questionsTable').innerHTML = `
                    <tr><td colspan="5" class="text-center">Gagal memuat soal</td></tr>
                `;
            }
        }

        function displayQuestions(questions) {
            const tbody = document.getElementById('questionsTable');
            tbody.innerHTML = questions.map(q => `
                <tr>
                    <td>${q.id}</td>
                    <td><span class="badge bg-secondary">${q.nama_kategori}</span></td>
                    <td>${q.pertanyaan.substring(0, 100)}${q.pertanyaan.length > 100 ? '...' : ''}</td>
                    <td><span class="badge bg-primary">${q.jawaban_benar}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editQuestion(${q.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${q.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function displayPagination(pagination) {
            const nav = document.getElementById('pagination');
            let html = '';
            
            // Previous button
            html += `<li class="page-item ${pagination.page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadQuestions(${pagination.page - 1}); return false;">&laquo;</a>
            </li>`;
            
            // Page numbers
            for (let i = 1; i <= Math.min(pagination.total_pages, 5); i++) {
                html += `<li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadQuestions(${i}); return false;">${i}</a>
                </li>`;
            }
            
            // Next button
            html += `<li class="page-item ${pagination.page === pagination.total_pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadQuestions(${pagination.page + 1}); return false;">&raquo;</a>
            </li>`;
            
            nav.innerHTML = html;
        }

        // Load categories
        async function loadCategories() {
            const searchQuery = document.getElementById('searchCategory').value;
            
            const categories = [
                { id: 1, nama: 'TWK', deskripsi: 'Tes Wawasan Kebangsaan', passing_grade: 65, jumlah_soal: 5068 },
                { id: 2, nama: 'TIU', deskripsi: 'Tes Intelegensi Umum', passing_grade: 80, jumlah_soal: 5755 },
                { id: 3, nama: 'TKP', deskripsi: 'Tes Karakteristik Pribadi', passing_grade: 166, jumlah_soal: 5556 },
                { id: 4, nama: 'TPA', deskripsi: 'Tes Potensi Akademik', passing_grade: 70, jumlah_soal: 84 },
                { id: 5, nama: 'PSIKOLOGIS', deskripsi: 'Tes Psikologis', passing_grade: 166, jumlah_soal: 71 }
            ];
            
            const filtered = searchQuery 
                ? categories.filter(c => c.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     c.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
                : categories;
            
            document.getElementById('categoriesTable').innerHTML = filtered.map(cat => `
                <tr>
                    <td>${cat.id}</td>
                    <td>${cat.nama}</td>
                    <td>${cat.deskripsi}</td>
                    <td>${cat.passing_grade}</td>
                    <td>${cat.jumlah_soal}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="editCategory(${cat.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        function searchCategories() {
            loadCategories();
        }

        function showCategoryModal() {
            alert('Add category modal - to be implemented');
        }

        function editCategory(categoryId) {
            alert('Edit category - to be implemented');
        }

        function deleteCategory(categoryId) {
            if (confirm('Are you sure you want to delete this category?')) {
                alert('Delete category - to be implemented');
            }
        }

        // Load results
        async function loadResults() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_riwayat_ujian&limit=20`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    document.getElementById('resultsTable').innerHTML = data.data.map(row => `
                        <tr>
                            <td>${row.id}</td>
                            <td>${row.nama_peserta}</td>
                            <td>${row.tanggal_ujian}</td>
                            <td>${formatScore(safeParseFloat(row.nilai_twk, 0))}</td>
                            <td>${formatScore(safeParseFloat(row.nilai_tiu, 0))}</td>
                            <td>${formatScore(safeParseFloat(row.nilai_tkp, 0))}</td>
                            <td>${formatScore(safeParseFloat(row.nilai_total, 0))}</td>
                            <td><span class="badge ${row.status_lulus === 'LULUS' ? 'bg-success' : 'bg-danger'}">${row.status_lulus}</span></td>
                        </tr>
                    `).join('');
                } else {
                    document.getElementById('resultsTable').innerHTML = '<tr><td colspan="8" class="text-center">Belum ada data ujian</td></tr>';
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        // Load Content Generation section
        function loadContentGeneration() {
            console.log('Content Generation section loaded');
        }

        // Load System Maintenance section
        function loadSystemMaintenance() {
            console.log('System Maintenance section loaded');
        }

        // Load courses
        async function loadCourses() {
            try {
                const categoryFilter = document.getElementById('filterCourseCategory').value;
                const searchQuery = document.getElementById('searchCourse').value;
                
                let url = `${API_BASE}/courses.php?action=list_courses`;
                const params = new URLSearchParams();
                if (categoryFilter) params.append('kategori', categoryFilter);
                if (searchQuery) params.append('search', searchQuery);
                if (params.toString()) url += `&${params.toString()}`;
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    const tbody = document.getElementById('coursesTable');
                    tbody.innerHTML = data.data.map(course => `
                        <tr>
                            <td>${course.id}</td>
                            <td>${course.judul}</td>
                            <td>${course.kategori || '-'}</td>
                            <td>${course.module_count || 0}</td>
                            <td><span class="badge ${course.status === 'published' ? 'bg-success' : 'bg-warning'}">${course.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewCourse(${course.id})">View</button>
                                <button class="btn btn-sm btn-secondary" onclick="editCourse(${course.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCourse(${course.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            } catch (error) {
                console.error('Error loading courses:', error);
            }
        }

        function searchCourses() {
            loadCourses();
        }

        function showCreateCourseModal() {
            // TODO: Implement create course modal
            alert('Create course modal - to be implemented');
        }

        function viewCourse(courseId) {
            // TODO: Implement view course
            alert('View course - to be implemented');
        }

        function editCourse(courseId) {
            // TODO: Implement edit course
            alert('Edit course - to be implemented');
        }

        function deleteCourse(courseId) {
            if (confirm('Are you sure you want to delete this course?')) {
                // TODO: Implement delete course
                alert('Delete course - to be implemented');
            }
        }

        // Load gamification tracking
        async function loadGamificationTracking() {
            try {
                const response = await fetch(`${API_BASE}/gamification.php?action=get_all_users_gamification`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    const tbody = document.getElementById('gamificationUsersTable');
                    tbody.innerHTML = data.data.map(user => `
                        <tr>
                            <td>${user.nama_lengkap || user.nama_peserta || 'Unknown'}</td>
                            <td>${user.total_xp || 0}</td>
                            <td>${user.level || 1}</td>
                            <td>${user.current_streak || 0}</td>
                            <td>${user.longest_streak || 0}</td>
                            <td>${user.badge_count || 0}</td>
                            <td>${user.achievement_count || 0}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewGamificationDetails(${user.id})">View</button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    document.getElementById('gamificationUsersTable').innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center text-muted">${data.error || 'Error loading data'}</td>
                        </tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading gamification tracking:', error);
                document.getElementById('gamificationUsersTable').innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger">Error: ${error.message}</td>
                    </tr>
                `;
            }
        }

        function refreshGamificationTracking() {
            loadGamificationTracking();
        }

        function viewGamificationDetails(userId) {
            alert('View gamification details - to be implemented');
        }

        function viewUserGamification(userId) {
            // TODO: Implement view user gamification details
            alert('View user gamification details - to be implemented');
        }

        // Load notifications
        async function loadNotifications() {
            try {
                const response = await fetch(`${API_BASE}/notifications.php?action=get_notifications`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    const tbody = document.getElementById('notificationsHistoryTable');
                    tbody.innerHTML = data.data.map(notification => `
                        <tr>
                            <td>${notification.user_name || 'Unknown'}</td>
                            <td>${notification.type}</td>
                            <td>${notification.category}</td>
                            <td>${notification.title}</td>
                            <td><span class="badge ${notification.status === 'sent' ? 'bg-success' : 'bg-warning'}">${notification.status}</span></td>
                            <td>${notification.sent_at}</td>
                        </tr>
                    `).join('');
                } else {
                    document.getElementById('notificationsHistoryTable').innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center text-muted">${data.error || 'Error loading data'}</td>
                        </tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
                document.getElementById('notificationsHistoryTable').innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-danger">Error: ${error.message}</td>
                    </tr>
                `;
            }
        }

        function refreshNotifications() {
            loadNotifications();
        }

        async function sendNotification() {
            const user_id = document.getElementById('notificationUser').value;
            const type = document.getElementById('notificationType').value;
            const category = document.getElementById('notificationCategory').value;
            const title = document.getElementById('notificationTitle').value;
            const message = document.getElementById('notificationMessage').value;
            
            if (!user_id || !title || !message) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/notifications.php?action=send_notification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        user_id: parseInt(user_id),
                        type: type,
                        category: category,
                        title: title,
                        message: message
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    showToast('Notifikasi berhasil dikirim!', 'success');
                    document.getElementById('sendNotificationForm').reset();
                    loadNotifications();
                } else {
                    alert('Failed to send notification: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error sending notification:', error);
                alert('Terjadi kesalahan saat mengirim notifikasi');
            }
        }

        // Batch generate questions
        async function batchGenerateQuestions() {
            const kategori = document.getElementById('batchGenerateKategori').value;
            const count = document.getElementById('batchGenerateCount').value;
            const difficulty = document.getElementById('batchGenerateDifficulty').value;

            try {
                const response = await fetch(`${API_BASE}/batch_generate.php?action=generate_questions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ kategori_id: kategori, count: count, difficulty: difficulty })
                });
                const data = await response.json();
                
                if (data.success) {
                    alert(`${data.generated || count} soal berhasil digenerate!`);
                    addGenerationHistory('Batch Generate Soal', 'Success', `${data.generated || count} soal`);
                    // Navigate to questions section to view generated questions
                    if (confirm('Lihat soal yang baru digenerate?')) {
                        showSection('questions');
                    }
                } else {
                    alert('Gagal generate soal: ' + (data.error || 'Unknown error'));
                    addGenerationHistory('Batch Generate Soal', 'Failed', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat generate soal');
                addGenerationHistory('Batch Generate Soal', 'Error', error.message);
            }
        }

        // Generate bahan pelajaran
        async function generateBahanPelajaran() {
            const kategori = document.getElementById('generateBahanKategori').value;
            const limit = document.getElementById('generateBahanLimit').value;

            try {
                const response = await fetch(`${API_BASE}/batch_generate.php?action=generate_bahan`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ kategori_id: kategori, limit: limit })
                });
                const data = await response.json();
                
                if (data.success) {
                    alert(`${data.generated || limit} bahan pelajaran berhasil digenerate!`);
                    addGenerationHistory('Generate Bahan Pelajaran', 'Success', `${data.generated || limit} items`);
                    // Navigate to bahan pelajaran section to view generated content
                    if (confirm('Lihat bahan pelajaran yang baru digenerate?')) {
                        showSection('bahanPelajaran');
                    }
                } else {
                    alert('Gagal generate bahan pelajaran: ' + (data.error || 'Unknown error'));
                    addGenerationHistory('Generate Bahan Pelajaran', 'Failed', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat generate bahan pelajaran');
                addGenerationHistory('Generate Bahan Pelajaran', 'Error', error.message);
            }
        }

        // Generate tips batch
        async function generateTipsBatch() {
            const kategori = document.getElementById('generateTipsKategori').value;
            const limit = document.getElementById('generateTipsLimit').value;

            try {
                const response = await fetch(`${API_BASE}/batch_generate.php?action=generate_tips`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ kategori_id: kategori, limit: limit })
                });
                const data = await response.json();
                
                if (data.success) {
                    alert(`Tips berhasil digenerate!`);
                    addGenerationHistory('Generate Tips', 'Success', `Tips: ${data.tips_generated || 0}, Tricks: ${data.tricks_generated || 0}`);
                    // Navigate to tips section to view generated tips
                    if (confirm('Lihat tips yang baru digenerate?')) {
                        showSection('tips');
                    }
                } else {
                    alert('Gagal generate tips: ' + (data.error || 'Unknown error'));
                    addGenerationHistory('Generate Tips', 'Failed', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat generate tips');
                addGenerationHistory('Generate Tips', 'Error', error.message);
            }
        }

        // Generate educational content
        async function generateEducationalContent() {
            const soalId = document.getElementById('eduContentSoalId').value;

            try {
                const response = await fetch(`${API_BASE}/batch_generate.php?action=generate_edu_content`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ soal_id: soalId || null })
                });
                const data = await response.json();
                
                if (data.success) {
                    alert(`${data.generated || 1} educational content berhasil digenerate!`);
                    addGenerationHistory('Generate Educational Content', 'Success', `${data.generated || 1} items`);
                } else {
                    alert('Gagal generate educational content: ' + (data.error || 'Unknown error'));
                    addGenerationHistory('Generate Educational Content', 'Failed', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat generate educational content');
                addGenerationHistory('Generate Educational Content', 'Error', error.message);
            }
        }

        // Create database backup
        async function createBackup() {
            const backupName = document.getElementById('backupName').value || `backup_${new Date().toISOString().split('T')[0]}`;

            try {
                const response = await fetch(`${API_BASE}/batch_generate.php?action=backup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ backup_name: backupName })
                });
                const data = await response.json();
                
                if (data.success) {
                    alert(`Backup berhasil dibuat: ${data.backup_file}`);
                    addMaintenanceLog('Database Backup', 'Success', `File: ${data.backup_file}`);
                } else {
                    alert('Gagal create backup: ' + (data.error || 'Unknown error'));
                    addMaintenanceLog('Database Backup', 'Failed', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat create backup');
                addMaintenanceLog('Database Backup', 'Error', error.message);
            }
        }

        // Cleanup unused files
        async function cleanupFiles() {
            const cleanupUploads = document.getElementById('cleanupUploads').checked;
            const cleanupCache = document.getElementById('cleanupCache').checked;
            const cleanupLogs = document.getElementById('cleanupLogs').checked;

            try {
                const response = await fetch(`${API_BASE}/batch_generate.php?action=cleanup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ uploads: cleanupUploads, cache: cleanupCache, logs: cleanupLogs })
                });
                const data = await response.json();
                
                if (data.success) {
                    alert(`Cleanup berhasil! ${data.files_deleted || 0} files deleted`);
                    addMaintenanceLog('File Cleanup', 'Success', `${data.files_deleted || 0} files deleted`);
                } else {
                    alert('Gagal cleanup: ' + (data.error || 'Unknown error'));
                    addMaintenanceLog('File Cleanup', 'Failed', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat cleanup');
                addMaintenanceLog('File Cleanup', 'Error', error.message);
            }
        }

        // Analyze storage
        async function analyzeStorage() {
            try {
                const response = await fetch(`${API_BASE}/batch_generate.php?action=analyze_storage`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    const resultDiv = document.getElementById('storageAnalysisResult');
                    resultDiv.innerHTML = `
                        <div class="mt-3">
                            <p><strong>Total Size:</strong> ${data.total_size || 'N/A'}</p>
                            <p><strong>Uploads:</strong> ${data.uploads_size || 'N/A'}</p>
                            <p><strong>Cache:</strong> ${data.cache_size || 'N/A'}</p>
                            <p><strong>Logs:</strong> ${data.logs_size || 'N/A'}</p>
                        </div>
                    `;
                } else {
                    alert('Gagal analyze storage: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat analyze storage');
            }
        }

        // Check system status
        async function checkSystemStatus() {
            try {
                const response = await fetch(`${API_BASE}/batch_generate.php?action=system_status`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    const resultDiv = document.getElementById('systemStatusResult');
                    resultDiv.innerHTML = `
                        <div class="mt-3">
                            <p><strong>Database:</strong> <span class="badge ${data.db_status === 'OK' ? 'bg-success' : 'bg-danger'}">${data.db_status || 'Unknown'}</span></p>
                            <p><strong>Cache:</strong> <span class="badge ${data.cache_status === 'OK' ? 'bg-success' : 'bg-danger'}">${data.cache_status || 'Unknown'}</span></p>
                            <p><strong>Uploads:</strong> <span class="badge ${data.uploads_status === 'OK' ? 'bg-success' : 'bg-danger'}">${data.uploads_status || 'Unknown'}</span></p>
                            <p><strong>Uptime:</strong> ${data.uptime || 'N/A'}</p>
                        </div>
                    `;
                } else {
                    alert('Gagal check system status: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat check system status');
            }
        }

        // Add generation history
        function addGenerationHistory(action, status, result) {
            const table = document.getElementById('generationHistoryTable');
            const now = new Date().toLocaleString();
            
            if (table.querySelector('td[colspan="4"]')) {
                table.innerHTML = '';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${now}</td>
                <td>${action}</td>
                <td><span class="badge ${status === 'Success' ? 'bg-success' : status === 'Error' ? 'bg-danger' : 'bg-warning'}">${status}</span></td>
                <td>${result}</td>
            `;
            table.insertBefore(row, table.firstChild);
        }

        // Add maintenance log
        function addMaintenanceLog(action, status, details) {
            const table = document.getElementById('maintenanceLogTable');
            const now = new Date().toLocaleString();
            
            if (table.querySelector('td[colspan="4"]')) {
                table.innerHTML = '';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${now}</td>
                <td>${action}</td>
                <td><span class="badge ${status === 'Success' ? 'bg-success' : status === 'Error' ? 'bg-danger' : 'bg-warning'}">${status}</span></td>
                <td>${details}</td>
            `;
            table.insertBefore(row, table.firstChild);
        }

        // Show question modal
        async function showQuestionModal(id = null) {
            document.getElementById('questionForm').reset();
            document.getElementById('questionId').value = '';
            document.getElementById('questionModalLabel').textContent = 'Tambah Soal';
            
            // Load categories dynamically
            await loadQuestionCategories();
            
            // Fix accessibility: Disable focus trap to prevent aria-hidden warnings
            const modalElement = document.getElementById('questionModal');
            const modal = new bootstrap.Modal(modalElement, {
                focus: false
            });
            
            modal.show();
        }

        // Load categories for question form dropdown
        async function loadQuestionCategories() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_kategori`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data) {
                    const select = document.getElementById('questionKategori');
                    if (select) {
                        select.innerHTML = '<option value="">Pilih Kategori</option>';
                        
                        data.data.forEach(cat => {
                            const option = document.createElement('option');
                            option.value = cat.nama;
                            option.textContent = `${cat.nama} - ${cat.deskripsi || ''}`;
                            select.appendChild(option);
                        });
                    }
                    
                    // Store categories globally for dynamic lookups
                    window.categoriesData = data.data;
                }
            } catch (error) {
                console.error('Error loading question categories:', error);
            }
        }

        // Get category name by ID (dynamic lookup)
        function getCategoryNameById(categoryId) {
            if (!window.categoriesData) return 'Unknown';
            const cat = window.categoriesData.find(c => c.id === parseInt(categoryId));
            return cat ? cat.nama : 'Unknown';
        }

        // Load categories into multiple dropdowns
        async function loadCategoriesIntoDropdowns() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_kategori`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data) {
                    // Store categories globally
                    window.categoriesData = data.data;
                    
                    // Load into all category dropdowns
                    const dropdownIds = [
                        'filterKategori', 
                        'statsKategori', 
                        'tipsKategoriFilter', 
                        'irtKategoriFilter', 
                        'bahanKategoriFilter', 
                        'filterCourseCategory',
                        'filterPackageCategory',
                        'batchGenerateKategori',
                        'bahanGenerateKategori',
                        'tipsGenerateKategori',
                        'bahanKategoriId',
                        'tipsKategori',
                        'examPackageCategory'
                    ];
                    
                    dropdownIds.forEach(id => {
                        const select = document.getElementById(id);
                        if (select) {
                            const currentValue = select.value;
                            select.innerHTML = '<option value="">Semua Kategori</option>';
                            
                            data.data.forEach(cat => {
                                const option = document.createElement('option');
                                option.value = cat.nama;
                                option.textContent = `${cat.nama} - ${cat.deskripsi || ''}`;
                                select.appendChild(option);
                            });
                            
                            // Restore previously selected value if it still exists
                            if (currentValue) {
                                const exists = Array.from(select.options).some(opt => opt.value === currentValue);
                                if (exists) {
                                    select.value = currentValue;
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading categories into dropdowns:', error);
            }
        }

        // Show AI Generator modal
        async function showAIGeneratorModal() {
            try {
                const modalElement = document.getElementById('aiGeneratorModal');
                if (!modalElement) {
                    console.error('AI Generator modal element not found');
                    alert('Modal AI Generator tidak ditemukan');
                    return;
                }
                
                console.log('Showing AI Generator modal...');
                
                // Load categories BEFORE showing modal to ensure element is accessible
                await loadAIGeneratorCategories();
                
                // Fix accessibility: Disable focus trap to prevent aria-hidden warnings
                const modal = new bootstrap.Modal(modalElement, {
                    focus: false
                });
                
                modal.show();
                console.log('AI Generator modal shown');
            } catch (error) {
                console.error('Error showing AI Generator modal:', error);
                alert('Gagal membuka modal AI Generator: ' + error.message);
            }
        }

        // Load categories for AI Generator dropdown
        async function loadAIGeneratorCategories() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_kategori`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                console.log('AI Generator categories response:', data);

                if (data.success && data.data) {
                    const select = document.getElementById('aiGeneratorModalKategori');
                    if (!select) {
                        console.error('aiGeneratorModalKategori element not found');
                        return;
                    }
                    
                    console.log('Found aiGeneratorModalKategori element, current options:', select.options.length);
                    
                    select.innerHTML = '<option value="">Pilih Kategori</option>';
                    
                    data.data.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.nama;
                        option.textContent = `${cat.nama} - ${cat.deskripsi || ''}`;
                        select.appendChild(option);
                        console.log('Added option:', cat.nama);
                    });
                    
                    console.log('AI Generator categories loaded successfully. Total options:', select.options.length);
                    
                    // Add event listener to load topics when category changes
                    select.addEventListener('change', function() {
                        const selectedKategori = this.value;
                        loadTopicsByKategori(selectedKategori);
                    });
                    
                    // Store categories globally for dynamic lookups
                    window.categoriesData = data.data;
                } else {
                    console.error('Failed to load categories:', data);
                }
            } catch (error) {
                console.error('Error loading AI Generator categories:', error);
            }
        }

        // Load topics based on selected category
        async function loadTopicsByKategori(kategoriNama) {
            try {
                const select = document.getElementById('aiGeneratorTopic');
                if (!select) {
                    console.error('aiGeneratorTopic element not found');
                    return;
                }
                
                if (!kategoriNama) {
                    select.innerHTML = '<option value="">Pilih Topik (Opsional)</option>';
                    return;
                }
                
                const response = await fetch(`${API_BASE}/soal.php?action=get_topics_by_kategori&kategori=${encodeURIComponent(kategoriNama)}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                console.log('Topics response:', data);

                if (data.success && data.data) {
                    select.innerHTML = '<option value="">Pilih Topik (Opsional)</option>';
                    
                    data.data.forEach(topic => {
                        const option = document.createElement('option');
                        option.value = topic.nama;
                        option.textContent = `${topic.nama} - ${topic.deskripsi || ''}`;
                        select.appendChild(option);
                    });
                    
                    console.log('Topics loaded successfully. Total options:', select.options.length);
                } else {
                    console.error('Failed to load topics:', data);
                    select.innerHTML = '<option value="">Tidak ada topik tersedia</option>';
                }
            } catch (error) {
                console.error('Error loading topics:', error);
            }
        }

        // Generate questions (alias for showAIGeneratorModal)
        function generateQuestions() {
            console.log('generateQuestions called');
            showAIGeneratorModal();
        }

        // Generate AI questions
        async function generateAIQuestions() {
            const type = document.getElementById('aiGeneratorType').value;
            const kategori = document.getElementById('aiGeneratorModalKategori').value;
            const topic = document.getElementById('aiGeneratorTopic').value;
            const count = parseInt(document.getElementById('aiGeneratorCount').value);

            if (!kategori) {
                alert('Silakan pilih kategori terlebih dahulu');
                return;
            }

            let generated = 0;

            for (let i = 0; i < count; i++) {
                // Use topic if selected, otherwise use type
                const questionData = generateQuestionByType(type, kategori, topic);

                try {
                    const response = await fetch(`${API_BASE}/soal.php?action=create_question`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                            'X-CSRF-Token': csrfToken
                        },
                        body: JSON.stringify(questionData)
                    });

                    const responseText = await response.text();
                    console.log('create_question response:', responseText);

                    try {
                        // Check if response is valid JSON before parsing
                        if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
                            console.error('Response is not JSON:', responseText.substring(0, 100));
                            continue;
                        }
                        
                        const data = JSON.parse(responseText);

                        if (data.success) {
                            generated++;
                        } else {
                            console.error('Failed to create question:', data);
                        }
                    } catch (jsonError) {
                        console.error('Invalid JSON response:', responseText);
                    }
                } catch (error) {
                    console.error('Error generating question:', error);
                }
            }
            
            safeModalHide('aiGeneratorModal');
            alert(`${generated} soal berhasil digenerate!`);
            loadQuestions(currentPage);
        }

        function generateQuestionByType(type, kategori, topic = null) {
            // If topic is selected, use it to generate more relevant questions
            if (topic) {
                return generateTopicBasedQuestion(kategori, topic);
            }
            
            // Otherwise fall back to type-based generation
            if (type === 'math') {
                return generateMathQuestion(kategori);
            } else if (type === 'logic') {
                return generateLogicQuestion(kategori);
            } else {
                return generateGeneralQuestion(kategori);
            }
        }

        function generateTopicBasedQuestion(kategori, topic) {
            // Generate question based on topic
            const templates = {
                'TWK': [
                    `Jelaskan tentang ${topic} dalam konteks kebangsaan Indonesia.`,
                    `Apa peran ${topic} dalam membangun karakter bangsa?`,
                    `Bagaimana ${topic} berhubungan dengan Pancasila?`
                ],
                'TIU': [
                    `Selesaikan logika terkait ${topic}.`,
                    `Analisis hubungan antara ${topic} dan kemampuan intelektual.`,
                    `Tentukan kesimpulan dari kasus tentang ${topic}.`
                ],
                'TKP': [
                    `Bagaimana sikap Anda terhadap ${topic} dalam kehidupan sehari-hari?`,
                    `Jelaskan pentingnya ${topic} dalam pembentukan karakter pribadi.`,
                    `Apa tindakan yang tepat terkait ${topic}?`
                ],
                'TPA': [
                    `Tentukan pola dalam data terkait ${topic}.`,
                    `Analisis kemampuan potensial dalam bidang ${topic}.`,
                    `Selesaikan masalah logika berkaitan ${topic}.`
                ],
                'PSIKOLOGIS': [
                    `Bagaimana ${topic} mempengaruhi kepribadian seseorang?`,
                    `Jelaskan aspek psikologis dari ${topic}.`,
                    `Apa motivasi yang berkaitan dengan ${topic}?`
                ]
            };

            const categoryTemplates = templates[kategori] || templates['TWK'];
            const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
            
            // Generate options based on topic
            const options = generateOptionsForTopic(topic);
            const correctAnswer = options[Math.floor(Math.random() * options.length)];
            
            return {
                kategori: kategori,
                topic: topic, // Include topic for database relationship
                pertanyaan: template,
                opsi_a: options[0],
                opsi_b: options[1],
                opsi_c: options[2],
                opsi_d: options[3],
                jawaban_benar: correctAnswer,
                pembahasan: `Pembahasan tentang ${topic}: Soal ini dirancang untuk menguji pemahaman Anda tentang ${topic}. Jawaban yang benar adalah ${correctAnswer}.`,
                tingkat: 'sedang'
            };
        }

        function generateOptionsForTopic(topic) {
            // Generate plausible options based on topic
            const optionTemplates = [
                `Sangat setuju dengan ${topic}`,
                `Setuju dengan ${topic}`,
                `Netral terhadap ${topic}`,
                `Tidak setuju dengan ${topic}`
            ];
            
            // Shuffle and return
            return optionTemplates.sort(() => Math.random() - 0.5);
        }

        function generateMathQuestion(kategori) {
            const num1 = Math.floor(Math.random() * 100) + 1;
            const num2 = Math.floor(Math.random() * 100) + 1;
            const operations = ['+', '-', '×'];
            const op = operations[Math.floor(Math.random() * operations.length)];
            
            let question, answer;
            if (op === '+') {
                question = `Berapakah hasil dari ${num1} + ${num2}?`;
                answer = num1 + num2;
            } else if (op === '-') {
                const larger = Math.max(num1, num2);
                const smaller = Math.min(num1, num2);
                question = `Berapakah hasil dari ${larger} - ${smaller}?`;
                answer = larger - smaller;
            } else {
                question = `Berapakah hasil dari ${num1} × ${num2}?`;
                answer = num1 * num2;
            }
            
            const options = generateOptions(answer, 'number');
            
            return {
                kategori: kategori,
                pertanyaan: question,
                opsi_a: options[0],
                opsi_b: options[1],
                opsi_c: options[2],
                opsi_d: options[3],
                opsi_e: options[4],
                jawaban_benar: answer.toString(),
                pembahasan: `Jawaban: ${answer}. ${question} = ${answer}`
            };
        }

        function generateLogicQuestion(kategori) {
            const scenarios = [
                {
                    q: "Jika semua A adalah B, dan semua B adalah C, maka...",
                    a: "Semua A adalah C",
                    b: "Semua C adalah A",
                    c: "Tidak ada A yang C",
                    d: "Semua B adalah A",
                    e: "Tidak ada hubungan",
                    ans: "A"
                },
                {
                    q: "Jika hari ini adalah Senin, maka 3 hari yang lalu adalah...",
                    a: "Jumat",
                    b: "Sabtu",
                    c: "Minggu",
                    d: "Kamis",
                    e: "Selasa",
                    ans: "A"
                }
            ];
            
            const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
            
            return {
                kategori: kategori,
                pertanyaan: scenario.q,
                opsi_a: scenario.a,
                opsi_b: scenario.b,
                opsi_c: scenario.c,
                opsi_d: scenario.d,
                opsi_e: scenario.e,
                jawaban_benar: scenario.ans,
                pembahasan: `Jawaban yang benar adalah ${scenario.ans}`
            };
        }

        function generateGeneralQuestion(kategori) {
            const questions = [
                {
                    q: "Ibukota negara Indonesia adalah...",
                    a: "Jakarta",
                    b: "Bandung",
                    c: "Surabaya",
                    d: "Medan",
                    e: "Bali",
                    ans: "A"
                },
                {
                    q: "Tahun kemerdekaan Indonesia adalah...",
                    a: "1942",
                    b: "1945",
                    c: "1950",
                    d: "1938",
                    e: "1947",
                    ans: "B"
                }
            ];
            
            const q = questions[Math.floor(Math.random() * questions.length)];
            
            return {
                kategori: kategori,
                pertanyaan: q.q,
                opsi_a: q.a,
                opsi_b: q.b,
                opsi_c: q.c,
                opsi_d: q.d,
                opsi_e: q.e,
                jawaban_benar: q.ans,
                pembahasan: `Jawaban yang benar adalah ${q.ans}`
            };
        }

        function generateOptions(correctAnswer, type) {
            const options = [correctAnswer];
            
            while (options.length < 5) {
                let wrong;
                if (type === 'number') {
                    wrong = correctAnswer + Math.floor(Math.random() * 20) - 10;
                } else {
                    wrong = Math.floor(Math.random() * 100);
                }
                
                if (!options.includes(wrong) && wrong !== correctAnswer) {
                    options.push(wrong);
                }
            }
            
            // Shuffle options
            return options.sort(() => Math.random() - 0.5);
        }

        // Save question
        async function saveQuestion() {
            const questionId = document.getElementById('questionId').value;
            const questionData = {
                kategori: document.getElementById('questionKategori').value,
                pertanyaan: document.getElementById('questionPertanyaan').value,
                opsi_a: document.getElementById('questionOpsiA').value,
                opsi_b: document.getElementById('questionOpsiB').value,
                opsi_c: document.getElementById('questionOpsiC').value,
                opsi_d: document.getElementById('questionOpsiD').value,
                opsi_e: document.getElementById('questionOpsiE').value,
                jawaban_benar: document.getElementById('questionJawaban').value,
                pembahasan: document.getElementById('questionPembahasan').value
            };

            if (questionId) {
                questionData.id = questionId;
                var action = 'update_question';
            } else {
                var action = 'create_question';
            }

            try {
                const response = await fetch(`${API_BASE}/soal.php?action=${action}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify(questionData)
                });
                const data = await response.json();

                if (data.success) {
                    safeModalHide('questionModal');
                    loadQuestions(currentPage);
                    showToast('Soal berhasil disimpan!', 'success');
                } else {
                    alert(data.error || 'Gagal menyimpan soal');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan');
            }
        }

        // Edit question
        async function editQuestion(id) {
            // Fetch question details
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_soal_by_id&id=${id}`);
                const data = await response.json();

                if (data.success) {
                    const q = data.data;
                    document.getElementById('questionId').value = q.id;
                    document.getElementById('questionKategori').value = getCategoryNameById(q.kategori_id);
                    document.getElementById('questionPertanyaan').value = q.pertanyaan;
                    document.getElementById('questionOpsiA').value = q.opsi_a;
                    document.getElementById('questionOpsiB').value = q.opsi_b;
                    document.getElementById('questionOpsiC').value = q.opsi_c;
                    document.getElementById('questionOpsiD').value = q.opsi_d;
                    document.getElementById('questionOpsiE').value = q.opsi_e;
                    document.getElementById('questionJawaban').value = q.jawaban_benar;
                    document.getElementById('questionPembahasan').value = q.pemabahasan || q.pembahasan || '';
                    document.getElementById('questionModalLabel').textContent = 'Edit Soal';
                    new bootstrap.Modal(document.getElementById('questionModal')).show();
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Gagal memuat soal');
            }
        }

        // Delete question
        async function deleteQuestion(id) {
            showConfirm('Apakah Anda yakin ingin menghapus soal ini?', async () => {
                try {
                    const response = await fetch(`${API_BASE}/soal.php?action=delete_question`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ id })
                    });
                    const data = await response.json();

                    if (data.success) {
                        loadQuestions(currentPage);
                        showToast('Soal berhasil dihapus!', 'success');
                    } else {
                        alert(data.error || 'Gagal menghapus soal');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan');
                }
            });
        }

        function searchQuestions() {
            loadQuestions(1);
        }

        // Export Excel
        async function exportExcel() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_riwayat_ujian&limit=1000`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    // Convert data to Excel format
                    const excelData = data.data.map(row => ({
                        ID: row.id,
                        'Nama Peserta': row.nama_peserta,
                        'Tanggal Ujian': row.tanggal_ujian,
                        'Nilai TWK': row.nilai_twk || 0,
                        'Nilai TIU': row.nilai_tiu || 0,
                        'Nilai TKP': row.nilai_tkp || 0,
                        'Nilai Total': row.nilai_total || 0,
                        'Status': row.status_lulus
                    }));

                    // Create worksheet
                    const ws = XLSX.utils.json_to_sheet(excelData);
                    
                    // Create workbook
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Ujian');
                    
                    // Download file
                    XLSX.writeFile(wb, 'hasil_ujian.xlsx');
                } else {
                    alert('Tidak ada data untuk diexport');
                }
            } catch (error) {
                console.error('Error exporting Excel:', error);
                alert('Gagal export Excel');
            }
        }

        // Hide all sections helper
        function hideAllSections() {
            document.querySelectorAll('[id$="Section"]').forEach(el => el.classList.add('hidden'));
        }

        // Safe modal close helper to fix ARIA-hidden warning
        function safeModalHide(modalId) {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                // Blur any focused element inside the modal before hiding
                const focusedElement = modalElement.querySelector(':focus');
                if (focusedElement) {
                    focusedElement.blur();
                }
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }

        // Toggle sidebar for mobile
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('show');
        }

        // Load soal statistics
        async function loadSoalStatistics() {
            const kategori = document.getElementById('statsKategori').value;
            
            let url = `${API_BASE}/soal.php?action=get_soal_statistics&limit=50`;
            if (kategori) url += `&kategori=${kategori}`;
            
            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success) {
                    displaySoalStatistics(data.data);
                } else {
                    document.getElementById('soalStatisticsTable').innerHTML = `
                        <tr><td colspan="7" class="text-center text-danger">${data.error || 'Gagal memuat statistik'}</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading statistics:', error);
                document.getElementById('soalStatisticsTable').innerHTML = `
                    <tr><td colspan="7" class="text-center">Gagal memuat statistik</td></tr>
                `;
            }
        }

        function displaySoalStatistics(statistics) {
            const tbody = document.getElementById('soalStatisticsTable');
            tbody.innerHTML = statistics.map(s => {
                const priority = getPriorityLabel(s.persen_benar, s.muncul_count);
                return `
                    <tr>
                        <td>${s.pertanyaan.substring(0, 80)}${s.pertanyaan.length > 80 ? '...' : ''}</td>
                        <td><span class="badge bg-secondary">${s.nama_kategori}</span></td>
                        <td>${s.muncul_count}</td>
                        <td><span class="badge bg-success">${s.benar_count}</span></td>
                        <td><span class="badge bg-danger">${s.salah_count}</span></td>
                        <td>${s.persen_benar}%</td>
                        <td><span class="badge ${priority.class}">${priority.label}</span></td>
                    </tr>
                `;
            }).join('');
        }

        function getPriorityLabel(persenBenar, munculCount) {
            if (munculCount === 0) {
                return { label: 'Baru', class: 'bg-info' };
            }
            if (persenBenar < 50 && munculCount > 5) {
                return { label: 'Prioritas Tinggi', class: 'bg-danger' };
            }
            if (persenBenar < 70 && munculCount > 3) {
                return { label: 'Perlu Perhatian', class: 'bg-warning' };
            }
            if (persenBenar >= 70) {
                return { label: 'Sudah Dikuasai', class: 'bg-success' };
            }
            return { label: 'Normal', class: 'bg-secondary' };
        }

        // Load tips & tricks
        let tipsCurrentPage = 1;
        const tipsPerPage = 20;

        async function loadTipsTricks(page = 1) {
            const kategori = document.getElementById('tipsKategoriFilter').value;
            
            let url = `${API_BASE}/soal.php?action=get_tips_tricks&page=${page}&limit=${tipsPerPage}`;
            if (kategori) url += `&kategori_id=${kategori}`;
            
            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success) {
                    displayTipsTricks(data.data);
                    if (data.pagination) {
                        displayTipsPagination(data.pagination);
                    }
                } else {
                    document.getElementById('tipsTable').innerHTML = `
                        <tr><td colspan="5" class="text-center">Gagal memuat tips</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading tips:', error);
                document.getElementById('tipsTable').innerHTML = `
                    <tr><td colspan="5" class="text-center">Gagal memuat tips</td></tr>
                `;
            }
        }

        function displayTipsPagination(pagination) {
            const nav = document.getElementById('tipsPagination');
            if (!nav) return;
            
            let html = '';
            
            // Previous button
            html += `<li class="page-item ${pagination.page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadTipsTricks(${pagination.page - 1}); return false;">&laquo;</a>
            </li>`;
            
            // Page numbers
            for (let i = 1; i <= Math.min(pagination.total_pages, 5); i++) {
                html += `<li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadTipsTricks(${i}); return false;">${i}</a>
                </li>`;
            }
            
            // Next button
            html += `<li class="page-item ${pagination.page === pagination.total_pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadTipsTricks(${pagination.page + 1}); return false;">&raquo;</a>
            </li>`;
            
            nav.innerHTML = html;
        }

        function displayTipsTricks(tips) {
            const tbody = document.getElementById('tipsTable');
            tbody.innerHTML = tips.map(t => {
                const kategoriName = getCategoryNameById(t.kategori_id) || 'Semua';
                return `
                    <tr>
                        <td>${t.judul}</td>
                        <td><span class="badge bg-secondary">${kategoriName}</span></td>
                        <td><span class="badge bg-info">${t.tipe_tips}</span></td>
                        <td>${t.prioritas}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editTips(${t.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTips(${t.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function showTipsModal(id = null) {
            document.getElementById('tipsForm').reset();
            document.getElementById('tipsId').value = '';
            new bootstrap.Modal(document.getElementById('tipsModal')).show();
        }

        async function editTips(id) {
            // Fetch tips details
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_tips_tricks&id=${id}`);
                const data = await response.json();

                if (data.success && data.data) {
                    const t = data.data;
                    document.getElementById('tipsId').value = t.id;
                    document.getElementById('tipsKategori').value = t.kategori_id || '';
                    document.getElementById('tipsTipe').value = t.tipe_tips || 'teknik';
                    document.getElementById('tipsJudul').value = t.judul || '';
                    document.getElementById('tipsKonten').value = t.konten || '';
                    document.getElementById('tipsContoh').value = t.contoh || '';
                    document.getElementById('tipsPrioritas').value = t.prioritas || 0;
                    new bootstrap.Modal(document.getElementById('tipsModal')).show();
                }
            } catch (error) {
                console.error('Error loading tips details:', error);
                alert('Gagal memuat detail tips');
            }
        }

        async function saveTips() {
            const tipsData = {
                kategori_id: document.getElementById('tipsKategori').value || null,
                tipe_tips: document.getElementById('tipsTipe').value,
                judul: document.getElementById('tipsJudul').value,
                konten: document.getElementById('tipsKonten').value,
                contoh: document.getElementById('tipsContoh').value,
                prioritas: parseInt(document.getElementById('tipsPrioritas').value)
            };

            try {
                const response = await fetch(`${API_BASE}/soal.php?action=save_tips`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(tipsData)
                });
                const data = await response.json();

                if (data.success) {
                    safeModalHide('tipsModal');
                    showToast('Tips berhasil disimpan!', 'success');
                    loadTipsTricks();
                } else {
                    alert('Gagal menyimpan tips: ' + (data.error || ''));
                }
            } catch (error) {
                console.error('Error saving tips:', error);
                alert('Gagal menyimpan tips');
            }
        }

        async function deleteTips(id) {
            showConfirm('Yakin ingin menghapus tips ini?', async () => {
                try {
                    const response = await fetch(`${API_BASE}/soal.php?action=delete_tips`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ id })
                    });
                    const data = await response.json();

                    if (data.success) {
                        showToast('Tips berhasil dihapus!', 'success');
                        loadTipsTricks();
                    } else {
                        alert('Gagal menghapus tips');
                    }
                } catch (error) {
                    console.error('Error deleting tips:', error);
                    alert('Gagal menghapus tips');
                }
            });
        }

        // Load leaderboard settings
        async function loadLeaderboardSettings() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_leaderboard_optout_status`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.opted_out) {
                    document.getElementById('optOutLeaderboard').checked = true;
                }
            } catch (error) {
                console.error('Error loading leaderboard settings:', error);
            }
        }

        async function toggleLeaderboardOptOut() {
            const optOut = document.getElementById('optOutLeaderboard').checked;
            const namaPeserta = localStorage.getItem('currentNama') || 'user';

            try {
                const response = await fetch(`${API_BASE}/soal.php?action=leaderboard_optout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        nama_peserta: namaPeserta,
                        optout: optOut
                    })
                });
                const data = await response.json();

                if (data.success) {
                    alert(optOut ? 'Berhasil opt-out dari leaderboard' : 'Berhasil opt-in ke leaderboard');
                } else {
                    alert('Gagal mengubah pengaturan: ' + (data.error || ''));
                    document.getElementById('optOutLeaderboard').checked = !optOut;
                }
            } catch (error) {
                console.error('Error toggling leaderboard opt-out:', error);
                alert('Gagal mengubah pengaturan');
                document.getElementById('optOutLeaderboard').checked = !optOut;
            }
        }

        // Load blueprints
        let blueprintCurrentPage = 1;
        const blueprintPerPage = 20;

        async function loadBlueprints(page = 1) {
            const paketFilter = document.getElementById('blueprintPaketFilter').value;
            
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_blueprints&paket_id=${paketFilter}&page=${page}&limit=${blueprintPerPage}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success) {
                    displayBlueprints(data.data);
                    if (data.pagination) {
                        displayBlueprintPagination(data.pagination);
                    }
                } else {
                    document.getElementById('blueprintTable').innerHTML = `
                        <tr><td colspan="8" class="text-center">Gagal memuat blueprints</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading blueprints:', error);
                document.getElementById('blueprintTable').innerHTML = `
                    <tr><td colspan="8" class="text-center">Gagal memuat blueprints</td></tr>
                `;
            }
        }

        function displayBlueprintPagination(pagination) {
            const nav = document.getElementById('blueprintPagination');
            if (!nav) return;
            
            let html = '';
            
            // Previous button
            html += `<li class="page-item ${pagination.page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadBlueprints(${pagination.page - 1}); return false;">&laquo;</a>
            </li>`;
            
            // Page numbers
            for (let i = 1; i <= Math.min(pagination.total_pages, 5); i++) {
                html += `<li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadBlueprints(${i}); return false;">${i}</a>
                </li>`;
            }
            
            // Next button
            html += `<li class="page-item ${pagination.page === pagination.total_pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadBlueprints(${pagination.page + 1}); return false;">&raquo;</a>
            </li>`;
            
            nav.innerHTML = html;
        }

        function displayBlueprints(blueprints) {
            const tbody = document.getElementById('blueprintTable');
            tbody.innerHTML = blueprints.map(b => {
                const kategoriName = getCategoryNameById(b.kategori_id) || 'Unknown';
                const statusClass = b.valid ? 'success' : 'danger';
                const statusText = b.valid ? 'Valid' : 'Invalid';
                return `
                    <tr>
                        <td>${b.nama_paket || 'N/A'}</td>
                        <td><span class="badge bg-secondary">${kategoriName}</span></td>
                        <td>${b.target_count}</td>
                        <td><span class="badge bg-info">${b.min_difficulty}</span></td>
                        <td><span class="badge bg-info">${b.max_difficulty}</span></td>
                        <td>${b.available_count || 0}</td>
                        <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editBlueprint(${b.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteBlueprint(${b.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function showBlueprintModal(id = null) {
            document.getElementById('blueprintForm').reset();
            document.getElementById('blueprintId').value = '';
            loadPaketOptions();
            new bootstrap.Modal(document.getElementById('blueprintModal')).show();
        }

        async function editBlueprint(id) {
            // Fetch blueprint details
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_blueprints&id=${id}`);
                const data = await response.json();

                if (data.success && data.data) {
                    const b = data.data;
                    document.getElementById('blueprintId').value = b.id;
                    document.getElementById('blueprintPaket').value = b.paket_id || '';
                    document.getElementById('blueprintKategori').value = b.kategori_id || '';
                    document.getElementById('blueprintTarget').value = b.target_count || '';
                    document.getElementById('blueprintMinDifficulty').value = b.min_difficulty || 'sedang';
                    document.getElementById('blueprintMaxDifficulty').value = b.max_difficulty || 'sedang';
                    loadPaketOptions();
                    new bootstrap.Modal(document.getElementById('blueprintModal')).show();
                }
            } catch (error) {
                console.error('Error loading blueprint details:', error);
                alert('Gagal memuat detail blueprint');
            }
        }

        async function loadPaketOptions() {
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_paket_tryout`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success) {
                    const select = document.getElementById('blueprintPaket');
                    const filterSelect = document.getElementById('blueprintPaketFilter');
                    select.innerHTML = '<option value="">Pilih Paket</option>';
                    filterSelect.innerHTML = '<option value="">Semua Paket</option>';
                    data.data.forEach(p => {
                        select.innerHTML += `<option value="${p.id}">${p.nama_paket}</option>`;
                        filterSelect.innerHTML += `<option value="${p.id}">${p.nama_paket}</option>`;
                    });
                }
            } catch (error) {
                console.error('Error loading paket options:', error);
            }
        }

        async function saveBlueprint() {
            const blueprintData = {
                paket_id: document.getElementById('blueprintPaket').value,
                kategori_id: document.getElementById('blueprintKategori').value,
                target_count: document.getElementById('blueprintTargetCount').value,
                min_difficulty: document.getElementById('blueprintMinDifficulty').value,
                max_difficulty: document.getElementById('blueprintMaxDifficulty').value
            };

            try {
                const response = await fetch(`${API_BASE}/soal.php?action=save_blueprint`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(blueprintData)
                });
                const data = await response.json();

                if (data.success) {
                    safeModalHide('blueprintModal');
                    showToast('Blueprint berhasil disimpan!', 'success');
                    loadBlueprints();
                } else {
                    alert('Gagal menyimpan blueprint: ' + (data.error || ''));
                }
            } catch (error) {
                console.error('Error saving blueprint:', error);
                alert('Gagal menyimpan blueprint');
            }
        }

        async function deleteBlueprint(id) {
            showConfirm('Yakin ingin menghapus blueprint ini?', async () => {
                try {
                    const response = await fetch(`${API_BASE}/soal.php?action=delete_blueprint`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ id })
                    });
                    const data = await response.json();

                    if (data.success) {
                        showToast('Blueprint berhasil dihapus!', 'success');
                        loadBlueprints();
                    } else {
                        alert('Gagal menghapus blueprint');
                    }
                } catch (error) {
                    console.error('Error deleting blueprint:', error);
                    alert('Gagal menghapus blueprint');
                }
            });
        }

        async function validateCurrentBlueprint() {
            const paket_id = document.getElementById('blueprintPaket').value;
            if (!paket_id) {
                alert('Pilih paket terlebih dahulu');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/soal.php?action=validate_blueprint`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ paket_id })
                });
                const data = await response.json();

                if (data.success) {
                    if (data.valid) {
                        alert('Blueprint valid! Semua kategori memiliki cukup soal.');
                    } else {
                        alert('Blueprint tidak valid. Beberapa kategori kekurangan soal.');
                    }
                } else {
                    alert('Gagal validasi blueprint: ' + (data.error || ''));
                }
            } catch (error) {
                console.error('Error validating blueprint:', error);
                alert('Gagal validasi blueprint');
            }
        }

        // Load IRT analysis
        async function loadIRTAnalysis() {
            const kategori = document.getElementById('irtKategoriFilter').value;
            const quality = document.getElementById('irtQualityFilter').value;
            
            let url = `${API_BASE}/soal.php?action=get_irt_analysis`;
            if (kategori) url += `&kategori=${kategori}`;
            if (quality) url += `&quality=${quality}`;
            
            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success) {
                    displayIRTAnalysis(data.data);
                } else {
                    document.getElementById('irtTable').innerHTML = `
                        <tr><td colspan="10" class="text-center">Gagal memuat IRT analysis</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading IRT analysis:', error);
                document.getElementById('irtTable').innerHTML = `
                    <tr><td colspan="10" class="text-center">Gagal memuat IRT analysis</td></tr>
                `;
            }
        }

        function displayIRTAnalysis(analysis) {
            const tbody = document.getElementById('irtTable');
            tbody.innerHTML = analysis.map(a => {
                const qualityClass = {
                    'excellent': 'success',
                    'good': 'info',
                    'fair': 'warning',
                    'poor': 'danger'
                };
                const p_benar = (a.p_benar * 100).toFixed(1);
                return `
                    <tr>
                        <td>${a.pertanyaan.substring(0, 50)}...</td>
                        <td><span class="badge bg-secondary">${a.nama_kategori}</span></td>
                        <td>${a.discrimination_index ? a.discrimination_index.toFixed(4) : '-'}</td>
                        <td>${a.irt_a ? a.irt_a.toFixed(4) : '-'}</td>
                        <td>${a.irt_b ? a.irt_b.toFixed(4) : '-'}</td>
                        <td>${a.irt_c ? a.irt_c.toFixed(4) : '-'}</td>
                        <td><span class="badge bg-${qualityClass[a.item_quality] || 'secondary'}">${a.item_quality || '-'}</span></td>
                        <td>${a.muncul_count || 0}</td>
                        <td>${p_benar}%</td>
                    </tr>
                `;
            }).join('');
        }

        async function calculateIRT() {
            if (!confirm('Hitung IRT parameters untuk semua soal? Ini akan memperbarui data di database.')) return;

            try {
                const response = await fetch(`${API_BASE}/soal.php?action=calculate_irt`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success) {
                    alert(`Berhasil menghitung IRT parameters untuk ${data.updated} soal.`);
                    loadIRTAnalysis();
                } else {
                    alert('Gagal menghitung IRT parameters: ' + (data.error || ''));
                }
            } catch (error) {
                console.error('Error calculating IRT:', error);
                alert('Gagal menghitung IRT parameters');
            }
        }

        let bahanCurrentPage = 1;
        const bahanPerPage = 10;

        // Load bahan pelajaran
        async function loadBahanPelajaran(page = 1) {
            try {
                const kategori = document.getElementById('bahanKategoriFilter').value;

                let url = `${API_BASE}/soal.php?action=get_all_bahan_pelajaran&page=${page}&limit=${bahanPerPage}`;
                if (kategori) url += `&kategori_id=${kategori}`;

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                console.log('Bahan pelajaran response:', data);
                if (data.success) {
                    displayBahanPelajaran(data.data);
                    displayBahanPagination(data.pagination);
                    bahanCurrentPage = page;
                } else {
                    document.getElementById('bahanPelajaranTable').innerHTML = `
                        <tr><td colspan="6" class="text-center text-danger">Error: ${data.error || 'Gagal memuat bahan pelajaran'}</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading bahan pelajaran:', error);
                document.getElementById('bahanPelajaranTable').innerHTML = `
                    <tr><td colspan="6" class="text-center text-danger">Gagal memuat bahan pelajaran: ${error.message}</td></tr>
                    `;
            }
        }

        function displayBahanPagination(pagination) {
            const paginationContainer = document.getElementById('bahanPagination');
            if (!paginationContainer) return;

            const totalPages = pagination?.total_pages ?? 0;
            const currentPage = pagination?.current_page ?? 1;

            if (totalPages <= 1) {
                paginationContainer.innerHTML = '';
                return;
            }

            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                const activeClass = i === currentPage ? 'active' : '';
                html += `<li class="page-item ${activeClass}"><a class="page-link" href="#" onclick="loadBahanPelajaran(${i}); return false;">${i}</a></li>`;
            }

            paginationContainer.innerHTML = html;
        }

        let currentBahanData = []; // Store bahan data for editing

        function displayBahanPelajaran(bahan) {
            const tbody = document.getElementById('bahanPelajaranTable');
            if (!bahan || bahan.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Tidak ada data bahan pelajaran</td></tr>`;
                return;
            }

            // Store data for editing
            currentBahanData = bahan;

            tbody.innerHTML = bahan.map((b, index) => {
                const filePath = b.file_path ? `../${b.file_path}` : '';
                const hasContent = filePath || b.url;
                const contentUrl = filePath || b.url || '';
                const contentType = b.tipe || 'link';

                let fileOrUrl = '-';
                if (hasContent) {
                    fileOrUrl = `<a href="#" onclick="previewBahanContent('${contentUrl}', '${contentType}', '${b.judul.replace(/'/g, "\\'")}'); return false;" class="text-primary">${b.tipe === 'teks' ? 'Baca' : b.tipe === 'video' ? 'Tonton' : 'Buka'}</a>`;
                }

                const kategoriName = getCategoryNameById(b.kategori_id) || '-';
                return `
                    <tr>
                        <td><span class="badge bg-info">${kategoriName}</span></td>
                        <td>${b.judul}</td>
                        <td>${b.soal_id || '-'}</td>
                        <td><span class="badge bg-secondary">${b.tipe}</span></td>
                        <td>${fileOrUrl}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editBahanByIndex(${index})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteBahanPelajaran(${b.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function editBahanByIndex(index) {
            if (currentBahanData[index]) {
                showBahanPelajaranModal(currentBahanData[index]);
            }
        }

        function showBahanPelajaranModal(bahan = null) {
            const form = document.getElementById('bahanPelajaranForm');
            if (bahan) {
                // Edit mode - populate form
                document.getElementById('bahanId').value = bahan.id;
                document.getElementById('bahanKategoriId').value = bahan.kategori_id || '';
                document.getElementById('bahanSoalId').value = bahan.soal_id || '';
                document.getElementById('bahanJudul').value = bahan.judul || '';
                document.getElementById('bahanTipe').value = bahan.tipe || 'teks';
                document.getElementById('bahanKonten').value = bahan.konten || '';
                document.getElementById('bahanUrl').value = bahan.url || '';
                document.getElementById('bahanUrutan').value = bahan.urutan || 0;
            } else {
                // Add mode - reset form
                form.reset();
                document.getElementById('bahanId').value = '';
            }
            new bootstrap.Modal(document.getElementById('bahanPelajaranModal')).show();
        }

        // Load users
        async function loadUsers() {
            try {
                const roleFilter = document.getElementById('filterUserRole').value;
                const searchQuery = document.getElementById('searchUser').value;
                
                let url = `${API_BASE}/auth.php?action=get_users`;
                const params = new URLSearchParams();
                if (roleFilter) params.append('role', roleFilter);
                if (searchQuery) params.append('search', searchQuery);
                if (params.toString()) url += `&${params.toString()}`;
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    displayUsers(data.data);
                } else {
                    document.getElementById('usersTable').innerHTML = `
                        <tr><td colspan="8" class="text-center text-muted">No users found</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading users:', error);
                document.getElementById('usersTable').innerHTML = `
                    <tr><td colspan="8" class="text-center text-muted">Failed to load users</td></tr>
                `;
            }
        }

        function displayUsers(users) {
            const tbody = document.getElementById('usersTable');
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.nama_lengkap || '-'}</td>
                    <td><span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${user.role}</span></td>
                    <td>${formatPhoneSimple(user.nomor_hp)}</td>
                    <td>${user.asal_sekolah || '-'}</td>
                    <td>${formatDate(user.created_at, 'short')}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function showCreateUserModal() {
            document.getElementById('userForm').reset();
            document.getElementById('userId').value = '';
            new bootstrap.Modal(document.getElementById('userModal')).show();
        }

        async function editUser(id) {
            // Fetch user details
            try {
                const response = await fetch(`${API_BASE}/auth.php?action=get_user&id=${id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data) {
                    const user = data.data;
                    document.getElementById('userId').value = user.id;
                    document.getElementById('userUsername').value = user.username;
                    document.getElementById('userFullName').value = user.nama_lengkap || '';
                    document.getElementById('userRole').value = user.role;
                    document.getElementById('userPhone').value = user.nomor_hp || '';
                    document.getElementById('userSchool').value = user.asal_sekolah || '';
                    new bootstrap.Modal(document.getElementById('userModal')).show();
                }
            } catch (error) {
                console.error('Error loading user details:', error);
                alert('Failed to load user details');
            }
        }

        async function saveUser() {
            const formData = {
                id: document.getElementById('userId').value,
                username: document.getElementById('userUsername').value,
                nama_lengkap: document.getElementById('userFullName').value,
                role: document.getElementById('userRole').value,
                nomor_hp: document.getElementById('userPhone').value,
                asal_sekolah: document.getElementById('userSchool').value
            };

            if (!formData.username) {
                alert('Username is required');
                return;
            }

            try {
                const url = formData.id ? `${API_BASE}/auth.php?action=update_user` : `${API_BASE}/auth.php?action=create_user`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.success) {
                    safeModalHide('userModal');
                    loadUsers();
                    alert(formData.id ? 'User updated successfully' : 'User created successfully');
                } else {
                    alert('Failed to save user: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error saving user:', error);
                alert('Failed to save user');
            }
        }

        async function deleteUser(id) {
            showConfirm('Are you sure you want to delete this user?', async () => {
                try {
                    const response = await fetch(`${API_BASE}/auth.php?action=delete_user&id=${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const data = await response.json();

                    if (data.success) {
                        loadUsers();
                        showToast('User berhasil dihapus!', 'success');
                    } else {
                        alert('Failed to delete user: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    alert('Failed to delete user');
                }
            });
        }

        function searchUsers() {
            loadUsers();
        }

        // Load exam packages
        async function loadExamPackages() {
            try {
                const categoryFilter = document.getElementById('filterPackageCategory').value;
                const searchQuery = document.getElementById('searchExamPackage').value;
                
                let url = `${API_BASE}/soal.php?action=get_paket_tryout`;
                const params = new URLSearchParams();
                if (categoryFilter) params.append('kategori_id', categoryFilter);
                if (searchQuery) params.append('search', searchQuery);
                if (params.toString()) url += `&${params.toString()}`;
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    displayExamPackages(data.data);
                } else {
                    document.getElementById('examPackagesTable').innerHTML = `
                        <tr><td colspan="8" class="text-center text-muted">No packages found</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading exam packages:', error);
                document.getElementById('examPackagesTable').innerHTML = `
                    <tr><td colspan="8" class="text-center text-muted">Failed to load packages</td></tr>
                `;
            }
        }

        function displayExamPackages(packages) {
            const tbody = document.getElementById('examPackagesTable');
            tbody.innerHTML = packages.map(pkg => `
                <tr>
                    <td>${pkg.id}</td>
                    <td>${pkg.nama_paket}</td>
                    <td>${pkg.kategori_id || '-'}</td>
                    <td>${pkg.durasi}</td>
                    <td>${pkg.total_soal}</td>
                    <td><span class="badge ${pkg.is_active ? 'bg-success' : 'bg-secondary'}">${pkg.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>${formatDate(pkg.created_at, 'short')}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editExamPackage(${pkg.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteExamPackage(${pkg.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function showCreateExamPackageModal() {
            document.getElementById('examPackageForm').reset();
            document.getElementById('examPackageId').value = '';
            new bootstrap.Modal(document.getElementById('examPackageModal')).show();
        }

        async function editExamPackage(id) {
            // Fetch package details
            try {
                const response = await fetch(`${API_BASE}/soal.php?action=get_paket_tryout&id=${id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();

                if (data.success && data.data) {
                    const pkg = data.data;
                    document.getElementById('examPackageId').value = pkg.id;
                    document.getElementById('examPackageName').value = pkg.nama_paket;
                    document.getElementById('examPackageDesc').value = pkg.deskripsi || '';
                    document.getElementById('examPackageDuration').value = pkg.durasi;
                    document.getElementById('examPackageCategory').value = pkg.kategori_id || '';
                    document.getElementById('examPackageTotalQuestions').value = pkg.total_soal;
                    document.getElementById('examPackageActive').checked = pkg.is_active;
                    new bootstrap.Modal(document.getElementById('examPackageModal')).show();
                }
            } catch (error) {
                console.error('Error loading package details:', error);
                alert('Failed to load package details');
            }
        }

        async function saveExamPackage() {
            const formData = {
                id: document.getElementById('examPackageId').value,
                nama_paket: document.getElementById('examPackageName').value,
                deskripsi: document.getElementById('examPackageDesc').value,
                durasi: document.getElementById('examPackageDuration').value,
                kategori_id: document.getElementById('examPackageCategory').value,
                total_soal: document.getElementById('examPackageTotalQuestions').value,
                is_active: document.getElementById('examPackageActive').checked ? 1 : 0
            };

            if (!formData.nama_paket) {
                alert('Package name is required');
                return;
            }

            try {
                const url = formData.id ? `${API_BASE}/soal.php?action=update_paket_tryout` : `${API_BASE}/soal.php?action=create_paket_tryout`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.success) {
                    safeModalHide('examPackageModal');
                    loadExamPackages();
                    alert(formData.id ? 'Package updated successfully' : 'Package created successfully');
                } else {
                    alert('Failed to save package: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error saving package:', error);
                alert('Failed to save package');
            }
        }

        async function deleteExamPackage(id) {
            showConfirm('Are you sure you want to delete this package?', async () => {
                try {
                    const response = await fetch(`${API_BASE}/soal.php?action=delete_paket_tryout&id=${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const data = await response.json();

                    if (data.success) {
                        loadExamPackages();
                        showToast('Paket berhasil dihapus!', 'success');
                    } else {
                        alert('Failed to delete package: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error deleting package:', error);
                    alert('Failed to delete package');
                }
            });
        }

        function searchExamPackages() {
            loadExamPackages();
        }

        // Load exam sessions
        async function loadExamSessions() {
            try {
                const statusFilter = document.getElementById('filterSessionStatus').value;
                const searchQuery = document.getElementById('searchExamSession').value;
                
                let url = `${API_BASE}/soal.php?action=get_sesi_ujian`;
                const params = new URLSearchParams();
                if (statusFilter) params.append('status', statusFilter);
                if (searchQuery) params.append('search', searchQuery);
                if (params.toString()) url += `&${params.toString()}`;
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    displayExamSessions(data.data);
                } else {
                    document.getElementById('examSessionsTable').innerHTML = `
                        <tr><td colspan="8" class="text-center text-muted">No sessions found</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading exam sessions:', error);
                document.getElementById('examSessionsTable').innerHTML = `
                    <tr><td colspan="8" class="text-center text-muted">Failed to load sessions</td></tr>
                `;
            }
        }

        function displayExamSessions(sessions) {
            const tbody = document.getElementById('examSessionsTable');
            tbody.innerHTML = sessions.map(session => `
                <tr>
                    <td>${session.id}</td>
                    <td>${session.user_nama || '-'}</td>
                    <td>${session.paket_nama || '-'}</td>
                    <td>${new Date(session.waktu_mulai).toLocaleString('id-ID')}</td>
                    <td>${session.waktu_selesai ? new Date(session.waktu_selesai).toLocaleString('id-ID') : '-'}</td>
                    <td><span class="badge ${getStatusBadgeClass(session.status)}">${session.status}</span></td>
                    <td>${session.nilai_total || '-'}</td>
                    <td>
                        ${session.status === 'in_progress' ? `
                            <button class="btn btn-sm btn-warning" onclick="terminateSession(${session.id})">
                                <i class="fas fa-stop"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-info" onclick="viewSessionDetails(${session.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function getStatusBadgeClass(status) {
            switch(status) {
                case 'in_progress': return 'bg-warning';
                case 'completed': return 'bg-success';
                case 'abandoned': return 'bg-danger';
                default: return 'bg-secondary';
            }
        }

        function refreshExamSessions() {
            loadExamSessions();
        }

        async function terminateSession(id) {
            showConfirm('Are you sure you want to terminate this session?', async () => {
                try {
                    const response = await fetch(`${API_BASE}/soal.php?action=terminate_session&id=${id}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const data = await response.json();

                    if (data.success) {
                        loadExamSessions();
                        showToast('Sesi berhasil dihentikan!', 'success');
                    } else {
                        alert('Failed to terminate session: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error terminating session:', error);
                    alert('Failed to terminate session');
                }
            });
        }

        async function viewSessionDetails(id) {
            alert('View session details - to be implemented');
        }

        function searchExamSessions() {
            loadExamSessions();
        }

        // Load participants
        async function loadParticipants() {
            try {
                const statusFilter = document.getElementById('filterParticipantStatus').value;
                const searchQuery = document.getElementById('searchParticipant').value;
                
                let url = `${API_BASE}/soal.php?action=get_participants`;
                const params = new URLSearchParams();
                if (statusFilter) params.append('status', statusFilter);
                if (searchQuery) params.append('search', searchQuery);
                if (params.toString()) url += `&${params.toString()}`;
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    displayParticipants(data.data);
                } else {
                    document.getElementById('participantsTable').innerHTML = `
                        <tr><td colspan="9" class="text-center text-muted">No participants found</td></tr>
                    `;
                }
            } catch (error) {
                console.error('Error loading participants:', error);
                document.getElementById('participantsTable').innerHTML = `
                    <tr><td colspan="9" class="text-center text-muted">Failed to load participants</td></tr>
                `;
            }
        }

        function displayParticipants(participants) {
            const tbody = document.getElementById('participantsTable');
            tbody.innerHTML = participants.map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.nama_peserta || '-'}</td>
                    <td>${p.user_nama || '-'}</td>
                    <td>${new Date(p.waktu_mulai).toLocaleString('id-ID')}</td>
                    <td>${p.waktu_selesai ? new Date(p.waktu_selesai).toLocaleString('id-ID') : '-'}</td>
                    <td>${p.durasi_menit || '-'} min</td>
                    <td><span class="badge ${getParticipantStatusBadgeClass(p.status)}">${p.status}</span></td>
                    <td>${p.ability_estimate || '-'}</td>
                    <td>
                        ${p.status === 'berjalan' ? `
                            <button class="btn btn-sm btn-warning" onclick="terminateSession(${p.id})">
                                <i class="fas fa-stop"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-info" onclick="viewParticipantDetails(${p.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function getParticipantStatusBadgeClass(status) {
            switch(status) {
                case 'berjalan': return 'bg-warning';
                case 'selesai': return 'bg-success';
                case 'timeout': return 'bg-danger';
                default: return 'bg-secondary';
            }
        }

        function refreshParticipants() {
            loadParticipants();
        }

        async function viewParticipantDetails(id) {
            alert('View participant details - to be implemented');
        }

        function searchParticipants() {
            loadParticipants();
        }

        async function saveBahanPelajaran() {
            const formData = new FormData();
            formData.append('id', document.getElementById('bahanId').value);
            formData.append('kategori_id', document.getElementById('bahanKategoriId').value);
            formData.append('soal_id', document.getElementById('bahanSoalId').value);
            formData.append('judul', document.getElementById('bahanJudul').value);
            formData.append('konten', document.getElementById('bahanKonten').value);
            formData.append('tipe', document.getElementById('bahanTipe').value);
            formData.append('url', document.getElementById('bahanUrl').value);
            formData.append('urutan', document.getElementById('bahanUrutan').value);
            
            const fileInput = document.getElementById('bahanFile');
            if (fileInput.files.length > 0) {
                formData.append('file', fileInput.files[0]);
            }

            try {
                const response = await fetch(`${API_BASE}/soal.php?action=save_bahan_pelajaran`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    body: formData
                });
                const data = await response.json();

                if (data.success) {
                    safeModalHide('bahanPelajaranModal');
                    showToast('Bahan pelajaran berhasil disimpan!', 'success');
                    loadBahanPelajaran(bahanCurrentPage);
                } else {
                    alert('Gagal menyimpan bahan pelajaran: ' + (data.error || ''));
                }
            } catch (error) {
                console.error('Error saving bahan pelajaran:', error);
                alert('Gagal menyimpan bahan pelajaran');
            }
        }

        // Preview bahan pelajaran content in modal
        function previewBahanContent(url, type, title) {
            const container = document.getElementById('previewContainer');
            const externalLink = document.getElementById('previewOpenExternal');
            const modalTitle = document.querySelector('#previewContentModal .modal-title');

            modalTitle.textContent = title || 'Preview Konten';
            externalLink.href = url;

            let content = '';
            if (type === 'video') {
                content = `<video controls style="width: 100%; max-height: 60vh;">
                    <source src="${url}" type="video/mp4">
                    Browser Anda tidak mendukung video tag.
                </video>`;
            } else if (type === 'pdf') {
                content = `<iframe src="${url}" style="width: 100%; height: 70vh;" frameborder="0"></iframe>`;
            } else if (type === 'teks' || type === 'link' || url.endsWith('.html')) {
                content = `<iframe src="${url}" style="width: 100%; height: 70vh; border: none;"></iframe>`;
            } else {
                content = `<div class="text-center p-5">
                    <p>File tidak dapat ditampilkan di browser.</p>
                    <a href="${url}" target="_blank" class="btn btn-primary">Download / Buka File</a>
                </div>`;
            }

            container.innerHTML = content;
            new bootstrap.Modal(document.getElementById('previewContentModal')).show();
        }

        async function deleteBahanPelajaran(id) {
            showConfirm('Yakin ingin menghapus bahan pelajaran ini?', async () => {
                try {
                    const response = await fetch(`${API_BASE}/soal.php?action=delete_bahan_pelajaran`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ id })
                    });
                    const data = await response.json();

                    if (data.success) {
                        showToast('Bahan pelajaran berhasil dihapus!', 'success');
                        loadBahanPelajaran(bahanCurrentPage);
                    } else {
                        alert('Gagal menghapus bahan pelajaran');
                    }
                } catch (error) {
                    console.error('Error deleting bahan pelajaran:', error);
                    alert('Gagal menghapus bahan pelajaran');
                }
            });
        }

