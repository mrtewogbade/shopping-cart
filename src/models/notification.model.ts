import mongoose, { Schema, Model } from "mongoose";
import { INotification } from "../interfaces/INotification.u";

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['payment', 'order', 'system']
    },
    isRead: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    relatedId: {
        type: Schema.Types.ObjectId
    }
});

const Notification: Model<INotification> = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;