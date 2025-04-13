"use strict";
/**
 * @since 1.7.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaType = void 0;
/**
 * Types of captchas supported
 */
var CaptchaType;
(function (CaptchaType) {
    CaptchaType["RECAPTCHA_V2"] = "recaptcha_v2";
    CaptchaType["RECAPTCHA_V3"] = "recaptcha_v3";
    CaptchaType["HCAPTCHA"] = "hcaptcha";
    CaptchaType["IMAGE_CAPTCHA"] = "image_captcha";
    CaptchaType["FUNCAPTCHA"] = "funcaptcha";
    CaptchaType["TURNSTILE"] = "turnstile";
})(CaptchaType || (exports.CaptchaType = CaptchaType = {}));
//# sourceMappingURL=interfaces.js.map