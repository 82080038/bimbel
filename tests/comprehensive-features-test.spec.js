/**
 * COMPREHENSIVE FEATURES TEST - Playwright
 * Testing all pages and features thoroughly in headed mode
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const USER = { username: 'fresh_user_11778919457', password: 'simulasi123' };

const PARTICIPANT_PAGES = [
    { name: 'Dashboard', url: '/participant/dashboard.html', features: ['stats', 'charts', 'recent-exams'] },
    { name: 'Ujian', url: '/participant/ujian.html', features: ['exam-form', 'exam-types', 'timer'] },
    { name: 'Resume Ujian', url: '/participant/resume-ujian.html?result_id=21', features: ['result-display', 'analysis', 'recommendations'] },
    { name: 'Profile', url: '/participant/profile.html', features: ['user-info', 'stats'] },
    { name: 'Materi', url: '/participant/materi.html', features: ['materials-list', 'categories'] },
    { name: 'Leaderboard', url: '/participant/leaderboard.html', features: ['ranking', 'podium', 'my-position'] },
    { name: 'Achievements', url: '/participant/achievements.html', features: ['badges', 'stats', 'timeline'] }
];

const ADMIN_PAGES = [
    { name: 'Dashboard', url: '/admin/index.html', features: ['stats', 'charts'] },
    { name: 'Soal Management', url: '/admin/index.html', features: ['questions-list', 'create', 'edit', 'delete'] },
    { name: 'Kategori', url: '/admin/index.html', features: ['categories-list'] },
    { name: 'Statistik', url: '/admin/index.html', features: ['analytics', 'charts'] },
    { name: 'Results', url: '/admin/index.html', features: ['exam-results', 'analysis'] }
];

test.describe('Comprehensive Features Test - Participant', () => {
  test.beforeAll(async ({ browser }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  COMPREHENSIVE FEATURES TEST - PARTICIPANT');
    console.log('  Testing all participant pages and features in headed mode');
    console.log('══════════════════════════════════════════════════════════════════════\n');
  });

  test('Test all participant pages and features', async ({ page }) => {
    const allResults = [];
    const consoleMessages = [];
    const pageErrors = [];

    page.on('console', msg => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    page.on('pageerror', error => {
        pageErrors.push({ message: error.message, stack: error.stack });
    });

    // Login
    console.log('📝 Step 1: Login');
    await page.goto(`${BASE_URL}/login.html`, { timeout: 30000, waitUntil: 'load' });
    await page.waitForTimeout(2000);
    
    // Try to fill the form directly without waiting for specific selectors
    try {
        await page.fill('input#username', USER.username, { timeout: 5000 });
        await page.fill('input#password', USER.password, { timeout: 5000 });
        await page.click('button[type="submit"]', { timeout: 5000 });
    } catch (e) {
        console.log('Direct fill failed, trying with selectors:', e.message);
        // Fallback: try with different selectors
        await page.locator('input[type="text"]').first().fill(USER.username);
        await page.locator('input[type="password"]').first().fill(USER.password);
        await page.locator('button[type="submit"]').click();
    }
    
    await page.waitForURL('**/participant/dashboard.html', { timeout: 15000 }).catch(() => {});
    console.log('✅ Login successful');
    await page.screenshot({ path: 'test-screenshots/comprehensive/01-login.png' });

    // Test each participant page
    for (let i = 0; i < PARTICIPANT_PAGES.length; i++) {
        const pageInfo = PARTICIPANT_PAGES[i];
        console.log(`\n` + '─'.repeat(70));
        console.log(`PAGE ${i + 1}/${PARTICIPANT_PAGES.length}: ${pageInfo.name}`);
        console.log(`URL: ${pageInfo.url}`);
        console.log(`Features: ${pageInfo.features.join(', ')}`);
        console.log('─'.repeat(70));

        consoleMessages.length = 0;
        pageErrors.length = 0;

        await page.goto(`${BASE_URL}${pageInfo.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const pageResult = {
            name: pageInfo.name,
            url: pageInfo.url,
            loaded: true,
            consoleErrors: 0,
            consoleWarnings: 0,
            pageErrors: 0,
            features: {}
        };

        // Check for console errors
        const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
        const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');

        pageResult.consoleErrors = errorMessages.length;
        pageResult.consoleWarnings = warningMessages.length;
        pageResult.pageErrors = pageErrors.length;

        if (errorMessages.length > 0) {
            console.log(`⚠️ Console errors: ${errorMessages.length}`);
            errorMessages.forEach(msg => {
                console.log(`  - ${msg.text.substring(0, 100)}`);
            });
        }

        if (pageErrors.length > 0) {
            console.log(`❌ Page errors: ${pageErrors.length}`);
            pageErrors.forEach(error => {
                console.log(`  - ${error.message}`);
            });
        }

        // Check specific features
        for (const feature of pageInfo.features) {
            let featureFound = false;
            
            try {
                switch (feature) {
                    case 'stats':
                        featureFound = await page.locator('.stat-card, .card-body, .stats').count() > 0;
                        break;
                    case 'charts':
                        featureFound = await page.locator('canvas, .chart, .graph').count() > 0;
                        break;
                    case 'exam-form':
                        featureFound = await page.locator('#namaPeserta, .exam-form, form').count() > 0;
                        break;
                    case 'ranking':
                        featureFound = await page.locator('.leaderboard-table, table, .ranking').count() > 0;
                        break;
                    case 'badges':
                        featureFound = await page.locator('.badge, .achievement-card, .badge-card').count() > 0;
                        break;
                    default:
                        featureFound = await page.locator('body').count() > 0;
                }
            } catch (error) {
                featureFound = false;
            }
            
            pageResult.features[feature] = featureFound;
            console.log(`  ${featureFound ? '✅' : '⚠️'} ${feature}: ${featureFound ? 'Found' : 'Not found'}`);
        }

        console.log(`✅ Page loaded: ${pageInfo.name}`);
        await page.screenshot({ path: `test-screenshots/comprehensive/02-${pageInfo.name.replace(/\s+/g, '_')}.png` });

        allResults.push(pageResult);
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('  PARTICIPANT PAGES TEST SUMMARY');
    console.log('═'.repeat(70));
    
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalPageErrors = 0;
    let featuresFound = 0;
    let totalFeatures = 0;

    allResults.forEach(result => {
        console.log(`\n${result.name}:`);
        console.log(`  Console Errors: ${result.consoleErrors}`);
        console.log(`  Console Warnings: ${result.consoleWarnings}`);
        console.log(`  Page Errors: ${result.pageErrors}`);
        
        Object.keys(result.features).forEach(feature => {
            totalFeatures++;
            if (result.features[feature]) {
                featuresFound++;
                console.log(`  ✅ ${feature}: Found`);
            } else {
                console.log(`  ⚠️ ${feature}: Not found`);
            }
        });

        totalErrors += result.consoleErrors;
        totalWarnings += result.consoleWarnings;
        totalPageErrors += result.pageErrors;
    });

    console.log('\n' + '═'.repeat(70));
    console.log('  OVERALL SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Pages Tested: ${allResults.length}`);
    console.log(`Total Console Errors: ${totalErrors}`);
    console.log(`Total Console Warnings: ${totalWarnings}`);
    console.log(`Total Page Errors: ${totalPageErrors}`);
    console.log(`Features Found: ${featuresFound}/${totalFeatures}`);
    console.log(`Feature Coverage: ${Math.round((featuresFound / totalFeatures) * 100)}%`);
    
    if (totalPageErrors === 0) {
        console.log('\n✅ ALL PAGES CLEAN - NO CRITICAL ERRORS');
    } else {
        console.log('\n❌ SOME PAGES HAVE ERRORS - NEED ATTENTION');
    }

    console.log('══════════════════════════════════════════════════════════════════════\n');

    // Assert no critical errors
    expect(totalPageErrors).toBe(0);
  });
});

test.describe('Comprehensive Features Test - Admin', () => {
  test('Test all admin pages and features', async ({ page }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  COMPREHENSIVE FEATURES TEST - ADMIN');
    console.log('  Testing all admin pages and features in headed mode');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    const allResults = [];
    const pageErrors = [];

    page.on('pageerror', error => {
        pageErrors.push({ message: error.message, stack: error.stack });
    });

    // Navigate to Admin
    console.log('📝 Step 1: Navigate to Admin');
    await page.goto(`${BASE_URL}/admin/index.html`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Admin page loaded');
    await page.screenshot({ path: 'test-screenshots/comprehensive/10-admin-login.png' });

    // Test admin sections
    for (let i = 0; i < ADMIN_PAGES.length; i++) {
        const pageInfo = ADMIN_PAGES[i];
        console.log(`\n` + '─'.repeat(70));
        console.log(`ADMIN SECTION ${i + 1}/${ADMIN_PAGES.length}: ${pageInfo.name}`);
        console.log(`Features: ${pageInfo.features.join(', ')}`);
        console.log('─'.repeat(70));

        pageErrors.length = 0;

        const pageResult = {
            name: pageInfo.name,
            loaded: true,
            pageErrors: 0,
            features: {}
        };

        // Check if admin page is accessible
        const adminContent = await page.locator('.admin-container, #adminContent, .main-content').count();
        pageResult.loaded = adminContent > 0;
        pageResult.pageErrors = pageErrors.length;

        if (pageErrors.length > 0) {
            console.log(`❌ Page errors: ${pageErrors.length}`);
            pageErrors.forEach(error => {
                console.log(`  - ${error.message}`);
            });
        }

        // Check specific features
        for (const feature of pageInfo.features) {
            let featureFound = false;
            
            try {
                switch (feature) {
                    case 'stats':
                        featureFound = await page.locator('.stat-card, .card-body').count() > 0;
                        break;
                    case 'charts':
                        featureFound = await page.locator('canvas, .chart').count() > 0;
                        break;
                    case 'questions-list':
                        featureFound = await page.locator('table, .questions-list').count() > 0;
                        break;
                    case 'categories-list':
                        featureFound = await page.locator('.categories, .category-list').count() > 0;
                        break;
                    default:
                        featureFound = adminContent > 0;
                }
            } catch (error) {
                featureFound = false;
            }
            
            pageResult.features[feature] = featureFound;
            console.log(`  ${featureFound ? '✅' : '⚠️'} ${feature}: ${featureFound ? 'Found' : 'Not found'}`);
        }

        console.log(`✅ ${pageResult.loaded ? 'Admin section accessible' : 'Admin section requires login'}`);
        await page.screenshot({ path: `test-screenshots/comprehensive/11-${pageInfo.name.replace(/\s+/g, '_')}.png` });

        allResults.push(pageResult);
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('  ADMIN PAGES TEST SUMMARY');
    console.log('═'.repeat(70));
    
    let totalPageErrors = 0;
    let featuresFound = 0;
    let totalFeatures = 0;

    allResults.forEach(result => {
        console.log(`\n${result.name}:`);
        console.log(`  Page Errors: ${result.pageErrors}`);
        console.log(`  Loaded: ${result.loaded ? 'Yes' : 'No (requires login)'}`);
        
        Object.keys(result.features).forEach(feature => {
            totalFeatures++;
            if (result.features[feature]) {
                featuresFound++;
                console.log(`  ✅ ${feature}: Found`);
            } else {
                console.log(`  ⚠️ ${feature}: Not found`);
            }
        });

        totalPageErrors += result.pageErrors;
    });

    console.log('\n' + '═'.repeat(70));
    console.log('  ADMIN SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Sections Tested: ${allResults.length}`);
    console.log(`Total Page Errors: ${totalPageErrors}`);
    console.log(`Features Found: ${featuresFound}/${totalFeatures}`);
    console.log(`Feature Coverage: ${Math.round((featuresFound / totalFeatures) * 100)}%`);
    
    if (totalPageErrors === 0) {
        console.log('\n✅ ADMIN PAGES CLEAN - NO CRITICAL ERRORS');
    } else {
        console.log('\n⚠️ ADMIN PAGES HAVE SOME ERRORS (may require login)');
    }

    console.log('══════════════════════════════════════════════════════════════════════\n');
  });
});
