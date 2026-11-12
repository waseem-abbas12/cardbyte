'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Wallet, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  CreditCard, 
  Building2, 
  Coins, 
  Smartphone, 
  Lock, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { SUPPORTED_PAYOUTS, UserWalletConfig } from '@/lib/ratesData';

function WalletPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToSell = searchParams.get('redirect') === 'sell';

  const [selectedRail, setSelectedRail] = useState<string>('usdt_trc20');
  
  // Wallet fields
  const [usdtTrc20, setUsdtTrc20] = useState('');
  const [usdtBep20, setUsdtBep20] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [solAddress, setSolAddress] = useState('');
  
  // Bank fields
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingOrIban, setRoutingOrIban] = useState('');

  // MoMo fields
  const [momoProvider, setMomoProvider] = useState('MTN Mobile Money');
  const [momoPhone, setMomoPhone] = useState('');

  const [isConfigured, setIsConfigured] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardbyte_user_wallet');
      if (saved) {
        const parsed: UserWalletConfig = JSON.parse(saved);
        setSelectedRail(parsed.defaultRail || 'usdt_trc20');
        if (parsed.usdtTrc20) setUsdtTrc20(parsed.usdtTrc20);
        if (parsed.usdtBep20) setUsdtBep20(parsed.usdtBep20);
        if (parsed.btcAddress) setBtcAddress(parsed.btcAddress);
        if (parsed.solAddress) setSolAddress(parsed.solAddress);
        if (parsed.bankDetails) {
          setBankName(parsed.bankDetails.bankName || '');
          setAccountName(parsed.bankDetails.accountName || '');
          setAccountNumber(parsed.bankDetails.accountNumber || '');
          setRoutingOrIban(parsed.bankDetails.routingOrIban || '');
        }
        if (parsed.momoDetails) {
          setMomoProvider(parsed.momoDetails.provider || 'MTN Mobile Money');
          setMomoPhone(parsed.momoDetails.phone || '');
        }
        setIsConfigured(Boolean(parsed.isConfigured));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation based on rail
    let primaryAddress = '';
    if (selectedRail === 'usdt_trc20') {
      if (!usdtTrc20.trim()) {
        setValidationError('Please enter your TRC20 USDT wallet address.');
        return;
      }
      primaryAddress = usdtTrc20.trim();
    } else if (selectedRail === 'usdt_bep20') {
      if (!usdtBep20.trim()) {
        setValidationError('Please enter your BEP20 USDT wallet address.');
        return;
      }
      primaryAddress = usdtBep20.trim();
    } else if (selectedRail === 'btc') {
      if (!btcAddress.trim()) {
        setValidationError('Please enter your Bitcoin (BTC) address.');
        return;
      }
      primaryAddress = btcAddress.trim();
    } else if (selectedRail === 'sol') {
      if (!solAddress.trim()) {
        setValidationError('Please enter your Solana (SOL) address.');
        return;
      }
      primaryAddress = solAddress.trim();
    } else if (selectedRail === 'usd_wire' || selectedRail === 'eur_sepa' || selectedRail === 'ngn_bank') {
      if (!accountName.trim() || !accountNumber.trim() || !bankName.trim()) {
        setValidationError('Please enter your complete bank account name, number, and bank title.');
        return;
      }
      primaryAddress = `${bankName.trim()} - ${accountNumber.trim()} (${accountName.trim()})`;
    } else if (selectedRail === 'ghs_momo') {
      if (!momoPhone.trim()) {
        setValidationError('Please enter your Mobile Money phone number.');
        return;
      }
      primaryAddress = `${momoProvider}: ${momoPhone.trim()}`;
    }

    const walletData: UserWalletConfig = {
      defaultRail: selectedRail,
      usdtTrc20: usdtTrc20.trim(),
      usdtBep20: usdtBep20.trim(),
      btcAddress: btcAddress.trim(),
      solAddress: solAddress.trim(),
      bankDetails: {
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        routingOrIban: routingOrIban.trim()
      },
      momoDetails: {
        provider: momoProvider,
        phone: momoPhone.trim()
      },
      isConfigured: true,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('cardbyte_user_wallet', JSON.stringify(walletData));
    localStorage.setItem('cardbyte_active_payout_address', primaryAddress);
    setIsConfigured(true);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      if (returnToSell) {
        router.push('/sell');
      }
    }, 1500);
  };

  const activePayout = SUPPORTED_PAYOUTS.find(p => p.id === selectedRail) || SUPPORTED_PAYOUTS[0];

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Alert Header if redirected from sell order */}
      {returnToSell && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold block">Mandatory Payout Setup Required</span>
            To safeguard your trading funds, Cardbyte requires you to configure and verify your payout destination address before submitting your gift card.
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-brand-border gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5" />
            Payout Destination Manager
          </div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">
            User Wallet & Escrow Settings
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Configure your guaranteed payout addresses. Funds from cleared gift cards are released automatically here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-successGlow text-brand-success text-xs font-bold border border-brand-success/30">
              <CheckCircle2 className="w-4 h-4" />
              Verified Payout Rails Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
              <AlertCircle className="w-4 h-4" />
              Not Configured
            </span>
          )}
        </div>
      </div>

      {/* Escrow Balance & Protection Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl glass-panel border border-brand-border shadow-card">
          <span className="text-xs text-brand-muted block font-semibold">Available Settlement Balance</span>
          <span className="text-3xl font-mono font-black text-brand-text mt-1 block">$0.00 USD</span>
          <span className="text-xs text-brand-muted mt-1 block">Instant withdrawal on demand</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-brand-primary/30 bg-brand-primary/5 shadow-card">
          <span className="text-xs text-brand-primary block font-semibold">Active Escrow Protection</span>
          <span className="text-3xl font-mono font-black text-brand-primary mt-1 block">100% Locked</span>
          <span className="text-xs text-brand-muted mt-1 block">Guaranteed live quotes</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-brand-success/30 bg-brand-success/5 shadow-card">
          <span className="text-xs text-brand-success block font-semibold">Security Protocol</span>
          <span className="text-3xl font-mono font-black text-brand-success mt-1 block">256-Bit SSL</span>
          <span className="text-xs text-brand-muted mt-1 block">PCI-DSS AML compliant</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl glass-panel p-6 sm:p-9 border border-brand-border shadow-card">
        
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-brand-successGlow border border-brand-success/40 text-brand-success text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Wallet details saved successfully! Your destination is locked for trades.</span>
          </div>
        )}

        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSaveWallet} className="space-y-6">
          
          {/* Step 1: Select Rail */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
              Primary Payout Rail
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPORTED_PAYOUTS.map((p) => {
                const isSelected = selectedRail === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedRail(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/10 shadow-sm'
                        : 'border-brand-border bg-brand-surface hover:bg-brand-cardHover'
                    }`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <div className="overflow-hidden">
                      <span className="font-bold text-xs sm:text-sm text-brand-text block truncate">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-brand-muted block">
                        {p.network ? p.network : p.type} • Fee: {p.fee}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Input Based on Selected Rail */}
          <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-text uppercase tracking-wider">
                {activePayout.name} ({activePayout.network || activePayout.symbol}) Account Details
              </span>
              <span className="text-[11px] text-brand-muted">
                Minimum Payout: ${activePayout.minPayout} USD
              </span>
            </div>

            {/* TRC20 */}
            {selectedRail === 'usdt_trc20' && (
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5">
                  USDT TRC20 Wallet Address <span className="text-brand-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXyZ1234567890ABCDEFGHIJKLM..."
                  value={usdtTrc20}
                  onChange={(e) => setUsdtTrc20(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-brand-primary"
                />
                <p className="text-[11px] text-brand-muted mt-1">
                  Ensure this is a TRON (TRC20) network address. Funds sent to other chains may be lost permanently.
                </p>
              </div>
            )}

            {/* BEP20 */}
            {selectedRail === 'usdt_bep20' && (
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5">
                  USDT BEP20 (BNB Chain) Address <span className="text-brand-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0x71C...3921"
                  value={usdtBep20}
                  onChange={(e) => setUsdtBep20(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-brand-primary"
                />
              </div>
            )}

            {/* Bitcoin */}
            {selectedRail === 'btc' && (
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5">
                  Bitcoin (BTC) Wallet Address <span className="text-brand-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bc1q... or 1A1zP1..."
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-brand-primary"
                />
              </div>
            )}

            {/* Solana */}
            {selectedRail === 'sol' && (
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5">
                  Solana (SOL) Wallet Address <span className="text-brand-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7xKX...29kL"
                  value={solAddress}
                  onChange={(e) => setSolAddress(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-brand-primary"
                />
              </div>
            )}

            {/* Bank Transfers */}
            {(selectedRail === 'usd_wire' || selectedRail === 'eur_sepa' || selectedRail === 'ngn_bank') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1">
                    Bank Name <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chase Bank, Barclays, Access Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1">
                    Account Holder Full Name <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1">
                    Account Number / IBAN <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0123456789 or GB29 X..."
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1">
                    Routing Number / SWIFT / BIC (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 021000021 or CHASUS33"
                    value={routingOrIban}
                    onChange={(e) => setRoutingOrIban(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            )}

            {/* Mobile Money */}
            {selectedRail === 'ghs_momo' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1">
                    MoMo Provider <span className="text-brand-primary">*</span>
                  </label>
                  <select
                    value={momoProvider}
                    onChange={(e) => setMomoProvider(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Telecel Cash (Vodafone)">Telecel Cash (Vodafone)</option>
                    <option value="AT Money (AirtelTigo)">AT Money (AirtelTigo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1">
                    Registered Mobile Number <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +233 24 000 0000"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            )}

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Save & Verify Payout Destination</span>
            </button>

            {isConfigured && (
              <Link
                href="/sell"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-success hover:bg-emerald-600 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Sell Gift Card</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

        </form>

      </div>

    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-brand-muted">Loading wallet manager...</div>}>
      <WalletPageContent />
    </Suspense>
  );
}
