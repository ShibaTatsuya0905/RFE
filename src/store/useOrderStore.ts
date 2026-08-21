import { create } from 'zustand';
import type { Order } from '../types';

interface OrderState {
  orders: Order[];
  notifications: any[];
  tables: any[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: number, newStatus: string) => void;
  addNotification: (notif: any) => void;
  removeNotification: (id: number) => void;
  setTables: (tables: any[]) => void;
  updateTableStatus: (tableId: number, status: number) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  notifications: [],
  tables: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ 
    orders: [order, ...state.orders]
  })),
  updateOrderStatus: (orderId, newStatus) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
  })),
  addNotification: (notif) => set((state) => ({
    notifications: [notif, ...state.notifications]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  setTables: (tables) => set({ tables }),
  updateTableStatus: (tableId, status) => set((state) => ({
    tables: state.tables.map(t => t.id === tableId ? { ...t, status } : t)
  })),
}));