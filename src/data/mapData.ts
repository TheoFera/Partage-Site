import { Product } from '../types';
import { mockProducts } from './mockData';

export interface NearbySharer {
  id: string;
  name: string;
  handle: string;
  distance: string;
  area: string;
  badge?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  locationHint: string;
  products: Product[];
}

export const nearbySharers: NearbySharer[] = [
  {
    id: 's1',
    name: 'Lina',
    handle: 'lina_partage',
    distance: '0.8 km',
    area: 'Belleville',
    badge: 'Bio',
    coordinates: {
      lat: 48.8725,
      lng: 2.377,
    },
    radiusMeters: 450,
    locationHint: 'Autour du parc de Belleville',
    products: [mockProducts[0], mockProducts[1]],
  },
  {
    id: 's2',
    name: 'Noah',
    handle: 'noah_communs',
    distance: '1.3 km',
    area: 'Canal',
    badge: 'Express',
    coordinates: {
      lat: 48.8712,
      lng: 2.3635,
    },
    radiusMeters: 350,
    locationHint: 'Pres de la passerelle du Canal',
    products: [mockProducts[3], mockProducts[2]],
  },
  {
    id: 's3',
    name: 'Sara',
    handle: 'sara_voisins',
    distance: '2.1 km',
    area: 'Montreuil',
    badge: 'Local',
    coordinates: {
      lat: 48.8615,
      lng: 2.4418,
    },
    radiusMeters: 600,
    locationHint: 'Zone Croix-de-Chavaux',
    products: [mockProducts[4], mockProducts[5]],
  },
];
