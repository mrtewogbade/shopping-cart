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
  phone_number: string;
  images: { key: string; url: string }[];
  is_two_factor_enabled: boolean;
  two_factor_code: string;
  googleId: string;
  appleId: string;
  otp: string;
  otpExpires: Date;
  isEmailVerified: boolean;
  isDeleted: boolean;
  isActive: boolean;
  lastLogin: Date;
  fcm_token: string;
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
    storeAvailability?: string; // Match with schema type

    storeProduct?: Schema.Types.ObjectId[];
    storeVerificationDetails: string[];
    isStoreRejected: boolean;
    isStoreVerified: boolean;
    isStoreApproved: boolean;
    isStoreSuspended: boolean;
    suspensionReason?: string;
    suspensionDate?: Date;
    isStoreBlacklisted: boolean;
    isStoreDeactivated: boolean;
    isStoreBlacklisted: boolean;
    lastLogin: Date;
    store_bank_details: {
      bank_name: string;
      bank_code: string;
      acciount_name: string;
      account_number: string;
      recipient: string;
    };
    total_earnings: number;
    balance: number;
    point: number;
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
