//All auth routes will go in here
import express from "express";
import validate from "../middleware/validateZod";
import { CreateOtpSchema, loginSchema,  twoFASchema, registerSchema, verifyEmailOtpSchema, verifyOtpSchema } from "../validations/authValidation";
import { registerHandler, verifyOtpHandler, loginHandler, LoginViaTwoFactor, ToggleTwoFactor, logOutHandler, GetTokenDetailsHandler, refreshAccessTokenHandler, CreateOtpHandler, verifyEmailHandler, fetchStorePinHandler, ChangePasswordHandler, ResetPasswordHandler, ResetPasswordOtpHandler, GoogleOauthLoginHandler, GoogleOauthRegisterHandler } from '../controllers/auth.controller';
import passport from 'passport';
import VerifyAccessToken, { VerifyTrackingToken } from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";



const router = express.Router();

router.post("/register", Limiter, validate(registerSchema), registerHandler)
router.patch("/verify-email", Limiter, validate(verifyEmailOtpSchema),verifyEmailHandler)
router.patch("/sign-in", Limiter, validate(loginSchema), loginHandler);
router.put("/enable-2fa", VerifyAccessToken, ToggleTwoFactor)
router.patch("/2fa", VerifyTrackingToken, validate(twoFASchema), LoginViaTwoFactor)
router.post("/create-otp", Limiter, VerifyAccessToken, validate(CreateOtpSchema), CreateOtpHandler)
router.patch("/verify-otp",Limiter, VerifyAccessToken, validate(verifyOtpSchema) , verifyOtpHandler);
router.get("/fetch-pins", fetchStorePinHandler)
router.put("/logout",  logOutHandler)
router.get("/confirm-access-token", Limiter, VerifyAccessToken, GetTokenDetailsHandler)
router.get("/refresh-access-token", Limiter, refreshAccessTokenHandler);
router.patch("/create-reset-password", Limiter, ChangePasswordHandler)
router.patch("/verify-password-otp", ResetPasswordOtpHandler)
router.patch("/reset-password", VerifyTrackingToken, ResetPasswordHandler)


// // Google OAuth Routes
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
//     res.redirect('/');
// });


// Google Login Route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Login Callback
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), GoogleOauthLoginHandler);
// Google Register Callback
router.post('/auth/google/signup', passport.authenticate('google-token', { session: false }), GoogleOauthRegisterHandler);

export default router;