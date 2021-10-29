"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImitationCookie = exports.goto = exports.getBrowser = void 0;
var puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
var puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
var cloudscraper_1 = __importDefault(require("cloudscraper"));
var logger_1 = require("./logger");
/**
 * Manage browser instances with a singleton.
 */
var browserSingleton;
/**
 * Returns the instance of a Puppeteer browser.
 * @ignore
 */
var getBrowser = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!browserSingleton) return [3 /*break*/, 2];
                return [4 /*yield*/, init(options)];
            case 1:
                // @ts-ignore
                browserSingleton = _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/, browserSingleton];
        }
    });
}); };
exports.getBrowser = getBrowser;
/**
 * Define a puppeteer initializer
 * @ignore
 */
var init = function (_a) {
    var _b = _a.isHeadless, isHeadless = _b === void 0 ? true : _b, _c = _a.isDebug, isDebug = _c === void 0 ? true : _c;
    return __awaiter(void 0, void 0, void 0, function () {
        var args, options, browser, e_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    require("tls").DEFAULT_MIN_VERSION = "TLSv1";
                    if (isDebug) {
                        logger_1.Logger.debug("\uD83D\uDEA7  Initial run in progress...");
                        logger_1.Logger.debug("\uD83D\uDEA7  Starting Headless Chrome...");
                        logger_1.Logger.debug("\uD83D\uDEA7  You can exit with Ctrl+C at any time.\n");
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    args = [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-infobars",
                        "--window-position=0,0",
                        "--ignore-certifcate-errors",
                        "--ignore-certifcate-errors-spki-list",
                    ];
                    options = {
                        args: args,
                        headless: isHeadless,
                        ignoreHTTPSErrors: true,
                        userDataDir: "./tmp",
                    };
                    return [4 /*yield*/, puppeteer_extra_1.default.launch(options)];
                case 2:
                    browser = _d.sent();
                    if (isDebug)
                        logger_1.Logger.debug("\uD83D\uDEA7  Headless Chrome has been started.");
                    // @ts-ignore
                    puppeteer_extra_1.default.setMaxListeners = function () { };
                    // * Apply the stealth plug-in.
                    puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
                    // @ts-ignore
                    return [2 /*return*/, browser];
                case 3:
                    e_1 = _d.sent();
                    if (isDebug) {
                        logger_1.Logger.debug("\uD83D\uDEA7  Error occurred during headless chrome operation.");
                        logger_1.Logger.debug(e_1);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, undefined];
            }
        });
    });
};
/**
 * Go to that page using puppeteer.
 * @ignore
 */
var goto = function (page, targetUrl, options) {
    if (options === void 0) { options = {
        waitUntil: ["load", "networkidle0"],
        isDebug: false,
        timeout: 1,
    }; }
    return __awaiter(void 0, void 0, void 0, function () {
        var hookHeaders_1, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 6]);
                    return [4 /*yield*/, (0, exports.getImitationCookie)(targetUrl)];
                case 1:
                    hookHeaders_1 = _a.sent();
                    return [4 /*yield*/, page.setRequestInterception(true)];
                case 2:
                    _a.sent();
                    // * Anti Cloud Flare
                    page.on("request", function (request) { return request.continue(hookHeaders_1); });
                    return [4 /*yield*/, page.goto(targetUrl, {
                            // @ts-ignore
                            waitUntil: options.waitUntil,
                            timeout: options.timeout,
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    e_2 = _a.sent();
                    if (options.isDebug) {
                        logger_1.Logger.debug("An error occurred while connecting to the page.");
                        logger_1.Logger.debug("After 5 seconds, try accessing the page again.");
                        logger_1.Logger.debug("Page with error: " + targetUrl + "\n");
                    }
                    return [4 /*yield*/, page.waitFor(5000)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.goto = goto;
/**
 * Makes cookies look real.
 * @ignore
 */
var getImitationCookie = function (url) {
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        return cloudscraper_1.default.get(url, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else {
                resolve(response.request.headers);
            }
        });
    });
};
exports.getImitationCookie = getImitationCookie;
//# sourceMappingURL=puppeteer.js.map