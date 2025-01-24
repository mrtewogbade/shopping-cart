import axios from "axios";
import https from "https";
const verifyAccount = async (accountNumber: string, bankCode: string) => {
  try {
    
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, 
      {
        headers: {
          Authorization: `Bearer ${process.env.Arrenah_PAYSTACK_SECRET_KEY}`, 
        },
      }
    );
    return response.data;
  } catch (error:any) {
    // Handle errors, such as invalid account details or connectivity issues
   
    return { status: "fail", message: "Bank account verification failed" };
  }
};

export default verifyAccount;

export const generateTransferRecipient = async(name:string, account_number:string, bank_code:string ) =>{

 
  try {
    const params = {
      type: "nuban",
      name: name,
      account_number: account_number,
      bank_code: bank_code,
      currency: "NGN",
    };

    const response = await axios.post(
      "https://api.paystack.co/transferrecipient",
      params,
      {
        headers: {
          Authorization: `Bearer ${process.env.Arrenah_PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error:any) {
    console.error(error.response?.data || error.message);
    return {
      status: false,
      message: "Could not generate transfer recipient with provided details. Please contact admin.",
    };
  }
}
