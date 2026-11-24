'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Coins, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Send, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Award,
  Globe2,
  Lock,
  Headphones
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function BuyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-bold tracking-wide">
            <Building2 className="w-3.5 h-3.5" />
            <span>B2B & WHOLESALE DESK</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-text leading-tight">
            {t('buyPageTitle')}
          </h1>
          
          <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
            {t('buyPageSubtitle')}
          </p>
        </div>

        {/* 4 Value Proposition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Wholesale Pricing */}
          <div className="p-6 rounded-2xl bg-brand-card/90 border border-brand-border/80 hover:border-brand-primary/40 transition-all hover:-translate-y-1 shadow-lg shadow-black/20 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors">
              {t('wholesalePricingTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              {t('wholesalePricingDesc')}
            </p>
          </div>

          {/* Card 2: Wide Selection */}
          <div className="p-6 rounded-2xl bg-brand-card/90 border border-brand-border/80 hover:border-brand-primary/40 transition-all hover:-translate-y-1 shadow-lg shadow-black/20 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors">
              {t('wideSelectionTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              {t('wideSelectionDesc')}
            </p>
          </div>

          {/* Card 3: Trusted & Secure */}
          <div className="p-6 rounded-2xl bg-brand-card/90 border border-brand-border/80 hover:border-brand-primary/40 transition-all hover:-translate-y-1 shadow-lg shadow-black/20 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-brand-success group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors">
              {t('trustedSecureTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              {t('trustedSecureDesc')}
            </p>
          </div>

          {/* Card 4: Fast Response */}
          <div className="p-6 rounded-2xl bg-brand-card/90 border border-brand-border/80 hover:border-brand-primary/40 transition-all hover:-translate-y-1 shadow-lg shadow-black/20 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors">
              {t('fastResponseTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              {t('fastResponseDesc')}
            </p>
          </div>
        </div>

        {/* Telegram Direct Action Cards (2 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Telegram Direct Contact (Recommended) */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-card to-brand-surface/90 border-2 border-brand-primary/40 shadow-xl shadow-brand-primary/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9]">
                  <Send className="w-6 h-6 fill-current" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary text-xs font-bold">
                  👍 {t('tgContactBadge')}
                </span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-text">
                  {t('tgContactTitle')}
                </h3>
                <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                  {t('tgContactDesc')}
                </p>
              </div>
            </div>

            <a
              href="https://t.me/cardbyte_support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-2xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white font-bold text-sm shadow-lg shadow-[#229ED9]/25 hover:shadow-xl hover:shadow-[#229ED9]/40 transition-all hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>{t('tgContactBtn')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          {/* Card 2: Telegram Market & Rates Channel */}
          <div className="p-6 sm:p-8 rounded-3xl bg-brand-card/90 border border-brand-border/80 hover:border-brand-border transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-primary">
                  <Users className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-surface border border-brand-border text-brand-muted text-xs font-medium">
                  Official Channel
                </span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-text">
                  {t('tgMarketTitle')}
                </h3>
                <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                  {t('tgMarketDesc')}
                </p>
              </div>
            </div>

            <a
              href="https://t.me/cardbyte_rates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-2xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border hover:border-brand-primary text-brand-text font-bold text-sm transition-all hover:-translate-y-0.5"
            >
              <Users className="w-4 h-4 text-brand-primary" />
              <span>{t('tgMarketBtn')}</span>
              <ArrowRight className="w-4 h-4 ml-1 text-brand-muted" />
            </a>
          </div>

          {/* 
            NOTE: WhatsApp Channel is explicitly excluded per client specification.
            Kept modular below for easy future enablement:
            
            <div className="p-6 sm:p-8 rounded-3xl bg-brand-card/90 border border-brand-border/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Contact via WhatsApp</h3>
                  <p className="text-xs text-brand-muted">24/7 dedicated wholesale chat desk</p>
                </div>
              </div>
              <a href="https://wa.me/..." className="mt-6 w-full py-3 bg-[#25D366] text-white rounded-2xl font-bold text-center block">
                Message on WhatsApp
              </a>
            </div>
          */}

        </div>

        {/* Bottom Trust Strip */}
        <div className="pt-6 border-t border-brand-border/60">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            
            <div className="p-4 rounded-xl bg-brand-surface/50 border border-brand-border/40 flex items-center justify-center gap-2.5">
              <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-brand-text">
                {t('trustStrip1')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-brand-surface/50 border border-brand-border/40 flex items-center justify-center gap-2.5">
              <Award className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-brand-text">
                {t('trustStrip2')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-brand-surface/50 border border-brand-border/40 flex items-center justify-center gap-2.5">
              <Globe2 className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-brand-text">
                {t('trustStrip3')}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
