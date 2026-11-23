'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Wallet, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  QrCode
} from 'lucide-react';
import { ReferralRecord } from '@/lib/types';

export default function ReferralsPage() {
  const [refCode, setRefCode] = useState<string>('CB-REF-7997');
  const [copied, setCopied] = useState<boolean>(false);
  const [referralData, setReferralData] = useState<ReferralRecord>({
    code: 'CB-REF-7997',
    userIdentifier: 'Trader',
    totalReferred: 0,
    totalVolumeUsd: 0,
    commissionRate: 0.0025,
    earnedUsd: 0,
    paidUsd: 0,
    pendingUsd: 0,
    createdAt: new Date().toISOString()
  });

  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [origin, setOrigin] = useState<string>('https://cardbyte-phi.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      
      // Load user referral code or generate a persistent one
      let storedCode = localStorage.getItem('cardbyte_user_referral_code');
      if (!storedCode) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        storedCode = `CB-REF-${rand}`;
        localStorage.setItem('cardbyte_user_referral_code', storedCode);
      }
      setRefCode(storedCode);

      // Fetch live stats from API
      fetch(`/api/referrals?code=${storedCode}`)
        .then(res => res.json())
        .then(json => {
          if (json?.data?.referral) {
            setReferralData(json.data.referral);
          }
        })
        .catch(() => {});

      // Prefill wallet address if saved
      try {
        const storedWallet = localStorage.getItem('cardbyte_user_wallet');
        if (storedWallet) {
          const parsed = JSON.parse(storedWallet);
          if (parsed.usdtTrc20) setWithdrawAddress(parsed.usdtTrc20);
        }
      } catch {}
    }
  }, []);

  const referralUrl = `${origin}/sell?r=${refCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount) || referralData.pendingUsd;
    if (amount <= 0 || amount > referralData.pendingUsd) {
      setWithdrawError(`Please enter a valid amount up to $${referralData.pendingUsd.toFixed(2)}.`);
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawError('Please enter a destination USDT TRC20 or crypto payout address.');
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError('');
    setWithdrawSuccess('');

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          code: refCode,
          amount,
          payoutAddress: withdrawAddress.trim()
        })
      });
      const data = await res.json();
      if (data.ok) {
        setWithdrawSuccess(`Successfully claimed $${amount.toFixed(2)} to ${withdrawAddress.slice(0, 8)}... Pending moderator release.`);
        setReferralData(data.data.referral);
        setWithdrawAmount('');
      } else {
        setWithdrawError(data.error || 'Failed to process claim.');
      }
    } catch {
      setWithdrawError('Network error while processing withdrawal.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent(`Sell your gift cards and game keys for instant crypto at top rates on Cardbyte: ${referralUrl}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${text}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Hey, check out Cardbyte to trade gift cards and game keys for USDT: ${referralUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-brand-success text-xs font-bold tracking-wide uppercase mb-3">
          <Gift className="w-3.5 h-3.5" />
          Affiliate & Partner Program
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-brand-text tracking-tight">
          Earn <span className="text-brand-success font-mono">0.25%</span> on Every Referred Trade
        </h1>
        <p className="text-sm sm:text-base text-brand-muted mt-2 max-w-xl mx-auto">
          Share your personal referral link with vendors, gamers, or friends. Earn instant, passive crypto commissions on every verified trade forever.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-6 rounded-3xl glass-panel border border-brand-border">
          <div className="flex items-center justify-between text-xs text-brand-muted mb-2">
            <span>Total Referrals</span>
            <Users className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-3xl font-black text-brand-text font-mono">
            {referralData.totalReferred}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Traders onboarded</div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-brand-border">
          <div className="flex items-center justify-between text-xs text-brand-muted mb-2">
            <span>Referred Volume</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-brand-text font-mono">
            ${referralData.totalVolumeUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Total traded turnover</div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-brand-border">
          <div className="flex items-center justify-between text-xs text-brand-muted mb-2">
            <span>Total Commission</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            ${referralData.earnedUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">At 0.25% fixed tier</div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-brand-primary/40 bg-brand-primary/5">
          <div className="flex items-center justify-between text-xs text-brand-primary mb-2 font-bold">
            <span>Available to Claim</span>
            <Wallet className="w-4 h-4 text-brand-success" />
          </div>
          <div className="text-3xl font-black text-brand-success font-mono">
            ${referralData.pendingUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Zero minimum payout</div>
        </div>
      </div>

      {/* Main Grid: Referral Link Card & Claim Payout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Left Column: Link Generator & Sharing (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-7 rounded-3xl glass-panel border border-brand-border space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-brand-text">Your Personal Referral Link</h3>
                <p className="text-xs text-brand-muted mt-0.5">Anyone who trades using this link gets attributed to your account automatically.</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {refCode}
              </span>
            </div>

            {/* Input & Copy */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text">Direct Affiliate URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-brand-text select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Social Sharing Quick Buttons */}
            <div>
              <label className="text-xs font-bold text-brand-text block mb-2">Instant Social Share</label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={shareViaTelegram}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-xs font-bold text-[#0088cc] transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Share on Telegram</span>
                </button>
                <button
                  onClick={shareViaWhatsApp}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-xs font-bold text-[#25D366] transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Code Attribution Note */}
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border text-xs text-brand-muted space-y-1">
              <span className="font-bold text-brand-text block">Persistent 30-Day Attribution Cookie:</span>
              <p className="leading-relaxed">
                When a seller opens your link, their browser remembers your code even if they browse other pages or return days later to finish trading.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Claim Earnings (5 cols) */}
        <div className="lg:col-span-5">
          <div className="p-7 rounded-3xl glass-panel border border-brand-border space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-brand-text">Withdraw Referral Earnings</h3>
              <p className="text-xs text-brand-muted mt-0.5">Request payout to any USDT or Crypto wallet address.</p>
            </div>

            {withdrawSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-brand-success font-semibold">
                ✓ {withdrawSuccess}
              </div>
            )}

            {withdrawError && (
              <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-500 font-semibold">
                ✕ {withdrawError}
              </div>
            )}

            <form onSubmit={handleClaimWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-text block mb-1.5">
                  Available Balance
                </label>
                <div className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 font-mono font-black text-xl text-brand-success flex items-center justify-between">
                  <span>${referralData.pendingUsd.toFixed(2)} USD</span>
                  <span className="text-xs font-sans font-bold text-brand-muted">USDT Equivalent</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-text block mb-1.5">
                  Payout Destination Address (USDT TRC20 / BEP20)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TJYe5gWq94k7vY2k4XvYP39z..."
                  value={withdrawAddress}
                  onChange={e => setWithdrawAddress(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brand-text block mb-1.5">
                  Withdrawal Amount ($ USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder={referralData.pendingUsd > 0 ? referralData.pendingUsd.toString() : '0.00'}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl pl-3.5 pr-14 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(referralData.pendingUsd.toString())}
                    className="absolute right-2 top-2 px-2 py-1 rounded-lg bg-brand-surface border border-brand-border text-[10px] font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isWithdrawing || referralData.pendingUsd <= 0}
                className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isWithdrawing ? 'Broadcasting Claim...' : 'Claim Commission Payout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* 3-Step Guide */}
      <div className="border-t border-brand-border pt-14">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-brand-primary tracking-widest uppercase px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
            HOW THE AFFILIATE SYSTEM WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight mt-3">
            3 Simple Steps to Passive Earnings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/15 text-brand-primary font-black text-lg flex items-center justify-center font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-brand-text">Share Your Link</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Copy your unique link or referral code and share it across Discord, Telegram channels, WhatsApp groups, or direct messages.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/15 text-brand-primary font-black text-lg flex items-center justify-center font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-brand-text">They Sell Cards or Keys</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              When a referred seller converts an Apple card, Steam wallet, or game key on Cardbyte, our matching engine flags your referral attribution.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/15 text-brand-primary font-black text-lg flex items-center justify-center font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-brand-text">Instant 0.25% Cashout</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Your 0.25% commission is automatically credited to your affiliate balance upon trade completion and ready for instant withdrawal.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
