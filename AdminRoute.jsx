import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// Renders children only when the authenticated user has the admin role.
// Must be nested inside a ProtectedRoute so auth is already verified.
export default function AdminRoute() {
  const { user, authChecked } = useAuth();

  if (!authChecked) return null;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        <ShieldAlert className="w-12 h-12 text-[#E10000] mb-4" />
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[#E2E8F0] uppercase mb-2">Access Denied</h1>
        <p className="text-sm text-[#E2E8F0]/50 max-w-sm mb-6">
          This area is restricted to admins. If you believe you should have access, contact the site owner.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2 bg-[#E10000] text-white text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-[#C00000] transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return <Outlet />;
}