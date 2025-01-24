import { model, Schema } from "mongoose";
import { IReply } from "../interfaces/IReply";
import moment from "moment";

const replySchema = new Schema<IReply>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
  isDisliked: {
    type: Boolean,
    default: false,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  dislikeCount: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  dislikedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
{
  timestamps: true,
}
);

replySchema.virtual('relativeTime').get(function(this: IReply) {
  return moment(this.createdAt).fromNow();
});

replySchema.set('toJSON', { virtuals: true });

// Method to handle likes
replySchema.methods.toggleLike = async function(userId: Schema.Types.ObjectId) {
  const isLikedIndex = this.likedBy.indexOf(userId);
  const isDislikedIndex = this.dislikedBy.indexOf(userId);

  if (isLikedIndex === -1) {
    // User has not liked it yet
    this.likedBy.push(userId);
    this.isLiked = true;
    this.likeCount += 1;

    if (isDislikedIndex !== -1) {
      // If the user had disliked it before, just remove dislike
      this.dislikedBy.splice(isDislikedIndex, 1);
      this.isDisliked = false;
      this.dislikeCount -= 1;
    }
  } else {
    // User is unliking the reply
    this.likedBy.splice(isLikedIndex, 1);
    this.isLiked = false;
    this.likeCount -= 1;
  }

  await this.save();
};

// Method to handle dislikes
replySchema.methods.toggleDislike = async function(userId: Schema.Types.ObjectId) {
  const isLikedIndex = this.likedBy.indexOf(userId);
  const isDislikedIndex = this.dislikedBy.indexOf(userId);

  if (isDislikedIndex === -1) {
    // User has not disliked it yet, then run this code
    this.dislikedBy.push(userId);
    this.isDisliked = true;
    this.dislikeCount += 1;

    if (isLikedIndex !== -1) {
      // If the user had liked it before, just remove like
      this.likedBy.splice(isLikedIndex, 1);
      this.isLiked = false;
      this.likeCount -= 1;
    }
  } else {
    // User is undisliking the reply
    this.dislikedBy.splice(isDislikedIndex, 1);
    this.isDisliked = false;
    this.dislikeCount -= 1;
  }

  await this.save();
};

const Reply = model<IReply>("Reply", replySchema);
export default Reply;
