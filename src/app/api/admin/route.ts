import { NextRequest, NextResponse } from 'next/server';
import { getStore, updateOrderStatus, updateBrandRate } from '@/lib/store';

export async function GET() {
  try {
    const store = getStore();
    return NextResponse.json({
      ok: 1,
      data: {
        orders: store.orders,
        brands: store.brands,
        settings: store.settings
      }
    });
  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'update_status') {
      const { orderId, status, rejectionReason } = body;
      const updated = updateOrderStatus(orderId, status, rejectionReason);
      if (!updated) {
        return NextResponse.json({ ok: 0, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: 1, data: { order: updated } });
    }

    if (action === 'update_rate') {
      const { brandId, countryCode, newRate } = body;
      const success = updateBrandRate(brandId, countryCode, Number(newRate));
      if (!success) {
        return NextResponse.json({ ok: 0, error: 'Brand or country not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: 1, message: 'Rate updated successfully' });
    }

    return NextResponse.json({ ok: 0, error: 'Invalid admin action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}
