'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  Menu, 
  X, 
  Coins, 
  Settings, 
  Search, 
  Sun, 
  Moon, 
  Wallet, 
  Bell, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { PlatformNotification } from '@/lib/ratesData';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [hasConfiguredWallet, setHasConfiguredWallet] = useState(false);
  const [headerPages, setHeaderPages] = useState<{ slug: string; title: string }[]>([]);
  
  // Notifications
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage
    const saved = localStorage.getItem('cardbyte_theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
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

  return (
    <header className="sticky top-0 z-50 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-brand-text flex items-center gap-1.5">
                Cardbyte <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/25">Pro</span>
              </span>
              <span className="text-[10px] text-brand-muted -mt-1 font-medium">Digital Exchange</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <Link href="/" className="text-sm font-semibold text-brand-text hover:text-brand-primary transition-colors">
              Home
            </Link>
            <Link href="/sell" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors">
              Sell Cards
            </Link>
            <Link href="/rates" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors">
              Rates & Limits
            </Link>
            <Link href="/wallet" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet</span>
              {hasConfiguredWallet ? (
                <span className="w-2 h-2 rounded-full bg-brand-success"></span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">Setup</span>
              )}
            </Link>
            <Link href="/track" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Track Order
            </Link>
            {headerPages.map(p => (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors"
              >
                {p.title}
              </Link>
            ))}
            <Link href="/admin" className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1.5">
              <Settings className="w-3 h-3 text-brand-primary" />
              Client Admin
            </Link>
          </nav>

          {/* Header Action Buttons, Alerts & Theme Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors relative cursor-pointer"
                title="Platform Notifications"
                aria-label="Platform Notifications"
              >
                <Bell className="w-4 h-4 text-brand-muted" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel border border-brand-border shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-border">
                    <span className="text-xs font-bold text-brand-text">Live Platform Alerts</span>
                    <span className="text-[10px] text-brand-primary font-semibold">Real-Time</span>
                  </div>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-brand-muted text-center py-4">No recent alerts</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="text-xs p-2 rounded-xl bg-brand-surface border border-brand-border space-y-0.5">
                          <div className="font-bold text-brand-text flex items-center justify-between">
                            <span className="truncate">{n.title}</span>
                            <span className="text-[10px] text-brand-muted shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-brand-muted leading-tight">{n.message}</p>
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
              className="p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-muted" />}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-brand-muted bg-brand-surface px-3 py-1.5 rounded-xl border border-brand-border">
              <ShieldCheck className="w-4 h-4 text-brand-success" />
              <span className="font-medium">DSS Verified</span>
            </div>

            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-bold shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
            >
              <span>Sell Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-muted cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-brand-surface text-brand-muted hover:text-brand-text border border-brand-border cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-brand-border bg-brand-bg px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-text hover:bg-brand-surface"
          >
            Home
          </Link>
          <Link
            href="/sell"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-text hover:bg-brand-surface"
          >
            Sell Cards
          </Link>
          <Link
            href="/rates"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-text hover:bg-brand-surface"
          >
            Rates & Limits
          </Link>
          <Link
            href="/wallet"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-text hover:bg-brand-surface flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet & Escrow
            </span>
            {hasConfiguredWallet ? (
              <span className="text-xs font-bold text-brand-success">Active</span>
            ) : (
              <span className="text-xs font-bold text-amber-500">Setup</span>
            )}
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-text hover:bg-brand-surface"
          >
            Track Order
          </Link>
          {headerPages.map(p => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-text hover:bg-brand-surface"
            >
              {p.title}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-primary hover:bg-brand-surface"
          >
            Client Admin Panel
          </Link>

          <div className="pt-2">
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-brand-primary text-white text-center font-bold block"
            >
              Start Instant Trade
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
