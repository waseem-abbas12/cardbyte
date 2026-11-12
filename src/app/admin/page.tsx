'use client';

import React, { useState, useEffect } from 'react';
import { OrderItem } from '@/lib/store';
import { GiftCardBrand, PlatformNotification } from '@/lib/ratesData';
import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  DollarSign, 
  Eye, 
  EyeOff, 
  Power, 
  Bell, 
  AlertTriangle,
  Zap,
  Sliders
} from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<{ 
    orders: OrderItem[]; 
    brands: GiftCardBrand[]; 
    notifications: PlatformNotification[]; 
    settings: any 
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'rates' | 'alerts'>('orders');
  
  // Rate edit state
  const [editingBrandId, setEditingBrandId] = useState<string>('');
  const [editingCountryCode, setEditingCountryCode] = useState<string>('');
  const [newEcodeRate, setNewEcodeRate] = useState<string>('');
  const [newPhysicalRate, setNewPhysicalRate] = useState<string>('');
  const [rateSaveSuccess, setRateSaveSuccess] = useState<string>('');

  // Processing time edit state
  const [editingTimeBrandId, setEditingTimeBrandId] = useState<string>('');
  const [newTimeInput, setNewTimeInput] = useState<string>('');

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

  const handleSaveRates = async (brandId: string, countryCode: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_rate',
          brandId,
          countryCode,
          ecodeRate: parseFloat(newEcodeRate),
          physicalRate: parseFloat(newPhysicalRate)
        })
      });
      const json = await res.json();
      if (json.ok) {
        setRateSaveSuccess(`Updated ${brandId.toUpperCase()} (${countryCode}) rates: E-Code ${newEcodeRate}% | Physical ${newPhysicalRate}%`);
        setTimeout(() => setRateSaveSuccess(''), 4000);
        fetchData();
        setEditingBrandId('');
      }
    } catch (err) {
      alert('Failed to save rate');
    }
  };

  const handleSaveVerificationTime = async (brandId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_verification_time',
          brandId,
          verificationTime: newTimeInput
        })
      });
      const json = await res.json();
      if (json.ok) {
        setRateSaveSuccess(`Processing speed updated to: "${newTimeInput}"`);
        setTimeout(() => setRateSaveSuccess(''), 3000);
        fetchData();
        setEditingTimeBrandId('');
      }
    } catch (err) {
      alert('Failed to update processing time');
    }
  };

  const handleToggleBrand = async (brandId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_brand',
          brandId
        })
      });
      const json = await res.json();
      if (json.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to toggle brand status');
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
          <p className="text-sm text-brand-muted mt-1">
            Manage granular E-Code/Physical rates, processing speeds, inventory visibility, and payout approvals.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-primary" /> Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-2xl glass-panel border border-brand-border shadow-card">
          <span className="text-xs text-brand-muted block font-semibold">Total Orders</span>
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

        <div className="p-6 rounded-2xl glass-panel border border-blue-500/30 bg-blue-500/5 shadow-card">
          <span className="text-xs text-blue-500 block font-semibold">Active Inventory</span>
          <span className="text-3xl font-mono font-black text-blue-500 mt-1 block">
            {data.brands.filter(b => b.enabled !== false).length} / {data.brands.length}
          </span>
          <span className="text-xs text-brand-muted mt-1 block">Supported card brands</span>
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
          Rates & Inventory Controls ({data.brands.length} Brands)
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Bell className="w-4 h-4 text-brand-primary" />
          <span>Live Activity & Alerts ({data.notifications?.length || 0})</span>
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
                  <th className="py-4 px-5">Card & Format</th>
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-brand-muted">
                            {o.quantity}x ${o.nominal} ({o.ratePercent}%)
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            o.cardType === 'PCARD' 
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                              : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          }`}>
                            {o.cardType === 'PCARD' ? 'Physical' : 'E-Code'}
                          </span>
                        </div>
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

      {/* Tab 2: Rates & Inventory Controls */}
      {activeTab === 'rates' && (
        <div className="space-y-6">
          {rateSaveSuccess && (
            <div className="p-4 rounded-xl bg-brand-successGlow border border-brand-success/40 text-brand-success text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{rateSaveSuccess}</span>
            </div>
          )}

          <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card">
            <div className="p-6 bg-brand-surface border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-brand-text">Dynamic Rates & Catalog Controls</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Set independent buy-back rates for <strong>E-Codes</strong> and <strong>Physical Cards</strong>, customize settlement speeds, and toggle catalog visibility.
                </p>
              </div>
            </div>

            <div className="divide-y divide-brand-border/40">
              {data.brands.map((b) => {
                const isBrandEnabled = b.enabled !== false;
                const isEditingTime = editingTimeBrandId === b.id;

                return (
                  <div key={b.id} className={`p-6 flex flex-col gap-5 hover:bg-brand-surface/40 transition-colors ${!isBrandEnabled ? 'bg-brand-surface/20 opacity-75' : ''}`}>
                    
                    {/* Brand Meta Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-xl bg-brand-surface border border-brand-border">{b.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-brand-text">{b.name}</h4>
                            <span className="text-xs text-brand-muted">({b.category})</span>
                          </div>
                          
                          {/* Processing Speed Editor */}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5 text-brand-primary" />
                            {isEditingTime ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={newTimeInput}
                                  onChange={(e) => setNewTimeInput(e.target.value)}
                                  placeholder="e.g. 5-15 mins"
                                  className="text-xs bg-brand-surface border border-brand-primary rounded px-2 py-0.5 text-brand-text focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSaveVerificationTime(b.id)}
                                  className="text-[10px] bg-brand-success text-white px-2 py-0.5 rounded font-bold cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingTimeBrandId('')}
                                  className="text-[10px] text-brand-muted px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                                <span>Speed: <strong className="text-brand-text">{b.verificationTime || '5-15 mins'}</strong></span>
                                <button
                                  onClick={() => {
                                    setEditingTimeBrandId(b.id);
                                    setNewTimeInput(b.verificationTime || '5-15 mins');
                                  }}
                                  className="text-[10px] text-brand-primary hover:underline font-bold"
                                >
                                  Edit Speed
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Active/Disable Catalog Switch */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleBrand(b.id)}
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isBrandEnabled
                              ? 'bg-brand-success/15 border-brand-success/30 text-brand-success'
                              : 'bg-red-500/15 border-red-500/30 text-red-500'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{isBrandEnabled ? 'Catalog ACTIVE' : 'Catalog DISABLED'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Rates Grid for Regions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {b.countries.map((c) => {
                        const isEditing = editingBrandId === b.id && editingCountryCode === c.code;
                        const ecodeRate = c.rateEcode !== undefined ? c.rateEcode : (c.ratePercent || 70);
                        const physicalRate = c.ratePhysical !== undefined ? c.ratePhysical : (ecodeRate + 4.5);

                        return (
                          <div key={c.code} className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5">
                              <span className="font-bold text-brand-text flex items-center gap-1">
                                <span>{c.flag}</span>
                                <span>{c.name} ({c.code})</span>
                              </span>
                              {!isEditing && (
                                <button
                                  onClick={() => {
                                    setEditingBrandId(b.id);
                                    setEditingCountryCode(c.code);
                                    setNewEcodeRate(ecodeRate.toString());
                                    setNewPhysicalRate(physicalRate.toString());
                                  }}
                                  className="text-[11px] text-brand-primary hover:underline font-bold cursor-pointer"
                                >
                                  Edit Rates
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-brand-muted">E-Code:</span>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={newEcodeRate}
                                      onChange={(e) => setNewEcodeRate(e.target.value)}
                                      className="w-14 bg-brand-bg text-brand-primary font-bold px-1.5 py-0.5 rounded border border-brand-primary text-xs focus:outline-none"
                                    />
                                    <span>%</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-brand-muted">Physical:</span>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={newPhysicalRate}
                                      onChange={(e) => setNewPhysicalRate(e.target.value)}
                                      className="w-14 bg-brand-bg text-brand-success font-bold px-1.5 py-0.5 rounded border border-brand-success text-xs focus:outline-none"
                                    />
                                    <span>%</span>
                                  </div>
                                </div>

                                <div className="flex gap-1.5 pt-1">
                                  <button
                                    onClick={() => handleSaveRates(b.id, c.code)}
                                    className="flex-1 py-1 rounded bg-brand-success text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingBrandId('')}
                                    className="px-2.5 py-1 rounded bg-brand-card text-brand-muted hover:text-brand-text text-[11px] cursor-pointer border border-brand-border"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5 pt-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-brand-muted">E-Code / Digital:</span>
                                  <span className="font-mono font-bold text-brand-primary">{ecodeRate}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-brand-muted">Physical Card:</span>
                                  <span className="font-mono font-extrabold text-brand-success">{physicalRate}%</span>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live Activity & System Alerts */}
      {activeTab === 'alerts' && (
        <div className="rounded-3xl glass-panel border border-brand-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div>
              <h3 className="text-base font-bold text-brand-text">Platform Activity & Notifications Audit Log</h3>
              <p className="text-xs text-brand-muted">Real-time record of orders submitted, rate shifts, and administrative operations.</p>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/admin', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'clear_notifications' })
                });
                fetchData();
              }}
              className="px-3 py-1.5 rounded-lg border border-brand-border text-xs text-brand-muted hover:text-brand-text font-semibold cursor-pointer"
            >
              Clear Log
            </button>
          </div>

          <div className="space-y-3">
            {(!data.notifications || data.notifications.length === 0) ? (
              <div className="py-12 text-center text-brand-muted text-sm">
                No recent activity records.
              </div>
            ) : (
              data.notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-brand-bg border border-brand-border shrink-0 mt-0.5">
                    {n.type === 'RATE' ? (
                      <Zap className="w-4 h-4 text-brand-primary" />
                    ) : n.type === 'ORDER' ? (
                      <DollarSign className="w-4 h-4 text-brand-success" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-brand-text">{n.title}</span>
                      <span className="text-[11px] text-brand-muted">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
