"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const verifyAccessToken_1 = __importDefault(require("../middleware/verifyAccessToken"));
const checkRole_1 = __importDefault(require("../middleware/checkRole"));
const multer_config_1 = require("../config/multer.config");
const checkSellerStatus_1 = __importDefault(require("../middleware/checkSellerStatus"));
const router = (0, express_1.Router)();
router.post("/products", verifyAccessToken_1.default, (0, checkRole_1.default)("seller"), checkSellerStatus_1.default, multer_config_1.upload.any(), 
//validate(createProductSchema),
product_controller_1.createProduct);
router.get("/search", product_controller_1.SearchForProduct);
router.put("/products/:productId", verifyAccessToken_1.default, (0, checkRole_1.default)("seller"), product_controller_1.editProduct);
router.delete("/products/:productId", verifyAccessToken_1.default, (0, checkRole_1.default)("seller"), product_controller_1.deleteProduct);
router.get("/products/:productId", product_controller_1.getSingleProduct);
router.get("/products", product_controller_1.fetchAllProducts);
router.get("/new-arrivals", product_controller_1.newArrivals);
router.get("/myproducts", verifyAccessToken_1.default, (0, checkRole_1.default)("seller"), product_controller_1.fetchAllMyProducts);
// STORE RATING ROUTES
router.post("/sellers/:sellerId/rate", verifyAccessToken_1.default, product_controller_1.rateStore);
router.get("/sellers/:sellerId/ratings/me", verifyAccessToken_1.default);
exports.default = router;
// export default router;
