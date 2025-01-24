import mongoose from "mongoose";
export enum DeliveryTypes{
    INSTANT_DELIVERY = "instant",
    REGULAR = "regular"
}
export enum OrderStatus {
    PENDING="pending",
    COMPLETED="completed",
    FAILED="failed",
    ASSIGNED="assigned",
}
export enum AdminOrderStatus {
    CREATED="created",
    DISPUTED = "disputed",
    DELIVERED="delivered",
    CANCELLED="cancelled"
}
interface IResAddress {
    address:{
        country:string;
        postal_code:number,
        street_address:string,
        LGA:string,
        state:string
    }
}

export enum FlagStatus {
    DISPUTE = 'DISPUTE',
    FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',
    PAYMENT_ISSUE = 'PAYMENT_ISSUE',
    DELIVERY_PROBLEM = 'DELIVERY_PROBLEM',
    CUSTOMER_COMPLAINT = 'CUSTOMER_COMPLAINT',
    INVENTORY_MISMATCH = 'INVENTORY_MISMATCH',
    REFUND_REQUESTED = 'REFUND_REQUESTED',
    PENDING_INVESTIGATION = 'PENDING_INVESTIGATION'
}




export interface IOrder {
    buyerId:mongoose.Types.ObjectId;
    transactionId:mongoose.Types.ObjectId;
    cartId:mongoose.Types.ObjectId;
    deliveryType:DeliveryTypes;
    orderStatus:OrderStatus;
    trackingNo:string;
    deliveryData?:any;
    isOrderConfirmed:boolean;
    isReadyToShip: boolean;
    address:IResAddress;
    totalAmount: number;
    lineItems: Array<{
        productId: mongoose.Types.ObjectId;
        quantity: number;
    }>;
    isFlagged?: boolean;
    flagStatus?: FlagStatus;
    flagReason?: string;
    additionalNotes?: string;
    adminStatus:AdminOrderStatus
    createdAt:Date;
    updatedAt:Date;
};

