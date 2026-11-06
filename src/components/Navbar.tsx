'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Menu, X, Coins, Settings, Search, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or system
    const saved = localStorage.getItem('cardbyte_theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
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
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-brand-text hover:text-brand-primary transition-colors">
              Home
            </Link>
            <Link href="/sell" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors">
              Sell Cards
            </Link>
            <Link href="/rates" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors">
              Rates & Limits
            </Link>
            <Link href="/track" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Track Order
            </Link>
            <Link href="/admin" className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1.5">
              <Settings className="w-3 h-3 text-brand-primary" />
              Client Admin
            </Link>
          </nav>

          {/* Header Action Buttons & Theme Switcher */}
          <div className="hidden sm:flex items-center gap-3.5">
            
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
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
              className="p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-muted"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-brand-surface text-brand-muted hover:text-brand-text border border-brand-border"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-bg border-b border-brand-border px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-text hover:bg-brand-surface"
          >
            Home
          </Link>
          <Link
            href="/sell"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-surface"
          >
            Sell Cards
          </Link>
          <Link
            href="/rates"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-surface"
          >
            Rates & Limits
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-surface"
          >
            Track Order
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-primary hover:bg-brand-surface"
          >
            Client Admin Dashboard
          </Link>
          <div className="pt-2">
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary text-white font-bold"
            >
              Sell Now & Get Paid
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
