import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const PROVIDER_BASE_URL = String(process.env.ALERIA_GPT_PROVIDER_BASE_URL || '').replace(/\/+$/g, '');
const API_KEY = String(process.env.ALERIA_GPT_API_KEY || '');
const MODEL = String(process.env.ALERIA_GPT_MODEL || '');
const APP_URL = String(process.env.ALERIA_GPT_APP_URL || '');
const APP_TITLE = String(process.env.ALERIA_GPT_APP_TITLE || 'Aleria Almanach');
const MAX_TOKENS = Number(process.env.ALERIA_GPT_MAX_TOKENS || 700);
const TIMEOUT_MS = Number(process.env.ALERIA_GPT_TIMEOUT_MS || 30000);
const MAX_BODY_BYTES = Number(process.env.ALERIA_GPT_MAX_BODY_BYTES || 650000);
const ALLOWED_ORIGINS = String(process.env.ALERIA_GPT_ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (!ALLOWED_ORIGINS.length) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function sendJson(res, status, payload, origin = '') {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': origin && isOriginAllowed(origin) ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  });
  res.end(body);
}

function sendOptions(res, origin = '') {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': origin && isOriginAllowed(origin) ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  });
  res.end();
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(Object.assign(error, { status: 400 }));
      }
    });

    req.on('error', reject);
  });
}

function cleanText(value, maxLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function buildSystemPrompt() {
  return [
    'Du bist AleriaGPT, ein neutraler und sachlicher Gespraechs- und Analyseassistent fuer den Aleria Almanach.',
    'Antworte auf Deutsch.',
    'Sprich ruhig, direkt und natuerlich.',
    'Nutze den bereitgestellten Kontext, wenn die Frage Figuren, Module, Dialoge, Kommentare oder Almanach-Inhalte betrifft.',
    'Wenn der Kontext direkte Kommentare, Sprechertexte oder Szene-Dialoge enthaelt, haben diese Vorrang vor allgemeinen Moduldaten.',
    'Reagiere bei Kommentarfragen konkret auf Ton, Haltung, Sprecher, Reibungen, Zustimmung, Ablehnung und wiederkehrende Muster in den gelieferten Texten.',
    'Bei reiner Unterhaltung oder Bedienfragen darfst du kurz ohne Almanach-Deutung antworten.',
    'Trenne bei Analysen belegbare Beobachtung, Statistik und Interpretation.',
    'Erfinde keine Ereignisse, Figuren, Quellen oder Zitate.',
    'Wenn Daten fehlen, sage konkret, welche Daten fehlen.',
    'Bei Figurenanalysen formulierst du literarisch/rollenbezogen, nicht als medizinische Diagnose.',
    'Nutze Quellenhinweise nur sparsam, wenn sie fuer die Antwort wirklich helfen.'
  ].join(' ');
}

function buildUserPrompt(payload) {
  const query = cleanText(payload?.query, 1200);
  const promptContext = String(payload?.retrieval?.promptContext || '').slice(0, 60000);
  return [
    `Frage: ${query}`,
    '',
    promptContext,
    '',
    'Aufgabe:',
    'Beantworte die Frage direkt.',
    'Bei normalen Gespraechsfragen antworte kurz und natuerlich.',
    'Bei Kommentar- oder Szenenfragen nutze zuerst die gelieferten Kommentar- und Sprecherquellen.',
    'Bei Analysefragen beginne mit einer kurzen Kernaussage, danach 3-6 belegte Beobachtungen.',
    'Schliesse mit Unsicherheiten oder fehlenden Daten nur dann, wenn es relevant ist.'
  ].join('\n');
}

async function callProvider(payload) {
  if (!PROVIDER_BASE_URL || !API_KEY || !MODEL) {
    const error = new Error('AleriaGPT proxy is not configured');
    error.status = 503;
    throw error;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    };
    if (APP_URL) headers['HTTP-Referer'] = APP_URL;
    if (APP_TITLE) {
      headers['X-Title'] = APP_TITLE;
      headers['X-OpenRouter-Title'] = APP_TITLE;
    }

    const response = await fetch(`${PROVIDER_BASE_URL}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.25,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(payload) }
        ]
      })
    });

    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(`Provider returned HTTP ${response.status}`);
      error.status = 502;
      error.providerStatus = response.status;
      error.providerBody = json;
      throw error;
    }

    return cleanText(json?.choices?.[0]?.message?.content || '', 10000);
  } finally {
    clearTimeout(timer);
  }
}

async function handleChat(req, res, origin) {
  const payload = await readJsonBody(req);
  const query = cleanText(payload?.query, 1200);
  const promptContext = String(payload?.retrieval?.promptContext || '');
  if (!query || !promptContext) {
    sendJson(res, 400, { error: 'query and retrieval.promptContext are required' }, origin);
    return;
  }

  const text = await callProvider(payload);
  sendJson(res, 200, {
    ok: true,
    text,
    model: MODEL,
    sourceHash: payload?.retrieval?.sourceHash || ''
  }, origin);
}

const server = http.createServer(async (req, res) => {
  const origin = String(req.headers.origin || '');

  if (!isOriginAllowed(origin)) {
    sendJson(res, 403, { error: 'Origin not allowed' }, origin);
    return;
  }

  if (req.method === 'OPTIONS') {
    sendOptions(res, origin);
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, service: 'aleria-gpt-proxy' }, origin);
    return;
  }

  if (req.method === 'POST' && req.url === '/aleria-gpt/chat') {
    try {
      await handleChat(req, res, origin);
    } catch (error) {
      const status = Number(error.status || 500);
      console.error('AleriaGPT proxy error:', error);
      sendJson(res, status, { error: error.message || 'Proxy error' }, origin);
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' }, origin);
});

server.listen(PORT, () => {
  console.log(`AleriaGPT proxy listening on ${PORT}`);
});
