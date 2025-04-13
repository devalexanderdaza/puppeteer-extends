/**
 * @since 1.7.0
 */
import { CaptchaSolver, CaptchaSolverConfig } from './interfaces';
import { TwoCaptchaSolver } from './solvers/2captcha-solver';
import { AntiCaptchaSolver } from './solvers/anticaptcha-solver';
import { Logger } from '../utils/logger';

/**
 * Supported captcha solver services
 */
export enum CaptchaService {
  TWOCAPTCHA = '2captcha',
  ANTICAPTCHA = 'anticaptcha'
}

/**
 * Factory for creating captcha solver instances
 */
export class CaptchaSolverFactory {
  private static instances: Map<string, CaptchaSolver> = new Map();
  
  /**
   * Get or create a captcha solver instance
   * @param service Captcha service to use
   * @param config Configuration for the solver
   */
  public static getSolver(service: CaptchaService, config: CaptchaSolverConfig): CaptchaSolver {
    const key = `${service}-${config.apiKey}`;
    
    if (!this.instances.has(key)) {
      let solver: CaptchaSolver;
      
      switch (service) {
        case CaptchaService.TWOCAPTCHA:
          solver = new TwoCaptchaSolver(config);
          break;
          
        case CaptchaService.ANTICAPTCHA:
          solver = new AntiCaptchaSolver(config);
          break;
          
        default:
          throw new Error(`Unsupported captcha service: ${service}`);
      }
      
      this.instances.set(key, solver);
      Logger.debug(`Created captcha solver instance for service: ${service}`);
    }
    
    return this.instances.get(key)!;
  }
  
  /**
   * Clear all solver instances
   */
  public static clearSolvers(): void {
    this.instances.clear();
  }
}