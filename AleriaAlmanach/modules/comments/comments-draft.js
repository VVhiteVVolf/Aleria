// Comment draft persistence.
// Owns local draft serialization, restore, cleanup, and clearing.

function getCommentDraftPayload() {
  return {
    mode: _commentMode,
    commentKind: _commentKind,
    selectedCharId: _selectedCharId,
    selectedEmoteIdx: _selectedEmoteIdx,
    manualMode: _manualMode,
    name: document.getElementById('cf-name')?.value || '',
    title: document.getElementById('cf-title')?.value || '',
    text: document.getElementById('cf-text')?.value || '',
    segments: _commentSegments.map(segment => ({
      kind: segment.kind,
      text: segment.text,
      emoteIndex: Number.isInteger(segment.emoteIndex) ? segment.emoteIndex : null,
      side: commentSegmentUsesSide(segment.kind, false) ? normalizeCommentSegmentSide(segment.side) : ''
    })),
    portraitUrl: _portraitUrl || '',
    charSearch: '',
    ts: Date.now(),
  };
}

function persistCommentDraft(immediate = false) {
  if (!isCommentFormOpen()) return;

  const run = () => {
    try {
      const key = getCommentDraftKey();
      if (!key) return;
      const payload = getCommentDraftPayload();
      if (!payload.text && !payload.name && !payload.title && !payload.selectedCharId && !payload.manualMode) {
        localStorage.removeItem(key);
        showCommentDraftNote('');
        return;
      }
      localStorage.setItem(key, JSON.stringify(payload));
      showCommentDraftNote('Entwurf gespeichert');
    } catch (e) {
      console.warn('comment draft save failed:', e);
    }
  };

  if (immediate) {
    clearTimeout(_commentDraftTimer);
    run();
    return;
  }

  clearTimeout(_commentDraftTimer);
  _commentDraftTimer = setTimeout(run, 180);
}

function clearCommentDraft(threadId = getCurrentCommentThreadId()) {
  try {
    const key = getCommentDraftKey(threadId);
    if (key) localStorage.removeItem(key);
  } catch (e) {
    console.warn('comment draft clear failed:', e);
  }
  showCommentDraftNote('');
}

function cleanupOldCommentDrafts(maxAgeDays = 30) {
  const maxAgeMs = Math.max(1, Number(maxAgeDays) || 30) * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let removed = 0;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(COMMENT_DRAFT_PREFIX)) continue;
      let ts = 0;
      try {
        const draft = JSON.parse(localStorage.getItem(key) || '{}');
        ts = Number(draft?.ts) || 0;
      } catch {
        ts = 0;
      }
      if (!ts || now - ts > maxAgeMs) {
        localStorage.removeItem(key);
        removed += 1;
      }
    }
  } catch (e) {
    console.warn('comment draft cleanup failed:', e);
  }
  return removed;
}

function restoreCommentDraft() {
  try {
    const key = getCommentDraftKey();
    if (!key) return false;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object') return false;

    setRichEditorContent('cf-text', String(draft.text || ''));
    if (Array.isArray(draft.segments) && draft.segments.length) {
      _commentSegments = draft.segments.map(segment => makeCommentSegment(
        segment.kind || 'speech',
        segment.text || '',
        Number.isInteger(segment.emoteIndex) ? segment.emoteIndex : null,
        segment.side || 'left'
      ));
    } else {
      _commentSegments = [makeCommentSegment(draft.commentKind || 'speech', String(draft.text || ''), Number.isInteger(draft.selectedEmoteIdx) ? draft.selectedEmoteIdx : null)];
    }
    setCommentKind(draft.commentKind || 'speech');
    document.getElementById('cf-name').value = String(draft.name || '');
    document.getElementById('cf-title').value = String(draft.title || '');
    document.getElementById('cf-char-search').value = '';
    const restoredPortraitUrl = normalizeImageUrlForStorage(draft.portraitUrl || draft.portraitBase64 || '');
    document.getElementById('cf-portrait-url').value = restoredPortraitUrl || '';
    _portraitUrl = restoredPortraitUrl;
    const preview = document.getElementById('cf-portrait-preview');
    if (preview && restoredPortraitUrl) {
      preview.src = restoredPortraitUrl;
      preview.style.display = 'block';
    } else if (preview) {
      preview.removeAttribute('src');
      preview.style.display = 'none';
    }

    if (draft.mode === 'narrator') {
      setCommentMode('narrator');
    } else {
      setCommentMode('charakter');
      if (draft.selectedCharId && getAvailableCommentCharacterById(draft.selectedCharId)) {
        selectCharForComment(draft.selectedCharId);
        if (Number.isInteger(draft.selectedEmoteIdx) && draft.selectedEmoteIdx >= 0) {
          selectEmote(draft.selectedEmoteIdx);
        }
      } else if (draft.manualMode) {
        if (!_manualMode) toggleManualMode();
      }
    }

    applyCommentCharacterFilter();
    renderCommentSegmentList();
    setCommentFormCounter();
    updateCommentFormPreview();
    showCommentDraftNote('Entwurf wiederhergestellt');
    return true;
  } catch (e) {
    console.warn('comment draft restore failed:', e);
    return false;
  }
}

window.cleanupOldCommentDrafts = cleanupOldCommentDrafts;
