// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photo?: string;
  role: 'producer' | 'shareur' | 'client';
  address?: string;
  coordinates?: { lat: number; lng: number };
  status?: 'individual' | 'company';
  description?: string;
  xp: number;
  badges: string[];
}

export interface Product {
  id: string;
  producerId: string;
  producerName: string;
  name: string;
  format: string;
  description: string;
  photo: string;
  category: 'fruits' | 'legumes' | 'viandes' | 'fromages' | 'epicerie';
  labels: string[];
  pricePerUnit: number;
  unit: 'kg' | 'piece' | 'bocal' | 'litre';
  availableQuantity: number;
  productionInfo?: string;
  inStock: boolean;
  distance?: number;
  saleType: 'retrait-ferme' | 'point-relais' | 'livraison';
  likes: number;
}

export interface GroupOrder {
  id: string;
  shareurId: string;
  shareurName: string;
  producerId: string;
  producerName: string;
  title: string;
  deadline: string;
  minWeight: number;
  maxWeight: number;
  shareurPercentage: number;
  receptionInfo: string;
  message: string;
  products: OrderProduct[];
  status: 'open' | 'closed' | 'delivered';
  currentWeight: number;
  createdAt: string;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  basePrice: number;
  logisticsCost: number;
  shareurShare: number;
  finalPrice: number;
}

export interface Message {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  timestamp: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'producer-1',
    email: 'ferme@troiavallees.fr',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'producer',
    address: 'Ferme des Trois Vallées, 12 km',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    description: 'Producteur de viandes et charcuteries fermières depuis 3 générations',
    xp: 1250,
    badges: ['producteur-verifie', 'bio-certifie'],
  },
  {
    id: 'shareur-1',
    email: 'marie@example.com',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'shareur',
    address: '15 rue de la République, 75001 Paris',
    coordinates: { lat: 48.8606, lng: 2.3376 },
    status: 'individual',
    xp: 850,
    badges: ['super-partageur'],
  },
  {
    id: 'client-1',
    email: 'pierre@example.com',
    firstName: 'Pierre',
    lastName: 'Durand',
    role: 'client',
    address: '32 avenue des Champs, 75008 Paris',
    xp: 320,
    badges: ['client-fidele'],
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    producerId: 'producer-1',
    producerName: 'Ferme des Trois Vallées',
    name: 'Tomates anciennes',
    format: '1 kg',
    description: 'Barquette de 1 kg',
    photo: '',
    category: 'legumes',
    labels: ['AB', 'Bio'],
    pricePerUnit: 4.80,
    unit: 'kg',
    availableQuantity: 50,
    productionInfo: 'Cultivées sans pesticides',
    inStock: true,
    distance: 12,
    saleType: 'retrait-ferme',
    likes: 32,
  },
  {
    id: 'prod-2',
    producerId: 'producer-1',
    producerName: 'La Chèvrerie du Bois',
    name: 'Fromage de chèvre frais',
    format: '120 g',
    description: 'Pièce de 120 g environ',
    photo: '',
    category: 'fromages',
    labels: ['Ferme'],
    pricePerUnit: 3.90,
    unit: 'piece',
    availableQuantity: 30,
    productionInfo: 'Lait de chèvres élevées en plein air',
    inStock: true,
    distance: 25,
    saleType: 'point-relais',
    likes: 18,
  },
  {
    id: 'prod-3',
    producerId: 'producer-1',
    producerName: 'Verger du Plateau',
    name: 'Pommes Gala',
    format: '2 kg',
    description: 'Sac de 2 kg',
    photo: '',
    category: 'fruits',
    labels: ['Vergers écoresponsables'],
    pricePerUnit: 5.20,
    unit: 'kg',
    availableQuantity: 100,
    productionInfo: 'Variété Gala, récoltée à maturité',
    inStock: true,
    distance: 8,
    saleType: 'retrait-ferme',
    likes: 45,
  },
  {
    id: 'prod-4',
    producerId: 'producer-1',
    producerName: 'Ferme des Trois Vallées',
    name: 'Foie gras mi-cuit',
    format: '120 g',
    description: 'Bocal 120 g',
    photo: '',
    category: 'viandes',
    labels: ['Produit phare', 'Fêtes'],
    pricePerUnit: 13.75,
    unit: 'bocal',
    availableQuantity: 25,
    productionInfo: 'Élevage fermier traditionnel',
    inStock: true,
    distance: 12,
    saleType: 'retrait-ferme',
    likes: 67,
  },
  {
    id: 'prod-5',
    producerId: 'producer-1',
    producerName: 'Ferme Ménaoute',
    name: 'Rillettes',
    format: '250 g',
    description: 'Bocal 250 g',
    photo: '',
    category: 'viandes',
    labels: ['Aperitif', 'À tartiner'],
    pricePerUnit: 3.96,
    unit: 'bocal',
    availableQuantity: 40,
    productionInfo: 'Recette artisanale',
    inStock: true,
    distance: 15,
    saleType: 'livraison',
    likes: 28,
  },
  {
    id: 'prod-6',
    producerId: 'producer-1',
    producerName: 'Ferme Campagne',
    name: 'Pâté paysan',
    format: '180 g',
    description: 'Bocal 180 g',
    photo: '',
    category: 'viandes',
    labels: ['Campagne', 'Tartine'],
    pricePerUnit: 5.28,
    unit: 'bocal',
    availableQuantity: 35,
    productionInfo: 'Viande de porc fermier',
    inStock: true,
    distance: 18,
    saleType: 'point-relais',
    likes: 41,
  },
];

// Mock Group Orders
export const mockGroupOrders: GroupOrder[] = [
  {
    id: 'order-1',
    shareurId: 'shareur-1',
    shareurName: 'Marie Martin',
    producerId: 'producer-1',
    producerName: 'Ferme des Trois Vallées',
    title: 'Foie gras – Quartier centre',
    deadline: '2025-12-15',
    minWeight: 5,
    maxWeight: 20,
    shareurPercentage: 10,
    receptionInfo: 'Mardi et jeudi de 18h à 20h',
    message: 'Retrait chez moi, à l\'adresse enregistrée. Sonnez au 2ème étage.',
    products: [
      {
        productId: 'prod-4',
        quantity: 10,
        basePrice: 13.75,
        logisticsCost: 1.20,
        shareurShare: 1.38,
        finalPrice: 16.33,
      },
    ],
    status: 'open',
    currentWeight: 1.2,
    createdAt: '2025-11-20',
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    orderId: 'order-1',
    userId: 'client-1',
    userName: 'Pierre Durand',
    content: 'Bonjour, à quelle heure exactement puis-je venir récupérer ma commande mardi ?',
    timestamp: '2025-11-22T14:30:00Z',
  },
  {
    id: 'msg-2',
    orderId: 'order-1',
    userId: 'shareur-1',
    userName: 'Marie Martin',
    content: 'Bonjour Pierre, vous pouvez passer entre 18h et 20h, je serai là !',
    timestamp: '2025-11-22T15:15:00Z',
  },
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductsByProducer = (producerId: string): Product[] => {
  return mockProducts.filter(p => p.producerId === producerId);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};

export const getOrdersByShareur = (shareurId: string): GroupOrder[] => {
  return mockGroupOrders.filter(o => o.shareurId === shareurId);
};

export const getOrderById = (id: string): GroupOrder | undefined => {
  return mockGroupOrders.find(o => o.id === id);
};

export const getMessagesByOrder = (orderId: string): Message[] => {
  return mockMessages.filter(m => m.orderId === orderId);
};
