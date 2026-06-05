function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const MAX_DATA_IMAGE_SRC_LENGTH = 800000;
const ALLOWED_DATA_IMAGE_RE = /^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i;

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeImageSrc(src) {
  const value = String(src ?? '').trim();
  if (!value) return '';

  if (/^data:/i.test(value)) {
    if (value.length > MAX_DATA_IMAGE_SRC_LENGTH) return '';
    return ALLOWED_DATA_IMAGE_RE.test(value) ? escapeHtml(value.replace(/\s+/g, '')) : '';
  }

  if (/^https?:\/\//i.test(value)) {
    return isSafeHttpUrl(value) ? escapeHtml(value) : '';
  }

  if (/^(?:\.{0,2}\/|\/)(?!\/)/.test(value)) {
    return escapeHtml(value);
  }

  return '';
}

function sanitizeStyleUrl(src) {
  const safe = sanitizeImageSrc(src);
  return safe ? safe.replace(/['"()\\r\\n]/g, '') : '';
}

function sanitizeHref(href) {
  const value = String(href ?? '').trim();
  if (!value) return '';
  if (/^(?:javascript|data|vbscript):/i.test(value)) return '';
  if (/^https?:\/\//i.test(value)) return isSafeHttpUrl(value) ? escapeHtml(value) : '';
  if (/^(?:\.{0,2}\/|\/)(?!\/|\\)/.test(value)) return escapeHtml(value);
  return '';
}

const _preloadedImageSrcs = new Set();

function preloadImageSrc(src) {
  const value = String(src || '').trim();
  if (!value || _preloadedImageSrcs.has(value) || !sanitizeImageSrc(value)) return;
  _preloadedImageSrcs.add(value);
  const image = new Image();
  image.decoding = 'async';
  image.src = value;
}

function preloadEntryImages(entry, limit = 2) {
  if (!entry) return;
  const sources = [];
  if (entry.image) sources.push(entry.image);
  getPages(entry).forEach(page => {
    if (page?.image) sources.push(page.image);
  });
  sources.filter(Boolean).slice(0, Math.max(1, Number(limit) || 2)).forEach(preloadImageSrc);
}

function sanitizeContentHtml(value) {
  const template = document.createElement('template');
  template.innerHTML = String(value ?? '');
  const allowedTags = new Set(['BR', 'STRONG', 'EM', 'B', 'I', 'U', 'A', 'SPAN']);
  Array.from(template.content.querySelectorAll('*')).forEach(el => {
    if (!allowedTags.has(el.tagName)) {
      el.replaceWith(document.createTextNode(el.textContent || ''));
      return;
    }

    if (el.tagName === 'A') {
      const href = sanitizeHref(el.getAttribute('href') || '');
      const text = el.textContent || '';
      Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
      if (!href) {
        el.replaceWith(document.createTextNode(text));
        return;
      }
      el.setAttribute('href', href);
      if (/^https?:\/\//i.test(href)) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
      return;
    }

    if (el.tagName === 'SPAN') {
      const tip = String(el.getAttribute('data-tip') || '').trim();
      const isTooltip = el.classList.contains('module-tooltip');
      const isTooltipLabel = el.classList.contains('module-tooltip-label');
      const isTooltipPopover = el.classList.contains('module-tooltip-popover');
      const spoiler = el.getAttribute('data-spoiler') === 'true' || el.classList.contains('module-spoiler') || el.classList.contains('editor-spoiler');
      Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
      if (isTooltip) {
        el.className = 'module-tooltip';
        el.setAttribute('tabindex', '0');
        if (tip && !el.querySelector('.module-tooltip-popover')) {
          const labelText = el.textContent || 'Text';
          el.textContent = '';
          const label = document.createElement('span');
          label.className = 'module-tooltip-label';
          label.textContent = labelText;
          const popover = document.createElement('span');
          popover.className = 'module-tooltip-popover';
          popover.textContent = tip.slice(0, 300);
          el.append(label, popover);
        }
        return;
      }
      if (isTooltipLabel) {
        el.className = 'module-tooltip-label';
        return;
      }
      if (isTooltipPopover) {
        el.className = 'module-tooltip-popover';
        return;
      }
      if (tip) {
        el.className = 'module-tooltip';
        el.setAttribute('tabindex', '0');
        const label = document.createElement('span');
        label.className = 'module-tooltip-label';
        label.textContent = el.textContent || 'Text';
        const popover = document.createElement('span');
        popover.className = 'module-tooltip-popover';
        popover.textContent = tip.slice(0, 300);
        el.textContent = '';
        el.append(label, popover);
        return;
      }
      if (spoiler) {
        el.className = 'module-spoiler';
        el.setAttribute('data-spoiler', 'true');
        return;
      }
      el.replaceWith(document.createTextNode(el.textContent || ''));
      return;
    }

    Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
  });
  return template.innerHTML.replace(/\n/g, '<br>');
}

// Rich-Text-Werkzeuge fuer Modultexte liegen in module-richtext.js.
function formatNearestTextarea(button, openTag, closeTag = '') {
  const scope = button.closest('.inline-edit-field, .module-editor-field, .inline-comment-card, .inline-scene-card, .inline-profile-card, .module-scene-block-card, .module-profile-card');
  const textarea = scope?.querySelector('textarea');
  if (!textarea || textarea.disabled) return;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  const selected = textarea.value.slice(start, end);
  const insert = openTag === '<br>'
    ? '<br>'
    : `${openTag}${selected || 'Text'}${closeTag}`;
  textarea.value = textarea.value.slice(0, start) + insert + textarea.value.slice(end);
  const caret = start + (openTag === '<br>' ? insert.length : openTag.length + (selected || 'Text').length);
  textarea.selectionStart = caret;
  textarea.selectionEnd = caret;
  textarea.focus();
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function getFriendlyErrorMessage(error, fallback) {
  const code = String(error?.code || '');
  if (code.includes('permission-denied')) return 'Keine Berechtigung. Prüfe bitte die Firestore-Regeln oder deinen Zugriff.';
  if (code.includes('unavailable')) return 'Verbindung zu Firebase nicht verfügbar. Bitte später erneut versuchen.';
  if (code.includes('resource-exhausted')) return 'Speicher- oder Anfrage-Limit erreicht. Bitte Bildgröße oder Textmenge reduzieren.';
  return fallback || 'Ein Fehler ist aufgetreten.';
}

function getInitialChar(value) {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized[0].toUpperCase() : '?';
}


// ── RENDER GRID ───────────────────────────────────────────────────────────────
// ── TAB SYSTEM ───────────────────────────────────────────────────────────────
