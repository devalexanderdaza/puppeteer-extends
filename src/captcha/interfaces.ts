/**
 * @since 1.7.0
 */

/**
 * Types of captchas supported
 */
export enum CaptchaType {
    RECAPTCHA_V2 = "recaptcha_v2",
    RECAPTCHA_V3 = "recaptcha_v3",
    HCAPTCHA = "hcaptcha",
    IMAGE_CAPTCHA = "image_captcha",
    FUNCAPTCHA = "funcaptcha",
    TURNSTILE = "turnstile",
  }
  
  /**
   * Result of captcha solving
   */
  export interface CaptchaSolution {
    /**
     * Solved token or text
     */
    token: string;
    
    /**
     * Optional ID from the captcha service
     */
    id?: string;
    
    /**
     * When the solution will expire
     */
    expiration?: Date;
  }
  
  /**
   * Options for recaptcha v2
   */
  export interface RecaptchaV2Options {
    /**
     * Website URL
     */
    url: string;
    
    /**
     * Google site key
     */
    sitekey: string;
    
    /**
     * Optional data-s parameter
     */
    s?: string;
    
    /**
     * Is this an invisible recaptcha?
     */
    invisible?: boolean;
    
    /**
     * Enterprise recaptcha?
     */
    enterprise?: boolean;
  }
  
  /**
   * Options for recaptcha v3
   */
  export interface RecaptchaV3Options {
    /**
     * Website URL
     */
    url: string;
    
    /**
     * Google site key
     */
    sitekey: string;
    
    /**
     * Action parameter
     */
    action: string;
    
    /**
     * Minimum score (0.0 - 1.0)
     */
    score?: number;
    
    /**
     * Enterprise recaptcha?
     */
    enterprise?: boolean;
  }
  
  /**
   * Options for hCaptcha
   */
  export interface HCaptchaOptions {
    /**
     * Website URL
     */
    url: string;
    
    /**
     * Site key
     */
    sitekey: string;
    
    /**
     * Enterprise hCaptcha?
     */
    enterprise?: boolean;
  }
  
  /**
   * Options for image captcha
   */
  export interface ImageCaptchaOptions {
    /**
     * Base64 encoded image or URL to image
     */
    image: string;
    
    /**
     * Is this a case sensitive captcha?
     */
    caseSensitive?: boolean;
    
    /**
     * Type of characters to recognize (numbers, letters, etc)
     */
    charType?: string;
    
    /**
     * Length of the captcha
     */
    length?: number;
  }
  
  /**
   * Options for FunCaptcha/Arkose Labs
   */
  export interface FunCaptchaOptions {
    /**
     * Website URL
     */
    url: string;
    
    /**
     * Public key
     */
    publicKey: string;
    
    /**
     * Data (service URLs etc)
     */
    data?: Record<string, string>;
  }
  
  /**
   * Options for Cloudflare Turnstile
   */
  export interface TurnstileOptions {
    /**
     * Website URL
     */
    url: string;
    
    /**
     * Site key
     */
    sitekey: string;
    
    /**
     * Action parameter (similar to recaptcha v3)
     */
    action?: string;
  }
  
  /**
   * Generic options container for all captcha types
   */
  export type CaptchaOptions = 
    | { type: CaptchaType.RECAPTCHA_V2; options: RecaptchaV2Options }
    | { type: CaptchaType.RECAPTCHA_V3; options: RecaptchaV3Options }
    | { type: CaptchaType.HCAPTCHA; options: HCaptchaOptions }
    | { type: CaptchaType.IMAGE_CAPTCHA; options: ImageCaptchaOptions }
    | { type: CaptchaType.FUNCAPTCHA; options: FunCaptchaOptions }
    | { type: CaptchaType.TURNSTILE; options: TurnstileOptions };
  
  /**
   * Interface for captcha solving services
   */
  export interface CaptchaSolver {
    /**
     * Name of the solver
     */
    name: string;
    
    /**
     * Check balance of the account
     */
    getBalance(): Promise<number>;
    
    /**
     * Solve a captcha
     * @param options Options for the captcha to solve
     */
    solveCaptcha(options: CaptchaOptions): Promise<CaptchaSolution>;
    
    /**
     * Report incorrect solution (for refund)
     * @param id ID of the solved captcha
     */
    reportIncorrect(id: string): Promise<boolean>;
  }
  
  /**
   * Configuration for captcha solvers
   */
  export interface CaptchaSolverConfig {
    /**
     * API key for the service
     */
    apiKey: string;
    
    /**
     * Base URL for API
     */
    apiUrl?: string;
    
    /**
     * Default timeout in seconds
     */
    defaultTimeout?: number;
    
    /**
     * Polling interval in ms
     */
    pollingInterval?: number;
  }