import React, { useState, useEffect } from 'react';
import { Search, UserPlus, SlidersHorizontal, Trash2, Edit2, X, Check, RotateCcw } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToastStore } from '../../store/useToastStore';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showTrash, setShowTrash] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const [formData, setFormData] = useState({ name: '', username: '', role: 'Waiter', shift: 'Morning' });
  const addToast = useToastStore(state => state.addToast);

  const fetchEmployees = async () => {
    try {
      const url = showTrash ? '/users/deleted' : '/users';
      const { data } = await apiClient.get(url);
      setEmployees(data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchEmployees();
  }, [showTrash]);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({ name: '', username: '', role: 'Waiter', shift: 'Morning' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({ name: emp.name, username: emp.username, role: emp.role, shift: emp.shift });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await apiClient.put(`/users/${editingEmployee.id}`, formData);
        addToast('Cập nhật thông tin nhân viên thành công! 👤', 'success');
      } else {
        await apiClient.post('/users', formData);
        addToast('Tạo tài khoản nhân viên thành công! Mật khẩu mặc định: 123456 🔑', 'success');
      }
      await fetchEmployees();
      setIsModalOpen(false);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await apiClient.delete(`/users/${id}`);
        await fetchEmployees();
        addToast('Đã chuyển nhân viên vào thùng rác! 🗑️', 'success');
      } catch (error) {}
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await apiClient.put(`/users/${id}/restore`);
      await fetchEmployees();
      addToast('Khôi phục tài khoản nhân viên thành công! 🔄', 'success');
    } catch (error) {}
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{showTrash ? 'Employees Trash Bin' : 'Employee Management'}</h1>
          <p className="text-slate-400 text-sm mt-1">{showTrash ? 'View and restore deleted staff accounts' : 'Manage restaurant staff roles and shifts'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTrash(!showTrash)}
            className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition ${showTrash ? 'bg-yellow-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <RotateCcw size={18} /> {showTrash ? 'Back to Staff' : 'Trash Bin'}
          </button>
          {!showTrash && (
            <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/10 transition">
              <UserPlus size={18} /> Add Employee
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by name or username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:border-blue-500">
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Chef">Chef</option>
            <option value="Cashier">Cashier</option>
            <option value="Waiter">Waiter</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/30">
                <th className="p-4">Name</th>
                <th className="p-4">Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Shift</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/10 transition">
                  <td className="p-4 font-semibold text-white">{emp.name}</td>
                  <td className="p-4 text-slate-400">@{emp.username}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {emp.shift === 'Morning' && 'Sáng (06:00 - 14:00)'}
                    {emp.shift === 'Evening' && 'Tối (14:00 - 22:00)'}
                    {emp.shift === 'Full-time' && 'Cả ngày (Full-time)'}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      emp.status === 'Deleted' ? 'bg-red-500/10 text-red-500 border border-red-500/10' : 'bg-green-500/10 text-green-500 border border-green-500/10'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {showTrash ? (
                      <button onClick={() => handleRestore(emp.id)} className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition"><RotateCcw size={12} /> Restore Staff</button>
                    ) : (
                      <>
                        <button onClick={() => handleOpenEdit(emp)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"><Edit2 size={16} /></button>
                        {emp.username !== 'admin' && (
                          <button onClick={() => handleDelete(emp.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition"><Trash2 size={16} /></button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-slide-up">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"><X size={18} /></button>
            <h3 className="text-xl font-bold mb-6 text-white">{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Username (For Login)</label>
                <input required type="text" disabled={editingEmployee?.username === 'admin'} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none disabled:opacity-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Assign Role</label>
                  <select disabled={editingEmployee?.username === 'admin'} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none appearance-none disabled:opacity-50">
                    <option value="Admin">Admin</option>
                    <option value="Chef">Chef</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Waiter">Waiter</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Shift Session</label>
                  <select value={formData.shift} onChange={(e) => setFormData({ ...formData, shift: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none appearance-none">
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Full-time">Full-time</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition mt-4 disabled:bg-slate-700">
                <Check size={18} /> {isSubmitting ? 'SAVING...' : 'SAVE EMPLOYEE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;