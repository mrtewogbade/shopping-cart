import { Router } from "express";
import {
  createProduct,
  editProduct,
  deleteProduct,
  fetchAllProducts,
  getSingleProduct,
  SearchForProduct,
  newArrivals,
  rateStore,
  fetchAllMyProducts,
  
} from "../controllers/product.controller";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import CheckRole from "../middleware/checkRole";
import { upload } from "../config/multer.config";
import Limiter from "../middleware/rateLimit";
import checkSellerStatus from "../middleware/checkSellerStatus";

const router = Router();

router.post(
  "/products",

  VerifyAccessToken,
  CheckRole("seller"),
  checkSellerStatus,
  upload.any(),
  //validate(createProductSchema),
  createProduct
);
router.get("/search", SearchForProduct);
router.put(
  "/products/:productId",
  VerifyAccessToken,
  CheckRole("seller"),
  editProduct
);
router.delete(
  "/products/:productId",
  VerifyAccessToken,
  CheckRole("seller"),
  deleteProduct
);
router.get("/products/:productId", getSingleProduct);
router.get("/products", fetchAllProducts);

router.get("/new-arrivals", newArrivals);

router.get(
  "/myproducts",
  VerifyAccessToken,
  CheckRole("seller"),
  fetchAllMyProducts
);

// STORE RATING ROUTES

router.post("/sellers/:sellerId/rate", VerifyAccessToken, rateStore);
router.get(
  "/sellers/:sellerId/ratings/me",
  VerifyAccessToken,
);



export default router;

