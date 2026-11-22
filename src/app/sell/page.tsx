'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import RatesCalculator from '@/components/RatesCalculator';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Lock, 
  FileText, 
  AlertCircle,
  Wallet,
  ExternalLink,
  X
} from 'lucide-react';
import { UserWalletConfig } from '@/lib/ratesData';

function SellPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get('brand') || 'apple';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tradeData, setTradeData] = useState<any>(null);

  // User wallet state
  const [savedWallet, setSavedWallet] = useState<UserWalletConfig | null>(null);

  // Step 2 Form State
  const [cardCodes, setCardCodes] = useState<string>('');
  const [cardPin, setCardPin] = useState<string>('');
  const [receiptNote, setReceiptNote] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB limit. Please choose a smaller image.');
        return;
      }
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReceiptBase64(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReceiptFileName('');
    setReceiptBase64('');
  };

  // Step 3 Form State
  const [payoutAddress, setPayoutAddress] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Load user wallet from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cardbyte_user_wallet');
      if (stored) {
        const parsed: UserWalletConfig = JSON.parse(stored);
        setSavedWallet(parsed);
        const active = localStorage.getItem('cardbyte_active_payout_address');
        if (active) {
          setPayoutAddress(active);
        } else if (parsed.usdtTrc20) {
          setPayoutAddress(parsed.usdtTrc20);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleProceedFromCalc = (data: any) => {
    setTradeData(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardCodes.trim()) {
      alert('Please enter at least one gift card code.');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAddress.trim()) {
      setSubmitError('Mandatory requirement: Please enter or configure your payout destination wallet address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const codeList = cardCodes
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const payload = {
        brandId: tradeData.brandId,
        brandName: tradeData.brandName,
        countryCode: tradeData.countryCode,
        cardType: tradeData.cardType,
        nominal: tradeData.nominal,
        quantity: tradeData.quantity,
        ratePercent: tradeData.ratePercent,
        totalCardValue: tradeData.totalFaceValue,
        payoutAmount: tradeData.totalPayoutUsd,
        payoutCurrency: tradeData.payoutName,
        payoutAddress: payoutAddress.trim(),
        cardCodes: codeList,
        cardPin: cardPin.trim(),
        receiptNote: receiptNote.trim(),
        receiptImages: receiptBase64 ? [receiptBase64] : (receiptFileName ? [receiptFileName] : [])
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Failed to submit order');
      }

      setConfirmedOrder(json.data.order);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while creating your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="py-16 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl glass-panel p-8 border border-brand-success/40 text-center space-y-6 shadow-card">
          <div className="w-16 h-16 rounded-full bg-brand-successGlow border border-brand-success/40 text-brand-success flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>

          <div>
            <span className="text-xs font-bold text-brand-success uppercase tracking-widest px-3 py-1 rounded-full bg-brand-success/15 border border-brand-success/30">
              Order Placed Successfully
            </span>
            <h1 className="text-3xl font-extrabold text-brand-text mt-3">
              Order Received #{confirmedOrder.trackingCode}
            </h1>
            <p className="text-sm text-brand-muted mt-2">
              Our automated desk is verifying your card balance. Your payout of ${confirmedOrder.payoutAmount.toFixed(2)} will be dispatched to your destination shortly.
            </p>
          </div>

          <div className="rounded-2xl bg-brand-surface p-5 text-left border border-brand-border space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Tracking Code:</span>
              <span className="font-mono font-bold text-brand-primary">{confirmedOrder.trackingCode}</span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Asset Redeemed:</span>
              <span className="font-bold text-brand-text">
                {confirmedOrder.brandName} ({confirmedOrder.quantity}x ${confirmedOrder.nominal}) • {confirmedOrder.cardType === 'PCARD' ? 'Physical Card' : 'E-Code'}
              </span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Locked Payout:</span>
              <span className="font-mono font-bold text-brand-success text-base">
                ${confirmedOrder.payoutAmount.toFixed(2)} USD
              </span>
            </div>
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-muted">Destination Address:</span>
              <span className="font-mono text-brand-text/90 truncate max-w-[200px]">{confirmedOrder.payoutAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Current Status:</span>
              <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {confirmedOrder.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push(`/track?code=${confirmedOrder.trackingCode}`)}
              className="flex-1 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-sm transition-all cursor-pointer"
            >
              Track Live Status
            </button>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                setStep(1);
              }}
              className="flex-1 py-3.5 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text font-bold text-sm transition-all cursor-pointer"
            >
              Sell Another Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-md mx-auto text-xs font-bold text-brand-muted">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-brand-primary' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-brand-primary text-white' : 'bg-brand-surface border border-brand-border text-brand-muted'}`}>1</span>
            <span>Quote</span>
          </div>
          <div className="w-12 h-0.5 bg-brand-border"></div>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-brand-primary' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-brand-primary text-white' : 'bg-brand-surface border border-brand-border text-brand-muted'}`}>2</span>
            <span>Card Code</span>
          </div>
          <div className="w-12 h-0.5 bg-brand-border"></div>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-brand-primary' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-brand-primary text-white' : 'bg-brand-surface border border-brand-border text-brand-muted'}`}>3</span>
            <span>Payout</span>
          </div>
        </div>
      </div>

      {/* Step 1: Valuation */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Sell Your Gift Card</h1>
            <p className="text-sm text-brand-muted mt-2">
              Select your card brand, format (Physical vs E-Code), and amount to lock in your live valuation quote.
            </p>
          </div>
          <RatesCalculator initialBrandId={initialBrand} onProceed={handleProceedFromCalc} />
        </div>
      )}

      {/* Step 2: Card Code & Upload */}
      {step === 2 && tradeData && (
        <form onSubmit={handleProceedToPayout} className="rounded-3xl glass-panel p-7 sm:p-9 border border-brand-border space-y-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Step 2 of 3</span>
              <h2 className="text-2xl font-extrabold text-brand-text">Enter Gift Card Credentials</h2>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-brand-muted hover:text-brand-primary flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Locked Quote Summary Bar */}
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between text-xs sm:text-sm">
            <div>
              <span className="text-brand-muted block">Selected Asset</span>
              <span className="font-bold text-brand-text">
                {tradeData.brandName} ({tradeData.quantity}x ${tradeData.nominal}) • {tradeData.cardType === 'PCARD' ? 'Physical Card' : 'E-Code'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-brand-muted block">Guaranteed Payout</span>
              <span className="font-mono font-extrabold text-brand-success text-base">
                ${tradeData.totalPayoutUsd.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Card Codes Textarea */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
              Card Code(s) <span className="text-brand-primary">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder={`Enter your ${tradeData.brandName} code here.\nIf you have multiple cards, enter one code per line.`}
              value={cardCodes}
              onChange={(e) => setCardCodes(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl p-4 font-mono focus:outline-none focus:border-brand-primary resize-none placeholder:text-brand-muted/40"
            />
            <p className="text-[11px] text-brand-muted mt-1.5">
              Exact code string without extra spaces. For digital e-codes, paste directly from your email.
            </p>
          </div>

          {/* Optional PIN */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
              Card PIN (Optional / If Applicable)
            </label>
            <input
              type="text"
              placeholder="e.g. 4-digit or 6-digit security PIN"
              value={cardPin}
              onChange={(e) => setCardPin(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-brand-primary placeholder:text-brand-muted/40"
            />
          </div>

          {/* Receipt Upload Field */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
              Upload Card Photo or Purchase Receipt ({tradeData.cardType === 'PCARD' ? 'Required for Physical' : 'Optional'})
            </label>
            {receiptBase64 ? (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface border border-brand-primary/40 shadow-sm">
                <div className="flex items-center gap-3.5">
                  {receiptBase64.startsWith('data:image') ? (
                    <img src={receiptBase64} alt="Receipt preview" className="w-14 h-14 object-cover rounded-xl border border-brand-border shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      <FileText className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-brand-text truncate max-w-[200px] sm:max-w-xs">{receiptFileName}</p>
                    <span className="text-[11px] text-brand-success font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Image attached securely
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-2 text-brand-muted hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove file"
                  aria-label="Remove uploaded file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-brand-border hover:border-brand-primary/60 rounded-2xl p-6 text-center bg-brand-surface transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-brand-muted mx-auto mb-2" />
                <p className="text-xs font-bold text-brand-text">
                  Click to upload card back photo or receipt
                </p>
                <p className="text-[11px] text-brand-muted mt-1">PNG, JPG, WEBP up to 8MB</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-base shadow-lg shadow-brand-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Payout Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Step 3: Destination Payout Address */}
      {step === 3 && tradeData && (
        <form onSubmit={handleFinalSubmit} className="rounded-3xl glass-panel p-7 sm:p-9 border border-brand-border space-y-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Step 3 of 3</span>
              <h2 className="text-2xl font-extrabold text-brand-text">Where Should We Send Your Funds?</h2>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-brand-muted hover:text-brand-primary flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Wallet Verification Alert Prompt */}
          {!savedWallet?.isConfigured ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Wallet className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <span className="font-bold block">Payout Destination Not Saved</span>
                  Save your payout wallet once to enjoy 1-click settlements and escrow protection across all trades.
                </div>
              </div>
              <Link
                href="/wallet?redirect=sell"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs whitespace-nowrap shadow-sm"
              >
                Configure Wallet
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-brand-successGlow border border-brand-success/30 text-brand-success text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Preloaded verified destination from your wallet profile.
              </span>
              <Link href="/wallet" className="font-bold underline text-xs">
                Edit Wallet
              </Link>
            </div>
          )}

          {submitError && (
            <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Payout Destination Input */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
              {tradeData.payoutName} Address or Bank Account <span className="text-brand-primary">*</span>
            </label>
            <input
              required
              type="text"
              placeholder={`Enter your ${tradeData.payoutName} destination address`}
              value={payoutAddress}
              onChange={(e) => setPayoutAddress(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl px-4 py-3.5 font-mono focus:outline-none focus:border-brand-primary placeholder:text-brand-muted/40"
            />
            <p className="text-[11px] text-brand-muted mt-1.5">
              Please double check your wallet address or account details. Transfers are irreversible once broadcasted.
            </p>
          </div>

          {/* Email for receipt */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
              Your Notification Email (Optional)
            </label>
            <input
              type="email"
              placeholder="name@example.com (To receive confirmation receipt)"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary placeholder:text-brand-muted/40"
            />
          </div>

          {/* Final Summary Card */}
          <div className="p-5 rounded-2xl bg-brand-surface border border-brand-primary/30 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Trade Value:</span>
              <span className="text-brand-text font-bold">
                {tradeData.quantity}x {tradeData.brandName} (${tradeData.totalFaceValue} Face Value)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Card Format & Rate:</span>
              <span className="text-brand-text font-bold">
                {tradeData.cardType === 'PCARD' ? 'Physical Card' : 'E-Code'} ({tradeData.ratePercent}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Estimated Settlement Speed:</span>
              <span className="text-brand-primary font-bold">
                {tradeData.verificationTime || '5-15 mins'}
              </span>
            </div>
            <div className="flex justify-between border-t border-brand-border/60 pt-2 text-base">
              <span className="text-brand-text font-bold">Total Guaranteed Payout:</span>
              <span className="font-mono font-extrabold text-brand-success">${tradeData.totalPayoutUsd.toFixed(2)} USD</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-brand-success hover:bg-emerald-600 disabled:opacity-60 text-white font-extrabold text-base shadow-xl shadow-brand-success/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Submitting Order...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirm & Submit Trade</span>
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-brand-muted">Loading exchange desk...</div>}>
      <SellPageContent />
    </Suspense>
  );
}
