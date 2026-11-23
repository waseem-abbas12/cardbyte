import { NextRequest, NextResponse } from 'next/server';
import { 
  getDatabase, 
  saveDatabase,
  createBrand,
  updateBrand,
  deleteBrand,
  addCountryToBrand,
  createPayoutRail,
  updatePayoutRail,
  deletePayoutRail,
  createFaq,
  updateFaq,
  deleteFaq,
  updateLayoutSections,
  updateSiteSettings,
  updateOrderStatusInDb,
  addOrderMessageInDb,
  addAuditNotification,
  reorderBrand,
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  assignOrderToStaff,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  seedReviews
} from '@/lib/db';
import { isExplicitAdminRequest, checkRateLimit, verifyAdminPin } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rate = checkRateLimit(`admin_get_${ip}`, 120, 60000);
    if (!rate.allowed) {
      return NextResponse.json({ ok: 0, error: 'Rate limit exceeded on admin API' }, { status: 429 });
    }

    if (!isExplicitAdminRequest(req)) {
      return NextResponse.json({ ok: 0, error: 'Access Denied: Dual-Factor Operator Authentication Required.' }, { status: 401 });
    }

    const db = getDatabase();
    return NextResponse.json({
      ok: 1,
      data: {
        orders: db.orders,
        brands: db.brands,
        payoutRails: db.payoutRails,
        faqs: db.faqs,
        layoutSections: db.layoutSections,
        siteSettings: db.siteSettings,
        notifications: db.notifications,
        customPages: db.customPages || [],
        staff: db.staff || [],
        reviews: db.reviews || [],
        referrals: Object.values(db.referrals || {})
      }
    });
  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rate = checkRateLimit(`admin_post_${ip}`, 120, 60000);
    if (!rate.allowed) {
      return NextResponse.json({ ok: 0, error: 'Rate limit exceeded on admin API' }, { status: 429 });
    }

    if (!isExplicitAdminRequest(req)) {
      return NextResponse.json({ ok: 0, error: 'Access Denied: Dual-Factor Operator Authentication Required.' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    const db = getDatabase();

    // 0. Card Positions / Reordering Engine
    if (action === 'reorder_brand') {
      const { brandId, direction } = body;
      const brands = reorderBrand(brandId, direction);
      return NextResponse.json({ ok: 1, data: { brands } });
    }

    // 0. Order Assignment to Sub-Account
    if (action === 'assign_order') {
      const { orderId, staffId } = body;
      const updated = assignOrderToStaff(orderId, staffId);
      if (!updated) return NextResponse.json({ ok: 0, error: 'Order or Staff member not found' }, { status: 404 });
      return NextResponse.json({ ok: 1, data: { order: updated } });
    }

    // 0. Custom Pages CMS (WordPress / Shopify style)
    if (action === 'create_page') {
      const page = createCustomPage(body.page);
      return NextResponse.json({ ok: 1, data: { page } });
    }

    if (action === 'update_page') {
      const { pageId, updates } = body;
      const updated = updateCustomPage(pageId, updates);
      if (!updated) return NextResponse.json({ ok: 0, error: 'Page not found' }, { status: 404 });
      return NextResponse.json({ ok: 1, data: { page: updated } });
    }

    if (action === 'delete_page') {
      const { pageId } = body;
      const deleted = deleteCustomPage(pageId);
      return NextResponse.json({ ok: 1, deleted });
    }

    if (action === 'toggle_page') {
      const { pageId } = body;
      const page = db.customPages.find(p => p.id === pageId || p.slug === pageId);
      if (!page) return NextResponse.json({ ok: 0, error: 'Page not found' }, { status: 404 });
      page.published = !page.published;
      page.updatedAt = new Date().toISOString();
      saveDatabase(db);
      return NextResponse.json({ ok: 1, data: { page } });
    }

    // 0. Sub-Accounts & Staff Management
    if (action === 'create_staff') {
      const staff = createStaffMember(body.staff);
      return NextResponse.json({ ok: 1, data: { staff } });
    }

    if (action === 'update_staff') {
      const { staffId, updates } = body;
      const updated = updateStaffMember(staffId, updates);
      if (!updated) return NextResponse.json({ ok: 0, error: 'Staff member not found' }, { status: 404 });
      return NextResponse.json({ ok: 1, data: { staff: updated } });
    }

    if (action === 'delete_staff') {
      const { staffId } = body;
      const deleted = deleteStaffMember(staffId);
      return NextResponse.json({ ok: 1, deleted });
    }


    // 1. Orders (Strict Multi-Stage Verification)
    if (action === 'update_status') {
      const { orderId, status, rejectionReason, txHash, adminPin } = body;
      const order = db.orders.find(o => o.id === orderId);
      if (!order) return NextResponse.json({ ok: 0, error: 'Order not found' }, { status: 404 });

      // Security Stage Validation
      if (status === 'COMPLETED') {
        // Enforce Stage 1: Order must be in VERIFYING before COMPLETED
        if (order.status !== 'VERIFYING') {
          return NextResponse.json({
            ok: 0,
            error: 'Security Guard Violation: Order must complete Stage 1 Card & Balance Verification before Stage 2 Payout can be authorized.'
          }, { status: 400 });
        }

        // Enforce Stage 2: Dual PIN Authorization
        if (!adminPin || !verifyAdminPin(adminPin)) {
          return NextResponse.json({
            ok: 0,
            error: 'Security Guard Violation: 6-Digit Admin Security PIN confirmation failed. Payout blocked.'
          }, { status: 403 });
        }

        // Enforce Settlement Proof / Hash
        if (!txHash || !txHash.trim()) {
          return NextResponse.json({
            ok: 0,
            error: 'Security Guard Violation: Valid Transaction Hash or Settlement Reference is required to close payout.'
          }, { status: 400 });
        }
      }

      if (status === 'REJECTED') {
        if (!rejectionReason || !rejectionReason.trim()) {
          return NextResponse.json({
            ok: 0,
            error: 'Security Guard Violation: An explicit rejection reason is required for audit logs.'
          }, { status: 400 });
        }
      }

      const updated = updateOrderStatusInDb(orderId, status, rejectionReason, txHash);
      return NextResponse.json({ ok: 1, data: { order: updated } });
    }

    if (action === 'send_order_message') {
      const { orderId, message } = body;
      const msg = addOrderMessageInDb(orderId, 'ADMIN', message);
      if (!msg) return NextResponse.json({ ok: 0, error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ ok: 1, data: { message: msg } });
    }

    // 2. Brands CRUD
    if (action === 'create_brand') {
      const { name, category, icon, badge, verificationTime, countries } = body;
      const id = body.id || name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const brand = createBrand({
        id,
        name,
        category: category || 'Shopping',
        icon: icon || '🎁',
        badge: badge || '',
        verificationTime: verificationTime || '5-15 mins',
        enabled: true,
        countries: countries || [
          { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', ratePercent: 70, rateEcode: 70, ratePhysical: 75, nominals: [25, 50, 100] }
        ]
      });
      return NextResponse.json({ ok: 1, data: { brand } });
    }

    if (action === 'update_brand') {
      const { brandId, updates } = body;
      const updated = updateBrand(brandId, updates);
      if (!updated) return NextResponse.json({ ok: 0, error: 'Brand not found' }, { status: 404 });
      return NextResponse.json({ ok: 1, data: { brand: updated } });
    }

    if (action === 'delete_brand') {
      const { brandId } = body;
      const deleted = deleteBrand(brandId);
      return NextResponse.json({ ok: 1, deleted });
    }

    if (action === 'toggle_brand') {
      const { brandId } = body;
      const brand = db.brands.find(b => b.id === brandId);
      if (!brand) return NextResponse.json({ ok: 0, error: 'Brand not found' }, { status: 404 });
      brand.enabled = !brand.enabled;
      addAuditNotification('BRAND', `Catalog Toggle: ${brand.name}`, `Set to ${brand.enabled ? 'ACTIVE' : 'DISABLED'}`);
      saveDatabase(db);
      return NextResponse.json({ ok: 1, data: { enabled: brand.enabled } });
    }

    if (action === 'add_country') {
      const { brandId, country } = body;
      const success = addCountryToBrand(brandId, country);
      return NextResponse.json({ ok: success ? 1 : 0 });
    }

    if (action === 'update_rate') {
      const { brandId, countryCode, ecodeRate, physicalRate } = body;
      const brand = db.brands.find(b => b.id === brandId);
      if (!brand) return NextResponse.json({ ok: 0, error: 'Brand not found' }, { status: 404 });
      const c = brand.countries.find(item => item.code === countryCode);
      if (!c) return NextResponse.json({ ok: 0, error: 'Country not found' }, { status: 404 });

      if (ecodeRate !== undefined) {
        c.rateEcode = Number(ecodeRate);
        c.ratePercent = Number(ecodeRate);
      }
      if (physicalRate !== undefined) {
        c.ratePhysical = Number(physicalRate);
      }
      addAuditNotification('RATE', `Rates Updated: ${brand.name} (${countryCode})`, `E-Code: ${c.rateEcode}% | Physical: ${c.ratePhysical}%`);
      saveDatabase(db);
      return NextResponse.json({ ok: 1, message: 'Rates updated successfully' });
    }

    if (action === 'update_verification_time') {
      const { brandId, verificationTime } = body;
      const brand = db.brands.find(b => b.id === brandId);
      if (!brand) return NextResponse.json({ ok: 0, error: 'Brand not found' }, { status: 404 });
      brand.verificationTime = verificationTime;
      saveDatabase(db);
      return NextResponse.json({ ok: 1, message: 'Speed updated' });
    }

    // 3. Layout Sections Reorder
    if (action === 'update_layout') {
      const { sections } = body;
      const updated = updateLayoutSections(sections);
      return NextResponse.json({ ok: 1, data: { layoutSections: updated } });
    }

    // 4. Payout Rails CRUD
    if (action === 'create_payout') {
      const rail = createPayoutRail(body.rail);
      return NextResponse.json({ ok: 1, data: { rail } });
    }

    if (action === 'update_payout') {
      const { id, updates } = body;
      const updated = updatePayoutRail(id, updates);
      return NextResponse.json({ ok: 1, data: { rail: updated } });
    }

    if (action === 'delete_payout') {
      deletePayoutRail(body.id);
      return NextResponse.json({ ok: 1 });
    }

    // 5. FAQs CRUD
    if (action === 'create_faq') {
      const faq = createFaq(body.question, body.answer);
      return NextResponse.json({ ok: 1, data: { faq } });
    }

    if (action === 'update_faq') {
      const { id, updates } = body;
      const updated = updateFaq(id, updates);
      return NextResponse.json({ ok: 1, data: { faq: updated } });
    }

    if (action === 'delete_faq') {
      deleteFaq(body.id);
      return NextResponse.json({ ok: 1 });
    }

    // 6. Global Site Settings
    if (action === 'update_settings') {
      const settings = updateSiteSettings(body.settings);
      return NextResponse.json({ ok: 1, data: { siteSettings: settings } });
    }

    if (action === 'clear_notifications') {
      db.notifications = [];
      saveDatabase(db);
      return NextResponse.json({ ok: 1 });
    }

    // 7. Reviews Management
    if (action === 'approve_review') {
      const updated = approveReview(body.reviewId);
      return NextResponse.json({ ok: 1, data: { review: updated } });
    }

    if (action === 'reject_review') {
      const updated = updateReview(body.reviewId, { status: 'REJECTED' });
      return NextResponse.json({ ok: 1, data: { review: updated } });
    }

    if (action === 'delete_review') {
      deleteReview(body.reviewId);
      return NextResponse.json({ ok: 1 });
    }

    if (action === 'create_review') {
      const review = createReview(body.review);
      return NextResponse.json({ ok: 1, data: { review } });
    }

    if (action === 'update_review') {
      const updated = updateReview(body.reviewId, body.updates);
      return NextResponse.json({ ok: 1, data: { review: updated } });
    }

    if (action === 'seed_reviews') {
      const reviews = seedReviews();
      return NextResponse.json({ ok: 1, data: { reviews } });
    }

    return NextResponse.json({ ok: 0, error: 'Invalid admin action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ ok: 0, error: error.message }, { status: 500 });
  }
}
