import { Document, Model } from "mongoose";

// IPromotion.ts
export interface IPromotion extends Document {
  code: string;
  discount: number;
  
  limit: number;
  usage_count:number;
  discountType: string;
  couponType:string;
  activeService:string;
  isActive: boolean;
  expirationDate: Date; // e.g., Wednesday, October 1st, 2024
  expirationTime: string; // e.g., "07:41 AM"
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend Model to include custom static method
export interface IPromotionModel extends Model<IPromotion> {
  deactivateExpiredPromotions(): Promise<void>;
}