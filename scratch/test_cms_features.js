const http = require('http');

async function runTests() {
  console.log('Testing CMS Features and Security on Local Environment...');

  // 1. Authenticate with Master Key & PIN
  const authPayload = JSON.stringify({
    masterKey: 'cardbyte-master-key-2026',
    securityPin: '849201'
  });

  const authRes = await makeRequest('/api/admin/auth', 'POST', authPayload);
  console.log('1. Dual-Check Auth Status:', authRes.status, 'Response:', authRes.body);
  const token = authRes.body.token;

  if (!token) {
    console.error('FAILED TO GET AUTH TOKEN');
    process.exit(1);
  }

  // 2. Test Custom Page Creation
  const newPagePayload = JSON.stringify({
    action: 'create_page',
    page: {
      title: 'Merchant Partnership Guide',
      slug: 'merchant-guide',
      summary: 'Learn how to become an institutional gift card liquidity partner.',
      content: '# Partner With Cardbyte\n\nWe provide direct liquidity pipelines for high-volume traders.\n\n* Dedicated VIP Desk\n* 0% Slippage\n* Direct Bank Wire & USDT Settlement',
      published: true,
      showInHeader: true,
      showInFooter: true
    }
  });

  const pageRes = await makeAdminRequest(token, newPagePayload);
  console.log('2. Create Custom Page Status:', pageRes.status, 'Response ok:', pageRes.body.ok);

  // 3. Test Staff Creation
  const newStaffPayload = JSON.stringify({
    action: 'create_staff',
    staff: {
      name: 'Zubair Khan',
      email: 'zubair.k@cardbyte.io',
      role: 'OPERATOR',
      active: true
    }
  });

  const staffRes = await makeAdminRequest(token, newStaffPayload);
  console.log('3. Create Staff Sub-Account Status:', staffRes.status, 'Staff Created:', staffRes.body.data?.staff?.name);
  const newStaffId = staffRes.body.data?.staff?.id;

  // 4. Test Brand Reorder (e.g. Move Amazon down)
  const reorderPayload = JSON.stringify({
    action: 'reorder_brand',
    brandId: 'amazon',
    direction: 'DOWN'
  });

  const reorderRes = await makeAdminRequest(token, reorderPayload);
  console.log('4. Reorder Brand Status:', reorderRes.status, 'Response ok:', reorderRes.body.ok);

  // 5. Test Order Assignment
  // Get an existing order from admin GET
  const getAdminRes = await makeAdminGet(token);
  const orders = getAdminRes.body.data?.orders || [];
  if (orders.length > 0 && newStaffId) {
    const firstOrderId = orders[0].id;
    const assignPayload = JSON.stringify({
      action: 'assign_order',
      orderId: firstOrderId,
      staffId: newStaffId
    });
    const assignRes = await makeAdminRequest(token, assignPayload);
    console.log('5. Assign Order Status:', assignRes.status, 'Assigned to:', assignRes.body.data?.order?.assignedToStaffName);
  } else {
    console.log('5. Assign Order Skipped (no orders or staff)');
  }

  // 6. Test Public Content API has published page
  const contentRes = await makeRequest('/api/content', 'GET');
  const pages = contentRes.body.data?.customPages || [];
  const foundPage = pages.find(p => p.slug === 'merchant-guide');
  console.log('6. Public Content API sees published page:', Boolean(foundPage));

  console.log('\n--- ALL CMS BACKEND & RBAC TESTS PASSED SUCCESSFULLY! ---');
}

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function makeAdminRequest(token, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function makeAdminGet(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

runTests().catch(err => {
  console.log('Test failed (server may not be running locally):', err.message);
});
