"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSyntaxError = exports.handleValidationErrorDB = exports.handleDuplicateFieldDB = exports.handleCastErrorDB = void 0;
const AppError_1 = __importDefault(require("./AppError"));
//All Custom errors will be handled here, including mongodb errors, jwt error etc
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError_1.default(message, 400);
};
exports.handleCastErrorDB = handleCastErrorDB;
const handleDuplicateFieldDB = (err) => {
    const value = err.keyValue[Object.keys(err.keyValue)[0]];
    const message = `Duplicate  field value: ${value}. Please use another value!`;
    return new AppError_1.default(message, 400);
};
exports.handleDuplicateFieldDB = handleDuplicateFieldDB;
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError_1.default(message, 400);
};
exports.handleValidationErrorDB = handleValidationErrorDB;
const handleSyntaxError = () => {
    const message = "You have a syntax error, please check your request format.";
    return new AppError_1.default(message, 400);
};
exports.handleSyntaxError = handleSyntaxError;
