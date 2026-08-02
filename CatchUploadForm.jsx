import React, { useState, useRef } from 'react';
import { Loader2, ImageIcon, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SPECIES = ['Largemouth Bass','Smallmouth Bass','Spotted Bass','Striped Bass','Crappie','Bluegill','Channel Catfish','Walleye','Northern Pike','Muskie','Rainbow Trout','Brown Trout','Redfish','Snook','Tarpon','Flounder'];

export default function CatchUploadForm({ user, onPosted }) {
  const [pendingImage, setPendingImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [gear, setGear] = useState('');
  const [species, setSpecies] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const select = (file) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Image must be under 8MB.'); return; }
    setPendingImage({ file, url: URL.createObjectURL(file) });
  };

  const cancel = () => {
    if (pendingImage?.url) URL.revokeObjectURL(pendingImage.url);
    setPendingImage(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async () => {
    if (!pendingImage || !user) return;
    if (caption.length > 200) { setError('Caption must be under 200 characters.'); return; }
    setBusy(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pendingImage.file });
      const record = await base44.entities.MemberCatch.create({
        image_url: file_url,
        caption: caption.trim(),
        gear_used: gear.trim(),
        species: species.trim(),
        author_id: user.id,
        author_name: user.full_name || user.email || 'Angler',
      });
      setCaption('');
      setGear('');
      setSpecies('');
      cancel();
      onPosted?.(record);
    } catch (e) {
      setError('Failed to post your catch. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60 p-4">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => select(e.target.files?.[0])} />
      {!pendingImage ? (
        <button onClick={() => fileRef.current?.click()} className="w-full border border-dashed border-[#1C1010] hover:border-[#E10000] rounded-sm py-8 flex flex-col items-center gap-2 text-[#E2E8F0]/50 hover:text-[#E10000] hover:bg-[#E10000]/5 transition-all">
          <ImageIcon className="w-7 h-7" />
          <span className="text-xs uppercase tracking-[0.2em]">Upload a Catch Photo</span>
        </button>
      ) : (
        <div>
          <div className="flex items-start gap-3 rounded-sm border border-[#E10000]/50 bg-[#E10000]/5 p-2.5">
            <img src={pendingImage.url} alt="preview" className="w-20 h-20 object-cover rounded-sm border border-[#1C1010] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#E10000] font-semibold leading-snug">⚠ Knowingly posting harmful material will result in an immediate ban and possible legal action.</p>
              <button onClick={cancel} disabled={busy} className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#E2E8F0]/50 hover:text-[#E10000] underline">
                <X className="w-3 h-3" /> Remove image
              </button>
            </div>
          </div>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} placeholder="Caption (e.g. 5lb largemouth on a Texas rig)" className="w-full mt-3 bg-[#0A0A0A] border border-[#1C1010] focus:border-[#E10000] rounded-sm px-3 py-2 text-sm text-[#E2E8F0] outline-none" />
          <input value={gear} onChange={(e) => setGear(e.target.value)} maxLength={200} placeholder="Gear used (rod, reel, bait…)" className="w-full mt-2 bg-[#0A0A0A] border border-[#1C1010] focus:border-[#E10000] rounded-sm px-3 py-2 text-sm text-[#E2E8F0] outline-none" />
          <input value={species} onChange={(e) => setSpecies(e.target.value)} maxLength={60} list="catch-species" placeholder="Species (e.g., Largemouth Bass)" className="w-full mt-2 bg-[#0A0A0A] border border-[#1C1010] focus:border-[#E10000] rounded-sm px-3 py-2 text-sm text-[#E2E8F0] outline-none" />
          <datalist id="catch-species">{SPECIES.map((s) => <option key={s} value={s} />)}</datalist>
          {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={submit} disabled={busy} className="px-4 py-2 bg-[#E10000] text-white rounded-sm hover:bg-[#E10000]/80 disabled:opacity-40 flex items-center gap-1.5 text-xs uppercase tracking-wider lift-3d">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Post Catch
            </button>
            <button onClick={cancel} disabled={busy} className="px-4 py-2 border border-[#1C1010] text-[#E2E8F0]/80 rounded-sm text-xs uppercase tracking-wider disabled:opacity-40">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}