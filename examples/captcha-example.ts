import { PuppeteerExtends, Logger, CaptchaService } from '../src';
import { CaptchaPlugin } from '../src/plugins/built-in/captcha-plugin';
import { join } from 'path';

// Configure logger
Logger.configure(join(__dirname, 'logs'));

async function runCaptchaExample() {
  try {
    Logger.info('🚀 Starting captcha handling example');
    
    // Setup environment variable for API key
    const apiKey = process.env.CAPTCHA_API_KEY;
    if (!apiKey) {
      Logger.error('⚠️ CAPTCHA_API_KEY environment variable not set. Please set it to run this example.');
      return { success: false };
    }
    
    // Register captcha plugin
    const captchaPlugin = new CaptchaPlugin({
      service: CaptchaService.TWOCAPTCHA, // or CaptchaService.ANTICAPTCHA
      apiKey: apiKey,
      autoDetect: true,
      autoSolve: true
    });
    
    await PuppeteerExtends.registerPlugin(captchaPlugin);
    Logger.info('🧩 Captcha plugin registered');
    
    // Get balance
    const balance = await captchaPlugin.getBalance();
    Logger.info(`💰 Captcha service balance: ${balance}`);
    
    // Get browser with plugin applied
    const browser = await PuppeteerExtends.getBrowser({
      isHeadless: false,
      isDebug: true
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Navigate to a site with captcha (for demo purposes)
    Logger.info('📡 Navigating to a demo recaptcha page');
    await PuppeteerExtends.goto(page, 'https://www.google.com/recaptcha/api2/demo', {
      maxRetries: 2,
      isDebug: true
    });
    
    // The plugin should automatically detect and attempt to solve any captchas

    // Manual detection example
    Logger.info('🔍 Manually detecting captchas on page');
    const captchaHelper = captchaPlugin.getCaptchaHelper();
    const captchas = await captchaHelper.detectCaptchas(page);
    
    Logger.info(`📊 Detected captchas:
      - reCAPTCHA v2: ${captchas.recaptchaV2?.length ?? 0}
      - reCAPTCHA v3: ${captchas.recaptchaV3?.length ?? 0}
      - hCaptcha: ${captchas.hcaptcha?.length ?? 0}
      - FunCaptcha: ${captchas.funcaptcha?.length ?? 0}
      - Turnstile: ${captchas.turnstile?.length ?? 0}
    `);
    
    // Manual solving example for reCAPTCHA v2
    if (captchas.recaptchaV2?.length ?? 0 > 0) {
      Logger.info('🔑 Manually solving a reCAPTCHA v2');
      
      const recaptcha = captchas.recaptchaV2![0];
      const solution = await captchaHelper.solveRecaptchaV2(page, recaptcha);
      
      Logger.info(`✅ Solved reCAPTCHA v2, solution ID: ${solution.id}`);
      
      // Submit the form (for this demo site)
      try {
        await page.click('input#recaptcha-demo-submit');
        Logger.info('📝 Submitted form after solving captcha');
        
        // Wait for success page
        await page.waitForSelector('body', { timeout: 5000 });
        await page.screenshot({
          path: join(__dirname, 'captcha-success.png'),
          fullPage: false
        });
      } catch (error) {
        Logger.error('❌ Error submitting form', error instanceof Error ? error : String(error));
      }
    }
    
    // Cleanup
    Logger.info('🧹 Cleaning up resources');
    await PuppeteerExtends.closePage(page);
    await PuppeteerExtends.closeAllBrowsers();
    
    return { success: true };
  } catch (error) {
    Logger.error('❌ Error in example', error instanceof Error ? error : String(error));
    await PuppeteerExtends.closeAllBrowsers();
    return { success: false, error };
  }
}

// Run the example
runCaptchaExample()
  .then(result => {
    if (result.success) {
      Logger.info('✅ Example completed successfully');
    } else {
      Logger.error('❌ Example failed');
      process.exit(1);
    }
  })
  .catch(err => {
    Logger.error('💥 Unexpected error', err);
    process.exit(1);
  });