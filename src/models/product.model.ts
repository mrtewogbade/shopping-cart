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
    images: [{
      key: { type: String, required: true },
      imageUrl: { type: String, required: true },
    }],
    location: {
      type: String,
      required: true,
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