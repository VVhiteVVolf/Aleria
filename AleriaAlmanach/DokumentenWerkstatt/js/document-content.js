import { safeImageUrl } from './document-schema.js';

export function sanitizeContent(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const allowed = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'A', 'DIV', 'SPAN', 'H2', 'H3', 'BLOCKQUOTE', 'HR', 'FIGURE', 'FIGCAPTION', 'IMG']);
  const clean = parent => {
    for (const node of [...parent.children]) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH', 'TEMPLATE'].includes(node.tagName)) { node.remove(); continue; }
      clean(node);
      if (!allowed.has(node.tagName)) { node.replaceWith(...node.childNodes); continue; }
      const align = node.style.textAlign;
      const href = node.tagName === 'A' ? node.getAttribute('href') || '' : '';
      const image = node.tagName === 'IMG' ? { src: safeImageUrl(node.getAttribute('src')), alt: String(node.getAttribute('alt') || '').slice(0, 400), width: Number(node.getAttribute('width')) } : null;
      for (const attribute of [...node.attributes]) node.removeAttribute(attribute.name);
      if (image) {
        if (!image.src) { node.remove(); continue; }
        node.setAttribute('src', image.src); node.setAttribute('alt', image.alt);
        if (Number.isInteger(image.width) && image.width >= 40 && image.width <= 900) {
          node.setAttribute('width', String(image.width)); node.style.width = `${image.width}px`;
        }
      }
      if (['left', 'right', 'center', 'justify'].includes(align)) node.style.textAlign = align;
      if (href && /^(https?:\/\/|\/(?!\/)|\.\.?\/|#)/i.test(href) && !/[\u0000-\u0020]/.test(href)) {
        node.setAttribute('href', href); node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  };
  clean(template.content);
  return template.innerHTML;
}

export function stripHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = sanitizeContent(html);
  return (template.content.textContent || '').replace(/\s+/g, ' ').trim();
}

export function readableText(meta) {
  if (meta.translation?.trim()) return meta.translation;
  const template = document.createElement('template');
  template.innerHTML = meta.pages.map(sanitizeContent).join('<hr>');
  template.content.querySelectorAll('br, hr').forEach(node => node.replaceWith('\n'));
  template.content.querySelectorAll('p, div, h2, h3, li, blockquote').forEach(node => node.append('\n'));
  return (template.content.textContent || '').trim();
}
