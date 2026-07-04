let _iconDirectorySearch = '';
let _iconDirectoryFolder = 'all';

function normalizeIconDirectoryText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getIconDirectoryItems() {
  return typeof ALERIA_ICON_DIRECTORY !== 'undefined' && Array.isArray(ALERIA_ICON_DIRECTORY)
    ? ALERIA_ICON_DIRECTORY
    : [];
}

function getIconDirectoryFolders() {
  return ['all', ...new Set(getIconDirectoryItems().map(item => item.folder || 'IconOrdner'))]
    .sort((a, b) => a === 'all' ? -1 : b === 'all' ? 1 : a.localeCompare(b, 'de'));
}

function getIconDirectoryVisibleItems() {
  const needle = normalizeIconDirectoryText(_iconDirectorySearch);
  return getIconDirectoryItems().filter(item => {
    const folderMatch = _iconDirectoryFolder === 'all' || item.folder === _iconDirectoryFolder;
    if (!folderMatch) return false;
    if (!needle) return true;
    return normalizeIconDirectoryText([item.name, item.fileName, item.folder, item.path].join(' ')).includes(needle);
  });
}

function getIconDirectoryRatioClass(width, height) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  if (!w || !h) return 'unknown';
  const ratio = w / h;
  if (ratio >= 1.85) return 'banner';
  if (ratio >= 1.2) return 'wide';
  if (ratio <= 0.45) return 'tall';
  if (ratio <= 0.78) return 'portrait';
  return 'square';
}

function normalizeIconDirectoryRatioClass(value) {
  return ['square', 'portrait', 'tall', 'wide', 'banner', 'missing'].includes(value) ? value : 'unknown';
}

function applyIconDirectoryImageRatio(image) {
  if (!image) return;
  const ratioClass = getIconDirectoryRatioClass(image.naturalWidth, image.naturalHeight);
  const preview = image.closest('.icon-directory-preview');
  const item = image.closest('.icon-directory-item');
  const ratio = image.naturalWidth && image.naturalHeight
    ? (image.naturalWidth / image.naturalHeight).toFixed(3)
    : '';
  [preview, item].forEach(element => {
    if (!element) return;
    element.dataset.iconRatio = ratioClass;
    if (ratio) element.style.setProperty('--icon-aspect-ratio', ratio);
  });
}

function hydrateIconDirectoryImageRatios() {
  document.querySelectorAll('#icon-directory-grid .icon-directory-preview img').forEach(image => {
    if (image.complete && image.naturalWidth) {
      applyIconDirectoryImageRatio(image);
      return;
    }
    image.addEventListener('load', () => applyIconDirectoryImageRatio(image), { once: true });
    image.addEventListener('error', () => {
      const preview = image.closest('.icon-directory-preview');
      const item = image.closest('.icon-directory-item');
      if (preview) preview.dataset.iconRatio = 'missing';
      if (item) item.dataset.iconRatio = 'missing';
    }, { once: true });
  });
}

function ensureIconDirectoryDialog() {
  let overlay = document.getElementById('icon-directory-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'icon-directory-overlay';
  overlay.className = 'icon-directory-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'icon-directory-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <div class="icon-directory-card">
      <div class="icon-directory-head">
        <div>
          <div class="icon-directory-kicker">Icon-Verzeichnis</div>
          <h2 id="icon-directory-title">Aleria Icons</h2>
        </div>
        <button class="icon-directory-close" type="button" data-icon-directory-action="close" aria-label="Icon-Verzeichnis schliessen">×</button>
      </div>
      <div class="icon-directory-toolbar">
        <label>
          <span>Suche</span>
          <input id="icon-directory-search" type="search" placeholder="Icon, Ordner oder Datei suchen" data-icon-directory-field="search">
        </label>
        <label>
          <span>Ordner</span>
          <select id="icon-directory-folder" data-icon-directory-field="folder"></select>
        </label>
        <div id="icon-directory-status" class="icon-directory-status" role="status"></div>
      </div>
      <div id="icon-directory-grid" class="icon-directory-grid"></div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function renderIconDirectoryFolderOptions() {
  const select = document.getElementById('icon-directory-folder');
  if (!select) return;
  select.innerHTML = getIconDirectoryFolders().map(folder => `
    <option value="${escapeHtml(folder)}"${folder === _iconDirectoryFolder ? ' selected' : ''}>${escapeHtml(folder === 'all' ? 'Alle Ordner' : folder)}</option>
  `).join('');
}

function renderIconDirectoryGrid() {
  const grid = document.getElementById('icon-directory-grid');
  const status = document.getElementById('icon-directory-status');
  if (!grid) return;
  const items = getIconDirectoryVisibleItems();
  if (status) status.textContent = `${items.length} von ${getIconDirectoryItems().length} Icons`;
  grid.innerHTML = items.map(item => {
    const src = sanitizeImageSrc(item.path || '');
    const ratioClass = normalizeIconDirectoryRatioClass(item.ratio);
    return `
      <article class="icon-directory-item" data-icon-ratio="${escapeHtml(ratioClass)}">
        <button class="icon-directory-preview" type="button" data-icon-ratio="${escapeHtml(ratioClass)}" data-icon-directory-action="select" data-icon-src="${escapeHtml(item.path)}" title="Icon uebernehmen">
          ${src ? `<img src="${src}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">` : ''}
        </button>
        <div class="icon-directory-item-copy">
          <strong>${escapeHtml(item.name || item.fileName)}</strong>
          <span>${escapeHtml(item.folder || 'IconOrdner')}</span>
          <code>${escapeHtml(item.path)}</code>
        </div>
        <div class="icon-directory-actions">
          <button type="button" data-icon-directory-action="copy" data-icon-src="${escapeHtml(item.path)}">Pfad kopieren</button>
          <button type="button" data-icon-directory-action="select" data-icon-src="${escapeHtml(item.path)}">Uebernehmen</button>
        </div>
      </article>`;
  }).join('') || '<div class="icon-directory-empty">Keine Icons gefunden.</div>';
  hydrateIconDirectoryImageRatios();
}

function renderIconDirectory() {
  ensureIconDirectoryDialog();
  renderIconDirectoryFolderOptions();
  const search = document.getElementById('icon-directory-search');
  if (search && search.value !== _iconDirectorySearch) search.value = _iconDirectorySearch;
  renderIconDirectoryGrid();
}

function openIconDirectory() {
  renderIconDirectory();
  activateDialog('icon-directory-overlay', { initialFocus: '#icon-directory-search' });
}

function closeIconDirectory() {
  deactivateDialog('icon-directory-overlay');
}

async function copyIconDirectoryPath(src) {
  const value = String(src || '').trim();
  if (!value) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fallback below.
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  return ok;
}

function selectIconDirectoryIcon(src) {
  const value = String(src || '').trim();
  if (!value) return;
  document.dispatchEvent(new CustomEvent('almanach-icon-selected', { detail: { src: value } }));
  const status = document.getElementById('icon-directory-status');
  if (status) status.textContent = 'Icon-Pfad uebernommen.';
}

function handleIconDirectoryClick(event) {
  const trigger = event.target?.closest?.('[data-icon-directory-action]');
  if (!trigger || !trigger.closest('#icon-directory-overlay')) return;
  const action = trigger.dataset.iconDirectoryAction;
  if (action === 'close') {
    event.preventDefault();
    closeIconDirectory();
    return;
  }
  if (action === 'select') {
    event.preventDefault();
    selectIconDirectoryIcon(trigger.dataset.iconSrc || '');
    return;
  }
  if (action === 'copy') {
    event.preventDefault();
    copyIconDirectoryPath(trigger.dataset.iconSrc || '').then(ok => {
      const status = document.getElementById('icon-directory-status');
      if (status) status.textContent = ok ? 'Icon-Pfad kopiert.' : 'Kopieren nicht moeglich.';
    });
  }
}

function handleIconDirectoryInput(event) {
  if (!event.target?.closest?.('#icon-directory-overlay')) return;
  if (event.target?.dataset?.iconDirectoryField === 'search') {
    _iconDirectorySearch = event.target.value || '';
    renderIconDirectoryGrid();
  }
}

function handleIconDirectoryChange(event) {
  if (!event.target?.closest?.('#icon-directory-overlay')) return;
  if (event.target?.dataset?.iconDirectoryField === 'folder') {
    _iconDirectoryFolder = event.target.value || 'all';
    renderIconDirectoryGrid();
  }
}

document.addEventListener('click', handleIconDirectoryClick);
document.addEventListener('input', handleIconDirectoryInput);
document.addEventListener('change', handleIconDirectoryChange);
