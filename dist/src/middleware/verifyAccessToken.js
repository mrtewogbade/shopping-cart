"use strict";
//This middleware will verify the accessToken on every request made to the server
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
exports.VerifyTrackingToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const serviceUrl_1 = require("../serviceUrl");
const user_model_1 = require("../models/user.model");
const VerifyAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        if (!req.headers.authorization) {
            return next(new AppError_1.default("No authorization header provided", 401));
        }
        token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return next(new AppError_1.default("No access token provided", 401));
        }
        // Convert callback-style to Promise-style for better error handling
        const decoded = yield new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, serviceUrl_1.AccessToken_Secret_Key, (err, decoded) => {
                if (err)
                    reject(err);
                resolve(decoded);
            });
        });
        const user = yield user_model_1.User.findById(decoded.payload.id).select("-password");
        if (!user) {
            return next(new AppError_1.default("User does not exist or account has been deleted.", 404));
        }
        // Attach the full user object to the request instead of just the payload
        req.user = user;
        // console.log('Auth Header:', req.headers.authorization);
        // console.log('User attached to request:', req.user);  // Debug log
        next();
    }
    catch (error) {
        return next(new AppError_1.default("Incorrect or expired access token, please log in.", 401));
    }
});
exports.default = VerifyAccessToken;
const VerifyTrackingToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        return next(new AppError_1.default("No authorization header provided", 401));
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token)
        return next(new AppError_1.default("No tracking token provided", 401));
    jsonwebtoken_1.default.verify(token, serviceUrl_1.Tracking_Token_Secret_Key, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return next(new AppError_1.default("Incorrect or expired tracking token, please log in.", 401));
        }
        const user = yield user_model_1.User.findById(decoded.payload.id).select("-password");
        if (!user)
            return next(new AppError_1.default("User does not exist or account has been deleted.", 404));
        req.user = decoded.payload;
        next();
    }));
});
exports.VerifyTrackingToken = VerifyTrackingToken;
