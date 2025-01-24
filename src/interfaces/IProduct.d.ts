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
  compare_price?: number;
  discount?: number;
  category: mongoose.Schema.Types.ObjectId;
  specs: ISpecProduct[];
  variations: IVariation[];
  thumbnail: string;
  images: { key: string; imageUrl: string }[];
  tags?: string[];
  location: string;
  sizes?: string[];
  isDeleted: boolean;
  stock: number;
  rating?: number;
  ratings: {
    user: mongoose.Schema.Types.ObjectId;
    rating: number;
  }[];
  weight?: number;
  video_link?:string;
  is_bargainable?: boolean;
  max_price?: number;
  min_price?: number;
  views?: number;
  reviews: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
}

export enum Category {
  Art = "Arts & Collectibles",
  Home = "Home Appliances",
  Health = "Health & Beauty",
  Sport = "Sports & Fitness",
  Electronics = "Electronics",
  Clothing = "Clothing",
  Books = "Books",
  Baby = "Baby & Kids",
  Furniture = "Furniture",
  Toys = "Toys & Furniture",
  Jewelry = "Jewelry & Watches",
}
