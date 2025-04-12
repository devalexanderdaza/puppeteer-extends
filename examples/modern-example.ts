// import { PuppeteerExtends, Logger, BrowserOptions } from '../dist';
import { PuppeteerExtends, Logger, BrowserOptions } from '../src';
import { Browser, Page } from 'puppeteer';
import { join } from 'path';

// Folder to store puppeteer data
const dataDir = join(__dirname, './tmp/puppeteer-extends');

// Browser configuration
const browserOptions: BrowserOptions = {
  isHeadless: false,
  isDebug: true,
  userDataDir: dataDir,
  instanceId: 'example-session'
};

async function runExample() {
  Logger.info('🚀 Starting puppeteer-extends example');
  
  try {
    // Get browser instance
    const browser: Browser = await PuppeteerExtends.getBrowser(browserOptions);
    
    // Create new page
    const page: Page = await browser.newPage();
    
    // Configure viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to URL
    Logger.info('📡 Navigating to GitHub profile');
    const navigationSuccess = await PuppeteerExtends.goto(page, 'https://github.com/devalexanderdaza', {
      isDebug: true,
      maxRetries: 2
    });
    
    if (!navigationSuccess) {
      throw new Error('Failed to navigate to URL');
    }

    // Wait for specific element
    await PuppeteerExtends.waitForSelector(page, '.vcard-fullname');
        
    // Take screenshot
    Logger.info('📸 Taking screenshot');
    await page.screenshot({
      path: join(__dirname, './github-profile.png'),
      fullPage: true
    });
    
    // Extract profile information
    const profileName = await page.$eval('.vcard-fullname', el => el.textContent?.trim());
    Logger.info(`👤 Retrieved profile name: ${profileName}`);
    
    // Close page
    Logger.info('🔒 Closing page');
    await PuppeteerExtends.closePage(page);
    
    // Create a second page using the same browser instance
    const page2 = await browser.newPage();
    await PuppeteerExtends.goto(page2, 'https://github.com/trending');
    await page2.screenshot({ path: join(__dirname, './trending.png'), fullPage: true });
    Logger.info('📸 Screenshot of trending page taken');
    await PuppeteerExtends.closePage(page2);
    
    // Close browser instance
    Logger.info('👋 Closing browser');
    await PuppeteerExtends.closeBrowser(browserOptions.instanceId);
    
    return { success: true };
  } catch (error: any) {
    Logger.error('❌ Error in example', error);
    
    // Make sure to close all browsers on error
    await PuppeteerExtends.closeAllBrowsers();
    
    return { success: false, error };
  }
}

// Run the example
runExample()
  .then(result => {
    if (result.success) {
      Logger.info('✅ Example completed successfully');
    } else {
      Logger.error('❌ Example failed', result.error);
      process.exit(1);
    }
  })
  .catch(err => {
    Logger.error('💥 Unexpected error', err);
    process.exit(1);
  });