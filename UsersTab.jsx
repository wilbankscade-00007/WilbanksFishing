import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, Shield, User as UserIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    base44.entities.User.list()
      .then((data) => {
        const sorted = (data || []).sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
        setUsers(sorted);
      })
      .catch((e) => setError(e.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [u.full_name, u.email, u.role].some((f) => (f || '').toLowerCase().includes(q));
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-5 h-5 text-[#E10000]" />
        <h2 className="font-heading font-bold text-2xl text-[#E2E8F0] uppercase">Registered Users</h2>
      </div>
      <p className="text-sm text-[#E2E8F0]/50 mb-6">
        {users.length} total {users.length === 1 ? 'account' : 'accounts'} · {adminCount} admin
      </p>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E2E8F0]/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email..."
          className="w-full bg-[#1C1010]/40 border border-[#1C1010] focus:border-[#E10000] rounded-sm pl-9 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder:text-[#E2E8F0]/30 outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#E2E8F0]/40">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-sm text-[#E10000]">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-[#E2E8F0]/40">
          {users.length === 0 ? 'No registered users yet.' : 'No matches found.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-[#1C1010]">
          <table className="w-full text-sm">
            <thead className="bg-[#1C1010]/40 text-[#E2E8F0]/50 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1010]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#1C1010]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1C1010] flex items-center justify-center text-xs font-bold text-[#E2E8F0]/70 shrink-0">
                        {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                      </div>
                      <span className="text-[#E2E8F0] font-medium truncate">{u.full_name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#E2E8F0]/60 truncate">{u.email || '—'}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E10000]/15 text-[#E10000] text-[10px] font-bold uppercase tracking-wider">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1C1010] text-[#E2E8F0]/50 text-[10px] font-bold uppercase tracking-wider">
                        <UserIcon className="w-3 h-3" /> User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#E2E8F0]/50 whitespace-nowrap">
                    {u.created_date ? new Date(u.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}