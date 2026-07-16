import { escapeHtml } from '../../ui/dom.js';

const MAX_DATA_IMAGE_LENGTH = 800000;
const DATA_IMAGE_PATTERN = /^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i;

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value, 'https://aleria.invalid/');
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSafeRelativeUrl(value) {
  return !/^[a-z][a-z0-9+.-]*:/i.test(value)
    && !/^\/\//.test(value)
    && !/[\\\r\n]/.test(value);
}

export function sanitizeBiographyImageSource(source) {
  const value = String(source || '').trim();
  if (!value) return '';
  if (/^data:/i.test(value)) {
    if (value.length > MAX_DATA_IMAGE_LENGTH || !DATA_IMAGE_PATTERN.test(value)) return '';
    return value.replace(/\s+/g, '');
  }
  if (/^https?:\/\//i.test(value)) return isSafeHttpUrl(value) ? value : '';
  return isSafeRelativeUrl(value) ? value : '';
}

export function sanitizeBiographyHref(source) {
  const value = String(source || '').trim();
  if (!value || /^(?:javascript|data|vbscript):/i.test(value)) return '';
  if (/^https?:\/\//i.test(value)) return isSafeHttpUrl(value) ? value : '';
  return isSafeRelativeUrl(value) ? value : '';
}

export function sanitizeBiographyRichText(value, documentRef = globalThis.document) {
  if (!documentRef?.createElement) return escapeHtml(value).replace(/\r?\n/g, '<br>');

  const template = documentRef.createElement('template');
  template.innerHTML = String(value || '');
  const allowedTags = new Set(['BR', 'STRONG', 'EM', 'B', 'I', 'U', 'A', 'SPAN']);
  Array.from(template.content.querySelectorAll('*')).forEach(element => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(documentRef.createTextNode(element.textContent || ''));
      return;
    }

    if (element.tagName === 'A') {
      const href = sanitizeBiographyHref(element.getAttribute('href'));
      const text = element.textContent || '';
      Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name));
      if (!href) {
        element.replaceWith(documentRef.createTextNode(text));
        return;
      }
      element.setAttribute('href', href);
      if (/^https?:\/\//i.test(href)) {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      }
      return;
    }

    if (element.tagName === 'SPAN') {
      const tip = String(element.getAttribute('data-tip') || '').trim().slice(0, 300);
      const isTooltip = element.classList.contains('module-tooltip');
      const isTooltipLabel = element.classList.contains('module-tooltip-label');
      const isTooltipPopover = element.classList.contains('module-tooltip-popover');
      const spoiler = element.getAttribute('data-spoiler') === 'true'
        || element.classList.contains('module-spoiler')
        || element.classList.contains('editor-spoiler');
      const label = element.textContent || '';
      Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name));
      if (isTooltip) {
        element.className = 'module-tooltip';
        element.setAttribute('tabindex', '0');
        return;
      }
      if (isTooltipLabel) {
        element.className = 'module-tooltip-label';
        return;
      }
      if (isTooltipPopover) {
        element.className = 'module-tooltip-popover';
        return;
      }
      if (tip) {
        element.className = 'module-tooltip';
        element.setAttribute('tabindex', '0');
        element.textContent = '';
        const labelElement = documentRef.createElement('span');
        labelElement.className = 'module-tooltip-label';
        labelElement.textContent = label || 'Text';
        const popover = documentRef.createElement('span');
        popover.className = 'module-tooltip-popover';
        popover.textContent = tip;
        element.append(labelElement, popover);
        return;
      }
      if (spoiler) {
        element.className = 'module-spoiler';
        element.setAttribute('data-spoiler', 'true');
        return;
      }
      element.replaceWith(documentRef.createTextNode(label));
      return;
    }

    Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name));
  });
  return template.innerHTML.replace(/\n/g, '<br>');
}
