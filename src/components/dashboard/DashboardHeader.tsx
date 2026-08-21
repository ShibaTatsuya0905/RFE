import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Trash2, AlertCircle } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useSignalR } from '../../hooks/useSignalR';

const DashboardHeader: React.FC = () => {
  useSignalR();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { notifications, removeNotification } = useOrderStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.split(' ');
    return parts.map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="h-20 border-b border-slate-800 px-8 flex items-center justify-between bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-30 print:hidden">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Main Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions, tables, food..." 
            className="w-full bg-[#1E293B]/40 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition duration-200"
          />
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2.5 bg-[#1E293B]/40 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition duration-200 relative"
          >
            {notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
            <Bell size={20} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-slide-up">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                <span className="font-bold text-sm text-white">Notifications ({notifications.length})</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className="flex justify-between items-start gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 text-xs transition hover:border-slate-700"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block mb-0.5">{notif.tableName}</span>
                        <span className="text-slate-400">
                          {notif.type === 'Bill' && 'Yêu cầu thanh toán 💵'}
                          {notif.type === 'Assistance' && 'Cần hỗ trợ 🙋‍♂️'}
                          {notif.type === 'NewOrder' && 'Vừa đặt đơn mới! 🍔'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeNotification(notif.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-10 w-px bg-slate-800" />

        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 text-left hover:opacity-80 transition"
        >
          <div>
            <p className="text-sm font-semibold text-white">{user?.fullName || 'Staff User'}</p>
            <p className="text-xs text-slate-400">{user?.role || 'Staff'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            {getInitials(user?.fullName)}
          </div>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;