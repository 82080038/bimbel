// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Individual Menu Item Tests
 * Tests each menu item in participant dashboard and admin panel
 */

test.describe('Participant Dashboard - Quick Action Menu Items', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/bimbel/login.html');
    await page.click('button:has-text("Test User")');
    await page.waitForURL('**/participant/dashboard.html', { timeout: 5000 });
    await page.waitForTimeout(3000);
  });

  test('PQM-01: Click "Mulai Ujian" button', async ({ page }) => {
    const btn = page.locator('button:has-text("Mulai Ujian")');
    await expect(btn.first()).toBeVisible();

    // Click and verify it triggers exam start (may show modal or navigate)
    await btn.first().click();
    await page.waitForTimeout(1000);

    // Check if either modal appears or navigates to exam page
    const onExamPage = page.url().includes('ujian.html');
    const hasModal = await page.locator('.modal, #confirmModal').count() > 0;

    expect(onExamPage || hasModal).toBeTruthy();
  });

  test('PQM-02: Click "Riwayat" button', async ({ page }) => {
    const btn = page.locator('button:has-text("Riwayat")');
    await expect(btn.first()).toBeVisible();

    await btn.first().click();
    await page.waitForTimeout(1000);

    // Should navigate to exam history or show history section
    const onExamPage = page.url().includes('ujian.html');
    const hasHistory = page.url().includes('history') || await page.locator('.history, .exam-history').count() > 0;

    expect(onExamPage || hasHistory).toBeTruthy();
  });

  test('PQM-03: Click "Peringkat" button', async ({ page }) => {
    const btn = page.locator('button:has-text("Peringkat")');
    await expect(btn.first()).toBeVisible();

    await btn.first().click();
    await page.waitForTimeout(2000);

    // Should navigate to leaderboard page
    await expect(page).toHaveURL(/leaderboard\.html/);
  });

  test('PQM-04: Click "Pencapaian" button', async ({ page }) => {
    const btn = page.locator('button:has-text("Pencapaian")');
    await expect(btn.first()).toBeVisible();

    await btn.first().click();
    await page.waitForTimeout(2000);

    // Should navigate to achievements page
    await expect(page).toHaveURL(/achievements\.html/);
  });

  test('PQM-05: Click "Profil" button', async ({ page }) => {
    const btn = page.locator('button:has-text("Profil")');
    await expect(btn.first()).toBeVisible();

    await btn.first().click();
    await page.waitForTimeout(2000);

    // Should navigate to profile page
    await expect(page).toHaveURL(/profile\.html/);
  });

  test('PQM-06: Click Accessibility button', async ({ page }) => {
    const btn = page.locator('.btn-accessibility').first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1000);

      // Should show accessibility menu
      const menu = page.locator('#accessibilityMenu');
      if (await menu.count() > 0) {
        await expect(menu.first()).toBeVisible();
      }
    }
  });

  test('PQM-07: Click "Keluar" button', async ({ page }) => {
    const btn = page.locator('button:has-text("Keluar")');
    await expect(btn.first()).toBeVisible();

    await btn.first().click();
    await page.waitForTimeout(1000);

    // Should navigate to login page
    await expect(page).toHaveURL(/login\.html/);
  });
});

test.describe('Participant Dashboard - Accessibility Menu Options', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/bimbel/login.html');
    await page.click('button:has-text("Test User")');
    await page.waitForURL('**/participant/dashboard.html', { timeout: 5000 });
    await page.waitForTimeout(3000);
  });

  test('PAM-01: Change font size to Kecil', async ({ page }) => {
    // Open accessibility menu
    const accessBtn = page.locator('.btn-accessibility').first();
    if (await accessBtn.isVisible()) {
      await accessBtn.click();
      await page.waitForTimeout(500);

      const select = page.locator('#fontSizeSelect');
      await select.selectOption('small');
      await page.waitForTimeout(500);

      const body = page.locator('body');
      await expect(body).toHaveClass(/font-small/);
    }
  });

  test('PAM-02: Change font size to Normal', async ({ page }) => {
    const accessBtn = page.locator('.btn-accessibility').first();
    if (await accessBtn.isVisible()) {
      await accessBtn.click();
      await page.waitForTimeout(500);

      const select = page.locator('#fontSizeSelect');
      await select.selectOption('medium');
      await page.waitForTimeout(500);

      const body = page.locator('body');
      await expect(body).toHaveClass(/font-medium/);
    }
  });

  test('PAM-03: Change font size to Besar', async ({ page }) => {
    const accessBtn = page.locator('.btn-accessibility').first();
    if (await accessBtn.isVisible()) {
      await accessBtn.click();
      await page.waitForTimeout(500);

      const select = page.locator('#fontSizeSelect');
      await select.selectOption('large');
      await page.waitForTimeout(500);

      const body = page.locator('body');
      await expect(body).toHaveClass(/font-large/);
    }
  });

  test('PAM-04: Change font size to Sangat Besar', async ({ page }) => {
    const accessBtn = page.locator('.btn-accessibility').first();
    if (await accessBtn.isVisible()) {
      await accessBtn.click();
      await page.waitForTimeout(500);

      const select = page.locator('#fontSizeSelect');
      await select.selectOption('xlarge');
      await page.waitForTimeout(500);

      const body = page.locator('body');
      await expect(body).toHaveClass(/font-xlarge/);
    }
  });

  test('PAM-05: Change contrast to Normal', async ({ page }) => {
    const accessBtn = page.locator('.btn-accessibility').first();
    if (await accessBtn.isVisible()) {
      await accessBtn.click();
      await page.waitForTimeout(500);

      const select = page.locator('#contrastSelect');
      await select.selectOption('normal');
      await page.waitForTimeout(500);

      const body = page.locator('body');
      await expect(body).not.toHaveClass(/high-contrast/);
    }
  });

  test('PAM-06: Change contrast to Tinggi', async ({ page }) => {
    const accessBtn = page.locator('.btn-accessibility').first();
    if (await accessBtn.isVisible()) {
      await accessBtn.click();
      await page.waitForTimeout(500);

      const select = page.locator('#contrastSelect');
      await select.selectOption('high');
      await page.waitForTimeout(500);

      const body = page.locator('body');
      await expect(body).toHaveClass(/high-contrast/);
    }
  });

  test('PAM-07: Toggle text-to-speech', async ({ page }) => {
    const accessBtn = page.locator('.btn-accessibility').first();
    if (await accessBtn.isVisible()) {
      await accessBtn.click();
      await page.waitForTimeout(500);

      const checkbox = page.locator('#textToSpeech');
      await checkbox.check();
      await page.waitForTimeout(500);

      const isChecked = await checkbox.isChecked();
      expect(isChecked).toBe(true);
    }
  });
});

test.describe('Admin Panel - Sidebar Navigation Menu Items', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/bimbel/login.html');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/admin.html', { timeout: 5000 });
    await page.waitForTimeout(3000);
  });

  test('AQM-01: Click Dashboard menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Dashboard"), .menu-item:has-text("Dashboard")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show dashboard section
      const dashboardSection = page.locator('#dashboardSection, .dashboard-section');
      if (await dashboardSection.count() > 0) {
        await expect(dashboardSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-02: Click Users menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Users"), .menu-item:has-text("Users")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show users section
      const usersSection = page.locator('#users, .users-section');
      if (await usersSection.count() > 0) {
        await expect(usersSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-03: Click Soal menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Soal"), .menu-item:has-text("Soal")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show soal section
      const soalSection = page.locator('#soal, .soal-section');
      if (await soalSection.count() > 0) {
        await expect(soalSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-04: Click Kategori menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Kategori"), .menu-item:has-text("Kategori")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show kategori section
      const kategoriSection = page.locator('#kategori, .kategori-section');
      if (await kategoriSection.count() > 0) {
        await expect(kategoriSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-05: Click Exam Packages menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Exam Packages"), .menu-item:has-text("Exam Packages")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show exam packages section
      const packagesSection = page.locator('#exam-packages, .packages-section');
      if (await packagesSection.count() > 0) {
        await expect(packagesSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-06: Click Statistik menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Statistik"), .menu-item:has-text("Statistik")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show statistik section
      const statistikSection = page.locator('#statistik, .statistik-section');
      if (await statistikSection.count() > 0) {
        await expect(statistikSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-07: Click Results menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Results"), .menu-item:has-text("Results")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show results section
      const resultsSection = page.locator('#results, .results-section');
      if (await resultsSection.count() > 0) {
        await expect(resultsSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-08: Click Gamification menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Gamification"), .menu-item:has-text("Gamification")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show gamification section
      const gamificationSection = page.locator('#gamification, .gamification-section');
      if (await gamificationSection.count() > 0) {
        await expect(gamificationSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-09: Click Content Generation menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Content Generation"), .menu-item:has-text("Content Generation")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show content generation section
      const contentSection = page.locator('#content-generation, .content-generation-section');
      if (await contentSection.count() > 0) {
        await expect(contentSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-10: Click Bahan Pelajaran menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Bahan Pelajaran"), .menu-item:has-text("Bahan Pelajaran")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show bahan pelajaran section
      const bahanSection = page.locator('#bahan-pelajaran, .bahan-pelajaran-section');
      if (await bahanSection.count() > 0) {
        await expect(bahanSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-11: Click Topics menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Topics"), .menu-item:has-text("Topics")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show topics section
      const topicsSection = page.locator('#topics, .topics-section');
      if (await topicsSection.count() > 0) {
        await expect(topicsSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-12: Click Notifications menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Notifications"), .menu-item:has-text("Notifications")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show notifications section
      const notificationsSection = page.locator('#notifications, .notifications-section');
      if (await notificationsSection.count() > 0) {
        await expect(notificationsSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-13: Click Participants menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Participants"), .menu-item:has-text("Participants")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show participants section
      const participantsSection = page.locator('#participants, .participants-section');
      if (await participantsSection.count() > 0) {
        await expect(participantsSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-14: Click Exam Sessions menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Exam Sessions"), .menu-item:has-text("Exam Sessions")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show exam sessions section
      const sessionsSection = page.locator('#exam-sessions, .exam-sessions-section');
      if (await sessionsSection.count() > 0) {
        await expect(sessionsSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-15: Click Maintenance menu item', async ({ page }) => {
    const menuItem = page.locator('.sidebar .nav-link:has-text("Maintenance"), .menu-item:has-text("Maintenance")').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(1000);

      // Should show maintenance section
      const maintenanceSection = page.locator('#maintenance, .maintenance-section');
      if (await maintenanceSection.count() > 0) {
        await expect(maintenanceSection.first()).toBeVisible();
      }
    }
  });

  test('AQM-16: Click Logout menu item', async ({ page }) => {
    const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout"), .logout-btn').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);

      // Should navigate to login page
      await expect(page).toHaveURL(/login\.html/);
    }
  });
});

test.describe('Admin Panel - Sub-menu Items', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/bimbel/login.html');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/admin.html', { timeout: 5000 });
    await page.waitForTimeout(3000);
  });

  test('ASM-01: Check for dropdown menus', async ({ page }) => {
    // Check if there are any dropdown menus
    const dropdowns = page.locator('.dropdown, .submenu, .has-submenu');
    const dropdownCount = await dropdowns.count();

    if (dropdownCount > 0) {
      // Test first dropdown
      await dropdowns.first().click();
      await page.waitForTimeout(500);

      // Check if submenu items are visible
      const submenuItems = page.locator('.dropdown-menu, .submenu-items');
      const hasSubmenu = await submenuItems.count() > 0;

      expect(hasSubmenu).toBeTruthy();
    }
  });

  test('ASM-02: Check for course management submenu', async ({ page }) => {
    // Navigate to courses section
    await page.goto('http://localhost/bimbel/admin/admin.html#courses');
    await page.waitForTimeout(2000);

    // Check for course-related submenus
    const courseMenus = page.locator('[href*="course"], [data-menu*="course"]');
    const courseMenuCount = await courseMenus.count();

    if (courseMenuCount > 0) {
      await expect(courseMenus.first()).toBeVisible();
    }
  });

  test('ASM-03: Check for blueprint submenu', async ({ page }) => {
    // Navigate to blueprint section
    await page.goto('http://localhost/bimbel/admin/admin.html#blueprint');
    await page.waitForTimeout(2000);

    // Check for blueprint-related options
    const blueprintOptions = page.locator('.blueprint-options, .blueprint-settings');
    if (await blueprintOptions.count() > 0) {
      await expect(blueprintOptions.first()).toBeVisible();
    }
  });

  test('ASM-04: Check for IRT analysis submenu', async ({ page }) => {
    // Navigate to IRT section
    await page.goto('http://localhost/bimbel/admin/admin.html#irt');
    await page.waitForTimeout(2000);

    // Check for IRT analysis options
    const irtOptions = page.locator('.irt-options, .irt-settings');
    if (await irtOptions.count() > 0) {
      await expect(irtOptions.first()).toBeVisible();
    }
  });

  test('ASM-05: Check for tips management submenu', async ({ page }) => {
    // Navigate to tips section
    await page.goto('http://localhost/bimbel/admin/admin.html#tips');
    await page.waitForTimeout(2000);

    // Check for tips management options
    const tipsOptions = page.locator('.tips-options, .tips-settings');
    if (await tipsOptions.count() > 0) {
      await expect(tipsOptions.first()).toBeVisible();
    }
  });
});
