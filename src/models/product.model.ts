import { model, Schema } from "mongoose";
import { IProduct } from "../interfaces/IProduct";

const specSchema = new Schema({
  specName: { type: String, required: true },
  value: { type: String, required: true },
});

const variationSchema = new Schema({
  title: { 
    type: String,
  },
  description: { 
    type: String,
  },
  images: [{
    key: { type: String },
    imageUrl: { type: String },
  }]
});


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
    discount: {
      type: Number,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    specs: [specSchema],
    thumbnail: {
      type: String,
      required: true,
    },
    images: [{
      key: { type: String, required: true },
      imageUrl: { type: String, required: true },
    }],
    variations: [variationSchema],  // Added variations array
    tags: {
      type: [String],
    },
    location: {
      type: String,
      required: true,
    },
    sizes: {
      type: [String],
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
    views: {
      type: Number,
      default: 0
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