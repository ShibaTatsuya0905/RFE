import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, X, Check, Utensils, Bell, Receipt, ArrowLeft, Languages, ClipboardList, Star, Sparkles } from 'lucide-react';import apiClient from '../../services/apiClient';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useSignalR } from '../../hooks/useSignalR';

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
    back: 'Quay lại',
    menuTab: 'Thực đơn',
    historyTab: 'Đơn đã gọi',
    noHistory: 'Bạn chưa đặt món nào trong phiên này.'
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
    back: 'Back',
    menuTab: 'Menu',
    historyTab: 'My Orders',
    noHistory: 'You have not placed any orders yet.'
  }
};

const sizeKeywords = ['size', 'lớn', 'nhỏ', 'thường', 'đặc biệt', 'regular', 'large', 'small', 'special'];

const CustomerMenu: React.FC = () => {
  const { connection } = useSignalR();
  const { tableId } = useParams();
  const [view, setView] = useState<'portal' | 'menu' | 'feedback'>('portal');
  const [customerTab, setCustomerTab] = useState<'menu' | 'history'>('menu');
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

  const [ratings, setRatings] = useState({ food: 5, service: 5, speed: 5, value: 5 });
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const { items, addToCart, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const { orders, setOrders } = useOrderStore();
  const addToast = useToastStore(state => state.addToast);

  const t = dictionary[lang];

  // KHÔI PHỤC BIẾN tableOrders
  const tableOrders = orders.filter(o => o.tableId === Number(tableId));

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

    apiClient.get('/orders/active').then(res => setOrders(res.data));

    if (tableId) {
      apiClient.get(`/tables/${tableId}`)
        .then(res => setTableName(res.data.name))
        .catch(() => setTableName(`Bàn ${tableId}`));
    }
  }, [tableId, setOrders]);

  useEffect(() => {
    if (connection) {
      const handleTableStatus = (tId: number, status: number) => {
        if (Number(tableId) === tId && status === 0) {
          setView('feedback');
        }
      };
      connection.on('TableStatusUpdated', handleTableStatus);
      return () => { connection.off('TableStatusUpdated', handleTableStatus); };
    }
  }, [connection, tableId]);

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

  const submitFeedback = async () => {
    try {
      await apiClient.post('/dashboard/feedback', {
        tableId: Number(tableId), 
        foodRating: ratings.food, 
        serviceRating: ratings.service, 
        speedRating: ratings.speed, 
        valueRating: ratings.value, 
        comment
      });
      setFeedbackSubmitted(true);
    } catch (error) {
      addToast('Submit failed', 'error');
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
      const rawSizes = food.options.filter((o: any) => sizeKeywords.some(k => o.name.toLowerCase().includes(k)));
      const sizes = rawSizes.length > 0 ? [{ name: 'Tiêu chuẩn (Mặc định)', price: 0 }, ...rawSizes] : [];
      const toppings = food.options.filter((o: any) => !sizeKeywords.some(k => o.name.toLowerCase().includes(k)));
      
      setCustomizingFood(food); 
      setSizeOptions(sizes); 
      setToppingOptions(toppings); 
      setSelectedSizeOption(sizes.length > 0 ? sizes[0] : null); 
      setSelectedToppings({}); 
      setCustomQty(1);
    } else {
      addToCart({ cartItemId: food.id.toString(), foodId: food.id, foodName: food.name, price: food.price, quantity: 1, notes: "" });
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
        const sign = opt.price < 0 ? "" : "+"; 
        optionNotes.push(`+ ${name} x${qty} (${sign}${(opt.price * qty).toLocaleString()}đ)`); 
      }
    });

    const notesString = optionNotes.join(', ');
    const sizePart = selectedSizeOption ? selectedSizeOption.name : 'default';
    const toppingKeys = Object.entries(selectedToppings).sort(([a], [b]) => a.localeCompare(b)).map(([name, qty]) => `${name}:${qty}`).join('-');
    const cartItemId = `${customizingFood.id}-${sizePart}-${toppingKeys}`;
    
    addToCart({ cartItemId, foodId: customizingFood.id, foodName: customizingFood.name, price: finalPrice, quantity: customQty, notes: notesString });
    addToast(`Đã thêm ${customizingFood.name} vào giỏ!`, 'success');
    setCustomizingFood(null);
  };

  const getCartItemQuantity = (foodId: number) => items.filter(i => i.foodId === foodId).reduce((total, item) => total + item.quantity, 0);

  const submitOrder = async () => {
    if (items.length === 0) return;
    setIsOrdering(true);
    try {
      await apiClient.post('/orders', { 
        tableId: Number(tableId), 
        items: items.map(i => ({ foodId: i.foodId, quantity: i.quantity, unitPrice: i.price, notes: i.notes })) 
      });
      clearCart(); 
      setIsCartOpen(false); 
      setCustomerTab('history'); 
      addToast(t.alertSuccess, 'success');
    } catch (error) { 
      addToast(t.alertFail, 'error'); 
    } finally { 
      setIsOrdering(false); 
    }
  };

  const LanguageSwitcher = () => (
    <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 shadow-sm rounded-2xl text-xs font-bold text-stone-700 hover:text-stone-900 transition active:scale-95">
      <Languages size={14} className="text-[#FF6B35]" />
      <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
    </button>
  );

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="mb-4">
      <p className="text-sm font-bold text-stone-700 mb-2">{label}</p>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={28} 
            onClick={() => onChange(star)} 
            className={`cursor-pointer transition-colors ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`} 
          />
        ))}
      </div>
    </div>
  );

  if (view === 'feedback') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-white border border-stone-200 p-8 rounded-[40px] shadow-2xl text-center z-10 animate-slide-up">
          {feedbackSubmitted ? (
            <div className="py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Xin cảm ơn!</h2>
              <p className="text-stone-500 text-sm">Đánh giá của bạn giúp chúng tôi cải thiện chất lượng phục vụ mỗi ngày.</p>
              <button onClick={() => setView('portal')} className="mt-8 bg-[#FF6B35] text-white px-8 py-3 rounded-2xl font-bold w-full hover:bg-[#E8541E] transition">Quay lại trang chủ</button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Thanh toán hoàn tất!</h2>
              <p className="text-stone-500 text-sm mb-8">Vui lòng để lại đánh giá về trải nghiệm của bạn tại nhà hàng.</p>
              <StarRating label="Chất lượng món ăn" value={ratings.food} onChange={v => setRatings({...ratings, food: v})} />
              <StarRating label="Thái độ phục vụ" value={ratings.service} onChange={v => setRatings({...ratings, service: v})} />
              <StarRating label="Tốc độ lên món" value={ratings.speed} onChange={v => setRatings({...ratings, speed: v})} />
              <StarRating label="Giá cả hợp lý" value={ratings.value} onChange={v => setRatings({...ratings, value: v})} />
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="Nhập góp ý thêm của bạn (Không bắt buộc)..." 
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm mt-4 focus:outline-none focus:border-[#FF6B35]" 
                rows={3} 
              />
              <button 
                onClick={submitFeedback} 
                className="w-full bg-[#FF6B35] hover:bg-[#E8541E] text-white font-bold py-4 rounded-2xl mt-6 transition shadow-lg shadow-[#FF6B35]/25"
              >
                GỬI ĐÁNH GIÁ
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (view === 'portal') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-[100px] -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-[#2D6A4F]/10 rounded-full blur-[100px] -bottom-20 -right-20" />

        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-stone-200/80 p-8 rounded-[40px] shadow-2xl shadow-stone-300/40 z-10 text-center relative">
          <div className="absolute top-6 right-6">
            <LanguageSwitcher />
          </div>

          <div className="w-16 h-16 rounded-3xl bg-[#FF6B35] flex items-center justify-center shadow-xl shadow-[#FF6B35]/25 mx-auto mb-4 text-white mt-6">
            <Sparkles size={30} />
          </div>

          <h1 className="text-3xl font-extrabold tracking-widest text-[#FF6B35] mb-1">RESTAURANT</h1>
          <p className="text-lg font-bold text-stone-800 mb-8">{tableName || `Bàn ${tableId}`}</p>

          <div className="space-y-3.5">
            <button onClick={() => setView('menu')} className="w-full bg-[#FF6B35] hover:bg-[#E8541E] text-white py-4.5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition shadow-lg shadow-[#FF6B35]/25 active:scale-[0.98]"><Utensils size={20} />{t.browseMenu}</button>
            <button disabled={isCalling} onClick={() => handleCallService('Assistance')} className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 py-4.5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.98]"><Bell size={20} className="text-[#F59E0B]" />{t.callWaiter}</button>
            <button disabled={isCalling} onClick={() => handleCallService('Bill')} className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 py-4.5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.98]"><Receipt size={20} className="text-[#2D6A4F]" />{t.requestBill}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans flex justify-center pb-28">
      <div className="w-full max-w-md p-4 relative">
        <div className="flex justify-between items-center mb-4 pt-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('portal')} className="p-2.5 bg-white border border-stone-200 shadow-sm rounded-2xl text-stone-700 hover:text-stone-900 transition active:scale-95">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#FF6B35] leading-none">{t.back}</h1>
              <p className="text-xs text-stone-500 font-semibold mt-1">{tableName || `Bàn ${tableId}`}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="flex border border-stone-200/90 bg-stone-100/80 rounded-2xl p-1 mb-6 shadow-inner">
          <button onClick={() => setCustomerTab('menu')} className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${customerTab === 'menu' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}>{t.menuTab}</button>
          <button onClick={() => setCustomerTab('history')} className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${customerTab === 'history' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}><ClipboardList size={14} className="text-[#2D6A4F]" /> {t.historyTab} ({tableOrders.length})</button>
        </div>

        {customerTab === 'menu' && (
          <>
            {categories.length > 0 && (
              <div className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md py-3 -mx-4 px-4 flex overflow-x-auto gap-2.5 no-scrollbar border-b border-stone-200">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => scrollToCategory(cat)} 
                    className={`whitespace-nowrap px-5 py-2.5 rounded-2xl font-bold text-xs tracking-tight transition-all duration-300 ${
                      activeCategory === cat 
                        ? 'bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20 scale-[1.02]' 
                        : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5">
              {categories.map(category => (
                <div key={category} id={`category-${category}`} className="mb-8 pt-2">
                  <h2 className="text-xl font-extrabold text-[#2D6A4F] mb-4 flex items-center gap-2 tracking-tight">
                    <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                    {category}
                  </h2>
                  <div className="space-y-3.5">
                    {groupedFoods[category].map((food: any) => {
                      const quantity = getCartItemQuantity(food.id);
                      const isCustomizable = food.options && food.options.length > 0;
                      return (
                        <div key={food.id} className="bg-white rounded-3xl p-3.5 flex gap-4 items-center border border-stone-200/80 shadow-sm shadow-stone-200/50 hover:shadow-md transition-all duration-300">
                          <div className="w-24 h-24 bg-stone-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs text-stone-400 overflow-hidden border border-stone-200/60 relative">
                            {food.imageUrl ? <img src={food.imageUrl} className="w-full h-full object-cover" /> : <Utensils size={24} className="text-stone-400" />}
                            {food.price > 40000 && (
                              <span className="absolute top-1.5 left-1.5 bg-[#F59E0B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                                HOT
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-stone-900 leading-snug truncate">{food.name}</h3>
                            {food.description && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">{food.description}</p>}
                            <p className="text-[#E8541E] font-extrabold text-base mt-2">{food.price.toLocaleString()} đ</p>
                          </div>
                          
                          {quantity > 0 && !isCustomizable ? (
                            <div className="flex items-center gap-1.5 bg-[#FF6B35] rounded-2xl p-1 shadow-md shadow-[#FF6B35]/20">
                              <button onClick={() => updateQuantity(food.id.toString(), quantity - 1)} className="p-1.5 text-white hover:bg-black/10 rounded-xl transition active:scale-90"><Minus size={13} /></button>
                              <input 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => updateQuantity(food.id.toString(), Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-8 bg-transparent text-center font-extrabold text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button onClick={() => updateQuantity(food.id.toString(), quantity + 1)} className="p-1.5 text-white hover:bg-black/10 rounded-xl transition active:scale-90"><Plus size={13} /></button>
                            </div>
                          ) : (
                            <button onClick={() => handleAddClick(food)} className="bg-[#FF6B35] hover:bg-[#E8541E] text-white p-3 rounded-2xl transition duration-200 shadow-md shadow-[#FF6B35]/20 active:scale-90">
                              <Plus size={18} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {foods.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
                  <Utensils size={40} className="mx-auto text-stone-300 mb-3" />
                  <p className="text-stone-500 font-semibold text-sm">{t.noFood}</p>
                </div>
              )}
            </div>
          </>
        )}

        {customerTab === 'history' && (
          <div className="space-y-4 mt-2 animate-fade-in">
            {tableOrders.map(order => (
              <div key={order.id} className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">{order.orderCode}</h3>
                    <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Paid' || order.status === 'Served' ? 'bg-emerald-100 text-[#2D6A4F]' :
                    order.status === 'Cooking' ? 'bg-orange-100 text-[#E8541E]' : 'bg-amber-100 text-[#F59E0B]'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {order.orderDetails.map((item: any) => (
                    <div key={item.id} className="text-sm text-stone-700 border-b border-stone-100 pb-2 last:border-none">
                      <div className="flex justify-between font-semibold">
                        <span>{item.quantity} x {item.foodName}</span>
                        <span className="text-[#E8541E]">{(item.quantity * item.unitPrice).toLocaleString()} đ</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-[#2D6A4F] mt-1 font-medium bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-stone-100 flex justify-between font-bold text-base">
                  <span className="text-stone-800">{t.total}:</span>
                  <span className="text-[#E8541E]">{order.totalAmount.toLocaleString()} đ</span>
                </div>
              </div>
            ))}

            {tableOrders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 border-dashed">
                <ClipboardList size={40} className="mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500 text-sm font-semibold">{t.noHistory}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {items.length > 0 && customerTab === 'menu' && (
        <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center pointer-events-none z-40">
          <button onClick={() => setIsCartOpen(true)} className="pointer-events-auto bg-[#FF6B35] hover:bg-[#E8541E] text-white w-full max-w-md py-4 rounded-3xl font-bold text-base shadow-xl shadow-[#FF6B35]/30 flex justify-between px-6 items-center transition active:scale-[0.98]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={20} />
              <span>{items.reduce((acc, i) => acc + i.quantity, 0)} {t.itemsCount}</span>
            </div>
            <span className="text-lg">{getTotalPrice().toLocaleString()} đ</span>
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-white w-full max-w-md mx-auto h-[85vh] rounded-t-[40px] p-6 flex flex-col animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">{t.cart}</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2.5 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-600 transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {items.map(item => (
                <div key={item.cartItemId} className="bg-[#FAF7F2] p-4 rounded-3xl border border-stone-200/80 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="font-bold text-stone-900 text-base leading-tight">{item.foodName}</h3>
                      {item.notes && <p className="text-xs text-[#2D6A4F] mt-1 font-medium bg-emerald-50 p-2 rounded-xl border border-emerald-100">{item.notes}</p>}
                    </div>
                    <button onClick={() => updateQuantity(item.cartItemId, 0)} className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100 transition">
                      {t.delete}
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                    <span className="text-sm text-[#E8541E] font-extrabold">{item.price.toLocaleString()} đ</span>
                    <div className="flex items-center gap-2 bg-[#FF6B35] rounded-2xl p-1 text-white shadow-sm">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-1.5 hover:bg-black/10 rounded-xl transition active:scale-90"><Minus size={12} /></button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.cartItemId, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-8 bg-transparent text-center font-extrabold text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1.5 hover:bg-black/10 rounded-xl transition active:scale-90"><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-5 border-t border-stone-200">
              <div className="flex justify-between text-xl font-bold mb-5 text-stone-900">
                <span>{t.total}:</span>
                <span className="text-[#E8541E] text-2xl">{getTotalPrice().toLocaleString()} đ</span>
              </div>
              <button 
                onClick={submitOrder} 
                disabled={isOrdering}
                className="w-full bg-[#FF6B35] hover:bg-[#E8541E] text-white font-bold py-4 rounded-2xl transition disabled:bg-stone-300 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/25 active:scale-[0.98]"
              >
                <Check size={20} />
                {isOrdering ? t.sending : t.confirmOrder}
              </button>
            </div>
          </div>
        </div>
      )}

      {customizingFood && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-6 flex flex-col animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">{customizingFood.name}</h2>
                <p className="text-xs text-stone-500 mt-0.5">Tùy chọn khẩu vị & món ăn kèm</p>
              </div>
              <button onClick={() => setCustomizingFood(null)} className="p-2.5 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-600 transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 mb-6 max-h-[48vh] overflow-y-auto pr-1">
              {sizeOptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider mb-2.5">1. CHỌN KÍCH CỠ (BẮT BUỘC)</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {sizeOptions.map((opt) => (
                      <button 
                        key={opt.name}
                        type="button"
                        onClick={() => setSelectedSizeOption(opt)}
                        className={`p-3.5 rounded-2xl border font-bold text-xs text-center transition ${
                          selectedSizeOption?.name === opt.name 
                            ? 'bg-orange-50 border-[#FF6B35] text-[#FF6B35] shadow-sm' 
                            : 'bg-[#FAF7F2] border-stone-200 text-stone-700'
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
                  <h4 className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider mb-2.5">
                    {sizeOptions.length > 0 ? '2. MÓN ĂN KÈM (CHỌN THÊM)' : 'MÓN ĂN KÈM (CHỌN THÊM)'}
                  </h4>
                  <div className="space-y-2.5">
                    {toppingOptions.map((opt: any) => {
                      const qty = selectedToppings[opt.name] || 0;
                      return (
                        <div 
                          key={opt.name}
                          className="p-3.5 rounded-2xl border border-stone-200 bg-[#FAF7F2] flex justify-between items-center shadow-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-stone-900">{opt.name}</span>
                            <span className="text-xs text-[#E8541E] font-bold">{opt.price < 0 ? `${opt.price.toLocaleString()} đ` : `+${opt.price.toLocaleString()} đ`}</span>
                          </div>

                          {qty > 0 ? (
                            <div className="flex items-center gap-2 bg-[#FF6B35] text-white rounded-2xl p-1 shadow-sm">
                              <button type="button" onClick={() => updateToppingQty(opt.name, -1)} className="p-1 hover:bg-black/10 rounded-xl transition"><Minus size={13} /></button>
                              <span className="font-extrabold text-xs w-4 text-center">{qty}</span>
                              <button type="button" onClick={() => updateToppingQty(opt.name, 1)} className="p-1 hover:bg-black/10 rounded-xl transition"><Plus size={13} /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => updateToppingQty(opt.name, 1)} className="bg-white hover:bg-stone-100 border border-stone-200 p-2 rounded-xl text-stone-700 transition active:scale-95 shadow-sm">
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-[#FAF7F2] p-3.5 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-600">SỐ LƯỢNG MÓN:</span>
                <div className="flex items-center gap-2 bg-[#FF6B35] text-white rounded-2xl p-1 shadow-sm">
                  <button type="button" onClick={() => setCustomQty(prev => Math.max(1, prev - 1))} className="p-1 hover:bg-black/10 rounded-xl transition"><Minus size={13} /></button>
                  <input 
                    type="number" 
                    value={customQty} 
                    onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-8 bg-transparent text-center font-extrabold text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button type="button" onClick={() => setCustomQty(prev => prev + 1)} className="p-1 hover:bg-black/10 rounded-xl transition"><Plus size={13} /></button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleConfirmCustomization}
              className="w-full bg-[#FF6B35] hover:bg-[#E8541E] text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-[#FF6B35]/25 active:scale-[0.98]"
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