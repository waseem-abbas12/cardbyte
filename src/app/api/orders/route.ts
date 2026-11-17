import { NextRequest, NextResponse } from 'next/server';
import { createOrderInDb, getDatabase, addOrderMessageInDb, addAuditNotification } from '@/lib/db';
import { 
  checkRateLimit, 
  isExplicitAdminRequest, 
  maskAddress, 
  sanitizeString 
} from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // 1. Rate Limiting Protection (Max 15 order actions per minute per IP)
    const rateCheck = checkRateLimit(`order_post_${ip}`, 15, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ 
        ok: 0, 
        error: 'Too many requests. Please wait a minute before submitting again.' 
      }, { status: 429 });
    }

    const body = await req.json();

    // 2. Chat messaging on existing order
    if (body.action === 'send_message') {
      const { trackingCode, message } = body;
      if (!trackingCode || !message?.trim()) {
        return NextResponse.json({ ok: 0, error: 'Tracking code and message required' }, { status: 400 });
      }
      const safeMessage = sanitizeString(message, 500);
      const msg = addOrderMessageInDb(trackingCode, 'USER', safeMessage);
      if (!msg) {
        return NextResponse.json({ ok: 0, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: 1, data: { message: msg } });
    }

    const {
      brandId,
      countryCode = 'US',
      cardType,
      nominal,
      quantity,
      payoutCurrency,
      payoutAddress,
      cardCodes,
      cardPin,
      receiptNote,
      receiptImages
    } = body;

    // 3. Strict Validation & Anti-Tampering Engine
    if (!brandId || !nominal || !quantity || !payoutAddress || !cardCodes || cardCodes.length === 0) {
      return NextResponse.json({
        ok: 0,
        error: 'Missing required trading details. Please provide card codes, nominal value, and payout destination.'
      }, { status: 400 });
    }

    const cleanNominal = Math.abs(Number(nominal));
    const cleanQuantity = Math.max(1, Math.min(50, Math.floor(Number(quantity))));

    if (isNaN(cleanNominal) || cleanNominal <= 0) {
      return NextResponse.json({ ok: 0, error: 'Invalid card face value (nominal).' }, { status: 400 });
    }

    const db = getDatabase();
    const brand = db.brands.find(b => b.id === brandId);
    if (!brand || !brand.enabled) {
      return NextResponse.json({ ok: 0, error: 'The selected gift card brand is currently unavailable for trading.' }, { status: 400 });
    }

    // Lookup authoritative country rate
    const country = brand.countries.find(c => c.code === countryCode) || brand.countries[0];
    const isPhysical = cardType === 'PCARD';
    const authoritativeRate = isPhysical 
      ? (country?.ratePhysical || country?.ratePercent || 70) 
      : (country?.rateEcode || country?.ratePercent || 70);

    const calculatedTotalCardValue = cleanNominal * cleanQuantity;
    const authoritativePayout = Number(((calculatedTotalCardValue * authoritativeRate) / 100).toFixed(2));

    // Card codes sanitization
    const rawCodes = Array.isArray(cardCodes) ? cardCodes : [cardCodes];
    const safeCodes = rawCodes.map(c => sanitizeString(String(c).trim(), 50)).filter(Boolean);

    if (safeCodes.length === 0) {
      return NextResponse.json({ ok: 0, error: 'At least one valid card code is required.' }, { status: 400 });
    }

    const safePin = cardPin ? sanitizeString(String(cardPin).trim(), 30) : '';
    const safeNote = receiptNote ? sanitizeString(String(receiptNote).trim(), 200) : '';
    const safeAddress = sanitizeString(String(payoutAddress).trim(), 120);

    // 4. Create Order with Server-Calculated Valuation
    const order = createOrderInDb({
      brandId: brand.id,
      brandName: brand.name,
      countryCode: country?.code || 'US',
      cardType: isPhysical ? 'PCARD' : 'ECODE',
      nominal: cleanNominal,
      quantity: cleanQuantity,
      ratePercent: authoritativeRate,
      totalCardValue: calculatedTotalCardValue,
      payoutAmount: authoritativePayout,
      payoutCurrency: sanitizeString(payoutCurrency || 'USDT (TRC20)', 30),
      payoutAddress: safeAddress,
      cardCodes: safeCodes,
      cardPin: safePin,
      receiptNote: safeNote,
      receiptImages: Array.isArray(receiptImages) ? receiptImages.slice(0, 5) : []
    });

    return NextResponse.json({
      ok: 1,
      data: {
        order: {
          id: order.id,
          trackingCode: order.trackingCode,
          brandName: order.brandName,
          cardType: order.cardType,
          status: order.status,
          nominal: order.nominal,
          quantity: order.quantity,
          ratePercent: order.ratePercent,
          totalCardValue: order.totalCardValue,
          payoutAmount: order.payoutAmount,
          payoutCurrency: order.payoutCurrency,
          payoutAddress: order.payoutAddress,
          createdAt: order.createdAt
        },
        message: 'Order created successfully. Payout will be processed upon operator verification.'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Rate limit lookups (Max 60 tracking queries per minute)
    const rateCheck = checkRateLimit(`order_get_${ip}`, 60, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ ok: 0, error: 'Rate limit exceeded. Please wait before tracking again.' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const trackingCode = searchParams.get('code');

    if (!trackingCode) {
      return NextResponse.json({ ok: 0, error: 'Tracking code is required' }, { status: 400 });
    }

    const db = getDatabase();
    const cleanCode = trackingCode.trim().toLowerCase();
    const order = db.orders.find(
      o => o.trackingCode.toLowerCase() === cleanCode ||
           o.id.toLowerCase() === cleanCode
    );

    if (!order) {
      return NextResponse.json({ ok: 0, error: 'Order not found with the provided tracking code.' }, { status: 404 });
    }

    // Check if caller is authenticated admin
    const isAdmin = isExplicitAdminRequest(req);

    if (isAdmin) {
      // Full order details for authorized admin
      return NextResponse.json({ ok: 1, data: { order } });
    }

    // Public Redacted View (Zero-Knowledge PIN & Voucher Protection)
    const publicSafeOrder = {
      id: order.id,
      trackingCode: order.trackingCode,
      brandName: order.brandName,
      cardType: order.cardType,
      nominal: order.nominal,
      quantity: order.quantity,
      ratePercent: order.ratePercent,
      totalCardValue: order.totalCardValue,
      payoutAmount: order.payoutAmount,
      payoutCurrency: order.payoutCurrency,
      payoutAddress: maskAddress(order.payoutAddress),
      cardCodesCount: order.cardCodes.length,
      hasPin: Boolean(order.cardPin),
      status: order.status,
      txHash: order.txHash,
      rejectionReason: order.rejectionReason,
      messages: order.messages,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    return NextResponse.json({
      ok: 1,
      data: {
        order: publicSafeOrder
      }
    });

  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}
