import React, { useEffect } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import apiClient from '../../services/apiClient';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Served':
    case 'Paid':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500">Served</span>;
    case 'Cooking':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400">Cooking</span>;
    case 'Pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-500">Pending</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">Cancelled</span>;
  }
};

const RecentTransactions: React.FC = () => {
  const { orders, setOrders } = useOrderStore();

  useEffect(() => {
    apiClient.get('/orders/active').then(res => setOrders(res.data));
  }, [setOrders]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Recent Orders</h3>
          <p className="text-xs text-slate-400 mt-0.5">Realtime monitoring of active transactions</p>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3">Order</th>
              <th className="pb-3">Table</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-800/10 transition duration-150">
                <td className="py-4 font-bold text-blue-500">{order.orderCode}</td>
                <td className="py-4 text-slate-300 font-medium">{order.tableName}</td>
                <td className="py-4">{getStatusBadge(order.status)}</td>
                <td className="py-4 text-slate-300 font-semibold">{order.totalAmount.toLocaleString()} đ</td>
                <td className="py-4 text-slate-400 text-xs">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">No active transactions at the moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;