// Pembahasan (Question Review) Helper

window.loadPembahasan = async function (resultId) {
    const container = document.getElementById('pembahasanContainer');
    if (!container) return;

    try {
        const response = await fetch('api/soal.php?action=get_pembahasan&hasil_id=' + resultId, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
        });

        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            container.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle"></i> Pembahasan tidak tersedia.</div>';
            return;
        }

        let html = '<div class="pembahasan-list">';

        data.data.forEach(function (item, index) {
            const isCorrect = item.jawaban_user === item.jawaban_benar;
            const statusClass = isCorrect ? 'correct' : 'wrong';

            html += '<div class="pembahasan-item ' + statusClass + '">';
            html += '<div class="pembahasan-header">';
            html += '<h5>Soal ' + (index + 1) + ' <span class="badge bg-' + (isCorrect ? 'success' : 'danger') + '">' + (isCorrect ? 'Benar' : 'Salah') + '</span></h5>';
            html += '<span class="category-badge">' + item.kategori + '</span>';
            html += '</div>';
            html += '<div class="pembahasan-content">';

            // Question image
            if (item.gambar_pertanyaan) {
                html += '<div class="pembahasan-image-container"><img src="../' + item.gambar_pertanyaan + '" alt="Gambar Soal" class="pembahasan-image" onerror="this.style.display=\'none\'"></div>';
            }

            html += '<p class="question-text">' + item.pertanyaan + '</p>';

            // Options
            ['A', 'B', 'C', 'D', 'E'].forEach(function (opt) {
                const isCorrectOpt = item.jawaban_benar === opt;
                const isUserWrong = item.jawaban_user === opt && item.jawaban_user !== item.jawaban_benar;
                const optionImageKey = 'gambar_opsi_' + opt.toLowerCase();
                const optionImage = item[optionImageKey];

                html += '<div class="option ' + (isCorrectOpt ? 'correct-answer' : '') + ' ' + (isUserWrong ? 'wrong-answer' : '') + '">';
                html += '<strong>' + opt + '.</strong> ' + item['opsi_' + opt.toLowerCase()];
                if (optionImage) {
                    html += '<br><img src="../' + optionImage + '" alt="Opsi ' + opt + '" class="pembahasan-option-image" onerror="this.style.display=\'none\'">';
                }
                if (isCorrectOpt) html += ' <i class="fas fa-check text-success"></i>';
                if (isUserWrong) html += ' <i class="fas fa-times text-danger"></i> (Jawaban Anda)';
                html += '</div>';
            });

            if (item.pembahasan) {
                html += '<div class="explanation-box"><h6><i class="fas fa-lightbulb"></i> Pembahasan:</h6><p>' + item.pembahasan + '</p>';
                if (item.gambar_pembahasan) {
                    html += '<img src="../' + item.gambar_pembahasan + '" alt="Gambar Pembahasan" class="pembahasan-image" onerror="this.style.display=\'none\'">';
                }
                html += '</div>';
            }

            html += '</div></div>';
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading pembahasan:', error);
        container.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Gagal memuat pembahasan.</div>';
    }
};

// Share result
window.shareResult = function (result) {
    const shareText = 'Saya baru saja menyelesaikan ujian dengan nilai ' + result.nilai_total + '! Status: ' + (result.status_lulus === 'LULUS' ? 'LULUS' : 'TIDAK LULUS');

    if (navigator.share) {
        navigator.share({
            title: 'Hasil Ujian Saya',
            text: shareText,
            url: window.location.href
        }).then(function () {
            showToast('Hasil dibagikan!', 'success');
        }).catch(function () {
            console.log('Share cancelled');
        });
    } else {
        navigator.clipboard.writeText(shareText + '\n' + window.location.href).then(function () {
            showToast('Link hasil disalin ke clipboard!', 'success');
        });
    }
};

console.log('Pembahasan Helper loaded');