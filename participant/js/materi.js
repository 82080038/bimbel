let authToken = '';
let allMaterials = [];
let filteredMaterials = [];
let currentPage = 1;
let itemsPerPage = 20;
let totalPages = 1;
let totalItems = 0;
let isFilterActive = false;

// Load auth token
function loadAuthToken() {
    authToken = localStorage.getItem('authToken') || '';
    if (!authToken) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

// Load materials with pagination using centralized API helper
async function loadMaterials(page = 1) {
    currentPage = page;
    isFilterActive = false;
    
    const data = await AppConfig.fetchAPI(`soal.php?action=get_all_bahan_pelajaran&page=${page}&limit=${itemsPerPage}`);
    
    if (data.success && data.data) {
        allMaterials = data.data;
        filteredMaterials = [...allMaterials];
        
        // Update pagination info from API
        if (data.pagination) {
            totalItems = parseInt(data.pagination.total) || 0;
            totalPages = parseInt(data.pagination.total_pages) || 1;
            currentPage = parseInt(data.pagination.current_page) || 1;
        }
        
        displayMaterials(filteredMaterials);
        displayPagination();
    } else {
        displayEmptyState();
        hidePagination();
    }
}

// Display learning topics
function displayLearningTopics(topics) {
    const grid = document.getElementById('materialsGrid');

    if (!grid) return;

    grid.innerHTML = topics.map(topic => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${topic.topic_name || 'Topik'}</h5>
                    <p class="card-text text-muted">${topic.description || 'Deskripsi topik'}</p>
                    <p class="card-text"><small class="text-muted">Kategori: ${topic.kategori || '-'}</small></p>
                    <button class="btn btn-primary btn-sm" onclick="markTopicStudied(${topic.id})">
                        <i class="fas fa-check"></i> Tandai Sudah Dipelajari
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Mark topic as studied
async function markTopicStudied(topicId) {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=mark_topic_studied'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ topic_id: topicId })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Topik ditandai sebagai sudah dipelajari!');
            loadMaterials(); // Refresh
        } else {
            alert('Gagal menandai topik: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error marking topic:', error);
        alert('Terjadi kesalahan saat menandai topik');
    }
}

// Display materials
function displayMaterials(materials) {
    const grid = document.getElementById('materialsGrid');

    if (!materials || materials.length === 0) {
        displayEmptyState();
        return;
    }

    grid.innerHTML = materials.map(material => {
        const iconClass = material.tipe === 'pdf' ? 'pdf' :
                         material.tipe === 'video' ? 'video' :
                         material.tipe === 'link' ? 'link' : 'text';
        const progress = material.progress || 0;

        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="materi-card h-100">
                    <div class="materi-icon ${iconClass}">
                        <i class="fas fa-${material.tipe === 'pdf' ? 'file-pdf' :
                                       material.tipe === 'video' ? 'play-circle' :
                                       material.tipe === 'link' ? 'link' : 'file-alt'}"></i>
                    </div>
                    <h5 class="mb-2">${material.judul || 'Tanpa Judul'}</h5>
                    <p class="text-muted small mb-3">${material.konten ? material.konten.substring(0, 100) + '...' : 'Tidak ada deskripsi'}</p>
                    <div class="mb-3">
                        <span class="badge badge-category">${material.nama_kategori || material.kategori || 'Umum'}</span>
                        <span class="badge badge-category ms-1">${material.tipe || 'Umum'}</span>
                    </div>
                    <div class="progress-indicator">
                        <div class="progress-bar-custom" style="width: ${progress}%;"></div>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                        <small class="text-muted">${progress}% selesai</small>
                        ${(() => {
                            let link = material.file_path || material.url;
                            // Fix relative path from participant folder to root
                            if (link && !link.startsWith('http') && !link.startsWith('/')) {
                                link = '../' + link;
                            }
                            return link
                                ? `<a href="${link}" target="_blank" class="btn btn-sm btn-primary"><i class="fas fa-external-link-alt"></i> Buka</a>`
                                : (material.konten
                                    ? `<button class="btn btn-sm btn-secondary" onclick="showMateriKonten(${material.id})"><i class="fas fa-eye"></i> Lihat</button>`
                                    : `<span class="btn btn-sm btn-outline-secondary disabled">Tidak tersedia</span>`);
                        })()}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Display empty state
function displayEmptyState() {
    const grid = document.getElementById('materialsGrid');
    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-book fa-4x mb-3 text-muted"></i>
            <h4 class="text-muted">Belum ada bahan ajar</h4>
            <p class="text-muted">Bahan ajar akan ditambahkan sesuai kebutuhan belajar Anda</p>
        </div>
    `;
}

// Display error state
function displayErrorState() {
    const grid = document.getElementById('materialsGrid');
    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-exclamation-triangle fa-4x mb-3 text-warning"></i>
            <h4 class="text-muted">Gagal memuat bahan ajar</h4>
            <p class="text-muted">Silakan refresh halaman untuk mencoba lagi</p>
            <button class="btn btn-primary mt-2" onclick="loadMaterials()">
                <i class="fas fa-sync"></i> Refresh
            </button>
        </div>
    `;
}

// Active filter state
let activeCategoryId = null;
let activeTipe = '';
let activeSearch = '';

// Filter materials - uses server-side for category, client-side for tipe/search
async function filterMaterials() {
    const kategori = document.getElementById('filterKategori').value;
    const tipe = document.getElementById('filterTipe').value;
    const search = document.getElementById('searchMaterials').value.toLowerCase();
    
    activeTipe = tipe;
    activeSearch = search;

    // If category changed, reload from server with kategori_id
    if (kategori) {
        const categoryMap = {
            'TWK': 1,
            'TIU': 2,
            'TKP': 3,
            'TPA': 4,
            'PSIKOLOGIS': 5
        };
        const categoryId = categoryMap[kategori] || null;
        
        if (categoryId && categoryId !== activeCategoryId) {
            activeCategoryId = categoryId;
            await loadMaterialsWithCategory(categoryId, 1);
            return;
        }
    } else if (activeCategoryId !== null) {
        // Category cleared, reload all
        activeCategoryId = null;
        await loadMaterials(1);
        return;
    }

    // Client-side filter for tipe and search on current loaded materials
    let filtered = [...allMaterials];

    if (tipe) {
        filtered = filtered.filter(m => m.tipe === tipe);
    }

    if (search) {
        filtered = filtered.filter(m =>
            (m.judul && m.judul.toLowerCase().includes(search)) ||
            (m.konten && m.konten.toLowerCase().includes(search))
        );
    }

    filteredMaterials = filtered;
    isFilterActive = true;
    
    displayMaterials(filteredMaterials);
    
    if (filtered.length === 0) {
        hidePagination();
    } else {
        displayPaginationInfo(filtered.length, 1, 1, filtered.length);
    }
}

// Load materials filtered by category from server
async function loadMaterialsWithCategory(kategori_id, page = 1) {
    currentPage = page;
    isFilterActive = true;
    
    const data = await AppConfig.fetchAPI(`soal.php?action=get_all_bahan_pelajaran&kategori_id=${kategori_id}&page=${page}&limit=${itemsPerPage}`);
    
    if (data.success && data.data) {
        allMaterials = data.data;
        
        // Apply client-side tipe and search filters
        let filtered = [...allMaterials];
        if (activeTipe) {
            filtered = filtered.filter(m => m.tipe === activeTipe);
        }
        if (activeSearch) {
            filtered = filtered.filter(m =>
                (m.judul && m.judul.toLowerCase().includes(activeSearch)) ||
                (m.konten && m.konten.toLowerCase().includes(activeSearch))
            );
        }
        filteredMaterials = filtered;
        
        // Update pagination info from API
        if (data.pagination) {
            totalItems = parseInt(data.pagination.total) || 0;
            totalPages = parseInt(data.pagination.total_pages) || 1;
            currentPage = parseInt(data.pagination.current_page) || 1;
        }
        
        displayMaterials(filteredMaterials);
        displayPagination();
    } else {
        displayEmptyState();
        hidePagination();
    }
}

// Display pagination controls
function displayPagination() {
    const paginationEl = document.getElementById('materialsPagination');
    const infoEl = document.getElementById('paginationInfo');
    
    if (!paginationEl) return;
    
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        if (infoEl) infoEl.textContent = `Menampilkan ${totalItems} bahan ajar`;
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    </li>`;
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(1); return false;">1</a></li>`;
        if (startPage > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
        </li>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${totalPages}); return false;">${totalPages}</a></li>`;
    }
    
    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    </li>`;
    
    paginationEl.innerHTML = html;
    
    // Display info
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    if (infoEl) infoEl.textContent = `Menampilkan ${startItem}-${endItem} dari ${totalItems} bahan ajar`;
}

// Display pagination info for filtered results
function displayPaginationInfo(itemCount, current, total, totalCount) {
    const paginationEl = document.getElementById('materialsPagination');
    const infoEl = document.getElementById('paginationInfo');
    
    if (paginationEl) paginationEl.innerHTML = '';
    if (infoEl) infoEl.textContent = `Menampilkan ${itemCount} dari ${totalCount} bahan ajar (filter aktif)`;
}

// Hide pagination
function hidePagination() {
    const paginationEl = document.getElementById('materialsPagination');
    const infoEl = document.getElementById('paginationInfo');
    
    if (paginationEl) paginationEl.innerHTML = '';
    if (infoEl) infoEl.textContent = '';
}

// Navigate to page (respects active filters)
async function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    // Scroll to top of materials grid
    document.getElementById('materialsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Load materials for the selected page with active filters
    if (activeCategoryId) {
        await loadMaterialsWithCategory(activeCategoryId, page);
    } else {
        await loadMaterials(page);
    }
}

// Filter materials when clicking on comprehensive material
async function filterByComprehensiveMaterial(kategori, materi) {
    // Set the category filter dropdown
    const kategoriSelect = document.getElementById('filterKategori');
    kategoriSelect.value = kategori;

    // Clear any existing search
    const searchInput = document.getElementById('searchMaterials');
    searchInput.value = '';
    activeSearch = '';

    // Trigger filter which will reload from server with category
    await filterMaterials();

    // Scroll to materials grid
    document.getElementById('materialsGrid').scrollIntoView({ behavior: 'smooth' });
}

// Load categories for filter using centralized API helper
async function loadKategori() {
    const data = await AppConfig.fetchAPI('soal.php?action=get_kategori');
    
    const select = document.getElementById('filterKategori');
    if (data.success && data.data && data.data.length > 0) {
        select.innerHTML = '<option value="">Semua Kategori</option>';
        
        data.data.forEach(kat => {
            const option = document.createElement('option');
            option.value = kat.kode || kat.nama;
            option.textContent = kat.nama;
            select.appendChild(option);
        });
    }
}

// Load comprehensive learning materials
async function loadComprehensiveMaterials() {
    try {
        const response = await fetch('../data/learning_materials/comprehensive_materials_summary.json');
        const data = await response.json();
        
        const accordion = document.getElementById('comprehensiveMaterialsAccordion');
        if (!accordion) return;
        
        accordion.innerHTML = '';
        
        data.categories.forEach((category, index) => {
            const itemId = `collapse${index}`;
            accordion.innerHTML += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${itemId}">
                            <i class="${category.icon} me-2"></i>
                            ${category.nama} (${category.kode})
                        </button>
                    </h2>
                    <div id="${itemId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#comprehensiveMaterialsAccordion">
                        <div class="accordion-body">
                            <p class="text-muted mb-3">${category.deskripsi}</p>
                            <h6 class="fw-bold mb-2">Materi yang tersedia:</h6>
                            <ul class="list-group list-group-flush">
                                ${category.materi.map(materi => `
                                    <li class="list-group-item clickable-materi" style="cursor: pointer;" onclick="filterByComprehensiveMaterial('${category.kode}', '${materi.replace(/'/g, "\\'")}')">
                                        <i class="fas fa-check-circle text-success me-2"></i>
                                        <strong>${materi}</strong>
                                        <i class="fas fa-chevron-right float-end text-muted"></i>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading comprehensive materials:', error);
        const accordion = document.getElementById('comprehensiveMaterialsAccordion');
        if (accordion) {
            accordion.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Gagal memuat materi komprehensif
                </div>
            `;
        }
    }
}

// Called by materi.html after components are injected into DOM
function initAfterLoad() {
    if (loadAuthToken()) {
        loadKategori();
        loadMaterials();
        loadComprehensiveMaterials();
    }
}

// Show inline konten in modal
function showMateriKonten(materialId) {
    const material = allMaterials.find(m => m.id == materialId);
    if (!material || !material.konten) return;

    let modal = document.getElementById('materiKontenModal');
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal fade" id="materiKontenModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="materiKontenTitle"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="materiKontenBody"></div>
                    </div>
                </div>
            </div>
        `);
        modal = document.getElementById('materiKontenModal');
    }
    document.getElementById('materiKontenTitle').textContent = material.judul || 'Materi';
    document.getElementById('materiKontenBody').innerHTML = material.konten;
    new bootstrap.Modal(modal).show();
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
