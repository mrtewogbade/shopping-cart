"use strict";
//This middleware is to check if the store has been blacklisted, deactivated, or even approved;
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const user_model_1 = require("../models/user.model");
const checkSellerStatus = async (req, res, next) => {
    // const user = req.user;
    const { id } = req.user;
    const user = await user_model_1.Seller.findById(id).select("-password");
    if (!user)
        return next(new AppError_1.default("This account does not exist.", 403));
    if (!user.store)
        return next(new AppError_1.default("This seller does not have a store set up.", 403));
    if (!user.store.isStoreApproved) {
        return next(new AppError_1.default("Your store has not been approved yet.", 403));
    }
    if (user.store.isStoreBlacklisted) {
        return next(new AppError_1.default("This store has been blacklisted.", 403));
    }
    next();
};
exports.default = checkSellerStatus;
