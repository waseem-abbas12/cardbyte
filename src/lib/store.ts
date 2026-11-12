import fs from 'fs';
import path from 'path';
import { INITIAL_BRANDS, GiftCardBrand, PlatformNotification } from './ratesData';
export type { GiftCardBrand, PlatformNotification };

export interface OrderItem {
  id: string;
  trackingCode: string;
  brandId: string;
  brandName: string;
  countryCode: string;
  cardType?: 'ECODE' | 'PCARD';
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
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreData {
  brands: GiftCardBrand[];
  orders: OrderItem[];
  notifications: PlatformNotification[];
  settings: {
    siteName: string;
    supportEmail: string;
    telegramSupport: string;
    whatsappSupport: string;
    autoVerification: boolean;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function migrateBrand(brand: GiftCardBrand): GiftCardBrand {
  const initial = INITIAL_BRANDS.find(b => b.id === brand.id);
  const enabled = brand.enabled !== undefined ? brand.enabled : true;
  const verificationTime = brand.verificationTime || initial?.verificationTime || '5-15 mins';

  const countries = (brand.countries || []).map(c => {
    const initCountry = initial?.countries.find(ic => ic.code === c.code);
    const rateEcode = c.rateEcode !== undefined ? c.rateEcode : (c.ratePercent || initCountry?.rateEcode || 70);
    const ratePhysical = c.ratePhysical !== undefined ? c.ratePhysical : (initCountry?.ratePhysical || (rateEcode + 4.5));
    return {
      ...c,
      ratePercent: rateEcode,
      rateEcode,
      ratePhysical,
      nominals: c.nominals && c.nominals.length ? c.nominals : (initCountry?.nominals || [25, 50, 100])
    };
  });

  return {
    ...brand,
    enabled,
    verificationTime,
    countries
  };
}

function ensureStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_FILE)) {
    const initialData: StoreData = {
      brands: INITIAL_BRANDS,
      orders: [
        {
          id: 'sample-1',
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
          payoutAddress: 'TJYe5gWq94k7vY2k4XvY...P39z',
          cardCodes: ['XJ92-K827-PL01', 'XJ92-K827-PL02'],
          receiptImages: [],
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'sample-2',
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
          payoutAddress: 'TY19skA7L9q2k4XvY...L28q',
          cardCodes: ['STM-8849-2910'],
          receiptImages: [],
          status: 'VERIFYING',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString()
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          type: 'SYSTEM',
          title: 'System Initialized',
          message: 'Cardbyte Exchange OTC Liquidity Engine is live and operational.',
          timestamp: new Date().toISOString()
        },
        {
          id: 'notif-2',
          type: 'RATE',
          title: 'Steam Rates Boosted',
          message: 'Physical Steam Cards (US) updated to 80.0% buy rate.',
          timestamp: new Date().toISOString()
        }
      ],
      settings: {
        siteName: 'Cardbyte',
        supportEmail: 'support@cardbyte.io',
        telegramSupport: 'https://t.me/cardbyte_support',
        whatsappSupport: '+1 (234) 567-8900',
        autoVerification: false
      }
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Migrate brands to ensure new properties exist
    parsed.brands = (parsed.brands || INITIAL_BRANDS).map(migrateBrand);
    
    // Ensure notifications exist
    if (!parsed.notifications) {
      parsed.notifications = [
        {
          id: 'notif-init',
          type: 'SYSTEM',
          title: 'Welcome to Cardbyte Pro',
          message: 'Live OTC quotation engine and multi-rail settlement active.',
          timestamp: new Date().toISOString()
        }
      ];
    }

    return parsed;
  } catch {
    return {
      brands: INITIAL_BRANDS,
      orders: [],
      notifications: [],
      settings: {
        siteName: 'Cardbyte',
        supportEmail: 'support@cardbyte.io',
        telegramSupport: 'https://t.me/cardbyte_support',
        whatsappSupport: '+1 (234) 567-8900',
        autoVerification: false
      }
    };
  }
}

export function getStore(): StoreData {
  return ensureStore();
}

export function saveStore(data: StoreData): void {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function addNotification(type: PlatformNotification['type'], title: string, message: string): PlatformNotification {
  const store = getStore();
  const notif: PlatformNotification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  store.notifications.unshift(notif);
  if (store.notifications.length > 50) {
    store.notifications = store.notifications.slice(0, 50);
  }
  saveStore(store);
  return notif;
}

export function createOrder(params: Omit<OrderItem, 'id' | 'trackingCode' | 'status' | 'createdAt' | 'updatedAt'>): OrderItem {
  const store = getStore();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const trackingCode = `CB-${randNum}`;
  const order: OrderItem = {
    ...params,
    id: `ord_${Date.now()}_${randNum}`,
    trackingCode,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.orders.unshift(order);
  
  // Create notification
  const typeLabel = order.cardType === 'PCARD' ? 'Physical Card' : 'E-Code';
  addNotification(
    'ORDER',
    `New Order #${trackingCode}`,
    `Submitted ${order.quantity}x ${order.brandName} (${typeLabel}) for $${order.payoutAmount.toFixed(2)} ${order.payoutCurrency}`
  );

  saveStore(store);
  return order;
}

export function updateOrderStatus(id: string, status: OrderItem['status'], rejectionReason?: string): OrderItem | null {
  const store = getStore();
  const order = store.orders.find(o => o.id === id || o.trackingCode === id);
  if (!order) return null;

  const oldStatus = order.status;
  order.status = status;
  if (rejectionReason) order.rejectionReason = rejectionReason;
  order.updatedAt = new Date().toISOString();

  // Create status alert
  addNotification(
    'ORDER',
    `Order #${order.trackingCode} ${status}`,
    status === 'COMPLETED'
      ? `Payout of $${order.payoutAmount.toFixed(2)} successfully released to ${order.payoutAddress.slice(0, 10)}...`
      : status === 'REJECTED'
      ? `Order was rejected. Reason: ${rejectionReason || 'Card code invalid or balance zero'}`
      : `Order moved from ${oldStatus} to ${status}`
  );

  saveStore(store);
  return order;
}

export function updateBrandRates(brandId: string, countryCode: string, ecodeRate?: number, physicalRate?: number): boolean {
  const store = getStore();
  const brand = store.brands.find(b => b.id === brandId);
  if (!brand) return false;

  const country = brand.countries.find(c => c.code === countryCode);
  if (!country) return false;

  if (ecodeRate !== undefined && !isNaN(ecodeRate)) {
    country.rateEcode = ecodeRate;
    country.ratePercent = ecodeRate;
  }
  if (physicalRate !== undefined && !isNaN(physicalRate)) {
    country.ratePhysical = physicalRate;
  }

  addNotification(
    'RATE',
    `Rate Updated: ${brand.name} (${countryCode})`,
    `E-Code: ${country.rateEcode}% | Physical: ${country.ratePhysical}%`
  );

  saveStore(store);
  return true;
}

export function updateBrandVerificationTime(brandId: string, verificationTime: string): boolean {
  const store = getStore();
  const brand = store.brands.find(b => b.id === brandId);
  if (!brand) return false;

  brand.verificationTime = verificationTime;

  addNotification(
    'SYSTEM',
    `Processing Time Updated: ${brand.name}`,
    `Estimated speed adjusted to: "${verificationTime}"`
  );

  saveStore(store);
  return true;
}

export function toggleBrandEnabled(brandId: string): boolean {
  const store = getStore();
  const brand = store.brands.find(b => b.id === brandId);
  if (!brand) return false;

  brand.enabled = !brand.enabled;

  addNotification(
    'SYSTEM',
    `Catalog Updated: ${brand.name}`,
    `Brand is now ${brand.enabled ? 'ACTIVE (visible to clients)' : 'DISABLED (hidden from catalog)'}`
  );

  saveStore(store);
  return true;
}
