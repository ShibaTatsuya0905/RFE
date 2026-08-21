import React, { useState, useEffect } from 'react';
import { Store, CreditCard, Shield, Bell, Moon, Sun, Save, Lock } from 'lucide-react';

const RestaurantSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'security' | 'preferences'>('general');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Gourmet Palace',
    address: '123 Nguyen Hue, District 1, HCMC',
    phone: '0901234567',
    email: 'contact@gourmetpalace.com',
    hours: '08:00 - 22:30',
    vat: 8,
    currency: 'VND'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const savedInfo = localStorage.getItem('restaurant_settings');
    if (savedInfo) setRestaurantInfo(JSON.parse(savedInfo));
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('restaurant_settings', JSON.stringify(restaurantInfo));
    alert('Restaurant configurations saved and updated across system!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Confirm password does not match!');
      return;
    }
    alert('Password updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const toggleTheme = () => {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure restaurant operation, currency, tax rates and system preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto">
            <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Store size={18} /> General Info</button>
            <button onClick={() => setActiveTab('payment')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'payment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><CreditCard size={18} /> Payment & Tax</button>
            <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Shield size={18} /> Security</button>
            <button onClick={() => setActiveTab('preferences')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'preferences' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Bell size={18} /> Preferences</button>
          </div>
        </div>

        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
          {activeTab === 'general' && (
            <form onSubmit={handleSaveInfo} className="space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4">General Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Restaurant Name</label>
                  <input type="text" value={restaurantInfo.name} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Opening Hours</label>
                  <input type="text" value={restaurantInfo.hours} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, hours: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Address</label>
                  <input type="text" value={restaurantInfo.address} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Hotline Phone</label>
                  <input type="text" value={restaurantInfo.phone} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Email Address</label>
                  <input type="email" value={restaurantInfo.email} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition text-white"><Save size={18} /> Save General Info</button>
            </form>
          )}

          {activeTab === 'payment' && (
            <form onSubmit={handleSaveInfo} className="space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Payment & Tax Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Default Currency</label>
                  <select value={restaurantInfo.currency} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, currency: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition">
                    <option value="VND">Vietnamese Dong (đ)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Value Added Tax (VAT %)</label>
                  <input type="number" value={restaurantInfo.vat} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, vat: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition text-white"><Save size={18} /> Save Configuration</button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Current Password</label>
                  <input required type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">New Password</label>
                  <input required type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">Confirm New Password</label>
                  <input required type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition text-white"><Lock size={18} /> Update Password</button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Application Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800/40">
                  <div>
                    <h4 className="font-semibold text-white">Interface Theme Mode</h4>
                    <p className="text-xs text-slate-400 mt-1">Switch between light and dark display theme</p>
                  </div>
                  <button 
                    onClick={toggleTheme} 
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-white transition"
                  >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;