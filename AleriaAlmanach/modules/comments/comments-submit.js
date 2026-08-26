// Comment submit flow.
// Keeps save, fallback, and post-save reload behavior separate from form rendering.

async function submitComment() {
  syncCommentSegmentsToLegacyText();
  let commentSegments = buildCommentSegmentsForSave();
  const text  = commentSegments.map(segment => segment.text).join('\n\n').trim();
  const errEl = document.getElementById('cf-error');
  const btn   = document.getElementById('cf-submit');
  const threadId = getCurrentCommentThreadId();

  let isNarrator = _commentMode === 'narrator';
  let name, title, portrait;
  let commentMetadata = { commentMode: isNarrator ? 'narrator' : 'character' };

  if (isNarrator) {
    name = 'Erzähler'; title = ''; portrait = null;
    commentMetadata = { commentMode: 'narrator', avatarKind: 'narrator', characterId: '', emoteIndex: null };
  } else if (_selectedCharId) {
    const c = getAvailableCommentCharacterById(_selectedCharId);
    if (!c) { errEl.textContent = _commentMode === 'creature' ? 'Kreatur nicht gefunden.' : 'Charakter nicht gefunden.'; errEl.style.display='block'; return; }
    if (!commentActorMatchesComposerMode(c, _commentMode)) {
      errEl.textContent = _commentMode === 'creature' ? 'Bitte eine Kreatur aus dem Kreaturenregister auswählen.' : 'Bitte einen Charakter auswählen.';
      errEl.style.display='block'; return;
    }
    if (!isCommentCharacterAllowedForActivePlayer(c)) {
      errEl.textContent = `${c.name} ist ${getCommentPlayerOwnerLabel(c.playerOwner || c.playedBy || c.player)} zugewiesen.`;
      errEl.style.display='block';
      return;
    }
    const presentation = c.entityType === 'creature' ? c : getSelectedCommentCharacterPresentation(c);
    name = c.name; title = c.title || '';
    const actorMetadata = c.entityType === 'creature'
      ? { actorType: 'creature', creatureId: _selectedCharId }
      : { actorType: 'character', creatureId: '' };
    const actorCommentMode = c.entityType === 'creature' ? 'creature' : 'character';
    if (_selectedEmoteIdx !== null && presentation.emotes && presentation.emotes[_selectedEmoteIdx]) {
      portrait = presentation.emotes[_selectedEmoteIdx].img;
      commentMetadata = { commentMode: actorCommentMode, avatarKind: 'emote', characterId: _selectedCharId, emoteIndex: _selectedEmoteIdx, imageSetId: presentation.selectedImageSetId || '', ...actorMetadata };
    } else {
      portrait = presentation.portrait || null;
      commentMetadata = { commentMode: actorCommentMode, avatarKind: 'portrait', characterId: _selectedCharId, emoteIndex: null, imageSetId: presentation.selectedImageSetId || '', ...actorMetadata };
    }
  } else if (_manualMode) {
    name    = document.getElementById('cf-name').value.trim();
    title   = document.getElementById('cf-title').value.trim();
    portrait = _portraitUrl || null;
    commentMetadata = { commentMode: 'manual', avatarKind: portrait ? 'manual' : 'none', characterId: '', emoteIndex: null };
    if (!name) { errEl.textContent = 'Bitte einen Charakternamen eingeben.'; errEl.style.display='block'; return; }
  } else {
    errEl.textContent = _commentMode === 'creature'
      ? 'Bitte eine Kreatur aus dem Kreaturenregister auswählen.'
      : 'Bitte einen Charakter auswählen oder manuell eingeben.';
    errEl.style.display='block'; return;
  }
  commentMetadata.commentKind = normalizeCommentKind(_commentKind, isNarrator);
  commentMetadata.commentSegments = commentSegments.map(({ clientSegmentId, ...segment }) => segment);
  commentMetadata.orderKey = getNextCommentOrderKey(threadId, _commentInsertAfterId);

  if (!text) { errEl.textContent = 'Bitte einen Text schreiben.'; errEl.style.display='block'; return; }
  if (text.length > COMMENT_MAX_LENGTH) { errEl.textContent = `Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`; errEl.style.display='block'; return; }
  if (!threadId) { errEl.textContent = 'Der Kommentar konnte keinem Eintrag zugeordnet werden.'; errEl.style.display='block'; return; }
  if (_commentSubmitInFlight) return;
  const automaticSceneDate = globalThis.AleriaSceneDateDefaults?.ensureForCurrentThread?.();
  if (automaticSceneDate && globalThis.AleriaWorldDateModel?.isValid?.(automaticSceneDate)) {
    commentMetadata.sceneStartDateAleria = globalThis.AleriaWorldDateModel.normalize(automaticSceneDate);
  }
  _commentSubmitInFlight = true;
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Wird gespeichert...';

  const deleteCode = COMMENT_DELETE_CODE;
  let backend = null;

  try {
    if (window.AleriaSkillChecks?.handleSubmission) {
      const skillResult = await window.AleriaSkillChecks.handleSubmission({
        threadId,
        text,
        charName: name,
        charTitle: title,
        portrait,
        characterId: commentMetadata.characterId || '',
        commentSegments,
        commentMetadata,
        deleteCode
      });
      if (skillResult?.handled && skillResult.commentMetadata && typeof skillResult.commentMetadata === 'object') {
        commentMetadata = { ...commentMetadata, ...skillResult.commentMetadata };
        commentSegments = Array.isArray(commentMetadata.commentSegments) ? commentMetadata.commentSegments : commentSegments;
      }
    }
    if (window.AleriaInventoryUse?.handleSubmission) {
      const inventoryResult = await window.AleriaInventoryUse.handleSubmission({
        threadId,
        text,
        charName: name,
        charTitle: title,
        portrait,
        characterId: commentMetadata.characterId || '',
        commentSegments,
        commentMetadata,
        deleteCode
      });
      if (inventoryResult?.handled && inventoryResult.commentMetadata && typeof inventoryResult.commentMetadata === 'object') {
        commentMetadata = { ...commentMetadata, ...inventoryResult.commentMetadata };
        commentSegments = Array.isArray(commentMetadata.commentSegments) ? commentMetadata.commentSegments : commentSegments;
      }
    }
    if (window.AleriaCombat?.handleSubmission) {
      const combatResult = await window.AleriaCombat.handleSubmission({
        threadId,
        text,
        charName: name,
        charTitle: title,
        portrait,
        characterId: commentMetadata.characterId || '',
        commentSegments,
        commentMetadata,
        deleteCode
      });
      if (combatResult?.handled) {
        if (combatResult.commentMetadata && typeof combatResult.commentMetadata === 'object') {
          commentMetadata = { ...commentMetadata, ...combatResult.commentMetadata };
        }
        if (combatResult.published) {
          clearCommentDraft(threadId);
          closeCommentForm();
          requestCommentAutoScroll(threadId);
          await loadCommentsIntoPage(threadId, true, { page: 'last' });
          if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
          if (typeof loadSidebarFeed === 'function') loadSidebarFeed();
          btn.disabled = false;
          btn.textContent = 'Eintragen';
          _commentSubmitInFlight = false;
          return;
        }
      }
    }
    backend = await getCommentBackend({ timeoutMs: 1200 });
    const hasProfileTransaction = (commentMetadata.commentSegments || [])
      .some(segment => segment?.combatResolution?.resolutionId || segment?.inventoryUse?.usageId);
    const hasSkillTransaction = (commentMetadata.commentSegments || [])
      .some(segment => segment?.skillResolution?.resolutionId);
    const saveResult = hasProfileTransaction && typeof backend.addCombatComment === 'function'
      ? await backend.addCombatComment(threadId, name, title, portrait, text, deleteCode, isNarrator, commentMetadata)
      : (hasSkillTransaction && typeof backend.addSkillComment === 'function'
        ? await backend.addSkillComment(threadId, name, title, portrait, text, deleteCode, isNarrator, commentMetadata)
        : await backend.addComment(threadId, name, title, portrait, text, deleteCode, isNarrator, commentMetadata));
    if (Array.isArray(saveResult?.profileUpdates) && saveResult.profileUpdates.length) {
      document.dispatchEvent(new CustomEvent('aleria:combat-profile-committed', {
        detail: { updates: saveResult.profileUpdates }
      }));
    }
    clearCommentDraft(threadId);
    closeCommentForm();
    await loadCommentsIntoPage(threadId, true, _commentInsertAfterId ? {} : { page: 'last' });
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed(); // refresh activity feed
    btn.textContent = 'Eintragen';
    _commentSubmitInFlight = false;
  } catch(e) {
    const hasPersistentCombatTransaction = (commentMetadata.commentSegments || []).some(segment => (
      (['character', 'creature'].includes(segment?.combatResolution?.targetPersistence?.kind)
        && segment?.combatResolution?.targetPersistence?.recordId)
      || (Array.isArray(segment?.combatResolution?.resourceCosts) && segment.combatResolution.resourceCosts.some(cost => cost?.scope !== 'comment')
        && ['character', 'creature'].includes(segment?.combatResolution?.actorPersistence?.kind)
        && segment?.combatResolution?.actorPersistence?.recordId)
      || (Array.isArray(segment?.combatResolution?.actorCombatProfile?.dailyResources)
        && segment.combatResolution.actorCombatProfile.dailyResources.length > 0
        && ['character', 'creature'].includes(segment?.combatResolution?.actorPersistence?.kind)
        && segment?.combatResolution?.actorPersistence?.recordId)
      || (segment?.inventoryUse?.actorPersistence?.kind === 'character'
        && segment?.inventoryUse?.actorPersistence?.recordId)
    ));
    if (backend && !backend._localFallback && !hasPersistentCombatTransaction) {
      try {
        const localBackend = getLocalCommentBackend();
        const hasProfileTransaction = (commentMetadata.commentSegments || [])
          .some(segment => segment?.combatResolution?.resolutionId || segment?.inventoryUse?.usageId);
        if (hasProfileTransaction) {
          await localBackend.addCombatComment(threadId, name, title, portrait, text, deleteCode, isNarrator, commentMetadata);
        } else {
          await localBackend.addComment(threadId, name, title, portrait, text, deleteCode, isNarrator, commentMetadata);
        }
        showCommentFallbackNotice();
        clearCommentDraft(threadId);
        closeCommentForm();
        await loadCommentsIntoPage(threadId, true, _commentInsertAfterId ? {} : { page: 'last' });
        btn.disabled = false;
        btn.textContent = 'Eintragen';
        _commentSubmitInFlight = false;
        return;
      } catch (localError) {
        console.warn('local comment fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(e, 'Fehler beim Speichern. Bitte erneut versuchen.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Eintragen';
    _commentSubmitInFlight = false;
  }
}
