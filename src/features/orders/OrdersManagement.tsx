import React, { useEffect, useState } from 'react';
import { 
  Search, SlidersHorizontal, Eye, Printer, X, 
  CheckCircle2, Clock, RotateCcw, ChevronLeft, ChevronRight 
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useSignalR } from '../../hooks/useSignalR';
import { useOrderStore } from '../../store/useOrderStore';
import type { Order } from '../../types';

const OrdersManagement: React.FC = () => {
  useSignalR();
  const { orders, setOrders, updateOrderStatus } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    apiClient.get('/orders/active').then(res => setOrders(res.data));
  }, [setOrders]);

  const handleUpdateStatus = async (orderId: number, nextStatus: number) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, nextStatus, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = { ...selectedOrder, status: getStatusString(nextStatus) };
        setSelectedOrder(updated);
      }
    } catch (error) {
      alert('Error updating status');
    }
  };

  const getStatusString = (status: number): string => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Cooking';
      case 2: return 'Ready';
      case 3: return 'Served';
      case 4: return 'Paid';
      default: return 'Cancelled';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Served':
        return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'Cooking':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      default:
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Orders Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all dining transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by order ID or table..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Cooking">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Served">Served</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/30">
                <th className="p-4">Order Code</th>
                <th className="p-4">Table</th>
                <th className="p-4">Time</th>
                <th className="p-4">Total Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/10">
                  <td className="p-4 font-bold text-blue-500">{order.orderCode}</td>
                  <td className="p-4 text-white font-medium">{order.tableName}</td>
                  <td className="p-4 text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</td>
                  <td className="p-4 text-slate-200 font-semibold">{order.totalAmount.toLocaleString()} đ</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-400 bg-slate-950/10">
            <span>Showing {paginatedOrders.length} of {filteredOrders.length} orders</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 rounded-lg transition text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 rounded-lg transition text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-slate-950 w-full max-w-lg h-full border-l border-slate-800 p-6 flex flex-col justify-between animate-slide-up shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedOrder.tableName}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedOrder.orderCode}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 mb-6 max-h-[45vh] overflow-y-auto">
                {selectedOrder.orderDetails.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
                    <div>
                      <h4 className="font-semibold text-white">{item.foodName}</h4>
                      {item.notes && <p className="text-xs text-red-400 mt-1 italic">Note: {item.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400">{item.quantity} x {item.unitPrice.toLocaleString()} đ</p>
                      <p className="font-bold text-slate-200">{(item.quantity * item.unitPrice).toLocaleString()} đ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>TOTAL AMOUNT:</span>
                <span className="text-green-500">{selectedOrder.totalAmount.toLocaleString()} đ</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {selectedOrder.status === 'Pending' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 1)}
                    className="col-span-2 bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition text-white"
                  >
                    <Clock size={18} /> Start Preparing
                  </button>
                )}
                {selectedOrder.status === 'Cooking' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 2)}
                    className="col-span-2 bg-green-600 hover:bg-green-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition text-white"
                  >
                    <CheckCircle2 size={18} /> Mark Ready
                  </button>
                )}
                {selectedOrder.status !== 'Paid' && selectedOrder.status !== 'Cancelled' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 5)}
                    className="col-span-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                  >
                    <X size={18} /> Cancel Order
                  </button>
                )}
              </div>

              <button 
                onClick={() => window.print()}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-slate-300"
              >
                <Printer size={18} /> Print Invoice Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;