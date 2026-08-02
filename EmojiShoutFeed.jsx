import React, { useState, useEffect, useRef } from 'react';
import { Loader2, LogIn, ImageIcon, Trash2, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReactions } from '@/hooks/useReactions';
import { useTyping } from '@/hooks/useTyping';
import { base44 } from '@/api/base44Client';

const SHOUT_EMOJIS = ['🐟', '🔥', '❤️', '😂', '🎯', '💪', '🌊', '🎣', '🤙', '👀'];
const AVATAR_TONES = ['#E10000', '#B91C1C', '#7F1D1D', '#9F1239', '#92400E', '#78350F', '#5B2A2A', '#4C1D1D'];
const LOGO_URL = 'https://media.base44.com/images/public/user_6a5139050a134ea1f78df45c/504f27ec4_ChatGPTImageJul10202608_14_06AM.png';
const OWNER_NAME = 'Cade (WilbanksFishing)';
const BOT_NAME = 'WilbanksFishing Bot';
const OWNER_IDS = ['6a5139318a957c718bd166bc'];
const OWNER_EMAILS = ['wilbankscade@gmail.com'];

function toneFor(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + (name || '').charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}
function initialOf(name) {
  return ((name || '?').trim()[0] || '?').toUpperCase();
}
function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function isImageUrl(v) {
  return typeof v === 'string' && /^https?:\/\//i.test(v) && /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(v);
}

export default function EmojiShoutFeed() {
  const { reactions, loading, user, submit } = useReactions('emoji_shout', monthKey(), { unique: false });
  const { typingUsers, reportTyping } = useTyping(user);
  const [lastSent, setLastSent] = useState(0);
  const [text, setText] = useState('');
  const [textError, setTextError] = useState('');
  const [sendingText, setSendingText] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [banning, setBanning] = useState(null);
  const [pending, setPending] = useState([]);
  const [pendingImage, setPendingImage] = useState(null);
  const feedRef = useRef(null);
  const fileInputRef = useRef(null);
  const isOwnerViewer = !!(user && (OWNER_IDS.includes(user.id) || OWNER_EMAILS.includes((user.email || '').toLowerCase())));
  const orderedReactions = [...reactions].reverse();
  const typingLabel = typingUsers.length >= 3
    ? 'Several crew members are typing…'
    : typingUsers.length === 2
      ? `${typingUsers[0].author_name || 'Fan'} and ${typingUsers[1].author_name || 'Fan'} are typing…`
      : `${typingUsers[0]?.author_name || 'Fan'} is typing…`;

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
  }, [reactions, pending]);

  // Drop optimistic messages once the real record arrives from the server
  useEffect(() => {
    if (!pending.length) return;
    setPending(prev => prev.filter(p => !reactions.some(r => r.user_id === p.user_id && r.value === p.value && new Date(r.created_date) >= new Date(p.created_date))));
  }, [reactions, pending]);

  // Keep wheel scrolling inside the feed box instead of scrolling the page
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message from the crew feed?')) return;
    setDeleting(id);
    setTextError('');
    try {
      const res = await base44.functions.invoke('delete-shout', { id });
      if (res.data && res.data.ok === false) {
        setTextError(res.data.reason || 'Could not delete message.');
      }
    } catch (e) {
      setTextError('Failed to delete. Try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleBan = async (userId, authorName) => {
    if (!userId) return;
    if (!window.confirm(`Ban ${authorName || 'this user'} from the crew feed? They will no longer be able to post.`)) return;
    setBanning(userId);
    setTextError('');
    try {
      const res = await base44.functions.invoke('ban-user', { user_id: userId });
      if (res.data && res.data.ok === false) {
        setTextError(res.data.reason || 'Could not ban user.');
      }
    } catch (e) {
      setTextError('Failed to ban user.');
    } finally {
      setBanning(null);
    }
  };

  const send = async (emoji) => {
    if (!user) return;
    if (user.banned_shout) { setTextError('You\u2019ve been banned from the crew feed.'); return; }
    const now = Date.now();
    if (now - lastSent < 2500) return;
    setLastSent(now);
    try { await submit(emoji); } catch (e) { /* ignore */ }
  };

  const sendText = async () => {
    if (!user) return;
    const t = text.trim();
    setTextError('');
    if (!t) return;
    if (t.length > 200) { setTextError('Keep it under 200 characters.'); return; }
    const tempId = `tmp-${Date.now()}`;
    const myName = isOwnerViewer ? OWNER_NAME : (user.full_name || user.email || 'Fan');
    // Optimistic: show the message instantly while the server moderates/persists it
    setPending(prev => [...prev, { tempId, user_id: user.id, author_name: myName, target_type: 'emoji_shout', value: t, created_date: new Date().toISOString() }]);
    setText('');
    setSendingText(true);
    try {
      const res = await base44.functions.invoke('post-shout', { text: t });
      if (res.data && res.data.ok === false) {
        setPending(prev => prev.filter(p => p.tempId !== tempId));
        setTextError(res.data.reason || 'Message not allowed.');
      }
    } catch (e) {
      setPending(prev => prev.filter(p => p.tempId !== tempId));
      setTextError('Failed to post. Try again.');
    } finally {
      setSendingText(false);
    }
  };

  const selectImage = (file) => {
    if (!file) return;
    setTextError('');
    if (!file.type.startsWith('image/')) { setTextError('Please choose an image file.'); return; }
    if (file.size > 8 * 1024 * 1024) { setTextError('Image must be under 8MB.'); return; }
    if (pendingImage?.url) URL.revokeObjectURL(pendingImage.url);
    setPendingImage({ file, url: URL.createObjectURL(file) });
  };

  const cancelImage = () => {
    if (pendingImage?.url) URL.revokeObjectURL(pendingImage.url);
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImage = async () => {
    if (!pendingImage) return;
    setTextError('');
    const now = Date.now();
    if (now - lastSent < 5000) { setTextError('Slow down — wait a few seconds before posting again.'); return; }
    setImgUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pendingImage.file });
      const res = await base44.functions.invoke('post-shout', { image_url: file_url });
      if (res.data && res.data.ok === false) {
        setTextError(res.data.reason || 'Image not allowed.');
      } else {
        setLastSent(Date.now());
        cancelImage();
      }
    } catch (e) {
      setTextError('Failed to post image. Try again.');
    } finally {
      setImgUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center py-12 px-6 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60">
        <div className="w-12 h-12 rounded-full border border-[#E10000]/40 bg-[#E10000]/10 flex items-center justify-center mb-3">
          <LogIn className="w-5 h-5 text-[#E10000]" />
        </div>
        <h3 className="font-heading font-bold text-base text-[#E2E8F0] uppercase mb-1">Log in to react</h3>
        <p className="text-xs text-[#E2E8F0]/50 max-w-xs mb-4">Drop an emoji into the live crew feed — quick, fun, no typing required.</p>
        <Link to="/login" className="px-5 py-2 bg-[#E10000] text-white text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-transparent hover:border hover:border-[#E10000] transition-all lift-3d">Log In</Link>
      </div>
    );
  }

  return (
    <div className="border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C1010] bg-[#1C1010]/30">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E10000]" />
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-[#E2E8F0] font-bold">Family Gathering</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/40">{reactions.length} this month</span>
      </div>

      <div ref={feedRef} className="h-56 overflow-y-auto px-4 py-3 space-y-2 hide-scrollbar">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#E10000]" /></div>
        ) : reactions.length === 0 ? (
          <p className="text-center text-[#E2E8F0]/40 text-sm py-8">Be the first to drop an emoji 👇</p>
        ) : (
          [...orderedReactions, ...pending].map((r) => {
            const isEmoji = SHOUT_EMOJIS.includes(r.value);
            const isImage = isImageUrl(r.value);
            const isOwnerPost = r.author_name === OWNER_NAME;
            const isBotPost = r.author_name === BOT_NAME;
            const isBrandPost = isOwnerPost || isBotPost;
            const isMine = r.user_id === user.id;
            const isLeft = isMine || isBotPost;
            return (
              <div key={r.tempId || r.id} className={`flex items-start gap-2 ${isLeft ? '' : 'flex-row-reverse'} ${r.tempId ? 'opacity-60' : ''}`}>
                {isBrandPost ? (
                  <img src={LOGO_URL} alt="WilbanksFishing" loading="eager" decoding="async" className="w-8 h-8 rounded-full shrink-0 object-contain bg-[#0A0A0A] p-0.5 border border-[#E10000] bio-glow" />
                ) : (
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white border border-[#1C1010]" style={{ background: toneFor(r.author_name), boxShadow: `0 0 8px ${toneFor(r.author_name)}55` }}>
                    {initialOf(r.author_name)}
                  </div>
                )}
                <div className={`flex flex-col max-w-[80%] ${isLeft ? 'items-start' : 'items-end'}`}>
                  <div className={`flex items-center gap-2 ${isLeft ? '' : 'flex-row-reverse'}`}>
                    <span className={`text-xs font-bold ${isBotPost ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.75)]' : isOwnerPost ? 'text-[#E10000] text-glow' : 'text-[#E2E8F0]/70'}`}>{isOwnerPost ? OWNER_NAME : isBotPost ? BOT_NAME : (isMine ? 'You' : (r.author_name || 'Fan'))}</span>
                    {isBotPost && <span className="text-[8px] uppercase tracking-[0.15em] bg-[#E10000] text-white px-1 py-0.5 rounded-sm font-bold">Bot</span>}
                    <span className="text-[10px] text-[#E2E8F0]/30">{timeAgo(r.created_date)}</span>
                    {isOwnerViewer && !isBrandPost && !isMine && (
                      <button type="button" onClick={() => handleBan(r.user_id, r.author_name)} disabled={banning === r.user_id} title="Ban user from crew feed" className="p-1 rounded-sm text-[#E2E8F0]/30 hover:text-[#E10000] hover:bg-[#E10000]/10 transition-all disabled:opacity-40">
                        {banning === r.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                      </button>
                    )}
                    {isOwnerViewer && (
                      <button type="button" onClick={() => handleDelete(r.id)} disabled={deleting === r.id} title="Delete message" className="ml-auto p-1 rounded-sm text-[#E2E8F0]/30 hover:text-[#E10000] hover:bg-[#E10000]/10 transition-all disabled:opacity-40">
                        {deleting === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  {isEmoji ? (
                    <span className="text-2xl leading-none">{r.value}</span>
                  ) : isImage ? (
                    <img
                      src={r.value}
                      alt="catch"
                      loading="lazy"
                      className="rounded-sm border border-[#1C1010] max-h-48 object-cover mt-0.5"
                    />
                  ) : (
                    <p className={`text-sm text-[#E2E8F0]/90 bg-[#1C1010]/60 border border-[#1C1010] rounded-sm px-2.5 py-1.5 mt-0.5 break-words ${isLeft ? '' : 'text-right'}`}>{r.value}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
        {typingUsers.length > 0 && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white border border-[#1C1010]" style={{ background: toneFor(typingUsers[0]?.author_name), boxShadow: `0 0 8px ${toneFor(typingUsers[0]?.author_name)}55` }}>
              {initialOf(typingUsers[0]?.author_name)}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-[#E2E8F0]/50 mb-0.5">{typingLabel}</span>
              <div className="bg-[#1C1010]/60 border border-[#1C1010] rounded-sm px-3 py-2.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#E2E8F0]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#E2E8F0]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#E2E8F0]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#1C1010] p-3 bg-[#0A0A0A]/80">
        <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
          {SHOUT_EMOJIS.map((e) => (
            <button key={e} onClick={() => send(e)} className="text-xl w-9 h-9 sm:text-2xl sm:w-10 sm:h-10 rounded-sm border border-[#1C1010] hover:border-[#E10000] hover:bg-[#E10000]/10 hover:scale-110 transition-all">{e}</button>
          ))}
        </div>
        <p className="text-[10px] text-[#E2E8F0]/30 mt-2 text-center">Tap an emoji, type, or drop a catch photo · resets monthly</p>
        <div className="mt-3 pt-3 border-t border-[#1C1010]">
          <p className="text-[10px] text-[#E10000]/80 mb-2 text-center tracking-wide">
            ⚠ Fishing photos only · AI-scanned · inappropriate posts will be banned
          </p>
          {pendingImage && (
            <div className="mb-2 rounded-sm border border-[#E10000]/50 bg-[#E10000]/5 p-2.5">
              <div className="flex items-start gap-3">
                <img src={pendingImage.url} alt="preview" className="w-16 h-16 object-cover rounded-sm border border-[#1C1010] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#E10000] font-semibold leading-snug">⚠ Knowingly posting harmful material will result in an immediate ban and possible legal action, depending on the content.</p>
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={confirmImage} disabled={imgUploading} className="px-3 py-1.5 bg-[#E10000] text-white text-[11px] uppercase tracking-wider rounded-sm hover:bg-[#E10000]/80 disabled:opacity-40 flex items-center gap-1.5">
                      {imgUploading && <Loader2 className="w-3 h-3 animate-spin" />} Send
                    </button>
                    <button type="button" onClick={cancelImage} disabled={imgUploading} className="px-3 py-1.5 border border-[#1C1010] hover:border-[#E2E8F0]/40 text-[#E2E8F0]/80 text-[11px] uppercase tracking-wider rounded-sm disabled:opacity-40">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {textError && <p className="text-[11px] text-red-400 mb-1.5">{textError}</p>}
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => { setText(e.target.value); reportTyping(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } }}
              maxLength={200}
              placeholder="Type a message (AI-moderated)…"
              className="flex-1 bg-[#0A0A0A] border border-[#1C1010] focus:border-[#E10000] rounded-sm px-3 py-2 text-sm text-[#E2E8F0] outline-none"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={imgUploading || sendingText}
              title="Upload a catch photo"
              className="px-3 py-2 border border-[#1C1010] hover:border-[#E10000] text-[#E2E8F0] hover:text-[#E10000] rounded-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {imgUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => selectImage(e.target.files?.[0])}
              className="hidden"
            />
            <button
              onClick={sendText}
              disabled={sendingText || !text.trim()}
              className="px-4 py-2 bg-[#E10000] text-white rounded-sm hover:bg-[#E10000]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all lift-3d text-xs uppercase tracking-wider"
            >
              {sendingText ? '…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}