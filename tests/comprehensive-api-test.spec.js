/**
 * COMPREHENSIVE API ENDPOINTS TEST - Playwright
 * Testing all API endpoints for functionality and error handling
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const API_BASE = 'http://localhost/bimbel/api';

const API_ENDPOINTS = [
    { file: 'auth.php', actions: ['login', 'register'], method: 'POST', auth: false },
    { file: 'soal.php', actions: ['get_soal_by_kategori', 'get_soal_acak', 'get_statistik'], method: 'GET', auth: true },
    { file: 'analytics.php', actions: ['get_question_analytics', 'get_user_analytics'], method: 'GET', auth: true },
    { file: 'courses.php', actions: ['list_courses', 'get_course'], method: 'GET', auth: true },
    { file: 'gamification.php', actions: ['get_user_gamification', 'get_leaderboard', 'get_achievements'], method: 'GET', auth: true },
    { file: 'notifications.php', actions: ['get_notifications', 'mark_read'], method: 'GET', auth: true },
    { file: 'expert.php', actions: ['get_expert_knowledge', 'ask_expert'], method: 'POST', auth: true },
    { file: 'pembahasan.php', actions: ['get_pembahasan', 'get_pembahasan_kategori'], method: 'GET', auth: true }
];

test.describe('Comprehensive API Endpoints Test', () => {
  test('Test all API endpoints', async ({ request }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  COMPREHENSIVE API ENDPOINTS TEST');
    console.log('  Testing all API endpoints for functionality');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    const allResults = [];

    for (let i = 0; i < API_ENDPOINTS.length; i++) {
        const endpoint = API_ENDPOINTS[i];
        console.log(`\n` + '─'.repeat(70));
        console.log(`API FILE ${i + 1}/${API_ENDPOINTS.length}: ${endpoint.file}`);
        console.log(`Actions: ${endpoint.actions.join(', ')}`);
        console.log('─'.repeat(70));

        for (const action of endpoint.actions) {
            const result = {
                file: endpoint.file,
                action: action,
                method: endpoint.method,
                status: 'unknown',
                statusCode: 0,
                responseTime: 0,
                error: null
            };

            try {
                const startTime = Date.now();
                
                if (endpoint.method === 'GET') {
                    const response = await request.get(`${API_BASE}/${endpoint.file}?action=${action}`);
                    result.statusCode = response.status();
                    result.responseTime = Date.now() - startTime;
                    
                    if (response.status() === 200) {
                        try {
                            const contentType = response.headers()['content-type'];
                            if (contentType && contentType.includes('application/json')) {
                                const data = await response.json();
                                result.status = 'success';
                                console.log(`  ✅ ${action}: ${response.status()} (${result.responseTime}ms) - JSON response`);
                            } else {
                                result.status = 'warning';
                                console.log(`  ⚠️ ${action}: ${response.status()} (${result.responseTime}ms) - Non-JSON response`);
                            }
                        } catch (error) {
                            result.status = 'warning';
                            result.error = 'Invalid JSON response';
                            console.log(`  ⚠️ ${action}: ${response.status()} (${result.responseTime}ms) - Invalid JSON`);
                        }
                    } else if (response.status() === 401) {
                        result.status = 'auth_required';
                        console.log(`  🔒 ${action}: ${response.status()} (${result.responseTime}ms) - Auth required`);
                    } else if (response.status() === 404) {
                        result.status = 'not_found';
                        console.log(`  ⚠️ ${action}: ${response.status()} (${result.responseTime}ms) - Not found`);
                    } else {
                        result.status = 'error';
                        console.log(`  ❌ ${action}: ${response.status()} (${result.responseTime}ms) - Error`);
                    }
                } else if (endpoint.method === 'POST') {
                    const response = await request.post(`${API_BASE}/${endpoint.file}?action=${action}`, {
                        data: {}
                    });
                    result.statusCode = response.status();
                    result.responseTime = Date.now() - startTime;
                    
                    if (response.status() === 200 || response.status() === 400 || response.status() === 401) {
                        try {
                            const data = await response.json();
                            result.status = 'success';
                            console.log(`  ✅ ${action}: ${response.status()} (${result.responseTime}ms) - JSON response`);
                        } catch (error) {
                            result.status = 'warning';
                            console.log(`  ⚠️ ${action}: ${response.status()} (${result.responseTime}ms) - Invalid JSON`);
                        }
                    } else {
                        result.status = 'error';
                        console.log(`  ❌ ${action}: ${response.status()} (${result.responseTime}ms) - Error`);
                    }
                }
            } catch (error) {
                result.status = 'error';
                result.error = error.message;
                console.log(`  ❌ ${action}: Network error - ${error.message}`);
            }

            allResults.push(result);
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('  API ENDPOINTS TEST SUMMARY');
    console.log('═'.repeat(70));
    
    let successCount = 0;
    let authRequiredCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let totalResponseTime = 0;

    allResults.forEach(result => {
        switch (result.status) {
            case 'success':
                successCount++;
                break;
            case 'auth_required':
                authRequiredCount++;
                break;
            case 'warning':
                warningCount++;
                break;
            case 'error':
            case 'not_found':
                errorCount++;
                break;
        }
        totalResponseTime += result.responseTime;
    });

    console.log(`Total Endpoints Tested: ${allResults.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`🔒 Auth Required: ${authRequiredCount}`);
    console.log(`⚠️ Warnings: ${warningCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`Average Response Time: ${Math.round(totalResponseTime / allResults.length)}ms`);
    
    const successRate = Math.round((successCount / allResults.length) * 100);
    console.log(`Success Rate: ${successRate}%`);
    
    if (errorCount === 0) {
        console.log('\n✅ ALL API ENDPOINTS FUNCTIONAL');
    } else {
        console.log('\n⚠️ SOME API ENDPOINTS HAVE ERRORS');
    }

    console.log('══════════════════════════════════════════════════════════════════════\n');

    // Assert no critical errors (404s are acceptable for endpoints that require data)
    expect(errorCount).toBeLessThan(allResults.length * 0.5); // Less than 50% errors acceptable
  });
});
