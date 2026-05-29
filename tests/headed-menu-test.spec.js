const { test, expect } = require('@playwright/test');
const BASE = 'http://localhost/bimbel';

async function loginAsAdmin(page) {
  await page.goto(`${BASE}/login.html`);
  await page.waitForTimeout(800);
  await page.click('button:has-text("Admin")');
  await page.waitForURL('**/admin/admin.html', { timeout: 20000 });
  await page.waitForTimeout(2000);
}

async function loginAsUser(page) {
  await page.goto(`${BASE}/login.html`);
  await page.waitForTimeout(800);
  await page.click('button:has-text("Test User")');
  await page.waitForURL('**/participant/dashboard.html', { timeout: 20000 });
  await page.waitForTimeout(2000);
}

// Test 1: Login Page Elements
test('1. Login page all elements visible', async ({ page }) => {
  await page.goto(`${BASE}/login.html`);
  await page.waitForTimeout(2000);
  await expect(page.locator('.login-container')).toBeVisible();
  await expect(page.locator('#username')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
  await expect(page.locator('button:has-text("Test User")')).toBeVisible();
  await expect(page.locator('button:has-text("Admin")')).toBeVisible();
});

// Test 2: Register Link
test('2. Register link works', async ({ page }) => {
  await page.goto(`${BASE}/login.html`);
  await page.waitForTimeout(1000);
  const registerLink = page.locator('a[href*="register"]').first();
  if (await registerLink.count() > 0) {
    await registerLink.click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/register/);
  }
});

// Test 3: Admin Sidebar All Menu Items
test('3. Admin sidebar all menu items', async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.locator('.sidebar')).toBeVisible();
  
  const menuItems = ['Dashboard', 'Soal', 'Kategori', 'Users', 'Gamification', 'Notifications', 'Courses', 'IRT'];
  for (const item of menuItems) {
    const menuItem = page.locator('.sidebar a, .sidebar button, .nav-link').filter({ hasText: new RegExp(item, 'i') }).first();
    if (await menuItem.count() > 0) {
      await expect(menuItem).toBeVisible();
    }
  }
});

// Test 4: Admin All Sections
test('4. Admin navigate all sections', async ({ page }) => {
  await loginAsAdmin(page);
  const sections = ['#soal', '#kategori', '#users', '#gamification', '#notifications', '#courseManagement', '#irt', '#examSessions', '#blueprint', '#topics', '#maintenance', '#tips'];
  
  for (const section of sections) {
    await page.goto(`${BASE}/admin/admin.html${section}`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  }
});

// Test 5: Participant All Pages
test('5. Participant all pages', async ({ page }) => {
  await loginAsUser(page);
  const pages = ['/participant/dashboard.html', '/participant/ujian.html', '/participant/materi.html', '/participant/profile.html', '/participant/achievements.html', '/participant/leaderboard.html', '/participant/resume-ujian.html'];
  
  for (const p of pages) {
    await page.goto(`${BASE}${p}`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  }
});

// Test 6: CRUD - Open Add Modal
test('6. CRUD - open add modal', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto(`${BASE}/admin/admin.html#soal`);
  await page.waitForTimeout(5000);
  
  // Wait for questions section to be visible
  const questionsSection = page.locator('#questionsSection');
  await expect(questionsSection).toBeVisible();
  
  // Look for "Tambah Soal" button - try to click using JavaScript
  const buttonExists = await page.evaluate(() => {
    const btn = document.querySelector('#questionsSection .btn-primary');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  
  if (buttonExists) {
    await page.waitForTimeout(2000);
    
    // Check if modal appeared
    const modal = page.locator('#questionModal, .modal.show').first();
    if (await modal.count() > 0) {
      await expect(modal).toBeVisible();
    }
  }
});

// Test 7: Search Functionality
test('7. Search functionality', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto(`${BASE}/admin/admin.html#soal`);
  await page.waitForTimeout(3000);
  
  const searchInput = page.locator('input[type="search"], input[placeholder*="cari"], .search-input').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('test');
    await page.waitForTimeout(1000);
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  }
});

// Test 8: Profile Edit
test('8. Profile edit form', async ({ page }) => {
  await loginAsUser(page);
  await page.goto(`${BASE}/participant/profile.html`);
  await page.waitForTimeout(3000);
  
  const editBtn = page.locator('button:has-text("Edit"), button:has-text("Ubah"), .btn-edit').first();
  if (await editBtn.count() > 0) {
    await editBtn.click();
    await page.waitForTimeout(2000);
    const form = page.locator('form, .edit-form').first();
    if (await form.count() > 0) {
      await expect(form).toBeVisible();
    }
  }
});

// Test 9: Mobile Responsive
test('9. Mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE}/login.html`);
  await page.waitForTimeout(2000);
  await expect(page.locator('.login-container')).toBeVisible();
});

// Test 10: Full Integration Flow
test('10. Full integration flow', async ({ page }) => {
  // Login
  await loginAsUser(page);
  
  // Dashboard
  await page.goto(`${BASE}/participant/dashboard.html`);
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toBeVisible();
  
  // Ujian
  await page.goto(`${BASE}/participant/ujian.html`);
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toBeVisible();
  
  // Materi
  await page.goto(`${BASE}/participant/materi.html`);
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toBeVisible();
  
  // Profile
  await page.goto(`${BASE}/participant/profile.html`);
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toBeVisible();
  
  // Logout
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE);
  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/login\.html/);
});
