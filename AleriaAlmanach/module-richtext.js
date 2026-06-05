// Rich-Text-Werkzeuge fuer Modultexte, Tooltips und Spoiler.
function buildTextFormatToolbar() {
  return `
    <div class="text-format-toolbar" data-module-rich-toolbar="true">
      <button class="text-format-btn" type="button" data-richtext-action="format-nearest" data-richtext-command="bold" title="Fett">F</button>
      <button class="text-format-btn italic" type="button" data-richtext-action="format-nearest" data-richtext-command="italic" title="Kursiv">I</button>
      <button class="text-format-btn underline" type="button" data-richtext-action="format-nearest" data-richtext-command="underline" title="Unterstrichen">U</button>
      <button class="text-format-btn" type="button" data-richtext-action="format-nearest" data-richtext-command="link" title="Link einfügen">URL</button>
      <button class="text-format-btn" type="button" data-richtext-action="format-nearest" data-richtext-command="tooltip" title="Tooltip">Tip</button>
      <button class="text-format-btn" type="button" data-richtext-action="format-nearest" data-richtext-command="spoiler" title="Spoiler">Spoiler</button>
      <button class="text-format-btn" type="button" data-richtext-action="format-nearest" data-richtext-command="linebreak" title="Zeilenumbruch">↵</button>
    </div>`;
}

function getNearestRichEditorScope(button) {
  return button.closest('.inline-edit-field, .module-editor-field, .inline-comment-card, .inline-scene-card, .inline-profile-card, .module-scene-block-card, .module-profile-card');
}

function normalizeModuleRichEditorHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  template.content.querySelectorAll('div, p').forEach(block => {
    if (block.tagName === 'DIV' && block.classList.contains('module-rich-editor')) return;
    const frag = document.createDocumentFragment();
    while (block.firstChild) frag.appendChild(block.firstChild);
    frag.appendChild(document.createElement('br'));
    block.replaceWith(frag);
  });
  return sanitizeContentHtml(template.innerHTML)
    .replace(/(?:<br>\s*){3,}/gi, '<br><br>')
    .replace(/^(?:\s*<br>\s*)+|(?:\s*<br>\s*)+$/gi, '');
}

function storageHtmlToModuleEditorHtml(value) {
  const html = sanitizeContentHtml(value || '');
  return html || '';
}

function syncModuleRichEditorToTextarea(editor, options = {}) {
  const textarea = editor?.nextElementSibling?.matches?.('textarea.module-rich-textarea-source')
    ? editor.nextElementSibling
    : editor?.parentElement?.querySelector?.('textarea.module-rich-textarea-source');
  if (!textarea) return;
  textarea.value = normalizeModuleRichEditorHtml(editor.innerHTML);
  if (!options.silent) {
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function hydrateModuleRichEditors(root = document) {
  const scope = root || document;
  scope.querySelectorAll('.text-format-toolbar + textarea:not([data-rich-bound="1"])').forEach(textarea => {
    textarea.dataset.richBound = '1';
    textarea.classList.add('module-rich-textarea-source');
    textarea.hidden = true;
    const editor = document.createElement('div');
    editor.className = `${textarea.className.replace('module-rich-textarea-source', '').trim()} module-rich-editor`;
    editor.contentEditable = 'true';
    editor.spellcheck = true;
    editor.setAttribute('role', 'textbox');
    editor.setAttribute('aria-multiline', 'true');
    editor.innerHTML = storageHtmlToModuleEditorHtml(textarea.value);
    textarea.parentNode.insertBefore(editor, textarea);
    editor.addEventListener('input', () => syncModuleRichEditorToTextarea(editor));
    editor.addEventListener('blur', () => syncModuleRichEditorToTextarea(editor));
    editor.addEventListener('paste', event => {
      event.preventDefault();
      const html = event.clipboardData?.getData('text/html') || '';
      const text = event.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertHTML', false, html ? sanitizeContentHtml(html) : escapeHtml(text).replace(/\n/g, '<br>'));
      syncModuleRichEditorToTextarea(editor);
    });
  });
}

function focusModuleRichEditor(editor) {
  if (!editor) return;
  editor.focus();
  const selection = window.getSelection();
  if (selection?.rangeCount && editor.contains(selection.anchorNode)) return;
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function getModuleRichEditorSelection(editor) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  return editor.contains(range.commonAncestorContainer) ? range : null;
}

function insertRichHtml(editor, html) {
  focusModuleRichEditor(editor);
  document.execCommand('insertHTML', false, html);
  syncModuleRichEditorToTextarea(editor);
}

function insertRichHtmlAtRange(editor, range, html) {
  if (!range) {
    insertRichHtml(editor, html);
    return;
  }
  const template = document.createElement('template');
  template.innerHTML = sanitizeContentHtml(html);
  range.deleteContents();
  const fragment = template.content.cloneNode(true);
  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  if (lastNode) {
    const selection = window.getSelection();
    const nextRange = document.createRange();
    nextRange.setStartAfter(lastNode);
    nextRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(nextRange);
  }
  editor.focus();
  syncModuleRichEditorToTextarea(editor);
}

let _moduleTooltipDraft = null;

function ensureModuleTooltipEditor() {
  let overlay = document.getElementById('module-tooltip-editor-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'module-tooltip-editor-overlay';
  overlay.className = 'module-tooltip-editor-overlay';
  overlay.innerHTML = `
    <div class="module-tooltip-editor-card" role="dialog" aria-modal="true" aria-label="Tooltip bearbeiten">
      <div class="module-tooltip-editor-head">
        <div class="inline-edit-kicker">Tooltip</div>
        <button class="module-editor-mini-btn" type="button" data-richtext-action="close-tooltip-editor">Schließen</button>
      </div>
      <label class="inline-edit-label" for="module-tooltip-label-input">Markierter Text</label>
      <input class="inline-edit-input" id="module-tooltip-label-input" type="text" placeholder="Text im Modul">
      <label class="inline-edit-label">Tooltip-Inhalt</label>
      <div class="text-format-toolbar">
        <button class="text-format-btn" type="button" data-richtext-action="format-tooltip-draft" data-richtext-command="bold">F</button>
        <button class="text-format-btn italic" type="button" data-richtext-action="format-tooltip-draft" data-richtext-command="italic">I</button>
        <button class="text-format-btn underline" type="button" data-richtext-action="format-tooltip-draft" data-richtext-command="underline">U</button>
        <button class="text-format-btn" type="button" data-richtext-action="format-tooltip-draft" data-richtext-command="link">URL</button>
        <button class="text-format-btn" type="button" data-richtext-action="format-tooltip-draft" data-richtext-command="spoiler">Spoiler</button>
        <button class="text-format-btn" type="button" data-richtext-action="format-tooltip-draft" data-richtext-command="linebreak">↵</button>
      </div>
      <div class="inline-edit-textarea module-tooltip-draft-editor" id="module-tooltip-draft-editor" contenteditable="true" role="textbox" aria-multiline="true"></div>
      <div class="module-tooltip-editor-actions">
        <button class="comment-btn-cancel" type="button" data-richtext-action="close-tooltip-editor">Abbrechen</button>
        <button class="char-save-btn" type="button" data-richtext-action="apply-tooltip-editor">Einfügen</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('mousedown', event => {
    if (event.target === overlay) closeModuleTooltipEditor();
  });
  return overlay;
}

function stripHtmlToPlainText(html) {
  const box = document.createElement('div');
  box.innerHTML = sanitizeContentHtml(html || '');
  return (box.textContent || '').trim();
}

function openModuleTooltipEditor(editor, range, selectedHtml) {
  const overlay = ensureModuleTooltipEditor();
  const labelInput = document.getElementById('module-tooltip-label-input');
  const draftEditor = document.getElementById('module-tooltip-draft-editor');
  _moduleTooltipDraft = {
    editor,
    range: range ? range.cloneRange() : null,
    selectedHtml: selectedHtml || 'Text'
  };
  labelInput.value = stripHtmlToPlainText(selectedHtml) || 'Text';
  draftEditor.innerHTML = '';
  overlay.classList.add('active');
  setTimeout(() => draftEditor.focus(), 0);
}

function closeModuleTooltipEditor() {
  document.getElementById('module-tooltip-editor-overlay')?.classList.remove('active');
  _moduleTooltipDraft = null;
}

function formatTooltipDraftEditor(action) {
  const editor = document.getElementById('module-tooltip-draft-editor');
  if (!editor) return;
  editor.focus();
  if (action === 'bold') document.execCommand('bold', false);
  else if (action === 'italic') document.execCommand('italic', false);
  else if (action === 'underline') document.execCommand('underline', false);
  else if (action === 'linebreak') document.execCommand('insertHTML', false, '<br>');
  else if (action === 'link') {
    const url = prompt('Link-URL eingeben:', 'https://');
    const safeUrl = sanitizeHref(url || '');
    if (!safeUrl) return;
    document.execCommand('createLink', false, safeUrl);
  } else if (action === 'spoiler') {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    let selected = 'Text';
    if (range && editor.contains(range.commonAncestorContainer) && !range.collapsed) {
      const box = document.createElement('div');
      box.appendChild(range.cloneContents());
      selected = box.innerHTML || selected;
      range.deleteContents();
      const template = document.createElement('template');
      template.innerHTML = `<span class="module-spoiler" data-spoiler="true">${selected}</span>`;
      range.insertNode(template.content.cloneNode(true));
      return;
    }
    document.execCommand('insertHTML', false, `<span class="module-spoiler" data-spoiler="true">${selected}</span>`);
  }
}

function applyModuleTooltipEditor() {
  if (!_moduleTooltipDraft?.editor) return;
  const label = document.getElementById('module-tooltip-label-input')?.value.trim() || stripHtmlToPlainText(_moduleTooltipDraft.selectedHtml) || 'Text';
  const draftHtml = document.getElementById('module-tooltip-draft-editor')?.innerHTML || '';
  const tipHtml = sanitizeContentHtml(draftHtml).trim();
  if (!tipHtml) return;
  const labelHtml = escapeHtml(label);
  const html = `
    <span class="module-tooltip" tabindex="0">
      <span class="module-tooltip-label">${labelHtml}</span>
      <span class="module-tooltip-popover">${tipHtml}</span>
    </span>`;
  insertRichHtmlAtRange(_moduleTooltipDraft.editor, _moduleTooltipDraft.range, html);
  closeModuleTooltipEditor();
}

function formatNearestRichEditor(button, action) {
  const scope = getNearestRichEditorScope(button);
  const editor = scope?.querySelector('.module-rich-editor');
  if (!editor) return;
  focusModuleRichEditor(editor);
  const range = getModuleRichEditorSelection(editor);
  const selectedHtml = range && !range.collapsed
    ? (() => {
        const box = document.createElement('div');
        box.appendChild(range.cloneContents());
        return box.innerHTML || 'Text';
      })()
    : 'Text';

  if (action === 'bold') document.execCommand('bold', false);
  else if (action === 'italic') document.execCommand('italic', false);
  else if (action === 'underline') document.execCommand('underline', false);
  else if (action === 'linebreak') document.execCommand('insertHTML', false, '<br>');
  else if (action === 'link') {
    const url = prompt('Link-URL eingeben:', 'https://');
    const safeUrl = sanitizeHref(url || '');
    if (!safeUrl) return;
    const label = range?.collapsed ? escapeHtml(url) : selectedHtml;
    insertRichHtmlAtRange(editor, range, `<a href="${safeUrl}">${label}</a>`);
    return;
  } else if (action === 'tooltip') {
    openModuleTooltipEditor(editor, range, selectedHtml);
    return;
  } else if (action === 'spoiler') {
    insertRichHtmlAtRange(editor, range, `<span class="module-spoiler" data-spoiler="true">${selectedHtml}</span>`);
    return;
  }
  syncModuleRichEditorToTextarea(editor);
}

function handleModuleRichTextMouseDown(event) {
  const trigger = event.target?.closest?.('[data-richtext-action]');
  if (!trigger) return;
  if (trigger.closest('.text-format-toolbar')) {
    event.preventDefault();
  }
}

function handleModuleRichTextActionClick(event) {
  const trigger = event.target?.closest?.('[data-richtext-action]');
  if (!trigger) return;
  const action = trigger.dataset.richtextAction;
  const command = trigger.dataset.richtextCommand || '';

  if (action === 'format-nearest') {
    event.preventDefault();
    formatNearestRichEditor(trigger, command);
    return;
  }
  if (action === 'format-tooltip-draft') {
    event.preventDefault();
    formatTooltipDraftEditor(command);
    return;
  }
  if (action === 'close-tooltip-editor') {
    event.preventDefault();
    closeModuleTooltipEditor();
    return;
  }
  if (action === 'apply-tooltip-editor') {
    event.preventDefault();
    applyModuleTooltipEditor();
  }
}

document.addEventListener('mousedown', handleModuleRichTextMouseDown);
document.addEventListener('click', handleModuleRichTextActionClick);

