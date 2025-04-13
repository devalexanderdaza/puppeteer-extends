import { PuppeteerExtends, Logger } from '../src';
import { Events, PuppeteerEvents } from '../src/events';
import { join } from 'path';

// Configure logger
Logger.configure(join(__dirname, 'logs'));

async function runEventsExample() {
  try {
    Logger.info('🚀 Starting events system example');
    
    // Set up event listeners
    Events.on(PuppeteerEvents.BROWSER_CREATED, (params) => {
      Logger.info(`🎬 Event: Browser created with ID: ${params.instanceId}`);
    });
    
    Events.on(PuppeteerEvents.PAGE_CREATED, (params) => {
      Logger.info(`🎬 Event: Page created`);
    });
    
    Events.on(PuppeteerEvents.NAVIGATION_STARTED, (params) => {
      Logger.info(`🎬 Event: Navigation started to ${params.url}`);
    });
    
    Events.on(PuppeteerEvents.NAVIGATION_SUCCEEDED, (params) => {
      Logger.info(`🎬 Event: Navigation succeeded to ${params.url}`);
    });
    
    Events.on(PuppeteerEvents.ERROR, (params) => {
      Logger.info(`🎬 Event: Error from ${params.source}: ${params.error.message}`);
    });
    
    Events.on(PuppeteerEvents.BROWSER_CLOSED, (params) => {
      Logger.info(`🎬 Event: Browser closed with ID: ${params.instanceId}`);
    });
    
    // Track event counts
    const eventCounts: Record<string, number> = {};
    
    // Set up a catch-all listener to count all events
    for (const eventType of Object.values(PuppeteerEvents)) {
      eventCounts[eventType] = 0;
      
      Events.on(eventType, () => {
        eventCounts[eventType]++;
      });
    }
    
    // Get browser instance
    Logger.info('📡 Getting browser instance');
    const browser = await PuppeteerExtends.getBrowser({
      isHeadless: false,
      isDebug: true
    });
    
    // Create new page
    Logger.info('📡 Creating page');
    const page = await browser.newPage();
    
    // Navigate to GitHub
    Logger.info('📡 Navigating to GitHub');
    await PuppeteerExtends.goto(page, 'https://github.com/devalexanderdaza/puppeteer-extends', {
      maxRetries: 1,
      isDebug: true
    });

    // Wait for the page to load
    Logger.info('⏳ Waiting for page to load');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Take screenshot
    Logger.info('📸 Taking screenshot');
    await page.screenshot({
      path: join(__dirname, 'events-example-github.png'),
      fullPage: false
    });
    
    // Navigate to another page to trigger more events
    Logger.info('📡 Navigating to GitHub trending');
    await PuppeteerExtends.goto(page, 'https://github.com/trending', {
      isDebug: true
    });
    
    // Take screenshot
    Logger.info('📸 Taking screenshot');
    await page.screenshot({
      path: join(__dirname, 'events-example.png'),
      fullPage: false
    });
    
    // Close page and browser
    Logger.info('🧹 Cleaning up resources');
    await PuppeteerExtends.closePage(page);
    await PuppeteerExtends.closeAllBrowsers();
    
    // Print event statistics
    Logger.info('📊 Event statistics:');
    for (const [eventType, count] of Object.entries(eventCounts)) {
      if (count > 0) {
        Logger.info(`  - ${eventType}: ${count} times`);
      }
    }
    
    return { success: true };
  } catch (error) {
    Logger.error('❌ Error in example', error instanceof Error ? error.message : String(error));
    await PuppeteerExtends.closeAllBrowsers();
    return { success: false, error };
  }
}

// Run the example
runEventsExample()
  .then(result => {
    if (result.success) {
      Logger.info('✅ Example completed successfully');
    } else {
      Logger.error('❌ Example failed', result.error instanceof Error ? result.error : String(result.error));
      process.exit(1);
    }
  })
  .catch(err => {
    Logger.error('💥 Unexpected error', err);
    process.exit(1);
  });