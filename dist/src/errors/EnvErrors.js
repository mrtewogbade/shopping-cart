"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendProdError = exports.sendDevError = void 0;
const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
};
exports.sendDevError = sendDevError;
const sendProdError = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        res.status(500).json({
            status: "error",
            message: "Something went very wrong.",
        });
    }
};
exports.sendProdError = sendProdError;
