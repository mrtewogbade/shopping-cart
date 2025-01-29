"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInputs = void 0;
const express_validator_1 = require("express-validator");
exports.sanitizeInputs = [
    (0, express_validator_1.body)("*").trim().escape(),
    (req, res, next) => {
        next();
    }
];
