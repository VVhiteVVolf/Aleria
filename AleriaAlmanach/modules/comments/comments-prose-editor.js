globalThis.AleriaCommentProseEditor = (() => {
  function isActive() {
    return _editCommentData && window.AleriaCommentTransactions.usesProseEditor(_editCommentData);
  }

  async function loadSegments(comment) {
    const { getEditableCommentProseEntries } = await import('./comment-prose-edit-model.mjs');
    const entries = getEditableCommentProseEntries(comment);
    if (!entries.length) throw new Error('Dieser Beitrag enthält keinen bearbeitbaren Rollenspieltext.');
    return entries.map(({ index, source }) => ({
      ...(AleriaCommentTwins.restoreStoredSegment(source)
        || makeCommentSegment(source.commentKind || source.kind || 'speech', source.text)),
      proseIndex: index,
      proseSource: source
    }));
  }

  function render() {
    document.getElementById('edit-step-form').dataset.editScope = 'prose';
    document.getElementById('ec-char-section').style.display = 'none';
    document.getElementById('ec-narrator-hint').style.display = 'none';
    document.getElementById('ec-segment-list').innerHTML = _editCommentSegments.map(segment => {
      const fieldId = getCommentSegmentTextareaId(segment, true);
      const twins = segment.kind === 'twins';
      const label = `Abschnitt ${segment.proseIndex + 1} · ${getCommentKindLabel(segment.kind)}`;
      return `<div class="comment-segment-card" data-segment-id="${escapeHtml(segment.id)}">
        <label class="comment-segment-title" for="${fieldId}">${escapeHtml(label)}</label>
        ${twins ? AleriaCommentTwins.renderEditor(segment, true, { proseOnly: true }) : `
          ${buildCommentSegmentFormatToolbar(fieldId)}
          <textarea id="${fieldId}" class="comment-segment-textarea" rows="4"
            data-action="set-edit-comment-segment-text" data-segment-id="${escapeHtml(segment.id)}">${escapeHtml(segment.text)}</textarea>`}
      </div>`;
    }).join('');
    syncEditCommentSegmentsToLegacyText();
  }

  function previewSegments() {
    return _editCommentSegments.map(segment => {
      const { id, ...source } = segment.proseSource;
      if (segment.kind === 'twins') {
        const { text, twinDialogue } = AleriaTwinDialogue.serialize(segment);
        return { ...source, text, twinDialogue };
      }
      return { ...source, text: getCommentSegmentText(segment) };
    }).filter(segment => segment.text);
  }

  function getEdits(segments) {
    return segments.flatMap(segment => {
      const beforeText = segment.proseSource.text;
      const text = getCommentSegmentText(segment);
      const beforeLeftLength = segment.proseSource.twinDialogue?.leftLength;
      const leftLength = segment.kind === 'twins' ? String(segment.text || '').trim().length : undefined;
      if (text === beforeText.trim() && leftLength === beforeLeftLength) return [];
      return [{
        index: segment.proseIndex, beforeText, text,
        ...(segment.kind === 'twins' ? { beforeLeftLength, leftLength } : {})
      }];
    });
  }

  return Object.freeze({ isActive, loadSegments, render, previewSegments, getEdits });
})();
