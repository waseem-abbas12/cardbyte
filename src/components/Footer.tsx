import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Coins, Send, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050b18] border-t border-brand-border/60 text-brand-muted text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-brand-border/50">
          
          {/* Brand Info (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-blue-400 flex items-center justify-center text-white shadow-md shadow-brand-primary/20">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Cardbyte <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-primary/15 text-brand-primary border border-brand-primary/30">Pro</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed max-w-sm">
              A premier high-speed digital exchange empowering users worldwide to trade gift cards and unused vouchers for cryptocurrencies and fiat cash with bank-grade security.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-card border border-brand-border/80 text-white font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
                PCI-DSS Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-card border border-brand-border/80 text-white font-medium">
                <Lock className="w-3.5 h-3.5 text-brand-primary" />
                256-Bit SSL
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Exchange</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/sell" className="hover:text-white transition-colors">Sell Gift Cards</Link>
              </li>
              <li>
                <Link href="/rates" className="hover:text-white transition-colors">Rates & Limits</Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">Track Transaction</Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-white transition-colors">Valuation Calculator</Link>
              </li>
              <li>
                <Link href="/admin" className="text-brand-primary hover:underline">Client Admin Panel</Link>
              </li>
            </ul>
          </div>

          {/* Supported Payouts */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Payout Rails</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5 text-white/80">
                <span>USDT (TRC20 & BEP20)</span>
              </li>
              <li className="flex items-center gap-1.5 text-white/80">
                <span>Bitcoin (BTC)</span>
              </li>
              <li className="flex items-center gap-1.5 text-white/80">
                <span>Solana (SOL)</span>
              </li>
              <li className="flex items-center gap-1.5 text-white/80">
                <span>USD / EUR Bank Wire</span>
              </li>
              <li className="flex items-center gap-1.5 text-white/80">
                <span>NGN Bank & GHS MoMo</span>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Security & Help</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="text-brand-muted hover:text-white transition-colors cursor-pointer">AML & KYC Policy</span>
              </li>
              <li>
                <span className="text-brand-muted hover:text-white transition-colors cursor-pointer">Terms of Service</span>
              </li>
              <li>
                <span className="text-brand-muted hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="text-brand-muted hover:text-white transition-colors cursor-pointer">Anti-Fraud FAQ</span>
              </li>
              <li className="pt-2">
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primaryHover"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Support</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <p>© 2026 Cardbyte. Built for maximum security & global liquidity. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Server Status: <b className="text-brand-success">Operational</b></span>
            <span>Latency: <b className="font-mono text-white">24ms</b></span>
          </div>
        </div>

      </div>
    </footer>
  );
}
