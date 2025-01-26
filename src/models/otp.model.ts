import { model, Schema } from "mongoose";
interface IOtp{
    pinId:string;
    phone_number:string;
    userId:Schema.Types.ObjectId;
    createdAt:Date
};

const otpSchema = new Schema<IOtp>({
    userId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique:true
    },
    pinId:{
        type:String,
        required:true,
    },
    phone_number:{
        type:String,
        required:true,
        unique:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:"10m" //This basically sets the Time to live for 15 minutes.
        //This means that after 15 minutes, this document will delete itself, as it is no more useful
    }
})

const Otp = model<IOtp>("Otp", otpSchema);
export default Otp
