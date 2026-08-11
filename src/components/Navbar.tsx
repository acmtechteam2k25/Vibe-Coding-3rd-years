'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, MessageSquare, UserCheck, PlusCircle, Sparkles, LayoutDashboard } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<'OWNER' | 'TENANT'>('TENANT');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Fetch active role from user session or dev mode
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data?.role) {
          setCurrentRole(data.role);
        }
      })
      .catch(() => {});
  }, []);

  const switchRoleDemo = async (newRole: 'OWNER' | 'TENANT') => {
    setCurrentRole(newRole);
    // Reload page to reflect role changes across app
    window.location.href = newRole === 'OWNER' ? '/owner/dashboard' : '/tenant/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              HomeHub
            </span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-blue-600 -mt-1">
              Smart Rentals
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/80 text-sm font-medium text-slate-700">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full transition-colors ${
              pathname === '/' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-blue-600'
            }`}
          >
            Home
          </Link>
          <Link
            href="/properties"
            className={`px-4 py-1.5 rounded-full transition-colors ${
              pathname.startsWith('/properties') ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-blue-600'
            }`}
          >
            Browse Listings
          </Link>

          {currentRole === 'OWNER' ? (
            <Link
              href="/owner/dashboard"
              className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/owner') ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-blue-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Owner Dashboard
            </Link>
          ) : (
            <Link
              href="/tenant/dashboard"
              className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/tenant') ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-blue-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Tenant Dashboard
            </Link>
          )}
        </nav>

        {/* Right Section: Role Switcher & Auth */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for Demo / Testing */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => switchRoleDemo('TENANT')}
              className={`px-3 py-1 rounded-md transition-all ${
                currentRole === 'TENANT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tenant View
            </button>
            <button
              onClick={() => switchRoleDemo('OWNER')}
              className={`px-3 py-1 rounded-md transition-all ${
                currentRole === 'OWNER'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Owner View
            </button>
          </div>

          {currentRole === 'OWNER' && (
            <Link
              href="/owner/dashboard?action=add"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Post Listing
            </Link>
          )}

          {/* Clerk Auth Integration */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
