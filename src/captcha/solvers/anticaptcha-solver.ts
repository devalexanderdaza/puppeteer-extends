/**
 * @since 1.7.0
 */
import axios from 'axios';
import { 
  CaptchaSolver, 
  CaptchaSolverConfig, 
  CaptchaOptions, 
  CaptchaSolution, 
  CaptchaType 
} from '../interfaces';
import { Logger } from '../../utils/logger';
import { sleep } from '../../utils/common';

/**
 * Implementation for Anti-Captcha service
 * https://anti-captcha.com/
 */
export class AntiCaptchaSolver implements CaptchaSolver {
  name = 'anticaptcha';
  private apiKey: string;
  private apiUrl: string;
  private defaultTimeout: number;
  private pollingInterval: number;
  
  constructor(config: CaptchaSolverConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || 'https://api.anti-captcha.com';
    this.defaultTimeout = config.defaultTimeout || 120;
    this.pollingInterval = config.pollingInterval || 5000;
    
    if (!this.apiKey) {
      throw new Error('Anti-Captcha API key is required');
    }
  }
  
  /**
   * Get account balance
   */
  async getBalance(): Promise<number> {
    try {
      const response = await axios.post(`${this.apiUrl}/getBalance`, {
        clientKey: this.apiKey
      });
      
      if (response.data.errorId === 0) {
        return response.data.balance;
      }
      
      throw new Error(`Failed to get balance: ${response.data.errorDescription}`);
    } catch (error) {
      Logger.error('Error getting Anti-Captcha balance', error instanceof Error ? error : String(error));
      throw error;
    }
  }
  
  /**
   * Solve a captcha
   */
  async solveCaptcha(captchaOpts: CaptchaOptions): Promise<CaptchaSolution> {
    const { type, options } = captchaOpts;
    
    try {
      const taskId = await this.createTask(type, options);
      Logger.debug(`Anti-Captcha task created, ID: ${taskId}`);
      
      const result = await this.waitForResult(taskId);
      return {
        token: result,
        id: taskId.toString(),
        expiration: new Date(Date.now() + 120000) // 2 minutes
      };
    } catch (error) {
      Logger.error(`Error solving captcha with Anti-Captcha`, error instanceof Error ? error : String(error));
      throw error;
    }
  }
  
  /**
   * Report incorrect solution for refund
   */
  async reportIncorrect(id: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.apiUrl}/reportIncorrectImageCaptcha`, {
        clientKey: this.apiKey,
        taskId: parseInt(id, 10)
      });
      
      return response.data.errorId === 0;
    } catch (error) {
      Logger.error('Error reporting incorrect Anti-Captcha solution', error instanceof Error ? error : String(error));
      return false;
    }
  }
  
  /**
   * Create a captcha solving task
   */
  private async createTask(type: CaptchaType, options: any): Promise<number> {
    let task: Record<string, any> = {};
    
    switch (type) {
      case CaptchaType.RECAPTCHA_V2:
        task = {
          type: options.invisible ? 'RecaptchaV2TaskProxyless' : 'NoCaptchaTaskProxyless',
          websiteURL: options.url,
          websiteKey: options.sitekey
        };
        
        if (options.enterprise) {
          task.isEnterprise = true;
        }
        
        if (options.s) {
          task.recaptchaDataSValue = options.s;
        }
        break;
        
      case CaptchaType.RECAPTCHA_V3:
        task = {
          type: 'RecaptchaV3TaskProxyless',
          websiteURL: options.url,
          websiteKey: options.sitekey,
          minScore: options.score || 0.3,
          pageAction: options.action
        };
        
        if (options.enterprise) {
          task.isEnterprise = true;
        }
        break;
        
      case CaptchaType.HCAPTCHA:
        task = {
          type: 'HCaptchaTaskProxyless',
          websiteURL: options.url,
          websiteKey: options.sitekey
        };
        
        if (options.enterprise) {
          task.isEnterprise = true;
        }
        break;
        
      case CaptchaType.IMAGE_CAPTCHA:
        task = {
          type: 'ImageToTextTask'
        };
        
        if (options.image.startsWith('http')) {
          // Download the image first
          const imageResponse = await axios.get(options.image, { responseType: 'arraybuffer' });
          const base64Image = Buffer.from(imageResponse.data).toString('base64');
          task.body = base64Image;
        } else {
          task.body = options.image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        }
        
        if (options.caseSensitive) {
          task.case = true;
        }
        
        if (options.length) {
          task.length = options.length;
        }
        break;
        
      case CaptchaType.FUNCAPTCHA:
        task = {
          type: 'FunCaptchaTaskProxyless',
          websiteURL: options.url,
          websitePublicKey: options.publicKey
        };
        
        if (options.data) {
          task.funcaptchaApiJSSubdomain = options.data.subdomain;
          
          if (options.data.blob) {
            task.data = { blob: options.data.blob };
          }
        }
        break;
        
      case CaptchaType.TURNSTILE:
        task = {
          type: 'TurnstileTaskProxyless',
          websiteURL: options.url,
          websiteKey: options.sitekey
        };
        
        if (options.action) {
          task.action = options.action;
        }
        break;
        
      default:
        throw new Error(`Unsupported captcha type: ${type}`);
    }
    
    const response = await axios.post(`${this.apiUrl}/createTask`, {
      clientKey: this.apiKey,
      task
    });
    
    if (response.data.errorId === 0) {
      return response.data.taskId;
    }
    
    throw new Error(`Failed to create task: ${response.data.errorDescription}`);
  }
  
  /**
   * Wait for the result of a captcha task
   */
  private async waitForResult(taskId: number): Promise<string> {
    const startTime = Date.now();
    const timeoutMs = this.defaultTimeout * 1000;
    
    while (Date.now() - startTime < timeoutMs) {
      await sleep(this.pollingInterval / 1000);
      
      const response = await axios.post(`${this.apiUrl}/getTaskResult`, {
        clientKey: this.apiKey,
        taskId
      });
      
      if (response.data.errorId !== 0) {
        throw new Error(`Failed to get result: ${response.data.errorDescription}`);
      }
      
      if (response.data.status === 'ready') {
        if (response.data.solution) {
          if (response.data.solution.gRecaptchaResponse) {
            return response.data.solution.gRecaptchaResponse;
          } else if (response.data.solution.token) {
            return response.data.solution.token;
          } else if (response.data.solution.text) {
            return response.data.solution.text;
          }
        }
        
        throw new Error('Solution format not recognized');
      }
    }
    
    throw new Error(`Timeout waiting for captcha solution (${this.defaultTimeout}s)`);
  }
}