'use client';

import React, { useState, useEffect } from 'react';
import { OrderItem } from '@/lib/store';
import { GiftCardBrand } from '@/lib/ratesData';
import { Settings, CheckCircle2, XCircle, Clock, Save, RefreshCw, ShieldCheck, DollarSign, Eye, EyeOff } from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<{ orders: OrderItem[]; brands: GiftCardBrand[]; settings: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'rates'>('orders');
  
  // Rate edit state
  const [editingBrandId, setEditingBrandId] = useState<string>('');
  const [editingCountryCode, setEditingCountryCode] = useState<string>('');
  const [newRateInput, setNewRateInput] = useState<string>('');
  const [rateSaveSuccess, setRateSaveSuccess] = useState<string>('');

  // Password unlock
  const [isUnlocked, setIsUnlocked] = useState(true); // default open for owner
  const [showCodes, setShowCodes] = useState<{ [key: string]: boolean }>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderItem['status'], rejectionReason?: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          orderId,
          status,
          rejectionReason
        })
      });
      const json = await res.json();
      if (json.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSaveRate = async (brandId: string, countryCode: string, rate: number) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_rate',
          brandId,
          countryCode,
          newRate: rate
        })
      });
      const json = await res.json();
      if (json.ok) {
        setRateSaveSuccess(`Updated ${brandId} (${countryCode}) rate to ${rate}%`);
        setTimeout(() => setRateSaveSuccess(''), 3000);
        fetchData();
        setEditingBrandId('');
      }
    } catch (err) {
      alert('Failed to save rate');
    }
  };

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-brand-muted text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-brand-primary" />
        <span>Loading Client Control Center...</span>
      </div>
    );
  }

  const totalVolume = data.orders.reduce((acc, o) => acc + o.totalCardValue, 0);
  const pendingCount = data.orders.filter(o => o.status === 'PENDING' || o.status === 'VERIFYING').length;
  const completedCount = data.orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-brand-border/60 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5" />
            Client Management Console
          </div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Exchange Operations Desk</h1>
          <p className="text-sm text-brand-muted mt-1">Manage live buy-back rates, inspect card codes, and release payouts.</p>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-primary" /> Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl glass-panel border border-brand-border shadow-card">
          <span className="text-xs text-brand-muted block font-semibold">Total Orders Processed</span>
          <span className="text-3xl font-mono font-black text-brand-text mt-1 block">{data.orders.length}</span>
          <span className="text-xs text-brand-success mt-1 block font-medium">Face Volume: ${totalVolume.toFixed(2)}</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 shadow-card">
          <span className="text-xs text-amber-500 block font-semibold">Pending Verification</span>
          <span className="text-3xl font-mono font-black text-amber-500 mt-1 block">{pendingCount}</span>
          <span className="text-xs text-brand-muted mt-1 block">Awaiting card clearance</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-brand-success/30 bg-brand-success/5 shadow-card">
          <span className="text-xs text-brand-success block font-semibold">Completed Trades</span>
          <span className="text-3xl font-mono font-black text-brand-success mt-1 block">{completedCount}</span>
          <span className="text-xs text-brand-muted mt-1 block">Settled payouts</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Incoming Orders ({data.orders.length})
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'rates'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Rates & Margins Manager ({data.brands.length} Brands)
        </button>
      </div>

      {/* Tab 1: Orders Table */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-surface border-b border-brand-border text-xs uppercase text-brand-muted tracking-wider">
                <tr>
                  <th className="py-4 px-5">Tracking Code</th>
                  <th className="py-4 px-5">Card & Nominal</th>
                  <th className="py-4 px-5">Customer Codes / PIN</th>
                  <th className="py-4 px-5">Payout Amount</th>
                  <th className="py-4 px-5">Destination Address</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-brand-text">
                {data.orders.map((o) => {
                  const isRevealed = showCodes[o.id] || false;
                  return (
                    <tr key={o.id} className="hover:bg-brand-surface/70 transition-colors">
                      <td className="py-4 px-5 whitespace-nowrap font-mono font-bold text-brand-primary">
                        {o.trackingCode}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-bold text-brand-text block">{o.brandName}</span>
                        <span className="text-xs text-brand-muted">
                          {o.quantity}x ${o.nominal} ({o.ratePercent}%)
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-brand-surface px-2.5 py-1 rounded border border-brand-border text-brand-text">
                            {isRevealed ? o.cardCodes.join(', ') : '•••• •••• ••••'}
                            {o.cardPin ? ` (PIN: ${isRevealed ? o.cardPin : '•••'})` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowCodes(prev => ({ ...prev, [o.id]: !isRevealed }))}
                            className="text-brand-muted hover:text-brand-primary p-1 cursor-pointer"
                            title="Toggle reveal"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap font-mono font-extrabold text-brand-success">
                        ${o.payoutAmount.toFixed(2)} USD
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-xs font-mono text-brand-muted max-w-[180px] truncate" title={o.payoutAddress}>
                        {o.payoutAddress}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          o.status === 'COMPLETED'
                            ? 'bg-brand-successGlow text-brand-success border border-brand-success/40'
                            : o.status === 'REJECTED'
                            ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        }`}>
                          {o.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                        {o.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-brand-success/15 hover:bg-brand-success text-brand-success hover:text-white text-xs font-bold transition-all cursor-pointer"
                            title="Mark as paid"
                          >
                            Approve & Pay
                          </button>
                        )}
                        {o.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'VERIFYING')}
                            className="px-2.5 py-1 rounded-lg bg-brand-primary/15 hover:bg-brand-primary text-brand-primary hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Verify
                          </button>
                        )}
                        {o.status !== 'REJECTED' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason (e.g. Card already redeemed):', 'Card is invalid or already redeemed');
                              if (reason) handleUpdateStatus(o.id, 'REJECTED', reason);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Rates & Margins Manager */}
      {activeTab === 'rates' && (
        <div className="space-y-6">
          {rateSaveSuccess && (
            <div className="p-4 rounded-xl bg-brand-successGlow border border-brand-success/40 text-brand-success text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{rateSaveSuccess}</span>
            </div>
          )}

          <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card">
            <div className="p-6 bg-brand-surface border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-text">Live Card Buy Rates</h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Change your buy-back rate percentage. Changing this directly updates what customers receive in the calculator.
              </p>
            </div>

            <div className="divide-y divide-brand-border/40">
              {data.brands.map((b) => (
                <div key={b.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-surface/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-brand-surface border border-brand-border">{b.icon}</span>
                    <div>
                      <h4 className="text-base font-bold text-brand-text">{b.name}</h4>
                      <span className="text-xs text-brand-muted">{b.category} • {b.verificationTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {b.countries.map((c) => {
                      const isEditing = editingBrandId === b.id && editingCountryCode === c.code;
                      return (
                        <div key={c.code} className="flex items-center gap-2 bg-brand-surface px-3 py-1.5 rounded-xl border border-brand-border text-xs">
                          <span className="text-sm">{c.flag}</span>
                          <span className="font-semibold text-brand-text/80">{c.code}:</span>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.5"
                                value={newRateInput}
                                onChange={(e) => setNewRateInput(e.target.value)}
                                className="w-16 bg-brand-surface text-brand-success font-bold px-1.5 py-0.5 rounded border border-brand-primary text-xs focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveRate(b.id, c.code, parseFloat(newRateInput))}
                                className="p-1 rounded bg-brand-success text-white cursor-pointer"
                                title="Save"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingBrandId('')}
                                className="p-1 rounded bg-brand-card hover:bg-brand-cardHover text-brand-muted cursor-pointer"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-brand-success">{c.ratePercent}%</span>
                              <button
                                onClick={() => {
                                  setEditingBrandId(b.id);
                                  setEditingCountryCode(c.code);
                                  setNewRateInput(c.ratePercent.toString());
                                }}
                                className="text-[10px] text-brand-primary hover:underline font-bold cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
