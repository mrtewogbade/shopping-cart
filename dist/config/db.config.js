"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../middleware/logger"));
const serviceUrl_1 = require("../serviceUrl");
const ConnectDB = async () => {
    try {
        if (serviceUrl_1.DB_URI == undefined)
            throw new Error("DB_URI is undefined, please check .env file");
        await mongoose_1.default.connect(serviceUrl_1.DB_URI);
        logger_1.default.info("Successfully connected to DB");
    }
    catch (error) {
        logger_1.default.error("Error connecting to DB");
    }
};
exports.default = ConnectDB;
