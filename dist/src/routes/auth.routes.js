"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//All auth routes will go in here
const express_1 = __importDefault(require("express"));
const validateZod_1 = __importDefault(require("../middleware/validateZod"));
const authValidation_1 = require("../validations/authValidation");
const auth_controller_1 = require("../controllers/auth.controller");
const passport_1 = __importDefault(require("passport"));
const verifyAccessToken_1 = __importStar(require("../middleware/verifyAccessToken"));
const rateLimit_1 = __importDefault(require("../middleware/rateLimit"));
const router = express_1.default.Router();
router.post("/register", rateLimit_1.default, (0, validateZod_1.default)(authValidation_1.registerSchema), auth_controller_1.registerHandler);
router.patch("/verify-email", rateLimit_1.default, (0, validateZod_1.default)(authValidation_1.verifyEmailOtpSchema), auth_controller_1.verifyEmailHandler);
router.patch("/sign-in", rateLimit_1.default, (0, validateZod_1.default)(authValidation_1.loginSchema), auth_controller_1.loginHandler);
router.put("/logout", auth_controller_1.logOutHandler);
router.get("/confirm-access-token", rateLimit_1.default, verifyAccessToken_1.default, auth_controller_1.GetTokenDetailsHandler);
router.get("/refresh-access-token", rateLimit_1.default, auth_controller_1.refreshAccessTokenHandler);
router.patch("/create-reset-password", rateLimit_1.default, auth_controller_1.ChangePasswordHandler);
router.patch("/verify-password-otp", auth_controller_1.ResetPasswordOtpHandler);
router.patch("/reset-password", verifyAccessToken_1.VerifyTrackingToken, auth_controller_1.ResetPasswordHandler);
// Google Login Route
router.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
// Google Login Callback
router.get('/auth/google/callback', passport_1.default.authenticate('google', { session: false }), auth_controller_1.GoogleOauthLoginHandler);
// Google Register Callback
router.post('/auth/google/signup', passport_1.default.authenticate('google-token', { session: false }), auth_controller_1.GoogleOauthRegisterHandler);
exports.default = router;
