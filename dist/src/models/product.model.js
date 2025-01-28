"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    seller: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Category",
    },
    images: [{
            key: { type: String, required: true },
            imageUrl: { type: String, required: true },
        }],
    location: {
        type: String,
        required: true,
    },
    ratings: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            rating: { type: Number, min: 1, max: 5 },
        }],
    rating: {
        type: Number,
    },
    reviews: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Review",
        default: null,
    },
    stock: {
        type: Number,
        default: 1
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    toJSON: { virtuals: true },
});
const Product = (0, mongoose_1.model)("Product", productSchema);
exports.default = Product;
