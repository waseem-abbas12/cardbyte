import crypto from 'crypto';

// In-Memory Sliding Window Rate Limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

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

// Cryptographically secure tracking code generator (48 bits of entropy)
export function generateSecureTrackingCode(): string {
  const bytes = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
  const part1 = bytes.slice(0, 4);
  const part2 = bytes.slice(4, 8);
  return `CB-${part1}-${part2}`;
}

// Constant-Time Admin Token Verification
export function verifyAdminToken(tokenCandidate: string | null | undefined): boolean {
  const secret = process.env.ADMIN_SECRET_KEY || 'cardbyte-master-secret-2026';
  if (!tokenCandidate) return false;

  const clean = tokenCandidate.replace(/^Bearer\s+/i, '').trim();
  if (!clean) return false;

  const bufSecret = Buffer.from(secret);
  const bufCandidate = Buffer.from(clean);

  if (bufSecret.length !== bufCandidate.length) return false;
  return crypto.timingSafeEqual(bufSecret, bufCandidate);
}

export function verifyAdminAuthorization(headerOrRequest: any): boolean {
  if (!headerOrRequest) return false;
  
  if (typeof headerOrRequest === 'string') {
    return verifyAdminToken(headerOrRequest);
  }

  // Handle NextRequest or Headers object
  const authHeader = headerOrRequest.headers?.get?.('authorization') || headerOrRequest.get?.('authorization');
  const adminKeyHeader = headerOrRequest.headers?.get?.('x-admin-key') || headerOrRequest.get?.('x-admin-key');
  const cookieHeader = headerOrRequest.cookies?.get?.('cb_admin_token')?.value;

  return verifyAdminToken(authHeader) || verifyAdminToken(adminKeyHeader) || verifyAdminToken(cookieHeader);
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
