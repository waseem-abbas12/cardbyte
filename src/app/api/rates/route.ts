import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET() {
  try {
    const store = getStore();
    return NextResponse.json({
      ok: 1,
      data: {
        brands: store.brands,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}
