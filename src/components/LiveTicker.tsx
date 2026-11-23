import React from 'react';
import { LIVE_WITHDRAWAL_ITEMS } from '@/lib/ratesData';

interface LiveTickerProps {
  announcement?: string;
}

export default function LiveTicker({ announcement }: LiveTickerProps) {
  const tickerItems = [...LIVE_WITHDRAWAL_ITEMS, ...LIVE_WITHDRAWAL_ITEMS];

  return (
    <div className="w-full bg-brand-surface border-b border-brand-border py-2.5 overflow-hidden select-none transition-colors">
      <div className="flex items-center">
        {/* Live Badge */}
        <div className="flex items-center gap-2 pl-4 pr-3.5 border-r border-brand-border z-10 bg-brand-surface shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-success"></span>
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-brand-success">LIVE WITHDRAWALS</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex whitespace-nowrap animate-ticker overflow-hidden">
          {announcement && (
            <div className="inline-flex items-center gap-2 mx-6 text-xs font-bold text-brand-primary shrink-0">
              <span>📢 {announcement}</span>
            </div>
          )}
          {tickerItems.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 mx-6 text-xs text-brand-muted shrink-0 transition-colors hover:text-brand-text"
            >
              <span className="text-sm">{item.country}</span>
              <span className="font-semibold text-brand-text">{item.user}</span>
              <span className="text-brand-muted text-[11px]">withdrew</span>
              <span className="font-mono font-bold text-brand-success">{item.amount}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-card border border-brand-border text-brand-text font-medium">
                {item.method}
              </span>
              <span className="text-[10px] text-brand-muted font-medium">{item.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
