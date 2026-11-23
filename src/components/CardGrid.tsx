'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GiftCardBrand, INITIAL_BRANDS } from '@/lib/ratesData';
import { ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

export default function CardGrid() {
  const [brands, setBrands] = useState<GiftCardBrand[]>(INITIAL_BRANDS);

  useEffect(() => {
    fetch('/api/rates')
      .then(res => res.json())
      .then(json => {
        if (json?.data?.brands && Array.isArray(json.data.brands)) {
          const sorted = [...json.data.brands].sort((a, b) => {
            if (a.enabled === false && b.enabled !== false) return 1;
            if (a.enabled !== false && b.enabled === false) return -1;
            return (a.order || 0) - (b.order || 0);
          });
          setBrands(sorted);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-14 bg-brand-surface/60 border-y border-brand-border" id="brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold tracking-wide uppercase mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Supported Digital Assets
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
              Popular Gift Cards We Buy Daily
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-1.5 max-w-2xl">
              Competitive rates updated continuously based on global wholesale OTC market liquidity. Digital E-Codes & Physical Cards accepted.
            </p>
          </div>

          <Link
            href="/rates"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-primaryHover transition-colors"
          >
            <span>View All Rates & Limits</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Compact Multi-Column Card Grid (5 cols desktop, 2 cols mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {brands.map((b) => {
            const primaryCountry = b.countries[0];
            const isPaused = b.enabled === false;
            const topRate = primaryCountry.ratePhysical || (primaryCountry.rateEcode ? primaryCountry.rateEcode + 4.5 : primaryCountry.ratePercent);

            return (
              <Link
                key={b.id}
                href={isPaused ? '#' : `/sell?brand=${b.id}`}
                className={`group p-4 rounded-2xl glass-panel border border-brand-border/80 hover:border-brand-primary/50 hover:bg-brand-cardHover transition-all flex flex-col justify-between ${
                  isPaused 
                    ? 'opacity-60 cursor-not-allowed hover:translate-y-0' 
                    : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/10'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-xl group-hover:scale-105 transition-transform shadow-sm">
                      {b.icon}
                    </div>
                    {isPaused ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/30">
                        Paused
                      </span>
                    ) : b.badge ? (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        b.badge === 'Hot' || b.badge === 'High Rate'
                          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25'
                          : b.badge === 'Instant'
                          ? 'bg-brand-successGlow text-brand-success border border-brand-success/25'
                          : 'bg-brand-primary/15 text-brand-primary border border-brand-primary/25'
                      }`}>
                        {b.badge}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-1">
                    {b.name}
                  </h3>
                  <div className="text-[11px] text-brand-muted mt-0.5 truncate">
                    {b.countries.length} regions ({b.countries.map(c => c.code).slice(0, 3).join(', ')}{b.countries.length > 3 ? '...' : ''})
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-brand-muted font-medium">Buy Rate</span>
                    <span className="text-base font-mono font-black text-brand-success">
                      Up to {topRate}%
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-surface text-brand-muted border border-brand-border group-hover:border-brand-primary/40 group-hover:text-brand-primary font-medium transition-colors">
                    Trade →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
