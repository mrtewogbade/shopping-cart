export enum ProviderStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export interface IProvider extends Document {
    name: string;
    email: string;
    status: ProviderStatus;
    availableTimes: string[];
    riders: mongoose.Schema.Types.ObjectId[];
    itemSizes: IItemSize[];  
    locationPricing: ILocationPricing[];
}