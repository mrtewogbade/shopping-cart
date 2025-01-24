import axios from "axios";
import { TERMII_API_KEY, Termii_BASE_URL } from "../serviceUrl";
var request = require('request');

const verifyOtp =async (pinId:string, pin:string)=>{
  console.log(pin)
  if (!Termii_BASE_URL || !TERMII_API_KEY)
    return { status: "fail", message: "Failed to verify OTP" };
  
  try {
    const response = await axios.post(`${Termii_BASE_URL}/api/sms/otp/verify`,{
      "api_key": TERMII_API_KEY,
      "pin_id":pinId,
      "pin": pin
    })
    return response.data;
    
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error verifying OTP:", error.response.data);
    } else {
      console.error("Error verifying OTP:", error.message);
    }
    return { status: "fail", message: "Failed to verify OTP" };
    throw new Error("Failed to send OTP");
  }
}
export default verifyOtp