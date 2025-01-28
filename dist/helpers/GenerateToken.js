"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateTrackingToken = exports.GenerateRefreshToken = exports.GenerateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const serviceUrl_1 = require("../serviceUrl");
const GenerateAccessToken = (payload) => {
    if (!payload) {
        throw new Error("Payload not provided");
        return;
    }
    if (!serviceUrl_1.AccessToken_Secret_Key) {
        throw new Error("Access token secret key not provided");
        return;
    }
    const token = jsonwebtoken_1.default.sign({ payload }, serviceUrl_1.AccessToken_Secret_Key, {
        expiresIn: "60d",
    });
    return token;
};
exports.GenerateAccessToken = GenerateAccessToken;
const GenerateRefreshToken = (payload) => {
    if (!payload) {
        throw new Error("Payload not provided");
        return;
    }
    if (!serviceUrl_1.RefreshToken_Secret_Key) {
        throw new Error("Refresh token secret key not provided");
        return;
    }
    const token = jsonwebtoken_1.default.sign({ payload }, serviceUrl_1.RefreshToken_Secret_Key, {
        expiresIn: "60d",
    });
    return token;
};
exports.GenerateRefreshToken = GenerateRefreshToken;
const GenerateTrackingToken = (payload) => {
    if (!payload) {
        throw new Error("Payload not provided");
        return;
    }
    if (!serviceUrl_1.Tracking_Token_Secret_Key) {
        throw new Error("Tracking token secret key not provided");
        return;
    }
    const token = jsonwebtoken_1.default.sign({ payload }, serviceUrl_1.Tracking_Token_Secret_Key, {
        expiresIn: "15m",
    });
    return token;
};
exports.GenerateTrackingToken = GenerateTrackingToken;
