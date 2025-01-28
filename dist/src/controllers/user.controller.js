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
exports.fetchAllStores = exports.DeleteUser = exports.ChangeProfileImage = exports.editSellerStore = exports.CreateSellerStore = exports.fetchSellerProfile = exports.FetchMyDetails = exports.FetchUsersList = void 0;
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const user_model_1 = require("../models/user.model");
const AppResponse_1 = __importDefault(require("../helpers/AppResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const uploadAndDeleteImage_1 = require("../helpers/uploadAndDeleteImage");
exports.FetchUsersList = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({ isDeleted: false }).select("-password -otp -otpExpires -is_two_factor_enabled -isDeleted");
    return (0, AppResponse_1.default)(res, "Users fetched succcessfully.", 200, users);
}));
exports.FetchMyDetails = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.user.id;
    const user = yield user_model_1.User.findById(Id).select("-password -isDeleted");
    let account;
    if ((user === null || user === void 0 ? void 0 : user.role) == "seller" && user.store == undefined) {
        account = Object.assign(Object.assign({}, user._doc), { store: null });
    }
    else {
        account = user;
    }
    return (0, AppResponse_1.default)(res, "Your details has been fetched succcessfully.", 200, account);
}));
exports.fetchSellerProfile = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { sellerId } = req.params;
    const seller = yield user_model_1.Seller.findById(sellerId).select("-password -isDeleted -otp -otpExpires -is_two_factor_enabled");
    if (!seller)
        return next(new AppError_1.default("Seller not found.", 404));
    return (0, AppResponse_1.default)(res, "Seller fetched successfully.", 200, seller);
}));
exports.CreateSellerStore = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, id } = req.user;
    const { storeName, storeLocation, storeCategory, storeDescription } = req.body;
    const createStore = yield user_model_1.Seller.findById(id).select("-password -isEmailVerified -is_two_factor_enabled -otp -otpExpires");
    if (!createStore)
        return next(new AppError_1.default("No matching seller with that details found", 404));
    if (createStore.store != null || undefined)
        return next(new AppError_1.default("This seller seems to have a store set up already.", 404));
    createStore.store = {
        storeName,
        storeLocation,
        storeCategory,
        storeDescription,
        sellerName: name,
        storeProduct: [],
    };
    yield createStore.save();
    return (0, AppResponse_1.default)(res, "Store created succcessfully.", 200, createStore);
}));
exports.editSellerStore = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { storeName, storeLocation, storeCategory, storeDescription } = req.body;
    const seller = yield user_model_1.Seller.findById(id).select("-password");
    if (!seller) {
        return next(new AppError_1.default("Seller not found.", 404));
    }
    if (!seller.store) {
        return next(new AppError_1.default("This seller does not have a store to edit.", 404));
    }
    if (storeName)
        seller.store.storeName = storeName;
    if (storeLocation)
        seller.store.storeLocation = storeLocation;
    if (storeCategory)
        seller.store.storeCategory = storeCategory;
    if (storeDescription)
        seller.store.storeDescription = storeDescription;
    // Save the updated store
    yield seller.save();
    return (0, AppResponse_1.default)(res, "Store updated successfully.", 200, seller.store);
}));
exports.ChangeProfileImage = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return next(new AppError_1.default("No product image provided", 401));
    const user = req.user;
    const file = [req.file];
    const prevImage = user.imageUrl;
    //Useful for deleting profile image
    if (prevImage.length > 0) {
        const key = [user.images[0].key];
        yield (0, uploadAndDeleteImage_1.deleteImage)(key);
    }
    const uploadedImage = yield (0, uploadAndDeleteImage_1.uploadMedia)(file);
    const account = yield user_model_1.User.findOneAndUpdate({ _id: user.id }, {
        $set: {
            "images.0.url": uploadedImage[0].imageUrl,
            "images.0.key": uploadedImage[0].key,
        },
    }, { new: true,
        select: "-password -otpExpires -isDeleted -lastLogin -otp -is_two_factor_enabled -two_factor_code -store -isEmailVerified",
    });
    if (!account)
        return next(new AppError_1.default("Account not found or error occured", 404));
    return (0, AppResponse_1.default)(res, "Profile image updated sucessfully", 200, account);
}));
exports.DeleteUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const deleteAcc = yield user_model_1.User.findById(id).select("-is_two_factor_enabled -password -isEmailVerified -otp -otpExpires");
    if (!deleteAcc)
        return next(new AppError_1.default("User with details not found", 404));
    deleteAcc.isDeleted = true;
    deleteAcc.save();
    const account = {
        id: deleteAcc._id,
        name: deleteAcc.name,
        email: deleteAcc.email,
        role: deleteAcc.role,
    };
    return (0, AppResponse_1.default)(res, "Account deleted succcessfully.", 200, account);
}));
exports.fetchAllStores = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSize) || pageSize < 1) {
        return next(new AppError_1.default("Invalid pagination parameters.", 400));
    }
    // Filter stores based on conditions
    const filterConditions = {
        isDeleted: false,
        "store.isStoreApproved": true,
        "store.isStoreBlacklisted": false,
        "store.isStoreDeactivated": false,
    };
    // Fetch only the necessary fields
    const stores = yield user_model_1.Seller.find(filterConditions)
        .select("store.storeName store.storeLocation store.sellerName store.storeCategory store.storeImage store.rating ")
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec();
    // Total count for pagination metadata
    const totalCount = yield user_model_1.Seller.countDocuments(filterConditions);
    return (0, AppResponse_1.default)(res, "Stores fetched successfully.", 200, {
        stores,
        pagination: {
            total: totalCount,
            page: pageNumber,
            limit: pageSize,
            pages: Math.ceil(totalCount / pageSize),
        },
    });
}));
