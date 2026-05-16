// Expert System UI Component for Bimbel
// Provides tips, tricks, and quick methods for solving questions

class ExpertAssistant {
    constructor() {
        this.currentQuestionId = null;
        this.currentCategoryId = null;
        this.expertData = null;
        this.isVisible = false;
        this.currentTab = 'tips';
    }

    // Initialize the expert assistant
    init() {
        this.createUI();
        this.attachEventListeners();
    }

    // Create the UI elements
    createUI() {
        // Check if the UI already exists
        if (document.getElementById('expertAssistant')) {
            return;
        }

        const assistantHTML = `
            <div id="expertAssistant" class="expert-assistant hidden">
                <div class="expert-assistant-header">
                    <h3>🧠 Asisten Pakar</h3>
                    <button class="close-assistant" onclick="expertAssistant.hide()">✕</button>
                </div>
                
                <div class="expert-assistant-tabs">
                    <button class="tab-btn active" data-tab="tips" onclick="expertAssistant.switchTab('tips')">
                        💡 Tips
                    </button>
                    <button class="tab-btn" data-tab="tricks" onclick="expertAssistant.switchTab('tricks')">
                        ⚡ Trik Cepat
                    </button>
                    <button class="tab-btn" data-tab="logic" onclick="expertAssistant.switchTab('logic')">
                        🔍 Logika
                    </button>
                </div>
                
                <div class="expert-assistant-content">
                    <div id="expertContent" class="expert-content">
                        <p class="loading">Memuat pengetahuan pakar...</p>
                    </div>
                </div>
                
                <div class="expert-assistant-footer">
                    <button class="btn-helpful" onclick="expertAssistant.rateHelpful(true)">
                        👍 Membantu
                    </button>
                    <button class="btn-not-helpful" onclick="expertAssistant.rateHelpful(false)">
                        👎 Tidak Membantu
                    </button>
                </div>
            </div>
            
            <button id="expertAssistantToggle" class="expert-toggle-btn" onclick="expertAssistant.toggle()">
                🧠 Pakar
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', assistantHTML);
        
        // Add CSS styles
        this.addStyles();
    }

    // Add CSS styles
    addStyles() {
        if (document.getElementById('expertAssistantStyles')) {
            return;
        }

        const styles = `
            <style id="expertAssistantStyles">
                .expert-assistant {
                    position: fixed;
                    right: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 400px;
                    max-height: 80vh;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                }
                
                .expert-assistant.hidden {
                    display: none;
                }
                
                .expert-assistant-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 12px 12px 0 0;
                }
                
                .expert-assistant-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .close-assistant {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 5px 10px;
                    border-radius: 5px;
                    transition: background 0.3s;
                }
                
                .close-assistant:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                .expert-assistant-tabs {
                    display: flex;
                    background: #f0f0f0;
                    border-bottom: 1px solid #ddd;
                }
                
                .tab-btn {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #666;
                    transition: all 0.3s;
                    border-bottom: 3px solid transparent;
                }
                
                .tab-btn:hover {
                    background: #e0e0e0;
                }
                
                .tab-btn.active {
                    color: #667eea;
                    border-bottom-color: #667eea;
                    background: white;
                }
                
                .expert-assistant-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }
                
                .expert-content {
                    animation: fadeIn 0.3s ease-in;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .expert-content .loading {
                    text-align: center;
                    color: #999;
                    padding: 40px 20px;
                }
                
                .expert-card {
                    background: #f9f9f9;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    border-left: 4px solid #667eea;
                }
                
                .expert-card h4 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 16px;
                }
                
                .expert-card p {
                    margin: 0;
                    color: #666;
                    line-height: 1.6;
                    font-size: 14px;
                }
                
                .expert-card .example {
                    margin-top: 10px;
                    padding: 10px;
                    background: white;
                    border-radius: 5px;
                    font-size: 13px;
                    color: #555;
                }
                
                .expert-card .example strong {
                    color: #667eea;
                }
                
                .expert-assistant-footer {
                    padding: 15px 20px;
                    border-top: 1px solid #ddd;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }
                
                .btn-helpful, .btn-not-helpful {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s;
                }
                
                .btn-helpful {
                    background: #4CAF50;
                    color: white;
                }
                
                .btn-helpful:hover {
                    background: #45a049;
                }
                
                .btn-not-helpful {
                    background: #f44336;
                    color: white;
                }
                
                .btn-not-helpful:hover {
                    background: #da190b;
                }
                
                .expert-toggle-btn {
                    position: fixed;
                    right: 20px;
                    bottom: 100px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s;
                    z-index: 9999;
                }
                
                .expert-toggle-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }
                
                .expert-toggle-btn.hidden {
                    display: none;
                }
                
                .no-data {
                    text-align: center;
                    color: #999;
                    padding: 40px 20px;
                }
                
                .no-data p {
                    margin: 0;
                }
                
                @media (max-width: 768px) {
                    .expert-assistant {
                        right: 10px;
                        left: 10px;
                        width: auto;
                        max-height: 70vh;
                    }
                    
                    .expert-toggle-btn {
                        right: 15px;
                        bottom: 80px;
                        width: 50px;
                        height: 50px;
                        font-size: 20px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Attach event listeners
    attachEventListeners() {
        // Event listeners are inline in the HTML
    }

    // Show expert assistant for a specific question
    async showForQuestion(soalId, kategoriId) {
        this.currentQuestionId = soalId;
        this.currentCategoryId = kategoriId;
        
        document.getElementById('expertAssistant').classList.remove('hidden');
        document.getElementById('expertAssistantToggle').classList.add('hidden');
        
        this.isVisible = true;
        
        await this.loadExpertData();
    }

    // Load expert data from API
    async loadExpertData() {
        const contentEl = document.getElementById('expertContent');
        contentEl.innerHTML = '<p class="loading">Memuat pengetahuan pakar...</p>';
        
        try {
            const response = await fetch(`/bimbel/api/expert.php?action=get_expert_help&soal_id=${this.currentQuestionId}&kategori_id=${this.currentCategoryId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                this.expertData = result.data;
                this.renderContent();
            } else {
                contentEl.innerHTML = `
                    <div class="no-data">
                        <p>📚 Belum ada pengetahuan pakar untuk soal ini.</p>
                        <p style="margin-top: 10px; font-size: 12px;">Tips dan trik akan ditambahkan seiring waktu.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading expert data:', error);
            contentEl.innerHTML = `
                <div class="no-data">
                    <p>❌ Gagal memuat pengetahuan pakar.</p>
                    <p style="margin-top: 10px; font-size: 12px;">Silakan coba lagi nanti.</p>
                </div>
            `;
        }
    }

    // Render content based on current tab
    renderContent() {
        const contentEl = document.getElementById('expertContent');
        
        if (!this.expertData || this.expertData.length === 0) {
            contentEl.innerHTML = `
                <div class="no-data">
                    <p>📚 Belum ada pengetahuan pakar untuk soal ini.</p>
                </div>
            `;
            return;
        }
        
        let filteredData = [];
        
        switch (this.currentTab) {
            case 'tips':
                filteredData = this.expertData.filter(item => item.jenis_pengetahuan === 'tips');
                break;
            case 'tricks':
                filteredData = this.expertData.filter(item => item.jenis_pengetahuan === 'trik' || item.jenis_pengetahuan === 'metode_cepat');
                break;
            case 'logic':
                filteredData = this.expertData.filter(item => item.jenis_pengetahuan === 'logika' || item.jenis_pengetahuan === 'pembahasan');
                break;
        }
        
        if (filteredData.length === 0) {
            contentEl.innerHTML = `
                <div class="no-data">
                    <p>📚 Belum ada ${this.currentTab === 'tips' ? 'tips' : this.currentTab === 'tricks' ? 'trik cepat' : 'penjelasan logika'} untuk kategori ini.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        filteredData.forEach(item => {
            html += `
                <div class="expert-card">
                    <h4>${item.judul}</h4>
                    <p>${item.konten}</p>
                    ${item.contoh_soal ? `
                        <div class="example">
                            <strong>Contoh:</strong><br>
                            ${item.contoh_soal}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        contentEl.innerHTML = html;
    }

    // Switch between tabs
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });
        
        // Re-render content
        this.renderContent();
    }

    // Toggle expert assistant visibility
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            if (this.currentQuestionId) {
                this.showForQuestion(this.currentQuestionId, this.currentCategoryId);
            } else {
                // Show generic tips if no question is loaded
                this.showGenericTips();
            }
        }
    }

    // Show generic tips
    async showGenericTips() {
        document.getElementById('expertAssistant').classList.remove('hidden');
        document.getElementById('expertAssistantToggle').classList.add('hidden');
        this.isVisible = true;
        
        const contentEl = document.getElementById('expertContent');
        contentEl.innerHTML = '<p class="loading">Memuat tips umum...</p>';
        
        try {
            const response = await fetch('/bimbel/api/expert.php?action=get_expert_knowledge', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                this.expertData = result.data;
                this.renderContent();
            } else {
                contentEl.innerHTML = `
                    <div class="no-data">
                        <p>📚 Belum ada pengetahuan pakar.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading generic tips:', error);
            contentEl.innerHTML = `
                <div class="no-data">
                    <p>❌ Gagal memuat tips umum.</p>
                </div>
            `;
        }
    }

    // Hide expert assistant
    hide() {
        document.getElementById('expertAssistant').classList.add('hidden');
        document.getElementById('expertAssistantToggle').classList.remove('hidden');
        this.isVisible = false;
    }

    // Show expert analysis AFTER exam is finished (for wrong answers only)
    async showPostExamAnalysis(wrongAnswers) {
        if (!wrongAnswers || wrongAnswers.length === 0) {
            console.log('No wrong answers to analyze');
            return;
        }
        
        // Show the expert assistant UI
        document.getElementById('expertAssistant').classList.remove('hidden');
        document.getElementById('expertAssistantToggle').classList.add('hidden');
        this.isVisible = true;
        
        const contentEl = document.getElementById('expertContent');
        contentEl.innerHTML = '<p class="loading">🧠 Sistem Pakar sedang menganalisis jawaban salah...</p>';
        
        let analysisHtml = `
            <div class="post-exam-analysis">
                <h3 style="color: #667eea; margin-bottom: 15px;">
                    📊 Analisis Hasil Ujian
                </h3>
                <p style="margin-bottom: 20px;">
                    Anda memiliki ${wrongAnswers.length} soal yang dijawab salah. 
                    Berikut penjelasan dan tips untuk perbaikan:
                </p>
        `;
        
        // Analyze each wrong answer
        for (const wrong of wrongAnswers) {
            const { question, userAnswer, correctAnswer } = wrong;
            
            analysisHtml += `
                <div class="expert-card" style="margin-bottom: 20px;">
                    <h4 style="color: #ef4444; margin-bottom: 10px;">
                        ❌ Soal #${question.id} - ${this.getCategoryName(question.kategori_id)}
                    </h4>
                    <p style="margin-bottom: 10px;"><strong>Pertanyaan:</strong><br>${question.pertanyaan}</p>
                    <p style="margin-bottom: 10px;">
                        <span style="color: #ef4444;">Jawaban Anda: ${userAnswer}</span> | 
                        <span style="color: #10b981;">Jawaban Benar: ${correctAnswer}</span>
                    </p>
                    <div style="background: #fef3c7; padding: 10px; border-radius: 5px; margin-top: 10px;">
                        <strong>💡 Pembahasan:</strong><br>
                        ${question.pembahasan || 'Pembahasan tidak tersedia untuk soal ini.'}
                    </div>
                </div>
            `;
            
            // Try to get expert tips for this category
            try {
                const response = await fetch(`/bimbel/api/expert.php?action=get_expert_help&soal_id=${question.id}&kategori_id=${question.kategori_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const result = await response.json();
                
                if (result.success && result.data.length > 0) {
                    const tip = result.data[0];
                    analysisHtml += `
                        <div class="expert-card" style="border-left-color: #10b981; margin-bottom: 20px;">
                            <h4 style="color: #10b981;">🎯 Tips dari Pakar</h4>
                            <p><strong>${tip.judul || tip.expert_judul || 'Tips'}</strong></p>
                            <p>${tip.konten || tip.expert_konten || ''}</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error fetching expert tip:', error);
            }
        }
        
        analysisHtml += `
                <div style="text-align: center; margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px;">
                    <p style="margin: 0; color: #1e40af;">
                        <strong>💪 Terus berlatih!</strong> Pelajari pembahasan di atas untuk meningkatkan skor.
                    </p>
                </div>
            </div>
        `;
        
        contentEl.innerHTML = analysisHtml;
    }

    // Helper to get category name
    getCategoryName(kategoriId) {
        const categories = {
            1: 'TWK',
            2: 'TIU',
            3: 'TKP',
            4: 'TPA',
            5: 'PSIKOLOGIS'
        };
        return categories[kategoriId] || 'UMUM';
    }

    // Rate assistance as helpful or not
    async rateHelpful(helpful) {
        if (!this.currentQuestionId || !this.expertData || this.expertData.length === 0) {
            alert('Tidak ada data untuk dinilai');
            return;
        }
        
        const expertKnowledgeId = this.expertData[0].id;
        
        try {
            const response = await fetch('/bimbel/api/expert.php?action=log_assistance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    soal_id: this.currentQuestionId,
                    expert_knowledge_id: expertKnowledgeId,
                    jenis_bantuan: this.currentTab
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(helpful ? 'Terima kasih atas feedback positif!' : 'Terima kasih atas feedback. Kami akan meningkatkannya.');
                this.hide();
            } else {
                alert('Gagal menyimpan feedback');
            }
        } catch (error) {
            console.error('Error rating assistance:', error);
            alert('Gagal menyimpan feedback');
        }
    }
}

// Initialize global instance
const expertAssistant = new ExpertAssistant();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        expertAssistant.init();
    });
} else {
    expertAssistant.init();
}
