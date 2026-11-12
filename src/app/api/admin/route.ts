import { NextRequest, NextResponse } from 'next/server';
import { 
  getStore, 
  updateOrderStatus, 
  updateBrandRates, 
  updateBrandVerificationTime, 
  toggleBrandEnabled,
  saveStore 
} from '@/lib/store';

export async function GET() {
  try {
    const store = getStore();
    return NextResponse.json({
      ok: 1,
      data: {
        orders: store.orders,
        brands: store.brands,
        notifications: store.notifications || [],
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
      const { brandId, countryCode, ecodeRate, physicalRate, newRate } = body;
      const finalEcode = ecodeRate !== undefined ? Number(ecodeRate) : (newRate !== undefined ? Number(newRate) : undefined);
      const finalPhysical = physicalRate !== undefined ? Number(physicalRate) : undefined;

      const success = updateBrandRates(brandId, countryCode, finalEcode, finalPhysical);
      if (!success) {
        return NextResponse.json({ ok: 0, error: 'Brand or country not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: 1, message: 'Rates updated successfully' });
    }

    if (action === 'update_verification_time') {
      const { brandId, verificationTime } = body;
      if (!brandId || !verificationTime) {
        return NextResponse.json({ ok: 0, error: 'Brand ID and verification time are required' }, { status: 400 });
      }
      const success = updateBrandVerificationTime(brandId, verificationTime.trim());
      if (!success) {
        return NextResponse.json({ ok: 0, error: 'Brand not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: 1, message: 'Processing time updated successfully' });
    }

    if (action === 'toggle_brand') {
      const { brandId } = body;
      if (!brandId) {
        return NextResponse.json({ ok: 0, error: 'Brand ID is required' }, { status: 400 });
      }
      const success = toggleBrandEnabled(brandId);
      if (!success) {
        return NextResponse.json({ ok: 0, error: 'Brand not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: 1, message: 'Brand status toggled successfully' });
    }

    if (action === 'clear_notifications') {
      const store = getStore();
      store.notifications = [];
      saveStore(store);
      return NextResponse.json({ ok: 1, message: 'Notifications cleared' });
    }

    return NextResponse.json({ ok: 0, error: 'Invalid admin action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}
