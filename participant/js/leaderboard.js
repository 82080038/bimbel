// Leaderboard functionality
let leaderboardData = [];
let myPosition = null;

// Load leaderboard data
async function loadLeaderboardData() {
    try {
        const response = await fetch(AppConfig.apiUrl('gamification.php?action=get_leaderboard'), {
            headers: RBAC.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Gagal memuat leaderboard');
        }

        const data = await response.json();

        if (data.success) {
            leaderboardData = data.data.leaderboard || [];
            myPosition = data.data.my_position || null;
            displayPodium();
            displayLeaderboardTable();
            displayMyPosition();
        } else {
            throw new Error(data.error || 'Gagal memuat leaderboard');
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showLeaderboardError(error.message);
    }
}

// Display top 3 podium
function displayPodium() {
    const podiumSection = document.getElementById('podiumSection');
    
    if (!leaderboardData || leaderboardData.length === 0) {
        podiumSection.innerHTML = '<p class="text-center text-muted">Belum ada data leaderboard</p>';
        return;
    }
    
    const top3 = leaderboardData.slice(0, 3);
    let html = '<div class="row justify-content-center align-items-end">';
    
    // Position 2 (Silver)
    if (top3[1]) {
        html += `
            <div class="col-md-3">
                <div class="podium-card silver">
                    <div class="rank-badge">2</div>
                    <div class="avatar">
                        <i class="fas fa-user fa-3x"></i>
                    </div>
                    <h5>${top3[1].nama || 'Peserta'}</h5>
                    <p class="xp">${formatXP(top3[1].total_xp || 0)} XP</p>
                </div>
            </div>
        `;
    }
    
    // Position 1 (Gold)
    if (top3[0]) {
        html += `
            <div class="col-md-3">
                <div class="podium-card gold">
                    <div class="rank-badge">1</div>
                    <div class="avatar">
                        <i class="fas fa-crown fa-3x"></i>
                    </div>
                    <h5>${top3[0].nama || 'Peserta'}</h5>
                    <p class="xp">${formatXP(top3[0].total_xp || 0)} XP</p>
                </div>
            </div>
        `;
    }
    
    // Position 3 (Bronze)
    if (top3[2]) {
        html += `
            <div class="col-md-3">
                <div class="podium-card bronze">
                    <div class="rank-badge">3</div>
                    <div class="avatar">
                        <i class="fas fa-user fa-3x"></i>
                    </div>
                    <h5>${top3[2].nama || 'Peserta'}</h5>
                    <p class="xp">${formatXP(top3[2].total_xp || 0)} XP</p>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    podiumSection.innerHTML = html;
}

// Display leaderboard table
function displayLeaderboardTable() {
    const tableBody = document.getElementById('leaderboardTableBody');
    
    if (!leaderboardData || leaderboardData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Belum ada data</td></tr>';
        return;
    }
    
    let html = '';
    leaderboardData.forEach((user, index) => {
        const rankClass = index === 0 ? 'text-warning' : index === 1 ? 'text-secondary' : index === 2 ? 'text-danger' : '';
        html += `
            <tr>
                <td><strong class="${rankClass}">#${index + 1}</strong></td>
                <td>
                    <i class="fas fa-user me-2"></i>
                    ${user.nama || 'Peserta'}
                </td>
                <td>${formatXP(user.total_xp || 0)}</td>
                <td><span class="badge bg-primary">Level ${user.level || 1}</span></td>
                <td>${formatNumber(user.avg_score || 0, 1)}</td>
                <td><i class="fas fa-fire text-warning me-1"></i>${user.streak || 0} hari</td>
                <td><span class="badge bg-info">${user.badge_count || 0} badges</span></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Display my position
function displayMyPosition() {
    const myPositionContent = document.getElementById('myPositionContent');
    
    if (!myPosition) {
        myPositionContent.innerHTML = '<p class="text-muted">Anda belum memiliki posisi di leaderboard</p>';
        return;
    }
    
    myPositionContent.innerHTML = `
        <div class="row align-items-center">
            <div class="col-md-2 text-center">
                <div class="rank-display">
                    <h2 class="mb-0">#${myPosition.rank}</h2>
                    <small class="text-muted">Peringkat</small>
                </div>
            </div>
            <div class="col-md-10">
                <div class="row">
                    <div class="col-md-3">
                        <strong>Total XP:</strong> ${formatXP(myPosition.total_xp || 0)}
                    </div>
                    <div class="col-md-3">
                        <strong>Level:</strong> ${myPosition.level || 1}
                    </div>
                    <div class="col-md-3">
                        <strong>Rata-rata Skor:</strong> ${formatNumber(myPosition.avg_score || 0, 1)}
                    </div>
                    <div class="col-md-3">
                        <strong>Streak:</strong> ${myPosition.streak || 0} hari
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show leaderboard error
function showLeaderboardError(message) {
    const podiumSection = document.getElementById('podiumSection');
    const tableBody = document.getElementById('leaderboardTableBody');
    const myPositionContent = document.getElementById('myPositionContent');
    
    const errorHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        </div>
    `;
    
    if (podiumSection) podiumSection.innerHTML = errorHTML;
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="7">${errorHTML}</td></tr>`;
    if (myPositionContent) myPositionContent.innerHTML = errorHTML;
}

// Format XP number
function formatXP(xp) {
    if (xp >= 1000000) {
        return (xp / 1000000).toFixed(1) + 'M';
    } else if (xp >= 1000) {
        return (xp / 1000).toFixed(1) + 'K';
    }
    return xp.toString();
}

// Format number
function formatNumber(num, decimals = 0) {
    return num.toFixed(decimals);
}

// Called by leaderboard.html after components are injected into DOM
function initAfterLoad() {
    if (!RBAC.isAuthenticated()) {
        window.location.href = '../login.html';
        return;
    }

    // Register filter change handlers now that DOM elements exist
    document.getElementById('periodFilter')?.addEventListener('change', loadLeaderboardData);
    document.getElementById('categoryFilter')?.addEventListener('change', loadLeaderboardData);
    document.getElementById('sortBy')?.addEventListener('change', loadLeaderboardData);

    loadLeaderboardData();
}
