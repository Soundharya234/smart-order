import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiStar, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart, updateItem } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.cart);
  const cartItem = items.find(i => i.product === product._id);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
      toast.success('Added to cart!', { icon: '🛒' });
    } catch (e) {
      toast.error(e || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const handleQty = (qty) => {
    if (qty < 1) return;
    dispatch(updateItem({ productId: product._id, quantity: qty }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 group relative flex flex-col h-full hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.discount > 0 && (
          <span className="bg-[#538CEE] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {product.discount}% OFF
          </span>
        )}
      </div>
      
      {/* Image */}
      <Link to={`/products/${product._id}`} className="block overflow-hidden p-2">
        <div className="relative aspect-square overflow-hidden bg-white rounded-lg">
          <img
            src={product.images?.[0] || 'https://placehold.co/400x400'}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <div className="mb-2">
          <Link to={`/products/${product._id}`}>
            <h3 className="text-gray-800 font-semibold text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          </Link>
          <div className="text-gray-500 text-xs font-medium mt-1">
            {product.unit}
          </div>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {product.mrp > product.price && (
              <span className="text-gray-400 text-[10px] line-through font-medium">₹{product.mrp}</span>
            )}
            <span className="text-gray-900 font-bold text-sm">₹{product.price}</span>
          </div>

          {cartItem ? (
            <div className="flex items-center justify-between bg-[#0C831F] text-white rounded-lg w-[70px] h-8 px-1 shadow-sm">
              <button onClick={() => handleQty(cartItem.quantity - 1)} className="w-6 h-full flex items-center justify-center">
                <FiMinus className="w-3 h-3" />
              </button>
              <span className="font-bold text-sm">{cartItem.quantity}</span>
              <button onClick={() => handleQty(cartItem.quantity + 1)} className="w-6 h-full flex items-center justify-center">
                <FiPlus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={adding || product.stock === 0}
              className="flex items-center justify-center bg-[#F7FFF9] border border-[#0C831F] text-[#0C831F] hover:bg-[#0C831F] hover:text-white disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-50 rounded-lg w-[70px] h-8 text-xs font-bold transition-colors shadow-sm"
            >
              {adding ? <span className="animate-spin text-[10px]">↻</span> : (product.stock === 0 ? 'SOLD' : 'ADD')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
