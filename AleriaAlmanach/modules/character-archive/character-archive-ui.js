import { createCharacterArchiveIndex, queryCharacterArchive } from './character-archive-query.js?v=20260912-v1';
import { renderArchiveShell, renderKindNavigation, renderStats, renderEntryDescription } from './character-archive-view.js?v=20260912-v1';
import { openCombatEntryEditor } from '../combat/ui/combat-entry-editor.js?v=20260912-archive-dialogs-v1';
import { getSpellCatalogEntry, getSpellCatalogPageHref } from '../spell-catalog/spell-catalog.js';
import { getSpellCatalogSchool } from '../spell-catalog/spell-catalog-schools.js';
import { getCharacterArchiveEntryIconPresentation } from './character-archive-icons.js?v=20260905-cenyr-v2';
import { getCharacterArchiveWeaponGroups } from './character-archive-weapon-groups.js?v=20260905-cenyr-character-training-v1';
import { getCharacterArchiveClassGroups, getCharacterArchiveHorseGroups } from './character-archive-classification.js?v=20260909-dragon-parent-v2';
import { countArchiveGroupEntries } from './character-archive-group-tree.js?v=20260905-cenyr-character-training-v1';
import { getCharacterArchiveClassLinks } from './character-archive-class-links.js?v=20260909-dragon-parent-v2';
import { ARCHIVE_PLACEMENT_FIELDS, readArchivePlacement, getArchivePlacementChoices } from './character-archive-placement.js';
import { describeTechniqueDamage } from '../combat/combat-technique-damage.js?v=20260905-party-combat-v1';
import { getCombatFormPresentation } from '../combat-styles/combat-form-presentation.js?v=20260909-dragon-parent-v2';
import { getCharacterArchiveAttackGroups } from './character-archive-attack-groups.js?v=20260909-dragon-parent-v2';
import {
  CHARACTER_ARCHIVE_KINDS,
  cloneArchiveValue,
  createCharacterArchiveProfileItem,
  getCharacterArchiveKind,
  normalizeCharacterArchiveEntry
} from './character-archive-model.js?v=20260905-archive-order-v2';
import {
  archiveCharacterRecord,
  ensureCharacterArchiveLoaded,
  getCharacterArchiveEntries,
  saveCharacterArchiveEntry,
  setCharacterArchiveLiveRecords
} from './character-archive-store.js?v=20260912-register-refresh-v1';

const DEFAULT_RESOURCE_OPTIONS = [
  { id: 'action', name: 'Aktion', scope: 'comment' },
  { id: 'bonus-action', name: 'Bonusaktion', scope: 'comment' },
  { id: 'reaction', name: 'Reaktion', scope: 'comment' },
  { id: 'special-action', name: 'Besondere Aktion', scope: 'persistent' },
  { id: 'mana-focus', name: 'Mana', scope: 'persistent' }
];

const state = {
  open: false,
  loading: false,
  search: '',
  kind: 'all',
  source: 'all',
  sort: 'name',
  picker: null,
  editingId: '',
  iconPickerOpen: false,
  entryIndex: [],
  visibleLimit: 48,
  openRequest: 0,
  savingForms: new WeakSet(),
  editorReturnFocus: null,
  loadError: ''
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeImageSource(value) {
  const raw = String(value || '').trim();
  return typeof globalThis.sanitizeImageSrc === 'function' ? globalThis.sanitizeImageSrc(raw) : raw;
}

function getEntryIcon(entry) {
  const presentation = getCharacterArchiveEntryIconPresentation(entry);
  const fallbackSource = safeImageSource(presentation.fallbackSource || '');
  return {
    source: safeImageSource(presentation.source || fallbackSource),
    fallbackSource
  };
}

function getLiveRecords() {
  const characters = globalThis.AleriaCharacters?.getAll?.() || [];
  const creatures = globalThis.AleriaCreatures?.getAll?.() || [];
  return { characters, creatures };
}

function refreshLiveEntries() {
  const { characters, creatures } = getLiveRecords();
  setCharacterArchiveLiveRecords(characters, creatures);
}

function getVisibleEntries() {
  const entries = queryCharacterArchive(state.entryIndex, state);
  const catalogEntry = getSpellCatalogEntry(state.search);
  return catalogEntry ? entries.filter(entry => entry.data?.catalogReference?.id === catalogEntry.id
    && entry.data.catalogReference.revision === catalogEntry.revision) : entries;
}

function getEntryMeta(entry) {
  const data = entry.data || {};
  if (entry.kind === 'spell') return [Number(data.level) ? `Grad ${data.level}` : 'Zaubertrick', data.school, data.damageType].filter(Boolean);
  if (entry.kind === 'technique') return [getCombatFormPresentation(data)?.label, describeTechniqueDamage(data), data.damageType].filter(Boolean);
  if (entry.kind === 'attack') return [data.weaponType, data.damageFormula?.toUpperCase?.(), data.damageType].filter(Boolean);
  if (entry.kind === 'class') return [data.baseClass ? 'Standardklasse' : (data.cultures || []).join(' · '), data.subtitle].filter(Boolean);
  if (entry.kind === 'condition') return [data.duration, data.source].filter(Boolean);
  if (entry.kind === 'ability') return [data.activationType, data.recovery].filter(Boolean);
  if (entry.kind.startsWith('register-')) return [data.type, data.origin, [data.price, data.currency].filter(Boolean).join(' ')].filter(Boolean);
  return [data.group, data.subtitle, data.appliesWhen].filter(Boolean);
}

function renderSourceBadges(entry) {
  const sources = entry.sources || [];
  const visible = sources.slice(0, 3);
  return `<div class="character-archive-card-sources">${visible.map(source => `<span>${escapeHtml(source.name || source.kind)}</span>`).join('')}${sources.length > visible.length ? `<span>+${sources.length - visible.length}</span>` : ''}</div>`;
}

function renderEntryCard(entry) {
  const kind = getCharacterArchiveKind(entry.kind);
  const image = getEntryIcon(entry);
  const meta = getEntryMeta(entry);
  const pickerButton = state.picker
    ? `<button type="button" class="character-archive-primary" data-character-archive-action="select-entry" data-entry-id="${escapeHtml(entry.id)}">Hinzufügen</button>`
    : ['standard', 'offer', 'owned'].includes(entry.data?.section)
      ? `<button type="button" data-character-archive-action="open-register-item" data-entry-id="${escapeHtml(entry.id)}">Im Güterregister öffnen</button>`
    : `<button type="button" data-character-archive-action="edit-entry" data-entry-id="${escapeHtml(entry.id)}">${entry.data?.catalogReference ? 'Eigene Fassung anlegen' : 'Bearbeiten'}</button>`;
  const rulesButton = !state.picker && kind.editorKind
    ? `<button type="button" data-character-archive-action="edit-entry-rules" data-entry-id="${escapeHtml(entry.id)}">Regeldetails</button>`
    : '';
  return `<article class="character-archive-card" data-entry-kind="${escapeHtml(entry.kind)}">
    <div class="character-archive-card-topline"><span>${escapeHtml(kind.group)}</span><span>${escapeHtml(kind.label)}</span></div>
    <div class="character-archive-card-main">
      ${image.source ? `<span class="character-archive-card-icon" aria-hidden="true"><img src="${escapeHtml(image.source)}" data-fallback-src="${escapeHtml(image.fallbackSource)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><i>${escapeHtml(kind.symbol)}</i></span>` : ''}
      <div><h3>${escapeHtml(entry.archiveDisplayName || entry.name)}</h3>${entry.data?.catalogReference ? `<small>${escapeHtml(entry.data.school || 'Zauberkatalog')} · Fassung ${escapeHtml(entry.data.catalogReference.revision)}</small>` : ''}${renderEntryDescription(entry.description, escapeHtml)}</div>
    </div>
    ${meta.length ? `<div class="character-archive-card-meta">${meta.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}
    ${renderSourceBadges(entry)}
    <div class="character-archive-card-actions">${pickerButton}${rulesButton}${entry.data?.catalogReference ? `<a href="${escapeHtml(getSpellCatalogPageHref(entry.data.catalogReference))}" target="_blank" rel="noopener">Zum Zauberverzeichnis ↗</a>` : ''}${getCharacterArchiveClassLinks(entry).map(link => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`).join('')}</div>
  </article>`;
}

function renderAttackGroupIcon(group) {
  if (group.type !== 'class' || !group.parentEntry) {
    return `<span class="character-archive-attack-group-icon" aria-hidden="true"><i>${escapeHtml(group.symbol)}</i></span>`;
  }
  const image = getEntryIcon(group.parentEntry);
  return `<span class="character-archive-attack-group-icon" aria-hidden="true"><img src="${escapeHtml(image.source)}" data-fallback-src="${escapeHtml(image.fallbackSource)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><i>${escapeHtml(group.symbol)}</i></span>`;
}

function renderAttackGroup(group, depth = 0, parentKey = '') {
  const groupKey = `${parentKey}/${group.id}`;
  const count = countArchiveGroupEntries(group);
  const amountLabel = count === 1 ? 'Eintrag' : 'Einträge';
  const openByDefault = depth === 0 || Boolean(state.search);
  return `<details class="character-archive-attack-group" data-attack-group-type="${escapeHtml(group.type)}" data-archive-group="${escapeHtml(groupKey)}"${openByDefault ? ' open' : ''}>
    <summary>
      ${renderAttackGroupIcon(group)}
      <span class="character-archive-attack-group-title"><small>${escapeHtml(group.typeLabel)}</small><strong>${escapeHtml(group.name)}</strong><em>${escapeHtml(group.description)}</em></span>
      <span class="character-archive-attack-group-count"><strong>${count}</strong><small>${amountLabel}</small></span>
      <i class="character-archive-attack-group-disclosure" aria-hidden="true"></i>
    </summary>
    ${group.parentEntry && ['style', 'form'].includes(group.type) ? `<div class="character-archive-group-actions"><button type="button" data-character-archive-action="edit-entry" data-entry-id="${escapeHtml(group.parentEntry.id)}">${escapeHtml(group.typeLabel)} bearbeiten</button></div>` : ''}
    ${group.entries.length ? `<div class="character-archive-grid">${group.entries.map(renderEntryCard).join('')}</div>` : ''}
    ${group.children.length ? `<div class="character-archive-group-children">${group.children.map(child => renderAttackGroup(child, depth + 1, groupKey)).join('')}</div>` : ''}
    ${!count && !group.children.length ? '<p class="character-archive-group-empty">Noch keine Attacken hinterlegt.</p>' : ''}
  </details>`;
}

function renderVisibleEntries(visible, allEntries) {
  const selectedKind = state.picker?.kind || state.kind;
  // Sheet pickers must retain the exact underlying collection (including natural
  // attacks), regardless of the archive's navigation hierarchy.
  if (state.picker) return `<div class="character-archive-grid">${visible.slice(0, state.visibleLimit).map(renderEntryCard).join('')}</div>`;
  const builders = { technique: getCharacterArchiveAttackGroups, attack: getCharacterArchiveWeaponGroups,
    class: getCharacterArchiveClassGroups, 'register-pferde': getCharacterArchiveHorseGroups };
  if (!builders[selectedKind]) {
    return `<div class="character-archive-grid">${visible.slice(0, state.visibleLimit).map(renderEntryCard).join('')}</div>`;
  }
  const groups = builders[selectedKind](visible, allEntries);
  return `<div class="character-archive-attack-groups">${groups.map(group => renderAttackGroup(group)).join('')}</div>`;
}

function archiveElement(role) {
  return document.querySelector(`#character-archive-overlay [data-archive-role="${role}"]`);
}

function renderArchive(entries = getCharacterArchiveEntries()) {
  if (!state.open) return;
  const overlay = ensureOverlay();
  state.entryIndex = createCharacterArchiveIndex(entries);
  if (!overlay.querySelector('.character-archive-page')) {
    overlay.innerHTML = renderArchiveShell({ picker: state.picker, kindLabel: getCharacterArchiveKind(state.picker?.kind).label }, escapeHtml);
    ['search', 'source', 'sort'].forEach(field => {
      overlay.querySelector(`[data-character-archive-field="${field}"]`).value = state[field];
    });
    const navigation = overlay.querySelector('.character-archive-navigation');
    if (navigation && matchMedia('(max-width: 760px)').matches) navigation.open = false;
  }
  const navigation = archiveElement('navigation');
  if (navigation) navigation.innerHTML = renderKindNavigation(entries, state.kind, escapeHtml);
  const stats = archiveElement('stats');
  if (stats) stats.innerHTML = renderStats(entries);
  renderArchiveResults();
}

function renderArchiveResults({ preserveGroups = true } = {}) {
  const root = archiveElement('results');
  if (!root) return;
  const groups = new Map(preserveGroups ? [...root.querySelectorAll('[data-archive-group]')].map(node => [node.dataset.archiveGroup, node.open]) : []);
  const visible = getVisibleEntries();
  const selectedKind = state.picker?.kind || state.kind;
  archiveElement('category-title').textContent = selectedKind === 'all' ? 'Gesamtarchiv' : getCharacterArchiveKind(selectedKind).label;
  archiveElement('count').textContent = state.loading ? 'Wird geladen …' : `${visible.length} ${visible.length === 1 ? 'Eintrag' : 'Einträge'}`;
  root.setAttribute('aria-busy', String(state.loading));
  const filtered = state.search || state.source !== 'all';
  archiveElement('filter-summary').textContent = filtered ? 'Suche und Quellenfilter sind aktiv.' : 'Vorlagen entdecken und eigene Fassungen anlegen.';
  document.querySelector('#character-archive-overlay [data-character-archive-action="reset-filters"]').hidden = !filtered;
  const empty = state.loadError ? `<strong>Archiv konnte nicht vollständig geladen werden</strong><span>${escapeHtml(state.loadError)}</span><button type="button" data-character-archive-action="retry-load">Erneut laden</button>`
    : state.loading ? '<strong>Archiv wird geladen …</strong><span>Vorlagen und Bögen werden zusammengeführt.</span>'
    : `<strong>Keine passenden Einträge</strong><span>${filtered ? 'Versuche andere Suchbegriffe oder setze die Filter zurück.' : 'In diesem Bereich sind noch keine Vorlagen hinterlegt.'}</span><button type="button" data-character-archive-action="${filtered ? 'reset-filters' : state.picker ? 'create-from-picker' : 'new-entry'}">${filtered ? 'Filter zurücksetzen' : 'Eintrag anlegen'}</button>`;
  root.innerHTML = !state.loading && !state.loadError && visible.length
    ? renderVisibleEntries(visible, state.entryIndex.map(item => item.entry))
    : `<div class="character-archive-empty">${empty}</div>`;
  root.querySelectorAll('[data-archive-group]').forEach(node => {
    if (groups.has(node.dataset.archiveGroup)) node.open = groups.get(node.dataset.archiveGroup);
  });
  const grouped = !state.picker && ['technique', 'attack', 'class', 'register-pferde'].includes(state.kind);
  const pagination = archiveElement('pagination');
  pagination.hidden = state.loading || Boolean(state.loadError) || grouped || visible.length <= state.visibleLimit;
  pagination.innerHTML = pagination.hidden ? '' : `<span>${Math.min(state.visibleLimit, visible.length)} von ${visible.length} Einträgen angezeigt</span><button type="button" data-character-archive-action="load-more">Weitere ${Math.min(48, visible.length - state.visibleLimit)} anzeigen</button>`;
  activateImageFallbacks(root);
}

function activateImageFallbacks(root) {
  root.querySelectorAll('.character-archive-card-icon img, .character-archive-attack-group-icon img').forEach(image => {
    const mark = () => {
      const fallback = String(image.dataset.fallbackSrc || '').trim();
      image.removeAttribute('data-fallback-src');
      if (fallback && image.src !== new URL(fallback, document.baseURI).href) {
        image.src = fallback;
        return;
      }
      image.closest('.character-archive-card-icon, .character-archive-attack-group-icon')?.classList.add('missing');
      image.removeEventListener('error', mark);
    };
    image.addEventListener('error', mark);
    if (image.complete && image.naturalWidth === 0) mark();
  });
}

function ensureOverlay() {
  let overlay = document.getElementById('character-archive-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'character-archive-overlay';
  overlay.className = 'character-archive-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('tabindex', '-1');
  overlay.setAttribute('aria-labelledby', 'character-archive-title');
  document.body.appendChild(overlay);
  return overlay;
}

function findEntry(id) {
  return state.entryIndex.find(item => String(item.entry.id) === String(id))?.entry || null;
}

function emptyDataForKind(kind) {
  const id = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (kind === 'spell') return { id, name: '', icon: '', level: 0, manaCost: 0, slotCost: 0, presentationKind: 'spell', activationType: 'action', resolutionType: 'spell-attack', damageType: 'Magie', range: 'Zauber', description: '', prepared: true };
  if (kind === 'trait') return { id, name: '', type: 'trait', description: '', target: 'Selbst', duration: 'Dauerhaft', active: true, mechanics: {} };
  if (kind === 'ability') return { id, name: '', description: '', activationType: 'action', delivery: 'ability', combatUsable: false, active: true, mechanics: {} };
  if (kind === 'technique') return { id, name: '', category: 'technique', description: '', activationType: 'action', damageFormula: '', damageType: 'physisch', active: true, mechanics: {} };
  if (kind === 'attack') return { id, name: '', weaponType: 'other', damageFormula: '', damageType: 'physisch', attackAttribute: 'strength', proficient: true, range: 'Nahkampf', activationType: 'action', equipped: false };
  if (kind === 'condition') return { id, name: '', duration: '', source: '', description: '', active: true, mechanics: {} };
  if (kind === 'skill') return { id, name: '', attributeKey: 'dexterity', proficiency: 'none', bonus: 0, notes: '' };
  return { id, name: '', description: '' };
}

function ensureEditorOverlay() {
  let overlay = document.getElementById('character-archive-editor-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'character-archive-editor-overlay';
  overlay.className = 'character-archive-editor-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  return overlay;
}

function renderPlacementFields(entry, kind) {
  const visible = ['technique', 'ability', 'combat-style'].includes(kind);
  const entries = getCharacterArchiveEntries();
  const placement = entry?.data?.archivePlacement || {};
  return `<fieldset class="character-archive-placement"${visible ? '' : ' hidden'}><legend>Zuordnung</legend><p>Entweder Klasse, Kampftechnik und Form wählen oder eine eigene Attacke einer Person bzw. Waffe zuordnen. Leere Felder behalten die Zuordnung aus der Quelle bei.</p>${ARCHIVE_PLACEMENT_FIELDS.map(field => {
    const options = getArchivePlacementChoices(field, entries).filter(item => item.id !== entry?.id);
    const value = placement[field.key] || '';
    const control = field.style || field.form
      ? `<select name="placement-${field.key}"><option value="">Aus Quelle übernehmen</option>${options.map(item => `<option value="${escapeHtml(item.data?.id || item.id)}"${value === (item.data?.id || item.id) ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select>`
      : `<input name="placement-${field.key}" value="${escapeHtml(value)}" list="archive-placement-${field.key}" maxlength="160"><datalist id="archive-placement-${field.key}">${options.map(item => `<option value="${escapeHtml(item.name)}"></option>`).join('')}</datalist>`;
    return `<label><span>${escapeHtml(field.label)}</span>${control}</label>`;
  }).join('')}</fieldset>`;
}

function openEntryEditor(entry = null) {
  const overlay = ensureEditorOverlay();
  state.editorReturnFocus = document.activeElement;
  const current = entry ? normalizeCharacterArchiveEntry(entry) : null;
  const selectedKind = current?.kind || (state.kind !== 'all' ? state.kind : 'ability');
  state.editingId = current?.id || '';
  overlay.innerHTML = `<form class="character-archive-editor" data-character-archive-editor-form>
    <header><div><span>Archivvorlage</span><h2 id="character-archive-editor-title">${current ? 'Eintrag bearbeiten' : 'Neuen Eintrag anlegen'}</h2></div><button type="button" data-character-archive-action="close-editor" aria-label="Editor schließen">×</button></header>
    <div class="character-archive-editor-body">
      ${current?.data?.catalogReference ? '<p class="character-archive-editor-hint">Beim Speichern entsteht eine eigene Fassung. Der gemeinsame Katalog und bereits gelernte Charakterzauber behalten ihre Werte.</p>' : ''}
      <label><span>Bereich</span><select name="kind"${current ? ' disabled' : ''}>${CHARACTER_ARCHIVE_KINDS.map(kind => `<option value="${kind.id}"${kind.id === selectedKind ? ' selected' : ''}>${escapeHtml(kind.label)}</option>`).join('')}</select></label>
      <label><span>Name</span><input name="name" value="${escapeHtml(current?.name || '')}" maxlength="160" required></label>
      <label class="wide"><span>Beschreibung / Wirkung</span><textarea name="description" rows="5" maxlength="4000">${escapeHtml(current?.description || '')}</textarea></label>
      <label class="wide"><span>Schlagworte</span><input name="tags" value="${escapeHtml((current?.tags || []).join(', '))}" placeholder="z. B. Feuer, Drachentanz, Cenyr"></label>
      <label class="wide"><span>Icon-Pfad oder Bild-URL</span><div class="character-archive-icon-field"><span class="character-archive-icon-preview">${current?.icon ? `<img src="${escapeHtml(safeImageSource(current.icon))}" alt="">` : ''}</span><input name="icon" value="${escapeHtml(current?.icon || '')}" placeholder="${selectedKind === 'spell' ? 'Leer = kein Icon' : 'Leer = automatische Auswahl'}"><button type="button" data-character-archive-action="pick-icon">Icon wählen</button></div></label>
      ${renderPlacementFields(current, selectedKind)}
      <p class="character-archive-editor-hint">Das Icon kann jederzeit ersetzt werden. Archiv und Charakterbögen verwenden für gleichnamige Kampf- und Regeleinträge dieselbe aktuelle Bildzuordnung.</p>
    </div>
    <footer><span role="status" aria-live="polite" data-character-archive-editor-status></span><div>${current && getCharacterArchiveKind(current.kind).editorKind ? '<button type="button" data-character-archive-action="edit-entry-rules-from-editor">Regeldetails</button>' : ''}<button type="button" data-character-archive-action="close-editor">Abbrechen</button><button type="submit" class="character-archive-primary">Im Archiv speichern</button></div></footer>
  </form>`;
  overlay.setAttribute('aria-labelledby', 'character-archive-editor-title');
  globalThis.activateDialog('character-archive-editor-overlay', { initialFocus: '[name="name"]' });
}

function closeEntryEditor() {
  const overlay = document.getElementById('character-archive-editor-overlay');
  if (!overlay?.classList.contains('active')) return;
  globalThis.deactivateDialog('character-archive-editor-overlay');
  if (!state.editorReturnFocus?.isConnected && state.open) document.querySelector('#character-archive-overlay [data-character-archive-field="search"]')?.focus();
  state.editingId = '';
  state.iconPickerOpen = false;
  document.getElementById('icon-directory-overlay')?.style.removeProperty('z-index');
}

async function saveEditorForm(form) {
  if (state.savingForms.has(form)) return;
  const current = state.editingId ? findEntry(state.editingId) : null;
  const formData = new FormData(form);
  const kind = current?.kind || String(formData.get('kind') || 'ability');
  const name = String(formData.get('name') || '').trim();
  if (!name) return;
  const description = String(formData.get('description') || '').trim();
  const icon = String(formData.get('icon') || '').trim();
  const tags = String(formData.get('tags') || '').split(',').map(item => item.trim()).filter(Boolean);
  const data = { ...(current?.data || emptyDataForKind(kind)), name, description };
  if (icon) data.icon = icon;
  else delete data.icon;
  const status = form.querySelector('[data-character-archive-editor-status]');
  try {
    if (form.querySelector('.character-archive-placement:not([hidden])')) data.archivePlacement = readArchivePlacement(formData, getCharacterArchiveEntries(), current || { kind });
  } catch (error) {
    if (status) status.textContent = error.message;
    return;
  }
  state.savingForms.add(form);
  form.querySelector('[type="submit"]').disabled = true;
  if (status) status.textContent = 'Wird gespeichert …';
  try {
    await saveCharacterArchiveEntry({ ...(current || {}), kind, name, description, iconOverride: icon, icon, tags, data });
    if (form.isConnected) closeEntryEditor();
    renderArchive();
  } catch {
    if (status) status.textContent = 'Lokal gespeichert; Online-Abgleich derzeit nicht möglich.';
    renderArchive();
  } finally {
    state.savingForms.delete(form);
    if (form.isConnected) form.querySelector('[type="submit"]').disabled = false;
  }
}

function editEntryRules(entry) {
  const kind = getCharacterArchiveKind(entry.kind);
  if (!kind.editorKind) return;
  openCombatEntryEditor({
    kind: kind.editorKind,
    theme: 'parchment',
    item: cloneArchiveValue(entry.data, {}),
    resources: DEFAULT_RESOURCE_OPTIONS,
    weapons: entry.kind === 'technique' ? getCharacterArchiveEntries().filter(item => item.kind === 'attack').slice(0, 40).map(item => item.data) : [],
    onSave: async data => {
      try {
        await saveCharacterArchiveEntry({ ...entry, name: data.name, description: data.description || data.effect || entry.description, icon: entry.icon, data });
      } catch { /* local copy was already updated */ }
      renderArchive();
    }
  });
}

async function openArchive(options = {}) {
  const request = ++state.openRequest;
  state.open = true;
  state.picker = options.picker || null;
  state.kind = state.picker?.kind || options.kind || 'all';
  state.source = 'all';
  state.search = options.search || '';
  state.visibleLimit = 48;
  state.loadError = '';
  state.loading = true;
  refreshLiveEntries();
  const overlay = ensureOverlay();
  overlay.replaceChildren();
  document.body.classList.add('character-archive-open');
  renderArchive();
  globalThis.activateDialog('character-archive-overlay', { initialFocus: '[data-character-archive-field="search"]' });
  try {
    await ensureCharacterArchiveLoaded();
  } catch {
    if (request === state.openRequest) state.loadError = 'Bitte versuche es erneut. Deine gespeicherten Einträge bleiben erhalten.';
  } finally {
    // A late request must never steal focus or overwrite a newer picker.
    if (!state.open || request !== state.openRequest) return;
    refreshLiveEntries();
    state.loading = false;
    renderArchive();
  }
}

function closeArchive() {
  closeEntryEditor();
  ++state.openRequest;
  state.open = false;
  state.picker = null;
  globalThis.deactivateDialog('character-archive-overlay');
  document.body.classList.remove('character-archive-open');
}

function openPicker({ kind, onSelect, onCreate } = {}) {
  if (!CHARACTER_ARCHIVE_KINDS.some(item => item.id === kind)) return;
  return openArchive({ picker: { kind, onSelect, onCreate } });
}

function handleClick(event) {
  const trigger = event.target?.closest?.('[data-character-archive-action]');
  if (!trigger) return;
  const action = trigger.dataset.characterArchiveAction;
  if (action === 'open') { event.preventDefault(); openArchive(); }
  else if (action === 'close') closeArchive();
  else if (action === 'set-kind') {
    state.kind = trigger.dataset.kind || 'all';
    state.visibleLimit = 48;
    ensureOverlay().querySelectorAll('[data-character-archive-action="set-kind"]').forEach(button => {
      button.classList.toggle('active', button.dataset.kind === state.kind);
      button.setAttribute('aria-pressed', String(button.dataset.kind === state.kind));
    });
    renderArchiveResults({ preserveGroups: false });
    archiveElement('category-title')?.focus({ preventScroll: true });
    if (matchMedia('(max-width: 760px)').matches) {
      document.querySelector('.character-archive-navigation').open = false;
      archiveElement('category-title')?.scrollIntoView({ block: 'start' });
    }
  }
  else if (action === 'load-more') {
    state.visibleLimit += 48;
    renderArchiveResults();
    archiveElement('results')?.querySelectorAll('.character-archive-card')[state.visibleLimit - 48]?.querySelector('button')?.focus({ preventScroll: true });
  }
  else if (action === 'reset-filters') {
    state.search = ''; state.source = 'all'; state.visibleLimit = 48;
    const search = ensureOverlay().querySelector('[data-character-archive-field="search"]');
    search.value = '';
    ensureOverlay().querySelector('[data-character-archive-field="source"]').value = 'all';
    renderArchiveResults({ preserveGroups: false });
    search.focus({ preventScroll: true });
  }
  else if (action === 'retry-load') openArchive({ kind: state.kind, picker: state.picker, search: state.search });
  else if (action === 'new-entry') openEntryEditor();
  else if (action === 'edit-entry') openEntryEditor(findEntry(trigger.dataset.entryId));
  else if (action === 'open-register-item') {
    const entry = findEntry(trigger.dataset.entryId);
    if (entry) globalThis.itemDbEnsureGlobalSync?.().then(() => globalThis.AleriaItemRegister?.open(entry.data.id))
      .catch(error => globalThis.showAppStatus?.(error.message, 'error'));
  }
  else if (action === 'close-editor') closeEntryEditor();
  else if (action === 'edit-entry-rules') { const entry = findEntry(trigger.dataset.entryId); if (entry) editEntryRules(entry); }
  else if (action === 'edit-entry-rules-from-editor') { const entry = findEntry(state.editingId); if (entry) editEntryRules(entry); }
  else if (action === 'select-entry') {
    const entry = findEntry(trigger.dataset.entryId);
    const callback = state.picker?.onSelect;
    closeArchive();
    if (entry) callback?.(cloneArchiveValue(entry));
  } else if (action === 'create-from-picker') {
    const callback = state.picker?.onCreate;
    closeArchive();
    callback?.();
  } else if (action === 'pick-icon') {
    state.iconPickerOpen = true;
    if (typeof globalThis.openIconDirectory === 'function') {
      globalThis.openIconDirectory();
      document.getElementById('icon-directory-overlay')?.style.setProperty('z-index', '9800');
    }
  }
}

function handleInput(event) {
  if (!event.target?.closest?.('#character-archive-overlay')) return;
  if (event.target.dataset.characterArchiveField === 'search') {
    state.search = event.target.value || '';
    state.visibleLimit = 48;
    renderArchiveResults({ preserveGroups: false });
  }
}

function handleChange(event) {
  const editor = event.target?.closest?.('[data-character-archive-editor-form]');
  if (editor && event.target.name === 'kind') {
    const kind = event.target.value;
    editor.querySelector('[name="icon"]').placeholder = kind === 'spell' ? 'Leer = kein Icon' : 'Leer = automatische Auswahl';
    editor.querySelector('.character-archive-placement').hidden = !['technique', 'ability', 'combat-style'].includes(kind);
    return;
  }
  if (!event.target?.closest?.('#character-archive-overlay')) return;
  const field = event.target.dataset.characterArchiveField;
  if (field === 'source') state.source = event.target.value || 'all';
  if (field === 'sort') state.sort = event.target.value || 'name';
  if (field) { state.visibleLimit = 48; renderArchiveResults({ preserveGroups: false }); }
}

function handleIconSelected(event) {
  if (!state.iconPickerOpen) return;
  const editor = document.getElementById('character-archive-editor-overlay');
  if (!editor?.classList.contains('active')) return;
  const input = editor.querySelector('[name="icon"]');
  const src = String(event.detail?.src || '').trim();
  if (!input || !src) return;
  input.value = src;
  const preview = editor.querySelector('.character-archive-icon-preview');
  if (preview) preview.innerHTML = `<img src="${escapeHtml(safeImageSource(src))}" alt="">`;
  state.iconPickerOpen = false;
  if (typeof globalThis.closeIconDirectory === 'function') globalThis.closeIconDirectory();
  document.getElementById('icon-directory-overlay')?.style.removeProperty('z-index');
}

function handleRecordsChanged() {
  refreshLiveEntries();
}

document.addEventListener('click', handleClick);
document.addEventListener('input', handleInput);
document.addEventListener('change', handleChange);
document.addEventListener('submit', event => {
  const form = event.target?.closest?.('[data-character-archive-editor-form]');
  if (!form) return;
  event.preventDefault();
  saveEditorForm(form);
});
document.addEventListener('almanach-icon-selected', handleIconSelected);
document.addEventListener('aleria:characters-changed', handleRecordsChanged);
document.addEventListener('aleria:creatures-changed', handleRecordsChanged);
document.addEventListener('aleria:character-archive-changed', event => {
  if (state.open && !state.loading) renderArchive(event.detail?.entries);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !state.open) return;
  const top = globalThis.getTopActiveDialog?.();
  if (!['character-archive-overlay', 'character-archive-editor-overlay'].includes(top?.id)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (top.id === 'character-archive-editor-overlay') closeEntryEditor();
  else closeArchive();
}, true);


globalThis.AleriaCharacterArchive = Object.freeze({
  open: openArchive,
  openPicker,
  getEntries: () => getCharacterArchiveEntries(),
  createProfileItem: createCharacterArchiveProfileItem,
  archiveRecord: archiveCharacterRecord,
  refresh: handleRecordsChanged
});

queueMicrotask(() => {
  refreshLiveEntries();
  ensureCharacterArchiveLoaded()
    .then(() => refreshLiveEntries())
    .catch(error => console.info('Charakterbogen-Archiv wird beim ersten Öffnen erneut geladen.', error));
});

const requestedCatalogSpell = new URLSearchParams(globalThis.location?.search || '').get('zauberkatalog');
if (requestedCatalogSpell === 'elementarismus' || getSpellCatalogSchool(requestedCatalogSpell) || getSpellCatalogEntry(requestedCatalogSpell)) {
  const openRequestedCatalog = () => openArchive({ kind: 'spell', search: requestedCatalogSpell === 'elementarismus' ? 'elemente' : requestedCatalogSpell });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openRequestedCatalog, { once: true });
  else queueMicrotask(openRequestedCatalog);
}
