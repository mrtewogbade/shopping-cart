import { Document, Schema } from "mongoose";
import mongoose from "mongoose";
import { IReply } from "./IReply";

export interface IReview extends Document {
    _id:mongoose.Schema.Types.ObjectId;
    product:mongoose.Schema.Types.ObjectId;
   reviews:IReply[];
    user: mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
    
}

