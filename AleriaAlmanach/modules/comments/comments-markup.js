// Shared comment markup parser and formatting helpers.
// ── MARKUP PARSER ────────────────────────────────────────────────────────────
function parseCommentMarkup(raw, options = {}) {
  const compactLists = !!options.compactLists;
  // Escape HTML first to prevent XSS
  let s = escapeHtml(raw);

  // Bold+italic: ***text***
  s = s.replace(/\*\*\*(.*?)\*\*\*/gs, '<span class="c-bi">$1</span>');
  // Bold: **text**
  s = s.replace(/\*\*(.*?)\*\*/gs, '<span class="c-b">$1</span>');
  // Italic: *text*
  s = s.replace(/\*(.*?)\*/gs, '<span class="c-i">$1</span>');
  // Underline: __text__
  s = s.replace(/__(.*?)__/gs, '<span class="c-u">$1</span>');
  // Spoiler: ||text||
  s = s.replace(/\|\|(.*?)\|\|/gs, '<span class="c-spoiler" data-spoiler-toggle="true" title="Klicken zum Aufdecken">$1</span>');
  // Color: [rot]text[/rot] etc.
  const colorMap = {
    rot: '#c0392b',
    gold: '#d4b464',
    silber: '#a8b8c8',
    gruen: '#5a8a5a',
    blau: '#4a7ab0',
    lila: '#8b5fa0',
    weiss: '#e8e0d0',
    grau: '#888880',
    braun: '#8b6840'
  };
  s = s.replace(/\[([^\]\s]+)\](.*?)\[\/\1\]/gs, (m, tag, txt) => {
    const col = getCommentMarkupColor(tag);
    return col ? `<span style="color:${col}">${txt}</span>` : m;
  });
  // Tooltip: {tip:Hinweistext}Wort{/tip}
  s = s.replace(/\{tip:(.*?)\}(.*?)\{\/tip\}/gs, (m, tip, txt) => {
    const safeTip = String(tip).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return `<span class="c-tooltip" data-tip="${safeTip}">${txt}</span>`;
  });
  s = s.replace(/\{action\}([\s\S]*?)\{\/action\}/g, '<span class="comment-inline-block comment-action-block">$1</span>');
  s = s.replace(/\{thought\}([\s\S]*?)\{\/thought\}/g, '<span class="comment-inline-block comment-thought-block">$1</span>');
  s = s.replace(/\{(?:whisper|ooc)\}([\s\S]*?)\{\/(?:whisper|ooc)\}/g, '<span class="comment-inline-block comment-whisper-block">$1</span>');
  s = s.replace(/\{emote:\d+\}/g, '');
  
  // Handle bullet lists: convert lines starting with "- " into <ul><li> structure
  const lines = s.split('\n');
  let inList = false;
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBulletLine = /^-\s/.test(line);
    
    if (isBulletLine) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      const liContent = line.replace(/^-\s/, '').trim();
      result.push(`<li>${liContent}</li>`);
    } else {
      if (compactLists && inList && !line.trim()) {
        continue;
      }
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line.trim() ? line : '');
    }
  }
  
  if (inList) {
    result.push('</ul>');
  }
  
  s = result.join('<br>');
  if (compactLists) {
    s = s
      .replace(/<ul><br>/g, '<ul>')
      .replace(/<br><\/ul>/g, '</ul>')
      .replace(/<\/li><br><li>/g, '</li><li>');
  }

  return s;
}

function normalizeCommentColorName(value) {
  const raw = String(value || '').toLowerCase().trim();
  if (!raw) return '';
  if (raw === 'rot') return 'rot';
  if (raw === 'gold') return 'gold';
  if (raw === 'silber') return 'silber';
  if (raw === 'blau') return 'blau';
  if (raw === 'lila') return 'lila';
  if (raw === 'grau') return 'grau';
  if (raw === 'braun') return 'braun';
  if (raw === 'weiss' || raw.startsWith('wei')) return 'weiss';
  if (raw !== 'grau' && raw.startsWith('gr') && raw.endsWith('n')) return 'gruen';
  return raw;
}

function getCommentMarkupColor(value) {
  const colors = {
    rot: '#c0392b',
    gold: '#d4b464',
    silber: '#a8b8c8',
    gruen: '#5a8a5a',
    blau: '#4a7ab0',
    lila: '#8b5fa0',
    weiss: '#e8e0d0',
    grau: '#888880',
    braun: '#8b6840'
  };
  return colors[normalizeCommentColorName(value)] || '';
}

document.addEventListener('click', function(e) {
  const spoiler = e.target?.closest?.('.c-spoiler[data-spoiler-toggle]');
  if (spoiler) spoiler.classList.toggle('revealed');
});

// ── FORMAT TOOLBAR FUNCTIONS ──────────────────────────────────────────────────
const COMMENT_MARKUP_ACTIONS = new Set([
  'format-comment-markup-wrap',
  'format-comment-markup-color',
  'format-comment-markup-tooltip',
  'format-comment-markup-block',
  'format-comment-markup-list'
]);

function handleCommentMarkupActionClick(event) {
  const trigger = event.target?.closest?.('[data-action]');
  if (!trigger || !COMMENT_MARKUP_ACTIONS.has(trigger.dataset.action)) return;

  event.preventDefault();
  const targetId = trigger.dataset.targetId || '';

  if (trigger.dataset.action === 'format-comment-markup-wrap') {
    fmtWrap(targetId, trigger.dataset.wrapBefore || '', trigger.dataset.wrapAfter || '');
    return;
  }
  if (trigger.dataset.action === 'format-comment-markup-color') {
    fmtColor(targetId, trigger.dataset.color || '');
    return;
  }
  if (trigger.dataset.action === 'format-comment-markup-tooltip') {
    fmtTooltip(targetId);
    return;
  }
  if (trigger.dataset.action === 'format-comment-markup-block') {
    fmtCommentBlock(targetId, trigger.dataset.commentBlock || 'action');
    return;
  }
  if (trigger.dataset.action === 'format-comment-markup-list') {
    fmtList(targetId);
  }
}

function handleCommentMarkupActionMouseDown(event) {
  const trigger = event.target?.closest?.('[data-action]');
  if (!trigger || !COMMENT_MARKUP_ACTIONS.has(trigger.dataset.action)) return;
  event.preventDefault();
}

document.addEventListener('mousedown', handleCommentMarkupActionMouseDown);
document.addEventListener('click', handleCommentMarkupActionClick);

const _commentTextareaSelections = new Map();

function rememberCommentTextareaSelection(field) {
  if (!field?.id || typeof field.selectionStart !== 'number') return;
  _commentTextareaSelections.set(field.id, {
    start: field.selectionStart,
    end: field.selectionEnd
  });
}

function getCommentTextareaSelection(field) {
  if (!field) return { start: 0, end: 0 };
  const remembered = _commentTextareaSelections.get(field.id);
  const active = document.activeElement === field;
  const start = active ? field.selectionStart : remembered?.start;
  const end = active ? field.selectionEnd : remembered?.end;
  return {
    start: Math.max(0, Math.min(field.value.length, Number.isFinite(start) ? start : field.value.length)),
    end: Math.max(0, Math.min(field.value.length, Number.isFinite(end) ? end : field.value.length))
  };
}

function replaceTextareaSelection(textareaId, buildText, fallbackText = 'Text') {
  const ta = document.getElementById(textareaId);
  if (!ta) return false;
  const selection = getCommentTextareaSelection(ta);
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  const selected = ta.value.substring(start, end) || fallbackText;
  const replacement = typeof buildText === 'function' ? buildText(selected) : String(buildText || selected);
  ta.value = `${ta.value.substring(0, start)}${replacement}${ta.value.substring(end)}`;
  ta.selectionStart = start;
  ta.selectionEnd = start + replacement.length;
  rememberCommentTextareaSelection(ta);
  ta.focus();
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

function fmtWrap(textareaId, open, close) {
  const rich = getRichEditorBinding(textareaId);
  if (rich) {
    focusRichEditor(textareaId);
    if (open === '**' && close === '**') {
      document.execCommand('bold', false);
      handleRichEditorChange(textareaId);
      return;
    }
    if (open === '*' && close === '*') {
      document.execCommand('italic', false);
      handleRichEditorChange(textareaId);
      return;
    }
    if (open === '__' && close === '__') {
      document.execCommand('underline', false);
      handleRichEditorChange(textareaId);
      return;
    }
    if (open === '***' && close === '***') {
      document.execCommand('bold', false);
      document.execCommand('italic', false);
      handleRichEditorChange(textareaId);
      return;
    }
    if (open === '||' && close === '||') {
      wrapRichSelection(textareaId, (selectedHtml) => (
        `<span class="editor-spoiler" data-spoiler="true">${selectedHtml}</span>`
      ), 'Spoiler');
      return;
    }
  }
  replaceTextareaSelection(textareaId, selected => `${open}${selected}${close}`, 'Text');
}

function fmtColor(textareaId, colorName) {
  const rich = getRichEditorBinding(textareaId);
  if (rich) {
    const color = getCommentMarkupColor(colorName) || '#d4b464';
    wrapRichSelection(textareaId, (selectedHtml) => (
      `<span data-color="${escapeHtml(colorName)}" style="color:${color}">${selectedHtml}</span>`
    ), 'Farbe');
    return;
  }
  fmtWrap(textareaId, `[${colorName}]`, `[/${colorName}]`);
}

function fmtTooltip(textareaId) {
  const rich = getRichEditorBinding(textareaId);
  if (rich) {
    const hint = prompt('Tooltip-Text:', '');
    if (hint === null) return;
    wrapRichSelection(textareaId, (selectedHtml) => (
      `<span class="editor-tooltip" data-tip="${escapeHtml(hint)}">${selectedHtml}</span>`
    ), 'Wort');
    return;
  }
  const hint  = prompt('Tooltip-Text:', '');
  if (hint === null) return;
  const open  = `{tip:${hint}}`;
  const close = `{/tip}`;
  replaceTextareaSelection(textareaId, selected => `${open}${selected}${close}`, 'Wort');
}

function fmtCommentBlock(textareaId, kind) {
  const blockKind = normalizeCommentKind(kind);
  const label = getCommentKindLabel(blockKind);
  const rich = getRichEditorBinding(textareaId);
  if (rich) {
    wrapRichSelection(textareaId, (selectedHtml) => (
      `<div class="editor-comment-block editor-comment-block-${blockKind}" data-comment-block="${blockKind}">${selectedHtml}</div>`
    ), label);
    return;
  }
  fmtWrap(textareaId, `{${blockKind}}`, `{/${blockKind}}`);
}

function fmtList(textareaId) {
  const ta = document.getElementById(textareaId);
  if (!ta) return;
  
  const start = ta.selectionStart ?? ta.value.length;
  const end = ta.selectionEnd ?? ta.value.length;
  const selectedText = ta.value.substring(start, end);
  const before = ta.value.substring(0, start);
  const after = ta.value.substring(end);
  
  let listText;
  if (selectedText.trim()) {
    // Wenn Text ausgewählt ist, jeden Absatz mit einem Bullet Point versehen
    const lines = selectedText.split('\n');
    listText = lines.map(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('-') ? `- ${trimmed}` : line;
    }).join('\n');
  } else {
    // Wenn nichts ausgewählt ist, einfach einen Bullet Point einfügen
    listText = '- ';
  }
  
  ta.value = before + listText + after;
  ta.selectionStart = start + listText.length;
  ta.selectionEnd = ta.selectionStart;
  ta.focus();
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

function insertMarkupAtTextarea(textareaId, markup) {
  const ta = document.getElementById(textareaId);
  if (!ta) return;
  const start = ta.selectionStart ?? ta.value.length;
  const end = ta.selectionEnd ?? ta.value.length;
  ta.value = `${ta.value.slice(0, start)}${markup}${ta.value.slice(end)}`;
  ta.selectionStart = ta.selectionEnd = start + markup.length;
  ta.focus();
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

function insertCommentEmoteBreak(idx, event) {
  event?.stopPropagation?.();
  const marker = Math.max(0, Number(idx) || 0);
  _commentSegments.push(makeCommentSegment('speech', '', marker));
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
  setTimeout(() => document.querySelector('#cf-segment-list .comment-segment-card:last-child textarea')?.focus?.(), 0);
}

function insertEditCommentEmoteBreak(idx, event) {
  event?.stopPropagation?.();
  const marker = Math.max(0, Number(idx) || 0);
  _editCommentSegments.push(makeCommentSegment('speech', '', marker));
  renderEditCommentSegmentList();
  updateEditFormPreview();
  setTimeout(() => document.querySelector('#ec-segment-list .comment-segment-card:last-child textarea')?.focus?.(), 0);
}
