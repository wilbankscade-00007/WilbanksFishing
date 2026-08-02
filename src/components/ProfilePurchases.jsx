import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ProfilePurchases({ orders }) {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-bold text-xl text-[#E2E8F0] uppercase flex items-center gap-2 mb-4">
        <ShoppingBag className="w-4 h-4 text-[#E10000]" /> Purchases
      </h2>
      {!orders || orders.length === 0 ? (
        <div className="border border-dashed border-[#1C1010] rounded-sm p-8 text-center text-sm text-[#E2E8F0]/40">
          No orders yet. Merch you buy using the email on this account will show up here.
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="border border-[#1C1010] rounded-sm p-4 bg-[#0A0A0A]/40">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[#E2E8F0]/50 tracking-wider truncate">Order {o.order_id ? String(o.order_id).slice(-6) : '—'}</p>
                <p className="font-heading font-bold text-lg text-[#E10000] shrink-0">${Number(o.total || 0).toFixed(2)} <span className="text-[10px] text-[#E2E8F0]/40">{o.currency}</span></p>
              </div>
              <p className="text-[10px] text-[#E2E8F0]/30 tracking-[0.15em] uppercase mt-1">{o.created_date ? new Date(o.created_date).toLocaleDateString() : ''}</p>
              <div className="mt-2 space-y-1">
                {(o.items || []).map((it, i) => (
                  <div key={i} className="flex justify-between text-xs text-[#E2E8F0]/70">
                    <span className="truncate">{it.quantity}× {it.name}</span>
                    <span className="shrink-0">${Number(it.price || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}