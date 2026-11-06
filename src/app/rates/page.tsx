'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INITIAL_BRANDS, SUPPORTED_PAYOUTS } from '@/lib/ratesData';
import { Search, ArrowRight, Clock, ShieldCheck, DollarSign } from 'lucide-react';

export default function RatesPage() {
  const [search, setSearch] = useState('');
  const brands = INITIAL_BRANDS;

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.countries.some(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25">
          LIVE PRICING CATALOG
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-3">
          Exchange Rates & Limits
        </h1>
        <p className="text-sm sm:text-base text-brand-muted mt-2">
          Transparent buy-back rates updated in real-time according to global market liquidity. No surprise slippage.
        </p>

        {/* Search Input */}
        <div className="relative mt-6 max-w-md mx-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by brand (e.g. Apple, Steam) or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-surface border border-brand-border text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Rates Table Card */}
      <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#060c1d] border-b border-brand-border text-xs uppercase text-brand-muted tracking-wider">
              <tr>
                <th className="py-4 px-6">Gift Card Brand</th>
                <th className="py-4 px-6">Region / Currency</th>
                <th className="py-4 px-6">Available Values</th>
                <th className="py-4 px-6">Buy Rate</th>
                <th className="py-4 px-6">Settlement Speed</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-white">
              {filteredBrands.map((b) => (
                <React.Fragment key={b.id}>
                  {b.countries.map((c, idx) => (
                    <tr key={`${b.id}-${c.code}`} className="hover:bg-brand-card/40 transition-colors">
                      {idx === 0 ? (
                        <td className="py-4 px-6 align-top" rowSpan={b.countries.length}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 rounded-xl bg-brand-surface border border-brand-border">{b.icon}</span>
                            <div>
                              <span className="font-bold text-white block">{b.name}</span>
                              <span className="text-xs text-brand-muted">{b.category}</span>
                            </div>
                          </div>
                        </td>
                      ) : null}

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="flex items-center gap-2 font-medium">
                          <span className="text-base">{c.flag}</span>
                          <span>{c.name} ({c.currency})</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap font-mono text-xs text-brand-muted">
                        {c.nominals.map(n => `$${n}`).join(', ')}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono font-extrabold text-brand-success text-base">
                          {c.ratePercent}%
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-xs text-brand-muted">
                        <span className="flex items-center gap-1.5 font-medium text-white/90">
                          <Clock className="w-3.5 h-3.5 text-brand-primary" />
                          {b.verificationTime}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link
                          href={`/sell?brand=${b.id}&country=${c.code}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/30 text-xs font-bold transition-all"
                        >
                          <span>Trade</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
