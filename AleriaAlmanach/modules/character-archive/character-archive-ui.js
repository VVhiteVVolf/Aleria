import { openCombatEntryEditor } from '../combat/ui/combat-entry-editor.js?v=20260906-character-vitality-v1';
import { getCharacterArchiveEntryIconPresentation } from './character-archive-icons.js?v=20260905-cenyr-v2';
import { getCharacterArchiveWeaponGroups } from './character-archive-weapon-groups.js?v=20260905-cenyr-character-training-v1';
import { getCharacterArchiveClassGroups, getCharacterArchiveHorseGroups } from './character-archive-classification.js?v=20260905-cenyr-character-training-v1';
import { countArchiveGroupEntries } from './character-archive-group-tree.js?v=20260905-cenyr-character-training-v1';
import { getCharacterArchiveClassLinks } from './character-archive-class-links.js?v=20260905-cenyr-character-training-v1';
import { ARCHIVE_PLACEMENT_FIELDS, readArchivePlacement, getArchivePlacementChoices } from './character-archive-placement.js';
import { describeTechniqueDamage } from '../combat/combat-technique-damage.js?v=20260905-party-combat-v1';
import {
  getCharacterArchiveAttackGroups,
  matchesCharacterArchiveKind
} from './character-archive-attack-groups.js?v=20260905-cenyr-character-training-v1';
import {
  CHARACTER_ARCHIVE_KINDS,
  cloneArchiveValue,
  createCharacterArchiveProfileItem,
  getCharacterArchiveEntrySearchText,
  getCharacterArchiveKind,
  normalizeArchiveSearchText,
  normalizeCharacterArchiveEntry
} from './character-archive-model.js?v=20260905-archive-order-v2';
import {
  archiveCharacterRecord,
  ensureCharacterArchiveLoaded,
  getCharacterArchiveEntries,
  saveCharacterArchiveEntry,
  setCharacterArchiveLiveRecords
} from './character-archive-store.js?v=20260905-damage-balance-v1';

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
  returnFocus: null
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

function getEntrySourceType(entry) {
  if (entry.sources?.some(source => source.kind === 'character')) return 'character';
  if (entry.sources?.some(source => source.kind === 'creature')) return 'creature';
  if (entry.sources?.some(source => source.kind === 'item-register')) return 'register';
  if (!entry.builtin) return 'custom';
  return 'system';
}

function getVisibleEntries() {
  const needle = normalizeArchiveSearchText(state.search);
  const allowedKinds = state.picker?.kind ? new Set([state.picker.kind]) : null;
  const entries = getCharacterArchiveEntries().filter(entry => {
    if (allowedKinds && !allowedKinds.has(entry.kind)) return false;
    if (!allowedKinds && !matchesCharacterArchiveKind(entry, state.kind)) return false;
    if (state.source !== 'all' && getEntrySourceType(entry) !== state.source) return false;
    return !needle || getCharacterArchiveEntrySearchText(entry).includes(needle);
  });
  return entries.sort((a, b) => {
    if (state.sort === 'newest') return String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) || a.name.localeCompare(b.name, 'de');
    if (state.sort === 'kind') return getCharacterArchiveKind(a.kind).label.localeCompare(getCharacterArchiveKind(b.kind).label, 'de') || a.name.localeCompare(b.name, 'de');
    return a.name.localeCompare(b.name, 'de', { sensitivity: 'base', numeric: true });
  });
}

function getEntryMeta(entry) {
  const data = entry.data || {};
  if (entry.kind === 'spell') return [Number(data.level) ? `Grad ${data.level}` : 'Zaubertrick', data.school, data.damageType].filter(Boolean);
  if (entry.kind === 'technique') return [data.trainingForm, describeTechniqueDamage(data), data.damageType].filter(Boolean);
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
    : `<button type="button" data-character-archive-action="edit-entry" data-entry-id="${escapeHtml(entry.id)}">Bearbeiten</button>`;
  const rulesButton = !state.picker && kind.editorKind
    ? `<button type="button" data-character-archive-action="edit-entry-rules" data-entry-id="${escapeHtml(entry.id)}">Regeldetails</button>`
    : '';
  return `<article class="character-archive-card" data-entry-kind="${escapeHtml(entry.kind)}">
    <div class="character-archive-card-topline"><span>${escapeHtml(kind.group)}</span><span>${escapeHtml(kind.label)}</span></div>
    <div class="character-archive-card-main">
      ${image.source ? `<span class="character-archive-card-icon" aria-hidden="true"><img src="${escapeHtml(image.source)}" data-fallback-src="${escapeHtml(image.fallbackSource)}" alt="" loading="lazy" decoding="async"><i>${escapeHtml(kind.symbol)}</i></span>` : ''}
      <div><h3>${escapeHtml(entry.archiveDisplayName || entry.name)}</h3><p>${escapeHtml(entry.description || 'Noch keine Beschreibung hinterlegt.')}</p></div>
    </div>
    ${meta.length ? `<div class="character-archive-card-meta">${meta.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}
    ${renderSourceBadges(entry)}
    <div class="character-archive-card-actions">${pickerButton}${rulesButton}${getCharacterArchiveClassLinks(entry).map(link => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`).join('')}</div>
  </article>`;
}

function renderAttackGroupIcon(group) {
  if (group.type !== 'class' || !group.parentEntry) {
    return `<span class="character-archive-attack-group-icon" aria-hidden="true"><i>${escapeHtml(group.symbol)}</i></span>`;
  }
  const image = getEntryIcon(group.parentEntry);
  return `<span class="character-archive-attack-group-icon" aria-hidden="true"><img src="${escapeHtml(image.source)}" data-fallback-src="${escapeHtml(image.fallbackSource)}" alt="" loading="lazy" decoding="async"><i>${escapeHtml(group.symbol)}</i></span>`;
}

function renderAttackGroup(group, depth = 0) {
  const count = countArchiveGroupEntries(group);
  const amountLabel = count === 1 ? 'Eintrag' : 'Einträge';
  const openByDefault = depth === 0 || Boolean(state.search);
  return `<details class="character-archive-attack-group" data-attack-group-type="${escapeHtml(group.type)}"${openByDefault ? ' open' : ''}>
    <summary>
      ${renderAttackGroupIcon(group)}
      <span class="character-archive-attack-group-title"><small>${escapeHtml(group.typeLabel)}</small><strong>${escapeHtml(group.name)}</strong><em>${escapeHtml(group.description)}</em></span>
      <span class="character-archive-attack-group-count"><strong>${count}</strong><small>${amountLabel}</small></span>
      <i class="character-archive-attack-group-disclosure" aria-hidden="true"></i>
    </summary>
    ${group.parentEntry && ['style', 'form'].includes(group.type) ? `<div class="character-archive-group-actions"><button type="button" data-character-archive-action="edit-entry" data-entry-id="${escapeHtml(group.parentEntry.id)}">${escapeHtml(group.typeLabel)} bearbeiten</button></div>` : ''}
    ${group.entries.length ? `<div class="character-archive-grid">${group.entries.map(renderEntryCard).join('')}</div>` : ''}
    ${group.children.length ? `<div class="character-archive-group-children">${group.children.map(child => renderAttackGroup(child, depth + 1)).join('')}</div>` : ''}
    ${!count && !group.children.length ? '<p class="character-archive-group-empty">Noch keine Attacken hinterlegt.</p>' : ''}
  </details>`;
}

function renderVisibleEntries(visible, allEntries) {
  const selectedKind = state.picker?.kind || state.kind;
  // Sheet pickers must retain the exact underlying collection (including natural
  // attacks), regardless of the archive's navigation hierarchy.
  if (state.picker) return `<div class="character-archive-grid">${visible.map(renderEntryCard).join('')}</div>`;
  const builders = { technique: getCharacterArchiveAttackGroups, attack: getCharacterArchiveWeaponGroups,
    class: getCharacterArchiveClassGroups, 'register-pferde': getCharacterArchiveHorseGroups };
  if (!builders[selectedKind]) {
    return `<div class="character-archive-grid">${visible.map(renderEntryCard).join('')}</div>`;
  }
  const groups = builders[selectedKind](visible, allEntries);
  return `<div class="character-archive-attack-groups">${groups.map(group => renderAttackGroup(group)).join('')}</div>`;
}

function renderKindNavigation(entries) {
  const counts = new Map(CHARACTER_ARCHIVE_KINDS.map(kind => [kind.id, entries.filter(entry => matchesCharacterArchiveKind(entry, kind.id)).length]));
  return `<nav class="character-archive-kinds" aria-label="Archivkategorien">
    <button type="button" class="${state.kind === 'all' ? 'active' : ''}" data-character-archive-action="set-kind" data-kind="all"><span>Gesamtarchiv</span><strong>${entries.length}</strong></button>
    ${CHARACTER_ARCHIVE_KINDS.filter(kind => !kind.navigationKind).map(kind => `<button type="button" class="${state.kind === kind.id ? 'active' : ''}" data-character-archive-action="set-kind" data-kind="${kind.id}"><i>${kind.symbol}</i><span>${escapeHtml(kind.label)}</span><strong>${counts.get(kind.id) || 0}</strong></button>`).join('')}
  </nav>`;
}

function renderStats(entries) {
  const sourceCount = new Set(entries.flatMap(entry => (entry.sources || []).map(source => `${source.kind}:${source.id || source.name}`))).size;
  return `<div class="character-archive-stats">
    <div><span>Geordnete Einträge</span><strong>${entries.length}</strong></div>
    <div><span>Archivbereiche</span><strong>${CHARACTER_ARCHIVE_KINDS.filter(kind => !kind.navigationKind && entries.some(entry => matchesCharacterArchiveKind(entry, kind.id))).length}</strong></div>
    <div><span>Belegte Quellen</span><strong>${sourceCount}</strong></div>
    <div><span>Eigene Anpassungen</span><strong>${entries.filter(entry => !entry.builtin).length}</strong></div>
  </div>`;
}

function renderArchive() {
  const overlay = ensureOverlay();
  const allEntries = getCharacterArchiveEntries();
  const visible = getVisibleEntries();
  const kindLabel = state.picker ? getCharacterArchiveKind(state.picker.kind).label : 'Charakterbogen Archiv';
  overlay.innerHTML = `<div class="character-archive-page">
    <header class="character-archive-head">
      <div><span>${state.picker ? 'Aus dem gemeinsamen Fundus wählen' : 'Aleria · Zentrales Regel- und Figurenregister'}</span><h1>${escapeHtml(kindLabel)}</h1><p>${state.picker ? 'Wähle einen bestehenden Eintrag. Er wird als unabhängige Kopie in den geöffneten Bogen übernommen.' : 'Völker, Herkünfte, Klassen, Traits, Zauber, Fähigkeiten, Kampfformen und Angriffe an einem verlässlichen Ort.'}</p></div>
      <div class="character-archive-head-actions">
        ${state.picker ? '<button type="button" data-character-archive-action="create-from-picker">+ Neu anlegen</button>' : '<button type="button" data-character-archive-action="new-entry">+ Archiveintrag</button>'}
        <button type="button" class="character-archive-close" data-character-archive-action="close" aria-label="Charakterbogen Archiv schließen">×</button>
      </div>
    </header>
    ${state.picker ? '' : renderStats(allEntries)}
    <div class="character-archive-layout">
      ${state.picker ? '' : `<aside>${renderKindNavigation(allEntries)}<div class="character-archive-ledger-note"><strong>Gemeinsame Quelle</strong><p>Neu gespeicherte Inhalte aus Charakter- und Kreaturenbögen werden automatisch aufgenommen. Archivänderungen bleiben Vorlagen und verändern bestehende Bögen nicht rückwirkend.</p></div></aside>`}
      <main>
        <div class="character-archive-toolbar">
          <label class="character-archive-search"><span>Archiv durchsuchen</span><input type="search" value="${escapeHtml(state.search)}" placeholder="Name, Wirkung, Klasse, Quelle …" data-character-archive-field="search" autocomplete="off"></label>
          <label><span>Quelle</span><select data-character-archive-field="source"><option value="all">Alle Quellen</option><option value="system"${state.source === 'system' ? ' selected' : ''}>Regelvorlagen</option><option value="character"${state.source === 'character' ? ' selected' : ''}>Charaktere</option><option value="creature"${state.source === 'creature' ? ' selected' : ''}>Kreaturen</option><option value="register"${state.source === 'register' ? ' selected' : ''}>Inventar-Register</option><option value="custom"${state.source === 'custom' ? ' selected' : ''}>Eigene Einträge</option></select></label>
          <label><span>Sortierung</span><select data-character-archive-field="sort"><option value="name">Name</option><option value="kind"${state.sort === 'kind' ? ' selected' : ''}>Kategorie</option><option value="newest"${state.sort === 'newest' ? ' selected' : ''}>Zuletzt geändert</option></select></label>
          <div class="character-archive-result"><strong>${visible.length}</strong><span>Treffer</span></div>
        </div>
        ${state.loading ? '<div class="character-archive-empty"><strong>Archiv wird geordnet …</strong><span>Vorlagen und Bögen werden zusammengeführt.</span></div>' : (visible.length ? renderVisibleEntries(visible, allEntries) : '<div class="character-archive-empty"><strong>Keine passenden Einträge</strong><span>Ändere Suche oder Filter oder lege einen neuen Archiveintrag an.</span></div>')}
      </main>
    </div>
  </div>`;
  activateImageFallbacks(overlay);
}

function activateImageFallbacks(root) {
  root.querySelectorAll('.character-archive-card-icon img, .character-archive-attack-group-icon img').forEach(image => {
    const mark = () => {
      const fallback = String(image.dataset.fallbackSrc || '').trim();
      if (fallback && image.src !== new URL(fallback, document.baseURI).href) {
        image.src = fallback;
        image.removeAttribute('data-fallback-src');
        return;
      }
      image.closest('.character-archive-card-icon, .character-archive-attack-group-icon')?.classList.add('missing');
    };
    if (image.complete && image.naturalWidth === 0) mark();
    else image.addEventListener('error', mark, { once: true });
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
  document.body.appendChild(overlay);
  return overlay;
}

function findEntry(id) {
  return getCharacterArchiveEntries().find(entry => String(entry.id) === String(id)) || null;
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
  const current = entry ? normalizeCharacterArchiveEntry(entry) : null;
  const selectedKind = current?.kind || (state.kind !== 'all' ? state.kind : 'ability');
  state.editingId = current?.id || '';
  overlay.innerHTML = `<form class="character-archive-editor" data-character-archive-editor-form>
    <header><div><span>Archivvorlage</span><h2>${current ? 'Eintrag bearbeiten' : 'Neuen Eintrag anlegen'}</h2></div><button type="button" data-character-archive-action="close-editor" aria-label="Editor schließen">×</button></header>
    <div class="character-archive-editor-body">
      <label><span>Bereich</span><select name="kind"${current ? ' disabled' : ''}>${CHARACTER_ARCHIVE_KINDS.map(kind => `<option value="${kind.id}"${kind.id === selectedKind ? ' selected' : ''}>${escapeHtml(kind.label)}</option>`).join('')}</select></label>
      <label><span>Name</span><input name="name" value="${escapeHtml(current?.name || '')}" maxlength="160" required></label>
      <label class="wide"><span>Beschreibung / Wirkung</span><textarea name="description" rows="5" maxlength="4000">${escapeHtml(current?.description || '')}</textarea></label>
      <label class="wide"><span>Schlagworte</span><input name="tags" value="${escapeHtml((current?.tags || []).join(', '))}" placeholder="z. B. Feuer, Drachentanz, Cenyr"></label>
      <label class="wide"><span>Icon-Pfad oder Bild-URL</span><div class="character-archive-icon-field"><span class="character-archive-icon-preview">${current?.icon ? `<img src="${escapeHtml(safeImageSource(current.icon))}" alt="">` : ''}</span><input name="icon" value="${escapeHtml(current?.icon || '')}" placeholder="${selectedKind === 'spell' ? 'Leer = kein Icon' : 'Leer = automatische Auswahl'}"><button type="button" data-character-archive-action="pick-icon">Icon wählen</button></div></label>
      ${renderPlacementFields(current, selectedKind)}
      <p class="character-archive-editor-hint">Das Icon kann jederzeit ersetzt werden. Archiv und Charakterbögen verwenden für gleichnamige Kampf- und Regeleinträge dieselbe aktuelle Bildzuordnung.</p>
    </div>
    <footer><span data-character-archive-editor-status></span><div>${current && getCharacterArchiveKind(current.kind).editorKind ? '<button type="button" data-character-archive-action="edit-entry-rules-from-editor">Regeldetails</button>' : ''}<button type="button" data-character-archive-action="close-editor">Abbrechen</button><button type="submit" class="character-archive-primary">Im Archiv speichern</button></div></footer>
  </form>`;
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.querySelector('[name="name"]')?.focus();
}

function closeEntryEditor() {
  const overlay = document.getElementById('character-archive-editor-overlay');
  overlay?.classList.remove('active');
  overlay?.setAttribute('aria-hidden', 'true');
  state.editingId = '';
  state.iconPickerOpen = false;
  document.getElementById('icon-directory-overlay')?.style.removeProperty('z-index');
}

async function saveEditorForm(form) {
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
  if (status) status.textContent = 'Wird gespeichert …';
  try {
    await saveCharacterArchiveEntry({ ...(current || {}), kind, name, description, iconOverride: icon, icon, tags, data });
    closeEntryEditor();
    renderArchive();
  } catch {
    if (status) status.textContent = 'Lokal gespeichert; Online-Abgleich derzeit nicht möglich.';
    renderArchive();
  }
}

function editEntryRules(entry) {
  const kind = getCharacterArchiveKind(entry.kind);
  if (!kind.editorKind) return;
  openCombatEntryEditor({
    kind: kind.editorKind,
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
  state.returnFocus = document.activeElement;
  state.open = true;
  state.picker = options.picker || null;
  state.kind = state.picker?.kind || 'all';
  state.source = 'all';
  state.search = '';
  state.loading = true;
  refreshLiveEntries();
  const overlay = ensureOverlay();
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('character-archive-open');
  renderArchive();
  try {
    await ensureCharacterArchiveLoaded();
  } finally {
    state.loading = false;
    refreshLiveEntries();
    renderArchive();
    overlay.focus({ preventScroll: true });
  }
}

function closeArchive() {
  const overlay = ensureOverlay();
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('character-archive-open');
  state.open = false;
  state.picker = null;
  state.returnFocus?.focus?.({ preventScroll: true });
  state.returnFocus = null;
}

function openPicker({ kind, onSelect, onCreate } = {}) {
  if (!getCharacterArchiveKind(kind)?.id) return;
  return openArchive({ picker: { kind, onSelect, onCreate } });
}

function handleClick(event) {
  const trigger = event.target?.closest?.('[data-character-archive-action]');
  if (!trigger) return;
  const action = trigger.dataset.characterArchiveAction;
  if (action === 'open') { event.preventDefault(); openArchive(); }
  else if (action === 'close') closeArchive();
  else if (action === 'set-kind') { state.kind = trigger.dataset.kind || 'all'; renderArchive(); }
  else if (action === 'new-entry') openEntryEditor();
  else if (action === 'edit-entry') openEntryEditor(findEntry(trigger.dataset.entryId));
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
    renderArchive();
    document.querySelector('[data-character-archive-field="search"]')?.focus();
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
  if (field) renderArchive();
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
  if (state.open && !state.loading) renderArchive();
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
document.addEventListener('aleria:character-archive-changed', () => {
  if (state.open && !state.loading) renderArchive();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (document.getElementById('character-archive-editor-overlay')?.classList.contains('active')) closeEntryEditor();
  else if (state.open) closeArchive();
});

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
