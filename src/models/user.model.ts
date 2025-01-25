import mongoose, { Schema, Document, Model } from "mongoose";
import { IBuyer, ISeller, IUser } from "../interfaces/IUser";
import { boolean } from "zod";

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["buyer", "seller"], required: true },
    images: [
      {
        key: { type: String, required: true, default:"" },
        url: { type: String, required: true, default:""},
      },
    ],
    isEmailVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual("imageUrl").get(function (this: IUser) {
  return this.images?.map((image) => image.url).join(", ") || "";
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    delete ret.images;
    return ret;
  },
});

UserSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, ret, options) {
    delete ret.images;
    return ret;
  },
});

// Define the Buyer schema
const BuyerSchema: Schema<IBuyer> = new Schema({
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  cart: {
    type: Schema.Types.ObjectId,
    ref: "Cart",
  },

  favourites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

// Define the Seller schema
const SellerSchema: Schema<ISeller> = new Schema({
  store: {
    type: new Schema({
      storeName: { type: String, required: true, sparse: true },
      storeLocation: { type: String, required: true },
      sellerName: { type: String, required: true },
      storeCategory: {
        type: [String],
      },
      storeDescription: { type: String, required: true },
      ratings: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User" },
          rating: { type: Number, min: 1, max: 5 }, // Rating between 1 and 5
        },
      ],
      rating: {
        type: Number, // Average rating of the product
      },

      storeImage: { type: String },
      isStoreVerified: { type: Boolean, default: false },
      isStoreApproved: { type: Boolean, default: false },
      isStoreRejected: { type: Boolean, default: false },
      StoreSuspension: { 
        isSuspended: { type: Boolean, default: false },
        suspensionReason: { type: String, default: null },
        suspensionDate: { type: Date, default: null },
        suspensionEndDate: { type: Date, default: null },
      },
      isStoreBlacklisted: { type: Boolean, default: false },
      storeProduct: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ]
    }),
    validate: {
      validator: function (v: any) {
        if (v === undefined) return true;
        return (
          v.storeName &&
          v.storeLocation &&
          v.sellerName &&
          v.storeCategory &&
          v.storeDescription
        );
      },
      message:
        "If the store object is provided, all store fields must be filled.",
    },
  },
});

const User = mongoose.model<IUser>("User", UserSchema);
const Buyer = User.discriminator<IBuyer>("Buyer", BuyerSchema);
const Seller = User.discriminator<ISeller>("Seller", SellerSchema);

export { User, Seller, Buyer };
