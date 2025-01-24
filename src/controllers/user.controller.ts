import { Request, Response, NextFunction } from "express";
import https from "https";
import catchAsync from "../errors/catchAsync";
import { Seller, User } from "../models/user.model";
import AppResponse from "../helpers/AppResponse";
import { IUser } from "../interfaces/IUser";
import AppError from "../errors/AppError";
import axios from "axios";
import { getBankCode } from "../helpers/bankCodes";
import verifyAccount, {
  generateTransferRecipient,
} from "../helpers/verifyAccount";
import {
  TransactionType,
  PaymentMethod,
  TransactionStatus,
} from "../interfaces/ITransaction";
import { Transaction } from "../src/models/transactions.model";
import { uploadMedia, deleteImage } from "../helpers/uploadAndDeleteImage";
import Limiter from "../middleware/rateLimit";
import logger from "../middleware/logger";
import { date } from "zod";

export const FetchUsersList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({ isDeleted: false }).select(
      "-password -otp -otpExpires -is_two_factor_enabled -isDeleted"
    );
    return AppResponse(res, "Users fetched succcessfully.", 200, users);
  }
);
export const FetchMyDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const Id = (req.user as IUser).id;
    const user: any = await User.findById(Id).select("-password -isDeleted");
    let account;
    if (user?.role == "seller" && user.store == undefined) {
      account = { ...user._doc, store: null };
    } else {
      account = user;
    }
    return AppResponse(
      res,
      "Your details has been fetched succcessfully.",
      200,
      account
    );
  }
);
export const FetchSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password -isDeleted");
    console.log(user);
    return AppResponse(res, "User fetched succcessfully.", 200, user);
  }
);

export const fetchSellerProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { sellerId } = req.params;
  const seller = await Seller.findById(sellerId).select("-password -isDeleted -otp -otpExpires -is_two_factor_enabled");
  if (!seller) return next(new AppError("Seller not found.", 404));
  return AppResponse(res, "Seller fetched successfully.", 200, seller);
})

export const CreateSellerStore = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.user as IUser;

    const { storeName, storeLocation, storeCategory, storeDescription } =
      req.body;
    const createStore: any = await Seller.findById(id).select(
      "-password -isEmailVerified -is_two_factor_enabled -otp -otpExpires"
    );
    if (!createStore)
      return next(
        new AppError("No matching seller with that details found", 404)
      );
    if (createStore.store != null || undefined)
      return next(
        new AppError("This seller seems to have a store set up already.", 404)
      );
    createStore.store = {
      storeName,
      storeLocation,
      storeCategory,
      storeDescription,
      sellerName: name,
      storeProduct: [],
    };
    await createStore.save();

    return AppResponse(res, "Store created succcessfully.", 200, createStore);
  }
);

export const editSellerStore = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user as IUser;

    const { storeName, storeLocation, storeCategory, storeDescription } =
      req.body;

    const seller = await Seller.findById(id).select("-password");
    if (!seller) {
      return next(new AppError("Seller not found.", 404));
    }

    if (!seller.store) {
      return next(
        new AppError("This seller does not have a store to edit.", 404)
      );
    }

    if (storeName) seller.store.storeName = storeName;
    if (storeLocation) seller.store.storeLocation = storeLocation;
    if (storeCategory) seller.store.storeCategory = storeCategory;
    if (storeDescription) seller.store.storeDescription = storeDescription;

    // Save the updated store
    await seller.save();

    return AppResponse(res, "Store updated successfully.", 200, seller.store);
  }
);

export const ChangeProfileImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new AppError("No product image provided", 401));
    const user:any = req.user;
    const file= [req.file];
    const prevImage = user.imageUrl
    //Useful for deleting profile image
    if(prevImage.length > 0){
      const key:string[] = [user.images[0].key];
       await deleteImage(key)
    }
    const uploadedImage: {
      imageUrl: string;
      key: string;
  }[] = await uploadMedia(
      file as Express.Multer.File[]
    );
   const account= await User.findOneAndUpdate(
      { _id: user.id },
      {
        $set: {
          "images.0.url": uploadedImage[0].imageUrl,
          "images.0.key": uploadedImage[0].key,
        },
      },
      { new: true,
        select: "-password -otpExpires -isDeleted -lastLogin -otp -is_two_factor_enabled -two_factor_code -store -isEmailVerified",
       }
    );
    
    if(!account) return next(new AppError("Account not found or error occured", 404));
    
    return AppResponse(res, "Profile image updated sucessfully", 200,account )
  }
);

export const DeleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const deleteAcc = await User.findById(id).select(
      "-is_two_factor_enabled -password -isEmailVerified -otp -otpExpires"
    );
    if (!deleteAcc)
      return next(new AppError("User with details not found", 404));
    deleteAcc.isDeleted = true;
    deleteAcc.save();
    const account = {
      id: deleteAcc._id,
      name: deleteAcc.name,
      email: deleteAcc.email,
      role: deleteAcc.role,
    };
    return AppResponse(res, "Account deleted succcessfully.", 200, account);
  }
);
export const FetchMyShippingAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find().select(
      "-password -otp -otpExpires -is_two_factor_enabled"
    );
    return AppResponse(res, "Users fetched succcessfully.", 200, users);
  }
);

export const CreateMyShippingAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { country, postal_code, street_address, LGA, state, deliveryType } =
      req.body;

    const account = await User.findById(user.id).select(
      "-password -otp -otpExpires -is_two_factor_enabled"
    );
    console.log(account);
    return AppResponse(res, "Users fetched succcessfully.", 200, account);
  }
);

export const addBankDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { bank_name, account_number } = req.body;
    const { bank_code } = req.query;
    let bankCode;
    //We first of all verify the bank account before we add it
    if (!bank_code) {
      bankCode = await getBankCode(bank_name);
    } else {
      bankCode = bank_code;
    }

    const response = await verifyAccount(account_number, bankCode);
    if (response.status == "fail")
      return next(new AppError(`${response.message}`, 400));
    const paystackResponse: any = await generateTransferRecipient(
      user.name,
      response.data.account_number,
      bankCode
    );

    if (paystackResponse.status == false)
      return next(new AppError(`${paystackResponse.message}`, 400));

    //Here, i will do the saving
    const updateAccount: any = await User.findById(user._id).select(
      "-password -is_two_factor_enabled -isDeleted -otp -otpExpires -store.isStoreRejected -store.isStoreApproved -store.isStoreDeactivated -store.isStoreBlacklisted"
    );
    if (!updateAccount)
      return next(
        new AppError("Could not find your account, please contact admin.", 400)
      );

    updateAccount.store.store_bank_details.bank_name = bank_name;

    updateAccount.store.store_bank_details.bank_code = bankCode;
    updateAccount.store.store_bank_details.account_name =
      response.data.account_name;
    updateAccount.store.store_bank_details.account_number =
      response.data.account_number;
    updateAccount.store.store_bank_details.recipient =
      paystackResponse.data.recipient_code;
    await updateAccount.save();

    return AppResponse(
      res,
      "Your account has been updated succcessfully.",
      200,
      updateAccount
    );
  }
);

export const requestWithdrawal = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { amount } = req.body;
    const findAccount: any = await User.findById(user._id).select(
      "-password -is_two_factor_enabled -isDeleted -otp -otpExpires -store.isStoreRejected -store.isStoreApproved -store.isStoreDeactivated -store.isStoreBlacklisted"
    );
    if (!findAccount)
      return next(
        new AppError("Could not place your withdrawal request.", 400)
      );

    const store_bank_details = findAccount.store.store_bank_details;
    if (
      !store_bank_details.bank_name ||
      !store_bank_details.bank_code ||
      !store_bank_details.account_number ||
      !store_bank_details.account_name ||
      !store_bank_details.recipient
    )
      return next(
        new AppError(
          "Bank details missing, please add them before you retry.",
          400
        )
      );
    if (amount == 0)
      return next(
        new AppError("Withdrawal request failed, amount can not be 0.", 400)
      );
    if (amount > findAccount.store.balance)
      return next(
        new AppError("Withdrawal request failed, not enough balance.", 400)
      );
      findAccount.store.balance -= amount;
      
    const transaction = new Transaction({
      user: user._id,
      transactionId: store_bank_details.recipient,
      currency: "NGN",
      amount,
      status: TransactionStatus.UNSETTLED,
      paymentMethod: PaymentMethod.NULL,
      transactionType: TransactionType.TRANSFER,
      reference: null,
      withdrawalRequest: true,
    });
    await transaction.save();
    await findAccount.save();
    return AppResponse(
      res,
      `You have succcessfully requested for your withdrawal. Please wait while we process it.`,
      200,
      transaction
    );
  }
);

export const CalculateSellerEarnings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    //Here we are to set an aggregation pipeline that will fetch all the sales of the  last 24 hours
    // Then allocate them to the rightful store owner
  }
);

export const DeleteWithdrawalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { transactionId } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete({
      _id: transactionId,
      status: TransactionStatus.UNSETTLED,
    });
    if (!deletedTransaction)
      return next(new AppError("Failed to delete withdrawal request.", 400));
    const findAccount: any = await User.findById(user._id).select(
      "-password -is_two_factor_enabled -isDeleted -otp -otpExpires -store.isStoreRejected -store.isStoreApproved -store.isStoreDeactivated -store.isStoreBlacklisted"
    );
    if (!findAccount)
      return next(
        new AppError("Could not place your withdrawal request.", 400)
      );
      findAccount.store.balance += deletedTransaction.amount;
      await findAccount.save();

    return AppResponse(
      res,
      "Withdrawal request deleted succesfully",
      200,
      null
    );
  }
);

export const fetchAllStores = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSize) || pageSize < 1) {
      return next(new AppError("Invalid pagination parameters.", 400));
    }

    // Filter stores based on conditions
    const filterConditions = {
      isDeleted: false,
      "store.isStoreApproved": true,
      "store.isStoreBlacklisted": false,
      "store.isStoreDeactivated": false,
    };

    // Fetch only the necessary fields
    const stores = await Seller.find(filterConditions)
      .select("store.storeName store.storeLocation store.sellerName store.storeCategory store.storeImage store.rating ")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    // Total count for pagination metadata
    const totalCount = await Seller.countDocuments(filterConditions);

    return AppResponse(res, "Stores fetched successfully.", 200, {
      stores,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(totalCount / pageSize),
      },
    });
  }
);


export const verifySellerViaNin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    try{}catch(err:any){return next(new AppError(err.message, 400))}
    return AppResponse(res, "Users fetched succcessfully.", 200, );
  }
);



export const submitFcmToken = [
  Limiter,
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      logger.error(`User ${user._id} failed to provide an FCM token.`);
      return next(new AppError("FCM token is required.", 400));
    }

    if (user.fcm_token === fcm_token) {
      logger.info(`User ${user._id} submitted an already existing FCM token.`);
      return res.status(200).json({ message: "FCM token is already up-to-date." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { fcm_token },
      { new: true }
    );

    if (!updatedUser) {
      logger.error(`Failed to update FCM token for User ${user._id}.`);
      return next(new AppError("Failed to update FCM token.", 400));
    }

    logger.info(`Successfully updated FCM token for User ${user._id}.`);
    AppResponse(res, "FCM token updated successfully.", 200, {
      date:{
        id: updatedUser._id,
        name: updatedUser.name,
        fcm_token: updatedUser.fcm_token,
      }
    });
  }),
];
