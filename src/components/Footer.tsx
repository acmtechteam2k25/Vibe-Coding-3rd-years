import React from 'react';
import Link from 'next/link';
import { Home, ShieldCheck, Heart, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">HomeHub</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              The next-generation smart property rental platform bringing seamless property discovery, direct chat, and inline price negotiations to landlords and tenants.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/properties" className="hover:text-white transition-colors">Browse Properties</Link></li>
              <li><Link href="/tenant/dashboard" className="hover:text-white transition-colors">Tenant Dashboard</Link></li>
              <li><Link href="/owner/dashboard" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Single-Thread Negotiations
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> Interactive Leaflet Maps
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Realtime Messaging
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Demo</h4>
            <p className="text-xs text-slate-400 mb-3">
              Switch between Owner and Tenant views directly using the top navigation bar to test all features live!
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700">
              <span>Zero-cost free-tier stack</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HomeHub Smart Property Rental Platform. Built with Next.js 14, Clerk, Prisma & Leaflet.</p>
        </div>
      </div>
    </footer>
  );
}
