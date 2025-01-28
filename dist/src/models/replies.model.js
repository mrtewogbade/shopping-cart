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
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const replySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    text: {
        type: String,
        required: true,
    },
    isLiked: {
        type: Boolean,
        default: false,
    },
    isDisliked: {
        type: Boolean,
        default: false,
    },
    ratings: {
        type: Number,
        default: 0,
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    dislikeCount: {
        type: Number,
        default: 0,
    },
    likedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        }],
    dislikedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
replySchema.virtual('relativeTime').get(function () {
    return (0, moment_1.default)(this.createdAt).fromNow();
});
replySchema.set('toJSON', { virtuals: true });
// Method to handle likes
replySchema.methods.toggleLike = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const isLikedIndex = this.likedBy.indexOf(userId);
        const isDislikedIndex = this.dislikedBy.indexOf(userId);
        if (isLikedIndex === -1) {
            // User has not liked it yet
            this.likedBy.push(userId);
            this.isLiked = true;
            this.likeCount += 1;
            if (isDislikedIndex !== -1) {
                // If the user had disliked it before, just remove dislike
                this.dislikedBy.splice(isDislikedIndex, 1);
                this.isDisliked = false;
                this.dislikeCount -= 1;
            }
        }
        else {
            // User is unliking the reply
            this.likedBy.splice(isLikedIndex, 1);
            this.isLiked = false;
            this.likeCount -= 1;
        }
        yield this.save();
    });
};
// Method to handle dislikes
replySchema.methods.toggleDislike = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const isLikedIndex = this.likedBy.indexOf(userId);
        const isDislikedIndex = this.dislikedBy.indexOf(userId);
        if (isDislikedIndex === -1) {
            // User has not disliked it yet, then run this code
            this.dislikedBy.push(userId);
            this.isDisliked = true;
            this.dislikeCount += 1;
            if (isLikedIndex !== -1) {
                // If the user had liked it before, just remove like
                this.likedBy.splice(isLikedIndex, 1);
                this.isLiked = false;
                this.likeCount -= 1;
            }
        }
        else {
            // User is undisliking the reply
            this.dislikedBy.splice(isDislikedIndex, 1);
            this.isDisliked = false;
            this.dislikeCount -= 1;
        }
        yield this.save();
    });
};
const Reply = (0, mongoose_1.model)("Reply", replySchema);
exports.default = Reply;
