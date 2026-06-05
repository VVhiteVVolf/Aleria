// Comment richtext editor synchronization and selection helpers.
// Shared by compose, edit, and formatting actions.

const RICH_EDITOR_COLOR_MAP = {
  'rot': '#c0392b',
  'gold': '#d4b464',
  'silber': '#a8b8c8',
  'grün': '#5a8a5a',
  'blau': '#4a7ab0',
  'lila': '#8b5fa0',
  'weiß': '#e8e0d0',
  'weiss': '#e8e0d0',
  'grau': '#888880',
  'braun': '#8b6840',
};

function getRichEditorBinding(fieldId) {
  const map = {
    'cf-text': 'cf-editor',
    'ec-text': 'ec-editor',
  };
  const editorId = map[fieldId];
  if (!editorId) return null;
  const textarea = document.getElementById(fieldId);
  const editor = document.getElementById(editorId);
  if (!textarea || !editor) return null;
  return { textarea, editor };
}

function setEditorEmptyState(editor) {
  if (!editor) return;
  editor.dataset.empty = editor.textContent.trim() ? 'false' : 'true';
}

function getRichRangeHtml(range) {
  const container = document.createElement('div');
  container.appendChild(range.cloneContents());
  return container.innerHTML;
}

function placeCaretAtEnd(element) {
  if (!element) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function focusRichEditor(fieldId) {
  const binding = getRichEditorBinding(fieldId);
  if (!binding) return;
  binding.editor.focus();
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount || !binding.editor.contains(selection.anchorNode)) {
    placeCaretAtEnd(binding.editor);
  }
}

function getRichSelection(fieldId) {
  const binding = getRichEditorBinding(fieldId);
  if (!binding) return null;
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return { binding, selection: null, range: null };
  const range = selection.getRangeAt(0);
  if (!binding.editor.contains(range.commonAncestorContainer)) {
    return { binding, selection, range: null };
  }
  return { binding, selection, range };
}

function editorNodeToMarkup(node) {
  if (!node) return '';
  if (node.nodeType === Node.TEXT_NODE) {
    return String(node.textContent || '').replace(/\u00a0/g, ' ');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName.toLowerCase();
  if (tag === 'br') return '\n';

  let content = Array.from(node.childNodes).map(editorNodeToMarkup).join('');

  if ((tag === 'div' || tag === 'p') && node.dataset.commentBlock) {
    const kind = normalizeCommentKind(node.dataset.commentBlock);
    return `\n{${kind}}${content.trim() || 'Text'}{/${kind}}\n`;
  }

  if (tag === 'div' || tag === 'p') {
    if (node.childNodes.length === 0 || !content.replace(/\n/g, '').trim()) return '\n\n';
    return content.endsWith('\n') ? content : `${content}\n`;
  }
  if (tag === 'strong' || tag === 'b') return `**${content}**`;
  if (tag === 'em' || tag === 'i') return `*${content}*`;
  if (tag === 'u') return `__${content}__`;
  if (tag === 'span') {
    if (node.dataset.emoteMarker !== undefined) {
      const idx = Math.max(0, Number(node.dataset.emoteMarker) || 0);
      return `\n{emote:${idx}}\n`;
    }
    if (node.dataset.tip !== undefined) {
      return `{tip:${node.dataset.tip || ''}}${content}{/tip}`;
    }
    if (node.dataset.spoiler !== undefined || node.classList.contains('editor-spoiler')) {
      return `||${content}||`;
    }
    if (node.dataset.color) {
      return `[${node.dataset.color}]${content}[/${node.dataset.color}]`;
    }
  }
  return content;
}

function syncRichEditor(fieldId) {
  const binding = getRichEditorBinding(fieldId);
  if (!binding) return;
  const markup = Array.from(binding.editor.childNodes).map(editorNodeToMarkup).join('')
    .replace(/\u200b/g, '')
    .replace(/^\n+|\n+$/g, '');
  binding.textarea.value = markup;
  setEditorEmptyState(binding.editor);
}

function markupToEditorHtml(markup) {
  let html = escapeHtml(markup || '');

  html = html.replace(/\{emote:(\d+)\}/g, (m, idx) => {
    const num = Math.max(0, Number(idx) || 0);
    return `<span class="editor-emote-marker" data-emote-marker="${num}">Ausdruckswechsel ${num + 1}</span>`;
  });
  html = html.replace(/\{(action|thought|whisper|ooc)\}([\s\S]*?)\{\/\1\}/g, (m, kind, txt) => {
    const blockKind = normalizeCommentKind(kind);
    return `<div class="editor-comment-block editor-comment-block-${blockKind}" data-comment-block="${blockKind}">${txt || 'Text'}</div>`;
  });
  html = html.replace(/\{tip:(.*?)\}(.*?)\{\/tip\}/gs, (m, tip, txt) => {
    const safeTip = escapeHtml(tip);
    return `<span class="editor-tooltip" data-tip="${safeTip}">${txt || 'Hinweis'}</span>`;
  });
  html = html.replace(/\|\|(.*?)\|\|/gs, '<span class="editor-spoiler" data-spoiler="true">$1</span>');
  html = html.replace(/\[(.+?)\](.*?)\[\/\1\]/gs, (m, tag, txt) => {
    const key = String(tag || '').toLowerCase();
    const color = typeof getCommentMarkupColor === 'function'
      ? getCommentMarkupColor(key)
      : RICH_EDITOR_COLOR_MAP[key];
    return color
      ? `<span data-color="${escapeHtml(tag)}" style="color:${color}">${txt || 'Farbe'}</span>`
      : m;
  });
  html = html.replace(/\*\*\*(.*?)\*\*\*/gs, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gs, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gs, '<u>$1</u>');
  html = html.replace(/\*(.*?)\*/gs, '<em>$1</em>');
  html = html.replace(/\n/g, '<br>');

  return html;
}

function setRichEditorContent(fieldId, markup) {
  const binding = getRichEditorBinding(fieldId);
  if (!binding) return;
  binding.textarea.value = String(markup || '');
  binding.editor.innerHTML = markupToEditorHtml(binding.textarea.value);
  setEditorEmptyState(binding.editor);
}

function handleRichEditorChange(fieldId) {
  syncRichEditor(fieldId);
  if (fieldId === 'cf-text') {
    setCommentFormCounter();
    updateCommentFormPreview();
    persistCommentDraft();
    return;
  }
  if (fieldId === 'ec-text') {
    setEditFormCounter();
    updateEditFormPreview();
  }
}

function wrapRichSelection(fieldId, buildHtml, fallbackText = 'Text') {
  const selectionState = getRichSelection(fieldId);
  if (!selectionState) return false;
  const { binding } = selectionState;
  focusRichEditor(fieldId);
  const activeSelection = getRichSelection(fieldId);
  if (!activeSelection?.range) return false;

  const selectedHtml = activeSelection.range.collapsed
    ? escapeHtml(fallbackText)
    : (getRichRangeHtml(activeSelection.range) || escapeHtml(fallbackText));
  const html = typeof buildHtml === 'function' ? buildHtml(selectedHtml) : String(buildHtml || '');
  document.execCommand('insertHTML', false, html);
  handleRichEditorChange(fieldId);
  binding.editor.focus();
  return true;
}
