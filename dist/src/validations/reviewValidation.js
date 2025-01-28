"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    comment: zod_1.z.string({ "required_error": "Review message is required" }).min(3, "Review message must be atleast 3 characters long"),
});
