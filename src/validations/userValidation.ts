import { z } from "zod";
export const storeSchema = z.object({
  storeName: z
    .string({ required_error: "Store name is required" })
    .min(3, "Store name must be atleast 3 characters long"),
  storeLocation: z
    .string({ required_error: "Store location is required" })
    .min(3, "Store location must be atleast 3 characters long"),
  storeCategory: z.array(z.string()),
  storeDescription: z
    .string({ required_error: "Store description is required" })
    .min(10, "Store description must be atleast 3 characters long"),
  // storeImage:z.string().optional(),
  storeAvailability: z.date().optional(),
});

export const editSellerStoreSchema = z.object({
  storeName: z.string().min(3, "Store name cannot be empty").optional(),
  storeLocation: z.string().min(1, "Store location cannot be empty").optional(),
  storeCategory: z.array(z.string()).optional(),
  storeDescription: z
    .string()
    .min(1, "Store description cannot be empty")
    .optional(),
});


export const addBankDetailsSchema = z.object({
  bank_name: z
    .string({ required_error: "Bank name is required" })
    .min(3, "Bank name must be atleast 3 characters long"),
  account_number: z
    .string({ required_error: "Account number is required" })
    .min(5, "Account number must be atleast 5 characters long"),
});

export const withdrawalRequestSchema = z.object({
  amount: z
    .string({ required_error: "Withdrawal amount is required" })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Withdrawal amount must be a positive number.",
    }),
});

