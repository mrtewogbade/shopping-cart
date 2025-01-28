"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buyer = exports.Seller = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["buyer", "seller"], required: true },
    images: [
        {
            key: { type: String, required: true, default: "" },
            url: { type: String, required: true, default: "" },
        },
    ],
    otp: { type: String },
    otpExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
UserSchema.virtual("imageUrl").get(function () {
    return this.images?.map((image) => image.url).join(", ") || "";
});
UserSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret, options) {
        delete ret.images;
        return ret;
    },
});
UserSchema.set("toObject", {
    virtuals: true,
    transform: function (doc, ret, options) {
        delete ret.images;
        return ret;
    },
});
// Define the Buyer schema
const BuyerSchema = new mongoose_1.Schema({
    orders: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],
    cart: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Cart",
    },
    favourites: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],
});
// Define the Seller schema
const SellerSchema = new mongoose_1.Schema({
    store: {
        type: new mongoose_1.Schema({
            storeName: { type: String, required: true, sparse: true },
            storeLocation: { type: String, required: true },
            sellerName: { type: String, required: true },
            storeCategory: {
                type: [String],
            },
            storeDescription: { type: String, required: true },
            ratings: [
                {
                    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
                    rating: { type: Number, min: 1, max: 5 }, // Rating between 1 and 5
                },
            ],
            rating: {
                type: Number, // Average rating of the product
            },
            storeImage: { type: String },
            isStoreVerified: { type: Boolean, default: false },
            isStoreApproved: { type: Boolean, default: false },
            isStoreRejected: { type: Boolean, default: false },
            StoreSuspension: {
                isSuspended: { type: Boolean, default: false },
                suspensionReason: { type: String, default: null },
                suspensionDate: { type: Date, default: null },
                suspensionEndDate: { type: Date, default: null },
            },
            isStoreBlacklisted: { type: Boolean, default: false },
            storeProduct: [
                {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "Product",
                },
            ]
        }),
        validate: {
            validator: function (v) {
                if (v === undefined)
                    return true;
                return (v.storeName &&
                    v.storeLocation &&
                    v.sellerName &&
                    v.storeCategory &&
                    v.storeDescription);
            },
            message: "If the store object is provided, all store fields must be filled.",
        },
    },
});
const User = mongoose_1.default.model("User", UserSchema);
exports.User = User;
const Buyer = User.discriminator("Buyer", BuyerSchema);
exports.Buyer = Buyer;
const Seller = User.discriminator("Seller", SellerSchema);
exports.Seller = Seller;
