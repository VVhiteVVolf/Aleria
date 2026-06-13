// KI helper for the new-comment composer.
// Keeps prompt building and suggestion insertion out of the core comment flow.

let _commentAssistantSuggestion = '';
let _commentAssistantInFlight = false;

function getCommentAssistantElements() {
  const root = document.querySelector('[data-comment-assistant]');
  return {
    root,
    body: root?.querySelector?.('.comment-assistant-body') || null,
    toggle: root?.querySelector?.('[data-comment-assistant-action="toggle"]') || null,
    prompt: root?.querySelector?.('[data-comment-assistant-prompt]') || null,
    status: root?.querySelector?.('[data-comment-assistant-status]') || null,
    result: root?.querySelector?.('[data-comment-assistant-result]') || null,
    generate: root?.querySelector?.('[data-comment-assistant-action="generate"]') || null,
    insert: root?.querySelector?.('[data-comment-assistant-action="insert"]') || null
  };
}

function setCommentAssistantStatus(message, state = 'idle') {
  const { root, status } = getCommentAssistantElements();
  if (root) root.dataset.commentAssistantState = state;
  if (status) status.textContent = String(message || '');
}

function setCommentAssistantLoading(loading) {
  _commentAssistantInFlight = !!loading;
  const { generate, insert } = getCommentAssistantElements();
  if (generate) generate.disabled = _commentAssistantInFlight;
  if (insert) insert.disabled = _commentAssistantInFlight || !_commentAssistantSuggestion;
}

function resetCommentAssistant() {
  _commentAssistantSuggestion = '';
  const { body, toggle, prompt, result, insert } = getCommentAssistantElements();
  if (body) body.hidden = true;
  if (toggle) {
    toggle.textContent = 'Oeffnen';
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (prompt) prompt.value = '';
  if (result) {
    result.textContent = '';
    result.hidden = true;
  }
  if (insert) insert.disabled = true;
  setCommentAssistantStatus('Waehle eine Figur oder den Erzaehler, dann kann AleriaGPT aus aktuellem Modul- und Figurenkontext helfen.');
  setCommentAssistantLoading(false);
}

function getCommentAssistantActor() {
  if (_commentMode === 'narrator') {
    return {
      mode: 'narrator',
      name: 'Erzaehler',
      title: '',
      characterId: '',
      valid: true
    };
  }

  if (_selectedCharId) {
    const character = getAvailableCommentCharacterById(_selectedCharId);
    if (character) {
      return {
        mode: 'character',
        name: String(character.name || '').trim(),
        title: String(character.title || '').trim(),
        characterId: String(_selectedCharId || '').trim(),
        valid: true
      };
    }
  }

  if (_manualMode) {
    const name = document.getElementById('cf-name')?.value.trim() || '';
    const title = document.getElementById('cf-title')?.value.trim() || '';
    return {
      mode: 'manual',
      name,
      title,
      characterId: '',
      valid: !!name
    };
  }

  return {
    mode: 'missing',
    name: '',
    title: '',
    characterId: '',
    valid: false
  };
}

function getCommentAssistantCurrentDraft() {
  if (!Array.isArray(_commentSegments)) return '';
  return _commentSegments
    .map(segment => String(segment?.text || '').trim())
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function toCommentAssistantPlainText(value) {
  if (window.AleriaGptContext?.toPlainText) {
    return window.AleriaGptContext.toPlainText(value);
  }
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCommentAssistantThreadSummary() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  const entry = thread?.entry || (currentEntry && typeof getRenderableEntry === 'function' ? getRenderableEntry(currentEntry) : currentEntry);
  const page = thread?.page || null;
  return {
    thread,
    entry,
    page,
    moduleId: String(entry?.id || currentEntry?.id || '').trim(),
    moduleTitle: String(entry?.title || '').trim(),
    pageTitle: String(page?.pageTitle || '').trim(),
    threadKind: String(thread?.kind || '').trim()
  };
}

function getCommentAssistantPageText(summary) {
  const page = summary?.page || null;
  const entry = summary?.entry || null;
  const lines = [];
  const pushLine = (label, value) => {
    const text = toCommentAssistantPlainText(value);
    if (text) lines.push(`${label}: ${text}`);
  };

  pushLine('Modul', entry?.title);
  pushLine('Untertitel', entry?.subtitle);
  pushLine('Seitentitel', page?.pageTitle);
  pushLine('Seitentext', page?.description);
  pushLine('Sitzungseinleitung', page?.sessionIntro);
  pushLine('Sitzungshinweis', page?.sessionHint);
  pushLine('Seitenkommentar', page?.commentText);
  pushLine('Zitat', page?.quote);
  pushLine('Zitatquelle', page?.quoteBy);

  (Array.isArray(page?.stats) ? page.stats : []).forEach(stat => {
    if (Array.isArray(stat)) pushLine('Seitenfakt', stat.join(': '));
  });
  (Array.isArray(page?.sceneBlocks) ? page.sceneBlocks : []).forEach((block, index) => {
    const text = [block?.name, block?.title, block?.text]
      .map(toCommentAssistantPlainText)
      .filter(Boolean)
      .join(' - ');
    if (text) lines.push(`Szenenblock ${index + 1}: ${text}`);
  });
  (Array.isArray(page?.commentSequence) ? page.commentSequence : []).forEach((block, index) => {
    const speaker = block?.narrator ? 'Erzaehler' : (block?.name || 'Stimme');
    const text = [speaker, block?.title, block?.text]
      .map(toCommentAssistantPlainText)
      .filter(Boolean)
      .join(' - ');
    if (text) lines.push(`Vorgegebener Seitenkommentar ${index + 1}: ${text}`);
  });

  return Array.from(new Set(lines)).join('\n');
}

function getCommentAssistantCommentText(comment) {
  const segments = Array.isArray(comment?.commentSegments) && comment.commentSegments.length
    ? comment.commentSegments
    : [{ text: comment?.text || '', kind: comment?.commentKind || (comment?.narrator ? 'narrator' : 'speech') }];

  return segments
    .map((segment, index) => {
      const narrator = !!comment?.narrator || !!segment?.narrator || String(comment?.commentMode || '') === 'narrator';
      const speaker = narrator
        ? 'Erzaehler'
        : String(segment?.charName || segment?.name || comment?.charName || 'Unbekannte Stimme').trim();
      const kind = typeof getCommentKindLabel === 'function'
        ? getCommentKindLabel(segment?.kind || segment?.commentKind || comment?.commentKind || (narrator ? 'narrator' : 'speech'))
        : String(segment?.kind || comment?.commentKind || 'Kommentar');
      const text = toCommentAssistantPlainText(segment?.text || '');
      if (!text) return '';
      return `${speaker} [${kind}${segments.length > 1 ? `, Abschnitt ${index + 1}` : ''}]: ${text}`;
    })
    .filter(Boolean)
    .join('\n');
}

async function getCommentAssistantThreadComments(threadId) {
  const safeThreadId = String(threadId || '').trim();
  if (!safeThreadId) return [];

  try {
    const backend = typeof getCommentBackend === 'function'
      ? await getCommentBackend({ timeoutMs: 2500 })
      : null;
    if (backend?.loadComments) {
      const comments = await backend.loadComments(safeThreadId);
      if (Array.isArray(comments)) {
        _commentCache[safeThreadId] = comments;
        return sortCommentsByTimeline(comments);
      }
    }
  } catch (error) {
    console.warn('comment assistant thread load failed:', error);
  }

  if (Array.isArray(_commentCache?.[safeThreadId])) {
    return sortCommentsByTimeline(_commentCache[safeThreadId]);
  }
  return [];
}

function buildCommentAssistantThreadTranscript(comments, insertAfterId = '') {
  const lines = [];
  const targetInsertAfterId = String(insertAfterId || '').trim();

  (Array.isArray(comments) ? comments : []).forEach((comment, index) => {
    const text = getCommentAssistantCommentText(comment);
    if (!text) return;
    lines.push(`[${index + 1}] ${text}`);
    if (targetInsertAfterId && String(comment?.id || '') === targetInsertAfterId) {
      lines.push('--- Neuer Kommentar wird direkt nach diesem Beitrag eingefuegt. ---');
    }
  });

  if (targetInsertAfterId && !lines.some(line => line.includes('Neuer Kommentar wird direkt nach diesem Beitrag'))) {
    lines.push('--- Neuer Kommentar wird nachtraeglich eingefuegt; Zielbeitrag wurde im Cache nicht gefunden. ---');
  }

  return lines.join('\n\n');
}

async function buildCommentAssistantRequiredContext(summary) {
  const threadId = String(summary?.thread?.threadId || '').trim();
  const comments = await getCommentAssistantThreadComments(threadId);
  return {
    pageText: getCommentAssistantPageText(summary),
    comments,
    transcript: buildCommentAssistantThreadTranscript(comments, _commentInsertAfterId),
    threadId
  };
}

function buildCommentAssistantQuery(actor, summary, userHint, draftText, requiredContext) {
  const roleInstruction = actor.mode === 'narrator'
    ? 'Schreibe als Erzaehler: beobachtend, knapp, neutral, ohne Figureninnenleben zu erfinden.'
    : `Schreibe aus der Perspektive von ${actor.name}${actor.title ? ` (${actor.title})` : ''}.`;

  return [
    'Erstelle einen konkreten Kommentarentwurf fuer den AleriaAlmanach-Kommentarmodus.',
    roleInstruction,
    summary.moduleTitle ? `Aktuelles Modul: ${summary.moduleTitle}` : '',
    summary.pageTitle ? `Aktuelle Seite: ${summary.pageTitle}` : '',
    summary.threadKind ? `Kommentarbereich: ${summary.threadKind}` : '',
    '',
    'PFLICHTKONTEXT - AKTUELLE SEITE:',
    requiredContext?.pageText || 'Keine auswertbaren Seitentexte gefunden.',
    '',
    'PFLICHTKONTEXT - BISHERIGER KOMMENTARVERLAUF IN REIHENFOLGE:',
    requiredContext?.transcript || 'Noch keine bisherigen Kommentare in diesem Kommentarbereich.',
    '',
    userHint ? `Nutzerwunsch fuer die Reaktion: ${userHint}` : 'Nutzerwunsch fuer die Reaktion: passend zum aktuellen Kontext.',
    draftText ? `Bereits im Formular stehender Entwurf, falls als Fortsetzung relevant:\n${draftText}` : '',
    '',
    'Regeln:',
    '- Die aktuelle Seite und der bisherige Kommentarverlauf sind Pflichtkontext und haben Vorrang vor allgemeinen Almanach-Treffern.',
    '- Beachte die Reihenfolge des Kommentarverlaufs und reagiere auf den letzten passenden Beitrag bzw. die markierte Einfuegestelle.',
    '- Gib nur den Kommentartext aus, keine Erklaerung und keine Quellenmarker.',
    '- Keine neuen Weltfakten, Orte, Verwandtschaften, Motive oder Ereignisse erfinden.',
    '- Wenn der Kontext unsicher ist, schreibe vorsichtig und situativ.',
    '- 1 bis 3 kurze Abschnitte, maximal etwa 900 Zeichen.',
    '- Nutze nur einfache Kommentarformatierung, wenn sie wirklich hilft: **fett**, *kursiv*, ||Spoiler||.'
  ].filter(Boolean).join('\n');
}

function buildCommentAssistantRequiredPromptContext(actor, summary, requiredContext) {
  return [
    'Kommentar-Assistent Pflichtkontext',
    `Figur/Modus: ${actor.name || actor.mode}`,
    summary.moduleTitle ? `Aktuelles Modul: ${summary.moduleTitle}` : '',
    summary.pageTitle ? `Aktuelle Seite: ${summary.pageTitle}` : '',
    requiredContext?.threadId ? `Kommentar-Thread: ${requiredContext.threadId}` : '',
    '',
    'Aktuelle Seite:',
    requiredContext?.pageText || 'Keine auswertbaren Seitentexte gefunden.',
    '',
    'Bisheriger Kommentarverlauf in korrekter Reihenfolge:',
    requiredContext?.transcript || 'Noch keine bisherigen Kommentare in diesem Kommentarbereich.',
    '',
    'Regel: Dieser Pflichtkontext ist wichtiger als nachgelagerte Retrieval-Treffer. Keine Reihenfolge umsortieren.'
  ].filter(Boolean).join('\n');
}

function enrichCommentAssistantRetrieval(retrieval, actor, summary, requiredContext) {
  const requiredPrompt = buildCommentAssistantRequiredPromptContext(actor, summary, requiredContext);
  const requiredChunks = [
    {
      sourceType: 'current-comment-page',
      sourceRef: `comment-assistant:page:${summary.moduleId || 'current'}:${summary.thread?.pageIndex ?? ''}`,
      moduleId: summary.moduleId,
      moduleTitle: summary.moduleTitle,
      pageTitle: summary.pageTitle,
      speakerName: '',
      kind: 'required-current-page',
      score: 10000,
      text: requiredContext?.pageText || 'Keine auswertbaren Seitentexte gefunden.'
    },
    {
      sourceType: 'current-comment-thread',
      sourceRef: `comment-assistant:thread:${requiredContext?.threadId || 'current'}`,
      moduleId: summary.moduleId,
      moduleTitle: summary.moduleTitle,
      pageTitle: summary.pageTitle,
      speakerName: actor.name,
      kind: 'required-ordered-comments',
      score: 9999,
      text: requiredContext?.transcript || 'Noch keine bisherigen Kommentare in diesem Kommentarbereich.'
    }
  ];

  return {
    ...(retrieval || {}),
    promptContext: [
      requiredPrompt,
      retrieval?.promptContext || ''
    ].filter(Boolean).join('\n\n--- Weitere Almanach-Treffer ---\n\n'),
    chunks: [
      ...requiredChunks,
      ...((retrieval?.chunks || []).filter(chunk =>
        chunk?.sourceType !== 'current-comment-page' &&
        chunk?.sourceType !== 'current-comment-thread'
      ))
    ],
    stats: {
      ...(retrieval?.stats || {}),
      requiredCommentCount: requiredContext?.comments?.length || 0,
      requiredThreadIncluded: true
    }
  };
}

function cleanCommentAssistantSuggestion(value) {
  let text = String(value || '').trim();
  text = text.replace(/^```(?:\w+)?\s*/i, '').replace(/\s*```$/i, '').trim();
  text = text.replace(/^\s*(?:Kommentar|Vorschlag|Entwurf)\s*:\s*/i, '').trim();
  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
}

async function generateCommentAssistantSuggestion() {
  if (_commentAssistantInFlight) return;

  const actor = getCommentAssistantActor();
  if (!actor.valid) {
    setCommentAssistantStatus('Waehle zuerst eine Figur oder trage im manuellen Modus einen Namen ein.', 'error');
    return;
  }

  if (!window.AleriaGptClient?.isConfigured?.()) {
    setCommentAssistantStatus('AleriaGPT ist nicht verbunden. Der Worker-Endpoint ist in dieser Umgebung nicht konfiguriert.', 'error');
    return;
  }

  if (!window.AleriaGptRetrieval?.retrieve) {
    setCommentAssistantStatus('AleriaGPT-Retrieval ist nicht geladen.', 'error');
    return;
  }

  const { prompt, result } = getCommentAssistantElements();
  setCommentAssistantLoading(true);
  setCommentAssistantStatus('AleriaGPT liest aktuelle Seite und Kommentarverlauf in Reihenfolge...', 'loading');

  try {
    const userHint = String(prompt?.value || '').trim();
    const draftText = getCommentAssistantCurrentDraft();
    const summary = getCommentAssistantThreadSummary();
    const requiredContext = await buildCommentAssistantRequiredContext(summary);
    const query = buildCommentAssistantQuery(actor, summary, userHint, draftText, requiredContext);
    const retrieval = await window.AleriaGptRetrieval.retrieve(query, {
      scope: summary.moduleId ? 'module' : 'all',
      moduleId: summary.moduleId,
      characterId: actor.characterId,
      characterName: actor.name,
      limit: 30
    });
    const enrichedRetrieval = enrichCommentAssistantRetrieval(retrieval, actor, summary, requiredContext);
    const response = await window.AleriaGptClient.sendChat(query, enrichedRetrieval, {
      responseMode: 'comment-assist',
      answerStyle: 'short',
      sourceLimit: 24,
      timeoutMs: 45000
    });

    if (!response.ok || !response.text) {
      throw new Error('Keine KI-Antwort erhalten.');
    }

    _commentAssistantSuggestion = cleanCommentAssistantSuggestion(response.text);
    if (!_commentAssistantSuggestion) throw new Error('Die KI-Antwort enthielt keinen verwertbaren Kommentartext.');

    if (result) {
      result.textContent = _commentAssistantSuggestion;
      result.hidden = false;
    }
    setCommentAssistantStatus('Vorschlag erstellt. Pruefe ihn vor dem Uebernehmen.', 'ready');
  } catch (error) {
    console.warn('comment assistant failed:', error);
    _commentAssistantSuggestion = '';
    if (result) {
      result.textContent = '';
      result.hidden = true;
    }
    setCommentAssistantStatus(error?.message || 'Kommentarvorschlag konnte nicht erstellt werden.', 'error');
  } finally {
    setCommentAssistantLoading(false);
  }
}

function getCommentAssistantInsertKind() {
  if (_commentMode === 'narrator') return 'action';
  const activeTextarea = document.activeElement?.matches?.('.comment-segment-textarea')
    ? document.activeElement
    : null;
  const activeSegmentId = activeTextarea?.dataset?.segmentId || '';
  const activeSegment = activeSegmentId
    ? _commentSegments.find(segment => segment.id === activeSegmentId)
    : null;
  return activeSegment?.kind || _commentKind || 'speech';
}

function insertCommentAssistantSuggestion() {
  const text = String(_commentAssistantSuggestion || '').trim();
  if (!text) return;

  const allowedKinds = getAllowedCommentSegmentKinds(false);
  const preferredKind = getCommentAssistantInsertKind();
  const insertKind = allowedKinds.includes(preferredKind)
    ? preferredKind
    : allowedKinds[0];
  const emptySegment = _commentSegments.find(segment => !String(segment.text || '').trim());

  if (emptySegment) {
    emptySegment.kind = insertKind;
    emptySegment.text = text;
    if (emptySegment.kind === 'action') emptySegment.side = '';
  } else {
    _commentSegments.push(makeCommentSegment(insertKind, text));
  }

  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft(true);
  setCommentAssistantStatus('Vorschlag wurde als Kommentarabschnitt uebernommen. Du kannst ihn jetzt frei bearbeiten.', 'ready');
}

function toggleCommentAssistant() {
  const { body, toggle } = getCommentAssistantElements();
  if (!body) return;
  const nextOpen = body.hidden;
  body.hidden = !nextOpen;
  if (toggle) {
    toggle.textContent = nextOpen ? 'Schliessen' : 'Oeffnen';
    toggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
  }
}

function handleCommentAssistantClick(event) {
  const trigger = event.target?.closest?.('[data-comment-assistant-action]');
  if (!trigger) return;
  event.preventDefault();

  const action = trigger.dataset.commentAssistantAction;
  if (action === 'toggle') {
    toggleCommentAssistant();
    return;
  }
  if (action === 'generate') {
    generateCommentAssistantSuggestion();
    return;
  }
  if (action === 'insert') {
    insertCommentAssistantSuggestion();
  }
}

document.addEventListener('click', handleCommentAssistantClick);

window.resetCommentAssistant = resetCommentAssistant;
