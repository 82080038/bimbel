/**
 * Main Test Runner - Runs all simulations and generates report
 */

const adminSimulation = require('./admin-simulation');
const participantSimulation = require('./participant-simulation');
const tryoutSimulation = require('./tryout-packages');
const fs = require('fs');
const path = require('path');

async function runAllSimulations() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     BIMBEL APPLICATION SIMULATION TEST SUITE             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  const allResults = {
    timestamp: new Date().toISOString(),
    admin: null,
    participant: null,
    tryout: null,
    errors: [],
    fixes: []
  };
  
  try {
    // Run admin simulation
    console.log('══════════════════════════════════════════════════════════════');
    console.log('TEST 1: ADMIN ROLE SIMULATION');
    console.log('══════════════════════════════════════════════════════════════');
    allResults.admin = await adminSimulation();
    
  } catch (error) {
    console.error('❌ Admin simulation failed:', error.message);
    allResults.errors.push({ test: 'admin', error: error.message });
  }
  
  try {
    // Run participant simulation
    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('TEST 2: PARTICIPANT ROLE SIMULATION');
    console.log('══════════════════════════════════════════════════════════════');
    allResults.participant = await participantSimulation();
    
  } catch (error) {
    console.error('❌ Participant simulation failed:', error.message);
    allResults.errors.push({ test: 'participant', error: error.message });
  }
  
  try {
    // Run tryout packages simulation
    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('TEST 3: TRYOUT PACKAGES SIMULATION');
    console.log('══════════════════════════════════════════════════════════════');
    allResults.tryout = await tryoutSimulation();
    
  } catch (error) {
    console.error('❌ Tryout simulation failed:', error.message);
    allResults.errors.push({ test: 'tryout', error: error.message });
  }
  
  // Analyze errors and suggest fixes
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('ERROR ANALYSIS & RECOMMENDED FIXES');
  console.log('══════════════════════════════════════════════════════════════');
  
  analyzeErrors(allResults);
  
  // Calculate total time
  const totalTime = Date.now() - startTime;
  
  // Print final summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`⏱️  Total time: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(`📸 Screenshots saved in: ./screenshots/`);
  
  // Count results
  let totalPassed = 0;
  let totalFailed = 0;
  
  if (allResults.admin) {
    totalPassed += allResults.admin.overall.passed || 0;
    totalFailed += allResults.admin.overall.failed || 0;
  }
  if (allResults.participant) {
    totalPassed += allResults.participant.overall.passed || 0;
    totalFailed += allResults.participant.overall.failed || 0;
  }
  if (allResults.tryout) {
    totalPassed += allResults.tryout.summary.passed || 0;
    totalFailed += allResults.tryout.summary.failed || 0;
  }
  
  console.log(`\n📊 Overall Results:`);
  console.log(`   ✅ Passed: ${totalPassed}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`   📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  // Save results to file
  const resultsDir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const resultsFile = path.join(resultsDir, `simulation-results-${Date.now()}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(allResults, null, 2));
  console.log(`\n📝 Results saved to: ${resultsFile}`);
  
  return allResults;
}

function analyzeErrors(results) {
  const fixes = [];
  
  // Analyze admin errors
  if (results.admin) {
    Object.entries(results.admin).forEach(([key, value]) => {
      if (key !== 'overall' && value.errors && value.errors.length > 0) {
        value.errors.forEach(error => {
          const fix = suggestFix(key, error, 'admin');
          fixes.push(fix);
          console.log(`\n🔍 Admin - ${key}:`);
          console.log(`   Error: ${error}`);
          console.log(`   💡 Fix: ${fix.description}`);
          console.log(`   📁 File: ${fix.file}`);
        });
      }
    });
  }
  
  // Analyze participant errors
  if (results.participant) {
    Object.entries(results.participant).forEach(([key, value]) => {
      if (key !== 'overall' && value.errors && value.errors.length > 0) {
        value.errors.forEach(error => {
          const fix = suggestFix(key, error, 'participant');
          fixes.push(fix);
          console.log(`\n🔍 Participant - ${key}:`);
          console.log(`   Error: ${error}`);
          console.log(`   💡 Fix: ${fix.description}`);
          console.log(`   📁 File: ${fix.file}`);
        });
      }
    });
  }
  
  // Analyze tryout errors
  if (results.tryout && results.tryout.packages) {
    Object.entries(results.tryout.packages).forEach(([packageName, value]) => {
      if (value.errors && value.errors.length > 0) {
        value.errors.forEach(error => {
          const fix = suggestFix(packageName, error, 'tryout');
          fixes.push(fix);
          console.log(`\n🔍 Tryout Package - ${packageName}:`);
          console.log(`   Error: ${error}`);
          console.log(`   💡 Fix: ${fix.description}`);
          console.log(`   📁 File: ${fix.file}`);
        });
      }
    });
  }
  
  if (fixes.length === 0) {
    console.log('✅ No errors found! All simulations passed.');
  }
  
  results.fixes = fixes;
  return fixes;
}

function suggestFix(context, error, type) {
  // Common error patterns and their fixes
  if (error.includes('Dashboard not visible')) {
    return {
      description: 'Check RBAC implementation in admin.html - ensure role is stored in localStorage',
      file: 'admin.html',
      priority: 'high'
    };
  }
  
  if (error.includes('Exam interface not loaded')) {
    return {
      description: 'Check fullscreen API support and exam initialization in participant/ujian.html',
      file: 'participant/ujian.html',
      priority: 'high'
    };
  }
  
  if (error.includes('Questions section')) {
    return {
      description: 'Check API endpoint for questions and ensure database connection',
      file: 'api/soal.php',
      priority: 'medium'
    };
  }
  
  if (error.includes('Could not answer')) {
    return {
      description: 'Check question rendering and answer button selectors in participant/ujian.html',
      file: 'participant/ujian.html',
      priority: 'medium'
    };
  }
  
  if (error.includes('navigation')) {
    return {
      description: 'Check navigation button event handlers and question state management',
      file: 'participant/ujian.html',
      priority: 'low'
    };
  }
  
  // Generic fallback
  return {
    description: `Review ${type} functionality and check for JavaScript errors`,
    file: type === 'admin' ? 'admin.html' : type === 'participant' ? 'participant/ujian.html' : 'api/soal.php',
    priority: 'medium'
  };
}

// Run if called directly
if (require.main === module) {
  runAllSimulations().then(() => {
    console.log('\n✨ Simulation test suite completed!');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = runAllSimulations;
