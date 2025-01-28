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
exports.generateTransferRecipient = void 0;
const axios_1 = __importDefault(require("axios"));
const verifyAccount = (accountNumber, bankCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
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
});
exports.default = verifyAccount;
const generateTransferRecipient = (name, account_number, bank_code) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const params = {
            type: "nuban",
            name: name,
            account_number: account_number,
            bank_code: bank_code,
            currency: "NGN",
        };
        const response = yield axios_1.default.post("https://api.paystack.co/transferrecipient", params, {
            headers: {
                Authorization: `Bearer ${process.env.Arrenah_PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error(((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return {
            status: false,
            message: "Could not generate transfer recipient with provided details. Please contact admin.",
        };
    }
});
exports.generateTransferRecipient = generateTransferRecipient;
