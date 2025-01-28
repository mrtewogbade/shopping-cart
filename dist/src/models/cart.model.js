"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
// Define the main User schema
const cartSchema = new mongoose_1.Schema({
    buyerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    // sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    carts: [
        {
            product: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, required: true, default: 1 }
        }
    ],
    isPurchased: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Cart = (0, mongoose_2.model)("Cart", cartSchema);
exports.default = Cart;
