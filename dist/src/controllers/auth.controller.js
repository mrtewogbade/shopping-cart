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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOauthRegisterHandler = exports.GoogleOauthLoginHandler = exports.ResetPasswordHandler = exports.ResetPasswordOtpHandler = exports.ChangePasswordHandler = exports.GetTokenDetailsHandler = exports.refreshAccessTokenHandler = exports.logOutHandler = exports.loginHandler = exports.verifyEmailHandler = exports.fetchStorePinHandler = exports.registerHandler = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const AppResponse_1 = __importDefault(require("../helpers/AppResponse"));
const user_model_1 = require("../models/user.model");
const AppError_1 = __importDefault(require("../errors/AppError"));
const GenerateToken_1 = require("../helpers/GenerateToken");
const otp_model_1 = __importDefault(require("../models/otp.model"));
const serviceUrl_1 = require("../serviceUrl");
const GenerateRandomId_1 = require("../helpers/GenerateRandomId");
const nodemailer_config_1 = __importDefault(require("../config/nodemailer.config"));
//Only two not done are the createOtp and the verifyOtp
exports.registerHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, name, email, password } = req.body;
    const userExists = yield user_model_1.User.findOne({ email });
    if (userExists) {
        return next(new AppError_1.default("User already exists", 400));
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    let user;
    if (role == "seller") {
        user = new user_model_1.Seller({
            name,
            email,
            role,
            password: hashedPassword,
            store: undefined,
        });
    }
    else if (role == "buyer") {
        user = new user_model_1.Buyer({
            name,
            email,
            role,
            password: hashedPassword,
        });
    }
    if (user == undefined) {
        return next(new AppError_1.default("Users should either be buyers or sellers", 400));
    }
    const firstName = name.split(" ")[0];
    const otpCode = (0, GenerateRandomId_1.generateRandomAlphanumeric)();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const mailOptions = {
        email,
        subject: "Verify Your Email Address",
        templateName: "verifyEmail",
        context: {
            name: firstName,
            otpCode,
        },
    };
    yield user.save();
    const maxRetries = 3;
    let attempts = 0;
    let emailSent = false;
    while (attempts < maxRetries && !emailSent) {
        try {
            yield (0, nodemailer_config_1.default)(mailOptions);
            emailSent = true;
        }
        catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);
            if (attempts >= maxRetries) {
                console.log(`Failed to send email to ${email} after ${maxRetries} attempts.`);
            }
        }
    }
    const account = {
        name,
        email,
        role,
    };
    return (0, AppResponse_1.default)(res, "Registration successful, please check email to verify user.", 201, account);
}));
exports.fetchStorePinHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pinId = yield otp_model_1.default.find();
    return (0, AppResponse_1.default)(res, "Store ID fetch Successfully.", 201, pinId);
}));
exports.verifyEmailHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, email } = req.body;
    const findUser = yield user_model_1.User.findOne({ email });
    const userDate = findUser === null || findUser === void 0 ? void 0 : findUser.otpExpires;
    const dateToCheck = new Date(userDate);
    const now = new Date();
    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (findUser.otp === otp) {
        if (findUser.isEmailVerified == true) {
            return next(new AppError_1.default("This user has already verified their account. ", 400));
        }
        //This Checks if the otp was sent 24 hours ago
        if (dateToCheck < twentyFourHoursAgo) {
            return next(new AppError_1.default("This OTP has expired. Please request a new one. ", 400));
        }
        else {
            findUser.isEmailVerified = true;
            findUser.otp = "";
            findUser.otpExpires = "";
            yield findUser.save();
            return (0, AppResponse_1.default)(res, "User verification successful.", 200, null);
        }
    }
    return next(new AppError_1.default("This is an invalid OTP", 400));
}));
exports.loginHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const isMobile = req.headers.mobilereqsender;
    const { phone_or_email, password } = req.body;
    // const user = await User.findOne({ email });
    const user = yield user_model_1.User.findOne({
        $or: [{ email: phone_or_email }, { phone_number: phone_or_email }],
    });
    if (!user)
        return next(new AppError_1.default("User not found", 404));
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        return next(new AppError_1.default("Invalid credentials", 401));
    if (!user.isEmailVerified)
        return next(new AppError_1.default("Please verify your email before log in.", 401));
    if (user.is_two_factor_enabled) {
        //We should send a token here to track that okay, this person has had their password stuff done
        const two_fa_track = {
            id: user._id,
            createdAt: Date.now(),
        };
        const two_fa_token = (0, GenerateToken_1.GenerateTrackingToken)(two_fa_track);
        return (0, AppResponse_1.default)(res, "Please check your Authenticator app for your token.", 200, two_fa_token);
    }
    const account = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        profile_image: user.imageUrl
    };
    yield user_model_1.User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const accessToken = (0, GenerateToken_1.GenerateAccessToken)(account);
    const refreshToken = (0, GenerateToken_1.GenerateRefreshToken)(account);
    //If it is mobile we send token in response
    if (isMobile)
        return (0, AppResponse_1.default)(res, "Login successful", 200, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            account,
        });
    res.cookie("e_access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
        priority: "high",
        signed: true,
        maxAge: 60 * 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });
    res.cookie("e_refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
        signed: true,
        priority: "high",
        maxAge: 60 * 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });
    return (0, AppResponse_1.default)(res, "Login successful", 200, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        account,
    });
}));
exports.logOutHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //If Web
    res.clearCookie("e_access_token");
    res.clearCookie("e_refresh_token");
    //If mobile, just tell them to delete on their storage
    //   await addTokenToBlacklist(token);
    return (0, AppResponse_1.default)(res, "User has Log out successfully", 200, null);
}));
//Completed
exports.refreshAccessTokenHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        return next(new AppError_1.default("No authorization header provided", 401));
    }
    const refreshToken = req.headers.authorization.split(" ")[1];
    if (!refreshToken)
        return next(new AppError_1.default("No refresh token provided", 401));
    jsonwebtoken_1.default.verify(refreshToken, serviceUrl_1.RefreshToken_Secret_Key, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (err)
            return next(new AppError_1.default("Incorrect or expired refresh token, please log in.", 401));
        const id = decoded.payload.id;
        const findUser = yield user_model_1.User.findById(id).select("-password");
        if (!findUser)
            return next(new AppError_1.default("Access token not created, only users can create them.", 400));
        const account = {
            id: findUser._id,
            name: findUser.name,
            email: findUser.email,
            role: findUser.role,
        };
        const accessToken = (0, GenerateToken_1.GenerateAccessToken)(account);
        return (0, AppResponse_1.default)(res, "Token refreshed succesfully.", 200, {
            token: accessToken,
            account,
        });
    }));
}));
//Completed
exports.GetTokenDetailsHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Logic for refreshing the access Token goes here
    const id = req.user.id;
    const findUser = yield user_model_1.User.findById(id);
    if (!findUser)
        return next(new AppError_1.default("Invalid user, please go off.", 400));
    const account = {
        id: findUser._id,
        name: findUser.name,
        email: findUser.email,
        role: findUser.role,
    };
    return (0, AppResponse_1.default)(res, "Successfully verified the token", 200, account);
}));
exports.ChangePasswordHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const findUser = yield user_model_1.User.findOne({ email });
    if (!findUser)
        return next(new AppError_1.default("User not found.", 404));
    if (!findUser.isEmailVerified)
        return next(new AppError_1.default("This is an unverified email, please contact the admin.", 404));
    const firstName = findUser.name.split(" ")[0];
    const otpCode = (0, GenerateRandomId_1.generateRandomAlphanumeric)();
    findUser.otp = otpCode;
    findUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    const mailOptions = {
        email,
        subject: "Confirm Your OTP",
        // The name of the Handlebars template file without the extension
        templateName: "resetPassword",
        context: {
            name: firstName,
            otpCode,
        },
    };
    yield findUser.save();
    try {
        yield (0, nodemailer_config_1.default)(mailOptions);
    }
    catch (error) {
        console.error(error);
        console.log(`Error occured sending email to ${email}`);
    }
    return (0, AppResponse_1.default)(res, "An OTP has been sent to your email. ", 200, email);
}));
exports.ResetPasswordOtpHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, email } = req.body;
    const findUser = yield user_model_1.User.findOne({ email });
    const userDate = findUser === null || findUser === void 0 ? void 0 : findUser.otpExpires;
    const dateToCheck = new Date(userDate);
    const now = new Date();
    // Calculate the date 24 hours ago
    const fiftyMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
    if (findUser.otp !== otp) {
        return next(new AppError_1.default("This is an invalid OTP", 400));
    }
    //This Checks if the otp was sent 24 hours ago
    if (dateToCheck < fiftyMinsAgo) {
        return next(new AppError_1.default("This OTP has expired. Please request a new one. ", 400));
    }
    else {
        const token = (0, GenerateToken_1.GenerateTrackingToken)({ email, id: findUser._id });
        findUser.otp = "";
        findUser.otpExpires = "";
        yield findUser.save();
        return (0, AppResponse_1.default)(res, "You can now reset your password.", 200, {
            token,
        });
    }
}));
exports.ResetPasswordHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    // const id = req.user?.id;
    const id = req.user.id;
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(id, { $set: { password: password } }, { new: true });
    if (!updatedUser)
        return next(new AppError_1.default("This user does not exist", 404));
    return (0, AppResponse_1.default)(res, "You have succesfully reset your password.", 200, null);
}));
exports.GoogleOauthLoginHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if ((user === null || user === void 0 ? void 0 : user.status) === "fail") {
        return next(new AppError_1.default("This user does not exist", 404));
    }
    const account = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, GenerateToken_1.GenerateAccessToken)(account);
    const refreshToken = (0, GenerateToken_1.GenerateRefreshToken)(account);
    //If it is mobile we send token in response
    return (0, AppResponse_1.default)(res, "Login successful", 200, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        account,
    });
}));
exports.GoogleOauthRegisterHandler = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = req.user;
    const role = req.body.role;
    let user = yield user_model_1.User.findOne({ googleId: profile.id });
    if (user) {
        return next(new AppError_1.default("User already exists", 400));
    }
    if (role == "seller") {
        user = new user_model_1.Seller({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role,
            store: undefined,
        });
    }
    else if (role == "buyer") {
        user = new user_model_1.Buyer({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role,
        });
    }
    if (user == undefined)
        return next(new AppError_1.default("Users should either be buyers or sellers", 400));
    const firstName = profile.displayName.split(" ")[0];
    const otpCode = (0, GenerateRandomId_1.generateRandomAlphanumeric)();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const mailOptions = {
        email: profile.emails[0].value,
        subject: "Verify Your Email Address",
        // The name of the Handlebars template file without the extension
        templateName: "verifyEmail",
        context: {
            name: firstName,
            otpCode,
        },
    };
    yield user.save();
    try {
        yield (0, nodemailer_config_1.default)(mailOptions);
    }
    catch (error) {
        console.error(error);
        console.log(`Error occured sending email to ${user.email}`);
    }
    const account = {
        name: user.name,
        email: user.email,
        role: role,
    };
    //Email will be sent to the user
    return (0, AppResponse_1.default)(res, " Registration successfull, please check email to verify user.", 201, account);
}));
