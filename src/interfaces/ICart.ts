import mongoose from "mongoose";

export interface ICart{
    buyerId: mongoose.Types.ObjectId;
    sellerId: mongoose.Types.ObjectId;
    carts:any[];
    isPurchased:boolean;
    isDeleted:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

