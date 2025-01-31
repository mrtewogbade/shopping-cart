//All auth routes will go in here
import express from "express";
import validate from "../middleware/validateZod";
import { CreateOtpSchema, loginSchema,  twoFASchema, registerSchema, verifyEmailOtpSchema, verifyOtpSchema } from "../validations/authValidation";
import { registerHandler,  loginHandler,  logOutHandler, GetTokenDetailsHandler, refreshAccessTokenHandler, verifyEmailHandler, ChangePasswordHandler, ResetPasswordHandler, ResetPasswordOtpHandler, GoogleOauthLoginHandler, GoogleOauthRegisterHandler } from '../controllers/auth.controller';
import passport from 'passport';
import VerifyAccessToken, { VerifyTrackingToken } from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";



const router = express.Router();

router.post("/register", Limiter, validate(registerSchema), registerHandler)
router.patch("/verify-email", Limiter, validate(verifyEmailOtpSchema),verifyEmailHandler)
router.patch("/sign-in", Limiter, validate(loginSchema), loginHandler);
router.put("/logout",  logOutHandler)
router.get("/confirm-access-token", Limiter, VerifyAccessToken, GetTokenDetailsHandler)
router.get("/refresh-access-token", Limiter, refreshAccessTokenHandler);
router.patch("/create-reset-password", Limiter, ChangePasswordHandler)
router.patch("/verify-password-otp", ResetPasswordOtpHandler)
router.patch("/reset-password", VerifyTrackingToken, ResetPasswordHandler)



export default router;