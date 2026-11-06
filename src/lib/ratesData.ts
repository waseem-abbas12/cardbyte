export interface GiftCardBrand {
  id: string;
  name: string;
  category: 'Gaming' | 'Shopping' | 'Streaming' | 'Prepaid';
  icon: string;
  badge?: string;
  verificationTime: string;
  countries: {
    code: string;
    name: string;
    flag: string;
    currency: string;
    ratePercent: number; // e.g. 74 means 74% payout
    nominals: number[];
  }[];
}

export interface PayoutMethod {
  id: string;
  name: string;
  network?: string;
  symbol: string;
  icon: string;
  type: 'crypto' | 'fiat';
  fee: string;
  minPayout: number;
}

export const SUPPORTED_PAYOUTS: PayoutMethod[] = [
  { id: 'usdt_trc20', name: 'USDT', network: 'TRC20', symbol: 'USDT', icon: '💎', type: 'crypto', fee: '0.00%', minPayout: 10 },
  { id: 'usdt_bep20', name: 'USDT', network: 'BEP20', symbol: 'USDT', icon: '🟡', type: 'crypto', fee: '0.00%', minPayout: 10 },
  { id: 'btc', name: 'Bitcoin', network: 'BTC', symbol: 'BTC', icon: '₿', type: 'crypto', fee: '0.00%', minPayout: 25 },
  { id: 'sol', name: 'Solana', network: 'SOL', symbol: 'SOL', icon: '🟣', type: 'crypto', fee: '0.00%', minPayout: 10 },
  { id: 'usdc_polygon', name: 'USDC', network: 'Polygon', symbol: 'USDC', icon: '🔷', type: 'crypto', fee: '0.00%', minPayout: 10 },
  { id: 'ngn_bank', name: 'Nigerian Naira (NGN)', network: 'Bank Transfer', symbol: '₦', icon: '🇳🇬', type: 'fiat', fee: '0.00%', minPayout: 5 },
  { id: 'ghs_momo', name: 'Ghanaian Cedi (GHS)', network: 'MoMo / Bank', symbol: 'GH₵', icon: '🇬🇭', type: 'fiat', fee: '0.00%', minPayout: 5 },
  { id: 'usd_wire', name: 'US Dollar (USD)', network: 'Wire / ACH', symbol: '$', icon: '🇺🇸', type: 'fiat', fee: '1.00%', minPayout: 50 },
  { id: 'eur_sepa', name: 'Euro (EUR)', network: 'SEPA Instant', symbol: '€', icon: '🇪🇺', type: 'fiat', fee: '0.50%', minPayout: 20 },
];

export const INITIAL_BRANDS: GiftCardBrand[] = [
  {
    id: 'apple',
    name: 'Apple & iTunes',
    category: 'Shopping',
    icon: '🍎',
    badge: 'Popular',
    verificationTime: '5-15 mins',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 73.0, nominals: [25, 50, 100, 200, 500] },
      { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', ratePercent: 70.0, nominals: [25, 50, 100] },
      { code: 'EU', name: 'Europe', flag: '🇪🇺', currency: 'EUR', ratePercent: 71.0, nominals: [25, 50, 100, 200] },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', ratePercent: 68.0, nominals: [50, 100] }
    ]
  },
  {
    id: 'steam',
    name: 'Steam Wallet',
    category: 'Gaming',
    icon: '🎮',
    badge: 'Instant',
    verificationTime: '2-5 mins',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 75.0, nominals: [20, 50, 100] },
      { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', ratePercent: 72.0, nominals: [100, 200, 500] },
      { code: 'EU', name: 'Europe', flag: '🇪🇺', currency: 'EUR', ratePercent: 73.5, nominals: [20, 50, 100] },
      { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', ratePercent: 74.0, nominals: [25, 50, 100] }
    ]
  },
  {
    id: 'razer',
    name: 'Razer Gold',
    category: 'Gaming',
    icon: '⚡',
    badge: 'High Rate',
    verificationTime: '5-10 mins',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 78.5, nominals: [10, 20, 50, 100] },
      { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', ratePercent: 76.0, nominals: [25, 50, 100] },
      { code: 'GL', name: 'Global', flag: '🌐', currency: 'USD', ratePercent: 77.0, nominals: [50, 100] }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon Cash Card',
    category: 'Shopping',
    icon: '📦',
    badge: 'Hot',
    verificationTime: 'Up to 24h',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 72.0, nominals: [25, 50, 100, 250, 500] },
      { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', ratePercent: 71.0, nominals: [25, 50, 100] },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', ratePercent: 70.0, nominals: [50, 100] }
    ]
  },
  {
    id: 'playstation',
    name: 'PlayStation Network',
    category: 'Gaming',
    icon: '🎯',
    badge: 'Fast',
    verificationTime: '5-15 mins',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 71.0, nominals: [25, 50, 75, 100] },
      { code: 'EU', name: 'Europe', flag: '🇪🇺', currency: 'EUR', ratePercent: 70.0, nominals: [30, 50, 80, 100] },
      { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', ratePercent: 69.5, nominals: [25, 45, 90] }
    ]
  },
  {
    id: 'xbox',
    name: 'Xbox & Game Pass',
    category: 'Gaming',
    icon: '🟢',
    badge: 'Fast',
    verificationTime: '5-15 mins',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 69.0, nominals: [25, 50, 100] },
      { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', ratePercent: 65.0, nominals: [300, 600, 1000] }
    ]
  },
  {
    id: 'googleplay',
    name: 'Google Play',
    category: 'Shopping',
    icon: '▶️',
    badge: 'Up to 72h',
    verificationTime: 'Up to 72h',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 62.0, nominals: [25, 50, 100] },
      { code: 'EU', name: 'Europe', flag: '🇪🇺', currency: 'EUR', ratePercent: 58.0, nominals: [15, 25, 50, 100] }
    ]
  },
  {
    id: 'walmart',
    name: 'Walmart Card',
    category: 'Shopping',
    icon: '🛒',
    badge: 'Physical',
    verificationTime: '15-45 mins',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 65.0, nominals: [50, 100, 200, 500] }
    ]
  },
  {
    id: 'netflix',
    name: 'Netflix Subscription',
    category: 'Streaming',
    icon: '🎬',
    badge: 'Instant',
    verificationTime: '5 mins',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 66.0, nominals: [30, 60, 100] },
      { code: 'EU', name: 'Europe', flag: '🇪🇺', currency: 'EUR', ratePercent: 64.0, nominals: [25, 50] }
    ]
  },
  {
    id: 'roblox',
    name: 'Roblox Points',
    category: 'Gaming',
    icon: '🟥',
    badge: 'Fast',
    verificationTime: '5 mins',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 70.0, nominals: [10, 25, 50] }
    ]
  }
];

export const LIVE_TICKER_ITEMS = [
  { brand: 'Steam 100 USD', price: '75.00 USDT', country: '🇺🇸', change: '+2.1%' },
  { brand: 'Apple iTunes 500 USD', price: '365.00 USDT', country: '🇺🇸', change: '+1.4%' },
  { brand: 'Razer Gold 100 GBP', price: '76.00 GBP', country: '🇬🇧', change: '+3.5%' },
  { brand: 'PlayStation 100 EUR', price: '70.00 EUR', country: '🇪🇺', change: '+0.8%' },
  { brand: 'Amazon 100 USD', price: '72.00 USDT', country: '🇺🇸', change: '+1.9%' },
  { brand: 'Walmart 200 USD', price: '130.00 USDT', country: '🇺🇸', change: '+0.5%' },
  { brand: 'Xbox Game Pass 3M', price: '24.50 USDT', country: '🌐', change: '+2.0%' },
  { brand: 'Steam 500 HKD', price: '46.00 USD', country: '🇭🇰', change: '+1.2%' }
];
