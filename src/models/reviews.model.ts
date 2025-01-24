//Model for reviews
import { model, Schema } from "mongoose";
import { IReview } from "../interfaces/IReview";
const reviewSchema = new Schema<IReview>({
    product:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"Product",
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"Reply",
    }],
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User", // Reference the User model
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    
})

const Review = model<IReview>("Review", reviewSchema);
export default Review;
