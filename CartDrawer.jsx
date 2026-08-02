import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from './CartContext';
import { base44 } from '@/api/base44Client';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleCheckout = async () => {
    setCheckoutError('');
    setCheckingOut(true);
    try {
      const payload = items.map(i => ({
        product_id: i.product.id,
        name: `${i.product.name}${i.size || i.color ? ` — ${[i.size, i.color].filter(Boolean).join(' / ')}` : ''}`,
        quantity: i.quantity,
      }));
      const res = await base44.functions.invoke('create-checkout', { items: payload });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      if (!data.redirectUrl) throw new Error('No checkout URL returned');
      window.location.href = data.redirectUrl;
    } catch (e) {
      setCheckoutError(e.message || 'Could not start checkout');
      setCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[65] bg-[#0A0A0A]/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[66] w-full max-w-md bg-[#0A0A0A] border-l border-[#1C1010] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[#1C1010]">
              <div>
                <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Your Cart</span>
                <h2 className="font-heading font-extrabold text-2xl text-[#E2E8F0] uppercase">Tackle Box</h2>
              </div>
              <button onClick={closeCart} className="w-9 h-9 rounded-full glass-light flex items-center justify-center">
                <X className="w-4 h-4 text-[#E2E8F0]" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-full border border-[#1C1010] flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#E2E8F0]/30" />
                </div>
                <p className="text-sm text-[#E2E8F0]/40">Your tackle box is empty</p>
                <button onClick={closeCart} className="text-xs tracking-[0.2em] uppercase text-[#E10000] hover:underline">
                  Shop Merch
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-xs text-[#E2E8F0]/40 tracking-wider uppercase mb-2">{totalItems} Item{totalItems !== 1 ? 's' : ''}</div>
                  {items.map(item => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 p-3 border border-[#1C1010] rounded-sm"
                    >
                      <img src={item.product.image_url} alt="" className="w-16 h-16 object-cover rounded-sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#E2E8F0] truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-[#E2E8F0]/40 uppercase tracking-wider">
                          {item.size} · {item.color}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.key, -1)} className="w-6 h-6 rounded-sm border border-[#1C1010] flex items-center justify-center hover:border-[#E10000]">
                              <Minus className="w-3 h-3 text-[#E2E8F0]" />
                            </button>
                            <span className="text-xs text-[#E2E8F0] font-mono w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.key, 1)} className="w-6 h-6 rounded-sm border border-[#1C1010] flex items-center justify-center hover:border-[#E10000]">
                              <Plus className="w-3 h-3 text-[#E2E8F0]" />
                            </button>
                          </div>
                          <span className="text-sm text-[#E10000] font-mono ml-auto">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button onClick={() => removeItem(item.key)} className="text-[#E2E8F0]/30 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-[#1C1010] p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50">Subtotal</span>
                    <span className="font-mono text-2xl text-[#E10000]">${totalPrice.toFixed(2)}</span>
                  </div>
                  {checkoutError && <p className="text-xs text-[#E10000] text-center">{checkoutError}</p>}
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full py-4 bg-[#E10000] text-white font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all bio-glow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkingOut ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</> : 'Initiate Checkout'}
                  </button>
                  <p className="text-[10px] text-center text-[#E2E8F0]/30 tracking-wider uppercase">Secure Checkout · Free Shipping Over $75</p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}