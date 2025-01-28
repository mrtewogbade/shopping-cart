"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const serviceUrl_1 = require("../serviceUrl");
var request = require('request');
const verifyOtp = async (pinId, pin) => {
    console.log(pin);
    if (!serviceUrl_1.Termii_BASE_URL || !serviceUrl_1.TERMII_API_KEY)
        return { status: "fail", message: "Failed to verify OTP" };
    try {
        const response = await axios_1.default.post(`${serviceUrl_1.Termii_BASE_URL}/api/sms/otp/verify`, {
            "api_key": serviceUrl_1.TERMII_API_KEY,
            "pin_id": pinId,
            "pin": pin
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error("Error verifying OTP:", error.response.data);
        }
        else {
            console.error("Error verifying OTP:", error.message);
        }
        return { status: "fail", message: "Failed to verify OTP" };
        throw new Error("Failed to send OTP");
    }
};
exports.default = verifyOtp;
