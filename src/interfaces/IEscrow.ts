// import mongoose from "mongoose";


// export enum EscrowStatus {
//     USER_PAID = "user_paid",
//     ITEM_PICKED_UP = "item_picked_up",
//     PRODUCT_IN_TRANSIT = "product_in_transit",
//     PRODUCT_DELIVERED = "product_delivered",
//     ITEM_CONFIRMED = "item_confirmed",
// }




// export interface IEscrowAction extends Document {
//     escrowId: mongoose.Schema.Types.ObjectId;
//     action: EscrowAction;
//     status: {

//     }
//     buyer: mongoose.Schema.Types.ObjectId;
//     seller: mongoose.Schema.Types.ObjectId;
//     negotiation: {
//         status: NegotiationStatus;
//         proposedPrice: number;

//     };
//     paymentStatus: {
//         isPaid: boolean;
//         paymentMethod: 'cash' | 'card';
//         paymentDate: Date;
//     },
//     deliveryDetails: {
//         buyerAddress: string;
//         riderId: mongoose.Schema.Types.ObjectId;
//         deliveryDate: Date | null;
//         payForDelivery: "after delivery" | "before delivery";
//     }

//     createdAt?: Date;
//     updatedAt?: Date;
// }

import { Document, Types } from 'mongoose';

export enum EscrowStatus {
    USER_PAID = "user_paid",
    ITEM_PICKED_UP = "item_picked_up",
    PRODUCT_IN_TRANSIT = "product_in_transit",
    PRODUCT_DELIVERED = "product_delivered",
    ITEM_CONFIRMED = "item_confirmed",
}

export enum NegotiationStatus {
    NEGOTIATION_REQUESTED = "negotiation_requested",
    NEGOTIATION_ACCEPTED = "negotiation_accepted",
    NEGOTIATION_DECLINED = "negotiation_declined",
}

export enum EscrowAction {
    MARK_AS_PURCHASED = "mark_as_purchased",
    SCHEDULE_DELIVERY = "schedule_delivery",
    FLAG_TRANSACTION = "flag_transaction",
    RELEASE_FUNDS = "release_funds",
}


export interface IEscrowAction extends Document {
    escrowId: Types.ObjectId;
    product: Types.ObjectId;
    status: EscrowStatus;
    action: EscrowAction;
    buyer: Types.ObjectId;
    seller: Types.ObjectId;
    negotiation: {
        status: NegotiationStatus;
        proposedPrice: number;
    };
    paymentStatus: {
        isPaid: boolean;
        paymentMethod: 'cash' | 'card';
        paymentDate: Date;
    };
    deliveryDetails: {
        buyerAddress: string;
        riderId: Types.ObjectId;
        deliveryDate?: Date;
        payForDelivery: 'after delivery' | 'before delivery';
    };
    createdAt?: Date;
    updatedAt?: Date;
}