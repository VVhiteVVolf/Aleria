import { createPublicKey, verify } from 'node:crypto';

const PROJECT = 'aleriaprojekt';
const CERTIFICATES_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let certificates = null, expiresAt = 0, pending = null;

async function publicKeys() {
  if (certificates && Date.now() < expiresAt) return certificates;
  if (!pending) pending = (async () => {
    const response = await fetch(CERTIFICATES_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Firebase signing keys unavailable');
    certificates = await response.json();
    const maxAge = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 300);
    expiresAt = Date.now() + maxAge * 1000;
    return certificates;
  })().finally(() => { pending = null; });
  return pending;
}

// Firebase's documented RS256 validation; keys come only from Google's fixed
// endpoint, never from JWT header URLs. No OAuth/service-account secret needed.
export async function verifyPublisherToken(token, { keys = publicKeys, now = () => Date.now() / 1000 } = {}) {
  if (typeof token !== 'string' || token.length > 16384) throw new Error('Invalid ID token');
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) throw new Error('Invalid ID token');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url'));
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url'));
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('Invalid signing algorithm');
  const time = now();
  if (claims.aud !== PROJECT || claims.iss !== `https://securetoken.google.com/${PROJECT}` || typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128
    || !Number.isFinite(claims.exp) || claims.exp <= time || !Number.isFinite(claims.iat) || claims.iat > time
    || !Number.isFinite(claims.auth_time) || claims.auth_time > time) throw new Error('Invalid ID token claims');
  const certificate = (await keys())[header.kid];
  if (typeof certificate !== 'string' || !verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey(certificate), Buffer.from(parts[2], 'base64url'))) throw new Error('Invalid ID token signature');
  return { uid: claims.sub, role: String(claims.aleriaRole || 'player') };
}

export async function checkPublisherAccess(event, publisher, { mode = process.env.ALERIA_PUBLISHER_ACCESS_MODE || 'observe', verifyToken = verifyPublisherToken, log = console.info } = {}) {
  mode = String(mode).trim().toLowerCase();
  if (!['observe', 'enforce'].includes(mode)) throw new Error('Unbekannter Publisher-Zugriffsmodus.');
  const header = String(event.headers?.authorization || event.headers?.Authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  let identity = null, status = token ? 'invalid' : 'missing';
  if (token) {
    try { identity = await verifyToken(token); status = 'verified'; } catch { /* Never log tokens, email addresses or verification error payloads. */ }
  }
  const permitted = !!identity && ['editor', 'moderator', 'admin'].includes(identity.role);
  log(JSON.stringify({ event: 'publisher-access', publisher, mode, status, permitted }));
  if (mode !== 'enforce' || permitted) return null;
  return { statusCode: identity ? 403 : 401, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify({ code: 'publisher-access-required', message: identity ? 'Für diese Veröffentlichung benötigst du Redaktionsrechte.' : 'Bitte melde dich im Almanach an, bevor du veröffentlichst.' }) };
}
