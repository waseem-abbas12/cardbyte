import React from 'react';
import { LIVE_TICKER_ITEMS } from '@/lib/ratesData';

export default function LiveTicker() {
  const tickerItems = [...LIVE_TICKER_ITEMS, ...LIVE_TICKER_ITEMS];

  return (
    <div className="w-full bg-brand-surface border-b border-brand-border py-2.5 overflow-hidden select-none transition-colors">
      <div className="flex items-center">
        {/* Live Badge */}
        <div className="flex items-center gap-2 pl-4 pr-3.5 border-r border-brand-border z-10 bg-brand-surface shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-success"></span>
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-brand-success">LIVE RATES</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex whitespace-nowrap animate-ticker overflow-hidden">
          {tickerItems.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 mx-5 text-xs text-brand-muted shrink-0 transition-colors hover:text-brand-text"
            >
              <span className="text-sm">{item.country}</span>
              <span className="font-semibold text-brand-text">{item.brand}</span>
              <span className="font-mono font-bold text-brand-success">{item.price}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-successGlow text-brand-success font-semibold">
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
