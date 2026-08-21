import { create } from 'zustand';

export interface CartItem {
  cartItemId: string;
  foodId: number;
  foodName: string;
  price: number;
  quantity: number;
  notes: string;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (newItem) => set((state) => {
    const existingItem = state.items.find(i => i.cartItemId === newItem.cartItemId);
    if (existingItem) {
      return {
        items: state.items.map(i => 
          i.cartItemId === newItem.cartItemId 
            ? { ...i, quantity: i.quantity + newItem.quantity, notes: newItem.notes } 
            : i
        )
      };
    }
    return { items: [...state.items, newItem] };
  }),
  removeFromCart: (cartItemId) => set((state) => ({
    items: state.items.filter(i => i.cartItemId !== cartItemId)
  })),
  updateQuantity: (cartItemId, quantity) => set((state) => ({
    items: quantity <= 0 
      ? state.items.filter(i => i.cartItemId !== cartItemId)
      : state.items.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i)
  })),
  clearCart: () => set({ items: [] }),
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
}));