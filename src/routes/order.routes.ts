import express from "express";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import validate from "../middleware/validateZod";
import CheckRole from "../middleware/checkRole";
import {
 
  fetchSingleOrderDetails,
  fetchSingleSellerOrders,
  fetchSellerEarningsDashboard,
  ReadyToShip,
  updateIsOrderConfirmed
} from "../controllers/order.controller";
import Limiter from "../middleware/rateLimit";

const router = express.Router();

router.get(
  "/seller-orders",
  Limiter,
  VerifyAccessToken,
  CheckRole("seller"),
  fetchSingleSellerOrders
);

router.get(
  "/dashboard-earnings",
  VerifyAccessToken,
  CheckRole("seller"),
  fetchSellerEarningsDashboard
);

router.get(
  "/:orderId",
  Limiter,
  VerifyAccessToken,
  fetchSingleOrderDetails
);

router.patch("/:orderId/ready-to-ship", VerifyAccessToken, ReadyToShip);
router.patch("/:orderId/confirm", VerifyAccessToken, updateIsOrderConfirmed);


// PLease have a look at this code
// router.get(
//   "/sellers/:sellerId/orders",
//  VerifyAccessToken,
//   fetchSellerOrderHistory,

// );

export default router;
