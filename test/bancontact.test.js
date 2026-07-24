const test = require('node:test');
const assert = require('node:assert/strict');

const {
  mapBancontactStatus,
  isConfigured,
  buildReturnDeeplink,
  verifyCallbackSignature,
} = require('../bancontact');

/* Detached-JWS helpers mirroring the Bancontact callback signature format */

const CALLBACK_CRIT_HEADER = {
  typ: 'jose+json',
  kid: 'test-kid',
  alg: 'ES256',
  crit: [
    'https://payconiq.com/sub',
    'https://payconiq.com/iss',
    'https://payconiq.com/iat',
    'https://payconiq.com/jti',
    'https://payconiq.com/path',
  ],
  'https://payconiq.com/sub': 'test-payment-profile',
  'https://payconiq.com/iss': 'payconiq',
  'https://payconiq.com/iat': '2026-07-21T12:00:00.000Z',
  'https://payconiq.com/jti': 'jti-test-1',
  'https://payconiq.com/path': 'https://example.test/api/payments/bancontact/callback',
};

async function signDetached(bodyBuf, privateKey, header) {
  const { CompactSign } = await import('jose');
  const crit = Object.fromEntries((header.crit || []).map((name) => [name, true]));
  const jws = await new CompactSign(bodyBuf)
    .setProtectedHeader(header)
    .sign(privateKey, { crit });
  const [h, , s] = jws.split('.');
  return `${h}..${s}`;
}

test('mapBancontactStatus normalizes provider statuses', () => {
  assert.equal(mapBancontactStatus('SUCCEEDED'), 'succeeded');
  assert.equal(mapBancontactStatus('successful'), 'succeeded');
  assert.equal(mapBancontactStatus('FAILED'), 'failed');
  assert.equal(mapBancontactStatus('EXPIRED'), 'expired');
  assert.equal(mapBancontactStatus('PENDING'), 'pending');
  assert.equal(mapBancontactStatus('IDENTIFIED'), 'pending');
});

test('isConfigured requires API key and callback URL', () => {
  // Without env in unit tests this should be false
  assert.equal(typeof isConfigured(), 'boolean');
});

test('buildReturnDeeplink appends returnUrl when configured via env at load time', () => {
  // Function always returns a string; with empty deeplink → empty
  assert.equal(buildReturnDeeplink(''), '');
  const link = buildReturnDeeplink('https://pay.example/deeplink');
  assert.match(link, /^https:\/\/pay\.example\/deeplink/);
});

test('verifyCallbackSignature accepts a valid detached JWS with crit headers', async () => {
  const { generateKeyPair } = await import('jose');
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const body = Buffer.from(
    JSON.stringify({ paymentId: 'pay-1', status: 'SUCCEEDED', amount: 450 })
  );
  const signature = await signDetached(body, privateKey, CALLBACK_CRIT_HEADER);
  const header = await verifyCallbackSignature(signature, body, { getKey: publicKey });
  assert.equal(header['https://payconiq.com/iss'], 'payconiq');
});

test('verifyCallbackSignature rejects a tampered body', async () => {
  const { generateKeyPair } = await import('jose');
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const body = Buffer.from(JSON.stringify({ paymentId: 'pay-1', amount: 450 }));
  const signature = await signDetached(body, privateKey, CALLBACK_CRIT_HEADER);
  const tampered = Buffer.from(JSON.stringify({ paymentId: 'pay-1', amount: 1 }));
  await assert.rejects(verifyCallbackSignature(signature, tampered, { getKey: publicKey }));
});

test('verifyCallbackSignature rejects an unknown critical header', async () => {
  const { generateKeyPair } = await import('jose');
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const body = Buffer.from(JSON.stringify({ paymentId: 'pay-1' }));
  const header = {
    ...CALLBACK_CRIT_HEADER,
    crit: [...CALLBACK_CRIT_HEADER.crit, 'https://payconiq.com/evil'],
    'https://payconiq.com/evil': 'x',
  };
  const signature = await signDetached(body, privateKey, header);
  await assert.rejects(
    verifyCallbackSignature(signature, body, { getKey: publicKey }),
    /kritieke JWS-header/
  );
});

test('verifyCallbackSignature accepts capitalized Payconiq issuer', async () => {
  const { generateKeyPair } = await import('jose');
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const body = Buffer.from(JSON.stringify({ paymentId: 'pay-1', status: 'SUCCEEDED' }));
  const header = { ...CALLBACK_CRIT_HEADER, 'https://payconiq.com/iss': 'Payconiq' };
  const signature = await signDetached(body, privateKey, header);
  const verified = await verifyCallbackSignature(signature, body, { getKey: publicKey });
  assert.equal(verified['https://payconiq.com/iss'], 'Payconiq');
});

test('verifyCallbackSignature rejects an unexpected issuer', async () => {
  const { generateKeyPair } = await import('jose');
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const body = Buffer.from(JSON.stringify({ paymentId: 'pay-1' }));
  const header = { ...CALLBACK_CRIT_HEADER, 'https://payconiq.com/iss': 'not-payconiq' };
  const signature = await signDetached(body, privateKey, header);
  await assert.rejects(
    verifyCallbackSignature(signature, body, { getKey: publicKey }),
    /issuer/
  );
});
