'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Building, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function SelectRolePage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const setRole = async (role: 'owner' | 'tenant') => {
    setLoading(true);
    try {
      if (user) {
        await user.update({
          unsafeMetadata: { role },
        });
      }
      // Redirect to chosen role's dashboard
      router.push(role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-16 w-full flex-1 flex flex-col justify-center text-center">
        <div className="space-y-4 mb-10">
          <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Select Your Account Role
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How would you like to use HomeHub?
          </h1>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Choose your primary role. You can switch or test both views anytime using the top navigation switcher.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
          {/* Owner Role Option */}
          <button
            onClick={() => setRole('owner')}
            disabled={loading}
            className="group bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Property Owner</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                List rental properties, set asking rent & specs, receive tenant inquiries, and accept or counter rental offers.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              Continue as Owner <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Tenant Role Option */}
          <button
            onClick={() => setRole('tenant')}
            disabled={loading}
            className="group bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Tenant / Renter</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Browse verified properties, filter by budget & location map, ask landlords amenity questions, and submit inline offers.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              Continue as Tenant <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
