import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, ChefHat, Table, 
  Menu, BarChart3, Users, Settings, LogOut 
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
  { id: 'orders', name: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
  { id: 'tables', name: 'Tables', icon: <Table size={20} />, path: '/admin/tables' },
  { id: 'menu', name: 'Menu', icon: <Menu size={20} />, path: '/admin/menu' },
  { id: 'revenue', name: 'Revenue', icon: <BarChart3 size={20} />, path: '/admin/revenue' },
  { id: 'employees', name: 'Employees', icon: <Users size={20} />, path: '/admin/employees' },
  { id: 'settings', name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col h-screen shrink-0">
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <ChefHat size={24} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-wider text-white">RESTAURANT</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition duration-200 relative group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md" />
              )}
              <span className={`transition-colors duration-200 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl text-red-500 hover:bg-red-500/5 transition duration-200"
        >
          <LogOut size={20} />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;