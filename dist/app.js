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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const http_1 = __importDefault(require("http"));
const db_config_1 = __importDefault(require("./src/config/db.config"));
const AppError_1 = __importDefault(require("./src/errors/AppError"));
const errorHandler_1 = __importDefault(require("./src/errors/errorHandler"));
const auth_routes_1 = __importDefault(require("./src/routes/auth.routes"));
const user_routes_1 = __importDefault(require("./src/routes/user.routes"));
const product_routes_1 = __importDefault(require("./src/routes/product.routes"));
const rateLimit_1 = __importDefault(require("./src/middleware/rateLimit"));
const logger_1 = __importStar(require("./src/middleware/logger"));
const serviceUrl_1 = require("./src/serviceUrl");
const passport_1 = __importDefault(require("passport"));
dotenv_1.default.config();
const port = serviceUrl_1.PORT || 8080;
const app = (0, express_1.default)();
process.on("uncaughtException", (err) => {
    logger_1.default.error("Unhandled Exception, shutting down...");
    logger_1.default.error(`${err.name}: ${err.message}`);
    process.exit(1);
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
}));
app.use((0, cookie_parser_1.default)(serviceUrl_1.COOKIE_SECRET));
app.use((0, helmet_1.default)());
//This code is converting our req.body to a string which is actually false.
// app.use(sanitizeInputs);
app.use((0, express_mongo_sanitize_1.default)());
app.use(logger_1.logRequest);
app.use(passport_1.default.initialize());
const shouldCompress = (req, res) => {
    if (req.headers["x-no-compression"]) {
        // Don't compress responses if this request header is present
        return false;
    }
    return compression_1.default.filter(req, res);
};
app.use((0, compression_1.default)({ filter: shouldCompress }));
//All Routes comes in Here
app.use("/api/auth", auth_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use("/api/product", rateLimit_1.default, product_routes_1.default);
app.get("/", (req, res, next) => {
    res.send("Hi");
});
app.all("*", (req, res, next) => {
    const errorMessage = `Can not find ${req.originalUrl} with ${req.method} on this server`;
    logger_1.default.warn(errorMessage);
    next(new AppError_1.default(errorMessage, 501));
});
app.use(errorHandler_1.default);
const server = (0, db_config_1.default)().then(() => {
    const httpServer = http_1.default.createServer(app);
    httpServer.listen(port, () => {
        logger_1.default.info(`Server running on port ${port}`);
    });
    return httpServer;
});
process.on("unhandledRejection", (err) => {
    logger_1.default.error("Unhandled Rejection, shutting down server...");
    logger_1.default.error(`${err.name}: ${err.message}`);
    server.catch(() => {
        process.exit(1);
    });
});
// Optional: Handle SIGTERM for graceful shutdown
process.on("SIGTERM", () => {
    server.then((httpServer) => {
        logger_1.default.info("SIGTERM received. Shutting down gracefully...");
        httpServer.close(() => {
            logger_1.default.info("Server closed");
            process.exit(0);
        });
    });
});
