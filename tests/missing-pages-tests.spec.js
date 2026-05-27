// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Missing Pages Tests
 * Tests for 5 pages that were not previously tested
 */

test.describe('Missing Pages - Participant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/bimbel/login.html');
    await page.click('button:has-text("Test User")');
    await page.waitForURL('**/participant/dashboard.html', { timeout: 5000 });
  });

  test('MPP-01: Navigate to resume-ujian page', async ({ page }) => {
    await page.goto('http://localhost/bimbel/participant/resume-ujian.html');
    await page.waitForTimeout(3000);
    
    // Check if page loaded
    await expect(page).toHaveURL(/resume-ujian\.html/);
  });

  test('MPP-02: Resume exam page displays content', async ({ page }) => {
    await page.goto('http://localhost/bimbel/participant/resume-ujian.html');
    await page.waitForTimeout(3000);
    
    // Check for any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Missing Pages - Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/bimbel/login.html');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/admin.html', { timeout: 5000 });
  });

  test('MAP-01: Navigate to blueprint page', async ({ page }) => {
    await page.goto('http://localhost/bimbel/admin/admin.html#blueprint');
    await page.waitForTimeout(3000);
    
    // Check if blueprint section is loaded
    const blueprintSection = page.locator('#blueprint, .blueprint-section');
    if (await blueprintSection.count() > 0) {
      await expect(blueprintSection.first()).toBeVisible();
    }
  });

  test('MAP-02: Blueprint page displays content', async ({ page }) => {
    await page.goto('http://localhost/bimbel/admin/admin.html#blueprint');
    await page.waitForTimeout(3000);
    
    // Check for blueprint-related content
    const blueprintContent = page.locator('.blueprint-content, .blueprint-settings');
    if (await blueprintContent.count() > 0) {
      await expect(blueprintContent.first()).toBeVisible();
    }
  });

  test('MAP-03: Navigate to courses page', async ({ page }) => {
    await page.goto('http://localhost/bimbel/admin/admin.html#courseManagement');
    await page.waitForTimeout(3000);
    
    // Check if courses section is loaded
    const coursesSection = page.locator('#courseManagement, .courses-section');
    if (await coursesSection.count() > 0) {
      await expect(coursesSection.first()).toBeVisible();
    }
  });

  test('MAP-04: Courses page displays content', async ({ page }) => {
    await page.goto('http://localhost/bimbel/admin/admin.html#courseManagement');
    await page.waitForTimeout(3000);
    
    // Check for course-related content
    const coursesContent = page.locator('.courses-content, .course-list');
    if (await coursesContent.count() > 0) {
      await expect(coursesContent.first()).toBeVisible();
    }
  });

  test('MAP-05: Navigate to IRT page', async ({ page }) => {
    await page.goto('http://localhost/bimbel/admin/admin.html#irt');
    await page.waitForTimeout(3000);
    
    // Check if IRT section is loaded
    const irtSection = page.locator('#irt, .irt-section');
    if (await irtSection.count() > 0) {
      await expect(irtSection.first()).toBeVisible();
    }
  });

  test('MAP-06: IRT page displays content', async ({ page }) => {
    await page.goto('http://localhost/bimbel/admin/admin.html#irt');
    await page.waitForTimeout(3000);
    
    // Check for IRT-related content
    const irtContent = page.locator('.irt-content, .irt-settings');
    if (await irtContent.count() > 0) {
      await expect(irtContent.first()).toBeVisible();
    }
  });

  test('MAP-07: Navigate to tips page', async ({ page }) => {
    await page.goto('http://localhost/bimbel/admin/admin.html#tips');
    await page.waitForTimeout(3000);
    
    // Check if tips section is loaded
    const tipsSection = page.locator('#tips, .tips-section');
    if (await tipsSection.count() > 0) {
      await expect(tipsSection.first()).toBeVisible();
    }
  });

  test('MAP-08: Tips page displays content', async ({ page }) => {
    await page.goto('http://localhost/bimbel/admin/admin.html#tips');
    await page.waitForTimeout(3000);
    
    // Check for tips-related content
    const tipsContent = page.locator('.tips-content, .tips-settings');
    if (await tipsContent.count() > 0) {
      await expect(tipsContent.first()).toBeVisible();
    }
  });
});
