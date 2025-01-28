"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Limiter = (0, express_rate_limit_1.default)({
    windowMs: 20 * 1000,
    limit: 4,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        console.log(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    },
});
exports.default = Limiter;
