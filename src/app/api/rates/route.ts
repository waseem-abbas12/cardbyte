import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({
      ok: 1,
      data: {
        brands: db.brands,
        payoutRails: db.payoutRails,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}
