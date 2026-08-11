'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, Clock, CheckCircle, Tag, Search, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TenantDashboard() {
  const [stats, setStats] = useState({
    activeNegotiationsCount: 0,
    awaitingResponseCount: 0,
    savedPropertiesCount: 0,
  });
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenantData() {
      setLoading(true);
      try {
        const statsRes = await fetch('/api/dashboard/stats');
        const statsData = await statsRes.json();
        if (statsData && !statsData.error) {
          setStats({
            activeNegotiationsCount: statsData.activeNegotiationsCount || 0,
            awaitingResponseCount: statsData.awaitingResponseCount || 0,
            savedPropertiesCount: statsData.savedPropertiesCount || 0,
          });
        }

        const convsRes = await fetch('/api/conversations');
        const convsData = await convsRes.json();
        if (Array.isArray(convsData)) {
          setConversations(convsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTenantData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tenant Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Track active rental inquiries, counter-offers, and ongoing negotiations.</p>
          </div>

          <Link
            href="/properties"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 w-fit"
          >
            <Search className="w-4 h-4" /> Browse Properties
          </Link>
        </div>

        {/* Live Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-inner">
              <Tag className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.activeNegotiationsCount}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Active Negotiations
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-inner">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.awaitingResponseCount}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Awaiting Your Response
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.savedPropertiesCount}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Active Property Threads
              </div>
            </div>
          </div>
        </div>

        {/* My Conversations List */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">My Property Conversations & Offers</h2>
            <span className="text-xs font-semibold text-slate-500">Total Threads: {conversations.length}</span>
          </div>

          {loading ? (
            <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No ongoing conversations.</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Browse listings to ask questions or submit rental offers.</p>
              <Link
                href="/properties"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
              >
                Browse Properties <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv) => {
                const isAwaitingUser = conv.lastSenderRole === 'OWNER' && conv.status !== 'CLOSED';
                const lastMessage = conv.messages && conv.messages[0];

                return (
                  <Link
                    key={conv.id}
                    href={`/conversations/${conv.id}`}
                    className={`block p-5 rounded-2xl border transition-all hover:shadow-md ${
                      isAwaitingUser
                        ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={conv.property?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'}
                          alt=""
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-base line-clamp-1 flex items-center gap-2">
                            {conv.property?.title}
                            {isAwaitingUser && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase">
                                Action Required
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Landlord: <span className="font-semibold text-slate-800">{conv.owner?.name}</span> | Asking: ₹{conv.property?.price?.toLocaleString('en-IN')}/mo
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end justify-between text-right">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span
                          className={`mt-1 text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            conv.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : conv.status === 'NEGOTIATING'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {conv.status}
                        </span>
                      </div>
                    </div>

                    {lastMessage && (
                      <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="line-clamp-1">
                          <span className="font-bold text-slate-900">{lastMessage.sender?.name}:</span>{' '}
                          {lastMessage.text || `Submitted an offer of ₹${lastMessage.offerAmount?.toLocaleString('en-IN')}`}
                        </span>
                        <span className="text-blue-600 font-bold hover:underline shrink-0 ml-2">Open Chat →</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
