"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
function CheckRole(allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return (req, res, next) => {
        const user = req.user;
        if (user && rolesArray.includes(user.role)) {
            return next();
        }
        else {
            return next(new AppError_1.default('You are not authorized to perform this action.', 403));
        }
    };
}
exports.default = CheckRole;
