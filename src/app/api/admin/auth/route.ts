import { NextRequest, NextResponse } from 'next/server';
import { 
  checkBruteForceLockout, 
  registerFailedAdminLogin, 
  registerSuccessfulAdminLogin, 
  verifyDoubleCheckCredentials, 
  verifyMasterKey,
  verifyAdminPin,
  generateChallengeToken,
  verifyChallengeToken,
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
        error: `Security Lockout Active: Too many failed attempts. Access quarantined for ${lockCheck.remainingSec} seconds.`
      }, { status: 429 });
    }

    const body = await req.json();
    const { stage, masterKey, challengeToken, securityPin } = body;

    // --- STAGE 1: Primary Master Key Clearance ---
    if (stage === 1) {
      if (!masterKey) {
        return NextResponse.json({ ok: 0, error: 'Stage 1 Failure: Master Security Key is strictly required.' }, { status: 400 });
      }

      const isKeyValid = verifyMasterKey(masterKey);
      if (!isKeyValid) {
        const failInfo = registerFailedAdminLogin(ip);
        if (failInfo.locked) {
          return NextResponse.json({
            ok: 0,
            error: 'Security Lockout Triggered: 5 failed attempts reached. Access quarantined for 15 minutes.'
          }, { status: 429 });
        }
        return NextResponse.json({
          ok: 0,
          error: `Stage 1 Master Key Invalid. ${failInfo.attemptsLeft} attempts remaining before system lockdown.`
        }, { status: 401 });
      }

      // Issue temporary 90-second challenge token for Stage 2
      const challenge = generateChallengeToken();
      return NextResponse.json({
        ok: 1,
        stage: 1,
        message: 'Stage 1 Verified: Master Key Clearance Confirmed. Proceeding to Stage 2 Secondary PIN Challenge.',
        challengeToken: challenge,
        expiresInSec: 90
      });
    }

    // --- STAGE 2: Secondary Operator PIN & Signature Clearance ---
    if (stage === 2) {
      if (!challengeToken || !securityPin) {
        return NextResponse.json({
          ok: 0,
          error: 'Stage 2 Failure: Valid Stage 1 Challenge Token and 6-Digit PIN are required.'
        }, { status: 400 });
      }

      // Verify Stage 1 challenge validity & expiration
      const isChallengeValid = verifyChallengeToken(challengeToken, 90000);
      if (!isChallengeValid) {
        return NextResponse.json({
          ok: 0,
          error: 'Stage 2 Expired / Tampered: Stage 1 challenge has expired (90s window). Please re-authenticate from Stage 1.'
        }, { status: 401 });
      }

      // Verify PIN
      const isPinValid = verifyAdminPin(securityPin);
      if (!isPinValid) {
        const failInfo = registerFailedAdminLogin(ip);
        if (failInfo.locked) {
          return NextResponse.json({
            ok: 0,
            error: 'Security Lockout Triggered: 5 failed attempts reached. Access quarantined for 15 minutes.'
          }, { status: 429 });
        }
        return NextResponse.json({
          ok: 0,
          error: `Stage 2 PIN Invalid. ${failInfo.attemptsLeft} attempts remaining before system lockdown.`
        }, { status: 401 });
      }

      // All 2 Stages Passed!
      registerSuccessfulAdminLogin(ip);
      const sessionToken = generateSessionSignature();
      return NextResponse.json({
        ok: 1,
        stage: 2,
        token: sessionToken,
        message: 'Dual-Stage Clearance Complete: Access granted to Headquarters Vault.'
      });
    }

    // --- Legacy / Direct Double-Check Mode ---
    if (masterKey && securityPin) {
      const isValid = verifyDoubleCheckCredentials(masterKey, securityPin);
      if (!isValid) {
        const failInfo = registerFailedAdminLogin(ip);
        if (failInfo.locked) {
          return NextResponse.json({
            ok: 0,
            error: 'Security Lockout Triggered: 5 failed attempts reached. Access quarantined for 15 minutes.'
          }, { status: 429 });
        }
        return NextResponse.json({
          ok: 0,
          error: `Invalid credentials. ${failInfo.attemptsLeft} attempts remaining before lockdown.`
        }, { status: 401 });
      }

      registerSuccessfulAdminLogin(ip);
      const sessionToken = generateSessionSignature();
      return NextResponse.json({
        ok: 1,
        token: sessionToken,
        message: 'Dual-factor verification successful. Authorized for HQ control desk.'
      });
    }

    return NextResponse.json({
      ok: 0,
      error: 'Invalid authentication request payload. Multi-stage parameters missing.'
    }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ ok: 0, error: err.message }, { status: 500 });
  }
}
