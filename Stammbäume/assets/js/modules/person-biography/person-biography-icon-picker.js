import { escapeHtml } from '../../ui/dom.js';
import { sanitizeBiographyImageSource } from './person-biography-content.js';

function normalizeSearchText(value) {
  return String(value || '')
    .toLocaleLowerCase('de')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function ratioClass(value) {
  return ['square', 'portrait', 'tall', 'wide', 'banner'].includes(value) ? value : 'unknown';
}

export function createPersonBiographyIconPicker({ documentRef = document, runtime = globalThis } = {}) {
  const dialog = documentRef.createElement('dialog');
  dialog.className = 'person-biography-icon-dialog';
  dialog.setAttribute('aria-labelledby', 'person-biography-icon-title');
  documentRef.body.appendChild(dialog);
  let search = '';
  let folder = 'all';
  let selectionHandler = null;

  function items() {
    return Array.isArray(runtime.ALERIA_ICON_DIRECTORY) ? runtime.ALERIA_ICON_DIRECTORY : [];
  }

  function folders() {
    return ['all', ...new Set(items().map(item => item.folder || 'IconOrdner'))]
      .sort((left, right) => left === 'all' ? -1 : right === 'all' ? 1 : left.localeCompare(right, 'de'));
  }

  function visibleItems() {
    const needle = normalizeSearchText(search);
    return items().filter(item => {
      if (folder !== 'all' && item.folder !== folder) return false;
      if (!needle) return true;
      return normalizeSearchText([item.name, item.fileName, item.folder, item.path].join(' ')).includes(needle);
    });
  }

  function renderGrid() {
    const grid = dialog.querySelector('[data-biography-icon-grid]');
    const status = dialog.querySelector('[data-biography-icon-status]');
    if (!grid) return;
    const visible = visibleItems();
    if (status) status.textContent = `${visible.length} von ${items().length} Icons`;
    grid.innerHTML = visible.map(item => {
      const source = sanitizeBiographyImageSource(item.path);
      const name = item.name || item.fileName || 'Icon';
      return `<article class="icon-directory-item" data-icon-ratio="${ratioClass(item.ratio)}">
        <button class="icon-directory-preview" type="button" data-icon-ratio="${ratioClass(item.ratio)}" data-biography-icon-action="select" data-icon-src="${escapeHtml(source)}" title="${escapeHtml(name)} übernehmen">
          ${source ? `<img src="${escapeHtml(source)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">` : ''}
        </button>
        <div class="icon-directory-item-copy"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(item.folder || 'IconOrdner')}</span><code>${escapeHtml(item.path)}</code></div>
        <div class="icon-directory-actions"><button type="button" data-biography-icon-action="select" data-icon-src="${escapeHtml(source)}">Übernehmen</button></div>
      </article>`;
    }).join('') || '<div class="icon-directory-empty">Keine passenden Icons gefunden.</div>';
  }

  function render() {
    dialog.innerHTML = `<div class="icon-directory-card">
      <div class="icon-directory-head">
        <div><div class="icon-directory-kicker">Gemeinsames Almanach-Verzeichnis</div><h2 id="person-biography-icon-title">Persönlichkeits-Icon wählen</h2></div>
        <button class="icon-directory-close" type="button" data-biography-icon-action="close" aria-label="Icon-Verzeichnis schließen">×</button>
      </div>
      <div class="icon-directory-toolbar">
        <label><span>Suche</span><input type="search" value="${escapeHtml(search)}" placeholder="Icon, Ordner oder Datei suchen" data-biography-icon-field="search"></label>
        <label><span>Ordner</span><select data-biography-icon-field="folder">${folders().map(name => `<option value="${escapeHtml(name)}"${name === folder ? ' selected' : ''}>${escapeHtml(name === 'all' ? 'Alle Ordner' : name)}</option>`).join('')}</select></label>
        <div class="icon-directory-status" data-biography-icon-status role="status"></div>
      </div>
      <div class="icon-directory-grid" data-biography-icon-grid></div>
    </div>`;
    renderGrid();
  }

  function open({ onSelect } = {}) {
    selectionHandler = typeof onSelect === 'function' ? onSelect : null;
    search = '';
    folder = 'all';
    render();
    dialog.showModal();
    dialog.querySelector('[data-biography-icon-field="search"]')?.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
    selectionHandler = null;
  }

  function onClick(event) {
    const button = event.target.closest('[data-biography-icon-action]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (button.dataset.biographyIconAction === 'close') {
      close();
      return;
    }
    const source = sanitizeBiographyImageSource(button.dataset.iconSrc);
    if (!source) return;
    selectionHandler?.(source);
    close();
  }

  function onInput(event) {
    if (event.target.dataset.biographyIconField !== 'search') return;
    search = event.target.value || '';
    renderGrid();
  }

  function onChange(event) {
    if (event.target.dataset.biographyIconField !== 'folder') return;
    folder = event.target.value || 'all';
    renderGrid();
  }

  dialog.addEventListener('click', onClick);
  dialog.addEventListener('input', onInput);
  dialog.addEventListener('change', onChange);

  function destroy() {
    dialog.removeEventListener('click', onClick);
    dialog.removeEventListener('input', onInput);
    dialog.removeEventListener('change', onChange);
    dialog.remove();
  }

  return Object.freeze({ open, close, destroy });
}
