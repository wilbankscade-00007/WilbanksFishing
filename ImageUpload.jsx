import React, { useState, useRef } from 'react';
import { Loader2, ImageIcon, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImageUpload({ value, onChange, label = "Image" }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    await handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div>
      {label && <label className="text-xs tracking-wider uppercase text-[#E2E8F0]/50 mb-2 block">{label}</label>}

      {value && (
        <div className="relative mb-3 rounded-sm overflow-hidden border border-[#1C1010]">
          <img src={value} alt="" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 px-2 py-1 bg-[#0A0A0A]/80 text-[10px] uppercase tracking-wider text-[#E2E8F0]/80 hover:text-[#E10000] rounded-sm border border-[#1C1010]"
          >
            Remove
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-sm cursor-pointer transition-colors text-center ${
          dragging ? 'border-[#E10000] bg-[#E10000]/5' : 'border-[#1C1010] hover:border-[#E10000] hover:bg-[#1C1010]/30'
        }`}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-[#E10000]" />
        ) : (
          <ImageIcon className="w-6 h-6 text-[#E10000]" />
        )}
        <div>
          <p className="text-xs uppercase tracking-wider text-[#E2E8F0]/80">
            {uploading ? 'Uploading...' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-[10px] text-[#E2E8F0]/40 mt-1">PNG, JPG, WEBP — file from your device</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {error && <p className="text-xs text-[#E10000] mt-2">{error}</p>}

      {value && (
        <p className="flex items-center gap-1 text-[10px] text-[#E2E8F0]/30 mt-2 truncate">
          <Link2 className="w-3 h-3" /> {value}
        </p>
      )}
    </div>
  );
}