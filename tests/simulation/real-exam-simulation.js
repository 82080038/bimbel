/**
 * Real Exam Simulation - Tryout Ujian Lengkap
 * Simulasi ujian nyata dengan jawaban random untuk multiple users
 * 1 soal = 2 detik, sampai selesai
 */

const puppeteer = require('puppeteer');
const CONFIG = require('./config');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshots.dir)) {
  fs.mkdirSync(CONFIG.screenshots.dir, { recursive: true });
}

// Konfigurasi simulasi
const SIMULATION_CONFIG = {
  // Gunakan test users yang terdaftar di database dengan password simulasi123
  // Alur: Login → Klik "Mulai Ujian" → Pilih Paket → Kerjakan Soal
  users: [
    // User 1 - Fresh User 1
    { username: 'fresh_user_11778919457', password: 'simulasi123', name: 'Fresh User 1 - Paket TWK Basic', examType: 'TWK', paketId: 1 },
    { username: 'fresh_user_11778919457', password: 'simulasi123', name: 'Fresh User 1 - Paket TWK Standar', examType: 'TWK', paketId: 2 },
    // User 2 - Fresh User 2
    { username: 'fresh_user_21778919457', password: 'simulasi123', name: 'Fresh User 2 - Paket TIU Basic', examType: 'TIU', paketId: 3 },
    { username: 'fresh_user_21778919457', password: 'simulasi123', name: 'Fresh User 2 - Paket TIU Standar', examType: 'TIU', paketId: 4 },
    // User 1 lagi - Paket TKP
    { username: 'fresh_user_11778919457', password: 'simulasi123', name: 'Fresh User 1 - Paket TKP Standar', examType: 'TKP', paketId: 5 }
  ],
  timing: {
    perQuestionSeconds: 2, // 1 soal = 2 detik
    navigationDelay: 500,  // Delay antar navigasi
    submitDelay: 1000      // Delay setelah submit
  }
};

// Hasil simulasi
const simulationResults = [];

async function takeScreenshot(page, name, userName) {
  if (CONFIG.screenshots.enabled) {
    const safeName = userName.replace(/\s+/g, '_').toLowerCase();
    const fileName = `${CONFIG.screenshots.prefix}_exam_${safeName}_${name}_${Date.now()}.png`;
    await page.screenshot({
      path: path.join(CONFIG.screenshots.dir, fileName),
      fullPage: true
    });
    console.log(`   📸 Screenshot: ${fileName}`);
  }
}

/**
 * Login untuk mendapatkan auth token
 */
async function loginUser(page, username, password) {
  console.log('   🔐 Login untuk mendapatkan token...');

  try {
    // Navigate to login page
    await page.goto(`${CONFIG.baseUrl}/login.html`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeouts.navigation
    });

    // Fill login form
    await page.waitForSelector('#username', { timeout: 10000 });
    await page.type('#username', username);
    await page.type('#password', password);

    // Submit login
    await page.click('#loginForm button[type="submit"]');

    // Wait for navigation or alert
    await page.waitForTimeout(3000);

    // Check if logged in by looking for authToken in localStorage
    const authData = await page.evaluate(() => {
      return {
        token: localStorage.getItem('authToken'),
        role: localStorage.getItem('userRole'),
        username: localStorage.getItem('username')
      };
    });

    if (authData.token) {
      console.log(`   ✅ Login berhasil: ${authData.username} (${authData.role})`);
      return authData;
    } else {
      throw new Error('Login failed - no token received');
    }
  } catch (error) {
    console.log(`   ⚠️  Login error: ${error.message}`);
    // Return null to indicate login failed
    return null;
  }
}

/**
 * Jalankan ujian untuk satu user
 */
async function runExamForUser(browser, userConfig) {
  console.log(`\n🎯 Memulai ujian untuk: ${userConfig.name}`);
  console.log(`   Jenis Ujian: ${userConfig.examType}, Target Soal: ${userConfig.soalCount}`);

  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  // Clear cookies for fresh start
  await page.deleteCookie();
  console.log('   🧹 Cookies cleared');

  const result = {
    user: userConfig.name,
    examType: userConfig.examType,
    startTime: null,
    endTime: null,
    durationSeconds: 0,
    totalQuestions: 0,
    answeredCount: 0,
    score: null,
    status: null,
    answers: [],
    errors: []
  };

  try {
    // Step 0: Login first
    const loginResult = await loginUser(page, userConfig.username || userConfig.name.replace(/\s+/g, '_').toLowerCase(), userConfig.password || 'password123');

    if (!loginResult) {
      console.log('   ⚠️  Login gagal, mencoba akses tanpa login...');
    }

    // Set localStorage data for auto-fill nama peserta
    if (loginResult) {
      await page.evaluate((user) => {
        localStorage.setItem('authToken', user.token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', user.username);
        localStorage.setItem('userData', JSON.stringify({ nama_lengkap: user.username }));
      }, loginResult);
      console.log('   ✅ LocalStorage auth data set');
    }

    // Step 1: Akses halaman ujian
    console.log('    Step 1: Akses halaman ujian...');
    const examUrlPlain = CONFIG.examUrl || CONFIG.indexUrl;
    console.log(`   🔐 URL: ${examUrlPlain}`);
    await page.goto(examUrlPlain, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeouts.navigation
    });
    
    // Log current URL after navigation
    const currentUrl = await page.url();
    console.log(`   🔐 Current URL: ${currentUrl}`);
    
    // Screenshot immediately after navigation
    await takeScreenshot(page, '01_start', userConfig.name);

    // Step 2: Tunggu soal load atau isi form
    console.log('   📝 Step 2: Menunggu halaman ujian load...');

    // Tunggu halaman load
    await page.waitForTimeout(3000);
    
    // Step 2: Cek apakah di welcome screen (perlu klik "Mulai Ujian" dulu)
    const hasStartButton = await page.evaluate(() => {
      const btn = document.querySelector('button[onclick="startNewExam()"]');
      return btn !== null;
    });
    
    if (hasStartButton) {
      console.log('   🏠 Welcome screen terdeteksi');
      console.log('   ▶️  Klik tombol "Mulai Ujian"...');
      await page.evaluate(() => {
        const btn = document.querySelector('button[onclick="startNewExam()"]');
        if (btn) btn.click();
      });
      await page.waitForTimeout(2000); // Tunggu form muncul
    }
    
    // Step 3: Isi form pilih paket
    const hasNamaInput = await page.evaluate(() => {
      return document.getElementById('namaPeserta') !== null;
    });
    
    if (hasNamaInput) {
      console.log('   📝 Form pilih paket terdeteksi');
      
      // Isi nama peserta
      await page.type('#namaPeserta', userConfig.name);
      console.log('   ✅ Nama peserta diisi');
      
      // Pilih jenis ujian
      if (userConfig.examType) {
        try {
          await page.select('#examTypeSelection', userConfig.examType);
          console.log(`   ✅ Jenis ujian dipilih: ${userConfig.examType}`);
          await page.waitForTimeout(1500);
        } catch (err) {
          console.log(`   ⚠️  Gagal pilih jenis ujian: ${err.message}`);
        }
      }
      
      // Pilih paket
      const paketSelect = await page.$('#paketSelection');
      if (paketSelect) {
        await page.waitForTimeout(1000);
        const paketOptions = await page.evaluate(() => {
          const select = document.getElementById('paketSelection');
          return select ? Array.from(select.options).map(o => ({ value: o.value, text: o.text })) : [];
        });
        
        if (paketOptions.length > 0) {
          const targetPaket = paketOptions.find(o => o.value == userConfig.paketId) ||
                             paketOptions.find(o => o.value !== '');
          
          if (targetPaket && targetPaket.value) {
            await page.select('#paketSelection', targetPaket.value.toString());
            console.log(`   ✅ Paket dipilih: ${targetPaket.text}`);
          }
        }
      }
      
      // Screenshot setelah form diisi
      await takeScreenshot(page, '02_form_filled', userConfig.name);
      
      // Klik tombol "Mulai Ujian" untuk mulai mengerjakan
      console.log('   ▶️  Klik tombol "Mulai Ujian" untuk memulai...');
      await page.evaluate(() => {
        const btn = document.querySelector('button[onclick="mulaiUjian()"]');
        if (btn) btn.click();
      });
      
      // Tunggu soal load
      await page.waitForSelector('.question-card', { timeout: 15000 });
      console.log('   ✅ Soal berhasil load');
    } else {
      console.log('   ✅ Langsung ke soal (form sudah terlewati)');
      await page.waitForSelector('.question-card', { timeout: 15000 });
    }

    await takeScreenshot(page, '02_exam_loaded', userConfig.name);

    // Step 3: Ujian berlangsung
    console.log('   ▶️  Step 3: Ujian dimulai, mengerjakan soal...');

    // Setup dialog handler
    page.on('dialog', async dialog => {
      const message = dialog.message().toLowerCase();
      if (message.includes('fullscreen') || message.includes('layar penuh') ||
          message.includes('konfirmasi') || message.includes('yakin') ||
          message.includes('mulai') || message.includes('start')) {
        await dialog.accept();
        console.log(`   ✅ Dialog accepted: ${dialog.message().substring(0, 50)}...`);
      } else {
        await dialog.accept();
      }
    });

    // Click tombol mulai
    await page.click('button[onclick*="mulaiUjian"], button[onclick*="startExam"], #btnMulai, .btn-mulai');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '03_exam_started', userConfig.name);

    // Step 4: Kerjakan semua soal dengan jawaban random
    console.log('   ✏️  Step 4: Mengerjakan soal...');
    result.startTime = new Date();

    let questionNumber = 1;
    let continueExam = true;

    while (continueExam) {
      try {
        // Tunggu soal load
        await page.waitForTimeout(SIMULATION_CONFIG.timing.perQuestionSeconds * 1000);

        // Cek info soal saat ini
        const questionInfo = await page.evaluate(() => {
          const currentEl = document.getElementById('currentQuestion');
          const totalEl = document.getElementById('totalQuestions');
          const options = document.querySelectorAll('.option-btn, .answer-btn, [data-option]');
          return {
            current: currentEl ? parseInt(currentEl.textContent) : 0,
            total: totalEl ? parseInt(totalEl.textContent) : 0,
            optionsCount: options.length
          };
        });

        if (questionInfo.total > 0) {
          result.totalQuestions = questionInfo.total;
        }

        // Generate jawaban random (A, B, C, D, atau E)
        const answers = ['A', 'B', 'C', 'D', 'E'];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

        // Click jawaban
        // Klik jawaban menggunakan selector yang tepat untuk radio buttons
        const answerClicked = await page.evaluate((answer) => {
          // Coba beberapa selector untuk jawaban
          const selectors = [
            'input[name="answer"][value="' + answer + '"]',
            '.option-label input[value="' + answer + '"]',
            'input[type="radio"][value="' + answer + '"]'
          ];
          
          for (const selector of selectors) {
            const radio = document.querySelector(selector);
            if (radio) {
              radio.checked = true;
              radio.click();
              // Trigger change event untuk auto-next
              radio.dispatchEvent(new Event('change', { bubbles: true }));
              return { clicked: true, answer: answer, method: 'radio', selector: selector };
            }
          }
          
          // Fallback: klik label yang mengandung radio
          const labels = document.querySelectorAll('.option-label');
          if (labels.length > 0) {
            // Cari label yang mengandung value yang sesuai
            for (const label of labels) {
              const radio = label.querySelector('input[type="radio"]');
              if (radio && radio.value === answer) {
                label.click();
                return { clicked: true, answer: answer, method: 'label' };
              }
            }
            // Klik label pertama sebagai fallback
            labels[0].click();
            return { clicked: true, answer: 'A', method: 'label_fallback' };
          }

          return { clicked: false, answer: null, totalOptions: 0 };
        }, randomAnswer);

        if (answerClicked.clicked) {
          result.answeredCount++;
          result.answers.push({
            question: questionNumber,
            answer: answerClicked.answer
          });

          if (questionNumber % 10 === 0 || questionNumber === 1) {
            console.log(`      📍 Soal ${questionNumber}: Jawaban ${answerClicked.answer} (${answerClicked.totalOptions} opsi)`);
          }
        }

        // Navigasi ke soal berikutnya
        await page.waitForTimeout(SIMULATION_CONFIG.timing.navigationDelay);

        const hasNext = await page.evaluate(() => {
          const nextBtn = document.querySelector('.next-btn, #nextBtn, button[onclick*="next"], .btn-next');
          if (nextBtn && !nextBtn.disabled) {
            nextBtn.click();
            return true;
          }
          return false;
        });

        if (!hasNext) {
          // Cek apakah sudah soal terakhir
          const isLastQuestion = await page.evaluate(() => {
            const current = document.getElementById('currentQuestion');
            const total = document.getElementById('totalQuestions');
            if (current && total) {
              return parseInt(current.textContent) >= parseInt(total.textContent);
            }
            return true; // Assume done if can't determine
          });

          if (isLastQuestion) {
            console.log(`      🏁 Soal terakhir tercapai (Soal ${questionNumber})`);
            continueExam = false;
          }
        }

        questionNumber++;

        // Safety: stop jika terlalu banyak soal (error prevention)
        if (questionNumber > 200) {
          console.log('      ⚠️ Safety limit reached (200 questions)');
          continueExam = false;
        }

      } catch (err) {
        console.log(`      ⚠️ Error pada soal ${questionNumber}: ${err.message}`);
        result.errors.push(`Q${questionNumber}: ${err.message}`);

        // Coba lanjut atau selesai
        const canContinue = await page.evaluate(() => {
          return !!document.querySelector('.next-btn, #nextBtn, .question-nav-btn');
        });

        if (!canContinue) {
          continueExam = false;
        }
      }
    }

    result.endTime = new Date();
    result.durationSeconds = Math.round((result.endTime - result.startTime) / 1000);

    await takeScreenshot(page, '04_all_answered', userConfig.name);
    console.log(`   ⏱️  Total waktu: ${result.durationSeconds} detik (${result.answeredCount} soal)`);

    // Step 5: Selesaikan ujian
    console.log('   🏁 Step 5: Menyelesaikan ujian...');

    // Click tombol selesai
    await page.evaluate(() => {
      const finishBtn = document.querySelector('.finish-btn, #finishBtn, button[onclick*="selesai"], button[onclick*="finish"], .btn-selesai');
      if (finishBtn) finishBtn.click();
    });

    await page.waitForTimeout(2000);

    // Handle confirmation dialog
    try {
      const dialogHandled = await page.evaluate(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(false), 1000);
        });
      });
    } catch (e) {}

    await page.waitForTimeout(SIMULATION_CONFIG.timing.submitDelay);
    await takeScreenshot(page, '05_finished', userConfig.name);

    // Step 6: Ambil hasil
    console.log('   📊 Step 6: Mengambil hasil...');
    await page.waitForTimeout(3000);

    const examResult = await page.evaluate(() => {
      const scoreEl = document.getElementById('finalScore');
      const statusEl = document.getElementById('statusKelulusan');
      const twkEl = document.getElementById('nilaiTWK');
      const tiuEl = document.getElementById('nilaiTIU');
      const tkpEl = document.getElementById('nilaiTKP');

      return {
        score: scoreEl ? scoreEl.textContent : null,
        status: statusEl ? statusEl.textContent : null,
        twk: twkEl ? twkEl.textContent : null,
        tiu: tiuEl ? tiuEl.textContent : null,
        tkp: tkpEl ? tkpEl.textContent : null
      };
    });

    result.score = examResult.score;
    result.status = examResult.status;
    result.categoryScores = {
      twk: examResult.twk,
      tiu: examResult.tiu,
      tkp: examResult.tkp
    };

    console.log(`   🎯 Nilai: ${result.score || 'N/A'} | Status: ${result.status || 'N/A'}`);

    await takeScreenshot(page, '06_results', userConfig.name);

  } catch (error) {
    console.error(`   ❌ Fatal error untuk ${userConfig.name}:`, error.message);
    result.errors.push(`Fatal: ${error.message}`);
    await takeScreenshot(page, '99_error', userConfig.name);
  } finally {
    await page.close();
  }

  return result;
}

/**
 * Jalankan simulasi untuk semua users
 */
async function runRealExamSimulation() {
  // Hitung unique users
  const uniqueUsers = [...new Set(SIMULATION_CONFIG.users.map(u => u.username))];
  
  console.log('='.repeat(70));
  console.log('🎓 REAL EXAM SIMULATION - SIMULASI UJIAN LENGKAP');
  console.log('='.repeat(70));
  console.log(`⏱️  Timing: ${SIMULATION_CONFIG.timing.perQuestionSeconds} detik per soal`);
  console.log(`👥 ${uniqueUsers.length} User: ${uniqueUsers.join(', ')}`);
  console.log(`� Total Paket Ujian: ${SIMULATION_CONFIG.users.length} paket`);
  console.log('='.repeat(70));

  const browser = await puppeteer.launch({
    headless: CONFIG.puppeteer.headless,
    slowMo: CONFIG.puppeteer.slowMo,
    args: CONFIG.puppeteer.args
  });

  try {
    // Jalankan ujian untuk setiap user secara sequential
    for (const userConfig of SIMULATION_CONFIG.users) {
      const result = await runExamForUser(browser, userConfig);
      simulationResults.push(result);

      // Delay antar user
      if (SIMULATION_CONFIG.users.indexOf(userConfig) < SIMULATION_CONFIG.users.length - 1) {
        console.log('   ⏳ Delay 3 detik sebelum user berikutnya...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  } catch (error) {
    console.error('❌ Error utama:', error.message);
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 RINGKASAN HASIL SIMULASI');
  console.log('='.repeat(70));

  let totalPassed = 0;
  let totalFailed = 0;

  simulationResults.forEach((result, index) => {
    const success = result.errors.length === 0 && result.answeredCount > 0;
    const icon = success ? '✅' : '❌';
    const statusIcon = result.status === 'LULUS' ? '🟢' : result.status === 'TIDAK LULUS' ? '🔴' : '⚪';

    console.log(`\n${icon} ${index + 1}. ${result.user}`);
    console.log(`   Jenis Ujian: ${result.examType}`);
    console.log(`   Soal: ${result.answeredCount}/${result.totalQuestions}`);
    console.log(`   Waktu: ${result.durationSeconds} detik`);
    console.log(`   Nilai: ${result.score || 'N/A'} ${statusIcon} ${result.status || ''}`);

    if (result.categoryScores && (result.categoryScores.twk || result.categoryScores.tiu)) {
      console.log(`   Detail: TWK=${result.categoryScores.twk || '-'} | TIU=${result.categoryScores.tiu || '-'} | TKP=${result.categoryScores.tkp || '-'}`);
    }

    if (result.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${result.errors.length}`);
      result.errors.slice(0, 3).forEach(err => console.log(`      - ${err}`));
    }

    if (success) totalPassed++;
    else totalFailed++;
  });

  console.log('\n' + '-'.repeat(70));
  console.log(`📊 Total: ${totalPassed} berhasil, ${totalFailed} gagal dari ${simulationResults.length} simulasi`);

  const avgTime = simulationResults.reduce((sum, r) => sum + r.durationSeconds, 0) / simulationResults.length;
  const totalQuestions = simulationResults.reduce((sum, r) => sum + r.answeredCount, 0);

  console.log(`⏱️  Rata-rata waktu: ${Math.round(avgTime)} detik per user`);
  console.log(`📝 Total soal dikerjakan: ${totalQuestions} soal`);
  console.log('='.repeat(70));

  // Simpan hasil ke file
  const reportPath = path.join(CONFIG.screenshots.dir, `exam_simulation_report_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: SIMULATION_CONFIG,
    summary: {
      totalUsers: simulationResults.length,
      passed: totalPassed,
      failed: totalFailed,
      avgTimeSeconds: Math.round(avgTime),
      totalQuestionsAnswered: totalQuestions
    },
    results: simulationResults
  }, null, 2));

  console.log(`\n💾 Report disimpan: ${reportPath}`);

  return {
    results: simulationResults,
    summary: {
      passed: totalPassed,
      failed: totalFailed,
      total: simulationResults.length,
      avgTimeSeconds: Math.round(avgTime),
      totalQuestionsAnswered: totalQuestions
    }
  };
}

// Run if called directly
if (require.main === module) {
  runRealExamSimulation().then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = runRealExamSimulation;
