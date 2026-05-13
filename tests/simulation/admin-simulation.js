/**
 * Admin Role Simulation using Puppeteer
 * Simulates admin dashboard operations
 */

const puppeteer = require('puppeteer');
const CONFIG = require('./config');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshots.dir)) {
  fs.mkdirSync(CONFIG.screenshots.dir, { recursive: true });
}

// Simulation results
const results = {
  login: { status: 'pending', errors: [] },
  dashboard: { status: 'pending', errors: [] },
  questions: { status: 'pending', errors: [] },
  categories: { status: 'pending', errors: [] },
  statistics: { status: 'pending', errors: [] },
  tips: { status: 'pending', errors: [] },
  overall: { passed: 0, failed: 0 }
};

async function takeScreenshot(page, name) {
  if (CONFIG.screenshots.enabled) {
    const fileName = `${CONFIG.screenshots.prefix}_admin_${name}_${Date.now()}.png`;
    await page.screenshot({ 
      path: path.join(CONFIG.screenshots.dir, fileName),
      fullPage: true 
    });
    console.log(`📸 Screenshot: ${fileName}`);
  }
}

async function simulateAdmin() {
  console.log('🚀 Starting Admin Role Simulation...\n');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.puppeteer.headless,
    slowMo: CONFIG.puppeteer.slowMo,
    args: CONFIG.puppeteer.args
  });
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  try {
    // 1. Navigate to admin page
    console.log('1️⃣ Navigating to admin page...');
    await page.goto(CONFIG.adminUrl, { 
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeouts.navigation 
    });
    await takeScreenshot(page, '01_initial_load');
    
    // 2. Test login with invalid credentials
    console.log('2️⃣ Testing login validation...');
    await page.waitForSelector('#loginUsername', { timeout: CONFIG.timeouts.element });
    await page.type('#loginUsername', 'invalid_user');
    await page.type('#loginPassword', 'wrong_password');
    await page.click('button[onclick="login()"]');
    
    // Wait for alert or error
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '02_invalid_login');
    console.log('   ✓ Invalid login handled correctly');
    
    // 3. Login with valid credentials
    console.log('3️⃣ Logging in with valid admin credentials...');
    await page.evaluate(() => {
      document.getElementById('loginUsername').value = '';
      document.getElementById('loginPassword').value = '';
    });
    await page.type('#loginUsername', CONFIG.admin.username);
    await page.type('#loginPassword', CONFIG.admin.password);
    await page.click('button[onclick="login()"]');
    
    // Wait for dashboard to load
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '03_logged_in');
    
    // Check if we're on dashboard
    const dashboardVisible = await page.evaluate(() => {
      const dashboard = document.getElementById('dashboardSection');
      return dashboard && !dashboard.classList.contains('hidden');
    });
    
    if (dashboardVisible) {
      results.login.status = 'passed';
      console.log('   ✓ Login successful, dashboard visible');
    } else {
      results.login.status = 'failed';
      results.login.errors.push('Dashboard not visible after login');
      console.log('   ✗ Dashboard not visible');
    }
    
    // 4. Check dashboard stats
    console.log('4️⃣ Checking dashboard statistics...');
    await page.waitForTimeout(2000);
    
    const stats = await page.evaluate(() => {
      return {
        totalSoal: document.getElementById('totalSoal')?.textContent,
        totalUjian: document.getElementById('totalUjian')?.textContent,
        avgScore: document.getElementById('avgScore')?.textContent,
        passRate: document.getElementById('passRate')?.textContent
      };
    });
    
    console.log('   📊 Stats:', stats);
    await takeScreenshot(page, '04_dashboard_stats');
    results.dashboard.status = 'passed';
    
    // 5. Navigate to Questions section
    console.log('5️⃣ Navigating to Questions section...');
    await page.click('a[onclick="showSection(\'questions\')"]');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '05_questions_section');
    
    const questionsVisible = await page.evaluate(() => {
      const section = document.getElementById('questionsSection');
      return section && !section.classList.contains('hidden');
    });
    
    if (questionsVisible) {
      results.questions.status = 'passed';
      console.log('   ✓ Questions section loaded');
    } else {
      results.questions.status = 'failed';
      results.questions.errors.push('Questions section not visible');
      console.log('   ✗ Questions section not visible');
    }
    
    // 6. Navigate to Categories
    console.log('6️⃣ Navigating to Categories...');
    await page.click('a[onclick="showSection(\'categories\')"]');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '06_categories_section');
    results.categories.status = 'passed';
    console.log('   ✓ Categories section loaded');
    
    // 7. Navigate to Statistics
    console.log('7️⃣ Navigating to Statistics...');
    await page.click('a[onclick="showSection(\'statistics\')"]');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '07_statistics_section');
    results.statistics.status = 'passed';
    console.log('   ✓ Statistics section loaded');
    
    // 8. Navigate to Tips & Tricks
    console.log('8️⃣ Navigating to Tips & Tricks...');
    await page.click('a[onclick="showSection(\'tips\')"]');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '08_tips_section');
    results.tips.status = 'passed';
    console.log('   ✓ Tips & Tricks section loaded');
    
    // 9. Test logout
    console.log('9️⃣ Testing logout...');
    await page.click('a[onclick="logout()"]');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '09_after_logout');
    console.log('   ✓ Logout completed');
    
    // Calculate results
    Object.values(results).forEach(section => {
      if (section.status === 'passed') results.overall.passed++;
      if (section.status === 'failed') results.overall.failed++;
    });
    
  } catch (error) {
    console.error('❌ Simulation error:', error.message);
    await takeScreenshot(page, 'error_' + Date.now());
    results.overall.errors = [error.message];
  } finally {
    await browser.close();
  }
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('ADMIN SIMULATION RESULTS');
  console.log('='.repeat(60));
  Object.entries(results).forEach(([key, value]) => {
    if (key !== 'overall') {
      const icon = value.status === 'passed' ? '✅' : value.status === 'failed' ? '❌' : '⏳';
      console.log(`${icon} ${key}: ${value.status}`);
      if (value.errors && value.errors.length > 0) {
        value.errors.forEach(err => console.log(`   ⚠️  ${err}`));
      }
    }
  });
  console.log('-'.repeat(60));
  console.log(`📈 Passed: ${results.overall.passed}, Failed: ${results.overall.failed}`);
  console.log('='.repeat(60));
  
  return results;
}

// Run if called directly
if (require.main === module) {
  simulateAdmin().then(results => {
    process.exit(results.overall.failed > 0 ? 1 : 0);
  });
}

module.exports = simulateAdmin;
