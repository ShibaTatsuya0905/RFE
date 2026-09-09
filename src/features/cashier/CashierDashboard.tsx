import React, { useEffect, useState } from 'react';
import { Receipt, Coins, QrCode, Printer, Table as TableIcon, X, Check, History, Clock, Bell } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useOrderStore } from '../../store/useOrderStore';
import { speakVietnamese } from '../../utils/speech';
import { useSignalR } from '../../hooks/useSignalR';
import type { Order } from '../../types';

const CashierDashboard: React.FC = () => {
  useSignalR();
  const { orders, setOrders, notifications, removeNotification } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/orders/active').then(res => setOrders(res.data));
  }, [setOrders]);

  const fetchHistory = async () => {
    try {
      const { data } = await apiClient.get('/orders/active');
      setOrderHistory(data);
    } catch (error) {}
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handlePay = async (paymentMethod: string) => {
    if (!selectedOrder) return;
    try {
      await apiClient.put(`/orders/${selectedOrder.id}/pay`, JSON.stringify(paymentMethod), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      speakVietnamese(`Thanh toán thành công ${selectedOrder.tableName}`);
      
      setOrders(orders.filter(o => o.id !== selectedOrder.id));
      setSelectedOrder(null);
      setIsQrModalOpen(false);
    } catch (error) {
      alert('Lỗi khi thanh toán!');
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    const billNotif = notifications.find(n => n.tableId === order.tableId && n.type === 'Bill');
    if (billNotif) {
      removeNotification(billNotif.id);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-black text-white font-sans overflow-hidden print:hidden">
        <div className="w-96 bg-gray-900 border-r border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="text-blue-500" size={28} />
              <h1 className="text-xl font-bold">Thu Ngân POS</h1>
            </div>
          </div>

          <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
            <button 
              onClick={() => setActiveTab('active')} 
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Đang phục vụ
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <History size={14} /> Lịch sử đơn
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'active' && orders.map(order => {
              const billNotif = notifications.find(n => n.tableId === order.tableId && n.type === 'Bill');
              const isSelected = selectedOrder?.id === order.id;
              
              return (
                <div 
                  key={order.id} 
                  onClick={() => handleSelectOrder(order)}
                  className={`p-4 cursor-pointer rounded-2xl border transition duration-200 ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/30' 
                      : billNotif 
                        ? 'bg-yellow-500/10 border-yellow-500 shadow-lg shadow-yellow-500/20 animate-pulse'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <TableIcon size={18} className={billNotif && !isSelected ? 'text-yellow-500' : 'text-gray-400'} />
                      <span className={`font-bold text-lg ${billNotif && !isSelected ? 'text-yellow-500' : ''}`}>{order.tableName}</span>
                    </div>
                    {billNotif && !isSelected ? (
                      <span className="text-yellow-500 text-xs font-bold flex items-center gap-1"><Bell size={14} /> YÊU CẦU BILL</span>
                    ) : (
                      <span className="text-green-400 font-bold">{order.totalAmount.toLocaleString()} đ</span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Mã đơn: {order.orderCode}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}

            {activeTab === 'history' && orderHistory.map(order => (
              <div key={order.id} className="p-4 rounded-2xl border bg-slate-900 border-slate-800 opacity-80">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-white">{order.tableName}</span>
                  <span className="text-slate-300 font-bold">{order.totalAmount.toLocaleString()} đ</span>
                </div>
                <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800 pt-2 mt-2">
                  <p className="flex items-center gap-1"><Clock size={12} /> Tạo lúc: {new Date(order.createdAt).toLocaleTimeString()} - {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Mã: {order.orderCode} • Trạng thái: <span className="text-blue-400 font-semibold">{order.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-black p-8 flex items-center justify-center">
          {selectedOrder ? (
            <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-xl border border-gray-800 shadow-2xl animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-wider">HÓA ĐƠN ĐẶT MÓN</h2>
                <p className="text-sm text-gray-400 mt-1">Mã hóa đơn: {selectedOrder.orderCode}</p>
                <p className="text-sm text-gray-400">{selectedOrder.tableName}</p>
              </div>

              <div className="space-y-4 mb-6 border-t border-b border-gray-800 py-6 max-h-[300px] overflow-y-auto">
                {selectedOrder.orderDetails.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-200">{item.foodName}</p>
                      {item.notes && <p className="text-xs text-blue-400 italic">{item.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">{item.quantity} x {item.unitPrice.toLocaleString()} đ</p>
                      <p className="font-bold text-gray-200">{(item.quantity * item.unitPrice).toLocaleString()} đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-2xl font-bold mb-8 border-b border-gray-800 pb-4">
                <span>TỔNG CỘNG:</span>
                <span className="text-green-400">{selectedOrder.totalAmount.toLocaleString()} đ</span>
              </div>

              <div className="space-y-3">
                <div className="flex gap-4">
                  <button onClick={() => handlePay('Cash')} className="flex-1 bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition">
                    <Coins size={20} />
                    Tiền mặt
                  </button>
                  <button onClick={() => setIsQrModalOpen(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition">
                    <QrCode size={20} />
                    Mã QR
                  </button>
                </div>
                <button onClick={() => window.print()} className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition text-gray-300">
                  <Printer size={18} />
                  In hóa đơn kèm QR
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Receipt size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Chọn một bàn đang hoạt động bên trái để tính tiền</p>
            </div>
          )}
        </div>

        {isQrModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative text-center animate-slide-up">
              <button onClick={() => setIsQrModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
              <h3 className="text-2xl font-bold mb-1 text-white">Chuyển Khoản QR</h3>
              <p className="text-sm text-slate-400 mb-6">Quét mã để thanh toán đơn hàng</p>
              
              <div className="w-56 h-56 bg-white p-2 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <img 
                  src={`https://img.vietqr.io/image/vietinbank-105876001630-compact2.png?amount=${selectedOrder.totalAmount}&addInfo=${selectedOrder.orderCode}&accountName=LE%20MINH%20TUAN`} 
                  alt="VietQR" 
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>

              <div className="bg-slate-950/40 p-4 rounded-2xl text-left text-xs space-y-1.5 border border-slate-800/40 mb-6 font-semibold">
                <div className="flex justify-between"><span className="text-slate-500">Ngân hàng:</span><span className="text-slate-200">VietinBank (Công Thương)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Số tài khoản:</span><span className="text-slate-200 font-mono">105876001630</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Chủ tài khoản:</span><span className="text-slate-200">LE MINH TUAN</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Số tiền:</span><span className="text-green-400 font-bold">{selectedOrder.totalAmount.toLocaleString()} đ</span></div>
              </div>

              <button 
                onClick={() => handlePay('QrCode')}
                className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition"
              >
                <Check size={18} /> XÁC NHẬN ĐÃ NHẬN TIỀN
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="hidden print:block w-[80mm] mx-auto bg-white text-black p-4 font-mono text-xs leading-tight">
          <div className="text-center mb-3">
            <h2 className="text-base font-bold tracking-widest">GOURMET PALACE</h2>
            <p className="text-[10px]">123 Nguyen Hue, District 1, HCMC</p>
            <p className="text-[10px]">Hotline: 0901234567</p>
            <div className="border-b border-dashed border-black my-2" />
            <p className="font-bold text-sm">{selectedOrder.tableName}</p>
            <p className="text-[10px]">Mã đơn: {selectedOrder.orderCode}</p>
            <p className="text-[10px]">Giờ vào: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
          </div>
          <div className="border-b border-dashed border-black my-2" />
          <div className="space-y-1">
            {selectedOrder.orderDetails.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.quantity} x {item.foodName}</span>
                <span className="font-semibold">{(item.quantity * item.unitPrice).toLocaleString()} đ</span>
              </div>
            ))}
          </div>
          <div className="border-b border-dashed border-black my-2" />
          <div className="flex justify-between font-bold text-sm mb-4">
            <span>TỔNG THANH TOÁN:</span>
            <span>{selectedOrder.totalAmount.toLocaleString()} đ</span>
          </div>
          <div className="text-center space-y-2 pt-2 border-t border-dashed border-black">
            <p className="font-bold text-[10px] tracking-wider">QUÉT MÃ CHUYỂN KHOẢN (VIETQR)</p>
            <div className="w-44 h-44 mx-auto p-1 bg-white border border-gray-300 rounded-xl">
              <img src={`https://img.vietqr.io/image/vietinbank-105876001630-compact2.png?amount=${selectedOrder.totalAmount}&addInfo=${selectedOrder.orderCode}&accountName=LE%20MINH%20TUAN`} alt="VietQR" className="w-full h-full object-contain" />
            </div>
            <div className="border-b border-dashed border-black my-2" />
            <p className="italic text-[10px]">Cảm ơn quý khách & Hẹn gặp lại!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CashierDashboard;