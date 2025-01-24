import { Router } from "express";
import {
  createProduct,
  editProduct,
  deleteProduct,
  fetchAllProducts,
  getSingleProduct,
  FetchCategories,
  FetchSubCategories,
  SearchForProduct,
  getTopSellers,
  getSimilarProducts,
  newArrivals,
  getTopCategories,
  getCategories,
  rateStore,
  getStoreRating,
  getUserStoreRating,
  deleteStoreRating,
  fetchAllMyProducts,
  fetchSpecsForSubCategories,
  
} from "../controllers/product.controller";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import CheckRole from "../middleware/checkRole";
import validate from "../middleware/validateZod";
import {
  createProductSchema,
  ratingProductSchema,
} from "../validations/productValidation";
import { upload } from "../config/multer.config";
import Limiter from "../middleware/rateLimit";
import checkSellerStatus from "../middleware/checkSellerStatus";
import { rateStoreSchema } from "../middleware/validateZod";
import storeValidate from "../middleware/storeValidate";

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
router.get("/categories", FetchCategories);
router.get("/subcategories", FetchSubCategories);
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

router.get("/top-sellers", getTopSellers);
router.get("/products/:productId/similar", getSimilarProducts);
router.get("/new-arrivals", newArrivals);
router.get("/top-top-categories", getTopCategories);
router.get("/top-categories", getCategories);
router.get(
  "/myproducts",
  VerifyAccessToken,
  CheckRole("seller"),
  fetchAllMyProducts
);
router.get("/get-specs/:subcategoryId", fetchSpecsForSubCategories);

// STORE RATING ROUTES

router.post("/sellers/:sellerId/rate", VerifyAccessToken, rateStore);
router.get("/sellers/:sellerId/ratings", getStoreRating);
router.get(
  "/sellers/:sellerId/ratings/me",
  VerifyAccessToken,
  getUserStoreRating
);
router.delete(
  "/sellers/:sellerId/ratings",
  VerifyAccessToken,
  deleteStoreRating
);


export default router;
// export default router;
