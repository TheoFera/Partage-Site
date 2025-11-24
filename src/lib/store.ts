import { create } from 'zustand';
import { Product, User, GroupOrder } from './mock-data';

interface AppState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Shareur deck
  deck: Product[];
  addToDeck: (product: Product) => void;
  removeFromDeck: (productId: string) => void;
  clearDeck: () => void;

  // Current order being created
  currentOrder: Partial<GroupOrder> | null;
  setCurrentOrder: (order: Partial<GroupOrder> | null) => void;

  // Client cart
  cart: { productId: string; quantity: number }[];
  addToCart: (productId: string, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Filters
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  saleTypeFilter: string;
  setSaleTypeFilter: (saleType: string) => void;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
}

export const useStore = create<AppState>((set) => ({
  // Current user
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Shareur deck
  deck: [],
  addToDeck: (product) =>
    set((state) => {
      if (state.deck.find((p) => p.id === product.id)) {
        return state;
      }
      return { deck: [...state.deck, product] };
    }),
  removeFromDeck: (productId) =>
    set((state) => ({
      deck: state.deck.filter((p) => p.id !== productId),
    })),
  clearDeck: () => set({ deck: [] }),

  // Current order
  currentOrder: null,
  setCurrentOrder: (order) => set({ currentOrder: order }),

  // Client cart
  cart: [],
  addToCart: (productId, quantity) =>
    set((state) => {
      const existing = state.cart.find((item) => item.productId === productId);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        };
      }
      return { cart: [...state.cart, { productId, quantity }] };
    }),
  updateCartQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    })),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    })),
  clearCart: () => set({ cart: [] }),

  // Filters
  categoryFilter: 'all',
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  saleTypeFilter: 'all',
  setSaleTypeFilter: (saleType) => set({ saleTypeFilter: saleType }),
  maxDistance: 30,
  setMaxDistance: (distance) => set({ maxDistance: distance }),
}));
