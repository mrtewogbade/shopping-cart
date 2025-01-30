import express from "express";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import { AddToCart, ClearCart, FetchAllCarts, FetchSingleUserCart, RemoveFromCart } from "../controllers/cart.controller";
import CheckRole from "../middleware/checkRole";


const router = express.Router();
router.get("/carts", FetchAllCarts)
router.get("/cart", VerifyAccessToken, CheckRole("buyer"), FetchSingleUserCart)
router.post('/add-to-cart/:productId', VerifyAccessToken, CheckRole("buyer"), AddToCart );
router.patch("/remove-from-cart/:productId", VerifyAccessToken, CheckRole("buyer"), RemoveFromCart );
router.delete("/delete-cart/:cartId", VerifyAccessToken, CheckRole("buyer"), ClearCart)
router.delete("/clear-cart", VerifyAccessToken, ClearCart) 
export default router;

