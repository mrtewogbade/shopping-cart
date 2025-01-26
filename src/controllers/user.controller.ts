import { Request, Response, NextFunction } from "express";
import catchAsync from "../errors/catchAsync";
import { Seller, User } from "../models/user.model";
import AppResponse from "../helpers/AppResponse";
import { IUser } from "../interfaces/IUser";
import AppError from "../errors/AppError";
import { uploadMedia, deleteImage } from "../helpers/uploadAndDeleteImage";



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

