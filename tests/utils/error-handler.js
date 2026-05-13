/**
 * Error Handling Utilities for Puppeteer Tests
 * Provides retry logic, dialog handling, and better timeout management
 */

class TestErrorHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.timeout = options.timeout || 10000;
    this.screenshotOnError = options.screenshotOnError !== false;
  }

  /**
   * Setup dialog handlers for common dialog types
   */
  setupDialogHandlers(page) {
    page.on('dialog', async dialog => {
      const message = dialog.message();
      const type = dialog.type();
      
      console.log(`   🔔 Dialog [${type}]: ${message.substring(0, 100)}...`);
      
      // Handle based on message content
      if (message.includes('paket') || message.includes('Pilih paket')) {
        console.log('   ⚠️ Paket selection required');
        await dialog.dismiss();
      } else if (message.includes('fullscreen') || message.includes('layar penuh')) {
        console.log('   ✅ Accepting fullscreen');
        await dialog.accept();
      } else if (message.includes('konfirmasi') || message.includes('yakin')) {
        console.log('   ✅ Confirming action');
        await dialog.accept();
      } else if (message.includes('error') || message.includes('gagal')) {
        console.log('   ❌ Error dialog');
        await dialog.accept();
      } else {
        // Default: accept
        await dialog.accept();
      }
    });
  }

  /**
   * Retry function with exponential backoff
   */
  async retry(fn, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    const retryDelay = options.retryDelay || this.retryDelay;
    const description = options.description || 'operation';
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`   🔄 ${description} (attempt ${attempt}/${maxRetries})...`);
        const result = await fn();
        console.log(`   ✅ ${description} succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`   ⚠️ ${description} failed on attempt ${attempt}: ${error.message}`);
        
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`   ⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log(`   ❌ ${description} failed after ${maxRetries} attempts`);
    throw lastError;
  }

  /**
   * Wait for element with retry
   */
  async waitForElement(page, selector, options = {}) {
    const timeout = options.timeout || this.timeout;
    const visible = options.visible !== false;
    
    return this.retry(
      async () => {
        await page.waitForSelector(selector, { 
          timeout, 
          visible 
        });
        return true;
      },
      { 
        description: `wait for ${selector}`,
        maxRetries: options.maxRetries || 2
      }
    );
  }

  /**
   * Safe click with retry
   */
  async safeClick(page, selector, options = {}) {
    return this.retry(
      async () => {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        return true;
      },
      { 
        description: `click ${selector}`,
        maxRetries: options.maxRetries || 3
      }
    );
  }

  /**
   * Safe type with retry
   */
  async safeType(page, selector, text, options = {}) {
    return this.retry(
      async () => {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.type(selector, text);
        return true;
      },
      { 
        description: `type into ${selector}`,
        maxRetries: options.maxRetries || 3
      }
    );
  }

  /**
   * Wait for navigation with timeout
   */
  async waitForNavigation(page, options = {}) {
    const timeout = options.timeout || 30000;
    const waitUntil = options.waitUntil || 'networkidle2';
    
    return this.retry(
      async () => {
        await page.waitForNavigation({ 
          timeout, 
          waitUntil 
        });
        return true;
      },
      { 
        description: 'navigation',
        maxRetries: 2
      }
    );
  }

  /**
   * Check if element exists
   */
  async elementExists(page, selector) {
    try {
      const element = await page.$(selector);
      return !!element;
    } catch {
      return false;
    }
  }

  /**
   * Wait for function to return true
   */
  async waitForFunction(page, fn, options = {}) {
    const timeout = options.timeout || this.timeout;
    const interval = options.interval || 500;
    const description = options.description || 'condition';
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = await page.evaluate(fn);
      if (result) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Timeout waiting for ${description} after ${timeout}ms`);
  }

  /**
   * Execute with timeout wrapper
   */
  async withTimeout(fn, timeout, description = 'operation') {
    return Promise.race([
      fn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${description} timed out after ${timeout}ms`)), timeout)
      )
    ]);
  }

  /**
   * Graceful error recovery
   */
  async gracefulRecovery(page, error, options = {}) {
    console.log(`   🔄 Attempting graceful recovery from: ${error.message}`);
    
    try {
      // Take screenshot of error state
      if (this.screenshotOnError && options.screenshotFn) {
        await options.screenshotFn(page, `error_recovery_${Date.now()}`);
      }
      
      // Try to navigate back to safe state
      if (options.fallbackUrl) {
        console.log(`   🔄 Navigating to fallback: ${options.fallbackUrl}`);
        await page.goto(options.fallbackUrl, { waitUntil: 'networkidle2' });
      }
      
      // Try to dismiss any dialogs
      try {
        await page.evaluate(() => {
          const dialogs = document.querySelectorAll('.modal, .dialog, [role="dialog"]');
          dialogs.forEach(d => {
            const closeBtn = d.querySelector('.close, .btn-close, [data-dismiss]');
            if (closeBtn) closeBtn.click();
          });
        });
      } catch (e) {
        // Ignore errors during recovery
      }
      
      return true;
    } catch (recoveryError) {
      console.log(`   ❌ Recovery failed: ${recoveryError.message}`);
      return false;
    }
  }
}

/**
 * Test result collector
 */
class TestResultCollector {
  constructor() {
    this.results = [];
    this.startTime = null;
  }

  start() {
    this.startTime = Date.now();
  }

  add(testName, status, details = {}) {
    this.results.push({
      test: testName,
      status,
      timestamp: new Date().toISOString(),
      duration: Date.now() - (this.startTime || Date.now()),
      ...details
    });
  }

  getSummary() {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;
    
    return {
      passed,
      failed,
      total,
      successRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0,
      duration: Date.now() - (this.startTime || Date.now())
    };
  }

  printReport() {
    const summary = this.getSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS REPORT');
    console.log('='.repeat(60));
    
    this.results.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : '❌';
      console.log(`${icon} ${result.test}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('-'.repeat(60));
    console.log(`📊 Summary: ${summary.passed}/${summary.total} passed (${summary.successRate}%)`);
    console.log(`⏱️  Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));
  }
}

/**
 * Timeout manager for long-running operations
 */
class TimeoutManager {
  constructor(defaultTimeout = 30000) {
    this.defaultTimeout = defaultTimeout;
    this.timeouts = new Map();
  }

  setTimeout(name, duration) {
    this.timeouts.set(name, duration);
  }

  getTimeout(name) {
    return this.timeouts.get(name) || this.defaultTimeout;
  }

  async withTimeout(name, fn) {
    const timeout = this.getTimeout(name);
    
    return Promise.race([
      fn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout: ${name} exceeded ${timeout}ms`)), timeout)
      )
    ]);
  }
}

module.exports = {
  TestErrorHandler,
  TestResultCollector,
  TimeoutManager
};
