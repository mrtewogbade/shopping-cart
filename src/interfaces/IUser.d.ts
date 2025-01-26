import mongoose from "mongoose";
import { Document, ObjectId, Schema } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "buyer" | "seller";
  images: { key: string; url: string }[];
  otp: string;
  otpExpires: Date;
  isEmailVerified: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISeller extends IUser {
  store: {
    storeName: string;
    storeLocation: string;
    sellerName: string;
    storeCategory: string[];
    storeDescription: string;
    rating?: number;
    ratings: {
      user: mongoose.Schema.Types.ObjectId;
      rating: number;
    }[];
    storeImage?: string;

    storeProduct?: Schema.Types.ObjectId[];
    isStoreRejected: boolean;
    isStoreVerified: boolean;
    isStoreApproved: boolean;
    StoreSuspension: {
      isStoreSuspended: boolean;
      suspensionReason: string;
      suspensionDate: Date;
      suspensionEndDate: Date;
    };
    isStoreBlacklisted: boolean;
  };
}

export interface IBuyer extends IUser {
  orders: Schema.Types.ObjectId[];
  cart: Schema.Types.ObjectId;
  favourites: Schema.Types.ObjectId[];
  shipping_address: {
    country: string;
    postal_code: number;
    street_address: string;
    LGA: string;
    state: string;
  };
}
