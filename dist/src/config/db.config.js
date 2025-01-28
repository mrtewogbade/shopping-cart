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
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../middleware/logger"));
const serviceUrl_1 = require("../serviceUrl");
const ConnectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (serviceUrl_1.DB_URI == undefined)
            throw new Error("DB_URI is undefined, please check .env file");
        yield mongoose_1.default.connect(serviceUrl_1.DB_URI);
        logger_1.default.info("Successfully connected to DB");
    }
    catch (error) {
        logger_1.default.error("Error connecting to DB");
    }
});
exports.default = ConnectDB;
