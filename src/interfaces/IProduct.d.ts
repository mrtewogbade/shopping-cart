import { Document, Schema } from "mongoose";
import mongoose from "mongoose";
interface ISpecProduct {
  specName: string;
  value: string;
}

interface IVariation{
  title:string;
  description: string;
  images: { key: string; imageUrl: string }[];
}

export interface IProduct {
  _id: mongoose.Schema.Types.ObjectId;
  seller: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  
  category: mongoose.Schema.Types.ObjectId;
  thumbnail: string;
  images: { key: string; imageUrl: string }[];
  location: string;
  isDeleted: boolean;
  stock: number;
  rating?: number;
  ratings: {
    user: mongoose.Schema.Types.ObjectId;
    rating: number;
  }[];
  reviews: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
}
