import { renderAdministrationHierarchy } from './administration-hierarchy.mjs?v=administration-dialog-20260911b';

export function renderEmptyArea() {
  const result = document.createDocumentFragment();
  const placeholder = document.createElement('p');
  placeholder.className = 'administration-dialog-status';
  placeholder.textContent = 'Die Verwaltungsstruktur dieser Herrschaft folgt …';
  result.append(placeholder);
  return result;
}

export function renderLegacyContent(source) {
  const parsed = new DOMParser().parseFromString(source, 'text/html');
  const legacyRoot = parsed.querySelector('.user_css') || parsed.body;
  const outerTable = [...legacyRoot.children].find(element => element.tagName === 'TABLE');
  const result = document.createDocumentFragment();
  if (!outerTable?.tBodies?.[0]) {
    const section = document.createElement('section');
    section.className = 'administration-dialog-section';
    section.append(sanitize(legacyRoot.cloneNode(true)));
    result.append(section);
    return result;
  }
  const rows = [...outerTable.tBodies[0].rows];
  const metadata = extractMetadata(rows[0]);
  if (metadata) result.append(metadata);
  for (const row of rows.slice(1)) {
    for (const cell of [...row.cells].filter(entry => entry.colSpan >= 3)) {
      const clone = cell.cloneNode(true);
      removeLegacyNavigation(clone);
      sanitize(clone);
      const section = document.createElement('section');
      section.className = 'administration-dialog-section';
      section.append(...clone.childNodes);
      if (!textFor(section) && !section.querySelector('img')) continue;
      const heading = section.querySelector('.administration-dialog-heading');
      const remainder = section.cloneNode(true);
      remainder.querySelector('.administration-dialog-heading')?.remove();
      if (heading && isPending(textFor(remainder)) && !remainder.querySelector('img, table, details')) section.classList.add('is-pending');
      result.append(section);
    }
  }
  return result;
}

function extractMetadata(firstRow) {
  const infoTable = [...(firstRow?.querySelectorAll('table') || [])].at(-1);
  if (!infoTable) return null;
  const list = document.createElement('dl');
  list.className = 'administration-dialog-facts';
  for (const row of [...infoTable.rows].slice(1)) {
    if (row.cells.length < 2) continue;
    const term = textFor(row.cells[0]);
    const value = textFor(row.cells[1]);
    if (!term && !value) continue;
    const pair = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = isPending(value) ? 'Folgt …' : value;
    if (isPending(value)) dd.className = 'is-pending';
    pair.append(dt, dd);
    list.append(pair);
  }
  return list.children.length ? list : null;
}

function removeLegacyNavigation(root) {
  for (const table of root.querySelectorAll('table')) {
    const text = textFor(table);
    if (text.includes('Verwaltungsapparat') && text.includes('Hauptseite')) table.remove();
  }
}

function sanitize(root) {
  root.querySelectorAll('script, style, link, iframe, object, embed, form, input, button, textarea, select').forEach(node => node.remove());
  for (const element of root.querySelectorAll('*')) {
    const legacyStyle = element.getAttribute('style') || '';
    for (const attribute of [...element.attributes]) {
      if (!['href', 'src', 'alt', 'colspan', 'rowspan', 'open'].includes(attribute.name)) element.removeAttribute(attribute.name);
    }
    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || '';
      if (!/^(https?:|\/|#)/i.test(href)) element.removeAttribute('href');
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    }
    if (element.tagName === 'IMG') {
      const src = element.getAttribute('src') || '';
      if (!/^(https?:|\/)/i.test(src)) element.removeAttribute('src');
      element.className = getImageKind(legacyStyle);
      element.loading = 'lazy';
      element.decoding = 'async';
    }
    if (element.tagName === 'DETAILS') element.className = 'administration-dialog-details';
    if (element.tagName === 'SUMMARY') element.textContent = textFor(element).replace(/^[▶►▸▹\s]+/, '');
  }
  for (const node of root.querySelectorAll('p, tr')) {
    if (!textFor(node) && !node.querySelector('img')) node.remove();
  }
  for (const paragraph of root.querySelectorAll('p')) {
    const text = textFor(paragraph);
    if (/^[1-6]\)\s*\S/.test(text)) {
      const heading = document.createElement('h3');
      heading.className = 'administration-dialog-heading';
      heading.textContent = text;
      paragraph.replaceWith(heading);
    } else if (isPending(text) && !paragraph.querySelector('img')) paragraph.textContent = 'Folgt …';
  }
  for (const table of [...root.querySelectorAll('table')].reverse()) enhanceTable(table);
  return root;
}

function enhanceTable(table) {
  // Some magic documents wrap only the hierarchy title in a nested table.
  if (table.parentElement?.tagName === 'TD' && table.rows.length === 1 && table.rows[0].cells.length === 1 && !table.querySelector('img, table')) {
    table.replaceWith(...table.rows[0].cells[0].childNodes);
    return;
  }
  const hasPortraits = Boolean(table.querySelector('.administration-dialog-portrait'));
  const hasImages = Boolean(table.querySelector('img'));
  if (hasPortraits || (hasImages && table.rows.length >= 4)) {
    const hierarchy = renderAdministrationHierarchy(table, textFor, isPending);
    if (hierarchy) {
      table.replaceWith(hierarchy);
      return;
    }
  }
  table.className = 'administration-dialog-table';
  if (table.querySelectorAll('thead th').length >= 3 && !hasImages) table.classList.add('is-office-table');
  if (table.classList.contains('is-office-table')) {
    const summary = table.closest('details')?.querySelector(':scope > summary');
    if (summary && !summary.textContent.includes('Aufgaben & Zuständigkeiten')) summary.append(' · Aufgaben & Zuständigkeiten');
  }
  const scroller = document.createElement('div');
  scroller.className = 'administration-dialog-table-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Aufgaben und Zuständigkeiten');
  table.before(scroller);
  scroller.append(table);
}

function getImageKind(style) {
  const width = Number(style.match(/width\s*:\s*(\d+)px/i)?.[1] || 0);
  const height = Number(style.match(/height\s*:\s*(\d+)px/i)?.[1] || 0);
  if (width && height && height / width >= 1.25) return 'administration-dialog-portrait';
  if (width && height && width / height >= 1.45) return 'administration-dialog-landscape';
  return 'administration-dialog-emblem';
}

function textFor(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('br').forEach(element => element.replaceWith(' '));
  clone.querySelectorAll('p, div').forEach(element => element.append(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function isPending(text) {
  return !text || /^[\s.?!…–—-]+$/.test(text) || text === 'Folgt …';
}
