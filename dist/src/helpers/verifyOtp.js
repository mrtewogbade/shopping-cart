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
const axios_1 = __importDefault(require("axios"));
const serviceUrl_1 = require("../serviceUrl");
var request = require('request');
const verifyOtp = (pinId, pin) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(pin);
    if (!serviceUrl_1.Termii_BASE_URL || !serviceUrl_1.TERMII_API_KEY)
        return { status: "fail", message: "Failed to verify OTP" };
    try {
        const response = yield axios_1.default.post(`${serviceUrl_1.Termii_BASE_URL}/api/sms/otp/verify`, {
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
});
exports.default = verifyOtp;
