/**
 * @since 1.0.0
 */
import puppeteer, { Browser, Page } from "puppeteer";
/**
 * Browser initializer options interface
 */
interface IOptions {
    isHeadless?: boolean | undefined;
    isDebug?: boolean | undefined;
    customArguments?: string[] | undefined;
    userDataDir?: string;
}
/**
 * Returns the instance of a Puppeteer browser.
 * @ignore
 */
export declare const getBrowser: (options: IOptions) => Promise<Browser | undefined>;
/**
 * Go to that page using puppeteer.
 * @since 1.0.0
 */
export declare const goto: (page: puppeteer.Page, targetUrl: string, options?: {
    waitUntil: string[];
    isDebug: boolean;
    timeout: number;
}) => Promise<boolean>;
/**
 * Close page, not browser
 * @since 1.4.0
 * @param page
 */
export declare const closePage: (page: puppeteer.Page) => void;
/**
 * Close browser and all pages
 * @since 1.4.0
 * @param browser
 */
export declare const closeBrowser: (browser: Browser) => void;
/**
 * Makes cookies look real.
 * @ignore
 */
export declare const getImitationCookie: (url: any) => Promise<unknown>;
export {};
