'use client';

import React, { useState } from 'react';
import { Tag, TrendingDown, TrendingUp, X, CheckCircle2 } from 'lucide-react';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, messageText?: string) => Promise<void>;
  askingPrice: number;
}

export default function OfferModal({ isOpen, onClose, onSubmit, askingPrice }: OfferModalProps) {
  const [offerAmount, setOfferAmount] = useState<number>(Math.round(askingPrice * 0.95));
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const diff = offerAmount - askingPrice;
  const percentDiff = Math.abs(Math.round((diff / askingPrice) * 100));
  const isBelow = diff < 0;
  const isAbove = diff > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (offerAmount <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit(offerAmount, note);
      onClose();
    } catch (err) {
      console.error('Failed to submit offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Make a Rental Offer</h3>
            <p className="text-xs text-slate-500">Asking Rent: ₹{askingPrice.toLocaleString('en-IN')}/mo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Offered Rent (₹ / month)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                min={1000}
                step={500}
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg text-slate-900"
              />
            </div>

            {/* Percentage Indicator */}
            {diff !== 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
                {isBelow && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {percentDiff}% below asking price
                  </span>
                )}
                {isAbove && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {percentDiff}% above asking price
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Add Message / Terms (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Requesting a 12-month lease with move-in from 1st of next month..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
