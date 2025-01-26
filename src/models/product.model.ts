import { model, Schema } from "mongoose";
import { IProduct } from "../interfaces/IProduct";

const productSchema = new Schema<IProduct>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    images: [{
      key: { type: String, required: true },
      imageUrl: { type: String, required: true },
    }],
    location: {
      type: String,
      required: true,
    },
    ratings: [{
      user: { type: Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
    }],
    rating: {
      type: Number,
    },
    reviews: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },
    stock:{
      type:Number,
      default:1
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
  }
);

const Product = model<IProduct>("Product", productSchema);
export default Product;