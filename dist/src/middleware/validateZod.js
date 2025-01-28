"use strict";
// import {Request, Response, NextFunction} from "express";
// import { ZodSchema } from "zod";
// import AppError from "../errors/AppError";
// const validate = (schema:ZodSchema<any>)=>(req:Request, res:Response, next:NextFunction)=>{
//     try {
//         schema.parse(req.body)
//         next()
//     } catch (err:any) {
//         const zodError = JSON.parse(err)
//         const errorMessages:string = zodError.map((error:Error)=>`${error.message}`).join(", ")
//         return next(new AppError(errorMessages, 400))
//     }
// }
// export default validate
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
exports.rateStoreSchema = exports.createAdminSchema = void 0;
const zod_1 = require("zod");
const AppError_1 = __importDefault(require("../errors/AppError"));
const validate = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if request content type is JSON or form data
        if (req.is("json")) {
            yield schema.parseAsync(req.body);
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
            yield schema.parseAsync(formData);
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
});
exports.createAdminSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters long"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
    role: zod_1.z.enum(["admin", "superadmin"], {
        required_error: "Role is required",
        invalid_type_error: "Role must be either 'admin' or 'superadmin'",
    }),
});
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
