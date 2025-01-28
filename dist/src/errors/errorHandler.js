"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customErrors_1 = require("./customErrors");
const EnvErrors_1 = require("./EnvErrors");
const serviceUrl_1 = require("../serviceUrl");
const GlobalErrorHandler = (err, req, res, next) => {
    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;
    if (serviceUrl_1.NODE_ENV === "development") {
        return (0, EnvErrors_1.sendDevError)(err, res);
    }
    else {
        let error = Object.assign({}, err);
        //console.log(err)
        error.message = err.message;
        if (error.name === "CastError")
            error = (0, customErrors_1.handleCastErrorDB)(error);
        if (error.code === 11000)
            error = (0, customErrors_1.handleDuplicateFieldDB)(error);
        if (error.name === "ValidationError")
            error = (0, customErrors_1.handleValidationErrorDB)(error);
        if (error.type === "entity.parse.failed")
            error = (0, customErrors_1.handleSyntaxError)();
        (0, EnvErrors_1.sendProdError)(error, res);
        return;
    }
};
exports.default = GlobalErrorHandler;
