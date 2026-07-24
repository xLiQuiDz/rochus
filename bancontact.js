/**
 * Bancontact Pro / Payconiq Payment V3 client + callback JWS verification.
 * Docs: https://docs.bancontactpro.com/
 */

const BANCONTACT_API_KEY = process.env.BANCONTACT_API_KEY || '';
const BANCONTACT_API_BASE = (
  process.env.BANCONTACT_API_BASE || 'https://merchant.api.bancontact.net'
).replace(/\/$/, '');
const BANCONTACT_JWKS_URL =
  process.env.BANCONTACT_JWKS_URL || 'https://jwks.bancontact.net';
const BANCONTACT_CALLBACK_URL = process.env.BANCONTACT_CALLBACK_URL || '';
const BANCONTACT_RETURN_URL = process.env.BANCONTACT_RETURN_URL || '';

function isConfigured() {
  return Boolean(BANCONTACT_API_KEY && BANCONTACT_CALLBACK_URL);
}

/** @type {import('jose').JWTVerifyGetKey | null} */
let jwks = null;

async function getJwks() {
  if (!jwks) {
    const { createRemoteJWKSet } = await import('jose');
    jwks = createRemoteJWKSet(new URL(BANCONTACT_JWKS_URL));
  }
  return jwks;
}

/**
 * Bancontact marks its claim headers as critical, e.g. crit:
 * ["https://payconiq.com/sub", ".../iss", ".../iat", ".../jti", ".../path"].
 * jose refuses any JWS with crit params it wasn't told about, so we declare
 * them explicitly. Matching on the suffix keeps this working if the domain
 * prefix moves from payconiq.com to a bancontact domain.
 */
const KNOWN_CRIT_SUFFIXES = new Set(['sub', 'iss', 'iat', 'jti', 'path']);

/**
 * Verify detached JWS from Bancontact callback `signature` header.
 * @param {string} signatureHeader
 * @param {string|Buffer} rawBody
 * @param {{ getKey?: import('jose').CryptoKey }} [opts] test hook — overrides the JWKS
 */
async function verifyCallbackSignature(signatureHeader, rawBody, opts = {}) {
  if (!signatureHeader) {
    throw new Error('Ontbrekende Bancontact-handtekening');
  }
  const { compactVerify, decodeProtectedHeader } = await import('jose');
  const parts = String(signatureHeader).split('.');
  if (parts.length !== 3 || parts[1] !== '') {
    throw new Error('Ongeldige Bancontact JWS');
  }

  const bodyBuf = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody || ''), 'utf8');
  const compact = `${parts[0]}.${bodyBuf.toString('base64url')}.${parts[2]}`;

  const header = decodeProtectedHeader(compact);
  if (header.alg && header.alg !== 'ES256') {
    throw new Error(`Onverwacht JWS-algoritme: ${header.alg}`);
  }

  /** @type {Record<string, boolean>} */
  const crit = {};
  for (const name of header.crit || []) {
    if (!KNOWN_CRIT_SUFFIXES.has(String(name).split('/').pop())) {
      throw new Error(`Onbekende kritieke JWS-header: ${name}`);
    }
    crit[name] = true;
  }

  const key = opts.getKey || (await getJwks());
  await compactVerify(compact, key, { crit });

  const claim = (suffix) => {
    const entry = Object.entries(header).find(([k]) => String(k).endsWith(`/${suffix}`));
    return entry ? String(entry[1]) : '';
  };

  // Live callbacks send "Payconiq" (capital P); docs sometimes say lowercase.
  const iss = claim('iss').toLowerCase();
  if (iss && iss !== 'payconiq' && iss !== 'bancontact') {
    throw new Error(`Onverwachte JWS-issuer: ${iss}`);
  }
  // Anti-spoofing: the signed path claim must be our own callback URL
  const path = claim('path');
  if (path && BANCONTACT_CALLBACK_URL && path !== BANCONTACT_CALLBACK_URL) {
    throw new Error('Callback-URL in JWS komt niet overeen');
  }
  return header;
}

/**
 * @param {{ amountCents: number, description: string, reference: string, returnUrl?: string }} opts
 */
async function createPayment({ amountCents, description, reference, returnUrl }) {
  if (!isConfigured()) {
    const err = new Error('Bancontact is niet geconfigureerd (BANCONTACT_API_KEY / CALLBACK_URL)');
    err.code = 'BANCONTACT_NOT_CONFIGURED';
    throw err;
  }
  const amount = Math.round(Number(amountCents));
  if (!Number.isFinite(amount) || amount < 1) {
    throw new Error('Ongeldig betaalbedrag');
  }

  const body = {
    amount,
    currency: 'EUR',
    callbackUrl: BANCONTACT_CALLBACK_URL,
    description: String(description || 'Rochus').slice(0, 140),
    reference: String(reference || '').slice(0, 35),
  };
  const effectiveReturnUrl = returnUrl || BANCONTACT_RETURN_URL;
  if (effectiveReturnUrl) {
    body.returnUrl = effectiveReturnUrl;
  }

  const res = await fetch(`${BANCONTACT_API_BASE}/v3/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BANCONTACT_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.message ||
      data.title ||
      data.code ||
      `Bancontact create payment mislukt (${res.status})`;
    const err = new Error(msg);
    err.code = 'BANCONTACT_CREATE_FAILED';
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return normalizePayment(data);
}

/**
 * @param {string} paymentId
 */
async function getPayment(paymentId) {
  if (!BANCONTACT_API_KEY) {
    throw new Error('Bancontact is niet geconfigureerd');
  }
  const id = String(paymentId || '').trim();
  if (!id) throw new Error('paymentId ontbreekt');

  const res = await fetch(`${BANCONTACT_API_BASE}/v3/payments/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${BANCONTACT_API_KEY}`,
      Accept: 'application/json',
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Bancontact get payment mislukt (${res.status})`);
    err.code = 'BANCONTACT_GET_FAILED';
    err.status = res.status;
    throw err;
  }
  return normalizePayment(data);
}

function normalizePayment(data) {
  const links = data._links || {};
  const deeplink = links.deeplink?.href || links.checkout?.href || '';
  // No guessed fallback: with an empty qrUrl the menu renders its own QR
  // from the deeplink, which always scans.
  const qrUrl = links.qrcode?.href || links.qrCode?.href || '';

  return {
    id: String(data.paymentId || data.id || ''),
    status: String(data.status || 'PENDING').toUpperCase(),
    amount: Number(data.amount) || 0,
    currency: data.currency || 'EUR',
    description: data.description || '',
    reference: data.reference || '',
    deeplink,
    checkoutUrl: links.checkout?.href || '',
    qrUrl,
    raw: data,
  };
}

function mapBancontactStatus(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'SUCCEEDED' || s === 'SUCCESSFUL' || s === 'PAID') return 'succeeded';
  if (s === 'FAILED' || s === 'CANCELLED' || s === 'CANCELED' || s === 'AUTHORIZATION_FAILED') {
    return 'failed';
  }
  if (s === 'EXPIRED' || s === 'TIMEDOUT') return 'expired';
  return 'pending';
}

function buildReturnDeeplink(deeplink, returnUrl) {
  if (!deeplink) return '';
  const target = returnUrl || BANCONTACT_RETURN_URL;
  if (!target) return deeplink;
  const sep = deeplink.includes('?') ? '&' : '?';
  return `${deeplink}${sep}returnUrl=${encodeURIComponent(target)}`;
}

module.exports = {
  isConfigured,
  createPayment,
  getPayment,
  verifyCallbackSignature,
  mapBancontactStatus,
  buildReturnDeeplink,
  BANCONTACT_CALLBACK_URL,
  BANCONTACT_RETURN_URL,
};
