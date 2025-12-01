export type UserRole = 'producer' | 'sharer' | 'client';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  handle?: string;
  profileImage?: string;
  profileVisibility?: 'public' | 'private';
  addressVisibility?: 'public' | 'private';
  tagline?: string;
  website?: string;
  address?: string;
  verified?: boolean;
  businessStatus?: string;
  producerId?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
  imageUrl: string;
  producerId: string;
  producerName: string;
  producerLocation: string;
  inStock: boolean;
  measurement: 'unit' | 'kg';
  weightKg?: number;
}

export interface DeckCard extends Product {
  addedAt: Date;
}

export interface GroupOrder {
  id: string;
  title: string;
  sharerId: string;
  sharerName: string;
  products: Product[];
  producerId: string;
  producerName: string;
  sharerPercentage: number;
  minWeight: number;
  maxWeight: number;
  deadline: Date;
  pickupAddress: string;
  message: string;
  status: 'open' | 'closed' | 'completed';
  visibility: 'public' | 'private';
  totalValue: number;
  participants: number;
  pickupSlots?: Array<{
    day: string;
    start?: string;
    end?: string;
    label?: string;
  }>;
  mapLocation?: {
    lat: number;
    lng: number;
    radiusMeters: number;
    areaLabel: string;
  };
}
