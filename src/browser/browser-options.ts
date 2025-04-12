/**
 * Browser configuration options
 * @since 2.0.0
 */
export interface BrowserOptions {
  /**
   * Launch browser in headless mode
   * @default true
   */
  isHeadless?: boolean;

  /**
   * Enable debug logging
   * @default false
   */
  isDebug?: boolean;

  /**
   * Custom browser launch arguments
   */
  customArguments?: string[];

  /**
   * Path to user data directory
   */
  userDataDir?: string;

  /**
   * Browser instance identifier
   * @default "default"
   */
  instanceId?: string;
}

/**
 * Default browser arguments
 */
export const DEFAULT_BROWSER_ARGS: string[] = [
  "--no-sandbox",
  "--disable-web-security",
  "--disable-setuid-sandbox",
  "--aggressive-cache-discard",
  "--disable-cache",
  "--disable-infobars",
  "--disable-application-cache",
  "--window-position=0,0",
  "--disable-offline-load-stale-cache",
  "--disk-cache-size=0",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-sync",
  "--disable-translate",
  "--hide-scrollbars",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-first-run",
  "--safebrowsing-disable-auto-update",
  "--ignore-certificate-errors",
  "--ignore-ssl-errors",
  "--ignore-certificate-errors-spki-list",
];
