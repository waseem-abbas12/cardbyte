'use client';

import React, { useState, useEffect } from 'react';
import { 
  OrderItem, 
  GiftCardBrand, 
  PlatformNotification, 
  PayoutMethod, 
  FaqItem, 
  LayoutSection, 
  SiteSettings 
} from '@/lib/types';
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
  Sliders,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  CreditCard,
  Building2,
  Layout,
  MessageSquare,
  Send,
  Edit2
} from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<{ 
    orders: OrderItem[]; 
    brands: GiftCardBrand[]; 
    payoutRails: PayoutMethod[];
    faqs: FaqItem[];
    layoutSections: LayoutSection[];
    siteSettings: SiteSettings;
    notifications: PlatformNotification[]; 
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'brands' | 'layout' | 'payouts' | 'faqs' | 'settings' | 'alerts'>('orders');
  
  // Rate edit state
  const [editingBrandId, setEditingBrandId] = useState<string>('');
  const [editingCountryCode, setEditingCountryCode] = useState<string>('');
  const [newEcodeRate, setNewEcodeRate] = useState<string>('');
  const [newPhysicalRate, setNewPhysicalRate] = useState<string>('');
  const [rateSaveSuccess, setRateSaveSuccess] = useState<string>('');

  // Add Brand Modal
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [brandFormName, setBrandFormName] = useState('');
  const [brandFormCategory, setBrandFormCategory] = useState<'Gaming' | 'Shopping' | 'Streaming' | 'Prepaid'>('Shopping');
  const [brandFormIcon, setBrandFormIcon] = useState('🎁');
  const [brandFormSpeed, setBrandFormSpeed] = useState('5-15 mins');
  const [brandFormBadge, setBrandFormBadge] = useState('Popular');

  // Add Country Modal
  const [selectedBrandForCountry, setSelectedBrandForCountry] = useState<string>('');
  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countryFlag, setCountryFlag] = useState('');
  const [countryCurrency, setCountryCurrency] = useState('');
  const [countryEcodeRate, setCountryEcodeRate] = useState('72');
  const [countryPhysicalRate, setCountryPhysicalRate] = useState('76');
  const [countryNominals, setCountryNominals] = useState('25, 50, 100, 200');

  // FAQ Form
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Payout Form
  const [payoutName, setPayoutName] = useState('');
  const [payoutSymbol, setPayoutSymbol] = useState('');
  const [payoutNetwork, setPayoutNetwork] = useState('');
  const [payoutIcon, setPayoutIcon] = useState('💳');
  const [payoutType, setPayoutType] = useState<'crypto' | 'fiat'>('crypto');
  const [payoutFee, setPayoutFee] = useState('0.00%');
  const [payoutMin, setPayoutMin] = useState('10');

  // Site Settings Form
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);

  // Chat message input per order
  const [orderChatInputs, setOrderChatInputs] = useState<{ [key: string]: string }>({});
  const [showCodes, setShowCodes] = useState<{ [key: string]: boolean }>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        if (json.data.siteSettings) {
          setSettingsForm(json.data.siteSettings);
        }
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

  // 1. Order Actions
  const handleUpdateStatus = async (orderId: string, status: OrderItem['status']) => {
    let rejectionReason: string | undefined = undefined;
    let txHash: string | undefined = undefined;

    if (status === 'REJECTED') {
      const reason = prompt('Enter rejection reason (e.g. Card already redeemed):', 'Card invalid or zero balance');
      if (!reason) return;
      rejectionReason = reason;
    } else if (status === 'COMPLETED') {
      const hash = prompt('Enter Payout Transaction Hash or Bank Transfer Reference ID (Optional):', '0x' + Math.random().toString(16).substring(2, 18));
      if (hash) txHash = hash;
    }

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          orderId,
          status,
          rejectionReason,
          txHash
        })
      });
      const json = await res.json();
      if (json.ok) fetchData();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleSendOrderMessage = async (orderId: string) => {
    const msg = orderChatInputs[orderId];
    if (!msg?.trim()) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_order_message',
          orderId,
          message: msg.trim()
        })
      });
      const json = await res.json();
      if (json.ok) {
        setOrderChatInputs(prev => ({ ...prev, [orderId]: '' }));
        fetchData();
      }
    } catch {
      alert('Failed to send message');
    }
  };

  // 2. Brand CRUD
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_brand',
          name: brandFormName,
          category: brandFormCategory,
          icon: brandFormIcon,
          badge: brandFormBadge,
          verificationTime: brandFormSpeed
        })
      });
      const json = await res.json();
      if (json.ok) {
        setShowAddBrandModal(false);
        setBrandFormName('');
        fetchData();
      }
    } catch {
      alert('Failed to create brand');
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this gift card brand?')) return;
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_brand', brandId })
      });
      fetchData();
    } catch {
      alert('Failed to delete brand');
    }
  };

  const handleToggleBrand = async (brandId: string) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_brand', brandId })
      });
      fetchData();
    } catch {
      alert('Failed to toggle brand status');
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
        setRateSaveSuccess(`Updated ${countryCode} rates!`);
        setTimeout(() => setRateSaveSuccess(''), 3000);
        setEditingBrandId('');
        fetchData();
      }
    } catch {
      alert('Failed to save rate');
    }
  };

  const handleAddCountryToBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandForCountry) return;

    const nominalArr = countryNominals.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_country',
          brandId: selectedBrandForCountry,
          country: {
            code: countryCode.toUpperCase().trim(),
            name: countryName.trim(),
            flag: countryFlag.trim(),
            currency: countryCurrency.toUpperCase().trim(),
            ratePercent: parseFloat(countryEcodeRate),
            rateEcode: parseFloat(countryEcodeRate),
            ratePhysical: parseFloat(countryPhysicalRate),
            nominals: nominalArr.length ? nominalArr : [25, 50, 100]
          }
        })
      });
      const json = await res.json();
      if (json.ok) {
        setSelectedBrandForCountry('');
        fetchData();
      }
    } catch {
      alert('Failed to add region');
    }
  };

  // 3. Layout Reorder
  const handleMoveSection = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!data?.layoutSections) return;
    const current = [...data.layoutSections];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_layout', sections: current })
      });
      const json = await res.json();
      if (json.ok) fetchData();
    } catch {
      alert('Failed to update section order');
    }
  };

  const handleToggleSection = async (index: number) => {
    if (!data?.layoutSections) return;
    const current = [...data.layoutSections];
    current[index].enabled = !current[index].enabled;

    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_layout', sections: current })
      });
      fetchData();
    } catch {
      alert('Failed to toggle section');
    }
  };

  // 4. Payout Rails CRUD
  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payout',
          rail: {
            id: payoutName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: payoutName,
            symbol: payoutSymbol || payoutName,
            network: payoutNetwork,
            icon: payoutIcon,
            type: payoutType,
            fee: payoutFee,
            minPayout: parseFloat(payoutMin) || 10,
            enabled: true
          }
        })
      });
      setPayoutName('');
      fetchData();
    } catch {
      alert('Failed to add payout rail');
    }
  };

  const handleDeletePayout = async (id: string) => {
    if (!confirm('Delete payout rail?')) return;
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_payout', id })
      });
      fetchData();
    } catch {
      alert('Failed to delete payout rail');
    }
  };

  // 5. FAQ CRUD
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_faq', question: newFaqQ, answer: newFaqA })
      });
      setNewFaqQ('');
      setNewFaqA('');
      fetchData();
    } catch {
      alert('Failed to add FAQ');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_faq', id })
      });
      fetchData();
    } catch {
      alert('Failed to delete FAQ');
    }
  };

  // 6. Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_settings', settings: settingsForm })
      });
      const json = await res.json();
      if (json.ok) {
        alert('Settings saved successfully!');
        fetchData();
      }
    } catch {
      alert('Failed to save settings');
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
            Cardbyte Headless CMS & Operations Desk
          </div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Complete Backend Control Center</h1>
          <p className="text-sm text-brand-muted mt-1">
            Rebuild pages, reposition layout sections, manage brands, payout rails, FAQs, and release trade payouts.
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-panel border border-brand-border shadow-card">
          <span className="text-xs text-brand-muted block font-semibold">Total Orders</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-brand-text mt-1 block">{data.orders.length}</span>
          <span className="text-xs text-brand-success mt-1 block font-medium">Vol: ${totalVolume.toFixed(2)}</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 shadow-card">
          <span className="text-xs text-amber-500 block font-semibold">Pending Verification</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-amber-500 mt-1 block">{pendingCount}</span>
          <span className="text-xs text-brand-muted mt-1 block">Awaiting check</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-brand-success/30 bg-brand-success/5 shadow-card">
          <span className="text-xs text-brand-success block font-semibold">Completed Trades</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-brand-success mt-1 block">{completedCount}</span>
          <span className="text-xs text-brand-muted mt-1 block">Payouts released</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-blue-500/30 bg-blue-500/5 shadow-card">
          <span className="text-xs text-blue-500 block font-semibold">Catalog Inventory</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-blue-500 mt-1 block">
            {data.brands.filter(b => b.enabled !== false).length} / {data.brands.length}
          </span>
          <span className="text-xs text-brand-muted mt-1 block">Active cards</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border mb-8 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'orders' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Orders Desk ({data.orders.length})
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'brands' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Brands & Rates CMS ({data.brands.length})
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'layout' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Homepage Sections Order</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'payouts' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payout Rails ({data.payoutRails?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'faqs' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FAQs CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Site Settings & Copy</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'alerts' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-brand-primary" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ORDERS DESK */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
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
                      <React.Fragment key={o.id}>
                        <tr className="hover:bg-brand-surface/70 transition-colors">
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
                            {o.receiptNote && (
                              <span className="text-[11px] text-brand-muted block mt-1">Note: {o.receiptNote}</span>
                            )}
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
                                title="Mark as paid with TxHash"
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
                                onClick={() => handleUpdateStatus(o.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Order Inline Chat / Support Row */}
                        <tr className="bg-brand-surface/30">
                          <td colSpan={7} className="px-5 py-3 border-b border-brand-border/40">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
                                <span className="font-semibold text-brand-text">Order Chat History:</span>
                                <span className="text-brand-muted">
                                  {o.messages?.length || 0} messages exchanged with client
                                </span>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  placeholder="Reply directly to customer..."
                                  value={orderChatInputs[o.id] || ''}
                                  onChange={(e) => setOrderChatInputs({ ...orderChatInputs, [o.id]: e.target.value })}
                                  className="flex-1 sm:w-64 bg-brand-bg border border-brand-border rounded-lg px-2.5 py-1 text-xs text-brand-text focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSendOrderMessage(o.id)}
                                  className="px-2.5 py-1 rounded-lg bg-brand-primary text-white text-xs font-bold cursor-pointer"
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BRANDS & RATES CMS */}
      {/* ======================================================== */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-brand-text">Gift Card Brands & Pricing Catalog</h3>
              <p className="text-xs text-brand-muted">Add brands, configure regional nominals, and adjust E-Code & Physical rates.</p>
            </div>
            <button
              onClick={() => setShowAddBrandModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Brand</span>
            </button>
          </div>

          {rateSaveSuccess && (
            <div className="p-3.5 rounded-xl bg-brand-successGlow border border-brand-success/40 text-brand-success text-xs font-bold">
              {rateSaveSuccess}
            </div>
          )}

          {/* Add Brand Modal Form */}
          {showAddBrandModal && (
            <div className="p-6 rounded-3xl glass-panel border border-brand-primary/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="font-bold text-sm text-brand-text">Create New Gift Card Asset</span>
                <button onClick={() => setShowAddBrandModal(false)} className="text-xs text-brand-muted hover:text-brand-text">✕</button>
              </div>

              <form onSubmit={handleCreateBrand} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sephora, Nike, Best Buy"
                    value={brandFormName}
                    onChange={(e) => setBrandFormName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Category</label>
                  <select
                    value={brandFormCategory}
                    onChange={(e) => setBrandFormCategory(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  >
                    <option value="Shopping">Shopping</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Streaming">Streaming</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Emoji / Icon</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🛍️ or 👟"
                    value={brandFormIcon}
                    onChange={(e) => setBrandFormIcon(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Verification Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 5-15 mins"
                    value={brandFormSpeed}
                    onChange={(e) => setBrandFormSpeed(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Hot, Instant, Popular"
                    value={brandFormBadge}
                    onChange={(e) => setBrandFormBadge(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-bold cursor-pointer"
                  >
                    Save & Create Brand
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Country Form Modal */}
          {selectedBrandForCountry && (
            <div className="p-6 rounded-3xl glass-panel border border-brand-primary/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="font-bold text-sm text-brand-text">
                  Add Country Region to {data.brands.find(b => b.id === selectedBrandForCountry)?.name}
                </span>
                <button onClick={() => setSelectedBrandForCountry('')} className="text-xs text-brand-muted">✕</button>
              </div>

              <form onSubmit={handleAddCountryToBrand} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Country Code</label>
                  <input
                    type="text"
                    required
                    placeholder="US, UK, CA, EU"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Country Name</label>
                  <input
                    type="text"
                    required
                    placeholder="United States"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Flag Emoji</label>
                  <input
                    type="text"
                    required
                    placeholder="🇺🇸"
                    value={countryFlag}
                    onChange={(e) => setCountryFlag(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Currency Code</label>
                  <input
                    type="text"
                    required
                    placeholder="USD, GBP, EUR"
                    value={countryCurrency}
                    onChange={(e) => setCountryCurrency(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">E-Code Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={countryEcodeRate}
                    onChange={(e) => setCountryEcodeRate(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Physical Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={countryPhysicalRate}
                    onChange={(e) => setCountryPhysicalRate(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-brand-muted mb-1 font-semibold">Nominals (comma separated)</label>
                  <input
                    type="text"
                    value={countryNominals}
                    onChange={(e) => setCountryNominals(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div className="col-span-2 sm:col-span-4 pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-brand-primary text-white font-bold cursor-pointer"
                  >
                    Add Region to Catalog
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Brands List */}
          <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card divide-y divide-brand-border/40">
            {data.brands.map((b) => {
              const isBrandEnabled = b.enabled !== false;
              return (
                <div key={b.id} className={`p-6 flex flex-col gap-4 ${!isBrandEnabled ? 'opacity-60 bg-brand-surface/20' : ''}`}>
                  
                  {/* Brand Row Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-brand-surface border border-brand-border">{b.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-brand-text">{b.name}</h4>
                          <span className="text-xs text-brand-muted">({b.category}) • Speed: {b.verificationTime}</span>
                        </div>
                        <span className="text-xs text-brand-muted">ID: {b.id} • Regions: {b.countries.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBrandForCountry(b.id)}
                        className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-xs font-semibold text-brand-text cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Country</span>
                      </button>

                      <button
                        onClick={() => handleToggleBrand(b.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isBrandEnabled
                            ? 'bg-brand-success/15 border-brand-success/30 text-brand-success'
                            : 'bg-red-500/15 border-red-500/30 text-red-500'
                        }`}
                      >
                        {isBrandEnabled ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleDeleteBrand(b.id)}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/15 cursor-pointer"
                        title="Delete Brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Countries Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {b.countries.map((c) => {
                      const isEditing = editingBrandId === b.id && editingCountryCode === c.code;
                      const ecode = c.rateEcode !== undefined ? c.rateEcode : (c.ratePercent || 70);
                      const physical = c.ratePhysical !== undefined ? c.ratePhysical : (ecode + 4.5);

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
                                  setNewEcodeRate(ecode.toString());
                                  setNewPhysicalRate(physical.toString());
                                }}
                                className="text-[11px] text-brand-primary hover:underline font-bold cursor-pointer"
                              >
                                Edit Rates
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-brand-muted">E-Code %:</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={newEcodeRate}
                                  onChange={(e) => setNewEcodeRate(e.target.value)}
                                  className="w-14 bg-brand-bg text-brand-primary font-bold px-1.5 py-0.5 rounded border border-brand-primary text-xs"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-brand-muted">Physical %:</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={newPhysicalRate}
                                  onChange={(e) => setNewPhysicalRate(e.target.value)}
                                  className="w-14 bg-brand-bg text-brand-success font-bold px-1.5 py-0.5 rounded border border-brand-success text-xs"
                                />
                              </div>
                              <div className="flex gap-1 pt-1">
                                <button
                                  onClick={() => handleSaveRates(b.id, c.code)}
                                  className="flex-1 py-1 rounded bg-brand-success text-white font-bold text-[11px] cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingBrandId('')}
                                  className="px-2 py-1 rounded border border-brand-border text-brand-muted text-[11px] cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 pt-0.5">
                              <div className="flex justify-between">
                                <span className="text-brand-muted">E-Code:</span>
                                <span className="font-mono font-bold text-brand-primary">{ecode}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brand-muted">Physical:</span>
                                <span className="font-mono font-extrabold text-brand-success">{physical}%</span>
                              </div>
                              <div className="text-[10px] text-brand-muted pt-1 truncate">
                                Nominals: {c.nominals.map(n => `$${n}`).join(', ')}
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
      )}

      {/* ======================================================== */}
      {/* TAB 3: HOMEPAGE SECTIONS & REORDERING CMS */}
      {/* ======================================================== */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-brand-text">Homepage Layout Order & Section Visibility</h3>
            <p className="text-xs text-brand-muted">
              Reorder or hide sections on the homepage. Changes immediately reflect in real-time.
            </p>
          </div>

          <div className="space-y-3">
            {data.layoutSections.map((sec, idx) => (
              <div 
                key={sec.id} 
                className={`p-4 rounded-2xl glass-panel border border-brand-border shadow-sm flex items-center justify-between gap-4 transition-all ${
                  !sec.enabled ? 'opacity-50 bg-brand-surface/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-brand-text">{sec.name}</h4>
                    <p className="text-xs text-brand-muted">{sec.description || `Section ID: ${sec.id}`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, 'UP')}
                    className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    disabled={idx === data.layoutSections.length - 1}
                    onClick={() => handleMoveSection(idx, 'DOWN')}
                    className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleSection(idx)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      sec.enabled
                        ? 'bg-brand-success/15 border-brand-success/30 text-brand-success'
                        : 'bg-red-500/15 border-red-500/30 text-red-500'
                    }`}
                  >
                    {sec.enabled ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PAYOUT RAILS CMS */}
      {/* ======================================================== */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-brand-border shadow-card space-y-4">
            <h3 className="text-sm font-bold text-brand-text">Add New Payout Settlement Rail</h3>
            <form onSubmit={handleCreatePayout} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-brand-muted mb-1">Method Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tron USDT, PayPal"
                  value={payoutName}
                  onChange={(e) => setPayoutName(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1">Symbol / Unit</label>
                <input
                  type="text"
                  placeholder="e.g. USDT, BTC, USD"
                  value={payoutSymbol}
                  onChange={(e) => setPayoutSymbol(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1">Network / Bank Type</label>
                <input
                  type="text"
                  placeholder="e.g. TRC20, Wire, Polygon"
                  value={payoutNetwork}
                  onChange={(e) => setPayoutNetwork(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1">Fee %</label>
                <input
                  type="text"
                  placeholder="0.00%"
                  value={payoutFee}
                  onChange={(e) => setPayoutFee(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                />
              </div>

              <div className="col-span-2 sm:col-span-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold cursor-pointer"
                >
                  Save Payout Rail
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.payoutRails?.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl glass-panel border border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-brand-text">{p.name}</h4>
                    <span className="text-xs text-brand-muted">{p.network || p.type} • Fee: {p.fee} (Min: ${p.minPayout})</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePayout(p.id)}
                  className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FAQS CMS */}
      {/* ======================================================== */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-brand-border shadow-card space-y-4">
            <h3 className="text-sm font-bold text-brand-text">Add FAQ Item</h3>
            <form onSubmit={handleCreateFaq} className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-muted mb-1 font-semibold">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does escrow guarantee my trade?"
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1 font-semibold">Answer</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain clearly to customer..."
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold cursor-pointer"
              >
                Save FAQ
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {data.faqs?.map((f) => (
              <div key={f.id} className="p-5 rounded-2xl glass-panel border border-brand-border space-y-1.5 flex items-start justify-between">
                <div className="space-y-1 max-w-xl">
                  <h4 className="text-sm font-bold text-brand-text">{f.question}</h4>
                  <p className="text-xs text-brand-muted">{f.answer}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(f.id)}
                  className="p-1 text-red-500 hover:text-red-700 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SITE SETTINGS & BRANDING CMS */}
      {/* ======================================================== */}
      {activeTab === 'settings' && settingsForm && (
        <form onSubmit={handleSaveSettings} className="rounded-3xl glass-panel border border-brand-border p-7 shadow-card space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-brand-text">Global Platform Branding & Performance Metrics</h3>
            <p className="text-xs text-brand-muted mt-0.5">Control the public text, copy, support links, and proof stats across the entire website.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-brand-muted mb-1">Site Title</label>
              <input
                type="text"
                value={settingsForm.siteName}
                onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Tagline</label>
              <input
                type="text"
                value={settingsForm.tagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-brand-muted mb-1">Hero Main Title</label>
              <input
                type="text"
                value={settingsForm.heroTitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-brand-muted mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={settingsForm.heroSubtitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-brand-muted mb-1">Announcement Ticker Banner</label>
              <input
                type="text"
                value={settingsForm.announcementTicker}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementTicker: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Active Traders Metric</label>
              <input
                type="text"
                value={settingsForm.activeTradersCount}
                onChange={(e) => setSettingsForm({ ...settingsForm, activeTradersCount: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Volume Traded Metric</label>
              <input
                type="text"
                value={settingsForm.volumeTraded}
                onChange={(e) => setSettingsForm({ ...settingsForm, volumeTraded: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Average Payout Time Metric</label>
              <input
                type="text"
                value={settingsForm.avgPayoutTime}
                onChange={(e) => setSettingsForm({ ...settingsForm, avgPayoutTime: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Telegram Support Channel</label>
              <input
                type="text"
                value={settingsForm.telegramSupport}
                onChange={(e) => setSettingsForm({ ...settingsForm, telegramSupport: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-brand-primary text-white font-extrabold text-sm shadow-md cursor-pointer"
          >
            Save All Settings
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 7: AUDIT LOG */}
      {/* ======================================================== */}
      {activeTab === 'alerts' && (
        <div className="rounded-3xl glass-panel border border-brand-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <h3 className="text-sm font-bold text-brand-text">Platform Activity & Audit History</h3>
            <button
              onClick={async () => {
                await fetch('/api/admin', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'clear_notifications' })
                });
                fetchData();
              }}
              className="text-xs text-brand-muted hover:text-brand-text border border-brand-border px-3 py-1 rounded-lg"
            >
              Clear Log
            </button>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {data.notifications?.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-brand-surface border border-brand-border flex items-start gap-3 text-xs">
                <div className="p-1.5 rounded-lg bg-brand-bg border border-brand-border mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between font-bold text-brand-text">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-brand-muted">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-brand-muted mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
