// Achievements functionality
let achievementsData = [];
let currentFilter = 'all';

// Load achievements data
async function loadAchievementsData() {
    try {
        const response = await fetch(`${AppConfig.apiUrl}/gamification.php?action=get_achievements`, {
            headers: RBAC.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Gagal memuat achievements');
        }
        
        const data = await response.json();
        
        if (data.success) {
            achievementsData = data.data.achievements || [];
            updateStats();
            displayAchievements();
            displayRecentAchievements();
        } else {
            throw new Error(data.error || 'Gagal memuat achievements');
        }
    } catch (error) {
        console.error('Error loading achievements:', error);
        showAchievementsError(error.message);
    }
}

// Update stats
function updateStats() {
    const totalBadges = achievementsData.filter(a => a.unlocked).length;
    const lockedAchievements = achievementsData.filter(a => !a.unlocked).length;
    const completionPercentage = achievementsData.length > 0 
        ? Math.round((totalBadges / achievementsData.length) * 100) 
        : 0;
    
    const totalBadgesElement = document.getElementById('totalBadges');
    const completedAchievementsElement = document.getElementById('completedAchievements');
    const lockedAchievementsElement = document.getElementById('lockedAchievements');
    const completionPercentageElement = document.getElementById('completionPercentage');
    
    if (totalBadgesElement) totalBadgesElement.textContent = totalBadges;
    if (completedAchievementsElement) completedAchievementsElement.textContent = totalBadges;
    if (lockedAchievementsElement) lockedAchievementsElement.textContent = lockedAchievements;
    if (completionPercentageElement) completionPercentageElement.textContent = completionPercentage + '%';
}

// Display achievements
function displayAchievements() {
    const grid = document.getElementById('achievementsGrid');
    
    if (!achievementsData || achievementsData.length === 0) {
        grid.innerHTML = '<p class="text-center text-muted">Belum ada achievements</p>';
        return;
    }
    
    let filteredAchievements = achievementsData;
    if (currentFilter !== 'all') {
        filteredAchievements = achievementsData.filter(a => a.category === currentFilter);
    }
    
    if (filteredAchievements.length === 0) {
        grid.innerHTML = '<p class="text-center text-muted">Tidak ada achievements di kategori ini</p>';
        return;
    }
    
    let html = '<div class="row">';
    filteredAchievements.forEach(achievement => {
        const statusClass = achievement.unlocked ? 'unlocked' : 'locked';
        const opacityClass = achievement.unlocked ? '' : 'opacity-50';
        html += `
            <div class="col-md-3 mb-4">
                <div class="achievement-card ${statusClass} ${opacityClass}">
                    <div class="achievement-icon">
                        <i class="${achievement.icon || 'fas fa-medal'} fa-3x"></i>
                    </div>
                    <div class="achievement-info">
                        <h5>${achievement.name || 'Achievement'}</h5>
                        <p class="description">${achievement.description || 'Deskripsi achievement'}</p>
                        ${achievement.unlocked 
                            ? '<span class="badge bg-success">Selesai</span>'
                            : `<span class="badge bg-secondary">Terkunci - ${achievement.requirement || 'TBD'}</span>`
                        }
                    </div>
                    ${achievement.unlocked ? `
                        <div class="achievement-date">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                ${achievement.unlocked_at ? formatDate(achievement.unlocked_at) : '-'}
                            </small>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    grid.innerHTML = html;
}

// Display recent achievements
function displayRecentAchievements() {
    const recentContainer = document.getElementById('recentAchievements');
    
    const recentAchievements = achievementsData
        .filter(a => a.unlocked && a.unlocked_at)
        .sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at))
        .slice(0, 5);
    
    if (!recentAchievements || recentAchievements.length === 0) {
        recentContainer.innerHTML = '<p class="text-muted text-center">Belum ada achievements baru</p>';
        return;
    }
    
    let html = '<div class="timeline">';
    recentAchievements.forEach(achievement => {
        html += `
            <div class="timeline-item">
                <div class="timeline-marker">
                    <i class="${achievement.icon || 'fas fa-medal'}"></i>
                </div>
                <div class="timeline-content">
                    <h6>${achievement.name || 'Achievement'}</h6>
                    <p class="text-muted small">${achievement.description || 'Deskripsi'}</p>
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>
                        ${achievement.unlocked_at ? formatDate(achievement.unlocked_at) : '-'}
                    </small>
                </div>
            </div>
        `;
    });
    html += '</div>';
    recentContainer.innerHTML = html;
}

// Filter achievements
function filterAchievements(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.category-tabs .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayAchievements();
}

// Show achievements error
function showAchievementsError(message) {
    const grid = document.getElementById('achievementsGrid');
    const recentContainer = document.getElementById('recentAchievements');
    
    const errorHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        </div>
    `;
    
    if (grid) grid.innerHTML = errorHTML;
    if (recentContainer) recentContainer.innerHTML = errorHTML;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!RBAC.isAuthenticated()) {
        window.location.href = '../login.html';
        return;
    }
    
    loadAchievementsData();
});
