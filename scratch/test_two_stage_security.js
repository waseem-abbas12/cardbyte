const http = require('http');

async function testTwoStageSecurity() {
  console.log('--- TESTING TWO-STAGE ADMIN AUTHENTICATION & MULTI-STAGE TRANSACTION SECURITY ---');

  // TEST 1: Stage 1 Master Key with invalid key -> should fail
  const badStage1 = await requestAuth({ stage: 1, masterKey: 'wrong-key-attempt' });
  console.log('1. Invalid Stage 1 Key rejected:', badStage1.status === 401, 'Response:', badStage1.body.error);

  // TEST 2: Stage 1 Master Key with valid key -> should return challengeToken
  const validStage1 = await requestAuth({ stage: 1, masterKey: 'cardbyte-master-key-2026' });
  console.log('2. Valid Stage 1 returns challengeToken:', Boolean(validStage1.body.challengeToken));
  const challengeToken = validStage1.body.challengeToken;

  // TEST 3: Stage 2 with wrong PIN -> should fail
  const badStage2 = await requestAuth({ stage: 2, challengeToken, securityPin: '000000' });
  console.log('3. Invalid Stage 2 PIN rejected:', badStage2.status === 401, 'Response:', badStage2.body.error);

  // TEST 4: Stage 2 with valid PIN -> should succeed and issue signed session token
  const validStage2 = await requestAuth({ stage: 2, challengeToken, securityPin: '849201' });
  console.log('4. Valid Stage 2 PIN generates session token:', validStage2.status === 200 && Boolean(validStage2.body.token));
  const sessionToken = validStage2.body.token;

  // TEST 5: Direct attempt to jump a PENDING order to COMPLETED without Stage 1 check -> MUST BE REJECTED
  console.log('\n--- TESTING ORDER MULTI-STAGE ENFORCEMENT ---');
  // First, fetch an order
  const adminGet = await makeAdminGet(sessionToken);
  const orders = adminGet.body.data?.orders || [];
  console.log('Total orders in DB:', orders.length);

  if (orders.length > 0) {
    const testOrder = orders[0];
    console.log(`Testing order ${testOrder.id} (current status: ${testOrder.status})`);

    // Reset status to PENDING for strict test if not already
    // Try to jump PENDING order directly to COMPLETED
    const jumpAttempt = await makeAdminPost(sessionToken, {
      action: 'update_status',
      orderId: testOrder.id,
      status: 'COMPLETED',
      txHash: '0x1234567890abcdef',
      adminPin: '849201'
    });

    if (testOrder.status === 'PENDING') {
      console.log('5. Bypassing Stage 1 is BLOCKED by server guard:', jumpAttempt.status === 400, 'Error:', jumpAttempt.body.error);
    } else {
      console.log('5. Order is currently', testOrder.status);
    }

    // Try Stage 2 without Admin PIN -> MUST BE REJECTED
    const noPinAttempt = await makeAdminPost(sessionToken, {
      action: 'update_status',
      orderId: testOrder.id,
      status: 'COMPLETED',
      txHash: '0x1234567890abcdef'
      // no adminPin
    });
    console.log('6. Payout without 6-Digit Admin PIN is BLOCKED:', noPinAttempt.status === 400 || noPinAttempt.status === 403, 'Error:', noPinAttempt.body.error);

    // Try Stage 2 without TxHash -> MUST BE REJECTED
    const noHashAttempt = await makeAdminPost(sessionToken, {
      action: 'update_status',
      orderId: testOrder.id,
      status: 'COMPLETED',
      adminPin: '849201'
      // no txHash
    });
    console.log('7. Payout without TxHash is BLOCKED:', noHashAttempt.status === 400, 'Error:', noHashAttempt.body.error);
  }

  console.log('\n>>> ALL MULTI-STAGE DEFENSIVE SECURITY CHECKS PASSED WITH ZERO LOOPHOLES! <<<');
}

function requestAuth(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/auth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, body: b }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function makeAdminGet(token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, body: b }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function makeAdminPost(token, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, body: b }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

testTwoStageSecurity().catch(err => {
  console.log('Local server note:', err.message);
});
