import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useOrderStore } from '../store/useOrderStore';
import { speakVietnamese } from '../utils/speech';

const HUB_URL = 'https://rbe-1gj9.onrender.com/orderHub';

export const useSignalR = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const addOrder = useOrderStore(state => state.addOrder);
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);
  const addNotification = useOrderStore(state => state.addNotification);
  const updateTableStatus = useOrderStore(state => state.updateTableStatus);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();
    setConnection(conn);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start().then(() => {
        
        connection.on('ReceiveNewOrder', (newOrder: any) => {
          addOrder(newOrder);
          const userStr = localStorage.getItem('user');
          const role = userStr ? JSON.parse(userStr).role : '';
          
          if (['Chef', 'Waiter', 'Admin'].includes(role)) {
            speakVietnamese(`${newOrder.tableName} vừa đặt món mới`);
          }
        });

        connection.on('OrderStatusUpdated', (id: number, status: string) => {
          updateOrderStatus(id, status);
        });

        connection.on('ReceiveTableCall', (tableId: number, tableName: string, type: string) => {
          addNotification({ id: Date.now(), tableId, tableName, type });
          
          const userStr = localStorage.getItem('user');
          const role = userStr ? JSON.parse(userStr).role : '';

          if (type === 'Bill' && ['Cashier', 'Waiter', 'Admin'].includes(role)) {
            speakVietnamese(`${tableName} yêu cầu thanh toán`);
          } else if (type === 'Assistance' && ['Waiter', 'Admin'].includes(role)) {
            speakVietnamese(`${tableName} gọi phục vụ`);
          }
        });

        connection.on('TableStatusUpdated', (tableId: number, status: number) => {
          updateTableStatus(tableId, status);
        });

      }).catch(err => console.error(err));
    }
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection, addOrder, updateOrderStatus, addNotification, updateTableStatus]);

  return { connection };
};