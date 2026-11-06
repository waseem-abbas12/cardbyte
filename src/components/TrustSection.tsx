import React from 'react';
import { ShieldCheck, Zap, Headphones, Globe2, CheckCircle, Lock, Cpu, DollarSign } from 'lucide-react';

export default function TrustSection() {
  const steps = [
    {
      num: '01',
      title: 'Calculate Valuation',
      desc: 'Pick your card brand, country, and nominal value to see your guaranteed live payout quotation.',
      icon: <DollarSign className="w-6 h-6 text-brand-primary" />
    },
    {
      num: '02',
      title: 'Submit Card & PIN',
      desc: 'Enter your digital e-code or upload clear photos of physical cards and store purchase receipts.',
      icon: <Lock className="w-6 h-6 text-brand-primary" />
    },
    {
      num: '03',
      title: 'Rapid Verification',
      desc: 'Our automated balance check and operator desk confirm the card authenticity within minutes.',
      icon: <Cpu className="w-6 h-6 text-brand-primary" />
    },
    {
      num: '04',
      title: 'Direct Payout',
      desc: 'Receive your funds instantly in Crypto (USDT, BTC, SOL) or fiat bank transfer to your account.',
      icon: <Zap className="w-6 h-6 text-brand-success" />
    }
  ];

  const features = [
    {
      icon: <ShieldCheck className="w-7 h-7 text-brand-primary" />,
      title: 'DSS & AML Compliant',
      desc: 'End-to-end encrypted card transactions, identity protection, and strict anti-money laundering checks guarantee safe trading.'
    },
    {
      icon: <Zap className="w-7 h-7 text-brand-success" />,
      title: 'High-Speed Automated Settlement',
      desc: 'Orders are processed via automated matching engines with clear fee breakdowns, minimizing wait times and maximizing your return.'
    },
    {
      icon: <Globe2 className="w-7 h-7 text-blue-400" />,
      title: 'Multi-Currency Global Liquidity',
      desc: 'Whether you need USDT on TRC20, Bitcoin, Solana, or local bank fiat in USD, EUR, NGN, or GHS, we have full liquidity desks.'
    },
    {
      icon: <Headphones className="w-7 h-7 text-amber-400" />,
      title: '24/7 Professional Support',
      desc: 'Dedicated round-the-clock dispute handlers, live Telegram channels, and transaction follow-ups to keep your mind at ease.'
    }
  ];

  return (
    <section className="py-20 bg-brand-bg relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Live Performance Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl glass-panel border border-brand-border mb-20">
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">18,500+</div>
            <div className="text-xs sm:text-sm text-brand-muted mt-1 font-medium">Active Traders</div>
          </div>
          <div className="text-center p-3 border-l border-brand-border/60">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-success font-mono">$14.2M+</div>
            <div className="text-xs sm:text-sm text-brand-muted mt-1 font-medium">Total Volume Traded</div>
          </div>
          <div className="text-center p-3 border-l border-brand-border/60">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-primary font-mono">5 - 15m</div>
            <div className="text-xs sm:text-sm text-brand-muted mt-1 font-medium">Avg Payout Time</div>
          </div>
          <div className="text-center p-3 border-l border-brand-border/60">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">99.8%</div>
            <div className="text-xs sm:text-sm text-brand-muted mt-1 font-medium">Customer Satisfaction</div>
          </div>
        </div>

        {/* How It Works Flow */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-brand-primary tracking-widest uppercase px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
            SIMPLE 4-STEP WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            How Cardbyte Works
          </h2>
          <p className="text-brand-muted text-sm sm:text-base max-w-xl mx-auto mt-2">
            Turning your unused gift cards into liquid crypto or cash takes less than three minutes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 text-left">
            {steps.map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl glass-panel border border-brand-border flex flex-col justify-between group hover:border-brand-primary/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-extrabold font-mono text-brand-muted/40 group-hover:text-brand-primary transition-colors">
                      {s.num}
                    </span>
                    <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border">
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {features.map((f, idx) => (
            <div key={idx} className="p-7 rounded-2xl glass-panel border border-brand-border flex items-start gap-5 hover:border-brand-primary/40 transition-all">
              <div className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border shrink-0 shadow-lg">
                {f.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
