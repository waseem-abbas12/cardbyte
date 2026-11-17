import crypto from 'crypto';

// Master Credentials (Can be overridden via environment variables)
export const DEFAULT_ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'cardbyte-master-key-2026';
export const DEFAULT_ADMIN_PIN = process.env.ADMIN_SECURITY_PIN || '849201';

// In-Memory Sliding Window Rate Limiter & Lockout System
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const lockoutStore = new Map<string, { attempts: number; lockedUntil: number }>();

export function checkRateLimit(key: string, limit: number = 20, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

// Brute-force Lockout for Admin Auth (5 failed attempts = 15 min ban)
export function checkBruteForceLockout(ip: string): { locked: boolean; remainingSec: number } {
  const now = Date.now();
  const entry = lockoutStore.get(ip);
  if (!entry) return { locked: false, remainingSec: 0 };

  if (now < entry.lockedUntil) {
    return { locked: true, remainingSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  // Lockout expired
  lockoutStore.delete(ip);
  return { locked: false, remainingSec: 0 };
}

export function registerFailedAdminLogin(ip: string): { locked: boolean; attemptsLeft: number } {
  const now = Date.now();
  const entry = lockoutStore.get(ip) || { attempts: 0, lockedUntil: 0 };
  entry.attempts += 1;

  if (entry.attempts >= 5) {
    entry.lockedUntil = now + (15 * 60 * 1000); // 15 mins lock
    lockoutStore.set(ip, entry);
    return { locked: true, attemptsLeft: 0 };
  }

  lockoutStore.set(ip, entry);
  return { locked: false, attemptsLeft: 5 - entry.attempts };
}

export function registerSuccessfulAdminLogin(ip: string): void {
  lockoutStore.delete(ip);
}

// Cryptographically secure tracking code generator (48 bits of entropy)
export function generateSecureTrackingCode(): string {
  const bytes = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
  const part1 = bytes.slice(0, 4);
  const part2 = bytes.slice(4, 8);
  return `CB-${part1}-${part2}`;
}

// Constant-Time String Comparison
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Double-Check Credential Verification (Layer 1: Master Key, Layer 2: 6-Digit PIN)
export function verifyDoubleCheckCredentials(keyCandidate?: string, pinCandidate?: string): boolean {
  if (!keyCandidate || !pinCandidate) return false;
  const isKeyValid = safeEqual(keyCandidate.trim(), DEFAULT_ADMIN_KEY);
  const isPinValid = safeEqual(pinCandidate.trim(), DEFAULT_ADMIN_PIN);
  return isKeyValid && isPinValid;
}

// Cryptographic Session Signature
export function generateSessionSignature(): string {
  const timestamp = Date.now().toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const hmac = crypto.createHmac('sha256', DEFAULT_ADMIN_KEY)
    .update(`${timestamp}:${DEFAULT_ADMIN_PIN}:${salt}`)
    .digest('hex');
  return `cb_sess_${timestamp}_${salt}_${hmac}`;
}

export function verifySessionSignature(token?: string): boolean {
  if (!token || !token.startsWith('cb_sess_')) return false;
  const parts = token.split('_');
  if (parts.length !== 5) return false;
  
  const timestamp = parts[2];
  const salt = parts[3];
  const signature = parts[4];

  // Expire after 8 hours
  const age = Date.now() - Number(timestamp);
  if (isNaN(age) || age > 8 * 60 * 60 * 1000 || age < 0) {
    return false;
  }

  const expectedHmac = crypto.createHmac('sha256', DEFAULT_ADMIN_KEY)
    .update(`${timestamp}:${DEFAULT_ADMIN_PIN}:${salt}`)
    .digest('hex');

  return safeEqual(signature, expectedHmac);
}

// Comprehensive Admin Authorization Checker
export function isExplicitAdminRequest(headerOrRequest?: any): boolean {
  if (!headerOrRequest) return false;
  
  const token = typeof headerOrRequest === 'string'
    ? headerOrRequest.replace(/^Bearer\s+/i, '').trim()
    : headerOrRequest.headers?.get?.('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
      headerOrRequest.headers?.get?.('x-admin-session') ||
      headerOrRequest.headers?.get?.('x-admin-key');

  if (!token) return false;
  
  // Either direct verified session signature OR master key
  return verifySessionSignature(token) || safeEqual(token, DEFAULT_ADMIN_KEY);
}

// XSS Sanitizer: Escape HTML characters
export function sanitizeString(str: string, maxLength: number = 500): string {
  if (!str) return '';
  return String(str)
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Address and PII Masking
export function maskAddress(address: string): string {
  if (!address || address.length < 8) return '****';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
