import { NextRequest, NextResponse } from 'next/server';
import { 
  checkBruteForceLockout, 
  registerFailedAdminLogin, 
  registerSuccessfulAdminLogin, 
  verifyDoubleCheckCredentials, 
  generateSessionSignature 
} from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // 1. Check if IP is currently locked out from brute-force attempts
    const lockCheck = checkBruteForceLockout(ip);
    if (lockCheck.locked) {
      return NextResponse.json({
        ok: 0,
        error: `Security Lockout Active: Too many failed attempts. Try again in ${lockCheck.remainingSec} seconds.`
      }, { status: 429 });
    }

    const body = await req.json();
    const { masterKey, securityPin } = body;

    if (!masterKey || !securityPin) {
      return NextResponse.json({
        ok: 0,
        error: 'Double-Check Authentication requires both Master Key and 6-Digit PIN.'
      }, { status: 400 });
    }

    // 2. Constant-time double verification
    const isValid = verifyDoubleCheckCredentials(masterKey, securityPin);

    if (!isValid) {
      const failInfo = registerFailedAdminLogin(ip);
      if (failInfo.locked) {
        return NextResponse.json({
          ok: 0,
          error: 'Security Lockout Triggered: 5 failed attempts reached. Access banned for 15 minutes.'
        }, { status: 429 });
      }
      return NextResponse.json({
        ok: 0,
        error: `Invalid credentials. ${failInfo.attemptsLeft} attempts remaining before temporary lockout.`
      }, { status: 401 });
    }

    // 3. Success: Reset lockout & Issue Signed Cryptographic Session Token
    registerSuccessfulAdminLogin(ip);
    const sessionToken = generateSessionSignature();

    return NextResponse.json({
      ok: 1,
      token: sessionToken,
      message: 'Dual-factor verification successful. Authorized for HQ control desk.'
    });

  } catch (err: any) {
    return NextResponse.json({ ok: 0, error: err.message }, { status: 500 });
  }
}
