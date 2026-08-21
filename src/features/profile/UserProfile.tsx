import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Lock, History, Check, ArrowLeft } from 'lucide-react';

const mockLogs = [
  { device: 'Windows 11 - Chrome', ip: '192.168.1.8', time: 'Today, 10:24 AM', status: 'Success' },
  { device: 'macOS Monterey - Safari', ip: '14.226.115.12', time: 'Yesterday, 08:15 PM', status: 'Success' },
  { device: 'iOS 16 - Safari Mobile', ip: '113.161.22.45', time: 'July 15, 2026, 01:12 PM', status: 'Success' }
];

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPass: '',
    newPass: '',
    confirmPass: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfileData({
        name: parsed.fullName || 'Staff User',
        email: `${parsed.username}@gourmetpalace.com`,
        phone: '0901234567',
        role: parsed.role || 'Staff'
      });
    }
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPass !== passwordData.confirmPass) {
      alert('Passwords do not match!');
      return;
    }
    alert('Security password has been updated!');
    setPasswordData({ oldPass: '', newPass: '', confirmPass: '' });
  };

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-8 animate-fade-in p-8 bg-[#0B1120] min-h-screen text-white">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition duration-200"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage personal account configuration and check system login journals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl h-fit">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20" />
          <div className="z-10 mt-6">
            <div className="w-24 h-24 rounded-3xl bg-blue-600 border border-blue-500/50 flex items-center justify-center text-3xl font-bold text-white shadow-2xl mx-auto mb-4">
              {getInitials(profileData.name)}
            </div>
            <h3 className="text-xl font-bold text-white">{profileData.name}</h3>
            <p className="text-xs text-blue-500 font-semibold mt-2.5 bg-blue-500/10 px-4 py-1.5 rounded-full inline-block border border-blue-500/10">
              {profileData.role}
            </p>
          </div>

          <div className="w-full text-left space-y-4 border-t border-slate-800/80 pt-6 mt-6">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Mail size={16} className="text-slate-500" />
              <span>{profileData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Phone size={16} className="text-slate-500" />
              <span>{profileData.phone}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">Personal Details</h3>
            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Full Name</label>
                <input required type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Email Address</label>
                <input required type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Phone Number</label>
                <input required type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-white"><Check size={18} /> Update Info</button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">Security Credentials</h3>
            <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Old Password</label>
                <input required type="password" value={passwordData.oldPass} onChange={(e) => setPasswordData({ ...passwordData, oldPass: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">New Password</label>
                <input required type="password" value={passwordData.newPass} onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Confirm Password</label>
                <input required type="password" value={passwordData.confirmPass} onChange={(e) => setPasswordData({ ...passwordData, confirmPass: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-white"><Lock size={18} /> Update Password</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <History className="text-blue-500" size={20} />
          <h3 className="text-lg font-bold text-white tracking-tight">Recent Login Journals</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Device Name</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {mockLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-800/10 transition">
                  <td className="py-4 font-semibold text-white">{log.device}</td>
                  <td className="py-4 text-slate-400">{log.ip}</td>
                  <td className="py-4 text-slate-300">{log.time}</td>
                  <td className="py-4 text-green-500 font-bold text-right">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;