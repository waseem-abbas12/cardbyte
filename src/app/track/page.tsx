'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Clock, CheckCircle2, XCircle, AlertCircle, Coins, ShieldCheck, ArrowRight } from 'lucide-react';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupOrder = async (queryCode: string) => {
    if (!queryCode.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders?code=${encodeURIComponent(queryCode.trim())}`);
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'No transaction found with this tracking ID.');
      }
      setOrder(json.data.order);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      lookupOrder(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25">
          ORDER VERIFICATION PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
          Track Your Transaction
        </h1>
        <p className="text-sm text-brand-muted mt-2">
          Enter your 7-character Cardbyte tracking code (e.g. <code>CB-94821</code>) to monitor live status.
        </p>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookupOrder(code);
          }}
          className="mt-6 flex gap-2 max-w-md mx-auto"
        >
          <input
            type="text"
            required
            placeholder="e.g. CB-94821"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-brand-surface border border-brand-border text-white text-sm font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary placeholder:text-brand-muted/40 uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-12 text-brand-muted text-sm flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Locating transaction record...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-brand-border space-y-6 shadow-2xl">
          
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-border/60 gap-4">
            <div>
              <span className="text-xs text-brand-muted block">Transaction ID:</span>
              <span className="text-2xl font-mono font-black text-white">{order.trackingCode}</span>
              <div className="text-xs text-brand-muted mt-0.5">
                Submitted on {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.status === 'COMPLETED'
                  ? 'bg-brand-successGlow text-brand-success border border-brand-success/40'
                  : order.status === 'REJECTED'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
              }`}>
                {order.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>{order.status}</span>
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs py-2">
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-full bg-brand-success text-white flex items-center justify-center mx-auto text-xs font-bold">✓</div>
              <span className="font-bold text-white block">Submitted</span>
            </div>
            <div className="space-y-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                order.status === 'VERIFYING' || order.status === 'COMPLETED'
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-card text-brand-muted'
              }`}>2</div>
              <span className="font-bold text-white block">Balance Check</span>
            </div>
            <div className="space-y-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                order.status === 'COMPLETED'
                  ? 'bg-brand-success text-white'
                  : 'bg-brand-card text-brand-muted'
              }`}>3</div>
              <span className="font-bold text-white block">Payout Sent</span>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="rounded-2xl bg-brand-surface p-5 border border-brand-border space-y-3 text-sm">
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Asset Redeemed:</span>
              <span className="font-bold text-white">{order.brandName} ({order.quantity}x ${order.nominal})</span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Total Face Value:</span>
              <span className="font-bold text-white font-mono">${order.totalCardValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Agreed Payout Rate:</span>
              <span className="font-bold text-brand-success">{order.ratePercent}%</span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Net Payout Amount:</span>
              <span className="font-mono font-extrabold text-brand-success text-lg">
                ${order.payoutAmount.toFixed(2)} USD
              </span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Destination Address:</span>
              <span className="font-mono text-white/90 text-xs break-all max-w-[280px] sm:max-w-none text-right">
                {order.payoutAddress}
              </span>
            </div>
            {order.rejectionReason && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <b>Rejection Note:</b> {order.rejectionReason}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-brand-muted">Loading tracking portal...</div>}>
      <TrackPageContent />
    </Suspense>
  );
}
