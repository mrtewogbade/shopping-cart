"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateStoreSchema = void 0;
const zod_1 = require("zod");
const AppError_1 = __importDefault(require("../errors/AppError"));
const validate = (schema) => async (req, res, next) => {
    try {
        // Check if request content type is JSON or form data
        if (req.is("json")) {
            await schema.parseAsync(req.body);
        }
        else if (req.is("multipart/form-data") == "multipart/form-data") {
            const formData = {};
            // Extract all fields from req.body (excluding files handled by multer)
            for (const key in req.body) {
                if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                    if (key !== "file") {
                        formData[key] = req.body[key];
                    }
                }
            }
            // Validate the extracted form data against the schema
            await schema.parseAsync(formData);
        }
        else {
            return next(new AppError_1.default("Unsupported content type", 400));
            //throw new AppError('Unsupported content type', 400);
        }
        next();
    }
    catch (error) {
        if (error.errors) {
            const errorMessages = error.errors
                .map((e) => e.message)
                .join(", ");
            return next(new AppError_1.default(errorMessages, 400));
        }
        else {
            return next(new AppError_1.default(error.message, 400));
        }
    }
};
exports.rateStoreSchema = zod_1.z.object({
    params: zod_1.z.object({
        sellerId: zod_1.z.string({
            required_error: "Seller ID is required",
            invalid_type_error: "Seller ID must be a string"
        }).min(1, "Seller ID cannot be empty")
    }),
    body: zod_1.z.object({
        rating: zod_1.z.number({
            required_error: "Rating is required",
            invalid_type_error: "Rating must be a number"
        })
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must not exceed 5")
    })
});
exports.default = validate;
