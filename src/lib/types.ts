import type { UserRole } from "@/context/app-context";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export interface UserProfile {
    id: string;
    role: UserRole;
    email: string;
    firstName: string;
    lastName: string;
    contactNumber?: string;
    location?: string;
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  farmer: string;
  price: number;
  quantity: number;
  imageUrl: string;
  imageHint: string;
  unit?: string;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  cropType: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  location: string;
  harvestDate: string;
  listingDate: string;
  description: string;
  imageUrl?: string;
  imageHint?: string;
  traceHash?: string;
}


export interface Auction {
  id: string;
  crop: Crop;
  currentBid: number;
  endTime: Date;
  bidderCount: number;
}

export interface TraceEvent {
  event: string;
  timestamp: Date;
  location: string;
  details: string;
}

export interface Order {
  id: string;
  buyerId: string;
  cropListingId: string;
  quantity: number;
  orderDate: string;
  deliveryAddress: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  transportId?: string;
  // Denormalized data for easier display
  cropListing?: CropListing;
  buyer?: UserProfile;
}

export interface TransportRequest {
    id: string;
    orderId: string;
    pickupLocation: string;
    deliveryLocation: string;
    requiredVehicle: string;
    status: 'open' | 'in-progress' | 'completed';
}

export interface TransportBid {
    id: string;
    transportRequestId: string;
    transporterId: string;
    bidAmount: number;
    estimatedDeliveryDate: string;
    status: 'pending' | 'accepted' | 'rejected';
}
