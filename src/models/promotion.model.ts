import { model, Schema } from "mongoose";
import { IPromotion, IPromotionModel } from "../interfaces/IPromotion";


const promotionSchema = new Schema<IPromotion>(
  {
    code: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["price", "percentage"],
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    usage_count:{
        type:Number,
        default:0
    }, 
    couponType: {
      type: String,
      enum: ["generalBuyer", "generalSeller", "perCategory", "perService"],
      required: true,
    },
    activeService: {
      type: String,
      enum: ["all", "shopping", "delivery", "advertisement", "subscription"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expirationDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return value > new Date(); 
        },
        message: "Expiration date must be a future date.",
      },
    },
    expirationTime: {
      type: String,
      required: true, // e.g., "07:41 AM"
    },
  },
  { timestamps: true }
);

// Static method to deactivate expired promotions
promotionSchema.statics.deactivateExpiredPromotions = async function () {
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Compare both the expiration date and time
  await this.updateMany(
    {
      $or: [
        { expirationDate: { $lt: currentDate }, isActive: true },
        {
          expirationDate: { $eq: currentDate },
          expirationTime: { $lt: currentTime },
          isActive: true,
        },
      ],
    },
    { isActive: false }
  );
};



const Promotion = model<IPromotion, IPromotionModel>(
  "Promotion",
  promotionSchema
);
export default Promotion;