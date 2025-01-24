import mongoose from "mongoose";

export enum TransactionType {
  CART = "cart",
  ESCROW = "escrow",
  TRANSFER = "transfer",
  PAYMENT = "payment",
}

export enum TransactionStatus {
  PENDING = "pending",
  SUCCESSFUL = "successful",
  FAILED = "failed",
  DISPUTED = "disputed",
  SETTLED = "settled",
  UNSETTLED = "unsettled",
}
export enum TransactionTitle {
  CHECK_OUT = "Check Out",
  DEPOSIT = "Deposit",
  TRANSFER = "Transfer",
}

export enum PaymentMethod {
  CARD = "card",
  BANK = "bank",
  USSD = "ussd",
  QR = "qr",
  MOBILE_MONEY = "mobile_money",
  BANK_TRANSFER = "bank_transfer",
  NULL = "null",
}

export default interface ITransaction {
  user: mongoose.Types.ObjectId;
  transactionId?: string;
  amount: number;
  title: string;
  currency: "NGN" | "USD" | "EUR" | "GBP";
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  reference: string;
  transactionType: TransactionType;
  cart?: mongoose.Types.ObjectId; // required when transactionType is CART
  escrow?: mongoose.Types.ObjectId; // required when transactionType is ESCROW
  advertisement?: mongoose.Types.ObjectId;
  withdrawalRequest?: boolean; // required when transactionType is WITHDRAWAL
  paystackResponse: Record<string, any>; // flexible to accommodate any response structure
  createdAt?: Date;
  updatedAt?: Date;
}
