import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiTag, FiCreditCard, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import * as api from '../services/api';
import { clearCartState, applyCartCoupon } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, discount } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({ fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '', landmark: '' });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 29;
  const total = subtotal + deliveryFee - discount;

  const handleCoupon = async () => {
    try { await dispatch(applyCartCoupon(couponCode)).unwrap(); toast.success('Coupon applied!'); }
    catch (e) { toast.error(e || 'Invalid coupon'); }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const { data } = await api.placeOrder({ shippingAddress: address, paymentMethod });
      dispatch(clearCartState());
      setSuccessOrder(data.order);
      setSuccess(true);
    } catch (e) { toast.error(e.response?.data?.message || 'Order failed'); }
    finally { setPlacing(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center pt-24 px-4">
      <motion.div className="bg-white rounded-[3rem] p-10 text-center max-w-md w-full shadow-2xl border border-gray-100"
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="w-24 h-24 bg-[#00C853]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <FiCheckCircle className="w-12 h-12 text-[#00C853]" />
        </div>
        <h2 className="text-gray-900 font-black text-3xl mb-3">Order Placed! 🎉</h2>
        <p className="text-gray-500 font-medium mb-1">Order ID: <span className="font-black text-gray-900">{successOrder?.orderId}</span></p>
        <p className="text-gray-400 text-sm mb-8">Estimated delivery: <span className="text-[#00C853] font-black uppercase tracking-widest text-xs">15–30 mins ⚡</span></p>
        <div className="space-y-4">
          <button onClick={() => navigate('/orders')} className="w-full bg-[#121212] text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10">Track Order</button>
          <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Continue Shopping</button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <main className="pt-24 md:pt-32 min-h-screen bg-[#F8F8F8] pb-12">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-[#FFD600] rounded-full" />
          <h1 className="text-gray-900 font-black text-3xl md:text-4xl">Secure Checkout</h1>
        </div>

        <form onSubmit={handleOrder}>
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3 space-y-8">
              {/* Address */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <h2 className="font-black text-gray-900 mb-8 flex items-center gap-4 text-xl">
                  <span className="w-10 h-10 bg-[#FFD600] rounded-xl flex items-center justify-center text-lg shadow-lg shadow-[#FFD600]/20">📍</span>
                  Delivery Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[['Full Name','fullName','text',true],['Phone Number','phone','tel',true],['Street / Area','street','text',true],['City','city','text',true],['State','state','text',true],['Pincode','pincode','text',true],['Landmark (Optional)','landmark','text',false]].map(([label,key,type,req]) => (
                    <div key={key} className={key === 'fullName' || key === 'street' || key === 'phone' || key === 'landmark' ? 'sm:col-span-2' : 'col-span-1'}>
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">{label}</label>
                      <input type={type} placeholder={label} required={req} value={address[key]} onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))}
                        className="w-full bg-[#F8F8F8] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#FFD600] focus:ring-4 focus:ring-[#FFD600]/5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <h2 className="font-black text-gray-900 mb-8 flex items-center gap-4 text-xl">
                  <span className="w-10 h-10 bg-[#FFD600] rounded-xl flex items-center justify-center text-lg shadow-lg shadow-[#FFD600]/20">💳</span>
                  Payment Method
                </h2>
                <div className="space-y-4">
                  {[['cod','💵 Cash on Delivery','Pay when items are delivered'],['online','💳 Online Payment','UPI, Credit/Debit Cards, Netbanking']].map(([val,label,desc]) => (
                    <label key={val} className={`flex items-center gap-5 p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${paymentMethod === val ? 'border-[#FFD600] bg-[#FFD600]/5 shadow-lg shadow-[#FFD600]/5' : 'border-gray-50 hover:border-gray-200'}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === val ? 'border-[#FFD600] bg-[#FFD600]' : 'border-gray-300'}`}>
                        {paymentMethod === val && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <input type="radio" value={val} className="hidden" checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} />
                      <div>
                        <div className="font-black text-gray-900 text-base mb-0.5">{label}</div>
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-widest">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <h2 className="font-black text-gray-900 mb-6 flex items-center gap-4 text-xl">
                  <span className="w-10 h-10 bg-[#FFD600] rounded-xl flex items-center justify-center text-lg shadow-lg shadow-[#FFD600]/20">🎟️</span>
                  Apply Coupon
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter Code (e.g. WELCOME50)" className="flex-1 bg-[#F8F8F8] border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#FFD600]" />
                  <button type="button" onClick={handleCoupon} className="bg-[#121212] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10">Apply</button>
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-2 lg:sticky lg:top-32">
              <div className="bg-[#121212] rounded-[3rem] p-8 shadow-2xl shadow-black/20 border border-white/5">
                <h2 className="text-white font-black text-xl mb-8 flex items-center justify-between">
                  Order Summary
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{items.length} Items</span>
                </h2>
                <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {items.map(item => (
                    <div key={item.product} className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img src={item.image || 'https://placehold.co/60'} alt={item.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                        <span className="absolute -top-2 -right-2 bg-[#FFD600] text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#121212]">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-bold truncate mb-1">{item.name}</div>
                        <div className="text-gray-500 text-xs font-black uppercase tracking-tighter">₹{item.price} per unit</div>
                      </div>
                      <div className="text-white font-black text-sm">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex justify-between text-gray-400 text-sm font-medium"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="flex justify-between text-gray-400 text-sm font-medium">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-[#00C853] font-bold' : ''}>
                      {deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#00C853] text-sm font-bold">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-6 mt-4 border-t border-white/10">
                    <div className="text-gray-400 text-xs font-black uppercase tracking-widest">Total Amount</div>
                    <div className="text-white font-black text-3xl">₹{total}</div>
                  </div>
                </div>

                <motion.button type="submit" disabled={placing} whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#FFD600] text-black rounded-[2rem] py-5 text-sm font-black tracking-[0.2em] uppercase mt-10 hover:bg-[#F9C100] transition-all shadow-xl shadow-[#FFD600]/10 flex items-center justify-center gap-3">
                  {placing ? <><span className="animate-spin text-xl">⚡</span> PROCESSING</> : <>CONFIRM ORDER <FiChevronRight className="text-xl" /></>}
                </motion.button>
              </div>
              
              <div className="mt-6 flex items-center gap-4 px-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                  <FiCheckCircle className="text-[#00C853] text-xl" />
                </div>
                <p className="text-gray-400 text-[10px] font-medium leading-relaxed">By placing your order, you agree to QuickPick's terms of use and privacy policy.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
