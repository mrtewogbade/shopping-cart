"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Model for reviews
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
    },
    reviews: [{
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
            ref: "Reply",
        }],
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User", // Reference the User model
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Review = (0, mongoose_1.model)("Review", reviewSchema);
exports.default = Review;
