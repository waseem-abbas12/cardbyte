'use client';

import React from 'react';
import Link from 'next/link';
import { INITIAL_BRANDS } from '@/lib/ratesData';
import { ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

export default function CardGrid() {
  const brands = INITIAL_BRANDS;

  return (
    <section className="py-16 bg-brand-surface/40 border-y border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-bold tracking-wide uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Supported Digital Assets
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Popular Gift Cards We Buy Daily
            </h2>
            <p className="text-sm sm:text-base text-brand-muted mt-2 max-w-2xl">
              Competitive rates updated continuously based on global wholesale OTC market liquidity. Sell in singles or bulk.
            </p>
          </div>

          <Link
            href="/rates"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-brand-primaryHover transition-colors"
          >
            <span>View All Rates & Limits</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brands.map((b) => {
            const primaryCountry = b.countries[0];
            return (
              <Link
                key={b.id}
                href={`/sell?brand=${b.id}`}
                className="group p-5 rounded-2xl glass-panel hover:bg-brand-cardHover transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                      {b.icon}
                    </div>
                    {b.badge && (
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                        b.badge === 'Hot' || b.badge === 'High Rate'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : b.badge === 'Instant'
                          ? 'bg-brand-successGlow text-brand-success border border-brand-success/30'
                          : 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30'
                      }`}>
                        {b.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-brand-primary transition-colors">
                    {b.name}
                  </h3>
                  <div className="text-xs text-brand-muted mt-0.5">
                    {b.countries.length} regions supported ({b.countries.map(c => c.code).join(', ')})
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-brand-muted block">Buy Rate</span>
                    <span className="text-lg font-mono font-extrabold text-brand-success">
                      Up to {primaryCountry.ratePercent}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-brand-muted block">Settlement</span>
                    <span className="text-xs font-semibold text-white/90 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-brand-muted" />
                      {b.verificationTime}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
