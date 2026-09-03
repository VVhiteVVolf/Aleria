import { createFamilyCandidates, buildImportedCharacter } from './genealogy-mapping.js?v=20260903-character-register-v2';
import {
  listGenealogyFamilies,
  loadGenealogyFamily,
  loadPublishedGenealogyFamily,
  refreshGenealogyRegistry
} from './genealogy-source-repository.js?v=20260903-genealogy-portrait-sync-v1';
import {
  createCharacterMatchResolver,
  findBestCharacterMatch,
  normalizeCharacterGenealogy,
  normalizeCharacterIdentity
} from './person-identity.js?v=20260903-genealogy-import-hangfix-v1';
import { getDefaultCharacterFamilyMemberships } from './family-membership-index.js?v=20260903-character-register-v2';
import {
  deduplicateGenealogyCandidates,
  filterGenealogyCandidates,
  getGenealogyCandidateKey
} from './genealogy-import-catalog.js?v=20260903-character-register-v2';

const DIALOG_ID = 'genealogy-import-overlay';
const RESULT_PAGE_SIZE = 80;
const state = {
  families: [],
  activeFamily: null,
  candidatesByFamily: new Map(),
  characterSnapshot: [],
  matchResolver: null,
  matchCache: new Map(),
  candidates: [],
  selectedCandidateKey: '',
  selectedCandidateKeys: new Set(),
  search: '',
  matchFilter: 'available',
  showDead: false,
  showUnknown: false,
  resultLimit: RESULT_PAGE_SIZE,
  loading: false,
  syncing: false,
  batchSaving: false,
  publishedFamilyLoads: new Map(),
  pendingPublishedFamilyIds: new Set(),
  error: '',
  loadToken: 0
};

window.AleriaCharacterGenealogy = Object.freeze({
  normalizeCharacterGenealogy,
  normalizeCharacterIdentity,
  findBestCharacterMatch,
  getFamilyMemberships: getDefaultCharacterFamilyMemberships
});

document.dispatchEvent(new CustomEvent('aleria:character-genealogy-ready'));

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
          <h2 id="genealogy-import-title">Charaktere aus Stammbäumen anlegen</h2>
        </div>
        <button type="button" class="genealogy-import-close" data-character-genealogy-action="close" aria-label="Dialog schließen">✕</button>
      </header>
      <div class="genealogy-import-toolbar">
        <label>
          <span>Stammbaum</span>
          <select data-character-genealogy-role="family-select"></select>
        </label>
        <label>
          <span>Person suchen</span>
          <input type="search" data-character-genealogy-role="search" placeholder="Name, Haus, Region oder Lebensdaten">
        </label>
        <label>
          <span>Verknüpfung</span>
          <select data-character-genealogy-role="match-filter">
            <option value="available">Nur noch nicht angelegte</option>
            <option value="review">Nur zu prüfende Treffer</option>
            <option value="linked">Nur bereits verknüpfte</option>
            <option value="all">Alle Personen</option>
          </select>
        </label>
        <div class="genealogy-import-filters" role="group" aria-label="Lebensstatus filtern">
          <span>Lebensstatus</span>
          <div class="genealogy-import-filter-toggles">
            <label class="genealogy-import-filter-toggle">
              <input type="checkbox" data-character-genealogy-role="show-dead">
              <span>Tote</span>
            </label>
            <label class="genealogy-import-filter-toggle">
              <input type="checkbox" data-character-genealogy-role="show-unknown">
              <span>Unbekannt</span>
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

function matchFor(candidate) {
  const key = getGenealogyCandidateKey(candidate);
  if (state.matchCache.has(key)) return state.matchCache.get(key);
  const match = state.matchResolver
    ? state.matchResolver(candidate)
    : findBestCharacterMatch(candidate, state.characterSnapshot);
  state.matchCache.set(key, match);
  return match;
}

function rebuildCharacterMatchResolver() {
  state.matchCache.clear();
  state.matchResolver = createCharacterMatchResolver(state.characterSnapshot);
}

function yieldToMainThread() {
  return new Promise(resolve => window.setTimeout(resolve, 0));
}

function waitForDialogPaint() {
  if (typeof window.requestAnimationFrame !== 'function') return yieldToMainThread();
  return new Promise(resolve => {
    window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
  });
}

function getVisibleCandidates() {
  return filterGenealogyCandidates(state.candidates, state, matchFor);
}

function getRenderedCandidates() {
  return getVisibleCandidates().slice(0, state.resultLimit);
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
  const allOption = `<option value=""${state.activeFamily ? '' : ' selected'}>Alle Stammbäume (${state.families.length})</option>`;
  select.innerHTML = allOption + state.families.map(record => {
    const path = [...(record.folderPath || []), record.title || record.id].join(' > ');
    return `<option value="${escapeMarkup(record.id)}"${record.id === state.activeFamily?.id ? ' selected' : ''}>${escapeMarkup(path)}</option>`;
  }).join('');
  select.disabled = state.loading || state.batchSaving || state.families.length === 0;
}

function pruneCandidateSelection() {
  const selectableKeys = new Set(state.candidates
    .filter(candidate => !matchFor(candidate))
    .map(getGenealogyCandidateKey));
  state.selectedCandidateKeys = new Set(
    Array.from(state.selectedCandidateKeys).filter(key => selectableKeys.has(key))
  );
}

function renderBatchToolbar(candidates) {
  const selectable = candidates.filter(candidate => !matchFor(candidate));
  const selectedCount = state.selectedCandidateKeys.size;
  return `
    <div class="genealogy-import-batch-toolbar">
      <div>
        <strong>${selectedCount} ausgewählt</strong>
        <span>Nur eindeutige, noch nicht angelegte Personen können gesammelt übernommen werden.</span>
      </div>
      <div class="genealogy-import-batch-actions">
        <button type="button" data-character-genealogy-action="select-visible"${selectable.length && !state.batchSaving ? '' : ' disabled'}>Sichtbare neue wählen</button>
        <button type="button" data-character-genealogy-action="clear-selection"${selectedCount && !state.batchSaving ? '' : ' disabled'}>Auswahl leeren</button>
        <button type="button" class="genealogy-import-primary" data-character-genealogy-action="import-selected"${selectedCount && !state.batchSaving ? '' : ' disabled'}>${state.batchSaving ? 'Übernahme läuft…' : `${selectedCount} gesammelt anlegen`}</button>
      </div>
    </div>`;
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
  pruneCandidateSelection();
  const visible = getVisibleCandidates();
  const candidates = visible.slice(0, state.resultLimit);
  const rows = candidates.map(candidate => {
    const key = getGenealogyCandidateKey(candidate);
    const match = matchFor(candidate);
    const label = matchLabel(match);
    const portrait = safePortraitSource(candidate.portrait);
    const initial = escapeMarkup(candidate.displayName.slice(0, 1) || '?');
    const selectable = !match;
    const selected = state.selectedCandidateKeys.has(key);
    const familyNote = state.activeFamily
      ? ''
      : `<small class="genealogy-person-family">${escapeMarkup((candidate.membershipTitles || [candidate.familyTitle]).join(' · '))}</small>`;
    return `
      <div class="genealogy-person-row${key === state.selectedCandidateKey ? ' active' : ''}">
        ${selectable ? `
          <label class="genealogy-person-select-check" title="Für Sammelübernahme auswählen">
            <input type="checkbox" data-character-genealogy-role="bulk-person" data-candidate-key="${escapeMarkup(key)}"${selected ? ' checked' : ''}${state.batchSaving ? ' disabled' : ''}>
            <span></span>
          </label>` : '<span class="genealogy-person-select-spacer"></span>'}
        <button type="button" class="genealogy-person-select" data-character-genealogy-action="select-person" data-candidate-key="${escapeMarkup(key)}">
          <span class="genealogy-person-portrait">${portrait
            ? `<img src="${escapeMarkup(portrait)}" alt="" loading="lazy" decoding="async">`
            : `<span>${initial}</span>`}</span>
          <span class="genealogy-person-main">
            <strong>${escapeMarkup(candidate.displayName)}</strong>
            <small>${escapeMarkup(candidate.houseName || candidate.title || 'Ohne Hausangabe')} · ${escapeMarkup(formatLife(candidate))}</small>
            ${familyNote}
          </span>
          <span class="genealogy-match-badge ${label.className}">${escapeMarkup(label.text)}</span>
        </button>
      </div>`;
  }).join('');
  const more = visible.length > candidates.length
    ? `<button type="button" class="genealogy-import-more" data-character-genealogy-action="show-more">Weitere ${Math.min(RESULT_PAGE_SIZE, visible.length - candidates.length)} anzeigen</button>`
    : '';
  list.innerHTML = renderBatchToolbar(candidates) + (rows || '<div class="genealogy-import-empty">Keine passende Person gefunden.</div>') + more;
}

function relationshipLine(label, people) {
  if (!people?.length) return '';
  return `<div><strong>${escapeMarkup(label)}:</strong> ${people.map(person => escapeMarkup(person.name)).join(', ')}</div>`;
}

function characterHasCandidateSource(character, candidate) {
  return (character?.genealogy?.sources || []).some(source => (
    source?.familyId === candidate.familyId && source?.personId === candidate.personId
  ));
}

function actionMarkup(candidate, match) {
  if (match?.kind === 'linked') {
    const syncLabel = characterHasCandidateSource(match.character, candidate)
      ? 'Stammbaumdaten aktualisieren'
      : 'Diese Stammbaumakte ergänzen';
    return `
      <button type="button" class="genealogy-import-primary" data-character-genealogy-action="open-linked" data-character-id="${escapeMarkup(match.characterId)}">Almanachprofil öffnen</button>
      <button type="button" class="genealogy-import-secondary" data-character-genealogy-action="attach-source" data-character-id="${escapeMarkup(match.characterId)}">${syncLabel}</button>`;
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

function currentCandidate() {
  return state.candidates.find(candidate => getGenealogyCandidateKey(candidate) === state.selectedCandidateKey) || null;
}

function renderPreview() {
  const preview = getDialogRole('preview');
  const candidate = currentCandidate();
  if (!candidate) {
    preview.innerHTML = '<div class="genealogy-import-empty">Wähle links eine Person aus.</div>';
    return;
  }
  const match = matchFor(candidate);
  const label = matchLabel(match);
  const portrait = safePortraitSource(candidate.portrait);
  const memberships = candidate.membershipTitles?.length > 1
    ? `<div><dt>Stammbäume</dt><dd>${escapeMarkup(candidate.membershipTitles.join(' · '))}</dd></div>`
    : '';
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
      ${memberships}
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
  const visibleCount = getVisibleCandidates().length;
  const shownCount = Math.min(visibleCount, state.resultLimit);
  const scope = state.activeFamily ? state.activeFamily.title : `${state.families.length} Stammbäume`;
  const parts = [`${shownCount} von ${visibleCount} Treffern`, scope];
  if (state.syncing) parts.push('veröffentlichte Fassung wird abgeglichen…');
  if (state.batchSaving) parts.push('Sammelübernahme läuft…');
  status.textContent = parts.join(' · ');
}

function render() {
  renderFamilyOptions();
  renderPersonList();
  renderPreview();
  renderStatus();
}

function ensureVisibleSelection() {
  const visible = getVisibleCandidates();
  if (!visible.some(candidate => getGenealogyCandidateKey(candidate) === state.selectedCandidateKey)) {
    state.selectedCandidateKey = visible[0] ? getGenealogyCandidateKey(visible[0]) : '';
  }
}

function rebuildCandidates() {
  if (state.activeFamily) {
    state.candidates = state.candidatesByFamily.get(state.activeFamily.id) || [];
  } else {
    state.candidates = deduplicateGenealogyCandidates(
      Array.from(state.candidatesByFamily.values()).flat()
    );
  }
  ensureVisibleSelection();
}

function applyLoadedFamily(loaded) {
  const familyId = loaded?.id || loaded?.family?.document?.id;
  if (!familyId) return;
  state.candidatesByFamily.set(familyId, createFamilyCandidates(loaded));
  rebuildCandidates();
}

function loadPublishedFamilyOnce(record) {
  const familyId = String(record?.id || '').trim();
  if (!familyId) return Promise.resolve(null);
  if (state.publishedFamilyLoads.has(familyId)) return state.publishedFamilyLoads.get(familyId);

  state.pendingPublishedFamilyIds.add(familyId);
  state.syncing = true;
  renderStatus();
  const request = loadPublishedGenealogyFamily(record)
    .finally(() => {
      state.pendingPublishedFamilyIds.delete(familyId);
      state.syncing = state.pendingPublishedFamilyIds.size > 0;
      renderStatus();
    });
  state.publishedFamilyLoads.set(familyId, request);
  return request;
}

async function loadAndApplyPublishedFamily(record, token = state.loadToken) {
  const published = await loadPublishedFamilyOnce(record);
  if (token === state.loadToken && published) applyLoadedFamily(published);
  return published;
}

function refreshPublishedFamily(record, token) {
  void loadAndApplyPublishedFamily(record, token).finally(() => {
    if (token === state.loadToken) render();
  });
}

function findCurrentVersionOfCandidate(candidate) {
  const familyCandidates = state.candidatesByFamily.get(candidate?.familyId) || [];
  return familyCandidates.find(item => (
    item.personId === candidate.personId
    || (candidate.worldPersonId && item.worldPersonId === candidate.worldPersonId)
  )) || candidate;
}

async function resolvePublishedCandidate(candidate) {
  if (!candidate) return null;
  const record = state.families.find(item => item.id === candidate.familyId);
  if (!record) return candidate;
  await loadAndApplyPublishedFamily(record);
  return findCurrentVersionOfCandidate(candidate);
}

function refreshSelectedCandidateFamily() {
  const candidate = currentCandidate();
  if (!candidate || candidate.source === 'firebase' || candidate.source === 'github') return;
  const token = state.loadToken;
  const record = state.families.find(item => item.id === candidate.familyId);
  if (!record) return;
  void loadAndApplyPublishedFamily(record, token).finally(() => {
    if (token === state.loadToken) render();
  });
}

function selectFamily(familyId) {
  const token = ++state.loadToken;
  state.error = '';
  state.selectedCandidateKeys = new Set();
  state.selectedCandidateKey = '';
  state.resultLimit = RESULT_PAGE_SIZE;
  state.syncing = state.pendingPublishedFamilyIds.size > 0;

  if (!familyId) {
    state.activeFamily = null;
    state.loading = false;
    rebuildCandidates();
    render();
    return;
  }

  const record = state.families.find(item => item.id === familyId);
  if (!record) return;
  state.activeFamily = record;
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

  state.loading = true;
  rebuildCandidates();
  render();
  void loadPublishedGenealogyFamily(record).then(published => {
    if (token !== state.loadToken) return;
    if (published) applyLoadedFamily(published);
    else state.error = 'Für diese Familie ist noch keine lesbare Fassung verfügbar.';
    state.loading = false;
    render();
  });
}

async function initializeProjectCandidates() {
  state.candidatesByFamily = new Map();
  for (let index = 0; index < state.families.length; index += 1) {
    const record = state.families[index];
    if (!record.family) continue;
    try {
      state.candidatesByFamily.set(record.id, createFamilyCandidates(loadGenealogyFamily(record)));
    } catch (error) {
      console.info(`Stammbaum ${record.id} konnte nicht für die Gesamtsuche vorbereitet werden.`, error);
    }
    if (index > 0 && index % 32 === 0) await yieldToMainThread();
  }
}

async function openImportDialog() {
  ensureDialog();
  state.characterSnapshot = [];
  state.matchResolver = null;
  state.matchCache.clear();
  state.error = '';
  state.search = '';
  state.matchFilter = 'available';
  state.showDead = false;
  state.showUnknown = false;
  state.resultLimit = RESULT_PAGE_SIZE;
  state.selectedCandidateKey = '';
  state.selectedCandidateKeys = new Set();
  state.batchSaving = false;
  getDialogRole('search').value = '';
  getDialogRole('match-filter').value = 'available';
  getDialogRole('show-dead').checked = false;
  getDialogRole('show-unknown').checked = false;
  if (typeof window.activateDialog === 'function') {
    window.activateDialog(DIALOG_ID, { initialFocus: '[data-character-genealogy-role="search"]' });
  } else {
    ensureDialog().classList.add('active');
    ensureDialog().setAttribute('aria-hidden', 'false');
  }
  state.families = listGenealogyFamilies();
  if (!state.families.length) {
    state.error = 'Im Stammbaum-Register sind noch keine Familien vorhanden.';
    render();
    return;
  }
  state.loading = true;
  render();
  await waitForDialogPaint();
  state.characterSnapshot = getCharacters();
  rebuildCharacterMatchResolver();
  await initializeProjectCandidates();
  state.loading = false;
  selectFamily('');
  refreshSelectedCandidateFamily();
  void refreshGenealogyRegistry(state.families).then(merged => {
    if (!merged) return;
    state.families = merged;
    merged.forEach(record => {
      if (!record.family || state.candidatesByFamily.has(record.id)) return;
      state.candidatesByFamily.set(record.id, createFamilyCandidates(record));
    });
    renderFamilyOptions();
  });
}

function closeImportDialog() {
  if (state.batchSaving) return;
  if (typeof window.deactivateDialog === 'function') window.deactivateDialog(DIALOG_ID);
  else {
    ensureDialog().classList.remove('active');
    ensureDialog().setAttribute('aria-hidden', 'true');
  }
}

function publishSavedCharacter(id, data) {
  const savedId = String(id || '');
  const previousRecord = state.characterSnapshot.find(
    character => String(character?.id || '') === savedId
  );
  const savedRecord = { ...(previousRecord || {}), id, ...data };
  state.characterSnapshot = state.characterSnapshot
    .filter(character => String(character?.id || '') !== savedId);
  state.characterSnapshot.push(savedRecord);
  rebuildCharacterMatchResolver();
  document.dispatchEvent(new CustomEvent('aleria:character-saved', {
    detail: { record: { id, ...data }, source: 'genealogy-import' }
  }));
}

async function persistCandidate(candidate, { existing = null, forceSeparate = false } = {}) {
  if (!candidate) return null;
  if (!window._fb?.saveCharacter) throw new Error('Die Firebase-Verbindung für Charaktere ist noch nicht bereit.');

  const publishedCandidate = await resolvePublishedCandidate(candidate);
  const currentMatch = matchFor(publishedCandidate);
  if (!existing && !forceSeparate && currentMatch) return null;
  const importedData = buildImportedCharacter(publishedCandidate, existing);
  const data = existing
    ? window.AleriaCharacterSaveGuard.selectCharacterGenealogyWrite(importedData, existing)
    : importedData;
  const targetId = existing?.id || publishedCandidate.worldPersonId;
  const savedId = await window._fb.saveCharacter(targetId, data, {
    createWithId: !existing
  });
  publishSavedCharacter(savedId, data);
  return savedId;
}

async function saveCurrentCandidate({ existing = null, forceSeparate = false } = {}) {
  const candidate = currentCandidate();
  if (!candidate) return;
  const savedId = await persistCandidate(candidate, { existing, forceSeparate });
  if (!savedId) return;
  window.showAppStatus?.(
    existing
      ? `${candidate.displayName} wurde mit dem bestehenden Almanachprofil verknüpft.`
      : `${candidate.displayName} wurde aus dem Stammbaum angelegt.`,
    'success'
  );
  closeImportDialog();
  window.openCharProfile?.(savedId);
}

async function importSelectedCandidates() {
  const selected = state.candidates.filter(candidate => (
    state.selectedCandidateKeys.has(getGenealogyCandidateKey(candidate)) && !matchFor(candidate)
  ));
  if (!selected.length) return;
  state.batchSaving = true;
  render();
  let savedCount = 0;
  try {
    for (const candidate of selected) {
      const savedId = await persistCandidate(candidate);
      if (!savedId) continue;
      savedCount += 1;
      state.selectedCandidateKeys.delete(getGenealogyCandidateKey(candidate));
    }
    state.batchSaving = false;
    rebuildCandidates();
    render();
    window.showAppStatus?.(`${savedCount} Charaktere wurden aus den Stammbäumen angelegt.`, 'success');
  } catch (error) {
    state.batchSaving = false;
    rebuildCandidates();
    render();
    throw new Error(`Sammelübernahme nach ${savedCount} von ${selected.length} Figuren abgebrochen. ${error.message || ''}`.trim());
  }
}

async function handleAction(trigger) {
  const action = trigger.dataset.characterGenealogyAction;
  if (action === 'open-import') {
    await openImportDialog();
    return;
  }
  if (action === 'close') {
    closeImportDialog();
    return;
  }
  if (action === 'select-person') {
    state.selectedCandidateKey = trigger.dataset.candidateKey || '';
    render();
    refreshSelectedCandidateFamily();
    return;
  }
  if (action === 'select-visible') {
    getRenderedCandidates().filter(candidate => !matchFor(candidate))
      .forEach(candidate => state.selectedCandidateKeys.add(getGenealogyCandidateKey(candidate)));
    render();
    return;
  }
  if (action === 'clear-selection') {
    state.selectedCandidateKeys = new Set();
    render();
    return;
  }
  if (action === 'show-more') {
    state.resultLimit += RESULT_PAGE_SIZE;
    renderPersonList();
    renderStatus();
    return;
  }
  if (action === 'import-selected') {
    await importSelectedCandidates();
    return;
  }
  if (action === 'open-linked') {
    closeImportDialog();
    window.openCharProfile?.(trigger.dataset.characterId);
    return;
  }
  if (action === 'link-existing' || action === 'attach-source') {
    const existing = getCharacters().find(character => String(character.id || '') === trigger.dataset.characterId);
    if (!existing) throw new Error('Das bestehende Almanachprofil wurde nicht gefunden.');
    await saveCurrentCandidate({ existing });
    return;
  }
  if (action === 'create-separate') {
    await saveCurrentCandidate({ forceSeparate: true });
    return;
  }
  if (action === 'create-character') await saveCurrentCandidate();
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
  state.resultLimit = RESULT_PAGE_SIZE;
  ensureVisibleSelection();
  renderPersonList();
  renderPreview();
  renderStatus();
  refreshSelectedCandidateFamily();
});

document.addEventListener('change', event => {
  if (event.target.matches?.('[data-character-genealogy-role="family-select"]')) {
    selectFamily(event.target.value);
    return;
  }
  if (event.target.matches?.('[data-character-genealogy-role="match-filter"]')) {
    state.matchFilter = event.target.value || 'available';
    state.resultLimit = RESULT_PAGE_SIZE;
    ensureVisibleSelection();
    render();
    return;
  }
  if (event.target.matches?.('[data-character-genealogy-role="bulk-person"]')) {
    const key = event.target.dataset.candidateKey || '';
    if (event.target.checked) state.selectedCandidateKeys.add(key);
    else state.selectedCandidateKeys.delete(key);
    renderPersonList();
    renderStatus();
    return;
  }
  const isDeadToggle = event.target.matches?.('[data-character-genealogy-role="show-dead"]');
  const isUnknownToggle = event.target.matches?.('[data-character-genealogy-role="show-unknown"]');
  if (!isDeadToggle && !isUnknownToggle) return;
  if (isDeadToggle) state.showDead = event.target.checked;
  if (isUnknownToggle) state.showUnknown = event.target.checked;
  state.resultLimit = RESULT_PAGE_SIZE;
  ensureVisibleSelection();
  render();
});
