export type UserRole = 'producer' | 'sharer' | 'client';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  address?: string;
  verified?: boolean;
  businessStatus?: string;
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
  totalValue: number;
  participants: number;
}
