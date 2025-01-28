"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankCode = exports.fetchBankCodes = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchBankCodes = async () => {
    try {
        const response = await axios_1.default.get('https://api.paystack.co/bank', {
            headers: { Authorization: `Bearer ${process.env.Arrenah_PAYSTACK_SECRET_KEY}` },
        });
        if (response.data.status) {
            return response.data.data;
        }
        else {
            throw new Error('Failed to fetch bank list');
        }
    }
    catch (error) {
        throw new Error(error.message || 'Error fetching bank codes');
    }
};
exports.fetchBankCodes = fetchBankCodes;
const getBankCode = async (bankName) => {
    const banks = await (0, exports.fetchBankCodes)();
    const normalizedBankName = bankName.trim().toLowerCase();
    const bank = banks.find((b) => b.name.toLowerCase() === normalizedBankName);
    if (!bank) {
        throw new Error(`Bank name "${bankName}" not recognized`);
    }
    return bank.code;
};
exports.getBankCode = getBankCode;
