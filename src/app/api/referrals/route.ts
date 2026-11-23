import { NextRequest, NextResponse } from 'next/server';
import { getReferral, createOrGetReferral, withdrawReferralEarnings } from '@/lib/db';
import { sanitizeString } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ ok: 0, error: 'Referral code required' }, { status: 400 });
    }

    const safeCode = sanitizeString(code.trim().toUpperCase(), 30);
    const referral = getReferral(safeCode) || createOrGetReferral(safeCode);

    return NextResponse.json({
      ok: 1,
      data: { referral }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: 0, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, code, amount, userIdentifier = 'Trader' } = body;

    if (!code) {
      return NextResponse.json({ ok: 0, error: 'Referral code required' }, { status: 400 });
    }

    const safeCode = sanitizeString(code.trim().toUpperCase(), 30);

    if (action === 'withdraw') {
      const claimAmount = parseFloat(amount) || 0;
      if (claimAmount <= 0) {
        return NextResponse.json({ ok: 0, error: 'Invalid withdrawal amount' }, { status: 400 });
      }

      const success = withdrawReferralEarnings(safeCode, claimAmount);
      if (!success) {
        return NextResponse.json({ ok: 0, error: 'Insufficient pending balance or invalid code' }, { status: 400 });
      }

      const updated = getReferral(safeCode);
      return NextResponse.json({
        ok: 1,
        data: { referral: updated, message: 'Withdrawal request broadcasted to settlement pool.' }
      });
    }

    // Default: create or fetch
    const referral = createOrGetReferral(safeCode, sanitizeString(userIdentifier, 50));
    return NextResponse.json({
      ok: 1,
      data: { referral }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: 0, error: err.message }, { status: 500 });
  }
}
