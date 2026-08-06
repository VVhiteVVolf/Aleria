const DEFAULT_PROVIDER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MAX_TOKENS = 1200;
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_BODY_CHARS = 180000;
const DEFAULT_RATE_LIMIT_PER_MINUTE = 8;
const DEFAULT_IP_RATE_LIMIT_PER_MINUTE = 20;
const DEFAULT_DAILY_TOKEN_BUDGET = 12000;
const DEFAULT_GLOBAL_DAILY_TOKEN_BUDGET = 200000;
const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let firebaseJwksCache = { keys: {}, expiresAt: 0 };

function resetFirebaseJwksCache() {
  firebaseJwksCache = { keys: {}, expiresAt: 0 };
}

function getEnvText(env, key, fallback = '') {
  return String(env?.[key] || fallback).trim();
}

function getEnvNumber(env, key, fallback) {
  const value = Number(env?.[key]);
  return Number.isFinite(value) ? value : fallback;
}

function getAllowedOrigins(env) {
  return getEnvText(env, 'ALERIA_GPT_ALLOWED_ORIGINS')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, env) {
  if (!origin) return false;
  const allowed = getAllowedOrigins(env);
  if (!allowed.length) return false;
  return allowed.includes(origin);
}

function corsHeaders(origin, env) {
  return {
    'Access-Control-Allow-Origin': origin && isOriginAllowed(origin, env) ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
}

function base64UrlBytes(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function decodeJwtPart(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlBytes(value)));
}

function getBearerToken(request) {
  const match = String(request.headers.get('Authorization') || '').match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function getCacheMaxAge(headers) {
  const match = String(headers?.get?.('cache-control') || '').match(/max-age=(\d+)/i);
  return match ? Math.max(60, Number(match[1]) || 0) : 3600;
}

async function getFirebaseJwks(now = Date.now(), forceRefresh = false) {
  if (!forceRefresh && firebaseJwksCache.expiresAt > now && Object.keys(firebaseJwksCache.keys).length) return firebaseJwksCache.keys;
  // cf.cacheTtl:0 umgeht Cloudflares eigene Edge-Cache-Schicht fuer diesen fetch() - ohne das
  // koennte ein veralteter Edge-Cache-Eintrag zurueckkommen, obwohl Google die Schluessel laengst
  // rotiert hat, und ein gueltiges Token wuerde faelschlich als "Schluessel unbekannt" abgelehnt.
  // Das In-Memory-Caching oben (firebaseJwksCache) reicht als eigentlicher Cache voellig aus.
  const response = await fetch(FIREBASE_JWKS_URL, { cf: { cacheTtl: 0, cacheEverything: false } });
  if (!response.ok) throw Object.assign(new Error('Firebase-Schluessel konnten nicht geladen werden.'), { status: 503 });
  const body = await response.json();
  // Google liefert das Standard-JWKS-Format { keys: [{kid, kty, n, ...}, ...] }, keine flache
  // kid->JWK-Zuordnung. Ohne diese Umformung schlaegt jwks[header.kid] weiter unten IMMER fehl,
  // unabhaengig von Cache oder Rotation - das war der eigentliche, dauerhafte Bug.
  const keyList = Array.isArray(body?.keys) ? body.keys : [];
  const keys = Object.fromEntries(keyList.filter(key => key?.kid).map(key => [key.kid, key]));
  firebaseJwksCache = { keys, expiresAt: now + getCacheMaxAge(response.headers) * 1000 };
  return keys;
}

async function verifyFirebaseIdToken(token, env, now = Date.now()) {
  const projectId = getEnvText(env, 'ALERIA_FIREBASE_PROJECT_ID');
  if (!projectId) throw Object.assign(new Error('Firebase-Authentifizierung ist nicht konfiguriert.'), { status: 503 });
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw Object.assign(new Error('Ungueltige Anmeldung.'), { status: 401 });
  let header;
  let payload;
  try {
    header = decodeJwtPart(parts[0]);
    payload = decodeJwtPart(parts[1]);
  } catch {
    throw Object.assign(new Error('Ungueltige Anmeldung.'), { status: 401 });
  }
  const nowSeconds = Math.floor(now / 1000);
  if (header.alg !== 'RS256' || !header.kid
    || payload.aud !== projectId
    || payload.iss !== `https://securetoken.google.com/${projectId}`
    || !payload.sub || String(payload.sub).length > 128
    || Number(payload.exp || 0) <= nowSeconds
    || Number(payload.iat || 0) > nowSeconds + 60) {
    throw Object.assign(new Error('Anmeldung abgelaufen oder ungueltig.'), { status: 401 });
  }
  let jwks = await getFirebaseJwks(now);
  // Der lokale Schluessel-Cache kann kurzzeitig hinter Googles Rotation zurueckliegen. Bevor ein
  // ansonsten gueltiges Token abgelehnt wird, einmal erzwungen neu laden statt sofort aufzugeben.
  if (!jwks[header.kid]) jwks = await getFirebaseJwks(now, true);
  const jwk = jwks[header.kid];
  if (!jwk) throw Object.assign(new Error('Anmeldeschluessel ist nicht mehr gueltig. Bitte Seite neu laden.'), { status: 401 });
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64UrlBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!verified) throw Object.assign(new Error('Ungueltige Anmeldung.'), { status: 401 });
  return { uid: String(payload.sub), claims: payload };
}

function jsonResponse(payload, status = 200, origin = '', env = {}, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      ...corsHeaders(origin, env),
      ...extraHeaders
    }
  });
}

function cleanText(value, maxLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function cleanOutputText(value, maxLength) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

function getAnswerStyle(payload) {
  const style = cleanText(payload?.answerStyle, 40);
  return ['short', 'normal', 'deep'].includes(style) ? style : 'short';
}

function getResponseTokenLimit(env, payload) {
  const configuredMax = getEnvNumber(env, 'ALERIA_GPT_MAX_TOKENS', DEFAULT_MAX_TOKENS);
  const style = getAnswerStyle(payload);
  if (style === 'deep') return Math.min(configuredMax, 1200);
  if (style === 'normal') return Math.min(configuredMax, 620);
  return Math.min(configuredMax, 320);
}

function getAnswerStyleInstruction(payload) {
  const style = getAnswerStyle(payload);
  if (style === 'deep') return 'Antwortstil: Tief. Bis zu 5 kurze Absaetze oder 6 Listenpunkte.';
  if (style === 'normal') return 'Antwortstil: Normal. 2-3 kurze Absaetze oder bis zu 4 Listenpunkte.';
  return 'Antwortstil: Kurz. 1-2 kurze Absaetze oder maximal 3 Listenpunkte. Keine lange Analyse.';
}

function buildSystemPrompt() {
  return [
    'Du bist AleriaGPT, ein neutraler und sachlicher Gespraechs- und Analyseassistent fuer den Aleria Almanach.',
    'Antworte auf Deutsch.',
    'Sprich ruhig, direkt und natuerlich.',
    'Nutze den bereitgestellten Kontext, wenn die Frage Figuren, Module, Dialoge, Kommentare oder Almanach-Inhalte betrifft.',
    'Wenn der Kontext direkte Kommentare, Sprechertexte oder Szene-Dialoge enthaelt, haben diese Vorrang vor allgemeinen Moduldaten.',
    'Beruecksichtige auch Erzaehlerperspektive, fruehere Gespraeche, Reaktionen anderer Personen und Aussagen ueber die Zielperson, wenn sie im Kontext enthalten sind.',
    'Du darfst vorsichtige Schlussfolgerungen aus mehreren gelieferten Quellen ziehen, musst aber klar machen, wenn etwas eine Schlussfolgerung und kein direkt gesagter Fakt ist.',
    'Reagiere bei Kommentarfragen konkret auf Ton, Haltung, Sprecher, Reibungen, Zustimmung, Ablehnung und wiederkehrende Muster in den gelieferten Texten.',
    'Bei reiner Unterhaltung oder Bedienfragen darfst du kurz ohne Almanach-Deutung antworten.',
    'Antworte wie in einem normalen Chat, ausser der Nutzer verlangt ausdruecklich eine formale Analyse.',
    'Nutze lesbare Formatierung: kurze Absaetze, bei mehreren Punkten einfache Listen mit "- ", und sparsame Hervorhebungen mit **fett**.',
    'Verwende keine Markdown-Trennlinien und keine Standardueberschriften wie "Kernaussage" oder "Belegte Beobachtungen", ausser der Nutzer fordert genau dieses Format.',
    'Trenne bei ausdruecklichen Analysen belegbare Beobachtung, Statistik und Interpretation.',
    'Erfinde keine Ereignisse, Figuren, Quellen oder Zitate.',
    'Wenn Daten fehlen, sage konkret, welche Daten fehlen.',
    'Bei Figurenanalysen formulierst du literarisch/rollenbezogen, nicht als medizinische Diagnose.',
    'Die Kontextnummern sind interne Marker. Gib keine Quellenmarker wie [1] aus, ausser der Nutzer fragt explizit nach Belegen.'
  ].join(' ');
}

function buildUserPrompt(payload) {
  const query = cleanText(payload?.query, 1200);
  const responseMode = cleanText(payload?.responseMode, 80) || 'chat';
  const promptContext = String(payload?.retrieval?.promptContext || '').slice(0, 60000);
  return [
    `Antwortmodus: ${responseMode}`,
    getAnswerStyleInstruction(payload),
    `Frage: ${query}`,
    '',
    promptContext,
    '',
    'Aufgabe:',
    'Beantworte die Frage direkt.',
    'Bei normalen Gespraechsfragen antworte kurz und natuerlich, als Chatantwort.',
    'Bei Kommentar- oder Szenenfragen nutze zuerst die gelieferten Kommentar- und Sprecherquellen.',
    'Nutze nicht nur die Zielperson isoliert: Ziehe Erzaehlertext, andere Sprecher, fruehere Thread-Beitraege und relevante Szenenquellen heran, wenn die Frage danach verlangt.',
    'Erstelle nur dann eine formale Analyse mit Abschnitten, wenn die Frage das ausdruecklich verlangt.',
    'Formatiere die Antwort mit echten Zeilenumbruechen, kurzen Absaetzen und einfachen Listen, wenn es mehr als zwei Punkte sind.',
    'Keine Quellenmarker, keine erfundenen inneren Motive, keine Deutung ueber den gelieferten Text hinaus. Markiere mehrstufige Deutungen als vorsichtige Schlussfolgerung.',
    'Schliesse mit Unsicherheiten oder fehlenden Daten nur dann, wenn es relevant ist.'
  ].join('\n');
}

async function readJsonPayload(request, env) {
  const maxBodyChars = getEnvNumber(env, 'ALERIA_GPT_MAX_BODY_CHARS', DEFAULT_MAX_BODY_CHARS);
  const raw = await request.text();
  if (raw.length > maxBodyChars) {
    const error = new Error('Request body too large');
    error.status = 413;
    throw error;
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    error.status = 400;
    throw error;
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function utcDayKey(now) {
  return new Date(now).toISOString().slice(0, 10);
}

function nextUsageState(previous = {}, input = {}) {
  const now = Number(input.now || Date.now());
  const windowMs = Math.max(1000, Number(input.windowMs || 60000));
  const maximumRequests = Math.max(0, Number(input.maximumRequests || 0));
  const tokenReservation = Math.max(0, Number(input.tokenReservation || 0));
  const dailyTokenBudget = Math.max(0, Number(input.dailyTokenBudget || 0));
  const recentRequests = (Array.isArray(previous.recentRequests) ? previous.recentRequests : [])
    .map(Number)
    .filter(timestamp => Number.isFinite(timestamp) && timestamp > now - windowMs);
  const dayKey = utcDayKey(now);
  const usedTokens = previous.dayKey === dayKey ? Math.max(0, Number(previous.usedTokens || 0)) : 0;
  if (maximumRequests && recentRequests.length >= maximumRequests) {
    return { allowed: false, reason: 'rate', retryAfterSeconds: Math.max(1, Math.ceil((recentRequests[0] + windowMs - now) / 1000)), state: { dayKey, usedTokens, recentRequests } };
  }
  if (dailyTokenBudget && usedTokens + tokenReservation > dailyTokenBudget) {
    return { allowed: false, reason: 'budget', retryAfterSeconds: Math.max(1, Math.ceil((Date.parse(`${dayKey}T23:59:59.999Z`) - now) / 1000)), state: { dayKey, usedTokens, recentRequests } };
  }
  if (maximumRequests) recentRequests.push(now);
  return {
    allowed: true,
    reason: '',
    retryAfterSeconds: 0,
    state: { dayKey, usedTokens: usedTokens + tokenReservation, recentRequests }
  };
}

export class AleriaGptUsageLimiter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    const input = await request.json();
    let result;
    await this.state.storage.transaction(async transaction => {
      const previous = await transaction.get('usage') || {};
      result = nextUsageState(previous, input);
      await transaction.put('usage', result.state);
    });
    return new Response(JSON.stringify(result), {
      status: result.allowed ? 200 : 429,
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
  }
}

async function reserveUsage(env, key, limits) {
  if (!env.ALERIA_GPT_USAGE_LIMITER) {
    throw Object.assign(new Error('Rate-Limit-Speicher ist nicht konfiguriert.'), { status: 503 });
  }
  const id = env.ALERIA_GPT_USAGE_LIMITER.idFromName(String(key));
  const response = await env.ALERIA_GPT_USAGE_LIMITER.get(id).fetch('https://aleria.internal/reserve', {
    method: 'POST',
    body: JSON.stringify({ now: Date.now(), ...limits })
  });
  const result = await response.json();
  if (!response.ok || result.allowed !== true) {
    const error = new Error(result.reason === 'budget' ? 'Das heutige AleriaGPT-Budget ist aufgebraucht.' : 'Zu viele AleriaGPT-Anfragen. Bitte kurz warten.');
    error.status = 429;
    error.retryAfterSeconds = Number(result.retryAfterSeconds || 60);
    throw error;
  }
}

async function enforceUsageProtection(request, env, uid, tokenReservation) {
  const userRate = getEnvNumber(env, 'ALERIA_GPT_RATE_LIMIT_PER_MINUTE', DEFAULT_RATE_LIMIT_PER_MINUTE);
  const ipRate = getEnvNumber(env, 'ALERIA_GPT_IP_RATE_LIMIT_PER_MINUTE', DEFAULT_IP_RATE_LIMIT_PER_MINUTE);
  const dailyBudget = getEnvNumber(env, 'ALERIA_GPT_DAILY_TOKEN_BUDGET', DEFAULT_DAILY_TOKEN_BUDGET);
  const globalBudget = getEnvNumber(env, 'ALERIA_GPT_GLOBAL_DAILY_TOKEN_BUDGET', DEFAULT_GLOBAL_DAILY_TOKEN_BUDGET);
  const clientIp = cleanText(request.headers.get('CF-Connecting-IP') || 'unknown', 80);
  await Promise.all([
    reserveUsage(env, `user:${uid}`, { windowMs: 60000, maximumRequests: userRate, tokenReservation, dailyTokenBudget: dailyBudget }),
    reserveUsage(env, `ip:${clientIp}`, { windowMs: 60000, maximumRequests: ipRate, tokenReservation: 0, dailyTokenBudget: 0 }),
    reserveUsage(env, 'global', { windowMs: 60000, maximumRequests: 0, tokenReservation, dailyTokenBudget: globalBudget })
  ]);
}

async function callProvider(payload, env) {
  const providerBaseUrl = getEnvText(env, 'ALERIA_GPT_PROVIDER_BASE_URL', DEFAULT_PROVIDER_BASE_URL).replace(/\/+$/g, '');
  const apiKey = getEnvText(env, 'ALERIA_GPT_API_KEY');
  const model = getEnvText(env, 'ALERIA_GPT_MODEL');
  const maxTokens = getResponseTokenLimit(env, payload);
  const timeoutMs = getEnvNumber(env, 'ALERIA_GPT_TIMEOUT_MS', DEFAULT_TIMEOUT_MS);
  const appUrl = getEnvText(env, 'ALERIA_GPT_APP_URL');
  const appTitle = getEnvText(env, 'ALERIA_GPT_APP_TITLE', 'Aleria Almanach');

  if (!providerBaseUrl || !apiKey || !model) {
    const error = new Error('AleriaGPT worker is not configured');
    error.status = 503;
    throw error;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  };
  if (appUrl) headers['HTTP-Referer'] = appUrl;
  if (appTitle) {
    headers['X-Title'] = appTitle;
    headers['X-OpenRouter-Title'] = appTitle;
  }

  const response = await fetchWithTimeout(`${providerBaseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.25,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(payload) }
      ]
    })
  }, timeoutMs);

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Provider returned HTTP ${response.status}`);
    error.status = 502;
    error.providerStatus = response.status;
    error.providerBody = json;
    throw error;
  }

  return {
    text: cleanOutputText(json?.choices?.[0]?.message?.content || '', 10000),
    usage: {
      promptTokens: Math.max(0, Number(json?.usage?.prompt_tokens || 0)),
      completionTokens: Math.max(0, Number(json?.usage?.completion_tokens || 0)),
      totalTokens: Math.max(0, Number(json?.usage?.total_tokens || 0))
    }
  };
}

async function handleChat(request, env, origin, identity) {
  const payload = await readJsonPayload(request, env);
  const query = cleanText(payload?.query, 1200);
  const promptContext = String(payload?.retrieval?.promptContext || '');
  if (!query || !promptContext) {
    return jsonResponse({ error: 'query and retrieval.promptContext are required' }, 400, origin, env);
  }

  const reservedTokens = getResponseTokenLimit(env, payload);
  await enforceUsageProtection(request, env, identity.uid, reservedTokens);
  const providerResult = await callProvider(payload, env);
  return jsonResponse({
    ok: true,
    text: providerResult.text,
    model: getEnvText(env, 'ALERIA_GPT_MODEL'),
    sourceHash: payload?.retrieval?.sourceHash || '',
    usage: providerResult.usage
  }, 200, origin, env);
}

export default {
  async fetch(request, env) {
    const origin = String(request.headers.get('Origin') || '');
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse({ ok: true, service: 'aleria-gpt-worker' }, 200, origin, env);
    }

    if (!isOriginAllowed(origin, env)) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, origin, env);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, env)
      });
    }

    if (request.method === 'POST' && url.pathname === '/aleria-gpt/chat') {
      try {
        const token = getBearerToken(request);
        if (!token) throw Object.assign(new Error('Firebase-Anmeldung erforderlich.'), { status: 401 });
        const identity = await verifyFirebaseIdToken(token, env);
        return await handleChat(request, env, origin, identity);
      } catch (error) {
        const status = Number(error.status || 500);
        console.error('AleriaGPT worker request failed', { status, name: error?.name || 'Error' });
        return jsonResponse(
          { error: error.message || 'Worker error' },
          status,
          origin,
          env,
          error.retryAfterSeconds ? { 'Retry-After': String(error.retryAfterSeconds) } : {}
        );
      }
    }

    return jsonResponse({ error: 'Not found' }, 404, origin, env);
  }
};

export const workerInternals = Object.freeze({
  isOriginAllowed,
  getBearerToken,
  getResponseTokenLimit,
  nextUsageState,
  decodeJwtPart,
  resetFirebaseJwksCache,
  verifyFirebaseIdToken
});
