import fs from 'fs';
import path from 'path';
import { INITIAL_BRANDS, GiftCardBrand } from './ratesData';
export type { GiftCardBrand };

export interface OrderItem {
  id: string;
  trackingCode: string;
  brandId: string;
  brandName: string;
  countryCode: string;
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
          nominal: 50,
          quantity: 1,
          ratePercent: 75.0,
          totalCardValue: 50,
          payoutAmount: 37.5,
          payoutCurrency: 'USDT (TRC20)',
          payoutAddress: 'TY19skA7L9q2k4XvY...L28q',
          cardCodes: ['STM-8849-2910'],
          receiptImages: [],
          status: 'VERIFYING',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString()
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
    return JSON.parse(raw);
  } catch {
    return {
      brands: INITIAL_BRANDS,
      orders: [],
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
  saveStore(store);
  return order;
}

export function updateOrderStatus(id: string, status: OrderItem['status'], rejectionReason?: string): OrderItem | null {
  const store = getStore();
  const order = store.orders.find(o => o.id === id || o.trackingCode === id);
  if (!order) return null;

  order.status = status;
  if (rejectionReason) order.rejectionReason = rejectionReason;
  order.updatedAt = new Date().toISOString();

  saveStore(store);
  return order;
}

export function updateBrandRate(brandId: string, countryCode: string, newRate: number): boolean {
  const store = getStore();
  const brand = store.brands.find(b => b.id === brandId);
  if (!brand) return false;

  const country = brand.countries.find(c => c.code === countryCode);
  if (!country) return false;

  country.ratePercent = newRate;
  saveStore(store);
  return true;
}
