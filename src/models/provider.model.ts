import { Schema, model, Document } from 'mongoose';

// Interface for LogisticsProvider
export interface ILogisticsProvider extends Document {
    name: string;
    email: string;
    photo?: string;
    riderPool?: Schema.Types.ObjectId[]; // References Rider IDs
    orders?: Schema.Types.ObjectId[]; // References Order IDs
    status?: 'active' | 'inactive';
    rating?: number;

    activePrice?: {
        baseFare?: number;
        bookingFee?: number;
        pricePerKilometer?: number;
        maxFare?: number;
        discountAfterMaxFare?: number;
    };

    deliveryArea?: {
        pickUp?: string;
        dropOff?: string;
        price?: number;
    };

    size?: {
        title?: 'small' | 'medium' | 'large';
        weightRangeKg?: { min: number; max: number };
        price?: number;
    }[];

    unavailabilityTime?: string; // e.g., "22:00"
    availabilityTime?: string; // e.g., "06:00"
}

// Schema for LogisticsProvider
const LogisticsProviderSchema = new Schema<ILogisticsProvider>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        photo: [
            {
                key: { type: String },
                url: { type: String },
            },
        ],
        riderPool: { type: [Schema.Types.ObjectId], ref: 'Rider', default: [] },

        orders: [{ type: Schema.Types.ObjectId, ref: 'Order', default: [] }],
        status: { type: String, enum: ['active', 'inactive'] },
        rating: { type: Number },
        activePrice: {
            baseFare: { type: Number },
            bookingFee: { type: Number },
            pricePerKilometer: { type: Number },
            maxFare: { type: Number },
            discountAfterMaxFare: { type: Number },
        },
        deliveryArea: {
            pickUp: { type: String },
            dropOff: { type: String },
            price: { type: Number },

        },
        size: [
            {
                title: { type: String, enum: ['small', 'medium', 'large'], required: true },
                weightRangeKg: {
                    min: { type: Number },
                    max: { type: Number },
                },
                price: { type: Number },
            },
        ],
        unavailabilityTime: { type: String },
        availabilityTime: { type: String },
    },
    { timestamps: true }
);

// Export LogisticsProvider Model
export const LogisticsProvider = model<ILogisticsProvider>(
    'LogisticsProvider',
    LogisticsProviderSchema
);
