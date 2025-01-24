import axios from 'axios';

export const fetchBankCodes = async () => {
  try {
    const response = await axios.get('https://api.paystack.co/bank', {
        headers: { Authorization: `Bearer ${process.env.Arrenah_PAYSTACK_SECRET_KEY}` },
      });

    if (response.data.status) {
      return response.data.data; 
    } else {
      throw new Error('Failed to fetch bank list');
    }
  } catch (error:any) {
    throw new Error(error.message || 'Error fetching bank codes');
  }
};

export const getBankCode = async (bankName:string) => {
  const banks = await fetchBankCodes();
  const normalizedBankName = bankName.trim().toLowerCase();

  const bank = banks.find(
    (b:any) => b.name.toLowerCase() === normalizedBankName
  );
  
  if (!bank) {
    throw new Error(`Bank name "${bankName}" not recognized`);
  }

  return bank.code; 
};
