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

function buildCommentAssistantQuery(actor, summary, userHint, draftText) {
  const roleInstruction = actor.mode === 'narrator'
    ? 'Schreibe als Erzaehler: beobachtend, knapp, neutral, ohne Figureninnenleben zu erfinden.'
    : `Schreibe aus der Perspektive von ${actor.name}${actor.title ? ` (${actor.title})` : ''}.`;

  return [
    'Erstelle einen konkreten Kommentarentwurf fuer den AleriaAlmanach-Kommentarmodus.',
    roleInstruction,
    summary.moduleTitle ? `Aktuelles Modul: ${summary.moduleTitle}` : '',
    summary.pageTitle ? `Aktuelle Seite: ${summary.pageTitle}` : '',
    summary.threadKind ? `Kommentarbereich: ${summary.threadKind}` : '',
    userHint ? `Nutzerwunsch fuer die Reaktion: ${userHint}` : 'Nutzerwunsch fuer die Reaktion: passend zum aktuellen Kontext.',
    draftText ? `Bereits im Formular stehender Entwurf, falls als Fortsetzung relevant:\n${draftText}` : '',
    '',
    'Regeln:',
    '- Gib nur den Kommentartext aus, keine Erklaerung und keine Quellenmarker.',
    '- Keine neuen Weltfakten, Orte, Verwandtschaften, Motive oder Ereignisse erfinden.',
    '- Wenn der Kontext unsicher ist, schreibe vorsichtig und situativ.',
    '- 1 bis 3 kurze Abschnitte, maximal etwa 900 Zeichen.',
    '- Nutze nur einfache Kommentarformatierung, wenn sie wirklich hilft: **fett**, *kursiv*, ||Spoiler||.'
  ].filter(Boolean).join('\n');
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
  const userHint = String(prompt?.value || '').trim();
  const draftText = getCommentAssistantCurrentDraft();
  const summary = getCommentAssistantThreadSummary();
  const query = buildCommentAssistantQuery(actor, summary, userHint, draftText);

  setCommentAssistantLoading(true);
  setCommentAssistantStatus('AleriaGPT liest Modul, Figur und bisherige Kommentare...', 'loading');

  try {
    const retrieval = await window.AleriaGptRetrieval.retrieve(query, {
      scope: summary.moduleId ? 'module' : 'all',
      moduleId: summary.moduleId,
      characterId: actor.characterId,
      characterName: actor.name,
      limit: 30
    });
    const response = await window.AleriaGptClient.sendChat(query, retrieval, {
      responseMode: 'comment-assist',
      answerStyle: 'short',
      sourceLimit: 18,
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
