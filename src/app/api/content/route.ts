import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({
      ok: 1,
      data: {
        siteSettings: db.siteSettings,
        layoutSections: db.layoutSections.sort((a, b) => a.order - b.order),
        brands: db.brands.filter(b => b.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0)),
        payoutRails: db.payoutRails.filter(p => p.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0)),
        faqs: db.faqs.filter(f => f.enabled !== false).sort((a, b) => a.order - b.order),
        customPages: (db.customPages || []).filter(p => p.published).sort((a, b) => a.order - b.order)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: 0, error: err.message }, { status: 500 });
  }
}
