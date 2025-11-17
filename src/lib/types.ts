import type { UserRole } from "@/context/app-context";
import { z } from "zod";

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
  cropListingId: string;
  startDate: string;
  endDate: string;
  startingBid: number;
  currentBid?: number;
  currentBidderId?: string;
  status: 'open' | 'closed';
  bidderCount?: number;

  // Denormalized data
  cropListing?: CropListing;
}

export interface TraceEvent {
  event: string;
  timestamp: string;
  location: string;
  details: string;
}

export interface Traceability {
    id: string;
    events: TraceEvent[];
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
    bidCount?: number;
}

export interface TransportBid {
    id: string;
    transportRequestId: string;
    transporterId: string;
    transporterName: string;
    bidAmount: number;
    estimatedDeliveryDate: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  farmerId: string;
  rating: number; // e.g., 1 to 5
  comment: string;
  reviewDate: string;
  // Denormalized data
  buyerName?: string;
}

const SoilAnalysisFromImageOutputSchema = z.object({
    soilType: z.string().describe("The identified type of the soil (e.g., Sandy Loam, Clay, Silt)."),
    moisture: z.string().describe("An estimation of the soil's moisture level (e.g., Dry, Moist, Wet)."),
    texture: z.string().describe("The classified texture of the soil (e.g., Fine, Medium, Coarse)."),
    phEstimate: z.number().describe("An estimated pH level of the soil (e.g., 6.2)."),
    nutrientAnalysis: z.object({
        nitrogen: z.enum(['Low', 'Moderate', 'High']).describe("The predicted level of Nitrogen."),
        phosphorus: z.enum(['Low', 'Moderate', 'High']).describe("The predicted level of Phosphorus."),
        potassium: z.enum(['Low', 'Moderate', 'High']).describe("The predicted level of Potassium."),
    }),
    fertilityScore: z.number().min(0).max(100).describe("An overall soil fertility score out of 100."),
    recommendedCrops: z.array(z.string()).describe("A list of crop names suitable for the soil."),
    fertilizerPlan: z.array(z.string()).describe("A list of recommended fertilizers and application advice."),
    generalAdvice: z.string().describe("Simple, actionable advice for the farmer to improve soil health."),
});
export type SoilAnalysisFromImageOutput = z.infer<typeof SoilAnalysisFromImageOutputSchema>;


// Represents the data structure for a single soil analysis report stored in Firestore
export interface SoilAnalysis extends SoilAnalysisFromImageOutput {
    id: string;
    farmerId: string;
    analysisDate: string; // ISO string
}

export interface SoilKitOrder {
    id: string;
    userId: string;
    status: 'ordered' | 'shipped' | 'received' | 'processing' | 'completed';
    orderDate: string; // ISO String
    trackingId: string | null;
    soilKitQr: string;
    labReportUrl: string | null;
}

    
