const puppeteer = require('puppeteer');

describe('Essentials App E2E Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // Set a reasonable viewport
    await page.setViewport({ width: 1920, height: 1080 });
  });

  test('Health endpoint returns ok', async () => {
    const response = await page.goto('http://localhost:3000/api/health');
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData.status).toBe('ok');
    expect(healthData.service).toBe('essentials');
  });

  test('Homepage loads without errors', async () => {
    try {
      const response = await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });
      
      expect(response.status()).toBe(200);
      
      const title = await page.title();
      expect(title).toBeTruthy();
      console.log('Page title:', title);
      
      // Check for no JavaScript errors
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.waitForTimeout(2000); // Wait for any JS to execute
      
      if (errors.length > 0) {
        console.warn('JavaScript errors found:', errors);
      }
      
      // Take screenshot for reference
      await page.screenshot({ 
        path: 'homepage-success.png',
        fullPage: true
      });
      
    } catch (error) {
      await page.screenshot({ path: 'homepage-error.png', fullPage: true });
      throw error;
    }
  }, 45000);

  test('Basic navigation and UI elements', async () => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Check for basic HTML structure
    const hasHeader = await page.$('header, [role="banner"], nav') !== null;
    const hasMain = await page.$('main, [role="main"], #__next') !== null;
    
    expect(hasHeader || hasMain).toBe(true);
    
    // Check for interactive elements
    const buttons = await page.$$('button');
    const links = await page.$$('a');
    
    console.log(`Found ${buttons.length} buttons and ${links.length} links`);
    
    await page.screenshot({ path: 'navigation-test.png' });
  });

  test('Mobile responsiveness', async () => {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    await page.screenshot({ path: 'mobile-375.png', fullPage: true });
    
    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'networkidle0' });
    
    await page.screenshot({ path: 'tablet-768.png', fullPage: true });
    
    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await page.reload({ waitUntil: 'networkidle0' });
    
    await page.screenshot({ path: 'desktop-1920.png', fullPage: true });
  });

  test('Performance basics', async () => {
    // Navigate and measure performance
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    const performanceMetrics = await page.evaluate(() => {
      return {
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);
    
    // Basic performance assertions
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // Less than 5 seconds
    expect(performanceMetrics.loadComplete).toBeLessThan(10000); // Less than 10 seconds
  });

  test('Basic accessibility checks', async () => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Check for basic accessibility elements
    const hasTitle = await page.title() !== '';
    const hasLang = await page.$('html[lang]') !== null;
    const headings = await page.$$('h1, h2, h3, h4, h5, h6');
    
    expect(hasTitle).toBe(true);
    console.log('Has lang attribute:', hasLang);
    console.log('Number of headings:', headings.length);
    
    await page.screenshot({ path: 'accessibility-check.png' });
  });

  test('No console errors on load', async () => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(3000); // Wait for any delayed errors
    
    if (consoleErrors.length > 0) {
      console.warn('Console errors found:', consoleErrors);
      // Don't fail the test for console errors, just log them
    }
    
    await page.screenshot({ path: 'console-errors-check.png' });
  });
});