import mongoose, { model, Schema } from "mongoose";
import {  AdminOrderStatus, FlagStatus, IOrder, OrderStatus } from "../interfaces/IOrder";

const orderSchema = new Schema<IOrder>({
  buyerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  cartId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Cart",
  },
  deliveryType: {
    type: String,
    required: true,
  },
  address: {
    country: { type: String, required: true },
    postal_code: { type: Number, required: true },
    street_address: { type: String, required: true },
    LGA: { type: String, required: true },
    state: { type: String, required: true },
  },
  isOrderConfirmed: {
    type: Boolean,
    default: false,
  },
  isReadyToShip:{
    type: Boolean,
    default: false
  },
  orderStatus: {
    type: String,
    default: OrderStatus.PENDING,
  },
  // isFlagged: {
  //   type: Boolean,
  //   default: FlagStatus.DISPUTE
  // },
  flagStatus: {
    type: String,
  },
  flagReason: {
    type: String
  },
  additionalNotes: {
    type: String
  },
  adminStatus:{
    type:String,
    default:AdminOrderStatus.CREATED,
  },
  transactionId: {
    //type: mongoose.Schema.ObjectId,
    type:Schema.Types.ObjectId,
    required: true,
    ref: "Transaction",
  },
  trackingNo:{
    type:String,
    required:true
  },

  totalAmount: {type: Number, required: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const Order = model<IOrder>("Order", orderSchema);
export default Order;
