import express from "express";
import validate from "../middleware/validateZod";
import { storeSchema, editSellerStoreSchema, addBankDetailsSchema, withdrawalRequestSchema } from "../validations/userValidation";
import { DeleteUser, ChangeProfileImage, CreateSellerStore, editSellerStore, FetchMyDetails, FetchUsersList,  fetchAllStores,fetchSellerProfile, approveStoreHandler } from "../controllers/user.controller";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import CheckRole from "../middleware/checkRole";
import { upload } from "../config/multer.config";



const router = express.Router();
router.get('/users', FetchUsersList);
router.get("/seller-profile/:sellerId", fetchSellerProfile)
router.get("/user",VerifyAccessToken, FetchMyDetails)
router.post("/create-store", validate(storeSchema), VerifyAccessToken, CheckRole("seller"), CreateSellerStore)
router.patch("/approve-store/:sellerId", approveStoreHandler)

router.patch("/update-store", validate(editSellerStoreSchema), VerifyAccessToken, editSellerStore )
router.put("/profile-image", VerifyAccessToken, upload.single("file"), ChangeProfileImage)
router.delete('/:id', DeleteUser)
router.get("/stores", fetchAllStores)



export default router;