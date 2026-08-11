'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { Search, MapPin, Building, ShieldCheck, Sparkles, SlidersHorizontal, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProperties(data.slice(0, 6)); // Top featured listings
        }
      })
      .catch((err) => console.error('Failed to load properties:', err))
      .finally(() => setLoading(false));
  }, []);

  const triggerSeed = async () => {
    try {
      setLoading(true);
      await fetch('/api/seed', { method: 'POST' });
      const res = await fetch('/api/properties');
      const data = await res.json();
      if (Array.isArray(data)) setProperties(data.slice(0, 6));
    } catch (e) {
      console.error('Seed error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            Smart Property Rentals Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Find Your Dream Rental Home & Negotiate Price <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">Directly in Chat</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Eliminate friction between property owners and prospective tenants. Inquire about amenities, submit offers, and close leases in single-threaded conversations.
          </p>

          {/* Hero Search Box */}
          <div className="mt-10 max-w-3xl mx-auto bg-white rounded-2xl p-2.5 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 w-full text-slate-700">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                placeholder="Search city, area, or property title (e.g. Koramangala, Bandra)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-medium focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <Link
              href={`/properties?query=${encodeURIComponent(searchQuery)}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 shrink-0"
            >
              Explore Homes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800 pt-8 text-center">
            <div>
              <div className="text-2xl font-bold text-white">10+</div>
              <div className="text-xs text-slate-400">Verified Listings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">0%</div>
              <div className="text-xs text-slate-400">Brokerage Fees</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">Realtime</div>
              <div className="text-xs text-slate-400">Direct Landlord Chat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">Inline</div>
              <div className="text-xs text-slate-400">Price Negotiation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Rental Properties</h2>
            <p className="text-slate-500 text-sm mt-1">Explore top handpicked verified listings available for immediate rent.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerSeed}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Reset Demo Seed Data
            </button>
            <Link
              href="/properties"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              View All Listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
            <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-lg">No listings found</h3>
            <p className="text-slate-500 text-xs mt-1 mb-4">Populate the database with sample rental listings.</p>
            <button
              onClick={triggerSeed}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              Seed Sample Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                id={prop.id}
                title={prop.title}
                price={prop.price}
                address={prop.address}
                bedrooms={prop.bedrooms}
                bathrooms={prop.bathrooms}
                areaSqft={prop.areaSqft}
                images={prop.images}
                amenities={prop.amenities}
                status={prop.status}
              />
            ))}
          </div>
        )}
      </section>

      {/* Role CTA Section */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-3 py-1 rounded-full">For Landlords</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-4">List Your Property & Manage Offers</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Post detailed property listings with amenities, multi-photo galleries, and exact location pins. Receive, counter, and accept tenant offers seamlessly.
              </p>
            </div>
            <Link
              href="/owner/dashboard"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-md w-fit"
            >
              Go to Owner Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl text-white flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full">For Renters</span>
              <h3 className="text-2xl font-bold text-white mt-4">Browse, Filter & Chat Directly</h3>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                Filter properties by budget, bedrooms, and map radius. Start single-threaded inquiries, negotiate rent inline, and secure your lease.
              </p>
            </div>
            <Link
              href="/tenant/dashboard"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-md w-fit"
            >
              Go to Tenant Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
