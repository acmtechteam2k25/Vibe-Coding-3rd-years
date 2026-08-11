'use client';

import React, { useState } from 'react';
import { RefreshCw, X, TrendingDown, TrendingUp } from 'lucide-react';

interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (counterAmount: number) => Promise<void>;
  originalOfferAmount: number;
  askingPrice: number;
}

export default function CounterOfferModal({
  isOpen,
  onClose,
  onSubmit,
  originalOfferAmount,
  askingPrice,
}: CounterOfferModalProps) {
  const [counterAmount, setCounterAmount] = useState<number>(
    Math.round((originalOfferAmount + askingPrice) / 2)
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const diff = counterAmount - askingPrice;
  const percentDiff = Math.abs(Math.round((diff / askingPrice) * 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (counterAmount <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit(counterAmount);
      onClose();
    } catch (err) {
      console.error('Failed to submit counter offer:', err);
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
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Submit Counter-Offer</h3>
            <p className="text-xs text-slate-500">
              Previous Offer: ₹{originalOfferAmount.toLocaleString('en-IN')} | Asking: ₹{askingPrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Counter Offer Rent (₹ / month)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={counterAmount}
                onChange={(e) => setCounterAmount(Number(e.target.value))}
                min={1000}
                step={500}
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg text-slate-900"
              />
            </div>

            {diff !== 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                {diff < 0 ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> {percentDiff}% below asking price
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> {percentDiff}% above asking price
                  </span>
                )}
              </div>
            )}
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Send Counter Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
