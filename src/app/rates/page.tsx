'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GiftCardBrand, INITIAL_BRANDS } from '@/lib/ratesData';
import { Search, ArrowRight, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function RatesPage() {
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState<GiftCardBrand[]>(INITIAL_BRANDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rates')
      .then(res => res.json())
      .then(json => {
        if (json?.data?.brands && Array.isArray(json.data.brands)) {
          const sorted = [...json.data.brands].sort((a, b) => (a.order || 0) - (b.order || 0));
          setBrands(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.countries.some(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25">
          LIVE PRICING CATALOG & FORMAT PARITY
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-text tracking-tight mt-3">
          Exchange Rates & Limits
        </h1>
        <p className="text-sm sm:text-base text-brand-muted mt-2">
          Transparent real-time quotations with independent rates for <strong>E-Codes</strong> and <strong>Physical Cards</strong>. No hidden slip or unexpected deductions.
        </p>

        {/* Search Input */}
        <div className="relative mt-6 max-w-md mx-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by brand (e.g. Apple, Steam) or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary placeholder:text-brand-muted/50"
          />
        </div>
      </div>

      {/* Rates Table Card */}
      <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-surface border-b border-brand-border text-xs uppercase text-brand-muted tracking-wider">
              <tr>
                <th className="py-4 px-6">Gift Card Brand</th>
                <th className="py-4 px-6">Region / Currency</th>
                <th className="py-4 px-6">Available Values</th>
                <th className="py-4 px-6">E-Code Rate</th>
                <th className="py-4 px-6">Physical Rate</th>
                <th className="py-4 px-6">Verification Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-text">
              {filteredBrands.map((b) => (
                <React.Fragment key={b.id}>
                  {b.countries.map((c, idx) => {
                    const isBrandDisabled = b.enabled === false;
                    const ecodeRate = c.rateEcode || c.ratePercent;
                    const physicalRate = c.ratePhysical || (ecodeRate + 4.5);

                    return (
                      <tr key={`${b.id}-${c.code}`} className={`hover:bg-brand-surface/70 transition-colors ${isBrandDisabled ? 'opacity-60 bg-brand-surface/20' : ''}`}>
                        {idx === 0 ? (
                          <td className="py-4 px-6 align-top" rowSpan={b.countries.length}>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-2 rounded-xl bg-brand-surface border border-brand-border">{b.icon}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-brand-text block">{b.name}</span>
                                  {isBrandDisabled && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-500 border border-red-500/30">
                                      Temporarily Paused
                                    </span>
                                  )}
                                </div>
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

                        {/* E-Code Rate */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-mono font-bold text-brand-primary text-base">
                            {ecodeRate}%
                          </span>
                        </td>

                        {/* Physical Rate */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-mono font-extrabold text-brand-success text-base">
                            {physicalRate}%
                          </span>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap text-xs text-brand-muted">
                          <span className="flex items-center gap-1.5 font-medium text-brand-success">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
                            {b.verificationTime || 'Verified by Moderator'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {isBrandDisabled ? (
                            <span className="text-xs font-semibold text-brand-muted">
                              Unavailable
                            </span>
                          ) : (
                            <Link
                              href={`/sell?brand=${b.id}&country=${c.code}`}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 text-xs font-bold transition-all"
                            >
                              <span>Trade</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
