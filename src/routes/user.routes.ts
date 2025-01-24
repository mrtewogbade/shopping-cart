import express from "express";
import validate from "../middleware/validateZod";
import { storeSchema, editSellerStoreSchema, addBankDetailsSchema, withdrawalRequestSchema } from "../validations/userValidation";
import {addBankDetails, requestWithdrawal, DeleteUser, ChangeProfileImage, CreateSellerStore, editSellerStore, FetchMyDetails, FetchSingleUser, FetchUsersList, DeleteWithdrawalRequest, fetchAllStores, submitFcmToken, fetchSellerProfile } from "../controllers/user.controller";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import CheckRole from "../middleware/checkRole";
import { getUserOrderHistory } from "../controllers/order.controller";
import { upload } from "../config/multer.config";
import Limiter from "../middleware/rateLimit";


const router = express.Router();
router.get('/users', FetchUsersList);
router.get("/user/:userId", FetchSingleUser);
router.get("/seller-profile/:sellerId", fetchSellerProfile)
router.get("/user",VerifyAccessToken, FetchMyDetails)
router.post("/create-store", validate(storeSchema), VerifyAccessToken, CheckRole("seller"), CreateSellerStore)

router.get("/orders/history", VerifyAccessToken, getUserOrderHistory)


router.patch("/update-store", validate(editSellerStoreSchema), VerifyAccessToken, editSellerStore )
router.put("/profile-image", VerifyAccessToken, upload.single("file"), ChangeProfileImage)
router.delete('/:id', DeleteUser)
router.put("/add-bank", VerifyAccessToken, CheckRole("seller"), validate(addBankDetailsSchema), addBankDetails)
router.patch("/request-withdrawal", Limiter, VerifyAccessToken, CheckRole("seller"), validate(withdrawalRequestSchema), requestWithdrawal )
router.delete("/cancel-withdrawal/:transactionId", VerifyAccessToken, CheckRole("seller"), DeleteWithdrawalRequest );
router.get("/stores", fetchAllStores)

//fcm token

router.post("/fcm-token", VerifyAccessToken, submitFcmToken)



export default router;