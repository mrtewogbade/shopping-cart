// models/chat.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    sender: mongoose.Schema.Types.ObjectId;
    receiver: mongoose.Schema.Types.ObjectId;
    message: string;
    timestamp: Date;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio';
}

export interface IChat extends Document {
    participants: mongoose.Schema.Types.ObjectId[];
    messages: IMessage[];
}

const MessageSchema = new Schema<IMessage>({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    mediaUrl: {type: String},
    mediaType: {type: String, enum: ['image', 'audio']}
});

const ChatSchema = new Schema<IChat>({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    messages: [MessageSchema],
});

const Chat = mongoose.model<IChat>('Chat', ChatSchema);
const Message = mongoose.model<IMessage>('Message', MessageSchema);

export { Chat, Message };
