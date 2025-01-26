
import mongoose, { Schema,  } from "mongoose";
import { ICart } from "../interfaces/ICart";
import { model } from "mongoose";

// Define the main User schema
const cartSchema: Schema<ICart> = new Schema({
    buyerId: { type: Schema.Types.ObjectId, ref: "User" },
   // sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    carts:[
        {
           product: { type: Schema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, required: true, default: 1 }
        }
    ],
    isPurchased:{type:Boolean, required:true, default:false},
    isDeleted: { type: Boolean, default: false },
    createdAt:{
        type:Date,
        default:Date.now,
    },
})

const Cart= model<ICart>("Cart", cartSchema);
export default Cart