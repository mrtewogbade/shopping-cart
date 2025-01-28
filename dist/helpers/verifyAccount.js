"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransferRecipient = void 0;
const axios_1 = __importDefault(require("axios"));
const verifyAccount = async (accountNumber, bankCode) => {
    try {
        const response = await axios_1.default.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
            headers: {
                Authorization: `Bearer ${process.env.Arrenah_PAYSTACK_SECRET_KEY}`,
            },
        });
        return response.data;
    }
    catch (error) {
        // Handle errors, such as invalid account details or connectivity issues
        return { status: "fail", message: "Bank account verification failed" };
    }
};
exports.default = verifyAccount;
const generateTransferRecipient = async (name, account_number, bank_code) => {
    try {
        const params = {
            type: "nuban",
            name: name,
            account_number: account_number,
            bank_code: bank_code,
            currency: "NGN",
        };
        const response = await axios_1.default.post("https://api.paystack.co/transferrecipient", params, {
            headers: {
                Authorization: `Bearer ${process.env.Arrenah_PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error(error.response?.data || error.message);
        return {
            status: false,
            message: "Could not generate transfer recipient with provided details. Please contact admin.",
        };
    }
};
exports.generateTransferRecipient = generateTransferRecipient;
