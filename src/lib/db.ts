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
  CustomPage,
  StaffMember,
  CountryRate,
  ReviewItem,
  ReferralRecord
} from './types';
import { INITIAL_BRANDS, SUPPORTED_PAYOUTS, DEFAULT_REVIEWS } from './ratesData';
import { generateSecureTrackingCode, sanitizeString } from './security';

export interface DatabaseSchema {
  brands: GiftCardBrand[];
  payoutRails: PayoutMethod[];
  faqs: FaqItem[];
  layoutSections: LayoutSection[];
  siteSettings: SiteSettings;
  orders: OrderItem[];
  notifications: PlatformNotification[];
  customPages: CustomPage[];
  staff: StaffMember[];
  reviews: ReviewItem[];
  referrals: Record<string, ReferralRecord>;
}

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const DATA_DIR = IS_SERVERLESS ? '/tmp/cardbyte_data' : path.join(process.cwd(), 'data');
const DB_FILE = IS_SERVERLESS ? path.join(DATA_DIR, 'db.json') : BUNDLED_DB_FILE;

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    order: 1,
    enabled: true,
    question: 'How fast do I get paid after submitting my gift card?',
    answer: 'Our automated verification desk and moderators audit card validity swiftly. Once verified by our moderator, crypto or bank payouts are dispatched automatically.'
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
  { id: 'brands', name: 'Supported Brands Grid', description: 'Visual showcase of all active gift cards with buy rates', order: 3, enabled: true },
  { id: 'gamekeys', name: 'Sell Game Keys Section', description: 'Showcase Steam, Xbox, PlayStation, EA game activation keys', order: 4, enabled: true },
  { id: 'trust', name: '4-Step Workflow & Security Section', description: 'How it works explanation and platform liquidity statistics', order: 5, enabled: true },
  { id: 'reviews', name: 'Seller Reviews & Ratings', description: 'Authentic customer feedback and trust ratings', order: 6, enabled: true },
  { id: 'faqs', name: 'Frequently Asked Questions', description: 'Collapsible accordion answering common seller questions', order: 7, enabled: true },
  { id: 'cta', name: 'Bottom Action Banner', description: 'Final conversion banner leading to sell portal', order: 8, enabled: true }
];


const DEFAULT_PAGES: CustomPage[] = [
  {
    id: 'page-about',
    slug: 'about-us',
    title: 'About',
    summary: 'The world premier digital gift card exchange and OTC liquidity provider.',
    content: `## Institutional Grade Gift Card Exchange

Founded with a mission to eliminate friction, fraud, and excessive fees from the secondary gift voucher economy, **Cardbyte Pro** provides instant liquidity settlement across global digital vouchers and cryptocurrencies.

### Why Global Sellers Choose Us
- **Live Algorithmic Valuation**: No surprise fee deductions at checkout.
- **Direct OTC Settlement**: Receive USDT (TRC20 & BEP20), Bitcoin, Solana, or bank wires in minutes.
- **Zero-Knowledge Privacy**: Bank-grade end-to-end encryption for all voucher PINs and sensitive financial details.`,
    published: true,
    showInHeader: true,
    showInFooter: true,
    order: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-aml',
    slug: 'aml-policy',
    title: 'Anti-Money Laundering & Compliance Policy',
    summary: 'Comprehensive compliance, anti-fraud, and KYC protocols protecting all exchange counterparties.',
    content: `## Compliance & Anti-Fraud Standards

Cardbyte maintains stringent Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) protocols compliant with FATF Travel Rule recommendations.

### Core Mitigation Controls
1. **High-Risk Brand Scrutiny**: Cards exceeding $1,000 equivalent require automated retailer receipt authentication.
2. **Stolen Voucher Blacklisting**: Real-time integration with retailer invalidation networks.
3. **Sanctions Screening**: Payout addresses are checked against OFAC, EU, and UN blockchain blacklists.`,
    published: true,
    showInHeader: false,
    showInFooter: true,
    order: 2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-how',
    slug: 'how-it-works',
    title: 'How It Works',
    summary: 'Clear step-by-step walkthrough to turn unused gift cards into USDT, BTC, or local fiat cash.',
    content: `## How to Sell Your Gift Card in 4 Simple Steps

Trading unused cards on Cardbyte is effortless, automated, and secure.

1. **Select Card & Country**: Pick your voucher brand (Apple, Steam, Razer Gold, Amazon, etc.) and currency.
2. **Get Instant Valuation**: Our pricing engine quotes live wholesale buy rates with physical card bonuses.
3. **Enter Card Codes**: Submit the scratch-off code, PIN, and store receipt.
4. **Receive Instant Payout**: Choose your payout rail (USDT, BTC, Solana, Bank Transfer) and track verification live on the ledger.`,
    published: true,
    showInHeader: true,
    showInFooter: true,
    order: 3,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-terms',
    slug: 'terms',
    title: 'Terms of Service & Settlement Guarantee',
    summary: 'Legal terms of trade, escrow protections, and redemption warranty.',
    content: `## Trading Terms of Service

By creating a trade on Cardbyte, you certify that all vouchers submitted were legally purchased and remain unredeemed.

### Settlement Guarantee
Upon automated or operator balance clearance, payout will be broadcasted to the provided blockchain address or bank account within the guaranteed verification window.`,
    published: true,
    showInHeader: false,
    showInFooter: true,
    order: 4,
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Waseem Abbas',
    email: 'waseem@cardbyte.io',
    role: 'SUPER_ADMIN',
    active: true,
    assignedOrdersCount: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff-2',
    name: 'Alex Johnson',
    email: 'alex.j@cardbyte.io',
    role: 'OPERATOR',
    active: true,
    assignedOrdersCount: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff-3',
    name: 'Sarah Chen',
    email: 'sarah.c@cardbyte.io',
    role: 'FINANCE',
    active: true,
    assignedOrdersCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff-4',
    name: 'Michael Obi',
    email: 'michael.o@cardbyte.io',
    role: 'SUPPORT',
    active: true,
    assignedOrdersCount: 0,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Cardbyte Pro',
  tagline: 'Leading Global Gift Card & Crypto Exchange',
  announcementTicker: '🔥 High demand: Steam US Physical at 80% • Apple iTunes E-Code instant verification • 0% withdrawal fees',
  telegramSupport: 'https://t.me/cardbyte_support',
  whatsappSupport: '+1 (234) 567-8900',
  supportEmail: 'support@cardbyte.io',
  activeTradersCount: '850+',
  volumeTraded: '19+',
  customerSatisfaction: '4.98 ★',
  avgPayoutTime: 'Verified by Moderator',
  autoVerification: false,
  heroTitle: 'Sell Gift Cards at the Best Rates: Fast, Easy, Reliable.',
  heroSubtitle: 'Turn your unused gift cards into USDT, Bitcoin, or instant local cash. Live algorithmic valuations, zero surprise deductions, and direct settlement.'
};

function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Non-blocking in serverless environments
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
    notifications: initialNotifs,
    customPages: DEFAULT_PAGES,
    staff: DEFAULT_STAFF,
    reviews: DEFAULT_REVIEWS,
    referrals: {}
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Initial DB write suppressed in serverless:', e);
  }
  return db;
}

// In-memory cache with disk sync
let memDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (memDb) return memDb;

  let filePath = DB_FILE;
  if (!fs.existsSync(filePath) && fs.existsSync(BUNDLED_DB_FILE)) {
    filePath = BUNDLED_DB_FILE;
  }

  if (!fs.existsSync(filePath)) {
    memDb = initDatabase();
    return memDb;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Ensure all collections exist
    if (!parsed.brands || !parsed.brands.length) parsed.brands = INITIAL_BRANDS;
    if (!parsed.payoutRails || !parsed.payoutRails.length) parsed.payoutRails = SUPPORTED_PAYOUTS.map((p, i) => ({ ...p, order: i + 1, enabled: true }));
    if (!parsed.faqs || !parsed.faqs.length) parsed.faqs = DEFAULT_FAQS;
    if (!parsed.layoutSections || !parsed.layoutSections.length) parsed.layoutSections = DEFAULT_LAYOUT;
    if (!parsed.siteSettings) parsed.siteSettings = DEFAULT_SETTINGS;
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.customPages || !parsed.customPages.length) parsed.customPages = DEFAULT_PAGES;
    if (!parsed.staff || !parsed.staff.length) parsed.staff = DEFAULT_STAFF;
    if (!parsed.reviews || !parsed.reviews.length) parsed.reviews = DEFAULT_REVIEWS;
    if (!parsed.referrals) parsed.referrals = {};

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
  const trackingCode = generateSecureTrackingCode();
  
  const order: OrderItem = {
    ...params,
    id: `ord_${Date.now()}_${trackingCode.replace('CB-', '')}`,
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
    message: sanitizeString(message.trim()),
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


// ==========================================
// 8. CARD POSITIONS & REORDERING ENGINE
// ==========================================

export function reorderBrand(brandId: string, direction: 'UP' | 'DOWN'): GiftCardBrand[] {
  const db = getDatabase();
  db.brands.forEach((b, i) => {
    if (b.order === undefined) b.order = i + 1;
  });
  db.brands.sort((a, b) => (a.order || 0) - (b.order || 0));

  const index = db.brands.findIndex(b => b.id === brandId);
  if (index === -1) return db.brands;

  const targetIndex = direction === 'UP' ? index - 1 : index + 1;
  if (targetIndex >= 0 && targetIndex < db.brands.length) {
    const currentOrder = db.brands[index].order || (index + 1);
    const targetOrder = db.brands[targetIndex].order || (targetIndex + 1);

    db.brands[index].order = targetOrder;
    db.brands[targetIndex].order = currentOrder;

    const temp = db.brands[index];
    db.brands[index] = db.brands[targetIndex];
    db.brands[targetIndex] = temp;

    addAuditNotification('BRAND', `Card Position Reordered: ${temp.name}`, `Position shifted ${direction} to slot #${targetOrder}`);
    saveDatabase(db);
  }
  return db.brands;
}

// ==========================================
// 9. CUSTOM PAGES BUILDER (WORDPRESS / SHOPIFY CMS)
// ==========================================

export function createCustomPage(page: Omit<CustomPage, 'id' | 'updatedAt'>): CustomPage {
  const db = getDatabase();
  const slug = page.slug ? page.slug.toLowerCase().replace(/[^a-z0-9-]/g, '') : page.title.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const newPage: CustomPage = {
    ...page,
    id: `page-${Date.now()}`,
    slug,
    order: page.order || db.customPages.length + 1,
    published: page.published !== undefined ? page.published : true,
    showInHeader: page.showInHeader !== undefined ? page.showInHeader : false,
    showInFooter: page.showInFooter !== undefined ? page.showInFooter : true,
    updatedAt: new Date().toISOString()
  };
  db.customPages.push(newPage);
  addAuditNotification('SYSTEM', `Custom Page Created: ${newPage.title}`, `Published at /p/${newPage.slug}`);
  saveDatabase(db);
  return newPage;
}

export function updateCustomPage(id: string, updates: Partial<CustomPage>): CustomPage | null {
  const db = getDatabase();
  const index = db.customPages.findIndex(p => p.id === id || p.slug === id);
  if (index === -1) return null;

  db.customPages[index] = {
    ...db.customPages[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  addAuditNotification('SYSTEM', `Custom Page Updated: ${db.customPages[index].title}`, `Changes saved for /p/${db.customPages[index].slug}`);
  saveDatabase(db);
  return db.customPages[index];
}

export function deleteCustomPage(id: string): boolean {
  const db = getDatabase();
  const page = db.customPages.find(p => p.id === id || p.slug === id);
  if (!page) return false;
  db.customPages = db.customPages.filter(p => p.id !== id && p.slug !== id);
  addAuditNotification('SYSTEM', `Custom Page Deleted: ${page.title}`, `Removed from site navigation`);
  saveDatabase(db);
  return true;
}

// ==========================================
// 10. SUB-ACCOUNTS & STAFF PERMISSIONS (RBAC)
// ==========================================

export function createStaffMember(staff: Omit<StaffMember, 'id' | 'createdAt' | 'assignedOrdersCount'>): StaffMember {
  const db = getDatabase();
  const newStaff: StaffMember = {
    ...staff,
    id: `staff-${Date.now()}`,
    active: staff.active !== undefined ? staff.active : true,
    assignedOrdersCount: 0,
    createdAt: new Date().toISOString()
  };
  db.staff.push(newStaff);
  addAuditNotification('SYSTEM', `Sub-Account Created: ${newStaff.name}`, `Role assigned: ${newStaff.role} (${newStaff.email})`);
  saveDatabase(db);
  return newStaff;
}

export function updateStaffMember(id: string, updates: Partial<StaffMember>): StaffMember | null {
  const db = getDatabase();
  const index = db.staff.findIndex(s => s.id === id);
  if (index === -1) return null;

  db.staff[index] = { ...db.staff[index], ...updates };
  addAuditNotification('SYSTEM', `Sub-Account Updated: ${db.staff[index].name}`, `Role/Status modified`);
  saveDatabase(db);
  return db.staff[index];
}

export function deleteStaffMember(id: string): boolean {
  const db = getDatabase();
  const member = db.staff.find(s => s.id === id);
  if (!member) return false;
  db.staff = db.staff.filter(s => s.id !== id);
  addAuditNotification('SYSTEM', `Sub-Account Deleted: ${member.name}`, `Access revoked`);
  saveDatabase(db);
  return true;
}

export function assignOrderToStaff(orderId: string, staffId: string): OrderItem | null {
  const db = getDatabase();
  const order = db.orders.find(o => o.id === orderId || o.trackingCode === orderId);
  const staff = db.staff.find(s => s.id === staffId);
  if (!order || !staff) return null;

  order.assignedToStaffId = staff.id;
  order.assignedToStaffName = staff.name;
  order.updatedAt = new Date().toISOString();

  // Increment staff assignment count
  staff.assignedOrdersCount = (staff.assignedOrdersCount || 0) + 1;

  order.messages.push({
    id: `msg_${Date.now()}`,
    sender: 'ADMIN',
    message: `Order assigned to Operator ${staff.name} (${staff.role}). Handling verification.`,
    timestamp: new Date().toISOString()
  });

  addAuditNotification('ORDER', `Order #${order.trackingCode} Assigned`, `Assigned to ${staff.name} (${staff.role})`);
  saveDatabase(db);
  return order;
}

// ==========================================
// 11. REVIEWS & RATINGS SYSTEM
// ==========================================

export function getReviews(status?: 'APPROVED' | 'PENDING' | 'REJECTED'): ReviewItem[] {
  const db = getDatabase();
  const list = db.reviews && db.reviews.length ? db.reviews : DEFAULT_REVIEWS;
  if (!status) return list;
  return list.filter(r => r.status === status);
}

export function createReview(review: Omit<ReviewItem, 'id' | 'date'>): ReviewItem {
  const db = getDatabase();
  if (!db.reviews) db.reviews = [...DEFAULT_REVIEWS];
  const newReview: ReviewItem = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toISOString()
  };
  db.reviews.unshift(newReview);
  addAuditNotification('SYSTEM', `New Review: ${newReview.authorName}`, `${newReview.rating}★ for ${newReview.cardBrand} (${newReview.status})`);
  saveDatabase(db);
  return newReview;
}

export function updateReview(id: string, updates: Partial<ReviewItem>): ReviewItem | null {
  const db = getDatabase();
  if (!db.reviews) db.reviews = [...DEFAULT_REVIEWS];
  const idx = db.reviews.findIndex(r => r.id === id);
  if (idx === -1) return null;
  db.reviews[idx] = { ...db.reviews[idx], ...updates };
  saveDatabase(db);
  return db.reviews[idx];
}

export function deleteReview(id: string): boolean {
  const db = getDatabase();
  if (!db.reviews) db.reviews = [...DEFAULT_REVIEWS];
  const initialLength = db.reviews.length;
  db.reviews = db.reviews.filter(r => r.id !== id);
  if (db.reviews.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export function approveReview(id: string): ReviewItem | null {
  return updateReview(id, { status: 'APPROVED' });
}

export function seedReviews(): ReviewItem[] {
  const db = getDatabase();
  db.reviews = [...DEFAULT_REVIEWS];
  saveDatabase(db);
  return db.reviews;
}

// ==========================================
// 12. REFERRAL & AFFILIATE SYSTEM (0.25% Commission)
// ==========================================

export function getReferral(code: string): ReferralRecord | null {
  const db = getDatabase();
  if (!db.referrals) db.referrals = {};
  return db.referrals[code.toUpperCase()] || null;
}

export function createOrGetReferral(code: string, userIdentifier: string = 'User'): ReferralRecord {
  const db = getDatabase();
  if (!db.referrals) db.referrals = {};
  const normalized = code.toUpperCase().trim();
  if (db.referrals[normalized]) {
    return db.referrals[normalized];
  }
  const newRef: ReferralRecord = {
    code: normalized,
    userIdentifier,
    totalReferred: 0,
    totalVolumeUsd: 0,
    commissionRate: 0.0025, // 0.25% commission
    earnedUsd: 0,
    paidUsd: 0,
    pendingUsd: 0,
    createdAt: new Date().toISOString()
  };
  db.referrals[normalized] = newRef;
  saveDatabase(db);
  return newRef;
}

export function recordReferralCommission(code: string, orderVolumeUsd: number): boolean {
  const db = getDatabase();
  if (!db.referrals) db.referrals = {};
  const normalized = code.toUpperCase().trim();
  const ref = db.referrals[normalized];
  if (!ref) return false;

  const commission = parseFloat((orderVolumeUsd * (ref.commissionRate || 0.0025)).toFixed(2));
  ref.totalReferred += 1;
  ref.totalVolumeUsd = parseFloat((ref.totalVolumeUsd + orderVolumeUsd).toFixed(2));
  ref.earnedUsd = parseFloat((ref.earnedUsd + commission).toFixed(2));
  ref.pendingUsd = parseFloat((ref.pendingUsd + commission).toFixed(2));

  addAuditNotification('WALLET', `Referral Commission Earned: Code ${ref.code}`, `Earned $${commission} from $${orderVolumeUsd} trade volume`);
  saveDatabase(db);
  return true;
}

export function withdrawReferralEarnings(code: string, amount: number): boolean {
  const db = getDatabase();
  if (!db.referrals) db.referrals = {};
  const normalized = code.toUpperCase().trim();
  const ref = db.referrals[normalized];
  if (!ref || ref.pendingUsd < amount) return false;

  ref.pendingUsd = parseFloat((ref.pendingUsd - amount).toFixed(2));
  ref.paidUsd = parseFloat((ref.paidUsd + amount).toFixed(2));
  addAuditNotification('WALLET', `Referral Payout Claimed: Code ${ref.code}`, `Claimed $${amount} from affiliate earnings`);
  saveDatabase(db);
  return true;
}
