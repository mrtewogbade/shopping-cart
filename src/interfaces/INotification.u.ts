import { Document, Types } from 'mongoose';

export interface INotification extends Document {
    message: string;
    type: 'payment' | 'order' | 'system';
    isRead: boolean;
    createdAt: Date;
    relatedId?: Types.ObjectId;
    user: Types.ObjectId;
}