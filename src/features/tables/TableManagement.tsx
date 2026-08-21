import React, { useState, useEffect } from 'react';
import { Plus, Download, Printer, Table as TableIcon, X, Check, Trash2, Edit2, RotateCcw } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useSignalR } from '../../hooks/useSignalR';
import { useOrderStore } from '../../store/useOrderStore';

const TableManagement: React.FC = () => {
  useSignalR();
  const { tables, setTables } = useOrderStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrModalTable, setQrModalTable] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const [formData, setFormData] = useState({ name: '', capacity: 2 });

  const fetchTables = async () => {
    try {
      const url = showTrash ? '/tables/deleted' : '/tables';
      const { data } = await apiClient.get(url);
      setTables(data);
    } catch (error) {
      console.error("Error fetching tables");
    }
  };

  useEffect(() => {
    fetchTables();
  }, [showTrash]);

  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormData({ name: '', capacity: 2 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (table: any) => {
    setEditingTable(table);
    setFormData({ name: table.name, capacity: table.capacity });
    setIsModalOpen(true);
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingTable) {
        await apiClient.put(`/tables/${editingTable.id}`, formData);
      } else {
        await apiClient.post('/tables', formData);
      }
      await fetchTables();
      setIsModalOpen(false);
    } catch (error) {
      alert("Thao tác thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn ăn này?')) {
      try {
        await apiClient.delete(`/tables/${id}`);
        await fetchTables();
      } catch (error) {
        alert("Xóa bàn thất bại!");
      }
    }
  };

  const handleRestoreTable = async (id: number) => {
    try {
      await apiClient.put(`/tables/${id}/restore`);
      await fetchTables();
      alert('Khôi phục bàn ăn thành công!');
    } catch (error) {
      alert("Khôi phục bàn thất bại!");
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return { text: 'Available', color: 'text-green-500 bg-green-500/10 border-green-500/20', dot: 'bg-green-500' };
      case 1: return { text: 'Occupied', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' };
      default: return { text: 'Reserved', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-500' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{showTrash ? 'Tables Trash Bin' : 'Tables & QR Setup'}</h1>
          <p className="text-slate-400 text-sm">{showTrash ? 'View and restore deleted dining tables' : 'Add dining locations and print physical QR tags'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTrash(!showTrash)}
            className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition ${showTrash ? 'bg-yellow-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <RotateCcw size={18} /> {showTrash ? 'Back to Tables' : 'Trash Bin'}
          </button>
          {!showTrash && (
            <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-blue-500/20">
              <Plus size={18} /> Add Dining Table
            </button>
          )}
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
          <TableIcon size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No tables found here</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tables.map(table => {
            const statusConfig = getStatusColor(table.status);
            return (
              <div key={table.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 transition duration-300 shadow-lg relative group">
                
                {!showTrash && (
                  <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button onClick={() => handleOpenEdit(table)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteTable(table.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition"><Trash2 size={14} /></button>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-800 rounded-xl text-slate-300"><TableIcon size={20} /></div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{table.name}</h3>
                        <p className="text-xs text-slate-500">Capacity: {table.capacity} seats</p>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border items-center gap-1.5 ${statusConfig.color}`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig.dot} ${table.status === 1 ? 'animate-ping' : ''}`} />
                    {statusConfig.text}
                  </span>
                </div>
                <div className="flex gap-2 mt-6 border-t border-slate-800/50 pt-4">
                  {showTrash ? (
                    <button onClick={() => handleRestoreTable(table.id)} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition"><RotateCcw size={14} /> Restore Table</button>
                  ) : (
                    <button onClick={() => setQrModalTable(table)} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-xs text-slate-300 flex items-center justify-center gap-1.5 transition">
                      <Download size={14} /> Get QR Code
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[32px] p-6 shadow-2xl relative animate-slide-up">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition"><X size={18} /></button>
            <h3 className="text-xl font-bold mb-6 text-white">{editingTable ? 'Edit Dining Table' : 'Add Dining Table'}</h3>
            <form onSubmit={handleAddTable} className="space-y-5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Table Label</label>
                <input required type="text" placeholder="e.g. VIP 1, Table 12..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Max Capacity (Seats)</label>
                <input required type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition mt-2">
                <Check size={18} /> {isSubmitting ? 'SAVING...' : 'SAVE TABLE'}
              </button>
            </form>
          </div>
        </div>
      )}

      {qrModalTable && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative text-center animate-slide-up">
            <button onClick={() => setQrModalTable(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition"><X size={18} /></button>
            <h3 className="text-2xl font-bold mb-1 text-white">Table QR Tag</h3>
            <p className="text-sm text-slate-400 mb-8">{qrModalTable.name} • {qrModalTable.capacity} Seats</p>
            
            <div className="w-56 h-56 bg-white p-3 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-blue-500/10">
<img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://TEN_FRONTEND_CUA_BAN.onrender.com/menu/${qrModalTable.id}`} alt="QR Code" className="w-full h-full" />            </div>

            <button onClick={() => window.print()} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20">
              <Printer size={18} /> Print QR Tag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;