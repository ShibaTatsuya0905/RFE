import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Check, Sparkles, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useSignalR } from '../../hooks/useSignalR';
import { useOrderStore } from '../../store/useOrderStore';
import type { Order } from '../../types';

const Timer: React.FC<{ startTime: string }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(startTime).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds: number) => {
    if (seconds > 900) return 'text-red-500 animate-pulse';
    if (seconds > 600) return 'text-orange-500';
    return 'text-green-500';
  };

  return <span className={`font-mono font-bold text-sm ${getTimerColor(elapsed)}`}>{formatTime(elapsed)}</span>;
};

const KdsCard: React.FC<{ order: Order; onChangeStatus: (id: number, status: number) => void }> = ({ order, onChangeStatus }) => {
  const elapsedSeconds = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
  const getPriorityBadge = (seconds: number) => {
    if (seconds > 900) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 animate-pulse border border-red-500/20">HIGH</span>;
    if (seconds > 600) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">MEDIUM</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">NORMAL</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between mb-4">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div><h3 className="text-xl font-bold text-white">{order.tableName}</h3><p className="text-xs text-slate-500">{order.orderCode}</p></div>
          <div className="flex flex-col items-end gap-1.5"><Timer startTime={order.createdAt} />{getPriorityBadge(elapsedSeconds)}</div>
        </div>
        <ul className="space-y-2 mb-6">
          {order.orderDetails.map(item => (
            <li key={item.id} className="text-sm font-semibold text-slate-200">• {item.quantity} x {item.foodName}</li>
          ))}
        </ul>
      </div>
      <button onClick={() => onChangeStatus(order.id, 3)} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Check size={16} /> DELIVERED (ĐÃ BƯNG)</button>
    </div>
  );
};

const WaiterDashboard: React.FC = () => {
  useSignalR();
  const navigate = useNavigate();
  const { orders, setOrders, notifications, removeNotification } = useOrderStore();

  useEffect(() => {
    apiClient.get('/orders/active').then(res => setOrders(res.data));
  }, [setOrders]);

  const handleChangeStatus = async (id: number, status: number) => {
    try {
      await apiClient.put(`/orders/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const readyToServeOrders = orders.filter(o => o.status === 'Ready');

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 text-white font-sans flex justify-center pb-8 overflow-y-auto">
      <div className="w-full max-w-md p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg"><Sparkles size={20} /></div>
              <div><h1 className="font-bold text-lg leading-none">Waiter Hub</h1><span className="text-xs text-slate-400">Realtime delivery</span></div>
            </div>
            <button onClick={handleLogout} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-red-500"><LogOut size={18} /></button>
          </div>

          {notifications.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-bold text-yellow-500 tracking-wider">🔔 ACTIVE NOTIFICATIONS ({notifications.length})</h3>
              {notifications.map(notif => (
                <div key={notif.id} className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex justify-between items-center animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-yellow-500" />
                    <div>
                      <h4 className="font-bold text-white text-lg">{notif.tableName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {notif.type === 'Bill' && 'Yêu cầu tính tiền 💵'}
                        {notif.type === 'Assistance' && 'Cần phục vụ hỗ trợ 🙋‍♂️'}
                        {notif.type === 'NewOrder' && `Vừa đặt món mới! 🍔 (${notif.orderCode})`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeNotification(notif.id)} className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-xs">OK</button>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <span className="font-semibold text-sm text-slate-300">{readyToServeOrders.length} dishes waiting on the pass</span>
          </div>

          <div className="space-y-4">
            {readyToServeOrders.map(order => (
              <KdsCard key={order.id} order={order} onChangeStatus={handleChangeStatus} />
            ))}
            {readyToServeOrders.length === 0 && (
              <div className="text-center py-20 bg-slate-900/10 rounded-3xl border border-slate-800 border-dashed">
                <Bell size={40} className="mx-auto text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm font-semibold">Quiet kitchen... No dishes ready.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;