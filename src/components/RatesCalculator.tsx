'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GiftCardBrand, PayoutMethod, INITIAL_BRANDS, SUPPORTED_PAYOUTS } from '@/lib/ratesData';
import { ArrowRight, Calculator, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface RatesCalculatorProps {
  initialBrandId?: string;
  onProceed?: (selection: any) => void;
}

export default function RatesCalculator({ initialBrandId = 'apple', onProceed }: RatesCalculatorProps) {
  const router = useRouter();
  const brands = INITIAL_BRANDS;
  const payouts = SUPPORTED_PAYOUTS;

  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrandId);
  const selectedBrand = useMemo(() => brands.find(b => b.id === selectedBrandId) || brands[0], [brands, selectedBrandId]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(selectedBrand.countries[0]?.code || 'US');
  
  const currentCountry = useMemo(() => {
    return selectedBrand.countries.find(c => c.code === selectedCountryCode) || selectedBrand.countries[0];
  }, [selectedBrand, selectedCountryCode]);

  const [nominal, setNominal] = useState<number>(currentCountry.nominals[0] || 100);
  const [customNominal, setCustomNominal] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cardType, setCardType] = useState<'ECODE' | 'PCARD'>('ECODE');
  const [selectedPayoutId, setSelectedPayoutId] = useState<string>('usdt_trc20');

  const selectedPayout = useMemo(() => {
    return payouts.find(p => p.id === selectedPayoutId) || payouts[0];
  }, [payouts, selectedPayoutId]);

  // Calculations
  const activeNominal = customNominal ? parseFloat(customNominal) || 0 : nominal;
  const totalFaceValue = activeNominal * quantity;
  const ratePercent = currentCountry.ratePercent;
  const totalPayoutUsd = (totalFaceValue * ratePercent) / 100;

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
      brandId: selectedBrand.id,
      brandName: selectedBrand.name,
      countryCode: currentCountry.code,
      currency: currentCountry.currency,
      nominal: activeNominal,
      quantity,
      cardType,
      ratePercent,
      totalFaceValue,
      totalPayoutUsd,
      payoutId: selectedPayout.id,
      payoutName: `${selectedPayout.name} (${selectedPayout.network || selectedPayout.symbol})`
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
    <div className="w-full rounded-3xl glass-panel p-6 sm:p-7 relative overflow-hidden transition-all">
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
          <span>Auto Quoting</span>
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
              Country / Currency
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

        {/* Row 2: Card Type & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card Type toggle */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5">
              Card Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCardType('ECODE')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  cardType === 'ECODE'
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'
                }`}
              >
                E-Code / Digital
              </button>
              <button
                type="button"
                onClick={() => setCardType('PCARD')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  cardType === 'PCARD'
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'
                }`}
              >
                Physical Card
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5">
              Quantity of Cards
            </label>
            <div className="flex items-center rounded-xl bg-brand-surface border border-brand-border overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 text-brand-muted hover:text-brand-text font-bold transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-transparent text-center text-brand-text font-bold text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 text-brand-muted hover:text-brand-text font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Nominal Value Buttons */}
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5">
            Card Value ({currentCountry.currency})
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {currentCountry.nominals.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setNominal(val);
                  setCustomNominal('');
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  !customNominal && nominal === val
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20'
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

        {/* Row 4: Payout Currency */}
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5">
            Payout Destination
          </label>
          <div className="relative">
            <select
              value={selectedPayoutId}
              onChange={(e) => setSelectedPayoutId(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl px-3.5 py-3 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer font-medium"
            >
              {payouts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name} {p.network ? `(${p.network})` : ''} — Fee: {p.fee}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-3.5 pointer-events-none text-brand-muted text-xs">▼</div>
          </div>
        </div>

        {/* Valuation Result Box */}
        <div className="rounded-2xl bg-brand-surface p-5 border border-brand-border mt-5 transition-colors">
          <div className="flex items-center justify-between text-xs text-brand-muted mb-1.5">
            <span>Trading Valuation</span>
            <span className="font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
              {ratePercent}% Payout
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
              <span className="text-xs text-brand-muted block">Estimated Speed:</span>
              <span className="text-xs font-bold text-brand-text flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                {selectedBrand.verificationTime}
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
            No hidden fees
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
            256-bit encryption
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
            Fast settlement
          </span>
        </div>
      </div>
    </div>
  );
}
