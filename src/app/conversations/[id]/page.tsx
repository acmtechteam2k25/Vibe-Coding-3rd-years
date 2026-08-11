'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CounterOfferModal from '@/components/CounterOfferModal';
import OfferModal from '@/components/OfferModal';
import { supabase } from '@/lib/supabase';
import {
  Send,
  Tag,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Building,
  ChevronLeft,
  Info,
  Clock,
  Sparkles,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

export default function ConversationThreadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [conversation, setConversation] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Modals
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [targetOfferForCounter, setTargetOfferForCounter] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversationData = async () => {
    try {
      // 1. Get Current User Role & ID
      const userRes = await fetch('/api/dashboard/stats');
      const userData = await userRes.json();
      setCurrentUser(userData);

      // 2. Get Conversation & Messages
      const res = await fetch(`/api/conversations/${params.id}`);
      const data = await res.json();
      if (data && !data.error) {
        setConversation(data);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversationData();

    // Supabase Realtime Subscription for instant chat updates
    const channel = supabase
      .channel(`conversation:${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversationId=eq.${params.id}`,
        },
        () => {
          fetchConversationData();
        }
      )
      .subscribe();

    // Fallback polling every 4 seconds
    const interval = setInterval(() => {
      fetchConversationData();
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: params.id,
          type: 'TEXT',
          text: inputText.trim(),
        }),
      });
      if (res.ok) {
        setInputText('');
        fetchConversationData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleCreateOffer = async (amount: number, note?: string) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: params.id,
          type: 'OFFER',
          text: note || undefined,
          offerAmount: amount,
        }),
      });
      fetchConversationData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOfferAction = async (messageId: string, action: 'accept' | 'reject' | 'counter', counterAmount?: number) => {
    try {
      await fetch(`/api/messages/${messageId}/offer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, counterAmount }),
      });
      fetchConversationData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full animate-pulse space-y-4">
          <div className="h-20 bg-slate-200 rounded-2xl" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl text-center border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Conversation Not Found</h2>
          <button
            onClick={() => router.push('/properties')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const property = conversation.property;
  const isOwner = currentUser?.role === 'OWNER';
  const otherPartyName = isOwner ? conversation.tenant?.name : conversation.owner?.name;
  const askingPrice = property?.price || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col h-[calc(100vh-5rem)]">
        {/* Header Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <img
              src={property?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'}
              alt=""
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <h2 className="font-extrabold text-slate-900 text-base line-clamp-1">{property?.title}</h2>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>With <strong className="text-slate-800">{otherPartyName}</strong> ({isOwner ? 'Tenant' : 'Owner'})</span>
                <span>•</span>
                <span className="font-semibold text-blue-600">Asking: ₹{askingPrice.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                conversation.status === 'ACCEPTED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : conversation.status === 'NEGOTIATING'
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {conversation.status}
            </span>

            {!isOwner && conversation.status !== 'ACCEPTED' && (
              <button
                onClick={() => setShowOfferModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> New Offer
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Chat Thread Container */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No messages yet. Send an inquiry or submit a rental offer below.
            </div>
          ) : (
            messages.map((msg) => {
              const senderRole = msg.sender?.role;
              const isMe = (isOwner && senderRole === 'OWNER') || (!isOwner && senderRole === 'TENANT');
              const isOffer = msg.type === 'OFFER';
              const isSystem = msg.type === 'SYSTEM';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      {msg.text}
                    </div>
                  </div>
                );
              }

              if (isOffer) {
                const offerAmt = msg.offerAmount || 0;
                const diff = offerAmt - askingPrice;
                const percentDiff = Math.abs(Math.round((diff / askingPrice) * 100));
                const status = msg.offerStatus || 'PENDING';

                // Can I perform action on this offer card?
                // Owner can act on Tenant pending offer
                // Tenant can act on Owner counter pending offer
                const canAct =
                  status === 'PENDING' &&
                  ((isOwner && senderRole === 'TENANT') || (!isOwner && senderRole === 'OWNER'));

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-2`}
                  >
                    <div
                      className={`max-w-md w-full p-4 rounded-2xl border shadow-md transition-all ${
                        isMe
                          ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-slate-800'
                          : 'bg-white text-slate-900 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-emerald-400" />
                          <span className="font-extrabold text-xs tracking-wide uppercase">
                            Rental Offer Card
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            status === 'ACCEPTED'
                              ? 'bg-emerald-500 text-white'
                              : status === 'REJECTED'
                              ? 'bg-red-500 text-white'
                              : status === 'COUNTERED'
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-2xl font-black">
                          ₹{offerAmt.toLocaleString('en-IN')}
                          <span className="text-xs font-normal opacity-80">/month</span>
                        </div>

                        {/* Percentage Indicator */}
                        {diff !== 0 && (
                          <div className="text-xs font-semibold flex items-center gap-1">
                            {diff < 0 ? (
                              <span className="text-amber-400 flex items-center gap-1">
                                <TrendingDown className="w-3.5 h-3.5" /> {percentDiff}% below asking price
                              </span>
                            ) : (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" /> {percentDiff}% above asking price
                              </span>
                            )}
                          </div>
                        )}

                        {msg.text && <p className="text-xs italic opacity-90 pt-1">{msg.text}</p>}
                      </div>

                      {/* Action Buttons for receiving party */}
                      {canAct && conversation.status !== 'ACCEPTED' && (
                        <div className="mt-4 pt-3 border-t border-slate-200/20 grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleOfferAction(msg.id, 'accept')}
                            className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => {
                              setTargetOfferForCounter(msg);
                              setShowCounterModal(true);
                            }}
                            className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Counter
                          </button>
                          <button
                            onClick={() => handleOfferAction(msg.id, 'reject')}
                            className="py-1.5 px-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.sender?.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              }

              // Plain Text Bubble
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-1`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.sender?.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendText} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message, query about amenities, or availability..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs font-medium text-slate-900"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </main>

      <OfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={handleCreateOffer}
        askingPrice={askingPrice}
      />

      {targetOfferForCounter && (
        <CounterOfferModal
          isOpen={showCounterModal}
          onClose={() => setShowCounterModal(false)}
          onSubmit={(counterAmt) => handleOfferAction(targetOfferForCounter.id, 'counter', counterAmt)}
          originalOfferAmount={targetOfferForCounter.offerAmount || askingPrice}
          askingPrice={askingPrice}
        />
      )}

      <Footer />
    </div>
  );
}
