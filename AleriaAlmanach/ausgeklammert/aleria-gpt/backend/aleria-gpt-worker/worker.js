const DEFAULT_PROVIDER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MAX_TOKENS = 700;
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_BODY_CHARS = 650000;

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
  if (!origin) return true;
  const allowed = getAllowedOrigins(env);
  if (!allowed.length) return false;
  return allowed.includes(origin);
}

function corsHeaders(origin, env) {
  return {
    'Access-Control-Allow-Origin': origin && isOriginAllowed(origin, env) ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function jsonResponse(payload, status = 200, origin = '', env = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      ...corsHeaders(origin, env)
    }
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

async function callProvider(payload, env) {
  const providerBaseUrl = getEnvText(env, 'ALERIA_GPT_PROVIDER_BASE_URL', DEFAULT_PROVIDER_BASE_URL).replace(/\/+$/g, '');
  const apiKey = getEnvText(env, 'ALERIA_GPT_API_KEY');
  const model = getEnvText(env, 'ALERIA_GPT_MODEL');
  const maxTokens = getEnvNumber(env, 'ALERIA_GPT_MAX_TOKENS', DEFAULT_MAX_TOKENS);
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

  return cleanText(json?.choices?.[0]?.message?.content || '', 10000);
}

async function handleChat(request, env, origin) {
  const payload = await readJsonPayload(request, env);
  const query = cleanText(payload?.query, 1200);
  const promptContext = String(payload?.retrieval?.promptContext || '');
  if (!query || !promptContext) {
    return jsonResponse({ error: 'query and retrieval.promptContext are required' }, 400, origin, env);
  }

  const text = await callProvider(payload, env);
  return jsonResponse({
    ok: true,
    text,
    model: getEnvText(env, 'ALERIA_GPT_MODEL'),
    sourceHash: payload?.retrieval?.sourceHash || ''
  }, 200, origin, env);
}

export default {
  async fetch(request, env) {
    const origin = String(request.headers.get('Origin') || '');
    const url = new URL(request.url);

    if (!isOriginAllowed(origin, env)) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, origin, env);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, env)
      });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse({ ok: true, service: 'aleria-gpt-worker' }, 200, origin, env);
    }

    if (request.method === 'POST' && url.pathname === '/aleria-gpt/chat') {
      try {
        return await handleChat(request, env, origin);
      } catch (error) {
        console.error('AleriaGPT worker error:', error);
        return jsonResponse({ error: error.message || 'Worker error' }, Number(error.status || 500), origin, env);
      }
    }

    return jsonResponse({ error: 'Not found' }, 404, origin, env);
  }
};
