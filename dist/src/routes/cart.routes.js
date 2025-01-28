"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyAccessToken_1 = __importDefault(require("../middleware/verifyAccessToken"));
const cart_controller_1 = require("../controllers/cart.controller");
const checkRole_1 = __importDefault(require("../middleware/checkRole"));
const router = express_1.default.Router();
router.get("/carts", cart_controller_1.FetchAllCarts);
router.get("/cart", verifyAccessToken_1.default, (0, checkRole_1.default)("buyer"), cart_controller_1.FetchSingleUserCart);
router.post('/add-to-cart/:productId', verifyAccessToken_1.default, (0, checkRole_1.default)("buyer"), cart_controller_1.AddToCart);
router.patch("/remove-from-cart/:productId", verifyAccessToken_1.default, (0, checkRole_1.default)("buyer"), cart_controller_1.RemoveFromCart);
router.delete("/delete-cart/:cartId", verifyAccessToken_1.default, (0, checkRole_1.default)("buyer"), cart_controller_1.ClearCart);
router.delete("/clear-cart", verifyAccessToken_1.default, cart_controller_1.ClearCart);
exports.default = router;
