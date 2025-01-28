"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const otpSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique: true
    },
    pinId: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "10m" //This basically sets the Time to live for 15 minutes.
        //This means that after 15 minutes, this document will delete itself, as it is no more useful
    }
});
const Otp = (0, mongoose_1.model)("Otp", otpSchema);
exports.default = Otp;
