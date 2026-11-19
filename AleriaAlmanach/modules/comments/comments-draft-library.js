// Explicit, browser-local copies of comment drafts. Separate keys keep saves
// from independent tabs from replacing each other's drafts.
const commentDraftLibrary = (() => {
  const prefix = 'aleria-saved-comment-draft:v1:';
  const panel = document.getElementById('cf-saved-drafts');
  const list = panel?.querySelector('[data-comment-saved-draft-list]');
  const status = document.getElementById('cf-saved-draft-status');
  const dateFormat = new Intl.DateTimeFormat('de', { dateStyle: 'short', timeStyle: 'short' });

  function read(key) {
    try {
      const entry = JSON.parse(localStorage.getItem(key));
      return entry?.id === key.slice(prefix.length) && typeof entry.draft?.text === 'string'
        && Number.isFinite(entry.savedAt) ? entry : null;
    } catch {
      return null;
    }
  }

  function entries() {
    const result = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      const entry = key?.startsWith(prefix) ? read(key) : null;
      if (entry) result.push(entry);
    }
    return result.sort((first, second) => second.savedAt - first.savedAt || first.id.localeCompare(second.id));
  }

  function report(message) {
    if (status) status.textContent = message;
  }

  function render() {
    if (!list || !panel.open) return;
    const drafts = entries();
    list.innerHTML = drafts.length ? drafts.map(entry => {
      const id = escapeHtml(entry.id);
      const name = escapeHtml(entry.name || 'Beitragsentwurf');
      const excerpt = escapeHtml(entry.draft.text.trim().replace(/\s+/g, ' ').slice(0, 110));
      const date = dateFormat.format(entry.savedAt);
      return `<li class="comment-saved-draft">
        <div><strong>${name}</strong><small>${escapeHtml(entry.origin || 'Szene')} · ${date}</small>
        ${excerpt ? `<p>${excerpt}</p>` : ''}</div>
        <div class="comment-saved-draft-actions">
          <button type="button" data-action="load-saved-comment-draft" data-draft-id="${id}" aria-label="Entwurf von ${name} laden">Laden</button>
          <button type="button" data-action="delete-saved-comment-draft" data-draft-id="${id}" aria-label="Entwurf von ${name} löschen">Löschen</button>
        </div></li>`;
    }).join('') : '<li>Hier findest du deine im Browser gespeicherten Entwürfe.</li>';
  }

  function store(draft, threadId) {
    const thread = getCurrentCommentThread();
    const id = crypto.randomUUID();
    const name = draft.mode === 'narrator' ? 'Erzähler'
      : getAvailableCommentCharacterById(draft.selectedCharId)?.name || draft.name || 'Beitragsentwurf';
    const origin = thread?.page?.pageTitle || thread?.entry?.title || threadId;
    localStorage.setItem(prefix + id, JSON.stringify({ id, threadId, origin, name, savedAt: Date.now(), draft }));
  }

  function forDestination(entry, threadId) {
    if (entry.threadId === threadId) return entry.draft;
    // Text, the chosen character, and personal equipment belong to the
    // author. Targets, temporary instances, and objects on the ground belong
    // to the original scene.
    return { ...entry.draft, sceneActors: [], segments: entry.draft.segments.map(segment => ({
      ...segment,
      actorId: '', challengeReplyToCommentId: '', skillTargetActorKey: '', skillTargetChallengeId: '',
      skillRuleSelections: [], combatTargetId: '', combatTargetIds: [], combatRuleSelections: [],
      combatPaymentConfirmed: false, combatDistanceMeters: null,
      ...(segment.inventorySource === 'scene' ? { inventorySource: 'inventory', sceneItemId: '',
        inventoryOperation: 'use', inventoryItemId: '', inventoryPaymentResource: '' } : {}),
      ...(segment.sceneItemDraft ? { sceneItemOperationId: crypto.randomUUID() } : {})
    })) };
  }

  function draftContents({ ts, ...content }) {
    return JSON.stringify(content);
  }

  async function load(entry, threadId) {
    syncCommentSegmentsToLegacyText();
    const current = getCommentDraftPayload();
    if (commentDraftHasContent(current)) {
      const content = draftContents(current);
      if (!entries().some(saved => saved.threadId === threadId && draftContents(saved.draft) === content)) {
        store(current, threadId);
      }
    }
    const options = { draft: forDestination(entry, threadId) };
    const opened = _commentInsertAfterId ? await openCommentFormAfter(_commentInsertAfterId, options) : await openCommentForm(options);
    if (opened) report('Gespeicherter Entwurf geladen.');
  }

  function reset() {
    if (panel) panel.open = false;
    report('');
  }

  panel?.addEventListener('toggle', () => {
    try { render(); } catch { report('Der Browser konnte die Entwurfsablage nicht öffnen.'); }
  });

  document.getElementById('cf-draft-library')?.addEventListener('click', async event => {
    const button = event.target.closest?.('button[data-action]');
    if (!button || !isCommentFormActorsReady() || _commentSubmitInFlight) return;
    const threadId = getCurrentCommentThreadId();
    if (!threadId) return;
    try {
      switch (button.dataset.action) {
        case 'save-comment-to-library': {
          syncCommentSegmentsToLegacyText();
          const draft = getCommentDraftPayload();
          if (!commentDraftHasContent(draft)) { report('Füge zuerst Text oder Abschnitte hinzu.'); return; }
          store(draft, threadId);
          panel.open = true;
          render();
          report('Entwurf im Browser gespeichert.');
          break;
        }
        case 'load-saved-comment-draft': {
          const entry = read(prefix + button.dataset.draftId);
          if (entry) await load(entry, threadId);
          else { render(); report('Dieser Entwurf ist nicht mehr in der Ablage.'); }
          break;
        }
        case 'delete-saved-comment-draft':
          localStorage.removeItem(prefix + button.dataset.draftId);
          render();
          panel.querySelector('summary')?.focus({ preventScroll: true });
          report('Gespeicherter Entwurf gelöscht.');
          break;
      }
    } catch {
      report('Der Browser konnte den Entwurfsvorgang nicht ausführen.');
    }
  });

  window.addEventListener('storage', event => {
    if (panel?.open && (!event.key || event.key.startsWith(prefix))) {
      try { render(); } catch { report('Der Browser konnte die Entwurfsablage nicht aktualisieren.'); }
    }
  });

  return { reset };
})();
