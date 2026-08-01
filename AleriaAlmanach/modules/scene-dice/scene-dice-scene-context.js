function toSceneDicePlainText(value) {
  if (window.AleriaGptContext?.toPlainText) return window.AleriaGptContext.toPlainText(value);
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSceneDicePageText(thread = {}) {
  const page = thread.page || {};
  const entry = thread.entry || {};
  const lines = [];
  const add = (label, value) => {
    const text = toSceneDicePlainText(value);
    if (text) lines.push(`${label}: ${text}`);
  };
  add('Modul', entry.title);
  add('Untertitel', entry.subtitle);
  add('Seitentitel', page.pageTitle);
  add('Seitentext', page.description);
  add('Szeneneinleitung', page.sessionIntro);
  add('Szenenhinweis', page.sessionHint);
  (Array.isArray(page.sceneBlocks) ? page.sceneBlocks : []).forEach((block, index) => {
    add(`Szenenblock ${index + 1}`, [block?.name, block?.title, block?.text].filter(Boolean).join(' – '));
  });
  return Array.from(new Set(lines)).join('\n').slice(0, 9000);
}

function getSceneDiceCommentText(comment = {}) {
  if (comment.sceneDiceRoll) {
    const roll = comment.sceneDiceRoll;
    return [
      `[Interne Szenenwurf-Metadaten – nicht nacherzählen] ${roll.roller || 'Unbekannte Hand'} würfelt${roll.purpose ? ` auf ${roll.purpose}` : ''}: ${roll.total}.`,
      roll.situation ? `Situationskontext: ${roll.situation}` : '',
      roll.narration ? `Erzählte Folge: ${roll.narration}` : ''
    ].filter(Boolean).join(' ');
  }
  const segments = Array.isArray(comment.commentSegments) && comment.commentSegments.length
    ? comment.commentSegments
    : [{ text: comment.text || '', charName: comment.charName, narrator: comment.narrator }];
  return segments.map(segment => {
    const text = toSceneDicePlainText(segment?.text || '');
    if (!text) return '';
    const narrator = !!segment?.narrator || !!comment.narrator || String(comment.commentMode || '') === 'narrator';
    const speaker = narrator ? 'Erzähler' : String(segment?.charName || segment?.name || comment.charName || 'Unbekannte Stimme').trim();
    return `${speaker}: ${text}`;
  }).filter(Boolean).join('\n');
}

function buildSceneDiceTranscript(comments = []) {
  return (Array.isArray(comments) ? comments : [])
    .slice(-40)
    .map((comment, index) => {
      const text = getSceneDiceCommentText(comment);
      return text ? `[${index + 1}] ${text}` : '';
    })
    .filter(Boolean)
    .join('\n\n')
    .slice(-14000);
}

export async function loadActiveSceneSnapshot() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  const threadId = String(thread?.threadId || '').trim();
  let comments = [];
  if (threadId) {
    try {
      const backend = typeof getCommentBackend === 'function'
        ? await getCommentBackend({ timeoutMs: 2500 })
        : null;
      if (backend?.loadComments) comments = await backend.loadComments(threadId);
    } catch (error) {
      console.warn('scene dice participant context load failed:', error);
    }
    if (!Array.isArray(comments) || !comments.length) {
      try {
        if (typeof _commentCache !== 'undefined' && Array.isArray(_commentCache[threadId])) {
          comments = _commentCache[threadId];
        }
      } catch { /* comment cache is optional */ }
    }
  }
  const ordered = typeof sortCommentsByTimeline === 'function'
    ? sortCommentsByTimeline(comments)
    : (Array.isArray(comments) ? comments.slice() : []);
  return {
    threadId,
    threadKind: String(thread?.kind || '').trim(),
    moduleId: String(thread?.entry?.id || '').trim(),
    moduleTitle: String(thread?.entry?.title || '').trim(),
    pageTitle: String(thread?.page?.pageTitle || '').trim(),
    pageText: buildSceneDicePageText(thread || {}),
    transcript: buildSceneDiceTranscript(ordered),
    comments: ordered
  };
}
