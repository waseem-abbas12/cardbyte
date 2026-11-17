import { 
  getDatabase, 
  saveDatabase, 
  createOrderInDb, 
  updateOrderStatusInDb, 
  addAuditNotification,
  updateBrand,
  createBrand,
  deleteBrand,
  addCountryToBrand
} from './db';
import { GiftCardBrand, OrderItem, PlatformNotification } from './types';
export type { GiftCardBrand, OrderItem, PlatformNotification };

export interface StoreData {
  brands: GiftCardBrand[];
  orders: OrderItem[];
  notifications: PlatformNotification[];
  settings: any;
}

export function getStore(): StoreData {
  const db = getDatabase();
  return {
    brands: db.brands,
    orders: db.orders,
    notifications: db.notifications,
    settings: db.siteSettings
  };
}

export function saveStore(data: StoreData): void {
  const db = getDatabase();
  db.brands = data.brands;
  db.orders = data.orders;
  db.notifications = data.notifications;
  if (data.settings) db.siteSettings = { ...db.siteSettings, ...data.settings };
  saveDatabase(db);
}

export function addNotification(type: PlatformNotification['type'], title: string, message: string): PlatformNotification {
  return addAuditNotification(type, title, message);
}

export function createOrder(params: any): OrderItem {
  return createOrderInDb(params);
}

export function updateOrderStatus(id: string, status: OrderItem['status'], rejectionReason?: string, txHash?: string): OrderItem | null {
  return updateOrderStatusInDb(id, status, rejectionReason, txHash);
}

export function updateBrandRates(brandId: string, countryCode: string, ecodeRate?: number, physicalRate?: number): boolean {
  const db = getDatabase();
  const brand = db.brands.find(b => b.id === brandId);
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

  addAuditNotification(
    'RATE',
    `Rate Updated: ${brand.name} (${countryCode})`,
    `E-Code: ${country.rateEcode}% | Physical: ${country.ratePhysical}%`
  );

  saveDatabase(db);
  return true;
}

export function updateBrandVerificationTime(brandId: string, verificationTime: string): boolean {
  const db = getDatabase();
  const brand = db.brands.find(b => b.id === brandId);
  if (!brand) return false;

  brand.verificationTime = verificationTime;

  addAuditNotification(
    'SYSTEM',
    `Processing Time Updated: ${brand.name}`,
    `Estimated speed adjusted to: "${verificationTime}"`
  );

  saveDatabase(db);
  return true;
}

export function toggleBrandEnabled(brandId: string): boolean {
  const db = getDatabase();
  const brand = db.brands.find(b => b.id === brandId);
  if (!brand) return false;

  brand.enabled = !brand.enabled;

  addAuditNotification(
    'SYSTEM',
    `Catalog Updated: ${brand.name}`,
    `Brand is now ${brand.enabled ? 'ACTIVE (visible to clients)' : 'DISABLED (hidden from catalog)'}`
  );

  saveDatabase(db);
  return true;
}
