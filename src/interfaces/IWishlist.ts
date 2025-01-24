// interfaces/IWishlist.ts
import { Document, Schema } from 'mongoose';

export interface IWishlistItem {
    product: Schema.Types.ObjectId;
    addedAt: Date;
}

export interface IWishlist extends Document {
    buyer: Schema.Types.ObjectId;
    items: IWishlistItem[];
    createdAt: Date;
    updatedAt: Date;
}
