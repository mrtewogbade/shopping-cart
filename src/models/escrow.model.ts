import mongoose, {model, Schema} from "mongoose";

import { IEscrowAction, EscrowStatus, NegotiationStatus } from "../interfaces/IEscrow";



const escrowSchema = new Schema<IEscrowAction>({  
   escrowId: { 
         type: Schema.Types.ObjectId, required: true 
},
product: { 
         type: Schema.Types.ObjectId, required: true, 
         ref: 'Product'
        },
status: {
        type: String,
        enum: Object.values(EscrowStatus),
        default: EscrowStatus.USER_PAID
    },
action: { 
         type: String, required: true 
},
buyer: { 
         type: Schema.Types.ObjectId, required: true, 
         ref: 'User'
        },
seller: { 
         type: Schema.Types.ObjectId, required: true, 
         ref: 'User'
        },
negotiation: { 
         status: { 
             type: String, required: true, 
             enum: Object.values(NegotiationStatus) 
        },
         proposedPrice: { 
             type: Number, required: true 
        }
    },
paymentStatus: { 
         isPaid: { 
             type: Boolean, required: true 
        },
         paymentMethod: { 
             type: String, required: true, 
             enum: ['cash', 'card'], 
        },
         paymentDate: { 
             type: Date, required: true 
        }
    },
    deliveryDetails: {
        buyerAddress: {
            type: String, required: true
        },
        riderId: {
            type: Schema.Types.ObjectId, required: true,
            ref: 'User'
        },
        deliveryDate: {
            type: Date
        },
        payForDelivery: {
            type: String, required: true,
            enum: ['after delivery', 'before delivery']
        }
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
}, { timestamps: true });

export const Escrow = model<IEscrowAction>("Escrow", escrowSchema);