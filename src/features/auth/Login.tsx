import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import apiClient from '../../services/apiClient';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 0 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await apiClient.post('/auth/login', {
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        if (data.role === 'Admin') {
          navigate('/admin/dashboard');
        } else if (data.role === 'Chef') {
          navigate('/kitchen');
        } else if (data.role === 'Cashier') {
          navigate('/cashier');
        } else if (data.role === 'Waiter') {
          navigate('/waiter'); 
        } else {
          navigate('/login');
        }
      } else {
        await apiClient.post('/auth/setup-admin');
        alert('Khởi tạo tài khoản Admin thành công! Hãy đăng nhập bằng admin/123456');
        setIsLogin(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -bottom-40 -right-40" />

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[32px] shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-4 border border-blue-500/30">
            <ChefHat size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin ? 'Sign in to access your dashboard' : 'Setup default system administrator account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="System Administrator" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition" 
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-2">Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl transition disabled:bg-slate-800 flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {loading ? 'PROCESSING...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800/60 pt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-500 hover:text-blue-400 font-semibold transition"
          >
            {isLogin ? 'Setup first Administrator account?' : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;