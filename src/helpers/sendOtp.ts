import {
  TERMII_API_KEY,
  Termii_BASE_URL,
  TERMII_SENDER_ID,
} from "../serviceUrl";

import axios from "axios";

const sendOtp = async (phoneNumber: string): Promise<any> => {
  if (!Termii_BASE_URL || !TERMII_API_KEY)
    return { status: "fail", message: "Failed to send OTP" };
  try {
    const response = await axios.post(`${Termii_BASE_URL}/api/sms/otp/send`, {
      api_key: TERMII_API_KEY,
      message_type: "NUMERIC",
      to: phoneNumber,
      from: TERMII_SENDER_ID,
      channel: "dnd",
      // pin_attempts: 5,
      pin_time_to_live: 10,
      pin_length: 4,
      pin_placeholder: "< 1234 >",
      message_text: `Your Arrenah verification code is < 1234 >`,
      pin_type: "NUMERIC",
    });
    console.log(response);

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error sending OTP:", error.response.data);
    } else {
      console.error("Error sending OTP:", error.message);
    }
    return { status: "fail", message: "Failed to send OTP" };
    throw new Error("Failed to send OTP");
  }
};

export default sendOtp;