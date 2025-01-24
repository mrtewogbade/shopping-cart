import { Schema, Document } from "mongoose";

export interface IReply extends Document {
  user: Schema.Types.ObjectId;
  text: string;
  isLiked: boolean;
  isDisliked: boolean;
  ratings: number;
  likeCount: number;
  dislikeCount: number;
  likedBy: Schema.Types.ObjectId[];
  dislikedBy: Schema.Types.ObjectId[];
  createdAt: Date;
  relativeTime?: string; // This is for the virtual property

  // Methods
  toggleLike(userId: Schema.Types.ObjectId): Promise<void>;
  toggleDislike(userId: Schema.Types.ObjectId): Promise<void>;
}
