import fs from 'fs';
import path from 'path';
import { 
  GiftCardBrand, 
  PayoutMethod, 
  FaqItem, 
  LayoutSection, 
  SiteSettings, 
  OrderItem, 
  OrderMessage, 
  PlatformNotification,
  CountryRate
} from './types';
import { INITIAL_BRANDS, SUPPORTED_PAYOUTS } from './ratesData';

export interface DatabaseSchema {
  brands: GiftCardBrand[];
  payoutRails: PayoutMethod[];
  faqs: FaqItem[];
  layoutSections: LayoutSection[];
  siteSettings: SiteSettings;
  orders: OrderItem[];
  notifications: PlatformNotification[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    order: 1,
    enabled: true,
    question: 'How fast do I get paid after submitting my gift card?',
    answer: 'Most digital e-codes (such as Steam, Apple, Razer Gold, and Xbox) are verified within 5 to 15 minutes. Once verified, crypto or bank payouts are dispatched automatically.'
  },
  {
    id: 'faq-2',
    order: 2,
    enabled: true,
    question: 'Why do physical cards often have higher payout rates than e-codes?',
    answer: 'Physical cards accompanied by official store purchase cash receipts have verified origin and minimal risk of revocation, allowing our OTC desk to offer higher wholesale buyback margins.'
  },
  {
    id: 'faq-3',
    order: 3,
    enabled: true,
    question: 'What payout methods do you support?',
    answer: 'We support instant crypto payouts in USDT (TRC20, BEP20), Bitcoin (BTC), Solana (SOL), and USDC, as well as direct local bank transfers in USD, EUR, Nigerian Naira (NGN), and Ghanaian Cedi (GHS).'
  },
  {
    id: 'faq-4',
    order: 4,
    enabled: true,
    question: 'Can I sell physical cards with store receipts?',
    answer: 'Yes! Select "Physical Card (PCARD)" and upload a clear photo showing the scratch-off PIN alongside the original store cash receipt.'
  },
  {
    id: 'faq-5',
    order: 5,
    enabled: true,
    question: 'How does escrow protection guarantee my trade funds?',
    answer: 'When you submit your trade, the calculated payout value is locked in our automated matching pool. Upon operator card verification, your funds are automatically released to your destination address.'
  }
];

const DEFAULT_LAYOUT: LayoutSection[] = [
  { id: 'ticker', name: 'Live Rates Ticker Bar', description: 'Top animated ticker showing real-time market rate movements', order: 1, enabled: true },
  { id: 'hero', name: 'Hero Header & Value Proposition', description: 'Main headline, dynamic CTA buttons, and trust badges', order: 2, enabled: true },
  { id: 'calculator', name: 'Instant Valuation Calculator', description: 'Interactive quoting engine for E-codes and Physical cards', order: 3, enabled: true },
  { id: 'brands', name: 'Supported Brands Grid', description: 'Visual showcase of all active gift cards with buy rates', order: 4, enabled: true },
  { id: 'trust', name: '4-Step Workflow & Security Section', description: 'How it works explanation and platform liquidity statistics', order: 5, enabled: true },
  { id: 'faqs', name: 'Frequently Asked Questions', description: 'Collapsible accordion answering common seller questions', order: 6, enabled: true },
  { id: 'cta', name: 'Bottom Action Banner', description: 'Final conversion banner leading to sell portal', order: 7, enabled: true }
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Cardbyte Pro',
  tagline: 'Leading Global Gift Card & Crypto Exchange',
  announcementTicker: '🔥 High demand: Steam US Physical at 80% • Apple iTunes E-Code instant verification • 0% withdrawal fees',
  telegramSupport: 'https://t.me/cardbyte_support',
  whatsappSupport: '+1 (234) 567-8900',
  supportEmail: 'support@cardbyte.io',
  activeTradersCount: '18,500+',
  volumeTraded: '$14.2M+',
  customerSatisfaction: '99.8%',
  avgPayoutTime: '5 - 15m',
  autoVerification: false,
  heroTitle: 'Sell Gift Cards at the Best Rates: Fast, Easy, Reliable.',
  heroSubtitle: 'Turn your unused gift cards into USDT, Bitcoin, or instant local cash. Live algorithmic valuations, zero surprise deductions, and direct settlement.'
};

function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const initialBrands = INITIAL_BRANDS.map((b, i) => ({
    ...b,
    order: i + 1,
    enabled: b.enabled !== undefined ? b.enabled : true
  }));

  const initialPayouts = SUPPORTED_PAYOUTS.map((p, i) => ({
    ...p,
    order: i + 1,
    enabled: true
  }));

  const initialOrders: OrderItem[] = [
    {
      id: 'ord-sample-1',
      trackingCode: 'CB-94821',
      brandId: 'apple',
      brandName: 'Apple & iTunes',
      countryCode: 'US',
      cardType: 'ECODE',
      nominal: 100,
      quantity: 2,
      ratePercent: 73.0,
      totalCardValue: 200,
      payoutAmount: 146.0,
      payoutCurrency: 'USDT (TRC20)',
      payoutAddress: 'TJYe5gWq94k7vY2k4XvYP39z...',
      cardCodes: ['XJ92-K827-PL01', 'XJ92-K827-PL02'],
      cardPin: '4821',
      receiptNote: 'Digital email gift receipt',
      receiptImages: [],
      status: 'COMPLETED',
      txHash: '0x8f9b23c7a10294e5b6c8d7e4f3a2b1c0987654321fedcba0123456789abcdef0',
      messages: [
        { id: 'm-1', sender: 'ADMIN', message: 'Card balance confirmed ($100 x 2). Payout initiated.', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 'm-2', sender: 'USER', message: 'Received the USDT on TRC20, thank you so much!', timestamp: new Date(Date.now() - 3000000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'ord-sample-2',
      trackingCode: 'CB-47219',
      brandId: 'steam',
      brandName: 'Steam Wallet',
      countryCode: 'US',
      cardType: 'PCARD',
      nominal: 50,
      quantity: 1,
      ratePercent: 80.0,
      totalCardValue: 50,
      payoutAmount: 40.0,
      payoutCurrency: 'USDT (TRC20)',
      payoutAddress: 'TY19skA7L9q2k4XvYL28q...',
      cardCodes: ['STM-8849-2910-K912'],
      receiptNote: 'Purchased with cash at Walmart',
      receiptImages: ['walmart_receipt_sample.jpg'],
      status: 'VERIFYING',
      messages: [
        { id: 'm-3', sender: 'ADMIN', message: 'Verification in progress: reviewing physical receipt and barcode.', timestamp: new Date(Date.now() - 1800000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  const initialNotifs: PlatformNotification[] = [
    {
      id: 'notif-1',
      type: 'SYSTEM',
      title: 'Database & CMS Engine Online',
      message: 'Cardbyte Headless Backend Architecture initialized with zero-downtime persistence.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'notif-2',
      type: 'RATE',
      title: 'Steam Rates Configured',
      message: 'Physical Steam Cards (US) set to 80.0% buyback yield.',
      timestamp: new Date().toISOString()
    }
  ];

  const db: DatabaseSchema = {
    brands: initialBrands,
    payoutRails: initialPayouts,
    faqs: DEFAULT_FAQS,
    layoutSections: DEFAULT_LAYOUT,
    siteSettings: DEFAULT_SETTINGS,
    orders: initialOrders,
    notifications: initialNotifs
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  return db;
}

// In-memory cache with disk sync
let memDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (memDb) return memDb;

  if (!fs.existsSync(DB_FILE)) {
    memDb = initDatabase();
    return memDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Ensure all collections exist
    if (!parsed.brands || !parsed.brands.length) parsed.brands = INITIAL_BRANDS;
    if (!parsed.payoutRails || !parsed.payoutRails.length) parsed.payoutRails = SUPPORTED_PAYOUTS.map((p, i) => ({ ...p, order: i + 1, enabled: true }));
    if (!parsed.faqs || !parsed.faqs.length) parsed.faqs = DEFAULT_FAQS;
    if (!parsed.layoutSections || !parsed.layoutSections.length) parsed.layoutSections = DEFAULT_LAYOUT;
    if (!parsed.siteSettings) parsed.siteSettings = DEFAULT_SETTINGS;
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.notifications) parsed.notifications = [];

    memDb = parsed;
    return memDb as DatabaseSchema;
  } catch (err) {
    console.error('Database read error, reinitializing:', err);
    memDb = initDatabase();
    return memDb;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  memDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database write error:', err);
  }
}

export function addAuditNotification(type: PlatformNotification['type'], title: string, message: string): PlatformNotification {
  const db = getDatabase();
  const notif: PlatformNotification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);
  if (db.notifications.length > 100) {
    db.notifications = db.notifications.slice(0, 100);
  }
  saveDatabase(db);
  return notif;
}

// ==========================================
// 1. BRANDS & RATES MANAGEMENT (FULL CRUD)
// ==========================================

export function createBrand(brandData: Omit<GiftCardBrand, 'order'>): GiftCardBrand {
  const db = getDatabase();
  const newOrder = db.brands.length + 1;
  const brand: GiftCardBrand = {
    ...brandData,
    order: newOrder,
    enabled: brandData.enabled !== undefined ? brandData.enabled : true
  };
  db.brands.push(brand);
  addAuditNotification('BRAND', `New Brand Added: ${brand.name}`, `Added to catalog in category ${brand.category}.`);
  saveDatabase(db);
  return brand;
}

export function updateBrand(id: string, updates: Partial<GiftCardBrand>): GiftCardBrand | null {
  const db = getDatabase();
  const index = db.brands.findIndex(b => b.id === id);
  if (index === -1) return null;

  db.brands[index] = { ...db.brands[index], ...updates };
  addAuditNotification('BRAND', `Brand Updated: ${db.brands[index].name}`, `Configuration and rates updated.`);
  saveDatabase(db);
  return db.brands[index];
}

export function deleteBrand(id: string): boolean {
  const db = getDatabase();
  const brand = db.brands.find(b => b.id === id);
  if (!brand) return false;

  db.brands = db.brands.filter(b => b.id !== id);
  addAuditNotification('BRAND', `Brand Removed: ${brand.name}`, `Permanently deleted from catalog.`);
  saveDatabase(db);
  return true;
}

export function addCountryToBrand(brandId: string, country: CountryRate): boolean {
  const db = getDatabase();
  const brand = db.brands.find(b => b.id === brandId);
  if (!brand) return false;

  const exists = brand.countries.find(c => c.code === country.code);
  if (exists) {
    Object.assign(exists, country);
  } else {
    brand.countries.push(country);
  }
  addAuditNotification('RATE', `Region Configured: ${brand.name} (${country.code})`, `E-Code: ${country.rateEcode}% | Physical: ${country.ratePhysical}%`);
  saveDatabase(db);
  return true;
}

// ==========================================
// 2. PAYOUT RAILS MANAGEMENT (FULL CRUD)
// ==========================================

export function createPayoutRail(rail: Omit<PayoutMethod, 'order'>): PayoutMethod {
  const db = getDatabase();
  const newRail: PayoutMethod = {
    ...rail,
    order: db.payoutRails.length + 1,
    enabled: rail.enabled !== undefined ? rail.enabled : true
  };
  db.payoutRails.push(newRail);
  addAuditNotification('SYSTEM', `New Payout Rail: ${newRail.name}`, `Added with min payout $${newRail.minPayout} and fee ${newRail.fee}.`);
  saveDatabase(db);
  return newRail;
}

export function updatePayoutRail(id: string, updates: Partial<PayoutMethod>): PayoutMethod | null {
  const db = getDatabase();
  const index = db.payoutRails.findIndex(p => p.id === id);
  if (index === -1) return null;

  db.payoutRails[index] = { ...db.payoutRails[index], ...updates };
  addAuditNotification('SYSTEM', `Payout Rail Updated: ${db.payoutRails[index].name}`, `Settings updated.`);
  saveDatabase(db);
  return db.payoutRails[index];
}

export function deletePayoutRail(id: string): boolean {
  const db = getDatabase();
  db.payoutRails = db.payoutRails.filter(p => p.id !== id);
  saveDatabase(db);
  return true;
}

// ==========================================
// 3. FAQS MANAGEMENT (FULL CRUD & REORDER)
// ==========================================

export function createFaq(question: string, answer: string): FaqItem {
  const db = getDatabase();
  const newFaq: FaqItem = {
    id: `faq-${Date.now()}`,
    question,
    answer,
    order: db.faqs.length + 1,
    enabled: true
  };
  db.faqs.push(newFaq);
  addAuditNotification('SYSTEM', `FAQ Created`, question);
  saveDatabase(db);
  return newFaq;
}

export function updateFaq(id: string, updates: Partial<FaqItem>): FaqItem | null {
  const db = getDatabase();
  const index = db.faqs.findIndex(f => f.id === id);
  if (index === -1) return null;

  db.faqs[index] = { ...db.faqs[index], ...updates };
  saveDatabase(db);
  return db.faqs[index];
}

export function deleteFaq(id: string): boolean {
  const db = getDatabase();
  db.faqs = db.faqs.filter(f => f.id !== id);
  saveDatabase(db);
  return true;
}

// ==========================================
// 4. HOMEPAGE LAYOUT SECTIONS & REORDERING
// ==========================================

export function updateLayoutSections(sections: LayoutSection[]): LayoutSection[] {
  const db = getDatabase();
  db.layoutSections = sections.map((s, idx) => ({ ...s, order: idx + 1 }));
  addAuditNotification('LAYOUT', 'Homepage Layout Rearranged', `Updated section positions and visibility.`);
  saveDatabase(db);
  return db.layoutSections;
}

// ==========================================
// 5. SITE SETTINGS & BRANDING
// ==========================================

export function updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const db = getDatabase();
  db.siteSettings = { ...db.siteSettings, ...settings };
  addAuditNotification('SYSTEM', 'Global Settings Updated', `Branding, metrics, and contacts saved.`);
  saveDatabase(db);
  return db.siteSettings;
}

// ==========================================
// 6. ORDERS & ESCROW LIFECYCLE
// ==========================================

export function createOrderInDb(params: Omit<OrderItem, 'id' | 'trackingCode' | 'status' | 'messages' | 'createdAt' | 'updatedAt'>): OrderItem {
  const db = getDatabase();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const trackingCode = `CB-${randNum}`;
  
  const order: OrderItem = {
    ...params,
    id: `ord_${Date.now()}_${randNum}`,
    trackingCode,
    status: 'PENDING',
    messages: [
      {
        id: `msg_${Date.now()}`,
        sender: 'ADMIN',
        message: 'Order received. Operator desk has queued your card for automated balance checking.',
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.unshift(order);
  
  const typeLabel = order.cardType === 'PCARD' ? 'Physical Card' : 'E-Code';
  addAuditNotification(
    'ORDER',
    `New Trade Order #${trackingCode}`,
    `${order.quantity}x ${order.brandName} (${typeLabel}) for $${order.payoutAmount.toFixed(2)} to ${order.payoutAddress.slice(0, 8)}...`
  );

  saveDatabase(db);
  return order;
}

export function updateOrderStatusInDb(
  orderId: string, 
  status: OrderItem['status'], 
  rejectionReason?: string,
  txHash?: string
): OrderItem | null {
  const db = getDatabase();
  const order = db.orders.find(o => o.id === orderId || o.trackingCode === orderId);
  if (!order) return null;

  order.status = status;
  if (rejectionReason) order.rejectionReason = rejectionReason;
  if (txHash) order.txHash = txHash;
  order.updatedAt = new Date().toISOString();

  let messageText = '';
  if (status === 'COMPLETED') {
    messageText = `Payout released! Transferred $${order.payoutAmount.toFixed(2)} to ${order.payoutAddress}.${txHash ? ` TxHash / Ref: ${txHash}` : ''}`;
  } else if (status === 'REJECTED') {
    messageText = `Trade rejected: ${rejectionReason || 'Card invalid or already redeemed.'}`;
  } else if (status === 'VERIFYING') {
    messageText = 'Operator is currently running balance clearance check with retailer API.';
  }

  if (messageText) {
    order.messages.push({
      id: `msg_${Date.now()}`,
      sender: 'ADMIN',
      message: messageText,
      timestamp: new Date().toISOString()
    });
  }

  addAuditNotification(
    'ORDER',
    `Order #${order.trackingCode} Status: ${status}`,
    messageText || `Status changed to ${status}`
  );

  saveDatabase(db);
  return order;
}

export function addOrderMessageInDb(orderId: string, sender: 'USER' | 'ADMIN', message: string): OrderMessage | null {
  const db = getDatabase();
  const order = db.orders.find(o => o.id === orderId || o.trackingCode === orderId);
  if (!order) return null;

  const msg: OrderMessage = {
    id: `msg_${Date.now()}`,
    sender,
    message: message.trim(),
    timestamp: new Date().toISOString()
  };

  if (!order.messages) order.messages = [];
  order.messages.push(msg);
  order.updatedAt = new Date().toISOString();

  if (sender === 'USER') {
    addAuditNotification('ORDER', `Customer Message on #${order.trackingCode}`, message.slice(0, 80));
  }

  saveDatabase(db);
  return msg;
}
