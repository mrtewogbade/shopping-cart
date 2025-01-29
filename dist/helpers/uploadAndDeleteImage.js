"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadMedia = void 0;
// src/helpers/uploadAndDeleteImage.ts
const firebase_config_1 = __importDefault(require("../config/firebase.config"));
const storage_1 = require("firebase/storage");
const GenerateRandomId_1 = __importDefault(require("./GenerateRandomId"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uploadMedia = async (files) => {
    const uploadPromises = files.map(async (file, index) => {
        const randomPrefix = (0, GenerateRandomId_1.default)();
        const key = `${randomPrefix}-${index}`; // Preserve the original file name extension
        const storageRef = (0, storage_1.ref)(firebase_config_1.default, key);
        try {
            await (0, storage_1.uploadBytes)(storageRef, file.buffer, {
                contentType: file.mimetype,
            });
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(key)}?alt=media`;
            return { imageUrl, key };
        }
        catch (err) {
            console.log(err);
            throw new Error(`Could not upload file ${file.originalname} to Firebase Storage: ${err}`);
        }
    });
    try {
        return await Promise.all(uploadPromises);
    }
    catch (err) {
        console.error("Error uploading files:", err);
        throw new Error("Failed to upload all files.");
    }
};
exports.uploadMedia = uploadMedia;
const deleteImage = async (keys) => {
    const deletePromises = keys.map(async (key) => {
        const storageRef = (0, storage_1.ref)(firebase_config_1.default, key);
        try {
            await (0, storage_1.deleteObject)(storageRef);
            console.log(`File deleted successfully: ${key}`);
            return true;
        }
        catch (error) {
            console.error(`Could not delete file from Firebase Storage: ${error}`);
            throw new Error(`Could not delete file from Firebase Storage: ${error}`);
        }
    });
    try {
        await Promise.all(deletePromises);
    }
    catch (error) {
        console.error("Error deleting files:", error);
        throw new Error("Could not delete one or more files from Firebase Storage");
    }
};
exports.deleteImage = deleteImage;
