const SPEAKER_PROFILE_AI_CACHE = new Map();
const SPEAKER_PROFILE_AI_MAX_SEGMENTS = 80;
const SPEAKER_PROFILE_AI_MAX_TEXT_CHARS = 22000;

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
  const text = trimSpeakerProfileAiText(segment.text, 900);
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
    `Abschnitte: ${stats.segmentCount || 0}`,
    `Wortmaterial: ${stats.wordTotal || 0} auswertbare Woerter`,
    `Haeufige Woerter: ${topWords}`,
    `Kommentararten: ${topKinds}`,
    `Wiederkehrende Gespraechspartner: ${partners}`
  ].join('\n');
}

async function buildSpeakerProfileAiBroaderContext(name) {
  if (!window.AleriaGptRetrieval?.retrieve) return null;
  try {
    return await window.AleriaGptRetrieval.retrieve(
      `Analysiere ${name}: Ton, Stimmung, Strategie, Haltung zu den Ereignissen und wiederkehrende Muster.`,
      { scope: 'all', limit: 14 }
    );
  } catch (error) {
    console.warn('speaker profile broader retrieval failed:', error);
    return null;
  }
}

function buildSpeakerProfileAiRetrieval(name, stats, broaderRetrieval) {
  const transcript = buildSpeakerProfileAiTranscript(stats);
  const broaderContext = broaderRetrieval?.promptContext
    ? String(broaderRetrieval.promptContext).slice(0, 22000)
    : '';
  const promptContext = [
    'AleriaGPT Sprecherprofil-Kontext',
    '',
    'Metadaten fuer Gewichtung, nicht als eigentliche Zusammenfassung:',
    buildSpeakerProfileAiStatContext(name, stats),
    '',
    'Direkte Texte dieser Figur / dieses Sprechers:',
    transcript || 'Keine direkten Sprechertexte gefunden.',
    '',
    'Weiterer Almanach-Kontext zu Figur, Modulen, Dialogen und Kommentaren:',
    broaderContext || 'Kein weiterer Almanach-Kontext verfuegbar.'
  ].join('\n');

  return {
    sourceHash: `${broaderRetrieval?.sourceHash || 'speaker-profile'}:${stats.segmentCount || 0}:${stats.wordTotal || 0}`,
    detected: broaderRetrieval?.detected || {},
    stats: {
      speakerCommentCount: stats.commentCount || 0,
      speakerSegmentCount: stats.segmentCount || 0,
      speakerWordTotal: stats.wordTotal || 0,
      broaderChunkCount: broaderRetrieval?.stats?.returnedChunks || 0
    },
    promptContext,
    chunks: [
      ...(stats.analysisSegments || []).slice(0, 10).map((segment, index) => ({
        sourceType: 'speaker-direct-text',
        sourceRef: segment.sourceRef || `speaker-segment:${index}`,
        speakerName: name,
        kind: segment.kind || '',
        score: 100 - index,
        text: segment.text || ''
      })),
      ...((broaderRetrieval?.chunks || []).slice(0, 8))
    ]
  };
}

function buildSpeakerProfileAiQuery(name) {
  return [
    `Erstelle eine kompakte literarische Sprecheranalyse zu ${name}.`,
    'Fasse nicht die Metadaten zusammen, sondern das, was diese Person geschrieben hat.',
    'Ermittle Ton, Stimmung, wiederkehrende Haltung, moegliche Strategie und ihre Reaktion auf das Gesamtgeschehen dieser Seite.',
    'Trenne sichere Beobachtungen von vorsichtigen Interpretationen.',
    'Keine medizinische Diagnose und keine erfundenen Ereignisse.'
  ].join(' ');
}

function renderSpeakerProfileAiBox() {
  return `
    <div class="speaker-profile-section speaker-profile-ai" data-speaker-profile-ai-box>
      <div class="speaker-profile-section-title">KI-Einschaetzung</div>
      <div class="speaker-profile-ai-body" data-speaker-profile-ai-body>
        Die Auswertung wird vorbereitet.
      </div>
      <button class="speaker-profile-ai-btn" type="button" data-speaker-profile-action="generate-ai-summary">
        KI-Zusammenfassung neu erstellen
      </button>
    </div>`;
}

function updateSpeakerProfileAiBox(state, text = '') {
  const box = document.querySelector('[data-speaker-profile-ai-box]');
  const body = box?.querySelector?.('[data-speaker-profile-ai-body]');
  const button = box?.querySelector?.('[data-speaker-profile-action="generate-ai-summary"]');
  if (!body) return;
  box.dataset.speakerProfileAiState = state;
  if (button) button.disabled = state === 'loading';
  body.textContent = text;
}

async function generateSpeakerProfileAiSummary(context = {}) {
  const character = context.character || null;
  const fallbackName = context.fallbackName || '';
  const stats = context.stats || {};
  const name = getSpeakerProfileAiName(character, fallbackName);
  const cacheKey = getSpeakerProfileAiCacheKey(character, fallbackName, stats);

  if (!stats.segmentCount) {
    updateSpeakerProfileAiBox('empty', 'Fuer diese Figur gibt es noch zu wenig direkte Sprechertexte fuer eine belastbare KI-Einschaetzung.');
    return;
  }

  if (!window.AleriaGptClient?.isConfigured?.()) {
    updateSpeakerProfileAiBox('offline', 'AleriaGPT ist noch nicht mit dem Worker verbunden. Die Metadaten bleiben sichtbar; die KI-Einschaetzung kann erst mit aktivem Backend erstellt werden.');
    return;
  }

  if (SPEAKER_PROFILE_AI_CACHE.has(cacheKey)) {
    updateSpeakerProfileAiBox('ready', SPEAKER_PROFILE_AI_CACHE.get(cacheKey));
    return;
  }

  updateSpeakerProfileAiBox('loading', 'AleriaGPT liest die Sprechertexte und den Almanach-Kontext...');
  const broaderRetrieval = await buildSpeakerProfileAiBroaderContext(name);
  const retrieval = buildSpeakerProfileAiRetrieval(name, stats, broaderRetrieval);
  const response = await window.AleriaGptClient.sendChat(buildSpeakerProfileAiQuery(name), retrieval, {
    sourceLimit: 18,
    timeoutMs: 45000
  });

  if (!response.ok || !response.text) {
    updateSpeakerProfileAiBox('error', 'Die KI-Einschaetzung konnte nicht erstellt werden. Pruefe Worker, Modell oder OpenRouter-Guthaben.');
    return;
  }

  SPEAKER_PROFILE_AI_CACHE.set(cacheKey, response.text);
  updateSpeakerProfileAiBox('ready', response.text);
}
