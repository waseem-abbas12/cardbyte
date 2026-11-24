'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

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
    name: 'EA Sports FC 25 / 26',
    badge: 'Trending 🔥',
    icon: '⚽',
    rateHint: 'Up to 82%',
    popularTitles: 'FC 25 Standard & Ultimate, Points Keys',
    payoutMethods: 'Instant USDT (TRC20)'
  },
  {
    id: 'xbox_key',
    name: 'Xbox Live & Pass',
    badge: 'Popular',
    icon: '🟢',
    rateHint: 'Up to 75%',
    popularTitles: 'Game Pass Ultimate, Forza Horizon, Halo',
    payoutMethods: 'USDT, Bank Wire'
  },
  {
    id: 'playstation_key',
    name: 'PlayStation / PSN',
    badge: 'Top Rate',
    icon: '🎯',
    rateHint: 'Up to 76%',
    popularTitles: 'PS Plus Essential, Spider-Man 2, God of War',
    payoutMethods: 'USDT, BTC, Fiat'
  },
  {
    id: 'rockstar_gta',
    name: 'Rockstar & GTA V/VI',
    badge: 'Hottest 🔥',
    icon: '⭐',
    rateHint: 'Up to 80%',
    popularTitles: 'GTA V Premium, GTA VI Pre-Orders, Shark Cards',
    payoutMethods: 'USDT (TRC20/BEP20)'
  },
  {
    id: 'nintendo_key',
    name: 'Nintendo eShop',
    badge: 'Fast Audit',
    icon: '🔴',
    rateHint: 'Up to 72%',
    popularTitles: 'Switch Online, Zelda, Mario Kart',
    payoutMethods: 'USDT, Solana'
  },
  {
    id: 'ubisoft_key',
    name: 'Ubisoft Connect',
    badge: 'Verified',
    icon: '🌀',
    rateHint: 'Up to 70%',
    popularTitles: 'Assassin\'s Creed Shadows, Rainbow Six',
    payoutMethods: 'USDT, Bank Wire'
  },
  {
    id: 'cod_activision',
    name: 'Call of Duty / Battle.net',
    badge: 'Instant OTC',
    icon: '🎖️',
    rateHint: 'Up to 77%',
    popularTitles: 'Black Ops 6, Modern Warfare III, CP Points',
    payoutMethods: 'USDT, BTC'
  }
];

export default function GameKeysSection() {
  const { t } = useLanguage();

  return (
    <section className="py-12 sm:py-14 bg-brand-bg relative overflow-hidden" id="gamekeys">
      {/* Background accents */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold tracking-wide uppercase mb-2">
              <Gamepad2 className="w-3.5 h-3.5 text-brand-primary" />
              {t('gameKeysBadge')}
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
              <span>{t('gameKeysTitle')}</span>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-brand-success border border-emerald-500/30">
                0% Fees
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-1 max-w-2xl leading-relaxed">
              {t('gameKeysSubtitle')}
            </p>
          </div>

          <div className="mt-3 md:mt-0 flex items-center gap-3">
            <Link
              href="/sell?category=Gaming"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-xs sm:text-sm font-bold text-brand-text hover:text-brand-primary transition-colors"
            >
              <span>{t('viewRatesLimits')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Compact 2-Column Mobile Grid Matching CardGrid Proportions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
          {POPULAR_GAME_KEYS.map((key) => {
            const sellUrl = `/sell?brand=${key.id === 'steam_key' ? 'steam' : key.id === 'xbox_key' ? 'xbox' : key.id === 'playstation_key' ? 'playstation' : 'steam'}&keyType=game_key&title=${encodeURIComponent(key.name)}`;

            return (
              <Link
                key={key.id}
                href={sellUrl}
                className="group p-3.5 sm:p-4 rounded-2xl glass-panel border border-brand-border/80 hover:border-brand-primary/50 hover:bg-brand-cardHover transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/10"
              >
                <div>
                  <div className="flex items-start justify-between mb-2.5 sm:mb-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-lg sm:text-xl group-hover:scale-105 transition-transform shadow-sm">
                      {key.icon}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/25 truncate max-w-[85px] sm:max-w-none">
                      {key.badge}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-1">
                    {key.name}
                  </h3>
                  <div className="text-[10px] sm:text-[11px] text-brand-muted mt-0.5 truncate">
                    {key.popularTitles}
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] text-brand-muted font-medium">Buyout Rate</span>
                    <span className="text-xs sm:text-sm font-mono font-black text-brand-success">
                      {key.rateHint}
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-brand-surface text-brand-muted border border-brand-border group-hover:border-brand-primary/40 group-hover:text-brand-primary font-medium transition-colors">
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
