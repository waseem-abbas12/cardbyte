'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, ArrowRight, Sparkles, DollarSign, Users, ShieldCheck } from 'lucide-react';

export default function ReferralBanner() {
  return (
    <section className="py-12 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl p-8 sm:p-10 border border-brand-primary/30 bg-gradient-to-r from-brand-surface via-brand-card to-emerald-950/20 overflow-hidden shadow-xl">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-primary/20 blur-[90px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-brand-success text-xs font-bold tracking-wide uppercase">
                <Gift className="w-3.5 h-3.5" />
                Affiliate Program
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                Invite Sellers, Earn <span className="text-brand-success font-mono">0.25%</span> on Every Trade
              </h3>

              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                Share your unique Cardbyte referral link with friends, communities, or vendor networks. Earn instant crypto commission automatically credited to your balance upon every verified card or game key settlement.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-brand-text">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-success" />
                  <span>Real-Time Commission Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-primary" />
                  <span>Unlimited Referred Trades</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-success" />
                  <span>Zero Withdrawal Minimum</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/account/referrals"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-sm shadow-lg shadow-brand-primary/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span>Get Referral Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/p/how-it-works"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text font-bold text-sm transition-all text-center whitespace-nowrap"
              >
                Learn More
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
