import type { UserRole } from "@/context/app-context";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
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
