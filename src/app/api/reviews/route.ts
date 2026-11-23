import { NextRequest, NextResponse } from 'next/server';
import { getReviews, createReview } from '@/lib/db';
import { sanitizeString } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    let reviews;
    if (statusParam === 'ALL') {
      reviews = getReviews();
    } else if (statusParam === 'PENDING') {
      reviews = getReviews('PENDING');
    } else {
      reviews = getReviews('APPROVED');
    }

    return NextResponse.json({
      ok: 1,
      data: { reviews }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: 0, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authorName, rating, cardBrand, payoutMethod, amountUsd, comment } = body;

    if (!authorName?.trim() || !comment?.trim()) {
      return NextResponse.json({ ok: 0, error: 'Author name and review comment are required' }, { status: 400 });
    }

    const cleanRating = Math.max(1, Math.min(5, Math.floor(Number(rating) || 5)));
    const cleanAmount = Math.max(1, Math.min(100000, Number(amountUsd) || 50));

    const newReview = createReview({
      authorName: sanitizeString(authorName.trim(), 40),
      rating: cleanRating,
      cardBrand: sanitizeString(cardBrand || 'Gift Card', 50),
      payoutMethod: sanitizeString(payoutMethod || 'USDT (TRC20)', 30),
      amountUsd: cleanAmount,
      comment: sanitizeString(comment.trim(), 500),
      status: 'PENDING',
      isVerifiedBuyer: true
    });

    return NextResponse.json({
      ok: 1,
      data: {
        review: newReview,
        message: 'Review submitted successfully. Will appear once reviewed by a moderator.'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: 0, error: err.message }, { status: 500 });
  }
}
