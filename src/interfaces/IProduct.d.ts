import { Document, Schema } from "mongoose";
import mongoose from "mongoose";




export interface IProduct {
  _id: mongoose.Schema.Types.ObjectId;
  seller: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  images: { key: string; imageUrl: string }[];
  location: string;
  isDeleted: boolean;
  createdAt?: Date;
}
