import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Play, CheckCircle, Clock, AlertTriangle, ArrowLeft, Flame, Soup } from 'lucide-react';
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
    if (seconds > 900) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 animate-pulse border border-red-500/20"><AlertTriangle size={12} /> HIGH</span>;
    if (seconds > 600) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">MEDIUM</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">NORMAL</span>;
  };

  const getCardBorder = () => {
    if (order.status === 'Cooking') {
      return 'border-orange-500/40 shadow-xl shadow-orange-500/5 bg-slate-900/80';
    }
    if (order.status === 'Ready') {
      return 'border-green-500/30 bg-slate-900/40';
    }
    return 'border-slate-800 bg-slate-900/40';
  };

  return (
    <div className={`border rounded-[32px] p-5 shadow-2xl flex flex-col justify-between transition-all duration-300 relative ${getCardBorder()}`}>
      
      {order.status === 'Cooking' && (
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center border-4 border-[#0B1120] shadow-lg animate-flicker">
          <Flame size={18} className="text-white fill-orange-300" />
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{order.tableName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{order.orderCode}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-slate-500" />
              <Timer startTime={order.createdAt} />
            </div>
            {getPriorityBadge(elapsedSeconds)}
          </div>
        </div>

        <ul className="space-y-3 mb-6 divide-y divide-slate-800/50">
          {order.orderDetails.map(item => (
            <li key={item.id} className="pt-3 first:pt-0">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-200">
                <span>{item.quantity} x {item.foodName}</span>
                {order.status === 'Cooking' && (
                  <div className="flex flex-col items-center relative h-6 w-6">
                    <Soup size={16} className="text-orange-400 absolute bottom-0" />
                    <span className="text-[8px] text-orange-300 absolute -top-1 animate-steam">~</span>
                    <span className="text-[8px] text-orange-300 absolute -top-2 left-2 animate-steam" style={{ animationDelay: '0.4s' }}>~</span>
                  </div>
                )}
              </div>
              {item.notes && <p className="text-xs text-red-400 italic mt-1.5 bg-red-500/10 p-2 rounded-xl">{item.notes}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        {order.status === 'Pending' && <button onClick={() => onChangeStatus(order.id, 1)} className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"><Play size={16} /> START</button>}
        {order.status === 'Cooking' && <button onClick={() => onChangeStatus(order.id, 2)} className="w-full bg-orange-600 hover:bg-orange-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 animate-pulse"><Flame size={16} /> MARK READY</button>}
        {order.status === 'Ready' && <button onClick={() => onChangeStatus(order.id, 3)} className="w-full bg-green-600 hover:bg-green-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle size={16} /> COMPLETE</button>}
      </div>
    </div>
  );
};

const KitchenDashboard: React.FC = () => {
  useSignalR();
  const navigate = useNavigate();
  const { orders, setOrders } = useOrderStore();

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

  const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Cooking' || o.status === 'Ready');

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 text-white relative">
      <button 
        onClick={() => navigate('/admin/dashboard')}
        className="absolute top-8 right-8 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition"
      >
        <ArrowLeft size={16} /> Exit KDS
      </button>

      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800 pr-36">
        <div className="flex items-center gap-3">
          <ChefHat className="text-blue-500" size={32} />
          <div><h1 className="text-3xl font-bold tracking-tight">Kitchen Display</h1><p className="text-slate-400 text-sm">Realtime order monitoring</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeOrders.map(order => (
          <KdsCard key={order.id} order={order} onChangeStatus={handleChangeStatus} />
        ))}
      </div>
    </div>
  );
};

export default KitchenDashboard;