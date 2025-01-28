"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function AppResponse(res, message, statusCode = 200, data = null) {
    let status;
    switch (statusCode) {
        case (statusCode = 200):
            status = "ok";
            break;
        case (statusCode = 201):
            status = "Created";
            break;
        case (statusCode = 202):
            status = "Accepted";
            break;
        case (statusCode = 203):
            status = "Non-Authoritative Information";
            break;
        case (statusCode = 204):
            status = "No Content";
            break;
        case (statusCode = 205):
            status = "Reset Content";
            break;
        case (statusCode = 206):
            status = "Partial Content";
            break;
    }
    ;
    res.status(statusCode).json({ status: status, message: message, data: data });
}
exports.default = AppResponse;
