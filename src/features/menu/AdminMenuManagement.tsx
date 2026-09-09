import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Utensils, Image as ImageIcon, Tags, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToastStore } from '../../store/useToastStore';

const AdminMenuManagement: React.FC = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingFood, setEditingFood] = useState<any | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [options, setOptions] = useState<{ name: string; price: number }[]>([]);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, categoryId: 0, isAvailable: true
  });

  const addToast = useToastStore(state => state.addToast);

  const fetchData = async () => {
    try {
      const url = showTrash ? '/foods/deleted' : '/foods?pageSize=999';
      const [foodsRes, catsRes] = await Promise.all([
        apiClient.get(url),
        apiClient.get('/categories')
      ]);
      
      const parsedFoods = foodsRes.data.map((f: any) => {
        try {
          const parsed = JSON.parse(f.description);
          if (parsed && typeof parsed === 'object' && 'text' in parsed) {
            return { ...f, displayName: f.name, description: parsed.text, rawDescription: f.description };
          }
        } catch (e) {}
        return { ...f, displayName: f.name, rawDescription: f.description };
      });

      setFoods(parsedFoods);
      setCategories(catsRes.data);

      if (catsRes.data.length > 0 && formData.categoryId === 0) {
        setFormData(prev => ({ ...prev, categoryId: catsRes.data[0].id }));
      }
    } catch (error) {}
  };

  useEffect(() => { fetchData(); }, [showTrash]);

  const handleOpenAdd = () => {
    setEditingFood(null);
    setImageFile(null);
    setImagePreview(null);
    setOptions([]);
    setFormData({ name: '', description: '', price: 0, categoryId: categories.length > 0 ? categories[0].id : 0, isAvailable: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (food: any) => {
    setEditingFood(food);
    setImageFile(null);
    setImagePreview(food.imageUrl || null);
    
    let textDesc = food.description;
    let loadedOptions: any[] = [];
    try {
      const parsed = JSON.parse(food.rawDescription);
      if (parsed && typeof parsed === 'object' && 'text' in parsed) {
        textDesc = parsed.text;
        loadedOptions = parsed.options || [];
      }
    } catch (e) {}

    setFormData({ name: food.name, description: textDesc, price: food.price, categoryId: food.categoryId, isAvailable: food.isAvailable });
    setOptions(loadedOptions);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { name: '', price: 0 }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'name' | 'price', value: any) => {
    setOptions(options.map((opt, i) => i === index ? { ...opt, [field]: value } : opt));
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/categories', { name: newCategoryName });
      await fetchData();
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      addToast('Thêm danh mục mới thành công! 🏷️', 'success');
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoryId === 0) {
      alert('Please create a category first!');
      return;
    }
    setIsSubmitting(true);

    const descData = {
      text: formData.description,
      options: options
    };

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('price', formData.price.toString());
    dataToSend.append('categoryId', formData.categoryId.toString());
    dataToSend.append('description', JSON.stringify(descData));
    if (imageFile) dataToSend.append('image', imageFile);

    try {
      if (editingFood) {
        await apiClient.put(`/foods/${editingFood.id}`, dataToSend);
        addToast('Cập nhật món ăn thành công! 🍔', 'success');
      } else {
        await apiClient.post('/foods', dataToSend);
        addToast('Thêm món ăn mới thành công! 🍔', 'success');
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this food item?')) {
      try {
        await apiClient.delete(`/foods/${id}`);
        fetchData();
        addToast('Đã chuyển món ăn vào thùng rác! 🗑️', 'success');
      } catch (error) {}
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await apiClient.put(`/foods/${id}/restore`);
      fetchData();
      addToast('Khôi phục món ăn thành công! 🔄', 'success');
    } catch (error) {}
  };

  const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredFoods.length / pageSize) || 1;
  const displayedFoods = filteredFoods.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{showTrash ? 'Menu Trash Bin' : 'Menu Customization'}</h1>
          <p className="text-slate-400 text-sm mt-1">{showTrash ? 'View and restore deleted food items' : 'Add, update or terminate restaurant food variants'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setShowTrash(!showTrash); setCurrentPage(1); }}
            className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition ${showTrash ? 'bg-yellow-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <RotateCcw size={18} /> {showTrash ? 'Back to Menu' : 'Trash Bin'}
          </button>
          {!showTrash && (
            <>
              <button onClick={() => setIsCategoryModalOpen(true)} className="bg-slate-850 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-800 transition">
                <Tags size={18} /> Add Category
              </button>
              <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition">
                <Plus size={18} /> Add Food Item
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search food items..." 
          value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 text-sm text-white focus:outline-none focus:border-blue-500 transition duration-200" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedFoods.map(food => (
          <div key={food.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 transition duration-200 shadow-xl">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 shrink-0 overflow-hidden border border-slate-700/50">
                {food.imageUrl ? <img src={food.imageUrl} className="w-full h-full object-cover" /> : <Utensils size={28} />}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">{food.displayName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{food.categoryName}</p>
                <p className="text-[#FF6B35] font-extrabold mt-3 text-lg">{food.price.toLocaleString()} đ</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6 border-t border-slate-800/50 pt-4">
              {showTrash ? (
                <button onClick={() => handleRestore(food.id)} className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition"><RotateCcw size={12} /> Restore Item</button>
              ) : (
                <>
                  <button onClick={() => handleOpenEdit(food)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl font-bold text-xs text-slate-300 flex items-center justify-center gap-1.5 transition"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => handleDelete(food.id)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 py-2.5 rounded-xl font-bold text-xs text-red-500 flex items-center justify-center gap-1.5 transition"><Trash2 size={12} /> Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
        {displayedFoods.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500">No items found here.</div>
        )}
      </div>

      {!showTrash && (
        <div className="flex justify-between items-center text-sm text-slate-400 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <span className="font-semibold">Showing Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span> (Total <span className="text-white">{filteredFoods.length}</span> items)</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl transition text-white"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-1.5 rounded-xl font-bold transition ${currentPage === page ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl transition text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative animate-slide-up">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition"><X size={18} /></button>
            <h3 className="text-xl font-bold mb-6 text-white">New Category</h3>
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Category Name</label>
                <input required type="text" placeholder="e.g. Main Dish, Drinks..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-800 hover:bg-slate-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition">
                <Check size={18} /> {isSubmitting ? 'SAVING...' : 'SAVE CATEGORY'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md mx-auto h-[90vh] rounded-t-[40px] p-6 shadow-2xl relative animate-slide-up overflow-y-auto space-y-4 pb-12">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition"><X size={18} /></button>
            <h3 className="text-xl font-bold mb-4 text-white">{editingFood ? 'Edit Food Variant' : 'Add Food Variant'}</h3>
            <form onSubmit={handleSubmitFood} className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 transition rounded-2xl p-4 bg-slate-950/30 relative overflow-hidden group">
                {imagePreview ? (
                  <div className="relative w-full h-32">
                    <img src={imagePreview} className="w-full h-full object-cover rounded-xl" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition"><X size={14} /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 py-4 text-slate-400 hover:text-white transition">
                    <ImageIcon size={32} />
                    <span className="text-xs font-semibold">Upload Food Image</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Food Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Price (VND)</label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Category</label>
                  <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none appearance-none">
                    {categories.length === 0 && <option value="0">No categories found</option>}
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none h-16 resize-none" />
              </div>

              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs text-slate-400 font-semibold">Tùy chọn / Topping</label>
                  <button type="button" onClick={handleAddOption} className="text-xs text-blue-500 font-bold hover:text-blue-400">+ Thêm tùy chọn</button>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {options.map((opt, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input required type="text" placeholder="Tên tùy chọn (VD: Thêm bò viên)" value={opt.name} onChange={(e) => handleOptionChange(index, 'name', e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                      <input required type="number" placeholder="Giá cộng thêm" value={opt.price === 0 ? '' : opt.price} onChange={(e) => handleOptionChange(index, 'price', Number(e.target.value))} className="w-28 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                      <button type="button" onClick={() => handleRemoveOption(index)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || categories.length === 0} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-white hover:scale-[1.01] active:scale-[0.99]"><Check size={18} /> SAVE ITEM</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuManagement;