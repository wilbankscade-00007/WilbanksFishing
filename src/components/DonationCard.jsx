import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PRESETS = [5, 10, 25, 50];

export default function DonationCard() {
  const [amount, setAmount] = useState(10);
  const [custom, setCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const finalAmount = custom ? parseFloat(custom) : amount;

  async function handleDonate() {
    setError('');
    const value = Number(finalAmount);
    if (!value || value < 1) {
      setError('Enter an amount of at least $1');
      return;
    }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('create-checkout', {
        items: [{ name: `Donation — $${value.toFixed(2)}`, price: value.toFixed(2), quantity: 1 }],
      });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      if (!data.redirectUrl) throw new Error('No checkout URL returned');
      window.location.href = data.redirectUrl;
    } catch (e) {
      setError(e.message || 'Could not start donation checkout');
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-sm border border-[#E10000]/40 bg-gradient-to-b from-[#1C1010]/40 to-[#0A0A0A] p-6 md:p-8 bio-glow"
    >
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-4 h-4 text-[#E10000]" fill="currentColor" />
        <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Support the Channel</span>
      </div>
      <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#E2E8F0] uppercase leading-tight">
        Support WilbanksFishing
      </h2>
      <p className="text-sm text-[#E2E8F0]/55 mt-2 max-w-md">
        Tips, fuel, and bait add up. Every donation keeps the boat on the water and the cameras rolling — thank you for the support.
      </p>

      <div className="flex flex-wrap gap-2 mt-5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setAmount(p); setCustom(''); }}
            className={`px-4 py-2 rounded-sm border text-sm font-mono transition-all ${
              !custom && amount === p
                ? 'border-[#E10000] bg-[#E10000]/15 text-[#E10000]'
                : 'border-[#1C1010] text-[#E2E8F0]/60 hover:border-[#E10000]/60 hover:text-[#E2E8F0]'
            }`}
          >
            ${p}
          </button>
        ))}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E2E8F0]/40 font-mono text-sm">$</span>
          <input
            type="number"
            min="1"
            step="1"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Other"
            className="w-24 pl-7 pr-3 py-2 rounded-sm border border-[#1C1010] focus:border-[#E10000] bg-[#0A0A0A] text-sm text-[#E2E8F0] font-mono placeholder:text-[#E2E8F0]/30 outline-none"
          />
        </div>
      </div>

      {error && <p className="text-xs text-[#E10000] mt-3">{error}</p>}

      <button
        onClick={handleDonate}
        disabled={submitting}
        className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E10000] text-white font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-[#C00000] transition-colors disabled:opacity-50"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" fill="currentColor" />}
        {submitting ? 'Redirecting…' : `Donate${finalAmount >= 1 ? ` $${finalAmount.toFixed(0)}` : ''}`}
      </button>
      <p className="text-[10px] text-[#E2E8F0]/30 tracking-wider uppercase mt-3">Secure checkout via Base44 Payments</p>
    </motion.div>
  );
}