import mongoose from "mongoose";
import { Document, ObjectId, Schema } from "mongoose";

export interface IAdvertisement {
  creator: ObjectId;
  type: String;
  product: ObjectId;
  status: "active" | "inactive";
  link: String;
  // plan: ObjectId;
  display_area: String;
  isAccepted: Boolean;
  has_paid: Boolean;
  valid_to: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ADVERT_PLAN {
  FREE = "free",
  BASIC = "basic",
  PREMIUM = "premium",
}
