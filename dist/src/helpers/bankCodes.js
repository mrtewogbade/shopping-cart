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
exports.getBankCode = exports.fetchBankCodes = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchBankCodes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('https://api.paystack.co/bank', {
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
});
exports.fetchBankCodes = fetchBankCodes;
const getBankCode = (bankName) => __awaiter(void 0, void 0, void 0, function* () {
    const banks = yield (0, exports.fetchBankCodes)();
    const normalizedBankName = bankName.trim().toLowerCase();
    const bank = banks.find((b) => b.name.toLowerCase() === normalizedBankName);
    if (!bank) {
        throw new Error(`Bank name "${bankName}" not recognized`);
    }
    return bank.code;
});
exports.getBankCode = getBankCode;
