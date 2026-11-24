'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  Menu, 
  X, 
  Coins, 
  Search, 
  Sun, 
  Moon, 
  Wallet, 
  Bell, 
  Globe,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { PlatformNotification } from '@/lib/ratesData';
import { useLanguage, LANGUAGES, LanguageCode } from '@/lib/i18n';

export default function Navbar() {
  const { currentLang, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [hasConfiguredWallet, setHasConfiguredWallet] = useState(false);
  const [headerPages, setHeaderPages] = useState<{ slug: string; title: string }[]>([]);
  
  // Language selector state
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check initial theme from localStorage (Default to Dark Theme)
    const saved = localStorage.getItem('cardbyte_theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Check wallet status
    try {
      const wallet = localStorage.getItem('cardbyte_user_wallet');
      if (wallet) {
        const parsed = JSON.parse(wallet);
        if (parsed.isConfigured) setHasConfiguredWallet(true);
      }
    } catch {}

    // Fetch live notifications and site settings
    fetch('/api/content')
      .then(res => res.json())
      .then(json => {
        if (json?.data?.notifications) {
          setNotifications(json.data.notifications.slice(0, 5));
        }
        if (json?.data?.customPages) {
          const hPages = json.data.customPages
            .filter((p: any) => p.published && p.showInHeader)
            .map((p: any) => ({ slug: p.slug, title: p.title }));
          setHeaderPages(hPages);
        }
      })
      .catch(() => {});

    // Click outside handler for dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cardbyte_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cardbyte_theme', 'dark');
      setIsDark(true);
    }
  };

  const formatNavTitle = (title: string, slug?: string) => {
    if (slug === 'how-it-works') return t('howItWorks') || 'How It Works';
    if (slug === 'about-us' || slug === 'about') return t('about') || 'About';
    if (title.includes(':')) return title.split(':')[0].trim();
    if (title.length > 16) return title.slice(0, 14) + '...';
    return title;
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-brand-text flex items-center gap-1 sm:gap-1.5">
                Cardbyte <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/25">Pro</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-brand-muted -mt-0.5 sm:-mt-1 font-medium">Digital Exchange</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-5">
            <Link href="/" className="text-sm font-semibold text-brand-text hover:text-brand-primary transition-colors whitespace-nowrap shrink-0">
              {t('home')}
            </Link>
            <Link href="/sell" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors whitespace-nowrap shrink-0">
              {t('sellGiftCards')}
            </Link>
            <Link href="/buy" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors whitespace-nowrap shrink-0 flex items-center gap-1">
              <span>{t('buyGiftCards')}</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">BULK</span>
            </Link>
            <Link href="/#gamekeys" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors whitespace-nowrap shrink-0 flex items-center gap-1">
              <span>{t('gameKeys')}</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/25">NEW</span>
            </Link>
            <Link href="/rates" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors whitespace-nowrap shrink-0">
              {t('ratesLimits')}
            </Link>
            <Link href="/account/referrals" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors whitespace-nowrap shrink-0 flex items-center gap-1">
              <span>{t('affiliate')}</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-brand-success border border-emerald-500/30">0.25%</span>
            </Link>
            <Link href="/wallet" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              <span>{t('wallet')}</span>
              {hasConfiguredWallet ? (
                <span className="w-2 h-2 rounded-full bg-brand-success"></span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">{t('walletSetup')}</span>
              )}
            </Link>
            <Link href="/track" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>{t('track')}</span>
            </Link>
            {headerPages.slice(0, 2).map(p => (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors whitespace-nowrap shrink-0 max-w-[130px] truncate"
                title={p.title}
              >
                {formatNavTitle(p.title, p.slug)}
              </Link>
            ))}
          </nav>

          {/* Header Action Utilities: Visible on ALL Screens (Mobile & Desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Language & Region Selector (Always Visible on Top Header) */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-brand-text hover:border-brand-primary transition-colors cursor-pointer"
                title={t('selectLanguage')}
                aria-label={t('selectLanguage')}
              >
                <span className="text-sm leading-none">{currentLang.flag}</span>
                <span className="text-[11px] sm:text-xs tracking-wide">{currentLang.code.toUpperCase()}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-60 sm:w-64 max-h-80 overflow-y-auto rounded-2xl bg-brand-card/95 backdrop-blur-xl border border-brand-border shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2.5 py-1.5 border-b border-brand-border/60 mb-1">
                    <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">{t('selectLanguage')}</span>
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                        currentLang.code === l.code 
                          ? 'bg-brand-primary/15 text-brand-primary font-bold border border-brand-primary/30' 
                          : 'text-brand-text hover:bg-brand-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{l.flag}</span>
                        <div className="flex flex-col">
                          <span className="leading-tight">{l.name}</span>
                          <span className="text-[10px] text-brand-muted">{l.nativeName}</span>
                        </div>
                      </div>
                      {currentLang.code === l.code && (
                        <span className="text-xs text-brand-primary font-black">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell Icon (Always Visible on Top Header) */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-1.5 sm:p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors relative cursor-pointer"
                title={t('notifications')}
                aria-label={t('notifications')}
              >
                <Bell className="w-4 h-4 text-brand-muted" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-brand-card/95 backdrop-blur-xl border border-brand-border shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-border">
                    <span className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-brand-primary" />
                      {t('notifications')}
                    </span>
                    <span className="text-[10px] text-brand-primary font-semibold px-1.5 py-0.5 rounded bg-brand-primary/10">Real-Time</span>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-brand-muted text-center py-4">No recent alerts</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="text-xs p-2.5 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                          <div className="font-bold text-brand-text flex items-center justify-between">
                            <span className="truncate pr-1">{n.title}</span>
                            <span className="text-[10px] text-brand-muted shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-brand-muted leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-muted" />}
            </button>

            {/* DSS Verified Badge (Desktop only) */}
            <div className="hidden 2xl:flex items-center gap-1.5 text-xs text-brand-muted bg-brand-surface px-2.5 py-1.5 rounded-xl border border-brand-border">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
              <span className="font-medium text-[11px]">DSS Verified</span>
            </div>

            {/* Sell Button (Hidden on small mobile, visible on sm and up) */}
            <Link
              href="/sell"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              <span>{t('sellNow') || 'Sell Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 rounded-xl bg-brand-surface text-brand-muted hover:text-brand-text border border-brand-border cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-brand-border bg-brand-bg px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface"
          >
            {t('home')}
          </Link>
          <Link
            href="/sell"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface"
          >
            {t('sellGiftCards')}
          </Link>
          <Link
            href="/buy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface flex items-center justify-between"
          >
            <span>{t('buyGiftCards')}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">BULK</span>
          </Link>
          <Link
            href="/#gamekeys"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface flex items-center justify-between"
          >
            <span>{t('gameKeys')}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">NEW</span>
          </Link>
          <Link
            href="/rates"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface"
          >
            {t('ratesLimits')}
          </Link>
          <Link
            href="/account/referrals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface flex items-center justify-between"
          >
            <span>{t('affiliate')}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-success/15 text-brand-success">0.25%</span>
          </Link>
          <Link
            href="/wallet"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {t('wallet')}
            </span>
            {hasConfiguredWallet ? (
              <span className="text-xs font-bold text-brand-success">Active</span>
            ) : (
              <span className="text-xs font-bold text-amber-500">{t('walletSetup')}</span>
            )}
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface"
          >
            {t('track')}
          </Link>
          {headerPages.map(p => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface"
            >
              {formatNavTitle(p.title, p.slug)}
            </Link>
          ))}

          <div className="pt-2">
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-center font-bold text-sm block shadow-md shadow-brand-primary/20"
            >
              {t('startSellingNow')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
