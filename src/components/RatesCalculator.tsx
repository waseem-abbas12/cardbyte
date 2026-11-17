'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GiftCardBrand, PayoutMethod, INITIAL_BRANDS, SUPPORTED_PAYOUTS } from '@/lib/ratesData';
import { ArrowRight, Calculator, Clock, Zap, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface RatesCalculatorProps {
  initialBrandId?: string;
  onProceed?: (selection: any) => void;
}

export default function RatesCalculator({ initialBrandId = 'apple', onProceed }: RatesCalculatorProps) {
  const router = useRouter();
  const [brands, setBrands] = useState<GiftCardBrand[]>(INITIAL_BRANDS);
  const payouts = SUPPORTED_PAYOUTS;

  // Fetch live store brands (with enabled status and updated rates/speeds)
  useEffect(() => {
    fetch('/api/rates')
      .then(res => res.json())
      .then(json => {
        if (json?.data?.brands && Array.isArray(json.data.brands)) {
          // Filter to only active enabled brands for users
          const active = json.data.brands.filter((b: GiftCardBrand) => b.enabled !== false);
          if (active.length > 0) setBrands(active);
        }
      })
      .catch(() => {});
  }, []);

  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrandId);
  const selectedBrand = useMemo(() => {
    return brands.find(b => b.id === selectedBrandId) || brands[0] || INITIAL_BRANDS[0];
  }, [brands, selectedBrandId]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(selectedBrand?.countries[0]?.code || 'US');
  
  const currentCountry = useMemo(() => {
    return selectedBrand?.countries?.find(c => c.code === selectedCountryCode) || selectedBrand?.countries[0];
  }, [selectedBrand, selectedCountryCode]);

  const [nominal, setNominal] = useState<number>(currentCountry?.nominals[0] || 100);
  const [customNominal, setCustomNominal] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cardType, setCardType] = useState<'ECODE' | 'PCARD'>('ECODE');
  const [selectedPayoutId, setSelectedPayoutId] = useState<string>('usdt_trc20');

  const selectedPayout = useMemo(() => {
    return payouts.find(p => p.id === selectedPayoutId) || payouts[0];
  }, [payouts, selectedPayoutId]);

  // Dynamic Rate Calculation based on Physical vs. E-Code
  const activeRatePercent = useMemo(() => {
    if (!currentCountry) return 70;
    if (cardType === 'PCARD') {
      return currentCountry.ratePhysical || (currentCountry.rateEcode ? currentCountry.rateEcode + 4.5 : currentCountry.ratePercent);
    }
    return currentCountry.rateEcode || currentCountry.ratePercent || 70;
  }, [currentCountry, cardType]);

  const activeNominal = customNominal ? parseFloat(customNominal) || 0 : nominal;
  const totalFaceValue = activeNominal * quantity;
  const totalPayoutUsd = (totalFaceValue * activeRatePercent) / 100;

  const handleBrandChange = (id: string) => {
    setSelectedBrandId(id);
    const newBrand = brands.find(b => b.id === id);
    if (newBrand && newBrand.countries.length > 0) {
      setSelectedCountryCode(newBrand.countries[0].code);
      setNominal(newBrand.countries[0].nominals[0] || 100);
      setCustomNominal('');
    }
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const c = selectedBrand.countries.find(item => item.code === code);
    if (c) {
      setNominal(c.nominals[0] || 100);
      setCustomNominal('');
    }
  };

  const handleStartTrade = () => {
    const tradeData = {
      brandId: selectedBrand?.id || 'apple',
      brandName: selectedBrand?.name || 'Apple & iTunes',
      countryCode: currentCountry?.code || 'US',
      currency: currentCountry?.currency || 'USD',
      nominal: activeNominal || 100,
      quantity: quantity || 1,
      cardType,
      ratePercent: activeRatePercent || 70,
      totalFaceValue: totalFaceValue || 100,
      totalPayoutUsd: totalPayoutUsd || 70,
      verificationTime: selectedBrand?.verificationTime || '5-15 mins',
      payoutId: selectedPayout?.id || 'usdt_trc20',
      payoutName: selectedPayout ? `${selectedPayout.name} (${selectedPayout.network || selectedPayout.symbol})` : 'USDT (TRC20)'
    };

    if (onProceed) {
      onProceed(tradeData);
    } else {
      const query = new URLSearchParams({
        brand: tradeData.brandId,
        country: tradeData.countryCode,
        nominal: tradeData.nominal.toString(),
        qty: tradeData.quantity.toString(),
        type: tradeData.cardType,
        payout: tradeData.payoutId
      }).toString();
      router.push(`/sell?${query}`);
    }
  };

  return (
    <div className="w-full rounded-3xl glass-panel p-6 sm:p-7 relative overflow-hidden transition-all shadow-card">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-text tracking-tight">Instant Rates Calculator</h3>
            <p className="text-xs text-brand-muted">Real-time market valuation with zero hidden fees</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-successGlow text-brand-success text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Live Quotation Engine</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Row 1: Brand & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Brand Selection */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5">
              Select Gift Card
            </label>
            <div className="relative">
              <select
                value={selectedBrandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-3 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer font-medium"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.icon} {b.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-brand-muted text-xs">▼</div>
            </div>
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5">
              Card Region / Currency
            </label>
            <div className="relative">
              <select
                value={selectedCountryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-3 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer font-medium"
              >
                {selectedBrand.countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-brand-muted text-xs">▼</div>
            </div>
          </div>
        </div>

        {/* Row 2: Card Format (Physical vs E-Code) with Dynamic Rates */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Card Format & Dynamic Rate
            </label>
            <span className="text-[11px] font-semibold text-brand-primary">
              {cardType === 'PCARD' ? 'Physical Card with receipt (+Spread)' : 'Instant Digital E-Code'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCardType('ECODE')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                cardType === 'ECODE'
                  ? 'border-brand-primary bg-brand-primary/10 shadow-sm'
                  : 'border-brand-border bg-brand-surface hover:bg-brand-cardHover'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs text-brand-text">Electronic Code (E-Code)</span>
                <span className="font-mono text-xs font-extrabold text-brand-primary">
                  {currentCountry?.rateEcode || currentCountry?.ratePercent}%
                </span>
              </div>
              <span className="text-[11px] text-brand-muted mt-1">Digital string or email copy</span>
            </button>

            <button
              type="button"
              onClick={() => setCardType('PCARD')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                cardType === 'PCARD'
                  ? 'border-brand-primary bg-brand-primary/10 shadow-sm'
                  : 'border-brand-border bg-brand-surface hover:bg-brand-cardHover'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs text-brand-text">Physical Card (PCARD)</span>
                <span className="font-mono text-xs font-extrabold text-brand-success">
                  {currentCountry?.ratePhysical || ((currentCountry?.rateEcode || 70) + 4.5)}%
                </span>
              </div>
              <span className="text-[11px] text-brand-muted mt-1">Clear photo with cash receipt</span>
            </button>
          </div>
        </div>

        {/* Row 3: Nominal Value & Quantity */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Nominal Value ({currentCountry?.currency})
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-muted">Qty:</span>
              <div className="flex items-center border border-brand-border rounded-lg bg-brand-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-0.5 text-brand-muted hover:text-brand-text font-bold text-xs hover:bg-brand-cardHover"
                >
                  -
                </button>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-brand-text">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-0.5 text-brand-muted hover:text-brand-text font-bold text-xs hover:bg-brand-cardHover"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {currentCountry?.nominals.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setNominal(val);
                  setCustomNominal('');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  nominal === val && !customNominal
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-brand-surface text-brand-muted border-brand-border hover:text-brand-text hover:border-brand-border'
                }`}
              >
                {val}
              </button>
            ))}
            <div className="col-span-2">
              <input
                type="number"
                placeholder="Custom..."
                value={customNominal}
                onChange={(e) => setCustomNominal(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold bg-brand-surface border focus:outline-none text-brand-text ${
                  customNominal ? 'border-brand-primary' : 'border-brand-border'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Payout Destination */}
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5">
            Payout Destination Rail
          </label>
          <div className="relative">
            <select
              value={selectedPayoutId}
              onChange={(e) => setSelectedPayoutId(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-3 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer font-medium"
            >
              {payouts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name} {p.network ? `(${p.network})` : ''} — Fee: {p.fee} (Min: ${p.minPayout})
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-3.5 pointer-events-none text-brand-muted text-xs">▼</div>
          </div>
        </div>

        {/* Valuation Result Box */}
        <div className="rounded-2xl bg-brand-surface p-5 border border-brand-border mt-5 transition-colors">
          <div className="flex items-center justify-between text-xs text-brand-muted mb-1.5">
            <span>Trading Valuation ({cardType === 'PCARD' ? 'Physical Card' : 'E-Code'})</span>
            <span className="font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
              {activeRatePercent}% Guaranteed Payout
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-brand-border">
            <div>
              <span className="text-xs text-brand-muted block">You Will Receive:</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-brand-success font-mono">
                  ${totalPayoutUsd.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-brand-muted">
                  in {selectedPayout.symbol}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-brand-muted block">Live Processing Speed:</span>
              <span className="text-xs font-bold text-brand-text flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                {selectedBrand.verificationTime || '5-15 mins'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleStartTrade}
          className="w-full py-4 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-base shadow-lg shadow-brand-primary/25 transition-all flex items-center justify-center gap-2 group cursor-pointer hover:-translate-y-0.5"
        >
          <span>Sell Gift Card Now</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Mini Trust Points */}
        <div className="flex items-center justify-around pt-2 text-[11px] text-brand-muted">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
            No hidden deductions
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
            Escrow-backed payout
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
            Rapid settlement
          </span>
        </div>
      </div>
    </div>
  );
}
