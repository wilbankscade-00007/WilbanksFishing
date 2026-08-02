import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCart } from './CartContext';

export default function ProductDetailModal({ product, onClose }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (product) {
      setSize(product.sizes?.[0] || null);
      setColor(product.colors?.[0] || null);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  const handleAdd = () => {
    setAdding(true);
    setTimeout(() => {
      addItem(product, size, color);
      setAdding(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-[#0A0A0A]/90 backdrop-blur-md flex items-stretch md:items-center justify-center p-0 md:p-6"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-[#0A0A0A] border border-[#1C1010] rounded-sm overflow-hidden grid md:grid-cols-2 max-h-screen md:max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full glass-light flex items-center justify-center">
              <X className="w-4 h-4 text-[#E2E8F0]" />
            </button>

            <div className="relative h-64 md:h-auto md:min-h-[500px] md:sticky md:top-0 overflow-hidden">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent md:bg-gradient-to-r" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] tracking-[0.3em] text-[#E10000] uppercase glass-light px-3 py-1 rounded-sm">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div>
                <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#E2E8F0] uppercase leading-[0.9]">
                  {product.name}
                </h2>
                <p className="text-sm text-[#E2E8F0]/50 mt-2">{product.tagline}</p>
              </div>

              <p className="font-mono text-2xl text-[#E10000]">${product.price}</p>

              <p className="text-sm text-[#E2E8F0]/70 leading-relaxed">{product.description}</p>

              {product.specs && product.specs.length > 0 && (
                <div>
                  <h3 className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase mb-3">Technical Specs</h3>
                  <div className="border border-[#1C1010] rounded-sm divide-y divide-[#1C1010]">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex justify-between px-4 py-2.5">
                        <span className="text-xs text-[#E2E8F0]/50 tracking-wider uppercase">{spec.label}</span>
                        <span className="text-xs text-[#E2E8F0]/90 font-mono">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-[10px] tracking-[0.4em] text-[#E2E8F0]/50 uppercase mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm border transition-colors ${
                          size === s
                            ? 'bg-[#E10000] text-white border-[#E10000]'
                            : 'border-[#1C1010] text-[#E2E8F0]/70 hover:border-[#E10000]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-[10px] tracking-[0.4em] text-[#E2E8F0]/50 uppercase mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(c => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm border transition-colors ${
                          color === c
                            ? 'bg-[#E10000] text-white border-[#E10000]'
                            : 'border-[#1C1010] text-[#E2E8F0]/70 hover:border-[#E10000]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={adding}
                className="w-full py-4 bg-[#E10000] text-white font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-[#0A0A0A] hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all bio-glow disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add to Tackle Box'}
              </button>

              {!product.in_stock && (
                <p className="text-xs text-red-400/80 text-center">Currently out of stock</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}