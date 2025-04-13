import { PuppeteerExtends, Logger } from '../src';
import { SessionPlugin } from '../src/plugins';
import { join } from 'path';
import { sleep } from '../src/utils';

// Configure logger
Logger.configure(join(__dirname, 'logs'));

async function runSessionExample() {
  try {
    Logger.info('🚀 Starting session management example');
    
    // Register session plugin
    const sessionPlugin = new SessionPlugin({
      name: 'github-session',
      extractAfterNavigation: true,
      persistCookies: true,
      persistLocalStorage: true,
      domains: ['github.com']
    });
    
    await PuppeteerExtends.registerPlugin(sessionPlugin);
    Logger.info('🔑 Session plugin registered');
    
    // Get browser with plugin applied
    const browser = await PuppeteerExtends.getBrowser({
      isHeadless: false,
      isDebug: true
    });

    // Create a new page
    const page = await browser.newPage();

    Logger.info('📄 New page created');
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    Logger.info('📏 Viewport size set to 1280x800');
    
    // Navigate to GitHub
    await page.goto('https://github.com');

    const sessionManager = sessionPlugin.getSessionManager();
    Logger.info('🔑 Browser instance created');

    // Check if session data is available
    if (sessionManager.getSessionData()) {
      Logger.info('🔑 Session data available, applying session');
      await sessionManager.applySession(page);
    } else {
      Logger.info('🔑 No session data available, proceeding to login');
    }

    // Check if cookie logged_in is set
    const cookies = sessionManager.getSessionData().cookies;
    const loggedInCookie = cookies.find(cookie => cookie.name === 'logged_in');
    if (!loggedInCookie || loggedInCookie.value !== 'yes') {
      Logger.info('🔑 Not logged in, proceeding to login');

        const selector = 'a[href="/login"]';
        Logger.info(`🔑 Waiting for selector: ${selector}`);      
        // Check if the login button is visible
        const loginButton = await page.waitForSelector(selector);
        if (!loginButton) {
          Logger.error('❌ Login button not found');
          return { success: false, error: 'Login button not found' };
        } else {
          Logger.info('🔑 Login button found');
          const selector = 'body > div.logged-out.env-production.page-responsive.header-overlay.header-overlay-fixed.js-header-overlay-fixed > div.position-relative.header-wrapper.js-header-wrapper > header > div > div.HeaderMenu.js-header-menu.height-fit.position-lg-relative.d-lg-flex.flex-column.flex-auto.top-0 > div > div > div > a';
          await page.click(selector);
          Logger.info('🔑 Login button clicked');
        }
      }
        
        // Wait for the login form to be visible
    //   Logger.info('🔑 Waiting for login form to be visible');
    //   await page.waitForSelector('input[name="login"]', {
    //     visible: true,
    //     timeout: 2500
    //   });

    //   await page.waitForSelector('input[name="password"]', {
    //     visible: true,
    //     timeout: 2500
    //   });

    //   // await PuppeteerExtends.waitForSelector(page, 'input[name="login"]');
    //   // await PuppeteerExtends.waitForSelector(page, 'input[name="password"]');
    //   Logger.info('🔑 Login form visible');
      
    //   // Fill in the username and password
    //   Logger.info('🔑 Filling in login credentials');
    //   await page.type('input[name="login"]', 'your_username'); // Replace with your GitHub username
    //   await page.type('input[name="password"]', 'your_password'); // Replace with your GitHub password
      
    //   // Submit the form
    //   Logger.info('🔑 Submitting login form');
    //   await page.click('input[type="submit"]');    
    //   Logger.info('🔑 Logged in successfully');
    //   // Wait for navigation to the home page
    //   Logger.info('🔑 Waiting for navigation after login');
    //   await PuppeteerExtends.waitForNavigation(page);
    //   Logger.info('🔑 Home page loaded');
    // }
    
    // // Wait for the profile icon to be visible
    // Logger.info('🔑 Waiting for profile icon to be visible');
    // // await PuppeteerExtends.waitForSelector(page, 'img.avatar');
    // await page.waitForSelector('img.avatar', {
    //   visible: true,
    //   timeout: 5000
    // });
    // Logger.info('🔑 Profile icon visible');

    // // Extract session data
    // Logger.info('🔑 Extracting session data');
    // await sessionPlugin.getSessionManager().extractSession(page);
    
    // // Wait for a while to ensure session is established
    // Logger.info('🔑 Waiting for session to stabilize');
    // await sleep(5);
    // Logger.info('🔑 Session stabilized');

    // // Retrieve session data
    // Logger.info('🔑 Retrieving session data');
    // const sessionData = sessionPlugin.getSessionManager().getSessionData();
    
    // if (sessionData) {
    //   Logger.info('🔑 Session data available');
    //   console.debug(sessionData);
    // } else {
    //   Logger.error('❌ No session data available');
    // }

    // // Navigate to another page to verify session
    // Logger.info('🔑 Navigating to another page to verify session');

    await page.goto('https://github.com/devalexanderdaza/puppeteer-extends');
    Logger.info('🔑 Page loaded successfully');
    // const about = await page.waitForSelector('#repo-content-pjax-container > div > div > div > div.Layout-sidebar > div > div:nth-child(1) > div > div > p', {
    //   visible: true,
    //   timeout: 5000
    // });
    // if (about) {
    //   Logger.info(`🔑 About visible: ${await about.evaluate(el => el.textContent)}`);
    // } else {
    //   Logger.error('❌ About not visible');
    // }
    // Logger.info('🔑 Session verification successful');

    // Take a screenshot of the page
    Logger.info('📸 Taking screenshot of the page');
    page.screenshot({ path: join(__dirname, 'screenshot.png'), fullPage: true });
    Logger.info('📸 Screenshot saved');
    
    // Cleanup
    Logger.info('🧹 Cleaning up resources');
    await PuppeteerExtends.closePage(page);
    await PuppeteerExtends.closeAllBrowsers();
    
    return { success: true };
  } catch (error) {
    Logger.error('❌ Error occurred during session management example', error instanceof Error ? error : String(error));
    return { success: false, error };
  }
}

// Run the example
runSessionExample()
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