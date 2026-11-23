'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Coins, 
  ShieldCheck, 
  ArrowRight, 
  Send, 
  MessageSquare, 
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { OrderItem } from '@/lib/types';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Chat message state
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !order) return;

    setSendingMsg(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          trackingCode: order.trackingCode,
          message: chatInput.trim()
        })
      });
      const json = await res.json();
      if (json.ok && json.data?.message) {
        setOrder(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), json.data.message]
        } : null);
        setChatInput('');
      }
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25">
          ORDER VERIFICATION & SETTLEMENT PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight mt-3">
          Track Your Transaction
        </h1>
        <p className="text-sm text-brand-muted mt-2">
          Enter your Cardbyte tracking code (e.g. <code className="text-brand-primary font-bold">CB-2993-F1A1</code>) to monitor live status and chat with the verification desk.
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
            placeholder="e.g. CB-2993-F1A1"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-brand-surface border border-brand-border text-brand-text text-sm font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary placeholder:text-brand-muted/40 uppercase"
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
          <span>Locating transaction record and balance ledger...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-sm flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-brand-border space-y-6 shadow-card">
          
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-border/60 gap-4">
            <div>
              <span className="text-xs text-brand-muted block">Transaction ID:</span>
              <span className="text-2xl font-mono font-black text-brand-text">{order.trackingCode}</span>
              <div className="text-xs text-brand-muted mt-0.5">
                Submitted on {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.status === 'COMPLETED'
                  ? 'bg-brand-successGlow text-brand-success border border-brand-success/40'
                  : order.status === 'REJECTED'
                  ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
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
              <span className="font-bold text-brand-text block">Submitted</span>
            </div>
            <div className="space-y-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                order.status === 'VERIFYING' || order.status === 'COMPLETED'
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-surface border border-brand-border text-brand-muted'
              }`}>2</div>
              <span className="font-bold text-brand-text block">Balance Check</span>
            </div>
            <div className="space-y-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                order.status === 'COMPLETED'
                  ? 'bg-brand-success text-white'
                  : 'bg-brand-surface border border-brand-border text-brand-muted'
              }`}>3</div>
              <span className="font-bold text-brand-text block">Payout Released</span>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="rounded-2xl bg-brand-surface p-5 border border-brand-border space-y-3 text-sm">
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Asset Redeemed:</span>
              <span className="font-bold text-brand-text">
                {order.brandName} ({order.quantity}x ${order.nominal}) • {order.cardType === 'PCARD' ? 'Physical Card' : 'E-Code'}
              </span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Total Face Value:</span>
              <span className="font-bold text-brand-text font-mono">${order.totalCardValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Guaranteed Payout Rate:</span>
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
              <span className="font-mono text-brand-text/90 text-xs break-all max-w-[280px] sm:max-w-none text-right">
                {order.payoutAddress}
              </span>
            </div>

            {/* Blockchain TxHash / Payment Proof */}
            {order.txHash && (
              <div className="p-3.5 rounded-xl bg-brand-successGlow border border-brand-success/40 text-brand-success text-xs flex flex-col gap-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4" />
                  Payout Transaction Broadcast Hash / Reference:
                </span>
                <span className="font-mono break-all text-[11px] text-brand-text bg-brand-surface p-2 rounded border border-brand-border">
                  {order.txHash}
                </span>
              </div>
            )}

            {order.rejectionReason && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
                <b>Rejection Reason:</b> {order.rejectionReason}
              </div>
            )}
          </div>

          {/* Live Order Support Chat Messenger */}
          <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-primary" />
                Live Order Verification Chat
              </span>
              <span className="text-[11px] text-brand-muted">Operator Desk Active</span>
            </div>

            {/* Message History */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {(!order.messages || order.messages.length === 0) ? (
                <p className="text-xs text-brand-muted text-center py-3">No messages on this order yet.</p>
              ) : (
                order.messages.map((m) => {
                  const isAdmin = m.sender === 'ADMIN';
                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col text-xs p-3 rounded-xl max-w-[85%] ${
                        isAdmin 
                          ? 'bg-brand-primary/10 border border-brand-primary/20 text-brand-text mr-auto' 
                          : 'bg-brand-success/10 border border-brand-success/20 text-brand-text ml-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="font-bold text-[10px] text-brand-primary">
                          {isAdmin ? '🛡️ Verification Desk' : '👤 You (Seller)'}
                        </span>
                        <span className="text-[10px] text-brand-muted">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{m.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask operator a question or provide extra card details..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-brand-bg border border-brand-border text-brand-text text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
              />
              <button
                type="submit"
                disabled={sendingMsg || !chatInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Telegram Direct Support Banner for Order */}
          <div className="p-4 rounded-2xl bg-brand-surface border border-[#0088cc]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0088cc]" />
              <span className="text-brand-text">Need urgent assistance with order <strong>#{order.trackingCode}</strong>?</span>
            </div>
            <a
              href={`https://t.me/cardbyte_support?text=${encodeURIComponent(`Hello Moderator, I am inquiring about order #${order.trackingCode} (${order.brandName} $${order.payoutAmount}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold text-xs whitespace-nowrap shadow-sm transition-colors"
            >
              Telegram Moderator
            </a>
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
