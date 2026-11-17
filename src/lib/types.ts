export interface CountryRate {
  code: string;
  name: string;
  flag: string;
  currency: string;
  ratePercent: number; // default/e-code rate
  rateEcode: number;   // E-Code / Digital rate
  ratePhysical: number; // Physical Card with receipt rate
  nominals: number[];
}

export interface GiftCardBrand {
  id: string;
  name: string;
  category: 'Gaming' | 'Shopping' | 'Streaming' | 'Prepaid';
  icon: string;
  badge?: string;
  verificationTime: string;
  enabled: boolean;
  order?: number;
  countries: CountryRate[];
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
  enabled: boolean;
  order?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  enabled: boolean;
}

export interface LayoutSection {
  id: string; // 'ticker', 'hero', 'calculator', 'brands', 'trust', 'faqs', 'cta'
  name: string;
  description: string;
  order: number;
  enabled: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  announcementTicker: string;
  telegramSupport: string;
  whatsappSupport: string;
  supportEmail: string;
  activeTradersCount: string;
  volumeTraded: string;
  customerSatisfaction: string;
  avgPayoutTime: string;
  autoVerification: boolean;
  heroTitle: string;
  heroSubtitle: string;
}

export interface OrderMessage {
  id: string;
  sender: 'USER' | 'ADMIN';
  message: string;
  timestamp: string;
}

export interface OrderItem {
  id: string;
  trackingCode: string;
  brandId: string;
  brandName: string;
  countryCode: string;
  cardType: 'ECODE' | 'PCARD';
  nominal: number;
  quantity: number;
  ratePercent: number;
  totalCardValue: number;
  payoutAmount: number;
  payoutCurrency: string;
  payoutAddress: string;
  cardCodes: string[];
  cardPin?: string;
  receiptNote?: string;
  receiptImages: string[];
  status: 'PENDING' | 'VERIFYING' | 'COMPLETED' | 'REJECTED';
  txHash?: string;
  rejectionReason?: string;
  messages: OrderMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformNotification {
  id: string;
  type: 'RATE' | 'ORDER' | 'SYSTEM' | 'WALLET' | 'BRAND' | 'LAYOUT';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface UserWalletConfig {
  defaultRail: string;
  usdtTrc20?: string;
  usdtBep20?: string;
  btcAddress?: string;
  solAddress?: string;
  bankDetails?: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    routingOrIban?: string;
  };
  momoDetails?: {
    provider: string;
    phone: string;
  };
  balanceUsd?: number;
  isConfigured: boolean;
  updatedAt?: string;
}
