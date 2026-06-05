const SPEAKER_PROFILE_AI_CACHE = new Map();
const SPEAKER_PROFILE_AI_MAX_SEGMENTS = 100;
const SPEAKER_PROFILE_AI_MAX_TEXT_CHARS = 28000;

let _speakerProfileAiContext = null;
let _speakerProfileAiMessages = [];

function getSpeakerProfileAiName(character, fallbackName = '') {
  return String(character?.name || fallbackName || 'Unbekannte Stimme').trim();
}

function getSpeakerProfileAiCacheKey(character, fallbackName, stats = {}) {
  const name = normalizeSpeakerProfileName(getSpeakerProfileAiName(character, fallbackName));
  const latest = Number(stats.latestMs || 0);
  return [
    character?.id || name,
    stats.commentCount || 0,
    stats.segmentCount || 0,
    stats.wordTotal || 0,
    latest
  ].join(':');
}

function trimSpeakerProfileAiText(text, maxChars) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, Math.max(0, maxChars - 3)).trim()}...`;
}

function formatSpeakerProfileAiSegment(segment, index) {
  const label = segment.label || segment.kind || 'Kommentar';
  const sourceRef = segment.sourceRef ? ` | ${segment.sourceRef}` : '';
  const text = trimSpeakerProfileAiText(segment.text, 1000);
  return `[${index + 1}] ${label}${sourceRef}\n${text}`;
}

function buildSpeakerProfileAiTranscript(stats = {}) {
  const segments = Array.isArray(stats.analysisSegments) ? stats.analysisSegments : [];
  let usedChars = 0;
  const lines = [];

  segments.slice(0, SPEAKER_PROFILE_AI_MAX_SEGMENTS).forEach((segment, index) => {
    const line = formatSpeakerProfileAiSegment(segment, index);
    if (usedChars + line.length > SPEAKER_PROFILE_AI_MAX_TEXT_CHARS) return;
    usedChars += line.length;
    lines.push(line);
  });

  return lines.join('\n\n');
}

function buildSpeakerProfileAiStatContext(name, stats = {}) {
  const topWords = (stats.topWords || []).map(item => `${item.word} (${item.count})`).join(', ') || 'keine';
  const topKinds = (stats.topKinds || []).map(item => `${item.label} (${item.count})`).join(', ') || 'keine';
  const partners = (stats.topPartners || []).map(item => `${item.name} (${item.count})`).join(', ') || 'keine';
  return [
    `Figur/Sprecher: ${name}`,
    `Kommentare gesamt: ${stats.commentCount || 0}`,
    `Kommentare in aktueller Szene: ${stats.currentCommentCount || 0}`,
    `Abschnitte: ${stats.segmentCount || 0}`,
    `Wortmaterial: ${stats.wordTotal || 0} auswertbare Woerter`,
    `Haeufige Woerter: ${topWords}`,
    `Kommentararten: ${topKinds}`,
    `Wiederkehrende Gespraechspartner: ${partners}`
  ].join('\n');
}

async function buildSpeakerProfileAiBroaderContext(name, context = {}) {
  if (!window.AleriaGptRetrieval?.retrieve) return null;
  try {
    const currentThreadIds = typeof getCurrentSpeakerProfileThreadIds === 'function'
      ? getCurrentSpeakerProfileThreadIds()
      : [];
    const moduleId = Array.isArray(currentThreadIds) && currentThreadIds.length
      ? String(currentThreadIds[0] || '').split(':')[0]
      : '';
    return await window.AleriaGptRetrieval.retrieve(
      `Analysiere ${name}: Ton, Stimmung, Strategie, Haltung zu den Ereignissen und Reaktionen in den Kommentaren.`,
      {
        scope: moduleId ? 'module' : 'all',
        moduleId,
        characterId: context.character?.id || '',
        characterName: name,
        limit: 24
      }
    );
  } catch (error) {
    console.warn('speaker profile broader retrieval failed:', error);
    return null;
  }
}

function buildSpeakerProfileAiRetrieval(name, stats, broaderRetrieval) {
  const transcript = buildSpeakerProfileAiTranscript(stats);
  const broaderContext = broaderRetrieval?.promptContext
    ? String(broaderRetrieval.promptContext).slice(0, 26000)
    : '';
  const promptContext = [
    'AleriaGPT Sprecherprofil-Kontext',
    '',
    'Wichtig: Die direkten Texte dieser Figur haben Vorrang vor Statistik und allgemeinem Almanach-Kontext.',
    '',
    'Metadaten fuer Gewichtung, nicht als eigentliche Zusammenfassung:',
    buildSpeakerProfileAiStatContext(name, stats),
    '',
    'Direkte Kommentare / Sprechertexte dieser Figur:',
    transcript || 'Keine direkten Sprechertexte gefunden.',
    '',
    'Weiterer Almanach-Kontext zu Figur, Modulen, Dialogen und Kommentaren:',
    broaderContext || 'Kein weiterer Almanach-Kontext verfuegbar.',
    '',
    'Arbeitsregel: Wenn direkte Kommentare vorhanden sind, beziehe dich konkret auf deren Ton, Haltung, Reaktion und wiederkehrende Muster. Erfinde keine Ereignisse.'
  ].join('\n');

  return {
    sourceHash: `${broaderRetrieval?.sourceHash || 'speaker-profile'}:${stats.segmentCount || 0}:${stats.wordTotal || 0}`,
    detected: broaderRetrieval?.detected || {},
    stats: {
      speakerCommentCount: stats.commentCount || 0,
      speakerCurrentCommentCount: stats.currentCommentCount || 0,
      speakerSegmentCount: stats.segmentCount || 0,
      speakerWordTotal: stats.wordTotal || 0,
      broaderChunkCount: broaderRetrieval?.stats?.returnedChunks || 0
    },
    promptContext,
    chunks: [
      ...(stats.analysisSegments || []).slice(0, 14).map((segment, index) => ({
        sourceType: 'speaker-direct-text',
        sourceRef: segment.sourceRef || `speaker-segment:${index}`,
        speakerName: name,
        kind: segment.kind || '',
        score: 120 - index,
        text: segment.text || ''
      })),
      ...((broaderRetrieval?.chunks || []).slice(0, 10))
    ]
  };
}

function buildSpeakerProfileAiSummaryQuery(name) {
  return [
    `Erstelle eine kompakte literarische Sprecheranalyse zu ${name}.`,
    'Fasse nicht nur Metadaten zusammen, sondern werte die direkten Kommentare aus.',
    'Ermittle Ton, Stimmung, wiederkehrende Haltung, moegliche Strategie und Reaktion auf das aktuelle Geschehen.',
    'Trenne sichere Beobachtungen von vorsichtigen Interpretationen.',
    'Keine medizinische Diagnose und keine erfundenen Ereignisse.'
  ].join(' ');
}

function buildSpeakerProfileAiCustomQuery(name, question) {
  return [
    `Beantworte diese Frage zu ${name}: ${String(question || '').trim()}`,
    'Nutze vor allem die direkten Kommentare/Sprechertexte dieser Figur.',
    'Wenn die Kommentare die Frage nicht belegen, sage klar, was fehlt.'
  ].join('\n');
}

function renderSpeakerProfileAiBox() {
  return `
    <div class="speaker-profile-section speaker-profile-ai" data-speaker-profile-ai-box>
      <div class="speaker-profile-section-title">KI-Metafunktion</div>
      <div class="speaker-profile-ai-body" data-speaker-profile-ai-body>
        Bereit. Du kannst eine Analyse erstellen oder eine konkrete Frage zu dieser Stimme stellen.
      </div>
      <div class="speaker-profile-ai-chat" data-speaker-profile-ai-chat-log></div>
      <form class="speaker-profile-ai-form" data-speaker-profile-action="submit-ai-chat">
        <textarea class="speaker-profile-ai-input" rows="3" placeholder="Frage zu Ton, Haltung, Reaktion oder Motivation..." aria-label="Frage an die KI-Metafunktion"></textarea>
        <div class="speaker-profile-ai-actions">
          <button class="speaker-profile-ai-btn" type="button" data-speaker-profile-action="generate-ai-summary">
            Analyse erstellen
          </button>
          <button class="speaker-profile-ai-btn" type="submit">
            Fragen
          </button>
        </div>
      </form>
    </div>`;
}

function setSpeakerProfileAiContext(context = {}) {
  _speakerProfileAiContext = {
    character: context.character || null,
    fallbackName: context.fallbackName || '',
    stats: context.stats || {}
  };
  _speakerProfileAiMessages = [];
  if (!window.AleriaGptClient?.isConfigured?.()) {
    updateSpeakerProfileAiBox('offline', 'AleriaGPT ist noch nicht mit dem Worker verbunden. Pruefe Endpoint und Worker-CORS.');
    return;
  }
  updateSpeakerProfileAiBox('ready', 'Bereit. Die Metafunktion nutzt direkte Kommentare dieser Stimme und den aktuellen Almanach-Kontext.');
  renderSpeakerProfileAiMessages();
}

function updateSpeakerProfileAiBox(state, text = '') {
  const box = document.querySelector('[data-speaker-profile-ai-box]');
  const body = box?.querySelector?.('[data-speaker-profile-ai-body]');
  const buttons = box?.querySelectorAll?.('.speaker-profile-ai-btn') || [];
  if (!body) return;
  box.dataset.speakerProfileAiState = state;
  buttons.forEach(button => {
    button.disabled = state === 'loading';
  });
  body.textContent = text;
}

function addSpeakerProfileAiMessage(role, text) {
  _speakerProfileAiMessages.push({
    role: role === 'user' ? 'user' : 'assistant',
    text: String(text || ''),
    createdAt: Date.now()
  });
  _speakerProfileAiMessages = _speakerProfileAiMessages.slice(-16);
  renderSpeakerProfileAiMessages();
}

function renderSpeakerProfileAiMessages() {
  const log = document.querySelector('[data-speaker-profile-ai-chat-log]');
  if (!log) return;
  log.innerHTML = _speakerProfileAiMessages.map(message => `
    <article class="speaker-profile-ai-message ${message.role}">
      <div class="speaker-profile-ai-message-role">${message.role === 'user' ? 'Du' : 'AleriaGPT'}</div>
      <div class="speaker-profile-ai-message-text">${escapeHtml(message.text || '')}</div>
    </article>
  `).join('');
  log.scrollTop = log.scrollHeight;
}

async function requestSpeakerProfileAi(question, options = {}) {
  const context = options.context || _speakerProfileAiContext || {};
  const character = context.character || null;
  const fallbackName = context.fallbackName || '';
  const stats = context.stats || {};
  const name = getSpeakerProfileAiName(character, fallbackName);

  if (!stats.segmentCount) {
    updateSpeakerProfileAiBox('empty', 'Fuer diese Figur gibt es noch zu wenig direkte Sprechertexte fuer eine belastbare KI-Einschaetzung.');
    return '';
  }

  if (!window.AleriaGptClient?.isConfigured?.()) {
    updateSpeakerProfileAiBox('offline', 'AleriaGPT ist noch nicht mit dem Worker verbunden. Pruefe Endpoint und Worker-CORS.');
    return '';
  }

  updateSpeakerProfileAiBox('loading', 'AleriaGPT liest direkte Kommentare und aktuellen Almanach-Kontext...');
  const broaderRetrieval = await buildSpeakerProfileAiBroaderContext(name, context);
  const retrieval = buildSpeakerProfileAiRetrieval(name, stats, broaderRetrieval);
  const response = await window.AleriaGptClient.sendChat(question, retrieval, {
    sourceLimit: 24,
    timeoutMs: 45000
  });

  if (!response.ok || !response.text) {
    updateSpeakerProfileAiBox('error', 'Die KI-Antwort konnte nicht erstellt werden. Pruefe Worker, Modell, CORS oder OpenRouter-Guthaben.');
    return '';
  }

  updateSpeakerProfileAiBox('ready', 'Antwort erstellt. Du kannst weiter nachfragen.');
  return response.text;
}

async function generateSpeakerProfileAiSummary(context = {}) {
  if (context?.stats) {
    _speakerProfileAiContext = context;
  }
  const active = _speakerProfileAiContext || context || {};
  const character = active.character || null;
  const fallbackName = active.fallbackName || '';
  const stats = active.stats || {};
  const name = getSpeakerProfileAiName(character, fallbackName);
  const cacheKey = getSpeakerProfileAiCacheKey(character, fallbackName, stats);

  if (SPEAKER_PROFILE_AI_CACHE.has(cacheKey)) {
    const cached = SPEAKER_PROFILE_AI_CACHE.get(cacheKey);
    updateSpeakerProfileAiBox('ready', 'Analyse aus Zwischenspeicher geladen.');
    addSpeakerProfileAiMessage('assistant', cached);
    return;
  }

  const text = await requestSpeakerProfileAi(buildSpeakerProfileAiSummaryQuery(name), { context: active });
  if (!text) return;
  SPEAKER_PROFILE_AI_CACHE.set(cacheKey, text);
  addSpeakerProfileAiMessage('assistant', text);
}

async function submitSpeakerProfileAiChat(question) {
  const active = _speakerProfileAiContext || {};
  const name = getSpeakerProfileAiName(active.character, active.fallbackName);
  const cleanQuestion = String(question || '').trim();
  if (!cleanQuestion) return;
  addSpeakerProfileAiMessage('user', cleanQuestion);
  const text = await requestSpeakerProfileAi(buildSpeakerProfileAiCustomQuery(name, cleanQuestion), { context: active });
  if (text) addSpeakerProfileAiMessage('assistant', text);
}
