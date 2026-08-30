let _archiveDashboardInsightGenerationInFlight = false;

function getArchiveDashboardInsights() {
  return normalizeArchiveDashboardInsights(_archiveDashboardInsights)
    .filter(item => typeof isArchiveDashboardPlaceholderText !== 'function' || !isArchiveDashboardPlaceholderText(item.text));
}

function setArchiveDashboardInsights(items = [], options = {}) {
  _archiveDashboardInsights = normalizeArchiveDashboardInsights(items)
    .filter(item => typeof isArchiveDashboardPlaceholderText !== 'function' || !isArchiveDashboardPlaceholderText(item.text));
  if (options.persist !== false) saveModuleStore();
  return _archiveDashboardInsights;
}

function getArchiveDashboardInsightSourceLabel(item = {}) {
  return String(item.sourceLabel || item.pageTitle || item.moduleTitle || item.sourceRef || 'Archivquelle').trim();
}

function getArchiveDashboardInsightAvatar(item = {}) {
  const direct = sanitizeImageSrc(item.avatar || '');
  if (direct) return direct;
  const moduleId = String(item.moduleId || '').trim();
  if (!moduleId) return '';
  const match = getArchiveDashboardEntries(getValidSections())
    .find(candidate => String(candidate.entry?.id || '') === moduleId);
  return match ? getArchiveDashboardEntryImage(match.entry) : '';
}

function renderArchiveDashboardInsightCards(items = getArchiveDashboardInsights()) {
  if (!items.length) return '';
  return items.map(item => {
    const text = String(item.text || '').trim();
    const avatar = getArchiveDashboardInsightAvatar(item);
    const name = String(item.speakerName || item.moduleTitle || 'Archiv').trim();
    const sourceLabel = getArchiveDashboardInsightSourceLabel(item);
    return `
      <article class="archive-dashboard-trivia-card archive-dashboard-ai-card">
        <div class="archive-dashboard-trivia-avatar">
          ${avatar ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">` : `<span>${escapeHtml(getInitialChar(name))}</span>`}
        </div>
        <div>
          <div class="archive-dashboard-card-kicker">Archivfunke</div>
          <p>${escapeHtml(text)}</p>
          ${item.moduleId ? `
            <button type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(item.moduleId)}">
              ${escapeHtml(item.moduleTitle || item.moduleId)}
            </button>` : ''}
          <small>${escapeHtml(sourceLabel)}</small>
        </div>
      </article>`;
  }).join('');
}

function setArchiveDashboardInsightStatus(message, state = 'idle') {
  const panel = document.querySelector('[data-dashboard-insights-panel]');
  const status = document.querySelector('[data-dashboard-insights-status]');
  const button = document.querySelector('[data-archive-action="generate-dashboard-insights"]');
  if (panel) panel.dataset.insightState = state;
  if (status) {
    status.textContent = String(message || '');
    status.hidden = !message;
  }
  if (button) button.disabled = _archiveDashboardInsightGenerationInFlight;
}

function refreshArchiveDashboardInsightGrid() {
  const grid = document.querySelector('[data-dashboard-insights-grid]');
  if (!grid) return;
  grid.innerHTML = renderArchiveDashboardInsightCards();
  const count = getArchiveDashboardInsights().length;
  setArchiveDashboardInsightStatus(
    count ? `${count} gespeicherte Archivfunken.` : 'Noch keine KI-Funken gespeichert.',
    count ? 'ready' : 'idle'
  );
}

function buildArchiveDashboardInsightQuery() {
  return [
    'Finde 4 bis 5 spannende, quellengebundene Archivfunken fuer das Aleria-Almanach-Dashboard.',
    'Nutze Module, Seiten, Szenendialoge und gespeicherte Kommentare.',
    'Wichtig sind konkrete Details, Beziehungen, Widersprueche, kuriose Beobachtungen oder kleine Lore-Hinweise.',
    'Gib nur belegte Aussagen aus. Keine neuen Weltfakten erfinden.',
    'Jede Karte muss auf genau eine vorhandene Quelle verweisen.'
  ].join('\n');
}

function buildArchiveDashboardInsightPrompt(query, retrieval) {
  const sourceRefs = (retrieval?.chunks || [])
    .map((chunk, index) => `${index + 1}. ${chunk.sourceRef} | ${chunk.moduleTitle || chunk.title || 'Quelle'}${chunk.pageTitle ? ` / ${chunk.pageTitle}` : ''}${chunk.speakerName ? ` / ${chunk.speakerName}` : ''}`)
    .join('\n');
  return [
    query,
    '',
    'Antwortformat: Gib ausschliesslich gueltiges JSON aus, kein Markdown, keine Erklaerung.',
    'Schema:',
    '{"items":[{"text":"maximal 220 Zeichen","sourceRef":"exakter sourceRef aus den Quellen","sourceLabel":"kurzer Quellenname"}]}',
    '',
    'Regeln:',
    '- Genau 4 bis 5 items.',
    '- text ist Deutsch, praegnant und dashboardtauglich.',
    '- sourceRef muss exakt einer der folgenden sourceRef-Werte sein.',
    '- sourceLabel nennt Modul, Seite oder Sprecher knapp.',
    '',
    'Erlaubte sourceRef-Werte:',
    sourceRefs || 'Keine Quellen vorhanden.'
  ].join('\n');
}

function parseArchiveDashboardInsightJson(value) {
  let text = String(value || '').trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) text = text.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(text);
  return Array.isArray(parsed?.items) ? parsed.items : [];
}

function mapArchiveDashboardInsightSource(item, chunksByRef, sourceHash) {
  const sourceRef = String(item?.sourceRef || '').trim();
  const chunk = chunksByRef.get(sourceRef);
  if (!chunk) return null;
  const text = String(item?.text || '').trim();
  if (!text) return null;
  return {
    id: `insight-${hashAleriaGptSource(`${sourceHash}:${sourceRef}:${text}`)}`,
    text,
    sourceLabel: String(item?.sourceLabel || chunk.pageTitle || chunk.moduleTitle || chunk.sourceRef || '').trim(),
    sourceRef,
    moduleId: chunk.moduleId || '',
    moduleTitle: chunk.moduleTitle || chunk.title || '',
    pageTitle: chunk.pageTitle || '',
    speakerName: chunk.speakerName || '',
    generatedAt: new Date().toISOString(),
    sourceHash: sourceHash || ''
  };
}

async function generateArchiveDashboardInsights() {
  if (_archiveDashboardInsightGenerationInFlight) return;
  if (!window.AleriaGptClient?.isConfigured?.()) {
    setArchiveDashboardInsightStatus('AleriaGPT ist nicht verbunden. Worker-Endpoint fehlt.', 'error');
    return;
  }
  if (!window.AleriaGptRetrieval?.retrieve) {
    setArchiveDashboardInsightStatus('AleriaGPT-Retrieval ist nicht geladen.', 'error');
    return;
  }

  _archiveDashboardInsightGenerationInFlight = true;
  setArchiveDashboardInsightStatus('AleriaGPT durchsucht Module und Kommentare...', 'loading');
  let failed = false;

  try {
    const query = buildArchiveDashboardInsightQuery();
    const retrieval = await window.AleriaGptRetrieval.retrieve(query, {
      scope: 'all',
      limit: 40
    });
    const chunks = (retrieval?.chunks || []).filter(chunk => chunk?.sourceRef && chunk?.text);
    if (!chunks.length) throw new Error('Keine verwertbaren Quellen gefunden.');

    const chunksByRef = new Map(chunks.map(chunk => [chunk.sourceRef, chunk]));
    const prompt = buildArchiveDashboardInsightPrompt(query, { ...retrieval, chunks });
    const response = await window.AleriaGptClient.sendChat(prompt, { ...retrieval, chunks }, {
      responseMode: 'archive-insights-json',
      answerStyle: 'short',
      sourceLimit: 40,
      timeoutMs: 45000
    });
    if (!response.ok || !response.text) throw new Error('Keine KI-Antwort erhalten.');

    const mapped = parseArchiveDashboardInsightJson(response.text)
      .map(item => mapArchiveDashboardInsightSource(item, chunksByRef, retrieval.sourceHash || ''))
      .filter(Boolean)
      .slice(0, 5);
    if (mapped.length < 4) throw new Error('Die KI-Antwort enthielt zu wenige gueltige, quellengebundene Karten.');

    setArchiveDashboardInsights(mapped);
    refreshArchiveDashboardInsightGrid();
    renderAll();
    setArchiveDashboardInsightStatus(`${mapped.length} Archivfunken gespeichert.`, 'ready');
  } catch (error) {
    failed = true;
    console.warn('archive dashboard insight generation failed:', error);
    setArchiveDashboardInsightStatus(error?.message || 'Archivfunken konnten nicht erzeugt werden.', 'error');
  } finally {
    _archiveDashboardInsightGenerationInFlight = false;
    if (!failed) {
      setArchiveDashboardInsightStatus(
        getArchiveDashboardInsights().length ? `${getArchiveDashboardInsights().length} gespeicherte Archivfunken.` : 'Bereit fuer neue Archivfunken.',
        getArchiveDashboardInsights().length ? 'ready' : 'idle'
      );
    } else {
      const button = document.querySelector('[data-archive-action="generate-dashboard-insights"]');
      if (button) button.disabled = false;
    }
  }
}
