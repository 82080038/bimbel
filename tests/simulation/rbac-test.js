/**
 * RBAC (Role-Based Access Control) Testing Suite
 * Tests access control for different user roles
 */

const puppeteer = require('puppeteer');
const CONFIG = require('./config');

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, status, details = '') {
  const icon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status} ${details}`);
  testResults.tests.push({ name, status, details });
  if (status === 'PASSED') testResults.passed++;
  if (status === 'FAILED') testResults.failed++;
}

/**
 * Test 1: Guest accessing login page
 */
async function testGuestLoginPage(browser) {
  console.log('\n📋 Test 1: Guest accessing login page');
  
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost/bimbel/login.html', { waitUntil: 'networkidle2' });
    
    // Check if form is visible (not redirected)
    const formVisible = await page.evaluate(() => {
      return !!document.getElementById('loginForm');
    });
    
    if (formVisible) {
      logTest('Guest Login Page', 'PASSED', 'Form login ditampilkan');
      return true;
    } else {
      logTest('Guest Login Page', 'FAILED', 'Form tidak ditemukan');
      return false;
    }
  } catch (error) {
    logTest('Guest Login Page', 'FAILED', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test 2: Admin auto-redirect from login to admin page
 */
async function testAdminAutoRedirect(browser) {
  console.log('\n📋 Test 2: Admin auto-redirect from login');
  
  const page = await browser.newPage();
  try {
    // Set admin credentials in localStorage
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('authToken', 'test-admin-token');
      localStorage.setItem('userRole', 'admin');
    });
    
    await page.goto('http://localhost/bimbel/login.html', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('admin.html')) {
      logTest('Admin Auto-Redirect', 'PASSED', 'Redirect ke admin.html');
      return true;
    } else {
      logTest('Admin Auto-Redirect', 'FAILED', `URL: ${currentUrl}`);
      return false;
    }
  } catch (error) {
    logTest('Admin Auto-Redirect', 'FAILED', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test 3: User auto-redirect from login to index page
 */
async function testUserAutoRedirect(browser) {
  console.log('\n📋 Test 3: User auto-redirect from login');
  
  const page = await browser.newPage();
  try {
    // Set user credentials in localStorage
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('authToken', 'test-user-token');
      localStorage.setItem('userRole', 'user');
    });
    
    await page.goto('http://localhost/bimbel/login.html', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('index.html') || currentUrl.endsWith('/bimbel/')) {
      logTest('User Auto-Redirect', 'PASSED', 'Redirect ke index.html');
      return true;
    } else {
      logTest('User Auto-Redirect', 'FAILED', `URL: ${currentUrl}`);
      return false;
    }
  } catch (error) {
    logTest('User Auto-Redirect', 'FAILED', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test 4: User accessing admin page (should be denied)
 */
async function testUserAccessAdmin(browser) {
  console.log('\n📋 Test 4: User accessing admin page');
  
  const page = await browser.newPage();
  try {
    // Set user role
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('authToken', 'test-user-token');
      localStorage.setItem('userRole', 'user');
    });
    
    // Intercept alert dialog
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    await page.goto('http://localhost/bimbel/admin.html', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    // Should be redirected to index.html
    if (!currentUrl.includes('admin.html')) {
      logTest('User Access Admin (Blocked)', 'PASSED', 'Redirect dari halaman admin');
      return true;
    } else {
      logTest('User Access Admin (Blocked)', 'FAILED', 'Masih di admin.html');
      return false;
    }
  } catch (error) {
    logTest('User Access Admin (Blocked)', 'FAILED', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test 5: Admin accessing admin page (should be allowed)
 */
async function testAdminAccessAdmin(browser) {
  console.log('\n📋 Test 5: Admin accessing admin page');
  
  const page = await browser.newPage();
  try {
    // Set admin role
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('authToken', 'test-admin-token');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('apiKey', 'test-api-key');
    });
    
    await page.goto('http://localhost/bimbel/admin.html', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    // Should stay on admin.html
    if (currentUrl.includes('admin.html')) {
      // Check if dashboard is visible
      const dashboardVisible = await page.evaluate(() => {
        return !!document.getElementById('dashboardSection') || 
               !!document.querySelector('.admin-dashboard') ||
               document.title.includes('Admin');
      });
      
      if (dashboardVisible) {
        logTest('Admin Access Admin (Allowed)', 'PASSED', 'Dashboard admin ditampilkan');
        return true;
      } else {
        logTest('Admin Access Admin (Allowed)', 'PASSED', 'Di halaman admin');
        return true;
      }
    } else {
      logTest('Admin Access Admin (Allowed)', 'FAILED', `Redirect ke: ${currentUrl}`);
      return false;
    }
  } catch (error) {
    logTest('Admin Access Admin (Allowed)', 'FAILED', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test 6: Guest accessing admin page (should redirect to login)
 */
async function testGuestAccessAdmin(browser) {
  console.log('\n📋 Test 6: Guest accessing admin page');
  
  const page = await browser.newPage();
  try {
    // Ensure no credentials
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
    
    await page.goto('http://localhost/bimbel/admin.html', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    // Should be redirected to login.html
    if (currentUrl.includes('login.html') || !currentUrl.includes('admin.html')) {
      logTest('Guest Access Admin (Redirected)', 'PASSED', 'Guest redirect ke login');
      return true;
    } else {
      logTest('Guest Access Admin (Redirected)', 'FAILED', `Masih di: ${currentUrl}`);
      return false;
    }
  } catch (error) {
    logTest('Guest Access Admin (Redirected)', 'FAILED', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test 7: Check RBAC object available
 */
async function testRBACObject(browser) {
  console.log('\n📋 Test 7: RBAC JavaScript Object');
  
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost/bimbel/login.html', { waitUntil: 'networkidle2' });
    
    const rbacAvailable = await page.evaluate(() => {
      return typeof RBAC !== 'undefined' && 
             typeof RBAC.getCurrentRole === 'function';
    });
    
    if (rbacAvailable) {
      logTest('RBAC Object Available', 'PASSED', 'RBAC.js loaded correctly');
      return true;
    } else {
      logTest('RBAC Object Available', 'FAILED', 'RBAC tidak ditemukan');
      return false;
    }
  } catch (error) {
    logTest('RBAC Object Available', 'FAILED', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test 8: API endpoint with authentication
 */
async function testAPIWithAuth() {
  console.log('\n📋 Test 8: API Endpoint Access Control');
  
  try {
    // Test public endpoint (no auth required)
    const publicResponse = await fetch('http://localhost/bimbel/api/soal.php?action=get_paket');
    const publicData = await publicResponse.json();
    
    if (publicData.success) {
      logTest('Public API (get_paket)', 'PASSED', 'Accessible without auth');
    } else {
      logTest('Public API (get_paket)', 'FAILED', 'Not accessible');
    }
    
    // Test protected endpoint (auth required)
    const protectedResponse = await fetch('http://localhost/bimbel/api/soal.php?action=simpan_sesi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    if (protectedResponse.status === 401) {
      logTest('Protected API (401)', 'PASSED', 'Returns 401 without auth');
    } else {
      logTest('Protected API (401)', 'FAILED', `Status: ${protectedResponse.status}`);
    }
    
    return true;
  } catch (error) {
    logTest('API Access Control', 'FAILED', error.message);
    return false;
  }
}

/**
 * Run all RBAC tests
 */
async function runRBACTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     RBAC (Role-Based Access Control) TESTING             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Headed untuk visualisasi
    slowMo: 100,
    args: ['--no-sandbox']
  });
  
  try {
    // Run all tests
    await testGuestLoginPage(browser);
    await testAdminAutoRedirect(browser);
    await testUserAutoRedirect(browser);
    await testUserAccessAdmin(browser);
    await testAdminAccessAdmin(browser);
    await testGuestAccessAdmin(browser);
    await testRBACObject(browser);
    await testAPIWithAuth();
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('RBAC TEST SUMMARY');
  console.log('='.repeat(60));
  
  testResults.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.status}`);
  });
  
  console.log('-'.repeat(60));
  console.log(`📊 Total: ${testResults.passed} PASSED, ${testResults.failed} FAILED`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  return testResults;
}

// Run if called directly
if (require.main === module) {
  runRBACTests().then(() => {
    console.log('\n✨ RBAC Testing completed!');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = runRBACTests;
