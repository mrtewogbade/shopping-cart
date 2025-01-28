"use strict";
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
exports.FetchSingleUserCart = exports.FetchAllCarts = exports.ClearCart = exports.RemoveFromCart = exports.AddToCart = void 0;
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const AppResponse_1 = __importDefault(require("../helpers/AppResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const cart_model_1 = __importDefault(require("../models/cart.model"));
const user_model_1 = require("../models/user.model");
exports.AddToCart = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { quantity } = req.body; // Accept quantity from the request body
    const buyerId = req.user.id;
    let user = yield user_model_1.User.findById(buyerId)
        .select("-password -isEmailVerified -otp -is_two_factor_enabled -otpExpires ")
        .exec();
    if (!user) {
        return next(new AppError_1.default("User not found", 404));
    }
    let cart = yield cart_model_1.default.findOne({ _id: user === null || user === void 0 ? void 0 : user.cart, isDeleted: false }).exec();
    if (!cart) {
        cart = new cart_model_1.default({
            buyerId,
            carts: [],
            isPurchased: false,
        });
    }
    const existingCartItem = cart.carts.find((item) => item.product.toString() === productId);
    if (existingCartItem) {
        if (quantity && quantity > 0) {
            existingCartItem.quantity += quantity;
        }
        else {
            existingCartItem.quantity += 1;
        }
    }
    else {
        cart.carts.push({ product: productId, quantity: quantity && quantity > 0 ? quantity : 1 });
    }
    if (user.cart != cart._id) {
        user.cart = cart._id;
        yield cart.save();
        yield user.save();
    }
    cart = yield cart.populate({
        path: "carts.product",
        select: "name price thumbnail",
    });
    return (0, AppResponse_1.default)(res, "User has added to cart successfully", 200, {
        user,
        cart,
    });
}));
exports.RemoveFromCart = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const buyerId = req.user.id;
    //Both of this should run at same time.
    let user = yield user_model_1.User.findById(buyerId)
        .select("-password -isEmailVerified -otp -is_two_factor_enabled -otpExpires ")
        .exec();
    if (!user) {
        return next(new AppError_1.default("User not found", 404));
    }
    let cart = yield cart_model_1.default.findOne({ _id: user === null || user === void 0 ? void 0 : user.cart, isDeleted: false }).exec();
    if (!cart) {
        return next(new AppError_1.default("Cart not found", 404));
    }
    const existingCartItem = cart.carts.find((item) => item.product.toString() === productId);
    if (!existingCartItem) {
        return next(new AppError_1.default("Product not found in cart", 404));
    }
    existingCartItem.quantity -= 1;
    if (existingCartItem.quantity === 0) {
        cart.carts = cart.carts.filter((item) => item.product.toString() !== productId);
        user.cart = null;
    }
    yield cart.save();
    yield user.save();
    cart = yield cart.populate({
        path: "carts.product",
        select: "name price thumbnail",
    });
    return (0, AppResponse_1.default)(res, "User has removed from cart successfully", 200, {
        user,
        cart,
    });
}));
exports.ClearCart = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const buyerId = req.user.id;
    let user = yield user_model_1.User.findById(buyerId)
        .select("-password -isEmailVerified -otp -is_two_factor_enabled -otpExpires ")
        .exec();
    if (!user) {
        return next(new AppError_1.default("User not found", 404));
    }
    let cart = yield cart_model_1.default.findOne({ _id: user === null || user === void 0 ? void 0 : user.cart, isDeleted: false }).exec();
    if (!cart) {
        return next(new AppError_1.default("Cart not found", 404));
    }
    cart.isDeleted = true;
    user.cart = null;
    yield Promise.all([cart.save(), user.save()]);
    return (0, AppResponse_1.default)(res, "Cart has been cleared successfully", 200, {
        user,
    });
}));
exports.FetchAllCarts = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const carts = yield cart_model_1.default.find({ isDeleted: false });
    return (0, AppResponse_1.default)(res, "All Carts fetched successfully", 200, carts);
}));
exports.FetchSingleUserCart = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const user = yield user_model_1.Buyer.findById(userId)
        .select("-password -isDeleted -otp -otpExpires -is_two_factor_enabled -isEmailVerified")
        .populate({
        path: "cart",
        select: "-buyerId -isPurchased",
        populate: {
            path: "carts.product",
            model: "Product",
            select: "-seller -discount -createdAt  -tags -location -sizes -reviews -ratings -description -category -images",
        },
    });
    console.log(user);
    if (!user)
        return next(new AppError_1.default("User does not exist", 404));
    const cart = user.cart;
    if (!cart)
        return next(new AppError_1.default("User does not have a cart. Please start shopping.", 404));
    return (0, AppResponse_1.default)(res, "Users Carts fetched successfully", 200, cart);
}));
