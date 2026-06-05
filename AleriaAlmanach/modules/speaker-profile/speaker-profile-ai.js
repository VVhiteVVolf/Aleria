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
    'Arbeitsregel: Wenn direkte Kommentare vorhanden sind, beziehe dich konkret auf deren Ton, Haltung, Reaktion und wiederkehrende Muster. Erfinde keine Ereignisse.',
    'Antworte normal und lesbar. Verwende keine Quellenmarker wie [1] und keine standardisierte Gutachtenform mit Kernaussage/Beobachtungen, ausser der Nutzer verlangt das ausdruecklich.'
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
    `Fasse kurz und normal zusammen, was in den direkten Texten von ${name} tatsaechlich erkennbar ist.`,
    'Nutze keine Quellenmarker, keine Markdown-Trennlinien und keine Ueberschrift "Kernaussage".',
    'Bleibe bei Ton, sichtbarer Haltung und auffaelligen Formulierungen. Keine tiefen psychologischen Deutungen.',
    'Wenn das Material duenn oder uneindeutig ist, sage das klar.'
  ].join(' ');
}

function buildSpeakerProfileAiCustomQuery(name, question) {
  return [
    `Beantworte diese Frage zu ${name} normal und direkt: ${String(question || '').trim()}`,
    'Nutze vor allem die direkten Kommentare/Sprechertexte dieser Figur.',
    'Antworte wie in einem Chat, nicht wie in einem Gutachten.',
    'Nutze lesbare Formatierung: kurze Absaetze, einfache Listen mit "- " bei mehreren Punkten und sparsame Hervorhebungen mit **fett**.',
    'Nutze keine Quellenmarker und erfinde keine inneren Motive.',
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

function escapeSpeakerProfileAiHtml(value) {
  if (typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSpeakerProfileAiInlineMarkdown(value) {
  return escapeSpeakerProfileAiHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function renderSpeakerProfileAiFormattedText(value) {
  const text = String(value || '').replace(/\r\n?/g, '\n').trim();
  if (!text) return '';

  return text.split(/\n{2,}/g).map(block => {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    if (!lines.length) return '';

    const bulletItems = lines
      .map(line => line.match(/^[-*]\s+(.+)$/))
      .filter(Boolean);
    if (bulletItems.length === lines.length) {
      return `<ul>${bulletItems.map(match => `<li>${renderSpeakerProfileAiInlineMarkdown(match[1])}</li>`).join('')}</ul>`;
    }

    const numberedItems = lines
      .map(line => line.match(/^\d+[.)]\s+(.+)$/))
      .filter(Boolean);
    if (numberedItems.length === lines.length) {
      return `<ol>${numberedItems.map(match => `<li>${renderSpeakerProfileAiInlineMarkdown(match[1])}</li>`).join('')}</ol>`;
    }

    const heading = lines.length === 1 ? lines[0].match(/^#{1,3}\s+(.+)$/) : null;
    if (heading) {
      return `<h4>${renderSpeakerProfileAiInlineMarkdown(heading[1])}</h4>`;
    }

    return `<p>${lines.map(renderSpeakerProfileAiInlineMarkdown).join('<br>')}</p>`;
  }).filter(Boolean).join('');
}

function renderSpeakerProfileAiMessages() {
  const log = document.querySelector('[data-speaker-profile-ai-chat-log]');
  if (!log) return;
  log.innerHTML = _speakerProfileAiMessages.map(message => `
    <article class="speaker-profile-ai-message ${message.role}">
      <div class="speaker-profile-ai-message-role">${message.role === 'user' ? 'Du' : 'AleriaGPT'}</div>
      <div class="speaker-profile-ai-message-text">${renderSpeakerProfileAiFormattedText(message.text || '')}</div>
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
  const broaderRetrieval = options.includeBroaderContext
    ? await buildSpeakerProfileAiBroaderContext(name, context)
    : null;
  const retrieval = buildSpeakerProfileAiRetrieval(name, stats, broaderRetrieval);
  const response = await window.AleriaGptClient.sendChat(question, retrieval, {
    sourceLimit: 24,
    timeoutMs: 45000,
    responseMode: options.responseMode || 'chat'
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

  const text = await requestSpeakerProfileAi(buildSpeakerProfileAiSummaryQuery(name), {
    context: active,
    responseMode: 'summary',
    includeBroaderContext: false
  });
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
  const text = await requestSpeakerProfileAi(buildSpeakerProfileAiCustomQuery(name, cleanQuestion), {
    context: active,
    responseMode: 'chat',
    includeBroaderContext: false
  });
  if (text) addSpeakerProfileAiMessage('assistant', text);
}
