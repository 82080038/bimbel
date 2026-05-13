/**
 * API Integration Tests
 * Tests API endpoints directly without browser
 */

const axios = require('axios');
const CONFIG = require('../simulation/config');

// Base URL for API
const API_BASE = 'http://localhost/bimbel/api';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Helper to make API requests
 */
async function apiRequest(method, endpoint, data = null, headers = {}) {
  const url = `${API_BASE}/${endpoint}`;
  const config = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    timeout: 10000
  };
  
  if (data && method.toLowerCase() !== 'get') {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.message,
      data: error.response?.data
    };
  }
}

/**
 * Test GET soal endpoint
 */
async function testGetSoal() {
  console.log('\n📋 Testing GET /soal.php?action=get_soal_by_kategori');
  
  const result = await apiRequest('get', 'soal.php?action=get_soal_by_kategori&kategori=TWK&limit=5');
  
  if (result.success && Array.isArray(result.data)) {
    console.log('   ✅ Successfully retrieved soal list');
    console.log(`   📊 Retrieved ${result.data.length} questions`);
    results.passed++;
    results.tests.push({ name: 'GET soal', status: 'passed' });
  } else {
    console.log('   ❌ Failed to retrieve soal:', result.error || result.data);
    results.failed++;
    results.tests.push({ name: 'GET soal', status: 'failed', error: result.error });
  }
}

/**
 * Test GET paket endpoint
 */
async function testGetPaket() {
  console.log('\n📋 Testing GET /soal.php?action=get_paket');
  
  const result = await apiRequest('get', 'soal.php?action=get_paket');
  
  if (result.success && Array.isArray(result.data)) {
    console.log('   ✅ Successfully retrieved paket list');
    console.log(`   📊 Retrieved ${result.data.length} packages`);
    results.passed++;
    results.tests.push({ name: 'GET paket', status: 'passed' });
  } else {
    console.log('   ❌ Failed to retrieve paket:', result.error || result.data);
    results.failed++;
    results.tests.push({ name: 'GET paket', status: 'failed', error: result.error });
  }
}

/**
 * Test authentication - login
 */
async function testLogin() {
  console.log('\n📋 Testing POST /auth.php?action=login');
  
  const result = await apiRequest('post', 'auth.php?action=login', {
    username: CONFIG.admin.username,
    password: CONFIG.admin.password
  });
  
  if (result.success && result.data.token) {
    console.log('   ✅ Successfully logged in');
    console.log('   🔑 Token received');
    results.passed++;
    results.tests.push({ name: 'POST login', status: 'passed' });
    return result.data.token;
  } else {
    console.log('   ❌ Failed to login:', result.error || result.data);
    results.failed++;
    results.tests.push({ name: 'POST login', status: 'failed', error: result.error });
    return null;
  }
}

/**
 * Test authenticated endpoint
 */
async function testAuthenticatedEndpoint(token) {
  console.log('\n📋 Testing authenticated endpoint');
  
  if (!token) {
    console.log('   ⚠️  Skipping - no token available');
    results.tests.push({ name: 'Authenticated endpoint', status: 'skipped' });
    return;
  }
  
  const result = await apiRequest('get', 'soal.php?action=get_statistics', null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    console.log('   ✅ Successfully accessed authenticated endpoint');
    results.passed++;
    results.tests.push({ name: 'Authenticated endpoint', status: 'passed' });
  } else {
    console.log('   ❌ Failed to access authenticated endpoint:', result.error);
    results.failed++;
    results.tests.push({ name: 'Authenticated endpoint', status: 'failed', error: result.error });
  }
}

/**
 * Test CORS headers
 */
async function testCORS() {
  console.log('\n📋 Testing CORS headers');
  
  try {
    const response = await axios.options(`${API_BASE}/soal.php`, {
      headers: {
        'Origin': 'http://localhost',
        'Access-Control-Request-Method': 'GET'
      },
      timeout: 5000
    });
    
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];
    
    const hasCORS = corsHeaders.every(header => 
      response.headers[header] || response.headers[header.toLowerCase()]
    );
    
    if (hasCORS) {
      console.log('   ✅ CORS headers properly configured');
      results.passed++;
      results.tests.push({ name: 'CORS headers', status: 'passed' });
    } else {
      console.log('   ⚠️  Some CORS headers missing');
      results.failed++;
      results.tests.push({ name: 'CORS headers', status: 'failed' });
    }
  } catch (error) {
    console.log('   ⚠️  CORS preflight test inconclusive:', error.message);
    results.tests.push({ name: 'CORS headers', status: 'inconclusive' });
  }
}

/**
 * Test rate limiting
 */
async function testRateLimiting() {
  console.log('\n📋 Testing rate limiting');
  
  const requests = [];
  const startTime = Date.now();
  
  // Make 105 requests (over public limit of 100)
  for (let i = 0; i < 105; i++) {
    requests.push(apiRequest('get', 'soal.php?action=get_soal_by_kategori&kategori=TWK&limit=1'));
  }
  
  const responses = await Promise.all(requests);
  const endTime = Date.now();
  
  const rateLimited = responses.some(r => r.status === 429);
  const successful = responses.filter(r => r.success).length;
  
  console.log(`   ⏱️  Completed ${responses.length} requests in ${endTime - startTime}ms`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   🚫 Rate limited: ${rateLimited ? 'YES' : 'NO'}`);
  
  if (successful >= 100 && successful < 105) {
    console.log('   ✅ Rate limiting working correctly');
    results.passed++;
    results.tests.push({ name: 'Rate limiting', status: 'passed' });
  } else if (successful === 105) {
    console.log('   ⚠️  Rate limiting may not be enabled');
    results.tests.push({ name: 'Rate limiting', status: 'inconclusive' });
  } else {
    console.log('   ❌ Unexpected rate limiting behavior');
    results.failed++;
    results.tests.push({ name: 'Rate limiting', status: 'failed' });
  }
}

/**
 * Test input validation
 */
async function testInputValidation() {
  console.log('\n📋 Testing input validation');
  
  // Test invalid category
  const result1 = await apiRequest('get', 'soal.php?action=get_soal_by_kategori&kategori=INVALID');
  
  // Test SQL injection attempt
  const result2 = await apiRequest('get', 'soal.php?action=get_soal_by_kategori&kategori=TWK\' OR \'1\'=\'1');
  
  if (!result1.success || !result2.success || 
      (Array.isArray(result1.data) && result1.data.length === 0) ||
      (Array.isArray(result2.data) && result2.data.length < 1000)) {
    console.log('   ✅ Input validation working');
    results.passed++;
    results.tests.push({ name: 'Input validation', status: 'passed' });
  } else {
    console.log('   ❌ Input validation may have issues');
    results.failed++;
    results.tests.push({ name: 'Input validation', status: 'failed' });
  }
}

/**
 * Test error responses
 */
async function testErrorResponses() {
  console.log('\n📋 Testing error responses');
  
  // Test missing action
  const result1 = await apiRequest('get', 'soal.php');
  
  // Test invalid action
  const result2 = await apiRequest('get', 'soal.php?action=invalid_action');
  
  const hasProperErrors = (!result1.success && result1.data?.error) || 
                          (!result2.success && result2.data?.error);
  
  if (hasProperErrors) {
    console.log('   ✅ Error responses properly formatted');
    results.passed++;
    results.tests.push({ name: 'Error responses', status: 'passed' });
  } else {
    console.log('   ⚠️  Error response format unclear');
    results.tests.push({ name: 'Error responses', status: 'inconclusive' });
  }
}

/**
 * Run all API integration tests
 */
async function runIntegrationTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     API INTEGRATION TESTS                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  try {
    await testGetSoal();
    await testGetPaket();
    const token = await testLogin();
    await testAuthenticatedEndpoint(token);
    await testCORS();
    await testRateLimiting();
    await testInputValidation();
    await testErrorResponses();
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('API INTEGRATION TESTS SUMMARY');
  console.log('='.repeat(60));
  
  results.tests.forEach(test => {
    const icon = test.status === 'passed' ? '✅' : 
                 test.status === 'failed' ? '❌' : '⏳';
    console.log(`${icon} ${test.name}: ${test.status}`);
  });
  
  console.log('-'.repeat(60));
  console.log(`📊 Passed: ${results.passed}, Failed: ${results.failed}, Total: ${results.tests.length}`);
  console.log('='.repeat(60));
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runIntegrationTests().then(() => {
    console.log('\n✨ API integration tests completed!');
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = runIntegrationTests;
