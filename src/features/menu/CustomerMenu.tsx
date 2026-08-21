import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, X, Check, Utensils, Bell, Receipt, ArrowLeft, Languages } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';

const dictionary = {
  vi: {
    welcome: 'Chào mừng bạn đến',
    browseMenu: 'XEM THỰC ĐƠN',
    callWaiter: 'GỌI PHỤC VỤ',
    requestBill: 'GỌI THANH TOÁN',
    cart: 'Giỏ hàng của bạn',
    total: 'Tổng tiền',
    confirmOrder: 'XÁC NHẬN ĐẶT MÓN',
    sending: 'ĐANG GỬI ĐƠN...',
    noFood: 'Thực đơn đang được cập nhật...',
    itemsCount: 'món',
    delete: 'Xóa',
    alertSuccess: 'Đặt món thành công! Bếp đang chuẩn bị món.',
    alertSuccessCall: 'Yêu cầu đã được gửi! Nhân viên đang đến hỗ trợ bạn.',
    alertFail: 'Lỗi đặt món. Vui lòng thử lại.',
    back: 'Quay lại'
  },
  en: {
    welcome: 'Welcome to',
    browseMenu: 'BROWSE MENU',
    callWaiter: 'CALL WAITER',
    requestBill: 'REQUEST BILL',
    cart: 'Your Cart',
    total: 'Total Price',
    confirmOrder: 'CONFIRM ORDER',
    sending: 'SENDING ORDER...',
    noFood: 'Menu is being updated...',
    itemsCount: 'items',
    delete: 'Delete',
    alertSuccess: 'Ordered successfully! The kitchen is preparing your meal.',
    alertSuccessCall: 'Request sent! Staff is coming to assist you.',
    alertFail: 'Order failed. Please try again.',
    back: 'Back'
  }
};

const sizeKeywords = ['tô', 'size', 'lớn', 'nhỏ', 'thường', 'đặc biệt', 'regular', 'large', 'small', 'special'];

const CustomerMenu: React.FC = () => {
  const { tableId } = useParams();
  const [view, setView] = useState<'portal' | 'menu'>('portal');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [foods, setFoods] = useState<any[]>([]);
  const [tableName, setTableName] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isCalling, setIsCalling] = useState(false);

  const [customizingFood, setCustomizingFood] = useState<any | null>(null);
  const [sizeOptions, setSizeOptions] = useState<any[]>([]);
  const [toppingOptions, setToppingOptions] = useState<any[]>([]);
  const [selectedSizeOption, setSelectedSizeOption] = useState<any | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Record<string, number>>({});
  const [customQty, setCustomQty] = useState(1);

  const { items, addToCart, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCartStore();
  const addToast = useToastStore(state => state.addToast);

  const t = dictionary[lang];

  useEffect(() => {
    apiClient.get('/foods?pageSize=999').then(res => {
      const parsedFoods = res.data.map((f: any) => {
        try {
          const parsed = JSON.parse(f.description);
          if (parsed && typeof parsed === 'object' && 'text' in parsed) {
            return { ...f, name: f.name, description: parsed.text, options: parsed.options || [] };
          }
        } catch (e) {}
        return { ...f, options: [] };
      });
      setFoods(parsedFoods);
    });

    if (tableId) {
      apiClient.get(`/tables/${tableId}`)
        .then(res => setTableName(res.data.name))
        .catch(() => setTableName(`Bàn ${tableId}`));
    }
  }, [tableId]);

  const handleCallService = async (type: string) => {
    setIsCalling(true);
    try {
      await apiClient.post(`/tables/${tableId}/call`, JSON.stringify(type), {
        headers: { 'Content-Type': 'application/json' }
      });
      addToast(t.alertSuccessCall, 'success');
    } catch (error) {
      addToast('Error sending request', 'error');
    } finally {
      setIsCalling(false);
    }
  };

  const groupedFoods = foods.reduce((acc: any, food: any) => {
    const category = food.categoryName || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(food);
    return acc;
  }, {});

  const categories = Object.keys(groupedFoods);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    const element = document.getElementById(`category-${category}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleAddClick = (food: any) => {
    if (food.options && food.options.length > 0) {
      const rawSizes = food.options.filter((o: any) => 
        sizeKeywords.some(k => o.name.toLowerCase().includes(k))
      );
      
      const sizes = rawSizes.length > 0 
        ? [{ name: 'Tiêu chuẩn (Mặc định)', price: 0 }, ...rawSizes]
        : [];

      const toppings = food.options.filter((o: any) => 
        !sizeKeywords.some(k => o.name.toLowerCase().includes(k))
      );

      setCustomizingFood(food);
      setSizeOptions(sizes);
      setToppingOptions(toppings);
      setSelectedSizeOption(sizes.length > 0 ? sizes[0] : null);
      setSelectedToppings({});
      setCustomQty(1);
    } else {
      addToCart({ 
        cartItemId: food.id.toString(),
        foodId: food.id, 
        foodName: food.name, 
        price: food.price, 
        quantity: 1, 
        notes: "" 
      });
      addToast(`${food.name} đã được thêm vào giỏ!`, 'success');
    }
  };

  const updateToppingQty = (name: string, delta: number) => {
    setSelectedToppings(prev => {
      const currentQty = prev[name] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: newQty };
    });
  };

  const handleConfirmCustomization = () => {
    if (!customizingFood) return;
    
    let finalPrice = customizingFood.price;
    let optionNotes: string[] = [];

    if (selectedSizeOption && selectedSizeOption.name !== 'Tiêu chuẩn (Mặc định)') {
      finalPrice += selectedSizeOption.price;
      const sign = selectedSizeOption.price < 0 ? "" : "+";
      optionNotes.push(`${selectedSizeOption.name} (${sign}${selectedSizeOption.price.toLocaleString()}đ)`);
    }

    Object.entries(selectedToppings).forEach(([name, qty]) => {
      const opt = toppingOptions.find(o => o.name === name);
      if (opt && qty > 0) {
        finalPrice += (opt.price * qty);
        optionNotes.push(`+ ${name} x${qty} (+${(opt.price * qty).toLocaleString()}đ)`);
      }
    });

    const notesString = optionNotes.join(', ');
    const sizePart = selectedSizeOption ? selectedSizeOption.name : 'default';
    const toppingKeys = Object.entries(selectedToppings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, qty]) => `${name}:${qty}`)
      .join('-');
    const cartItemId = `${customizingFood.id}-${sizePart}-${toppingKeys}`;

    addToCart({
      cartItemId,
      foodId: customizingFood.id,
      foodName: customizingFood.name,
      price: finalPrice,
      quantity: customQty,
      notes: notesString
    });

    addToast(`Đã thêm ${customizingFood.name} vào giỏ!`, 'success');
    setCustomizingFood(null);
  };

  const getCartItemQuantity = (foodId: number) => {
    return items
      .filter(i => i.foodId === foodId)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const submitOrder = async () => {
    if (items.length === 0) return;
    setIsOrdering(true);
    try {
      await apiClient.post('/orders', {
        tableId: Number(tableId),
        items: items.map(i => ({ foodId: i.foodId, quantity: i.quantity, notes: i.notes }))
      });
      clearCart();
      setIsCartOpen(false);
      addToast(t.alertSuccess, 'success');
    } catch (error) {
      addToast(t.alertFail, 'error');
    } finally {
      setIsOrdering(false);
    }
  };

  const LanguageSwitcher = () => (
    <button
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition"
    >
      <Languages size={14} className="text-[#FF6B35]" />
      <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
    </button>
  );

  if (view === 'portal') {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute w-80 h-80 bg-[#FF6B35]/10 rounded-full blur-[100px] -top-20 -left-20 animate-pulse" />
        <div className="absolute w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] -bottom-20 -right-20" />

        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[36px] shadow-2xl z-10 text-center relative">
          <div className="absolute top-6 right-6">
            <LanguageSwitcher />
          </div>

          <h1 className="text-3xl font-extrabold tracking-wider text-[#FF6B35] mb-2 mt-6">RESTAURANT</h1>
          <p className="text-lg font-bold text-white mb-8">{tableName || `Bàn ${tableId}`}</p>

          <div className="space-y-4">
            <button 
              onClick={() => setView('menu')}
              className="w-full bg-[#FF6B35] hover:bg-[#E8541E] py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg shadow-[#FF6B35]/20 active:scale-[0.98]"
            >
              <Utensils size={22} />
              {t.browseMenu}
            </button>

            <button 
              disabled={isCalling}
              onClick={() => handleCallService('Assistance')}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition active:scale-[0.98] text-yellow-500"
            >
              <Bell size={22} />
              {t.callWaiter}
            </button>

            <button 
              disabled={isCalling}
              onClick={() => handleCallService('Bill')}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition active:scale-[0.98] text-green-500"
            >
              <Receipt size={22} />
              {t.requestBill}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex justify-center pb-28">
      <div className="w-full max-w-md p-4 relative">
        <div className="flex justify-between items-center mb-6 pt-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('portal')} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#FF6B35]">{t.back}</h1>
              <p className="text-xs text-slate-400 font-semibold">{tableName || `Bàn ${tableId}`}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {categories.length > 0 && (
          <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md py-3.5 -mx-4 px-4 flex overflow-x-auto gap-2.5 no-scrollbar border-b border-slate-800/80">
            {categories.map((cat) => (
              <button key={cat} onClick={() => scrollToCategory(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl font-bold text-xs tracking-tight transition-all duration-300 ${activeCategory === cat ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20 scale-[1.02]' : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'}`}>{cat}</button>
            ))}
          </div>
        )}

        <div className="mt-6">
          {categories.map(category => (
            <div key={category} id={`category-${category}`} className="mb-10 pt-2">
              <h2 className="text-2xl font-extrabold text-white mb-5 flex items-center gap-2 tracking-tight">{category}</h2>
              <div className="space-y-4">
                {groupedFoods[category].map((food: any) => {
                  const quantity = getCartItemQuantity(food.id);
                  const isCustomizable = food.options && food.options.length > 0;
                  return (
                    <div key={food.id} className="bg-slate-900 rounded-3xl p-4 flex gap-4 items-center border border-gray-800 shadow-md animate-fade-in">
                      <div className="w-24 h-24 bg-slate-800 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs text-gray-500 overflow-hidden border border-slate-800 relative">
                        {food.imageUrl ? <img src={food.imageUrl} className="w-full h-full object-cover" /> : <Utensils size={24} />}
                        {food.price > 40000 && (
                          <span className="absolute top-1.5 left-1.5 bg-[#FF6B35] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider shadow-md">BEST SELLER</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-100 leading-tight">{food.name}</h3>
                        {food.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{food.description}</p>}
                        <p className="text-[#FF6B35] font-extrabold text-lg mt-2">{food.price.toLocaleString()} đ</p>
                      </div>
                      
                      {quantity > 0 && !isCustomizable ? (
                        <div className="flex items-center gap-2 bg-[#FF6B35] rounded-2xl p-1 shadow-lg shadow-[#FF6B35]/10">
                          <button onClick={() => updateQuantity(food.id.toString(), quantity - 1)} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-90"><Minus size={14} /></button>
                          <input 
                            type="number" 
                            value={quantity} 
                            onChange={(e) => updateQuantity(food.id.toString(), Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-12 bg-transparent text-center font-extrabold text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button onClick={() => updateQuantity(food.id.toString(), quantity + 1)} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-90"><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleAddClick(food)} className="bg-[#FF6B35] hover:bg-[#E8541E] p-3 rounded-2xl transition duration-200 shadow-lg shadow-[#FF6B35]/20 active:scale-90">
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center pointer-events-none z-40">
          <button onClick={() => setIsCartOpen(true)} className="pointer-events-auto bg-[#FF6B35] w-full max-w-md py-4 rounded-3xl font-bold text-lg shadow-2xl flex justify-between px-6 items-center hover:bg-[#E8541E] transition active:scale-[0.98]">
            <div className="flex items-center gap-2"><ShoppingBag /><span>{items.reduce((acc, i) => acc + i.quantity, 0)} {t.itemsCount}</span></div>
            <span>{getTotalPrice().toLocaleString()} đ</span>
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-md mx-auto h-[85vh] rounded-t-[40px] p-6 flex flex-col animate-slide-up border-t border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">{t.cart}</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {items.map(item => (
                <div key={item.cartItemId} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-slate-100 text-lg leading-tight">{item.foodName}</h3>
                    {item.notes && <p className="text-xs text-slate-400 mt-1 italic">{item.notes}</p>}
                    <p className="text-sm text-[#FF6B35] font-bold mt-1.5">{item.price.toLocaleString()} đ</p>
                  </div>
                  <div className="flex items-center gap-2.5 bg-[#FF6B35] rounded-2xl p-1">
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-90"><Minus size={12} /></button>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.cartItemId, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-10 bg-transparent text-center font-extrabold text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-90"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-6 border-t border-slate-800">
              <div className="flex justify-between text-2xl font-bold mb-6">
                <span>{t.total}:</span>
                <span className="text-[#FF6B35] font-bold">{getTotalPrice().toLocaleString()} đ</span>
              </div>
              <button 
                onClick={submitOrder} 
                disabled={isOrdering}
                className="w-full bg-[#FF6B35] hover:bg-[#E8541E] text-white font-bold py-4 rounded-2xl transition disabled:bg-slate-800 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Check size={20} />
                {isOrdering ? t.sending : t.confirmOrder}
              </button>
            </div>
          </div>
        </div>
      )}

      {customizingFood && (
        <div className="fixed inset-0 bg-black/85 z-50 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-md mx-auto rounded-t-[40px] p-6 flex flex-col animate-slide-up border-t border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{customizingFood.name}</h2>
                <p className="text-xs text-slate-400 mt-1">Chọn món thêm tùy thích</p>
              </div>
              <button onClick={() => setCustomizingFood(null)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 mb-8 max-h-[45vh] overflow-y-auto pr-1">
              {sizeOptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. CHỌN KÍCH CỠ (CHỈ CHỌN 1)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {sizeOptions.map((opt) => (
                      <button 
                        key={opt.name}
                        type="button"
                        onClick={() => setSelectedSizeOption(opt)}
                        className={`p-4 rounded-2xl border font-bold text-sm text-center transition ${
                          selectedSizeOption?.name === opt.name 
                            ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]' 
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        {opt.name} ({opt.price < 0 ? "" : "+"}{opt.price.toLocaleString()}đ)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {toppingOptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {sizeOptions.length > 0 ? '2. CHỌN MÓN THÊM (CHỌN NHIỀU)' : 'CHỌN MÓN THÊM (CHỌN NHIỀU)'}
                  </h4>
                  <div className="space-y-3">
                    {toppingOptions.map((opt: any) => {
                      const qty = selectedToppings[opt.name] || 0;
                      return (
                        <div 
                          key={opt.name}
                          className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex justify-between items-center"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-white">{opt.name}</span>
                            <span className="text-xs text-[#FF6B35] font-bold">{opt.price < 0 ? `${opt.price.toLocaleString()} đ` : `+${opt.price.toLocaleString()} đ`}</span>
                          </div>

                          {qty > 0 ? (
                            <div className="flex items-center gap-2.5 bg-[#FF6B35] rounded-2xl p-1 shadow-lg">
                              <button type="button" onClick={() => updateToppingQty(opt.name, -1)} className="p-1.5 hover:bg-white/10 rounded-xl transition"><Minus size={14} /></button>
                              <span className="font-extrabold text-sm w-4 text-center text-white">{qty}</span>
                              <button type="button" onClick={() => updateToppingQty(opt.name, 1)} className="p-1.5 hover:bg-white/10 rounded-xl transition"><Plus size={14} /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => updateToppingQty(opt.name, 1)} className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl text-slate-300 transition">
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400">CHỌN SỐ LƯỢNG MÓN CHÍNH:</span>
                <div className="flex items-center gap-2.5 bg-[#FF6B35] rounded-2xl p-1">
                  <button type="button" onClick={() => setCustomQty(prev => Math.max(1, prev - 1))} className="p-1.5 hover:bg-white/10 rounded-xl transition"><Minus size={14} /></button>
                  <input 
                    type="number" 
                    value={customQty} 
                    onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-10 bg-transparent text-center font-extrabold text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button type="button" onClick={() => setCustomQty(prev => prev + 1)} className="p-1.5 hover:bg-white/10 rounded-xl transition"><Plus size={14} /></button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleConfirmCustomization}
              className="w-full bg-[#FF6B35] hover:bg-[#E8541E] text-white font-bold py-4 rounded-2xl transition"
            >
              THÊM VÀO GIỎ HÀNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;