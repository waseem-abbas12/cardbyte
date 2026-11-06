import React from 'react';
import Link from 'next/link';
import LiveTicker from '@/components/LiveTicker';
import RatesCalculator from '@/components/RatesCalculator';
import CardGrid from '@/components/CardGrid';
import TrustSection from '@/components/TrustSection';
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

export default function HomePage() {
  const faqs = [
    {
      q: 'How fast do I get paid after submitting my gift card?',
      a: 'Most digital e-codes (such as Steam, Apple, Razer Gold, and Xbox) are verified within 5 to 15 minutes. Once verified, crypto or bank payouts are dispatched automatically.'
    },
    {
      q: 'Why do some cards (like Google Play or Ikea) say "Up to 72h"?',
      a: 'Certain retail brands require secondary store clearance or have chargeback review periods. To safeguard against fraudulent revocations, these specific cards have an extended verification window of up to 72 hours.'
    },
    {
      q: 'What payout methods do you support?',
      a: 'We support instant crypto payouts in USDT (TRC20, BEP20), Bitcoin (BTC), Solana (SOL), and USDC, as well as direct local bank transfers in USD, EUR, Nigerian Naira (NGN), and Ghanaian Cedi (GHS).'
    },
    {
      q: 'Can I sell physical cards with store receipts?',
      a: 'Yes! When placing an order, select "Physical Card (PCARD)" and upload a clear photo of the card showing the scratch-off PIN alongside the original store cash receipt.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Live Ticker Bar */}
      <LiveTicker />

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:py-24 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-successGlow blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>#1 Trusted Digital Gift Card Exchange</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-text tracking-tight leading-[1.12]">
                Sell Gift Cards at the{' '}
                <span className="text-brand-primary">
                  Best Rates
                </span>
                : Fast, Easy, Reliable.
              </h1>

              <p className="text-base sm:text-lg text-brand-muted max-w-xl leading-relaxed">
                Turn your unwanted gift cards into <strong className="text-brand-text font-semibold">USDT, Bitcoin, or instant local cash</strong>. Get live algorithmic valuations, zero surprise deductions, and direct settlement to your wallet.
              </p>

              {/* Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-brand-text">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Competitive OTC Market Spreads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>5-15 Minute Rapid Settlements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>256-Bit Bank Grade Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Zero Withdrawal or Gas Fees</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/sell"
                  className="px-7 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-base font-extrabold shadow-lg shadow-brand-primary/25 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <span>Start Selling Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/rates"
                  className="px-6 py-3.5 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text text-base font-bold transition-all shadow-sm"
                >
                  View All Rates
                </Link>
              </div>

              {/* Verified Trust Stats */}
              <div className="pt-6 border-t border-brand-border flex items-center gap-8 text-xs text-brand-muted">
                <div>
                  <span className="font-extrabold text-brand-text text-sm block">18,500+</span>
                  Active Traders
                </div>
                <div className="border-l border-brand-border pl-8">
                  <span className="font-extrabold text-brand-success text-sm block">$14.2M+</span>
                  Volume Exchanged
                </div>
                <div className="border-l border-brand-border pl-8">
                  <span className="font-extrabold text-brand-text text-sm block">100%</span>
                  Verified Payouts
                </div>
              </div>

            </div>

            {/* Right Hero Calculator (5 Cols) */}
            <div className="lg:col-span-5" id="calculator">
              <RatesCalculator />
            </div>

          </div>
        </div>
      </section>

      {/* 3. Card Grid Section */}
      <CardGrid />

      {/* 4. Trust & Workflow Section */}
      <TrustSection />

      {/* 5. Frequently Asked Questions */}
      <section className="py-20 bg-brand-surface/60 border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-primary tracking-widest uppercase px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-extrabold text-brand-text tracking-tight mt-3">
              Clear Answers to Your Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl glass-panel border border-brand-border space-y-2">
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-primary shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-sm text-brand-muted leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Bottom Banner */}
      <section className="py-16 bg-brand-surface border-t border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
            Ready to Convert Your Gift Cards into Crypto or Cash?
          </h2>
          <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
            Join over 18,000 satisfied sellers. Zero complicated sign-ups, instant live rates, and guaranteed rapid settlement.
          </p>
          <div className="pt-2">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-base shadow-xl shadow-brand-primary/25 transition-all hover:scale-105"
            >
              <span>Exchange Gift Card Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
