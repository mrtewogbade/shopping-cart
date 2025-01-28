"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalRequestSchema = exports.addBankDetailsSchema = exports.editSellerStoreSchema = exports.storeSchema = void 0;
const zod_1 = require("zod");
exports.storeSchema = zod_1.z.object({
    storeName: zod_1.z
        .string({ required_error: "Store name is required" })
        .min(3, "Store name must be atleast 3 characters long"),
    storeLocation: zod_1.z
        .string({ required_error: "Store location is required" })
        .min(3, "Store location must be atleast 3 characters long"),
    storeCategory: zod_1.z.array(zod_1.z.string()),
    storeDescription: zod_1.z
        .string({ required_error: "Store description is required" })
        .min(10, "Store description must be atleast 3 characters long"),
    // storeImage:z.string().optional(),
    storeAvailability: zod_1.z.date().optional(),
});
exports.editSellerStoreSchema = zod_1.z.object({
    storeName: zod_1.z.string().min(3, "Store name cannot be empty").optional(),
    storeLocation: zod_1.z.string().min(1, "Store location cannot be empty").optional(),
    storeCategory: zod_1.z.array(zod_1.z.string()).optional(),
    storeDescription: zod_1.z
        .string()
        .min(1, "Store description cannot be empty")
        .optional(),
});
exports.addBankDetailsSchema = zod_1.z.object({
    bank_name: zod_1.z
        .string({ required_error: "Bank name is required" })
        .min(3, "Bank name must be atleast 3 characters long"),
    account_number: zod_1.z
        .string({ required_error: "Account number is required" })
        .min(5, "Account number must be atleast 5 characters long"),
});
exports.withdrawalRequestSchema = zod_1.z.object({
    amount: zod_1.z
        .string({ required_error: "Withdrawal amount is required" })
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val) && val > 0, {
        message: "Withdrawal amount must be a positive number.",
    }),
});
