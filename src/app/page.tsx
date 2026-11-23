'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LiveTicker from '@/components/LiveTicker';
import RatesCalculator from '@/components/RatesCalculator';
import CardGrid from '@/components/CardGrid';
import GameKeysSection from '@/components/GameKeysSection';
import TrustSection from '@/components/TrustSection';
import ReviewsSection from '@/components/ReviewsSection';
import ReferralBanner from '@/components/ReferralBanner';
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { SiteSettings, FaqItem, LayoutSection } from '@/lib/types';

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Cardbyte Pro',
    tagline: 'Leading Global Gift Card & Crypto Exchange',
    announcementTicker: '🔥 High demand: Steam US Physical at 80% • Apple iTunes E-Code instant verification • 0% withdrawal fees',
    telegramSupport: 'https://t.me/cardbyte_support',
    whatsappSupport: '+1 (234) 567-8900',
    supportEmail: 'support@cardbyte.io',
    activeTradersCount: '850+',
    volumeTraded: '19+',
    customerSatisfaction: '4.98 ★',
    avgPayoutTime: 'Verified by Moderator',
    autoVerification: false,
    heroTitle: 'Sell Gift Cards at the Best Rates: Fast, Easy, Reliable.',
    heroSubtitle: 'Turn your unused gift cards into USDT, Bitcoin, or instant local cash. Live algorithmic valuations, zero surprise deductions, and direct settlement.'
  });

  const [sections, setSections] = useState<LayoutSection[]>([
    { id: 'ticker', name: 'Live Withdrawals Ticker Bar', description: '', order: 1, enabled: true },
    { id: 'hero', name: 'Hero Header & Value Proposition', description: '', order: 2, enabled: true },
    { id: 'brands', name: 'Supported Brands Grid', description: '', order: 3, enabled: true },
    { id: 'gamekeys', name: 'Sell Game Keys Section', description: '', order: 4, enabled: true },
    { id: 'trust', name: '4-Step Workflow & Security Section', description: '', order: 5, enabled: true },
    { id: 'reviews', name: 'Seller Reviews & Ratings', description: '', order: 6, enabled: true },
    { id: 'referral', name: 'Affiliate Highlight Banner', description: '', order: 7, enabled: true },
    { id: 'faqs', name: 'Frequently Asked Questions', description: '', order: 8, enabled: true },
    { id: 'cta', name: 'Bottom Action Banner', description: '', order: 9, enabled: true }
  ]);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(json => {
        if (json?.data) {
          if (json.data.siteSettings) setSettings(json.data.siteSettings);
          if (json.data.layoutSections && json.data.layoutSections.length > 0) {
            setSections(json.data.layoutSections.filter((s: LayoutSection) => s.enabled));
          }
          if (json.data.faqs) setFaqs(json.data.faqs);
        }
      })
      .catch(() => {});
  }, []);

  // Individual Section Renderers
  const renderSection = (id: string) => {
    switch (id) {
      case 'ticker':
        return <LiveTicker key="ticker" announcement={settings.announcementTicker} />;

      case 'hero':
        return (
          <section key="hero" className="relative pt-12 pb-20 md:py-24 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-successGlow blur-[140px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Hero Content */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" />
                    <span>#1 Trusted Digital Gift Card Exchange</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-text tracking-tight leading-[1.12]">
                    {settings.heroTitle}
                  </h1>

                  <p className="text-base sm:text-lg text-brand-muted max-w-xl leading-relaxed">
                    {settings.heroSubtitle}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-brand-text">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                      <span>Independent E-Code & Physical Rates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                      <span>Verified by Moderator Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                      <span>Escrow-Protected Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                      <span>Zero Withdrawal Deductions</span>
                    </div>
                  </div>

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
                      View All Rates & Limits
                    </Link>
                  </div>

                  <div className="pt-6 border-t border-brand-border flex items-center gap-8 text-xs text-brand-muted">
                    <div>
                      <span className="font-extrabold text-brand-text text-sm block">{settings.activeTradersCount}</span>
                      Cards & Keys
                    </div>
                    <div className="border-l border-brand-border pl-8">
                      <span className="font-extrabold text-brand-success text-sm block">{settings.volumeTraded}</span>
                      Supported Brands
                    </div>
                    <div className="border-l border-brand-border pl-8">
                      <span className="font-extrabold text-brand-text text-sm block">{settings.customerSatisfaction}</span>
                      Trust Rating
                    </div>
                  </div>
                </div>

                {/* Right Calculator */}
                <div className="lg:col-span-5" id="calculator">
                  <RatesCalculator />
                </div>

              </div>
            </div>
          </section>
        );

      case 'calculator':
        // Duplicate removed permanently - calculator embedded in hero fold
        return null;

      case 'brands':
        return <CardGrid key="brands" />;

      case 'gamekeys':
        return <GameKeysSection key="gamekeys" />;

      case 'trust':
        return <TrustSection key="trust" settings={settings} />;

      case 'reviews':
        return <ReviewsSection key="reviews" />;

      case 'referral':
        return <ReferralBanner key="referral" />;

      case 'faqs':
        return (
          <section key="faqs" className="py-20 bg-brand-surface/60 border-t border-brand-border">
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
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-6 rounded-2xl glass-panel border border-brand-border space-y-2">
                    <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-brand-primary shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-sm text-brand-muted leading-relaxed pl-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key="cta" className="py-16 bg-brand-surface border-t border-brand-border">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
                Ready to Convert Your Gift Cards into Crypto or Cash?
              </h2>
              <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
                Join over {settings.activeTradersCount} satisfied sellers. Zero sign-up delays, live competitive quotations, and guaranteed fast settlement.
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {sections.map(s => renderSection(s.id))}
    </div>
  );
}
