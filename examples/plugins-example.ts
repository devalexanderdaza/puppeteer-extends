import { PuppeteerExtends, Logger } from '../src';
import { StealthPlugin, ProxyPlugin } from '../src/plugins';
import { join } from 'path';

// Configure logger
Logger.configure(join(__dirname, 'logs'));

async function runPluginsExample() {
  try {
    Logger.info('🚀 Starting plugins example');
    
    // Register stealth plugin
    await PuppeteerExtends.registerPlugin(new StealthPlugin({
      hideWebDriver: true,
      hideChromeRuntime: true
    }));
    Logger.info('🥷 Stealth plugin registered');
    
    // Register proxy plugin with multiple proxies
    await PuppeteerExtends.registerPlugin(new ProxyPlugin({
      proxies: [
        { host: '127.0.0.1', port: 8080 },
        { host: '127.0.0.1', port: 8081 },
      ],
      rotationStrategy: 'sequential',
      rotateOnNavigation: true,
      rotateOnError: true
    }));
    Logger.info('🔄 Proxy plugin registered');
    
    // Get browser with plugins applied
    const browser = await PuppeteerExtends.getBrowser({
      isHeadless: false,
      isDebug: true
    });
    
    // Create a new page (plugin hooks will be executed)
    const page = await browser.newPage();
    
    // Navigate with plugins active
    Logger.info('📡 Navigating to GitHub with plugins active');
    const success = await PuppeteerExtends.goto(page, 'https://github.com/devalexanderdaza', {
      maxRetries: 2,
      isDebug: true
    });
    
    if (success) {
      Logger.info('✅ Navigation successful!');
      
      // Wait for a specific element
      await PuppeteerExtends.waitForSelector(page, '.vcard-fullname');
      
      // Take screenshot
      Logger.info('📸 Taking screenshot');
      await page.screenshot({
        path: join(__dirname, 'plugins-example.png'),
        fullPage: true
      });
      
      // Extract profile information
      const profileName = await page.$eval('.vcard-fullname', el => el.textContent?.trim());
      Logger.info(`👤 Retrieved profile name: ${profileName}`);
    } else {
      Logger.error('❌ Navigation failed');
    }
    
    // Cleanup
    Logger.info('🧹 Cleaning up resources');
    await PuppeteerExtends.closePage(page);
    await PuppeteerExtends.closeAllBrowsers();
    
    return { success: true };
  } catch (error) {
    Logger.error('❌ Error in example', error);
    await PuppeteerExtends.closeAllBrowsers();
    return { success: false, error };
  }
}

// Run the example
runPluginsExample()
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