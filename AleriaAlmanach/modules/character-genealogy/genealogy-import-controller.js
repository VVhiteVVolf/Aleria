import { createFamilyCandidates, buildImportedCharacter } from './genealogy-mapping.js?v=20260807-save-guard-v1';
import {
  listGenealogyFamilies,
  loadGenealogyFamily,
  loadPublishedGenealogyFamily,
  refreshGenealogyRegistry
} from './genealogy-source-repository.js';
import {
  findBestCharacterMatch,
  normalizeCharacterGenealogy,
  normalizeCharacterIdentity
} from './person-identity.js';

const DIALOG_ID = 'genealogy-import-overlay';
const state = {
  families: [],
  activeFamily: null,
  candidates: [],
  selectedPersonId: '',
  search: '',
  showDead: false,
  showUnknown: false,
  loading: false,
  syncing: false,
  error: '',
  loadToken: 0
};

window.AleriaCharacterGenealogy = Object.freeze({
  normalizeCharacterGenealogy,
  normalizeCharacterIdentity,
  findBestCharacterMatch
});

function escapeMarkup(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCharacters() {
  return typeof window.getAllCharacterRecords === 'function'
    ? window.getAllCharacterRecords()
    : [];
}

function safePortraitSource(value) {
  if (typeof window.sanitizeImageSrc === 'function') return window.sanitizeImageSrc(value);
  const source = String(value || '').trim();
  return /^(https:\/\/|\.\.\/|\.\/|assets\/)/i.test(source) ? source : '';
}

function ensureDialog() {
  let overlay = document.getElementById(DIALOG_ID);
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = DIALOG_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'genealogy-import-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <div class="genealogy-import-card">
      <header class="genealogy-import-header">
        <div>
          <div class="genealogy-import-kicker">Stammbaum-Verbindung</div>
          <h2 id="genealogy-import-title">Charakter aus Stammbaum anlegen</h2>
        </div>
        <button type="button" class="genealogy-import-close" data-character-genealogy-action="close" aria-label="Dialog schließen">✕</button>
      </header>
      <div class="genealogy-import-toolbar">
        <label>
          <span>Familie</span>
          <select data-character-genealogy-role="family-select"></select>
        </label>
        <label>
          <span>Person suchen</span>
          <input type="search" data-character-genealogy-role="search" placeholder="Name, Haus oder Lebensdaten">
        </label>
        <div class="genealogy-import-filters" role="group" aria-label="Personen filtern">
          <span>Anzeigen</span>
          <div class="genealogy-import-filter-toggles">
            <label class="genealogy-import-filter-toggle">
              <input type="checkbox" data-character-genealogy-role="show-dead">
              <span>Tote anzeigen</span>
            </label>
            <label class="genealogy-import-filter-toggle">
              <input type="checkbox" data-character-genealogy-role="show-unknown">
              <span>„????“ anzeigen</span>
            </label>
          </div>
        </div>
      </div>
      <div class="genealogy-import-body">
        <div class="genealogy-import-list" data-character-genealogy-role="person-list"></div>
        <aside class="genealogy-import-preview" data-character-genealogy-role="preview"></aside>
      </div>
      <footer class="genealogy-import-footer">
        <span data-character-genealogy-role="status"></span>
        <button type="button" class="comment-btn-cancel" data-character-genealogy-action="close">Schließen</button>
      </footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function getDialogRole(role) {
  return ensureDialog().querySelector(`[data-character-genealogy-role="${role}"]`);
}

function candidateSearchText(candidate) {
  return [
    candidate.displayName,
    candidate.title,
    candidate.houseName,
    candidate.birth,
    candidate.death,
    candidate.familyTitle
  ].join(' ').toLocaleLowerCase('de');
}

// Standardmäßig zeigt der Dialog nur lebende Personen; Verstorbene und
// Personen ohne belegten Status („????“) werden per Schalter zugeschaltet.
function statusVisible(candidate) {
  if (candidate.status === 'alive') return true;
  if (candidate.status === 'dead') return state.showDead;
  return state.showUnknown;
}

function getVisibleCandidates() {
  const needle = state.search.trim().toLocaleLowerCase('de');
  return state.candidates.filter(candidate => (
    statusVisible(candidate) && (!needle || candidateSearchText(candidate).includes(needle))
  ));
}

function matchFor(candidate) {
  return findBestCharacterMatch(candidate, getCharacters());
}

function matchLabel(match) {
  if (!match) return { text: 'Noch nicht angelegt', className: 'available' };
  if (match.kind === 'linked') return { text: 'Bereits verknüpft', className: 'linked' };
  if (match.kind === 'probable') return { text: 'Sehr wahrscheinlich dieselbe Person', className: 'probable' };
  if (match.kind === 'conflict') return { text: 'Namenskonflikt', className: 'conflict' };
  return { text: 'Gleicher Name – prüfen', className: 'warning' };
}

function formatLife(candidate) {
  return `${candidate.birth || '????'} – ${candidate.death || (candidate.status === 'alive' ? 'lebend' : '????')}`;
}

function renderFamilyOptions() {
  const select = getDialogRole('family-select');
  select.innerHTML = state.families.map(record => {
    const path = [...(record.folderPath || []), record.title || record.id].join(' > ');
    return `<option value="${escapeMarkup(record.id)}"${record.id === state.activeFamily?.id ? ' selected' : ''}>${escapeMarkup(path)}</option>`;
  }).join('');
  select.disabled = state.loading || state.families.length === 0;
}

function renderPersonList() {
  const list = getDialogRole('person-list');
  if (state.loading) {
    list.innerHTML = '<div class="genealogy-import-empty">Stammbaumdaten werden geladen…</div>';
    return;
  }
  if (state.error) {
    list.innerHTML = `<div class="genealogy-import-empty is-error">${escapeMarkup(state.error)}</div>`;
    return;
  }
  const candidates = getVisibleCandidates();
  if (!candidates.length) {
    list.innerHTML = '<div class="genealogy-import-empty">Keine passende Person gefunden.</div>';
    return;
  }
  list.innerHTML = candidates.map(candidate => {
    const match = matchFor(candidate);
    const label = matchLabel(match);
    const portrait = safePortraitSource(candidate.portrait);
    const initial = escapeMarkup(candidate.displayName.slice(0, 1) || '?');
    return `
      <button type="button" class="genealogy-person-row${candidate.personId === state.selectedPersonId ? ' active' : ''}"
        data-character-genealogy-action="select-person" data-person-id="${escapeMarkup(candidate.personId)}">
        <span class="genealogy-person-portrait">${portrait
          ? `<img src="${escapeMarkup(portrait)}" alt="" loading="lazy" decoding="async">`
          : `<span>${initial}</span>`}</span>
        <span class="genealogy-person-main">
          <strong>${escapeMarkup(candidate.displayName)}</strong>
          <small>${escapeMarkup(candidate.houseName || candidate.title || 'Ohne Hausangabe')} · ${escapeMarkup(formatLife(candidate))}</small>
        </span>
        <span class="genealogy-match-badge ${label.className}">${escapeMarkup(label.text)}</span>
      </button>`;
  }).join('');
}

function relationshipLine(label, people) {
  if (!people?.length) return '';
  return `<div><strong>${escapeMarkup(label)}:</strong> ${people.map(person => escapeMarkup(person.name)).join(', ')}</div>`;
}

function actionMarkup(candidate, match) {
  if (match?.kind === 'linked') {
    return `<button type="button" class="genealogy-import-primary" data-character-genealogy-action="open-linked" data-character-id="${escapeMarkup(match.characterId)}">Almanachprofil öffnen</button>`;
  }
  if (match) {
    const primaryLabel = match.kind === 'probable'
      ? `Mit ${match.character?.name || 'bestehendem Charakter'} verknüpfen`
      : 'Nach Prüfung verknüpfen';
    return `
      <button type="button" class="genealogy-import-primary" data-character-genealogy-action="link-existing" data-character-id="${escapeMarkup(match.characterId)}">${escapeMarkup(primaryLabel)}</button>
      <button type="button" class="genealogy-import-secondary" data-character-genealogy-action="create-separate">Trotzdem getrennt anlegen</button>`;
  }
  return '<button type="button" class="genealogy-import-primary" data-character-genealogy-action="create-character">Als Charakter anlegen</button>';
}

function renderPreview() {
  const preview = getDialogRole('preview');
  const candidate = state.candidates.find(item => item.personId === state.selectedPersonId);
  if (!candidate) {
    preview.innerHTML = '<div class="genealogy-import-empty">Wähle links eine Person aus.</div>';
    return;
  }
  const match = matchFor(candidate);
  const label = matchLabel(match);
  const portrait = safePortraitSource(candidate.portrait);
  preview.innerHTML = `
    <div class="genealogy-preview-portrait">${portrait
      ? `<img src="${escapeMarkup(portrait)}" alt="Portrait von ${escapeMarkup(candidate.displayName)}">`
      : `<span>${escapeMarkup(candidate.displayName.slice(0, 1) || '?')}</span>`}</div>
    <div class="genealogy-preview-heading">
      <div class="genealogy-match-badge ${label.className}">${escapeMarkup(label.text)}</div>
      <h3>${escapeMarkup(candidate.displayName)}</h3>
      <p>${escapeMarkup(candidate.title || candidate.houseName || candidate.familyTitle)}</p>
    </div>
    <dl class="genealogy-preview-data">
      <div><dt>Lebensdaten</dt><dd>${escapeMarkup(formatLife(candidate))}</dd></div>
      <div><dt>Geschlecht</dt><dd>${escapeMarkup(candidate.sex || 'unknown')}</dd></div>
      <div><dt>Quelle</dt><dd>${escapeMarkup(candidate.familyTitle)}${candidate.releaseId ? ` · ${escapeMarkup(candidate.releaseId)}` : ' · Projektfassung'}</dd></div>
    </dl>
    <div class="genealogy-preview-relations">
      ${relationshipLine('Eltern', candidate.relationships.parents)}
      ${relationshipLine('Partner', candidate.relationships.partners)}
      ${relationshipLine('Kinder', candidate.relationships.children)}
    </div>
    ${match ? `<div class="genealogy-match-reason"><strong>Erkennung:</strong> ${escapeMarkup(match.reason)}</div>` : ''}
    <div class="genealogy-preview-actions">${actionMarkup(candidate, match)}</div>`;
}

function renderStatus() {
  const status = getDialogRole('status');
  if (state.loading) {
    status.textContent = 'Lade Daten…';
    return;
  }
  const visible = `${getVisibleCandidates().length} von ${state.candidates.length} Personen sichtbar`;
  status.textContent = state.syncing
    ? `${visible} · gleiche veröffentlichte Fassung ab…`
    : visible;
}

function render() {
  renderFamilyOptions();
  renderPersonList();
  renderPreview();
  renderStatus();
}

function ensureVisibleSelection() {
  const visible = getVisibleCandidates();
  if (!visible.some(candidate => candidate.personId === state.selectedPersonId)) {
    state.selectedPersonId = visible[0]?.personId || '';
  }
}

function applyLoadedFamily(loaded) {
  state.activeFamily = loaded;
  state.candidates = createFamilyCandidates(loaded);
  ensureVisibleSelection();
}

// Die veröffentlichte Fassung kann lokale Projektdaten überholen; sie wird im
// Hintergrund nachgeladen, damit der Dialog sofort mit den Projektdaten arbeitet.
function refreshPublishedFamily(record, token) {
  state.syncing = true;
  renderStatus();
  void loadPublishedGenealogyFamily(record)
    .then(published => {
      if (token !== state.loadToken) return;
      if (published) applyLoadedFamily(published);
    })
    .finally(() => {
      if (token !== state.loadToken) return;
      state.syncing = false;
      render();
    });
}

function selectFamily(familyId) {
  const record = state.families.find(item => item.id === familyId);
  if (!record) return;
  const token = ++state.loadToken;
  state.activeFamily = record;
  state.error = '';
  state.candidates = [];
  state.selectedPersonId = '';
  state.syncing = false;
  if (record.family) {
    state.loading = false;
    try {
      applyLoadedFamily(loadGenealogyFamily(record));
    } catch (error) {
      state.error = error.message || 'Der Stammbaum konnte nicht geladen werden.';
      render();
      return;
    }
    render();
    refreshPublishedFamily(record, token);
    return;
  }
  // Nur in der Cloud veröffentlichte Familien besitzen keine Projektfassung.
  state.loading = true;
  render();
  void loadPublishedGenealogyFamily(record).then(published => {
    if (token !== state.loadToken) return;
    if (published) applyLoadedFamily(published);
    else state.error = 'Für diese Familie ist noch keine lesbare Fassung verfügbar.';
    state.loading = false;
    render();
  });
}

function openImportDialog() {
  ensureDialog();
  state.error = '';
  state.search = '';
  state.showDead = false;
  state.showUnknown = false;
  getDialogRole('search').value = '';
  getDialogRole('show-dead').checked = false;
  getDialogRole('show-unknown').checked = false;
  if (typeof window.activateDialog === 'function') {
    window.activateDialog(DIALOG_ID, { initialFocus: '[data-character-genealogy-role="family-select"]' });
  } else {
    ensureDialog().classList.add('active');
    ensureDialog().setAttribute('aria-hidden', 'false');
  }
  state.families = listGenealogyFamilies();
  const preferred = state.families.find(record => record.id === 'haus-arwydd') || state.families[0];
  if (!preferred) {
    state.error = 'Im Stammbaum-Register sind noch keine Familien vorhanden.';
    render();
    return;
  }
  selectFamily(preferred.id);
  void refreshGenealogyRegistry(state.families).then(merged => {
    if (!merged) return;
    const activeId = state.activeFamily?.id;
    state.families = merged;
    if (activeId && !merged.some(record => record.id === activeId)) {
      state.activeFamily = null;
    }
    renderFamilyOptions();
  });
}

function closeImportDialog() {
  if (typeof window.deactivateDialog === 'function') window.deactivateDialog(DIALOG_ID);
  else {
    ensureDialog().classList.remove('active');
    ensureDialog().setAttribute('aria-hidden', 'true');
  }
}

function currentCandidate() {
  return state.candidates.find(item => item.personId === state.selectedPersonId) || null;
}

function publishSavedCharacter(id, data) {
  document.dispatchEvent(new CustomEvent('aleria:character-saved', {
    detail: { record: { id, ...data }, source: 'genealogy-import' }
  }));
}

async function saveCandidate({ existing = null, forceSeparate = false } = {}) {
  const candidate = currentCandidate();
  if (!candidate) return;
  if (!window._fb?.saveCharacter) throw new Error('Die Firebase-Verbindung für Charaktere ist noch nicht bereit.');

  const currentMatch = matchFor(candidate);
  if (!existing && !forceSeparate && currentMatch?.kind === 'linked') {
    closeImportDialog();
    window.openCharProfile?.(currentMatch.characterId);
    return;
  }

  const data = buildImportedCharacter(candidate, existing);
  const targetId = existing?.id || candidate.worldPersonId;
  const savedId = await window._fb.saveCharacter(targetId, data);
  publishSavedCharacter(savedId, data);
  window.showAppStatus?.(
    existing
      ? `${candidate.displayName} wurde mit dem bestehenden Almanachprofil verknüpft.`
      : `${candidate.displayName} wurde aus dem Stammbaum angelegt.`,
    'success'
  );
  closeImportDialog();
  window.openCharProfile?.(savedId);
}

async function handleAction(trigger) {
  const action = trigger.dataset.characterGenealogyAction;
  if (action === 'open-import') {
    openImportDialog();
    return;
  }
  if (action === 'close') {
    closeImportDialog();
    return;
  }
  if (action === 'select-person') {
    state.selectedPersonId = trigger.dataset.personId || '';
    render();
    return;
  }
  if (action === 'open-linked') {
    closeImportDialog();
    window.openCharProfile?.(trigger.dataset.characterId);
    return;
  }
  if (action === 'link-existing') {
    const existing = getCharacters().find(character => String(character.id || '') === trigger.dataset.characterId);
    if (!existing) throw new Error('Das bestehende Almanachprofil wurde nicht gefunden.');
    await saveCandidate({ existing });
    return;
  }
  if (action === 'create-separate') {
    await saveCandidate({ forceSeparate: true });
    return;
  }
  if (action === 'create-character') await saveCandidate();
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-character-genealogy-action]');
  if (!trigger) return;
  event.preventDefault();
  void handleAction(trigger).catch(error => {
    console.error('Stammbaum-Charakterimport fehlgeschlagen:', error);
    window.showAppStatus?.(error.message || 'Der Charakter konnte nicht übernommen werden.', 'error');
    const status = getDialogRole('status');
    status.textContent = error.message || 'Import fehlgeschlagen.';
  });
});

document.addEventListener('input', event => {
  if (!event.target.matches?.('[data-character-genealogy-role="search"]')) return;
  state.search = event.target.value || '';
  renderPersonList();
  renderStatus();
});

document.addEventListener('change', event => {
  if (event.target.matches?.('[data-character-genealogy-role="family-select"]')) {
    void selectFamily(event.target.value);
    return;
  }
  const isDeadToggle = event.target.matches?.('[data-character-genealogy-role="show-dead"]');
  const isUnknownToggle = event.target.matches?.('[data-character-genealogy-role="show-unknown"]');
  if (!isDeadToggle && !isUnknownToggle) return;
  if (isDeadToggle) state.showDead = event.target.checked;
  if (isUnknownToggle) state.showUnknown = event.target.checked;
  ensureVisibleSelection();
  renderPersonList();
  renderPreview();
  renderStatus();
});
