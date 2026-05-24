let authToken = '';
let allMaterials = [];

// Load auth token
function loadAuthToken() {
    authToken = localStorage.getItem('authToken') || '';
    if (!authToken) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

// Load materials
async function loadMaterials() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_all_bahan_pelajaran'), {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success && data.data) {
            allMaterials = data.data;
            displayMaterials(allMaterials);
        } else {
            displayEmptyState();
        }
    } catch (error) {
        console.error('Error loading materials:', error);
        displayErrorState();
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
        const iconClass = material.jenis_file === 'pdf' ? 'pdf' : 
                         material.jenis_file === 'video' ? 'video' : 
                         material.tipe === 'link' ? 'link' : 'text';
        const progress = material.progress || 0;
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="materi-card h-100">
                    <div class="materi-icon ${iconClass}">
                        <i class="fas fa-${material.jenis_file === 'pdf' ? 'file-pdf' : 
                                       material.jenis_file === 'video' ? 'play-circle' : 
                                       material.tipe === 'link' ? 'link' : 'file-alt'}"></i>
                    </div>
                    <h5 class="mb-2">${material.judul || 'Tanpa Judul'}</h5>
                    <p class="text-muted small mb-3">${material.deskripsi || 'Tidak ada deskripsi'}</p>
                    <div class="mb-3">
                        <span class="badge badge-category">${material.kategori || 'Umum'}</span>
                        <span class="badge badge-category ms-1">${material.tipe || 'Umum'}</span>
                    </div>
                    <div class="progress-indicator">
                        <div class="progress-bar-custom" style="width: ${progress}%;"></div>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                        <small class="text-muted">${progress}% selesai</small>
                        ${(material.file_path || material.url)
                            ? `<a href="${material.file_path || material.url}" target="_blank" class="btn btn-sm btn-primary"><i class="fas fa-external-link-alt"></i> Buka</a>`
                            : (material.konten
                                ? `<button class="btn btn-sm btn-secondary" onclick="showMateriKonten(${material.id})"><i class="fas fa-eye"></i> Lihat</button>`
                                : `<span class="btn btn-sm btn-outline-secondary disabled">Tidak tersedia</span>`)
                        }
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

// Filter materials
function filterMaterials() {
    const kategori = document.getElementById('filterKategori').value;
    const tipe = document.getElementById('filterTipe').value;
    const search = document.getElementById('searchMaterials').value.toLowerCase();

    let filtered = allMaterials;

    if (kategori) {
        filtered = filtered.filter(m => m.kategori === kategori);
    }

    if (tipe) {
        filtered = filtered.filter(m => m.tipe === tipe);
    }

    if (search) {
        filtered = filtered.filter(m => 
            (m.judul && m.judul.toLowerCase().includes(search)) ||
            (m.deskripsi && m.deskripsi.toLowerCase().includes(search))
        );
    }

    displayMaterials(filtered);
}

// Load categories for filter
async function loadKategori() {
    try {
        const response = await fetch(AppConfig.apiUrl('soal.php?action=get_kategori'), {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const data = await response.json();
        
        const select = document.getElementById('filterKategori');
        if (data.success && data.data.length > 0) {
            select.innerHTML = '<option value="">Semua Kategori</option>';
            
            data.data.forEach(kat => {
                const option = document.createElement('option');
                option.value = kat.nama;
                option.textContent = kat.nama;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading kategori:', error);
    }
}

// Called by materi.html after components are injected into DOM
function initAfterLoad() {
    if (loadAuthToken()) {
        loadKategori();
        loadMaterials();
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
