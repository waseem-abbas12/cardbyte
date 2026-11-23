'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface GameKeyPlatform {
  id: string;
  name: string;
  badge: string;
  icon: string;
  rateHint: string;
  popularTitles: string;
  payoutMethods: string;
}

const POPULAR_GAME_KEYS: GameKeyPlatform[] = [
  {
    id: 'steam_key',
    name: 'Steam CD-Keys',
    badge: 'High Demand',
    icon: '🎮',
    rateHint: 'Up to 78%',
    popularTitles: 'Counter-Strike, Cyberpunk, Black Myth: Wukong, Elden Ring',
    payoutMethods: 'USDT, BTC, Solana'
  },
  {
    id: 'ea_sports_fc',
    name: 'EA Sports FC 25 / FC 26',
    badge: 'Trending 🔥',
    icon: '⚽',
    rateHint: 'Up to 82%',
    popularTitles: 'FC 25 Standard & Ultimate Edition, Points Keys',
    payoutMethods: 'Instant USDT (TRC20)'
  },
  {
    id: 'xbox_key',
    name: 'Xbox Live & Game Pass',
    badge: 'Popular',
    icon: '🟢',
    rateHint: 'Up to 75%',
    popularTitles: 'Game Pass Ultimate 1M/3M, Forza Horizon, Halo',
    payoutMethods: 'USDT, Bank Wire'
  },
  {
    id: 'playstation_key',
    name: 'PlayStation Store / PSN',
    badge: 'Top Rate',
    icon: '🎯',
    rateHint: 'Up to 76%',
    popularTitles: 'PS Plus Essential/Extra, Spider-Man 2, God of War',
    payoutMethods: 'USDT, BTC, Fiat'
  },
  {
    id: 'rockstar_gta',
    name: 'Rockstar & GTA VI / GTA V',
    badge: 'Hottest 🔥',
    icon: '⭐',
    rateHint: 'Up to 80%',
    popularTitles: 'Grand Theft Auto V Premium, GTA VI Pre-Orders, Shark Cards',
    payoutMethods: 'USDT (TRC20/BEP20)'
  },
  {
    id: 'nintendo_key',
    name: 'Nintendo eShop',
    badge: 'Fast Audit',
    icon: '🔴',
    rateHint: 'Up to 72%',
    popularTitles: 'Switch Online, Zelda: Tears of the Kingdom, Mario Kart',
    payoutMethods: 'USDT, Solana'
  },
  {
    id: 'ubisoft_key',
    name: 'Ubisoft Connect',
    badge: 'Verified',
    icon: '🌀',
    rateHint: 'Up to 70%',
    popularTitles: 'Assassin\'s Creed Shadows, Rainbow Six Siege, Far Cry',
    payoutMethods: 'USDT, Bank Wire'
  },
  {
    id: 'cod_activision',
    name: 'Call of Duty & Battle.net',
    badge: 'Instant OTC',
    icon: '🎖️',
    rateHint: 'Up to 77%',
    popularTitles: 'Black Ops 6, Modern Warfare III, CP Points',
    payoutMethods: 'USDT, BTC'
  }
];

export default function GameKeysSection() {
  return (
    <section className="py-14 bg-brand-bg relative overflow-hidden" id="gamekeys">
      {/* Background accents */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold tracking-wide uppercase mb-2.5">
              <Gamepad2 className="w-3.5 h-3.5 text-brand-primary" />
              Game Keys & Digital Licenses
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
              <span>Sell Game Keys & Activation Codes</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-brand-success border border-emerald-500/30">
                0% Fees
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-1.5 max-w-2xl">
              Turn unused game bundle keys, Steam inventory codes, Xbox Live codes, and EA Sports activation licenses into instant USDT or Crypto.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="text-xs text-brand-muted hidden sm:inline">
              Verified Key Desk Active
            </span>
            <Link
              href="/sell?category=Gaming"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-xs sm:text-sm font-bold text-brand-text hover:text-brand-primary transition-colors"
            >
              <span>Instant Key Valuation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Game Key Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_GAME_KEYS.map((key) => (
            <div
              key={key.id}
              className="group p-5 rounded-2xl glass-panel border border-brand-border/80 hover:border-brand-primary/50 hover:bg-brand-cardHover transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/10"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-sm">
                    {key.icon}
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/25">
                    {key.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                  {key.name}
                </h3>
                <p className="text-[11px] text-brand-muted mt-1 leading-relaxed line-clamp-2">
                  {key.popularTitles}
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-brand-border/60">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-brand-muted text-[11px]">OTC Buyout:</span>
                  <span className="font-mono font-black text-brand-success text-sm">
                    {key.rateHint}
                  </span>
                </div>

                <Link
                  href={`/sell?brand=${key.id === 'steam_key' ? 'steam' : key.id === 'xbox_key' ? 'xbox' : key.id === 'playstation_key' ? 'playstation' : 'steam'}&keyType=game_key&title=${encodeURIComponent(key.name)}`}
                  className="w-full py-2.5 rounded-xl bg-brand-surface hover:bg-brand-primary border border-brand-border hover:border-brand-primary text-brand-text hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Sell Game Key</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
