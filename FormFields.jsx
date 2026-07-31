import React from 'react';

export function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      {label && <label className="text-xs tracking-wider uppercase text-[#E2E8F0]/50 mb-1 block">{label}</label>}
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 bg-[#1C1010]/50 border border-[#1C1010] rounded-sm text-sm text-[#E2E8F0] placeholder:text-[#E2E8F0]/30 focus:outline-none focus:border-[#E10000] transition-colors" />
    </div>
  );
}

export function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      {label && <label className="text-xs tracking-wider uppercase text-[#E2E8F0]/50 mb-1 block">{label}</label>}
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full px-3 py-2 bg-[#1C1010]/50 border border-[#1C1010] rounded-sm text-sm text-[#E2E8F0] focus:outline-none focus:border-[#E10000] transition-colors resize-none" />
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked || false} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[#E10000]" />
      <span className="text-xs text-[#E2E8F0]/70">{label}</span>
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div>
      {label && <label className="text-xs tracking-wider uppercase text-[#E2E8F0]/50 mb-1 block">{label}</label>}
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 bg-[#1C1010]/50 border border-[#1C1010] rounded-sm text-sm text-[#E2E8F0] focus:outline-none focus:border-[#E10000] transition-colors">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}