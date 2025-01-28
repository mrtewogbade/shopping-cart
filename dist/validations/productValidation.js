"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string({ required_error: "Product name is required" }).min(3, "Product name must be at least 3 characters long"),
    description: zod_1.z.string({ required_error: "Product description is required" }).min(10, "Product description must be at least 10 characters long"),
    price: zod_1.z.string({ required_error: "Product price is required" })
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val) && val > 0, { message: "Product price must be a positive number." }),
    location: zod_1.z.string({ required_error: "Product location is required" }).min(3, "Product location must be at least 3 characters long"),
    category: zod_1.z.string({ required_error: "Product category is required" }).min(3, "Product category must be at least 3 characters long"),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    sizes: zod_1.z.array(zod_1.z.string()).optional(),
    discount: zod_1.z.string({ required_error: "Product discount is required" })
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val) && val > 0, { message: "Product discount must be a positive number." }).optional(),
});
exports.ratingProductSchema = zod_1.z.object({
    rating: zod_1.z.string({ required_error: "Product rating is required" })
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val) && val > 0, { message: "Product rating must be a positive number." }),
});
