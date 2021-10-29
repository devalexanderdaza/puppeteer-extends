/**
 * @since 1.0.0
 */
import puppeteer from "puppeteer";
interface IOptions {
    isHeadless?: boolean | undefined;
    isDebug?: boolean | undefined;
}
/**
 * Returns the instance of a Puppeteer browser.
 * @ignore
 */
export declare const getBrowser: (options: IOptions) => Promise<puppeteer.Browser | undefined>;
/**
 * Go to that page using puppeteer.
 * @ignore
 */
export declare const goto: (page: puppeteer.Page, targetUrl: string, options?: {
    waitUntil: string[];
    isDebug: boolean;
    timeout: number;
}) => Promise<boolean>;
/**
 * Makes cookies look real.
 * @ignore
 */
export declare const getImitationCookie: (url: any) => Promise<unknown>;
export {};
