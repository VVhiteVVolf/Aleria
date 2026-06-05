const ALERIA_GPT_BACKEND_ENDPOINT_KEY = 'aleria-gpt-backend-endpoint-v1';
const ALERIA_GPT_CLIENT_TIMEOUT_MS = 30000;

function normalizeAleriaGptEndpoint(value) {
  return String(value || '').trim().replace(/\/+$/g, '');
}

function getAleriaGptBackendEndpoint() {
  const globalEndpoint = normalizeAleriaGptEndpoint(window.ALERIA_GPT_BACKEND_ENDPOINT || '');
  if (globalEndpoint) return globalEndpoint;
  try {
    return normalizeAleriaGptEndpoint(localStorage.getItem(ALERIA_GPT_BACKEND_ENDPOINT_KEY) || '');
  } catch {
    return '';
  }
}

function setAleriaGptBackendEndpoint(endpoint) {
  const normalized = normalizeAleriaGptEndpoint(endpoint);
  try {
    if (normalized) localStorage.setItem(ALERIA_GPT_BACKEND_ENDPOINT_KEY, normalized);
    else localStorage.removeItem(ALERIA_GPT_BACKEND_ENDPOINT_KEY);
  } catch {
    // localStorage may be blocked; global fallback still works.
  }
  window.ALERIA_GPT_BACKEND_ENDPOINT = normalized;
  return normalized;
}

function isAleriaGptBackendConfigured() {
  return !!getAleriaGptBackendEndpoint();
}

async function fetchAleriaGptWithTimeout(url, options = {}, timeoutMs = ALERIA_GPT_CLIENT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function buildAleriaGptChatPayload(query, retrieval, options = {}) {
  return {
    schemaVersion: 1,
    query: String(query || '').trim(),
    scope: options.scope || {},
    retrieval: {
      sourceHash: retrieval?.sourceHash || '',
      detected: retrieval?.detected || {},
      stats: retrieval?.stats || {},
      promptContext: retrieval?.promptContext || '',
      chunks: (retrieval?.chunks || []).slice(0, Number(options.sourceLimit || 12)).map(chunk => ({
        sourceType: chunk.sourceType || '',
        sourceRef: chunk.sourceRef || '',
        moduleId: chunk.moduleId || '',
        moduleTitle: chunk.moduleTitle || '',
        pageTitle: chunk.pageTitle || '',
        speakerName: chunk.speakerName || '',
        kind: chunk.kind || '',
        score: Number(chunk.score || 0),
        text: chunk.text || ''
      }))
    }
  };
}

async function sendAleriaGptChat(query, retrieval, options = {}) {
  const endpoint = getAleriaGptBackendEndpoint();
  if (!endpoint) {
    return {
      ok: false,
      status: 'not-configured',
      text: '',
      raw: null
    };
  }

  const url = `${endpoint}/aleria-gpt/chat`;
  const response = await fetchAleriaGptWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildAleriaGptChatPayload(query, retrieval, options))
  }, Number(options.timeoutMs || ALERIA_GPT_CLIENT_TIMEOUT_MS));

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      text: '',
      raw: json
    };
  }

  return {
    ok: true,
    status: response.status,
    text: String(json?.text || json?.message || json?.reply || '').trim(),
    raw: json
  };
}

window.AleriaGptClient = {
  getEndpoint: getAleriaGptBackendEndpoint,
  setEndpoint: setAleriaGptBackendEndpoint,
  isConfigured: isAleriaGptBackendConfigured,
  sendChat: sendAleriaGptChat,
  buildChatPayload: buildAleriaGptChatPayload
};

window.setAleriaGptBackendEndpoint = setAleriaGptBackendEndpoint;

