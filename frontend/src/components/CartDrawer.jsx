import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { closeCart, updateItem, removeItem } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { isOpen, items, discount } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 29;
  const total = subtotal + deliveryFee - discount;

  const handleQty = (productId, qty) => {
    if (qty < 1) { dispatch(removeItem(productId)); toast.success('Removed'); }
    else dispatch(updateItem({ productId, quantity: qty }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())} />
          <motion.div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#121212] z-50 flex flex-col shadow-2xl"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2E2E2E]">
              <div>
                <h2 className="text-white font-bold text-lg">Your Cart</h2>
                <p className="text-gray-400 text-xs">{items.length} items</p>
              </div>
              <button onClick={() => dispatch(closeCart())} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#1E1E1E] transition-all">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {items.length > 0 && (
              <div className="mx-5 mt-3 bg-[#00C853]/10 border border-[#00C853]/30 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="text-[#00C853] text-xs font-bold">Estimated Delivery</div>
                  <div className="text-white text-sm font-semibold">15–30 mins</div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <FiShoppingBag className="text-gray-600 w-16 h-16" />
                  <p className="text-gray-400 text-lg font-medium">Your cart is empty</p>
                  <button onClick={() => dispatch(closeCart())} className="bg-[#FFD600] text-black rounded-xl px-6 py-3 font-semibold text-sm">Start Shopping</button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div key={item.product} layout className="flex items-center gap-3 bg-[#1E1E1E] rounded-2xl p-3">
                    <img src={item.image || 'https://placehold.co/60'} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">{item.unit}</p>
                      <p className="text-[#FFD600] font-bold text-sm">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleQty(item.product, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-white hover:bg-[#FFD600] hover:text-black transition-all">
                        {item.quantity === 1 ? <FiTrash2 className="w-3 h-3" /> : <FiMinus className="w-3 h-3" />}
                      </button>
                      <span className="text-white font-bold w-5 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => handleQty(item.product, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-[#FFD600] flex items-center justify-center text-black hover:bg-[#F9C100] transition-all">
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-[#2E2E2E] p-5 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400 text-sm"><span>Subtotal</span><span className="text-white">₹{subtotal}</span></div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-[#00C853] font-semibold' : 'text-white'}>{deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}</span>
                  </div>
                  {discount > 0 && <div className="flex justify-between text-[#00C853] text-sm font-semibold"><span>Discount</span><span>-₹{discount}</span></div>}
                  <div className="flex justify-between text-white font-bold text-lg border-t border-[#2E2E2E] pt-2"><span>Total</span><span>₹{total}</span></div>
                </div>
                {user ? (
                  <Link to="/checkout" onClick={() => dispatch(closeCart())} className="w-full btn-premium btn-primary py-4 text-base uppercase tracking-wider">Proceed to Checkout →</Link>
                ) : (
                  <Link to="/login" onClick={() => dispatch(closeCart())} className="w-full btn-premium btn-primary py-4 text-base uppercase tracking-wider">Login to Checkout</Link>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
