import { NextRequest, NextResponse } from 'next/server';
import { createOrderInDb, getDatabase, addOrderMessageInDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if sending a message on an existing order
    if (body.action === 'send_message') {
      const { trackingCode, message } = body;
      if (!trackingCode || !message?.trim()) {
        return NextResponse.json({ ok: 0, error: 'Tracking code and message required' }, { status: 400 });
      }
      const msg = addOrderMessageInDb(trackingCode, 'USER', message);
      if (!msg) {
        return NextResponse.json({ ok: 0, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: 1, data: { message: msg } });
    }

    const {
      brandId,
      brandName,
      countryCode,
      cardType,
      nominal,
      quantity,
      ratePercent,
      totalCardValue,
      payoutAmount,
      payoutCurrency,
      payoutAddress,
      cardCodes,
      cardPin,
      receiptNote,
      receiptImages
    } = body;

    if (!brandId || !nominal || !quantity || !payoutAddress || !cardCodes || cardCodes.length === 0) {
      return NextResponse.json({
        ok: 0,
        error: 'Missing required trading details. Please provide card codes, nominal value, and payout destination.'
      }, { status: 400 });
    }

    const order = createOrderInDb({
      brandId,
      brandName: brandName || brandId,
      countryCode: countryCode || 'US',
      cardType: cardType === 'PCARD' ? 'PCARD' : 'ECODE',
      nominal: Number(nominal),
      quantity: Number(quantity),
      ratePercent: Number(ratePercent),
      totalCardValue: Number(totalCardValue),
      payoutAmount: Number(payoutAmount),
      payoutCurrency,
      payoutAddress,
      cardCodes: Array.isArray(cardCodes) ? cardCodes : [cardCodes],
      cardPin: cardPin || '',
      receiptNote: receiptNote || '',
      receiptImages: receiptImages || []
    });

    return NextResponse.json({
      ok: 1,
      data: {
        order,
        message: 'Order created successfully. Payout will be processed upon operator balance verification.'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingCode = searchParams.get('code');

    if (!trackingCode) {
      return NextResponse.json({ ok: 0, error: 'Tracking code is required' }, { status: 400 });
    }

    const db = getDatabase();
    const order = db.orders.find(
      o => o.trackingCode.toLowerCase() === trackingCode.toLowerCase().trim() ||
           o.id.toLowerCase() === trackingCode.toLowerCase().trim()
    );

    if (!order) {
      return NextResponse.json({ ok: 0, error: 'Order not found with the provided tracking code.' }, { status: 404 });
    }

    return NextResponse.json({
      ok: 1,
      data: {
        order
      }
    });

  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}
