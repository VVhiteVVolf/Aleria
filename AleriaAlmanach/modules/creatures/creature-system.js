import { CREATURE_SHEET_PAGES, renderCreaturePages, renderCreaturePageTabs, creaturePageFromKey } from './creature-sheet-pages.js?v=20260925-creature-biography-v1';
import { createCreatureBiographyEditor, collectCreatureBiography } from './creature-biography-editor.js?v=20260925-creature-biography-v2';
import { renderCreatureImages } from './creature-images-view.js?v=20260919-creature-pages-v1';
import { createCreatureImagesEditor, collectCreatureImages } from './creature-images-editor.js?v=20260919-creature-pages-v1';
import { normalizeCreatureImages } from './creature-images-model.js?v=20260919-creature-pages-v1';
import { createImageLibraryAutosave } from '../image-library/image-library-autosave.js?v=20260919-creature-pages-v1';
import {
  COMBAT_ATTRIBUTE_DEFINITIONS,
  COMBAT_WEAPON_TYPE_OPTIONS,
  getArmorClass,
  getAttributeModifier,
  getMaximumHitPoints,
  getPassivePerception,
  getProficiencyBonus,
  getSavingThrowTotal,
  getSkillTotal,
  getWeaponAttackModifier,
  isTechniqueCompatibleWithWeapon,
  sanitizeCharacterCombatProfile
} from '../combat/combat-profile-model.js?v=20260909-dragon-parent-v2';
import { openCombatEntryEditor } from '../combat/ui/combat-entry-editor.js?v=20260912-archive-dialogs-v1';
import { renderCreatureDossier } from './creature-dossier.js?v=20260909-dragon-parent-v2';
import { getCombatResourceIconPresentation } from '../combat/combat-resource-icons.js?v=20260803-composer-design-v1';
import {
  findSpellSlotResourceId,
  getOrderedSpellSlotResources,
  getSpellLevelLabel,
  getSpellSlotLevel,
  isSpellSlotResource
} from '../combat/combat-spell-slots.js?v=20260803-character-creation-v1';
import {
  CREATURE_ARCHIVE_EXPORT_TYPE,
  CREATURE_SCHEMA_VERSION,
  createCreatureDraft,
  createCreatureDuplicate,
  makeCreatureSceneActor,
  makeCreatureExportPayload,
  normalizeCreatureImportPayload,
  sanitizeCreature
} from './creature-model.js?v=20260925-creature-biography-v2';
import {
  CREATURE_LEVEL_GUIDELINES,
  getBuiltinCreatureTemplates,
  isBuiltinCreatureId
} from './creature-catalog.js?v=20260925-creature-biography-v2';
import { selectChangedSections } from '../characters/character-save-guard.js?v=20260808-character-storage-audit-v1';

const state = {
  creatures: getBuiltinCreatureTemplates().map(creature => ({ ...creature, _builtin: true })),
  loaded: false,
  loading: false,
  editingId: '',
  draft: null,
  activePage: 'overview',
  session: 0
};

const mediaEditor = createCreatureImagesEditor({
  getRoot: () => document.getElementById('creature-sheet-root'),
  getDraft: () => state.draft,
  collect: collectDraftFromForm,
  render: renderSheet,
  onChange: scheduleCreatureImages
});

const biographyEditor = createCreatureBiographyEditor({
  getRoot: () => document.getElementById('creature-sheet-root'),
  getDraft: () => state.draft,
  collect: collectDraftFromForm,
  render: renderSheet,
  escape: escapeHtml,
  pickIcon: trigger => window.openSchemaIconPicker(trigger)
});

const imageAutosave = createImageLibraryAutosave({
  async write(snapshot) {
    const backend = await ensureBackend();
    await backend.saveCreature(snapshot.recordId, { ...snapshot.images, updatedAt: new Date().toISOString() });
  },
  onQueued() { setStatus('Bilder und Sets werden gespeichert …'); },
  onSaved(snapshot, { isLatest }) {
    const stored = state.creatures.find(creature => creature.id === snapshot.recordId);
    if (stored) Object.assign(stored, clone(snapshot.images));
    renderLibrary();
    dispatchChanged();
    if (isLatest && state.session === snapshot.session) setStatus('Bilder und Sets online gespeichert.', 'success');
  },
  onError(error, snapshot) {
    if (state.session === snapshot.session) setStatus(`Bilder noch nicht gespeichert: ${error.message} Mit „Online speichern“ erneut versuchen.`, 'error');
  }
});

function scheduleCreatureImages() {
  if (!state.draft) return;
  if (state.saving) { state.pendingImages = true; return; }
  if (!state.editingId || !state.creatures.some(item => item.id === state.editingId && !item._builtin)) {
    setStatus('Bilder im Entwurf übernommen. Die Kreatur zuerst mit „Online speichern“ anlegen.');
    return;
  }
  imageAutosave.schedule({
    recordId: state.editingId,
    session: state.session,
    images: clone({ ...normalizeCreatureImages(state.draft), portraitCaption: state.draft.portraitCaption })
  });
}

function switchCreaturePage(page) {
  if (!state.draft || !CREATURE_SHEET_PAGES.some(item => item.id === page)) return;
  collectDraftFromForm();
  state.activePage = page;
  renderSheet();
  document.getElementById('creature-sheet-root').scrollTop = 0;
  document.getElementById(`creature-tab-${page}`)?.focus({ preventScroll: true });
}

function renderCreatureSpellLevelOptions(value = 0) {
  return Array.from({ length: 11 }, (_entry, level) => `<option value="${level}"${Number(value) === level ? ' selected' : ''}>${escapeHtml(getSpellLevelLabel(level))}</option>`).join('');
}

const SIZE_OPTIONS = ['Winzig', 'Klein', 'Mittel', 'Groß', 'Riesig', 'Gigantisch'];
const ATTRIBUTE_OPTIONS = COMBAT_ATTRIBUTE_DEFINITIONS.map(item => `<option value="${item.key}">${item.label}</option>`).join('');

function mergeCreatureCatalog(storedCreatures = []) {
  const byId = new Map(getBuiltinCreatureTemplates().map(creature => [creature.id, { ...creature, _builtin: true }]));
  (Array.isArray(storedCreatures) ? storedCreatures : []).map(sanitizeCreature).forEach(creature => {
    byId.set(creature.id, { ...creature, _builtin: false });
  });
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }));
}

function formatLevelGuideline(entry) {
  if (entry.minimum === entry.maximum) return `${entry.label} ${entry.approximate ? 'ca. ' : ''}${entry.minimum}`;
  return `${entry.label} ${entry.minimum}–${entry.maximum}${entry.maximum === 30 ? '+' : ''}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeImageUrl(value) {
  const source = String(value || '').trim();
  if (!source) return '';
  if (/^https?:\/\//i.test(source) || /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(source)) return source;
  return '';
}

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAtPath(target, path) {
  return String(path || '').split('.').filter(Boolean).reduce((value, key) => value?.[key], target);
}

function setAtPath(target, path, value) {
  const parts = String(path || '').split('.').filter(Boolean);
  const last = parts.pop();
  if (!last) return;
  const parent = parts.reduce((value, key) => {
    if (!value[key] || typeof value[key] !== 'object') value[key] = {};
    return value[key];
  }, target);
  parent[last] = value;
}

function getOverlay() {
  return document.getElementById('creature-profile-overlay');
}

function setStatus(message, tone = '') {
  const node = document.getElementById('creature-save-status');
  if (!node) return;
  node.textContent = message || '';
  node.dataset.tone = tone;
}

function notify(message, tone = 'info') {
  if (typeof window.showAppStatus === 'function') window.showAppStatus(message, tone);
}

async function ensureBackend() {
  if (window._fb?.loadCreatures) return window._fb;
  if (typeof window.waitForFirebaseReady === 'function') await window.waitForFirebaseReady();
  if (!window._fb?.loadCreatures) throw new Error('Die Kreaturen-Speicherung ist noch nicht bereit.');
  return window._fb;
}

let materializePromises = new Map();

async function materializeBuiltinCreature(id) {
  const creatureId = String(id || '').trim();
  if (!creatureId || !isBuiltinCreatureId(creatureId)) return null;
  const existing = state.creatures.find(item => item.id === creatureId);
  if (existing && existing._builtin === false) return existing;
  if (materializePromises.has(creatureId)) return materializePromises.get(creatureId);
  const run = (async () => {
    const template = getBuiltinCreatureTemplates().find(item => item.id === creatureId);
    if (!template) return null;
    const backend = await ensureBackend();
    const now = new Date().toISOString();
    const data = { ...template, createdAt: now, updatedAt: now };
    delete data.id;
    await backend.saveCreature(creatureId, data);
    const saved = { ...sanitizeCreature({ id: creatureId, ...data }), _builtin: false };
    const index = state.creatures.findIndex(item => item.id === creatureId);
    if (index >= 0) state.creatures[index] = saved;
    else state.creatures.push(saved);
    dispatchChanged();
    return saved;
  })().finally(() => materializePromises.delete(creatureId));
  materializePromises.set(creatureId, run);
  return run;
}

let changedDispatchQueued = false;

function emitChanged() {
  changedDispatchQueued = false;
  document.dispatchEvent(new CustomEvent('aleria:creatures-changed', {
    detail: { creatures: getSceneActors() }
  }));
}

function dispatchChanged() {
  if (typeof document?.dispatchEvent !== 'function' || typeof CustomEvent !== 'function') return;
  if (document.readyState !== 'complete' && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    if (changedDispatchQueued) return;
    changedDispatchQueued = true;
    window.addEventListener('load', emitChanged, { once: true });
    return;
  }
  emitChanged();
}

function getSearchNeedle() {
  return String(document.getElementById('archive-search-input')?.value || '')
    .trim().toLocaleLowerCase('de');
}

function matchesSearch(creature, needle) {
  if (!needle) return true;
  const profile = creature.combatProfile || {};
  const text = [
    creature.name, creature.type, creature.species, creature.habitat, creature.size,
    creature.notes, creature.loot?.notes,
    ...(creature.loot?.items || []).map(item => `${item.name} ${item.notes}`),
    ...(profile.weapons || []).map(item => `${item.name} ${item.damageFormula} ${item.damageType} ${item.properties}`),
    ...(profile.abilities || []).map(item => `${item.name} ${item.description}`),
    ...(profile.conditions || []).map(item => `${item.name} ${item.description}`)
  ].join(' ').toLocaleLowerCase('de');
  return text.includes(needle);
}

function downloadJson(payload, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function slugify(value) {
  return String(value || 'kreatur').toLocaleLowerCase('de')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'kreatur';
}

function renderLibrary() {
  const root = document.getElementById('creature-library-root');
  if (!root) return;
  if (state.loading && !state.loaded) {
    root.innerHTML = '<div class="creature-library-state">Kreaturenregister wird geöffnet …</div>';
    return;
  }
  const needle = getSearchNeedle();
  const visible = state.creatures.filter(creature => matchesSearch(creature, needle));
  root.innerHTML = `
    <div class="creature-library-toolbar">
      <div class="creature-library-summary"><strong>${state.creatures.length}</strong> Kreaturen · Vorlagen dürfen beliebig oft dupliziert werden.</div>
      <div class="creature-library-actions">
        <button type="button" class="creature-secondary-button" data-creature-action="import-archive">Importieren</button>
        <button type="button" class="creature-secondary-button" data-creature-action="export-archive"${state.creatures.length ? '' : ' disabled'}>Archiv exportieren</button>
        <button type="button" class="creature-primary-button" data-creature-action="new">+ Kreatur</button>
      </div>
    </div>
    <div class="creature-grid">
      ${visible.map(renderCreatureCard).join('')}
      ${visible.length ? '' : `<div class="creature-library-state">${needle ? 'Keine Kreatur passt zur Archivsuche.' : 'Noch keine Kreaturen gespeichert. Lege die erste Vorlage an.'}</div>`}
    </div>`;
}

function renderCreatureCard(creature) {
  const profile = sanitizeCharacterCombatProfile(creature.combatProfile, { ensureRequiredSkills: false, ensureSpellSlots: false });
  const portrait = safeImageUrl(creature.portrait);
  const hp = getMaximumHitPoints(profile);
  const ac = getArmorClass(profile);
  const instanceLabel = creature.instanceOrdinal > 0
    ? `Instanz ${creature.instanceOrdinal}`
    : (isBuiltinCreatureId(creature.id) ? 'Grundvorlage' : 'Vorlage');
  return `
    <article class="creature-card" data-creature-id="${escapeHtml(creature.id)}">
      <button class="creature-card-open" type="button" data-creature-action="open" data-creature-id="${escapeHtml(creature.id)}">
        <span class="creature-card-portrait">
          ${portrait ? `<img src="${escapeHtml(portrait)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<span class="creature-card-sigil">☠</span>'}
          <span class="creature-card-badge">${escapeHtml(instanceLabel)}</span>
        </span>
        <span class="creature-card-body">
          <strong>${escapeHtml(creature.name)}</strong>
          <small>${escapeHtml([creature.type, creature.species].filter(Boolean).join(' · ') || 'Kreatur')}</small>
          <span class="creature-card-stats"><b>LP ${profile.hitPoints.current ?? hp}/${hp}</b><b>RK ${ac}</b><b>Stufe ${creature.level}</b></span>
          <small>${escapeHtml(profile.abilities.filter(ability => ability.active).map(ability => ability.name).slice(0, 3).join(' · '))}</small>
        </span>
      </button>
      <div class="creature-card-actions">
        <button type="button" data-creature-action="duplicate" data-creature-id="${escapeHtml(creature.id)}">Duplizieren</button>
        <button type="button" data-creature-action="export-one" data-creature-id="${escapeHtml(creature.id)}">Export</button>
      </div>
    </article>`;
}

function getAttribute(profile, key) {
  return profile.attributes.find(item => item.key === key) || { key, score: 10 };
}

function renderRadar(profile) {
  const center = 70;
  const radius = 52;
  const axes = COMBAT_ATTRIBUTE_DEFINITIONS.map((definition, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / 3;
    const value = Math.max(1, Math.min(30, Number(getAttribute(profile, definition.key).score) || 10));
    const scale = value / 30;
    return {
      ...definition,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      px: center + Math.cos(angle) * radius * scale,
      py: center + Math.sin(angle) * radius * scale,
      lx: center + Math.cos(angle) * (radius + 13),
      ly: center + Math.sin(angle) * (radius + 13)
    };
  });
  const rings = [0.25, 0.5, 0.75, 1].map(scale => axes
    .map(axis => `${center + (axis.x - center) * scale},${center + (axis.y - center) * scale}`).join(' '));
  return `<svg class="creature-radar" viewBox="0 0 140 140" role="img" aria-label="Attributdiagramm">
    ${rings.map(points => `<polygon points="${points}" class="creature-radar-ring"/>`).join('')}
    ${axes.map(axis => `<line x1="${center}" y1="${center}" x2="${axis.x}" y2="${axis.y}"/>`).join('')}
    <polygon points="${axes.map(axis => `${axis.px},${axis.py}`).join(' ')}" class="creature-radar-value"/>
    ${axes.map(axis => `<text x="${axis.lx}" y="${axis.ly}" text-anchor="middle">${axis.shortLabel}</text>`).join('')}
  </svg>`;
}

function renderField(label, field, value, options = {}) {
  const type = options.type || 'text';
  const attrs = [
    `type="${type}"`, `data-creature-field="${field}"`, `value="${escapeHtml(value ?? '')}"`,
    options.min != null ? `min="${options.min}"` : '', options.max != null ? `max="${options.max}"` : '',
    options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : ''
  ].filter(Boolean).join(' ');
  return `<label class="creature-field"><span>${escapeHtml(label)}</span><input ${attrs}></label>`;
}

function renderSheet() {
  const root = document.getElementById('creature-sheet-root');
  if (!root || !state.draft) return;
  const creature = sanitizeCreature(state.draft);
  state.draft = clone(creature);
  const profile = creature.combatProfile;
  const maximumHp = getMaximumHitPoints(profile);
  const armorClass = getArmorClass(profile);
  const proficiency = getProficiencyBonus(profile);
  const passivePerception = getPassivePerception(profile);
  const scrollTop = root.scrollTop;
  const contents = {
    overview: renderCreatureDossier(creature),
    biography: biographyEditor.render(creature),
    profile: `    <section class="creature-sheet-section creature-identity-section">
      <div class="creature-section-title"><span>1</span> Kopfleiste / Identität</div>
      <div class="creature-identity-grid">
        ${renderField('Name', 'name', creature.name)}
        ${renderField('Typ', 'type', creature.type, { placeholder: 'Untoter, Tier, NSC …' })}
        ${renderField('Gattung', 'species', creature.species)}
        ${renderField('Habitat', 'habitat', creature.habitat)}
        ${renderField('Bedrohungsgrad', 'challengeRating', creature.challengeRating, { type: 'number', min: 0, max: 30 })}
        <label class="creature-field"><span>Größe</span><select data-creature-field="size">${SIZE_OPTIONS.map(size => `<option value="${size}"${size === creature.size ? ' selected' : ''}>${size}</option>`).join('')}</select></label>
        ${renderField('Stufe', 'level', creature.level, { type: 'number', min: 1, max: 30 })}
      </div>
      <p class="creature-level-guideline"><strong>Stufenorientierung:</strong> ${CREATURE_LEVEL_GUIDELINES.map(formatLevelGuideline).join(' · ')}</p>
    </section>
    <section class="creature-sheet-section">
      <div class="creature-section-title"><span>9</span> Spielleitungsnotizen</div>
      <textarea class="creature-textarea" rows="4" data-creature-field="notes" placeholder="Taktik, Verhalten, Geheimnisse und besondere Regeln …">${escapeHtml(creature.notes)}</textarea>
    </section>
`,
    combat: `<div class="creature-sheet-columns">        <section class="creature-sheet-section">
          <div class="creature-section-title"><span>3</span> Abgeleitete Kampfwerte</div>
          <div class="creature-derived-grid">
            <label><span>TP aktuell</span><input type="number" min="0" max="9999" data-combat-field="hp-current" value="${escapeHtml(profile.hitPoints.current ?? maximumHp)}"><b>♥ ${escapeHtml(profile.hitPoints.current ?? maximumHp)} / ${maximumHp}</b></label>
            <label><span>TP maximal</span><input type="number" min="1" max="9999" data-combat-field="hp-maximum" value="${maximumHp}"><b>${maximumHp}</b></label>
            <label><span>Temporäre LP</span><input type="number" min="0" max="9999" data-creature-profile-path="hitPoints.temporary" value="${profile.hitPoints.temporary || 0}"><b>${profile.hitPoints.temporary || 0}</b></label>
            <label><span>Trefferwürfel</span><select data-creature-profile-path="hitPoints.hitDie">${[4, 6, 8, 10, 12, 20].map(die => `<option value="${die}"${profile.hitPoints.hitDie === die ? ' selected' : ''}>W${die}</option>`).join('')}</select></label>
            <label><span>Rüstungsklasse</span><input type="number" min="0" max="999" data-combat-field="armor-class" value="${armorClass}"><b>◈ ${armorClass}</b></label>
            <label><span>Bewegung (m)</span><input type="number" min="0" max="999" data-combat-field="movement" value="${profile.combat.movement}"><b>${profile.combat.movement} m</b></label>
            <label><span>Kompetenzbonus</span><input type="number" min="-20" max="30" data-combat-field="proficiency" value="${proficiency}"><b>+${proficiency}</b></label>
            <label><span>Passiv-Bonus</span><input type="number" min="-99" max="99" data-combat-field="passive-perception" value="${profile.combat.passivePerceptionBonus}"><b>${passivePerception}</b></label>
            <label><span>0-TP-Sonderregel</span><input type="checkbox" data-creature-profile-path="combat.canActAtZeroHitPoints"${profile.combat.canActAtZeroHitPoints ? ' checked' : ''}><b>${profile.combat.canActAtZeroHitPoints ? 'Handlungsfähig' : 'Handlungsunfähig'}</b></label>
          </div>
        </section>
        <section class="creature-sheet-section">
          <div class="creature-section-title"><span>4</span> Attribute</div>
          <div class="creature-attributes-layout">
            ${renderRadar(profile)}
            <div class="creature-attribute-grid">${COMBAT_ATTRIBUTE_DEFINITIONS.map(definition => {
              const attribute = getAttribute(profile, definition.key);
              const modifier = getAttributeModifier(attribute);
              return `<label><span>${definition.label}</span><input type="number" min="1" max="40" data-attribute-key="${definition.key}" value="${attribute.score}"><b>${modifier >= 0 ? '+' : ''}${modifier}</b></label>`;
            }).join('')}</div>
          </div>
        </section>
</div>
      ${renderCreatureResources(profile)}
      <div class="creature-sheet-columns">${renderSkillsAndSaves(profile)}${renderConditions(profile)}</div>
    <section class="creature-sheet-section creature-cheat-section"><div class="creature-section-title"><span>!</span> Spielleiter-Cheat</div><label class="creature-active-toggle"><input type="checkbox" data-creature-profile-path="cheats.enabled"${profile.cheats.enabled ? ' checked' : ''}> Kosten entfallen und Angriffe gelingen automatisch</label><label class="creature-active-toggle"><input type="checkbox" data-creature-profile-path="cheats.automaticCritical"${profile.cheats.automaticCritical ? ' checked' : ''}> automatische kritische Treffer</label></section>
`,
    abilities: `${renderAttacks(profile)}
      <div class="creature-sheet-columns">
        ${renderCreatureDetailSection(profile, 'techniques', 'T', 'Techniken & Formen', 'technique', 'Technik', item => !['reaction', 'bonus-action'].includes(item.activationType), 'action')}
        ${renderCreatureDetailSection(profile, 'techniques', 'B', 'Reaktionen & Bonusaktionen', 'technique', 'Reaktion / Bonusaktion', item => ['reaction', 'bonus-action'].includes(item.activationType), 'bonus-action')}
      </div>
      <div class="creature-sheet-columns">${renderAbilities(profile)}${renderCreatureDetailSection(profile, 'quirks', 'E', 'Marotten & Eigenschaften', 'quirk', 'Marotte')}</div>`,
    magic: `${renderCreatureMagic(profile)}${renderCreatureAura(profile)}`,
    loot: renderLoot(creature),
    images: renderCreatureImages(creature, escapeHtml, mediaEditor.viewState())
  };
  root.innerHTML = renderCreaturePages(contents, state.activePage);
  root.scrollTop = scrollTop;
  const tabs = document.getElementById('creature-page-tabs');
  if (tabs) tabs.innerHTML = renderCreaturePageTabs(state.activePage);
  const title = document.getElementById('creature-profile-title');
  if (title) title.textContent = creature.name;
  root.querySelectorAll('.creature-resource-icon').forEach(image => {
    const markFailed = () => image.closest('.creature-resource-icon-frame')?.classList.add('is-missing');
    if (image.complete && image.naturalWidth === 0) markFailed();
    else image.addEventListener('error', markFailed, { once: true });
  });
  const deleteButton = document.querySelector('[data-creature-action="delete"]');
  if (deleteButton) deleteButton.hidden = !state.editingId || isBuiltinCreatureId(state.editingId);
}

function renderAttacks(profile) {
  return `<section class="creature-sheet-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>5</span> Angriffe</div><button type="button" data-creature-action="add-attack">+ Angriff</button></div>
    <div class="creature-table creature-attacks-table">
      <div class="creature-table-head"><span>Name / Waffenart</span><span>Attribut</span><span>Schaden</span><span>Art / Reichweite</span><span>Effekt</span><span></span></div>
      ${profile.weapons.map((weapon, index) => `<div class="creature-table-row" data-attack-index="${index}">
        <div class="creature-stacked-inputs"><input data-attack-field="name" value="${escapeHtml(weapon.name)}" placeholder="Biss"><select data-attack-field="weaponType">${COMBAT_WEAPON_TYPE_OPTIONS.map(option => `<option value="${option.id}"${option.id === weapon.weaponType ? ' selected' : ''}>${option.label}</option>`).join('')}</select><select data-attack-field="training"><option value="simple"${weapon.training === 'simple' ? ' selected' : ''}>Schlicht / simpel</option><option value="martial"${weapon.training === 'martial' ? ' selected' : ''}>Kriegerisch</option><option value="special"${weapon.training === 'special' ? ' selected' : ''}>Besonders</option></select></div>
        <select data-attack-field="attackAttribute">${ATTRIBUTE_OPTIONS.replace(`value="${weapon.attackAttribute}"`, `value="${weapon.attackAttribute}" selected`)}</select>
        <input data-attack-field="damageFormula" value="${escapeHtml(weapon.damageFormula)}" placeholder="1d8+2">
        <div class="creature-stacked-inputs"><input data-attack-field="damageType" value="${escapeHtml(weapon.damageType)}" placeholder="Stich"><input data-attack-field="range" value="${escapeHtml(weapon.range)}" placeholder="Nahkampf"></div>
        <textarea rows="2" data-attack-field="notes" placeholder="Effekt / Besonderheit">${escapeHtml(weapon.notes || weapon.properties)}</textarea>
        <div class="creature-attack-actions"><button type="button" data-creature-action="edit-detail" data-collection="weapons" data-entry-kind="weapon" data-item-id="${escapeHtml(weapon.id)}">Regeln</button><button type="button" class="creature-row-remove" data-creature-action="remove-attack" data-index="${index}" aria-label="Angriff entfernen">×</button></div>
      </div>`).join('') || '<div class="creature-table-empty">Noch kein Angriff. Füge natürliche Angriffe, Waffen oder Zauberangriffe hinzu.</div>'}
    </div>
  </section>`;
}

function renderAbilities(profile) {
  return renderCreatureDetailSection(profile, 'abilities', '6', 'Eigenschaften / Fähigkeiten', 'ability', 'Fähigkeit');
}

function renderCreatureDetailSection(profile, collection, number, title, kind, addLabel, filter = null, defaultActivation = '') {
  const items = filter ? (profile[collection] || []).filter(filter) : (profile[collection] || []);
  const activeWeapon = profile.weapons.find(weapon => weapon.equipped) || profile.weapons[0] || null;
  return `<section class="creature-sheet-section creature-detail-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>${number}</span> ${title}</div><button type="button" data-creature-action="add-detail" data-collection="${collection}" data-entry-kind="${kind}"${defaultActivation ? ` data-default-activation="${defaultActivation}"` : ''}>+ ${addLabel}</button></div>
    <div class="creature-detail-list">${items.map(item => { const compatible = kind !== 'technique' || isTechniqueCompatibleWithWeapon(item, activeWeapon); return `<article class="creature-detail-card ${item.active === false || !compatible ? 'inactive' : ''}" data-compatible="${compatible}">
      <div><span>${escapeHtml([item.activationType || item.type, (item.costs || []).map(cost => `${cost.amount} ${cost.name}`).join(' · '), compatible ? '' : `Nicht mit ${activeWeapon?.name || 'der aktiven Waffe'} verfügbar`].filter(Boolean).join(' · '))}</span><strong>${escapeHtml(item.name || 'Unbenannter Eintrag')}</strong><p>${escapeHtml(item.description || item.effect || 'Noch keine Beschreibung.')}</p></div>
      <div><button type="button" data-creature-action="edit-detail" data-collection="${collection}" data-entry-kind="${kind}" data-item-id="${escapeHtml(item.id)}">Bearbeiten</button><button type="button" class="creature-row-remove" data-creature-action="remove-detail" data-collection="${collection}" data-item-id="${escapeHtml(item.id)}">×</button></div>
    </article>`; }).join('') || `<div class="creature-table-empty">Noch keine ${title.toLowerCase()} eingetragen.</div>`}</div>
  </section>`;
}

function renderCreatureResources(profile) {
  const coreResources = profile.resources.filter(resource => !isSpellSlotResource(resource, profile.magic.slotResourceIds));
  return `<section class="creature-sheet-section creature-resource-section">
    <div class="creature-section-title"><span>R</span> Aktionen & Kernressourcen</div>
    <div class="creature-resource-grid">${coreResources.map(resource => { const icon = getCombatResourceIconPresentation(resource, document.baseURI); return `<label data-creature-resource-id="${escapeHtml(resource.id)}"><span class="creature-resource-icon-frame" aria-hidden="true"><b>${icon.fallback}</b>${icon.source ? `<img class="creature-resource-icon" src="${escapeHtml(icon.source)}" alt="" loading="eager" decoding="async">` : ''}</span><span>${escapeHtml(resource.name)}</span><div><input type="number" min="0" max="9999" data-resource-field="current" value="${resource.current}"><i>/</i><input type="number" min="0" max="9999" data-resource-field="maximum" value="${resource.maximum}"></div><small>${resource.scope === 'comment' ? 'pro Kommentar' : resource.recovery}</small></label>`; }).join('')}</div>
  </section>`;
}

const CREATURE_AURA_MECHANIC_FIELDS = Object.freeze([
  ['attack', 'Angriff', -99, 99],
  ['damage', 'Schaden', -99, 99],
  ['armorClass', 'RK', -99, 99],
  ['savingThrow', 'Rettung', -99, 99],
  ['spellAttack', 'Zauberangriff', -99, 99],
  ['spellSaveDc', 'Zauber-SG', -99, 99],
  ['combatStartTemporaryHitPoints', 'Temp. TP bei Kampfbeginn', 0, 9999]
]);

function renderCreatureAuraMechanics(path, title, mechanics = {}) {
  return `<fieldset><legend>${title}</legend>${CREATURE_AURA_MECHANIC_FIELDS.map(([key, label, minimum, maximum]) => `<label><span>${label}</span><input type="number" min="${minimum}" max="${maximum}" data-creature-profile-path="${path}.${key}" value="${mechanics[key] ?? 0}"></label>`).join('')}</fieldset>`;
}

function renderCreatureAura(profile) {
  const aura = profile.aura;
  return `<section class="creature-sheet-section creature-aura-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>A</span> Aura, Präsenz & Domäne</div><label class="creature-active-toggle"><input type="checkbox" data-creature-profile-path="aura.enabled"${aura.enabled ? ' checked' : ''}> aktiv</label></div>
    <div class="creature-identity-grid"><label class="creature-field"><span>Name</span><input data-creature-profile-path="aura.name" value="${escapeHtml(aura.name)}"></label><label class="creature-field"><span>Domäne</span><input data-creature-profile-path="aura.domain" value="${escapeHtml(aura.domain)}"></label><label class="creature-field"><span>Fokusressource</span><select data-creature-profile-path="aura.focusResourceId">${profile.resources.map(resource => `<option value="${escapeHtml(resource.id)}"${resource.id === aura.focusResourceId ? ' selected' : ''}>${escapeHtml(resource.name)}</option>`).join('')}</select></label><label class="creature-field"><span>Fokuskosten</span><input type="number" min="1" max="999" data-creature-profile-path="aura.focusBypassCost" value="${aura.focusBypassCost}"></label></div>
    <div class="creature-aura-components">${[['activeForm','Aktive Form'],['latentPresence','Latente Präsenz']].map(([key, title]) => { const component = aura[key]; return `<details open><summary>${title}</summary><div class="creature-identity-grid"><label class="creature-active-toggle"><input type="checkbox" data-creature-profile-path="aura.${key}.enabled"${component.enabled ? ' checked' : ''}> vorhanden</label><label class="creature-active-toggle"><input type="checkbox" data-creature-profile-path="aura.${key}.active"${component.active ? ' checked' : ''}> wirkt</label><label class="creature-field"><span>Name</span><input data-creature-profile-path="aura.${key}.name" value="${escapeHtml(component.name)}"></label><label class="creature-field"><span>Radius</span><input data-creature-profile-path="aura.${key}.radius" value="${escapeHtml(component.radius)}"></label></div><textarea class="creature-textarea" rows="3" data-creature-profile-path="aura.${key}.description" placeholder="Wirkung und Wahrnehmung">${escapeHtml(component.description)}</textarea><div class="creature-aura-mechanics">${renderCreatureAuraMechanics(`aura.${key}.selfMechanics`, 'Träger', component.selfMechanics)}${renderCreatureAuraMechanics(`aura.${key}.allyMechanics`, 'Verbündete', component.allyMechanics)}${renderCreatureAuraMechanics(`aura.${key}.enemyMechanics`, 'Gegner', component.enemyMechanics)}</div></details>`; }).join('')}</div>
  </section>`;
}

function renderCreatureMagic(profile) {
  const spellSlots = getOrderedSpellSlotResources(profile.resources, profile.magic.slotResourceIds);
  return `<section class="creature-sheet-section creature-magic-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>M</span> Magie & Zauberformeln</div><div><label class="creature-active-toggle"><input type="checkbox" data-creature-profile-path="magic.enabled"${profile.magic.enabled ? ' checked' : ''}> Magie aktiv</label><button type="button" data-creature-action="add-spell">+ Zauber</button></div></div>
    ${spellSlots.length ? `<div class="creature-spell-slot-grid">${spellSlots.map(resource => `<label data-creature-resource-id="${escapeHtml(resource.id)}"><span>${escapeHtml(getSpellLevelLabel(getSpellSlotLevel(resource)))}</span><div><input type="number" min="0" max="9999" data-resource-field="current" value="${resource.current}" aria-label="${escapeHtml(resource.name)} aktuell"><i>/</i><input type="number" min="0" max="9999" data-resource-field="maximum" value="${resource.maximum}" aria-label="${escapeHtml(resource.name)} maximum"></div></label>`).join('')}</div>` : ''}
    <div class="creature-spell-list">${profile.magic.spells.map((spell, index) => `<div data-spell-index="${index}"><input data-spell-field="name" value="${escapeHtml(spell.name)}" placeholder="Zauber"><select data-spell-field="level" aria-label="Zaubergrad">${renderCreatureSpellLevelOptions(spell.level)}</select><input data-spell-field="rollFormula" value="${escapeHtml(spell.rollFormula)}" placeholder="1d8"><input type="number" min="0" max="999" data-spell-field="manaCost" value="${spell.manaCost}" aria-label="Mana"${spell.level === 0 ? ' disabled title="Zaubertricks verbrauchen kein Mana"' : ''}><select data-spell-field="presentationKind"><option value="spell"${spell.presentationKind === 'spell' ? ' selected' : ''}>Zauberformel</option><option value="prayer"${spell.presentationKind === 'prayer' ? ' selected' : ''}>Gebet</option><option value="song"${spell.presentationKind === 'song' ? ' selected' : ''}>Gesang</option></select><select data-spell-field="resolutionType"><option value="spell-attack"${spell.resolutionType === 'spell-attack' ? ' selected' : ''}>Zauberangriff</option><option value="saving-throw"${spell.resolutionType === 'saving-throw' ? ' selected' : ''}>Zauber-SG</option><option value="automatic"${spell.resolutionType === 'automatic' ? ' selected' : ''}>Automatisch</option></select><button type="button" data-creature-action="edit-detail" data-collection="magic.spells" data-entry-kind="spell" data-item-id="${escapeHtml(spell.id)}">Regeln</button><button type="button" class="creature-row-remove" data-creature-action="remove-spell" data-index="${index}">×</button><textarea rows="2" data-spell-field="description" placeholder="Wirkung">${escapeHtml(spell.description)}</textarea></div>`).join('') || '<div class="creature-table-empty">Noch keine Zauberformel.</div>'}</div>
  </section>`;
}

function renderSkillsAndSaves(profile) {
  return `<section class="creature-sheet-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>7</span> Rettungswürfe / Fertigkeiten</div><button type="button" data-creature-action="add-skill">+ Fertigkeit</button></div>
    <div class="creature-save-grid">${COMBAT_ATTRIBUTE_DEFINITIONS.map(definition => {
      const save = profile.savingThrows.find(item => item.attributeKey === definition.key);
      const total = getSavingThrowTotal(profile, definition.key);
      return `<label><input type="checkbox" data-save-key="${definition.key}"${save?.proficient ? ' checked' : ''}><span>${definition.shortLabel}</span><b>${total >= 0 ? '+' : ''}${total}</b></label>`;
    }).join('')}</div>
    <div class="creature-skill-list">${profile.skills.map((skill, index) => `<div data-skill-index="${index}">
      <input data-skill-field="name" value="${escapeHtml(skill.name)}" placeholder="Wahrnehmung">
      <select data-skill-field="attributeKey">${ATTRIBUTE_OPTIONS.replace(`value="${skill.attributeKey}"`, `value="${skill.attributeKey}" selected`)}</select>
      <select data-skill-field="proficiency"><option value="none"${skill.proficiency === 'none' ? ' selected' : ''}>Ungeübt</option><option value="trained"${skill.proficiency === 'trained' ? ' selected' : ''}>Trainiert</option><option value="expertise"${skill.proficiency === 'expertise' ? ' selected' : ''}>Expertise</option></select>
      <b>${getSkillTotal(profile, skill) >= 0 ? '+' : ''}${getSkillTotal(profile, skill)}</b>
      <button type="button" class="creature-row-remove" data-creature-action="remove-skill" data-index="${index}">×</button>
    </div>`).join('')}</div>
  </section>`;
}

function renderConditions(profile) {
  return `<section class="creature-sheet-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>8</span> Zustände / besondere Effekte</div><button type="button" data-creature-action="add-condition">+ Zustand</button></div>
    <div class="creature-compact-list">${profile.conditions.map((condition, index) => `<div class="creature-condition-row" data-condition-index="${index}">
      <input data-condition-field="name" value="${escapeHtml(condition.name)}" placeholder="Verwundbar gegen Feuer">
      <input data-condition-field="duration" value="${escapeHtml(condition.duration)}" placeholder="Dauer">
      <textarea rows="2" data-condition-field="description" placeholder="Auswirkung">${escapeHtml(condition.description)}</textarea>
      <label class="creature-active-toggle"><input type="checkbox" data-condition-field="active"${condition.active ? ' checked' : ''}> aktiv</label>
      <button type="button" class="creature-row-remove" data-creature-action="remove-condition" data-index="${index}">×</button>
    </div>`).join('') || '<div class="creature-table-empty">Keine Zustände eingetragen.</div>'}</div>
  </section>`;
}

function renderLoot(creature) {
  return `<section class="creature-sheet-section creature-loot-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>☒</span> Lootbox · mögliche Beute</div><button type="button" data-creature-action="add-loot">+ Beute</button></div>
    <div class="creature-loot-meta">
      ${renderField('Münzen / Währung', 'loot.currency', creature.loot.currency, { placeholder: '12 Silber, 2 Gold …' })}
      <label class="creature-field"><span>Loot-Notiz</span><input data-creature-field="loot.notes" value="${escapeHtml(creature.loot.notes)}" placeholder="Besondere Bergungsregel …"></label>
    </div>
    <div class="creature-loot-list">${creature.loot.items.map((item, index) => `<div data-loot-index="${index}">
      <input data-loot-field="name" value="${escapeHtml(item.name)}" placeholder="Gegenstand">
      <label><span>Anzahl</span><input type="number" min="0" max="9999" data-loot-field="quantity" value="${item.quantity}"></label>
      <label><span>Chance %</span><input type="number" min="0" max="100" data-loot-field="chance" value="${item.chance}"></label>
      <input data-loot-field="notes" value="${escapeHtml(item.notes)}" placeholder="Qualität / Fundort">
      <button type="button" class="creature-row-remove" data-creature-action="remove-loot" data-index="${index}">×</button>
    </div>`).join('') || '<div class="creature-table-empty">Die Lootbox ist leer.</div>'}</div>
  </section>`;
}

function readNumber(element, fallback = 0) {
  const parsed = Number(element?.value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function collectDraftFromForm() {
  if (!state.draft) return null;
  const next = clone(state.draft);
  const root = document.getElementById('creature-sheet-root');
  next.biography = collectCreatureBiography(root, next.biography);
  root.querySelectorAll('[data-creature-field]').forEach(element => {
    const path = element.dataset.creatureField;
    const value = element.type === 'number' ? readNumber(element) : element.value;
    if (path === 'loot.currency') next.loot.currency = value;
    else if (path === 'loot.notes') next.loot.notes = value;
    else next[path] = value;
  });
  const profile = clone(next.combatProfile);
  root.querySelectorAll('[data-creature-profile-path]').forEach(element => {
    const value = element.type === 'checkbox' ? element.checked : (element.type === 'number' ? readNumber(element) : element.value);
    setAtPath(profile, element.dataset.creatureProfilePath, value);
  });
  profile.progression.level = Math.min(20, Math.max(1, readNumber(root.querySelector('[data-creature-field="level"]'), next.level)));
  profile.progression.specialLevels = Math.max(0, Math.min(10, next.level - 20));
  const currentHp = readNumber(root.querySelector('[data-combat-field="hp-current"]'), 0);
  const maximumHp = readNumber(root.querySelector('[data-combat-field="hp-maximum"]'), getMaximumHitPoints(profile));
  const armorClass = readNumber(root.querySelector('[data-combat-field="armor-class"]'), getArmorClass(profile));
  if (currentHp !== (profile.hitPoints.current ?? getMaximumHitPoints(profile))) profile.hitPoints.current = currentHp;
  if (maximumHp !== getMaximumHitPoints(profile)) profile.hitPoints.maximumOverride = maximumHp;
  if (armorClass !== getArmorClass(profile)) profile.armorClass.override = armorClass;
  profile.combat.movement = readNumber(root.querySelector('[data-combat-field="movement"]'), 9);
  const enteredProficiency = readNumber(root.querySelector('[data-combat-field="proficiency"]'), getProficiencyBonus(profile));
  if (enteredProficiency !== getProficiencyBonus(profile)) profile.progression.proficiencyBonusOverride = enteredProficiency;
  profile.combat.passivePerceptionBonus = readNumber(root.querySelector('[data-combat-field="passive-perception"]'), 0);
  root.querySelectorAll('[data-attribute-key]').forEach(element => {
    const attribute = profile.attributes.find(item => item.key === element.dataset.attributeKey);
    if (attribute) attribute.score = readNumber(element, 10);
  });
  root.querySelectorAll('[data-save-key]').forEach(element => {
    const save = profile.savingThrows.find(item => item.attributeKey === element.dataset.saveKey);
    if (save) save.proficient = element.checked;
  });
  root.querySelectorAll('[data-creature-resource-id]').forEach(row => {
    const resource = profile.resources.find(item => item.id === row.dataset.creatureResourceId);
    if (!resource) return;
    resource.current = readNumber(row.querySelector('[data-resource-field="current"]'), resource.current);
    resource.maximum = readNumber(row.querySelector('[data-resource-field="maximum"]'), resource.maximum);
  });
  profile.weapons = Array.from(root.querySelectorAll('[data-attack-index]')).map((row, index) => ({
    ...(profile.weapons[index] || {}),
    id: profile.weapons[index]?.id || makeId('attack'),
    name: row.querySelector('[data-attack-field="name"]')?.value || '',
    weaponType: row.querySelector('[data-attack-field="weaponType"]')?.value || 'natural',
    training: row.querySelector('[data-attack-field="training"]')?.value || 'simple',
    attackAttribute: row.querySelector('[data-attack-field="attackAttribute"]')?.value || 'strength',
    damageFormula: row.querySelector('[data-attack-field="damageFormula"]')?.value || '',
    damageType: row.querySelector('[data-attack-field="damageType"]')?.value || '',
    range: row.querySelector('[data-attack-field="range"]')?.value || '',
    notes: row.querySelector('[data-attack-field="notes"]')?.value || '',
    equipped: profile.weapons[index]?.equipped ?? index === 0,
    proficient: profile.weapons[index]?.proficient ?? true
  }));
  const abilityRows = Array.from(root.querySelectorAll('[data-ability-index]'));
  if (abilityRows.length) profile.abilities = abilityRows.map((row, index) => ({
    ...(profile.abilities[index] || {}), id: profile.abilities[index]?.id || makeId('ability'),
    name: row.querySelector('[data-ability-field="name"]')?.value || '',
    description: row.querySelector('[data-ability-field="description"]')?.value || '', active: true
  }));
  const spellRows = Array.from(root.querySelectorAll('[data-spell-index]'));
  profile.magic.spells = spellRows.map((row, index) => {
    const existing = profile.magic.spells[index] || {};
    const level = Math.max(0, Math.min(10, readNumber(row.querySelector('[data-spell-field="level"]'), existing.level || 0)));
    return {
      ...existing,
      id: existing.id || makeId('spell'),
      name: row.querySelector('[data-spell-field="name"]')?.value || '',
      level,
      rollFormula: row.querySelector('[data-spell-field="rollFormula"]')?.value || '',
      manaCost: level === 0 ? 0 : readNumber(row.querySelector('[data-spell-field="manaCost"]'), 0),
      slotResourceId: level === 0 ? '' : findSpellSlotResourceId(profile.resources, level),
      slotCost: level === 0 ? 0 : Math.max(1, Number(existing.slotCost) || 1),
      presentationKind: row.querySelector('[data-spell-field="presentationKind"]')?.value || 'spell',
      resolutionType: row.querySelector('[data-spell-field="resolutionType"]')?.value || 'spell-attack',
      description: row.querySelector('[data-spell-field="description"]')?.value || '',
      prepared: true
    };
  });
  profile.skills = Array.from(root.querySelectorAll('[data-skill-index]')).map((row, index) => ({
    ...(profile.skills[index] || {}), id: profile.skills[index]?.id || makeId('skill'),
    name: row.querySelector('[data-skill-field="name"]')?.value || '',
    attributeKey: row.querySelector('[data-skill-field="attributeKey"]')?.value || 'dexterity',
    proficiency: row.querySelector('[data-skill-field="proficiency"]')?.value || 'none'
  }));
  profile.conditions = Array.from(root.querySelectorAll('[data-condition-index]')).map((row, index) => ({
    ...(profile.conditions[index] || {}), id: profile.conditions[index]?.id || makeId('condition'),
    name: row.querySelector('[data-condition-field="name"]')?.value || '',
    duration: row.querySelector('[data-condition-field="duration"]')?.value || '',
    description: row.querySelector('[data-condition-field="description"]')?.value || '',
    active: !!row.querySelector('[data-condition-field="active"]')?.checked
  }));
  next.loot.items = Array.from(root.querySelectorAll('[data-loot-index]')).map((row, index) => ({
    ...(next.loot.items[index] || {}), id: next.loot.items[index]?.id || makeId('loot'),
    name: row.querySelector('[data-loot-field="name"]')?.value || '',
    quantity: readNumber(row.querySelector('[data-loot-field="quantity"]'), 1),
    chance: readNumber(row.querySelector('[data-loot-field="chance"]'), 100),
    notes: row.querySelector('[data-loot-field="notes"]')?.value || ''
  }));
  collectCreatureImages(document.getElementById('creature-sheet-root'), next);
  next.combatProfile = profile;
  state.draft = sanitizeCreature(next);
  return state.draft;
}

function openSheet(id = '') {
  biographyEditor.reset();
  state.session += 1;
  state.activePage = id ? 'overview' : 'profile';
  mediaEditor.reset();
  state.editingId = String(id || '');
  const source = state.editingId ? state.creatures.find(item => item.id === state.editingId) : null;
  state.draft = source ? clone(source) : createCreatureDraft();
  // Schnappschuss des beim Öffnen geladenen Kampfprofils/Loots - siehe Speichersystem-Checkup bei
  // Charakteren. Ohne Baseline (neue Kreatur) gilt beim Speichern automatisch alles als geändert.
  state.draftLoadedSnapshot = source ? { combatProfile: clone(source).combatProfile, loot: clone(source).loot, biography: clone(source).biography } : null;
  renderSheet();
  setStatus(isBuiltinCreatureId(state.editingId)
    ? 'Versionierte Grundvorlage. Duplizieren erzeugt eine eigene Online-Instanz; Speichern legt eine Online-Fassung dieser Vorlage an.'
    : (state.editingId ? 'Online gespeicherte Kreatur.' : 'Neue, noch nicht gespeicherte Kreatur.'));
  const overlay = getOverlay();
  overlay?.classList.add('open');
  overlay?.setAttribute('aria-hidden', 'false');
  overlay?.focus({ preventScroll: true });
  document.body.classList.add('creature-profile-open');
}

function closeSheet() {
  if (state.draft) {
    const previousImages = JSON.stringify(normalizeCreatureImages(state.draft));
    collectCreatureImages(document.getElementById('creature-sheet-root'), state.draft);
    if (JSON.stringify(normalizeCreatureImages(state.draft)) !== previousImages) scheduleCreatureImages();
  }
  state.session += 1;
  mediaEditor.reset();
  void imageAutosave.flush();
  const overlay = getOverlay();
  overlay?.classList.remove('open');
  overlay?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('creature-profile-open');
  state.editingId = '';
  state.draft = null;
}

async function saveCurrent() {
  if (state.saving) return;
  const creature = collectDraftFromForm();
  if (!creature?.name) {
    setStatus('Bitte gib der Kreatur einen Namen.', 'error');
    return;
  }
  const session = state.session;
  const editingId = state.editingId;
  const baseline = clone(state.draftLoadedSnapshot);
  state.saving = true;
  state.pendingImages = false;
  try {
    await imageAutosave.flush(editingId);
    setStatus('Wird dauerhaft online gespeichert …');
    const backend = await ensureBackend();
    const now = new Date().toISOString();
    const data = { ...creature, createdAt: creature.createdAt || now, updatedAt: now };
    delete data.id;
    // Kampfprofil/Loot nur mitschicken, wenn sie sich seit dem Öffnen des Bogens wirklich
    // geändert haben - sonst würde jede Kleinigkeit (z. B. eine Notiz) das komplette, evtl.
    // veraltete Kampfprofil zurückschreiben. Siehe character-save-guard.js/selectChangedSections.
    const changedSections = new Set(selectChangedSections(data, baseline, ['combatProfile', 'loot', 'biography']));
    if (baseline && !changedSections.has('combatProfile')) delete data.combatProfile;
    if (baseline && !changedSections.has('loot')) delete data.loot;
    if (baseline && !changedSections.has('biography')) delete data.biography;
    const persisted = await backend.saveCreature(editingId || null, data, { returnRecord: true });
    const id = persisted.id;
    const previous = state.creatures.find(item => item.id === id) || {};
    const saved = sanitizeCreature({ ...previous, ...persisted, id });
    const index = state.creatures.findIndex(item => item.id === id);
    if (index >= 0) state.creatures[index] = saved;
    else state.creatures.push(saved);
    state.creatures.sort((a, b) => a.name.localeCompare(b.name, 'de'));
    if (state.session === session && state.draft) {
      collectDraftFromForm();
      state.editingId = id;
      state.draft.id = id;
      state.draft.createdAt = saved.createdAt;
      for (const field of ['combatProfile', 'loot', 'biography']) {
        if (JSON.stringify(state.draft[field]) === JSON.stringify(creature[field])) state.draft[field] = clone(saved[field]);
        else if (Object.hasOwn(data, field)) state.draft[field].revision = saved[field].revision;
      }
      state.draftLoadedSnapshot = { combatProfile: clone(saved.combatProfile), loot: clone(saved.loot), biography: clone(saved.biography) };
      setStatus('Online gespeichert.', 'success');
      renderSheet();
    }
    renderLibrary();
    dispatchChanged();
    try {
      await window.AleriaCharacterArchive?.archiveRecord?.({ ...saved, entityType: 'creature' }, 'creature');
    } catch (archiveError) {
      console.info('Kreatur wurde gespeichert; der Online-Abgleich des Charakterbogen-Archivs folgt später.', archiveError);
      notify('Kreatur gespeichert. Das Charakterbogen-Archiv wurde vorerst lokal ergänzt.', 'info');
    }
    notify(`${creature.name} wurde gespeichert.`, 'success');
  } catch (error) {
    console.error('save creature failed:', error);
    if (state.session === session) setStatus(error?.message || 'Kreatur konnte nicht gespeichert werden.', 'error');
  } finally {
    state.saving = false;
    if (state.pendingImages) { state.pendingImages = false; scheduleCreatureImages(); }
  }
}

async function duplicateCreature(id) {
  const source = state.creatures.find(item => item.id === id);
  if (!source) return;
  try {
    const duplicate = createCreatureDuplicate(source, state.creatures);
    const backend = await ensureBackend();
    const now = new Date().toISOString();
    const data = { ...duplicate, createdAt: now, updatedAt: now };
    const savedId = await backend.saveCreature(null, data);
    const saved = sanitizeCreature({ id: savedId, ...data });
    state.creatures.push(saved);
    state.creatures.sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }));
    renderLibrary();
    dispatchChanged();
    notify(`${saved.name} wurde als eigene Szenen-Instanz angelegt.`, 'success');
  } catch (error) {
    console.error('duplicate creature failed:', error);
    notify(error?.message || 'Kreatur konnte nicht dupliziert werden.', 'error');
  }
}

async function deleteCurrent() {
  if (!state.editingId || !state.draft) return;
  if (!confirm(`„${state.draft.name}“ dauerhaft aus dem Kreaturenregister löschen?`)) return;
  try {
    const backend = await ensureBackend();
    imageAutosave.cancel(state.editingId);
    await imageAutosave.flush(state.editingId);
    await backend.deleteCreature(state.editingId);
    state.creatures = state.creatures.filter(item => item.id !== state.editingId);
    closeSheet();
    renderLibrary();
    dispatchChanged();
    notify('Kreatur wurde gelöscht.', 'success');
  } catch (error) {
    setStatus(error?.message || 'Kreatur konnte nicht gelöscht werden.', 'error');
  }
}

function exportOne(id) {
  const creature = id ? state.creatures.find(item => item.id === id) : collectDraftFromForm();
  if (!creature) return;
  downloadJson(makeCreatureExportPayload(creature), `${slugify(creature.name)}-kreatur.json`);
}

function exportArchive() {
  downloadJson({
    type: CREATURE_ARCHIVE_EXPORT_TYPE,
    version: CREATURE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    creatures: state.creatures.map(sanitizeCreature)
  }, `aleria-kreaturen-${new Date().toISOString().slice(0, 10)}.json`);
}

function chooseJsonFile(onPayload) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      onPayload(JSON.parse(await file.text()));
    } catch (error) {
      notify(error?.message || 'Die JSON-Datei konnte nicht gelesen werden.', 'error');
    }
  }, { once: true });
  input.click();
}

function importCurrent() {
  chooseJsonFile(payload => {
    try {
      const imported = normalizeCreatureImportPayload(payload);
      if (imported.length !== 1) throw new Error('Bitte wähle für den geöffneten Bogen genau eine Kreatur aus.');
      const preservedId = state.editingId;
      mediaEditor.reset();
      state.draft = { ...imported[0], id: preservedId || undefined };
      renderSheet();
      setStatus('Importiert. Mit „Online speichern“ dauerhaft übernehmen.', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  });
}

function importArchive() {
  chooseJsonFile(async payload => {
    try {
      const imported = normalizeCreatureImportPayload(payload);
      if (!imported.length) throw new Error('Die Datei enthält keine Kreaturen.');
      if (!confirm(`${imported.length} Kreatur(en) online importieren? Gleiche IDs werden aktualisiert.`)) return;
      const backend = await ensureBackend();
      for (const creature of imported) {
        const data = { ...creature, updatedAt: new Date().toISOString() };
        const id = data.id || null;
        delete data.id;
        // Ein bewusster Import setzt sich immer durch (der Bestätigungsdialog oben ist die
        // Freigabe dafür) - siehe die gleiche Begründung bei importCharacterArchivePayload().
        await backend.saveCreature(id, data, { forceOverwrite: true });
      }
      await loadCreatures({ force: true });
      notify(`${imported.length} Kreatur(en) importiert.`, 'success');
    } catch (error) {
      notify(error?.message || 'Kreaturen konnten nicht importiert werden.', 'error');
    }
  });
}

function addRow(kind) {
  collectDraftFromForm();
  const profile = state.draft.combatProfile;
  if (kind === 'attack') { const id = makeId('attack'); profile.weapons.push({ id, name: '', weaponType: 'natural', training: 'simple', damageFormula: '', damageType: 'physisch', attackAttribute: 'strength', proficient: true, range: 'Nahkampf', activationType: 'action', costs: [{ id: `${id}-cost`, resourceId: 'action', name: 'Aktion', amount: 1, scope: 'comment' }], auraBypass: { allowed: true, cost: 1 }, equipped: profile.weapons.length === 0 }); }
  if (kind === 'ability') profile.abilities.push({ id: makeId('ability'), name: '', description: '', active: true });
  if (kind === 'spell') profile.magic.spells.push({ id: makeId('spell'), name: '', level: 0, rollFormula: '', manaCost: 0, slotResourceId: '', slotCost: 0, presentationKind: 'spell', resolutionType: 'spell-attack', activationType: 'action', damageType: 'Magie', prepared: true, description: '' });
  if (kind === 'skill') profile.skills.push({ id: makeId('skill'), name: '', attributeKey: 'dexterity', proficiency: 'trained', bonus: 0 });
  if (kind === 'condition') profile.conditions.push({ id: makeId('condition'), name: '', duration: '', description: '', active: true });
  if (kind === 'loot') state.draft.loot.items.push({ id: makeId('loot'), name: '', quantity: 1, chance: 100, notes: '' });
  renderSheet();
}

function getCreatureArchiveTarget(kind) {
  return ({
    attack: { archiveKind: 'attack', collection: 'weapons' },
    ability: { archiveKind: 'ability', collection: 'abilities' },
    spell: { archiveKind: 'spell', collection: 'magic.spells' },
    skill: { archiveKind: 'skill', collection: 'skills' },
    condition: { archiveKind: 'condition', collection: 'conditions' }
  })[kind] || null;
}

function addCreatureRowFromArchive(kind) {
  const target = getCreatureArchiveTarget(kind);
  const archive = window.AleriaCharacterArchive;
  if (!target || !archive?.openPicker) {
    addRow(kind);
    return;
  }
  collectDraftFromForm();
  archive.openPicker({
    kind: target.archiveKind,
    onSelect(entry) {
      const collection = getAtPath(state.draft.combatProfile, target.collection);
      const item = archive.createProfileItem?.(entry, target.collection) || entry?.data;
      if (Array.isArray(collection) && item) collection.push(item);
      state.draft.combatProfile = sanitizeCharacterCombatProfile(state.draft.combatProfile, { ensureRequiredSkills: false, ensureSpellSlots: false });
      renderSheet();
      setStatus('Archiveintrag in den Entwurf übernommen. Online speichern nicht vergessen.', 'success');
    },
    onCreate: () => addRow(kind)
  });
}

function createCreatureDetailItem(collection, defaultActivation = '') {
  const id = makeId(collection === 'quirks' ? 'quirk' : (collection === 'abilities' ? 'ability' : 'technique'));
  if (collection === 'quirks') return { id, name: '', type: 'quirk', description: '', appliesWhen: '', trigger: '', target: 'Selbst', duration: '', stacking: 'normal', tags: '', limitations: '', aiInstructions: '', priority: 0, active: true, mechanics: {} };
  const activationType = defaultActivation || 'action';
  const resource = state.draft.combatProfile.resources.find(item => item.id === activationType);
  const costs = activationType === 'passive' ? [] : [{ id: `${id}-cost`, resourceId: activationType, name: resource?.name || activationType, amount: 1, scope: resource?.scope || 'comment' }];
  if (collection === 'abilities') return { id, name: '', description: '', usesCurrent: 0, usesMaximum: 0, recovery: 'none', rollFormula: '', damageType: 'physisch', activationType, delivery: 'ability', combatUsable: false, target: '', range: '', duration: '', requirements: '', tags: '', aiInstructions: '', costs, auraBypass: { allowed: true, cost: 1 }, active: true, mechanics: {} };
  return { id, name: '', category: 'technique', description: '', effect: '', activationType, weaponTypes: [], damageFormula: '', damageType: '', attackBonus: 0, damageBonus: 0, rollMode: 'normal', range: '', target: '', duration: '', requirements: '', tags: '', aiInstructions: '', costs, auraBypass: { allowed: true, cost: 1 }, active: true, mechanics: {} };
}

function openCreatureDetailEditor(trigger) {
  collectDraftFromForm();
  const collection = trigger.dataset.collection;
  const kind = trigger.dataset.entryKind;
  const itemId = trigger.dataset.itemId || '';
  const items = getAtPath(state.draft.combatProfile, collection);
  if (!Array.isArray(items)) return;
  const existing = items.find(item => item.id === itemId);
  const item = existing ? clone(existing) : createCreatureDetailItem(collection, trigger.dataset.defaultActivation || '');
  openCombatEntryEditor({
    kind,
    item,
    theme: 'parchment',
    resources: state.draft.combatProfile.resources,
    weapons: state.draft.combatProfile.weapons,
    onSave: updated => {
      const index = items.findIndex(entry => entry.id === updated.id);
      if (index >= 0) items[index] = updated;
      else items.push(updated);
      state.draft.combatProfile = sanitizeCharacterCombatProfile(state.draft.combatProfile, { ensureRequiredSkills: false, ensureSpellSlots: false });
      renderSheet();
      setStatus('Kampfprofil-Eintrag in den Entwurf übernommen. Online speichern nicht vergessen.', 'success');
    }
  });
}

function openCreatureDetailPicker(trigger) {
  const archiveKind = trigger.dataset.entryKind === 'quirk' ? 'trait' : trigger.dataset.entryKind;
  const archive = window.AleriaCharacterArchive;
  if (!archive?.openPicker) {
    openCreatureDetailEditor(trigger);
    return;
  }
  collectDraftFromForm();
  archive.openPicker({
    kind: archiveKind,
    onSelect(entry) {
      const collectionPath = trigger.dataset.collection;
      const items = getAtPath(state.draft.combatProfile, collectionPath);
      const item = archive.createProfileItem?.(entry, collectionPath) || entry?.data;
      if (Array.isArray(items) && item) items.push(item);
      state.draft.combatProfile = sanitizeCharacterCombatProfile(state.draft.combatProfile, { ensureRequiredSkills: false, ensureSpellSlots: false });
      renderSheet();
      setStatus('Archiveintrag in den Entwurf übernommen. Online speichern nicht vergessen.', 'success');
    },
    onCreate: () => openCreatureDetailEditor(trigger)
  });
}

function removeCreatureDetail(collection, itemId) {
  collectDraftFromForm();
  const items = state.draft.combatProfile[collection];
  if (!Array.isArray(items)) return;
  const index = items.findIndex(item => item.id === itemId);
  if (index >= 0) items.splice(index, 1);
  renderSheet();
}

function removeRow(kind, index) {
  collectDraftFromForm();
  const mapping = { attack: state.draft.combatProfile.weapons, ability: state.draft.combatProfile.abilities, spell: state.draft.combatProfile.magic.spells, skill: state.draft.combatProfile.skills, condition: state.draft.combatProfile.conditions, loot: state.draft.loot.items };
  mapping[kind]?.splice(index, 1);
  renderSheet();
}

function handleClick(event) {
  if (biographyEditor.handleClick(event)) return;
  const page = event.target.closest('[data-creature-page]');
  if (page) { switchCreaturePage(page.dataset.creaturePage); return; }
  mediaEditor.handleClick(event);
  const trigger = event.target.closest('[data-creature-action]');
  if (!trigger) return;
  const action = trigger.dataset.creatureAction;
  const id = trigger.dataset.creatureId || '';
  if (action === 'new') openSheet();
  else if (action === 'open') openSheet(id);
  else if (action === 'close') closeSheet();
  else if (action === 'save') saveCurrent();
  else if (action === 'delete') deleteCurrent();
  else if (action === 'duplicate') duplicateCreature(id);
  else if (action === 'export-one') exportOne(id);
  else if (action === 'export-current') exportOne('');
  else if (action === 'export-archive') exportArchive();
  else if (action === 'import-current') importCurrent();
  else if (action === 'import-archive') importArchive();
  else if (action === 'add-detail') openCreatureDetailPicker(trigger);
  else if (action === 'edit-detail') openCreatureDetailEditor(trigger);
  else if (action === 'remove-detail') removeCreatureDetail(trigger.dataset.collection, trigger.dataset.itemId);
  else if (action === 'add-spell') addCreatureRowFromArchive('spell');
  else if (action === 'remove-spell') removeRow('spell', Number(trigger.dataset.index));
  else if (action.startsWith('add-')) addCreatureRowFromArchive(action.slice(4));
  else if (action.startsWith('remove-')) removeRow(action.slice(7), Number(trigger.dataset.index));
}

function handleInput(event) {
  biographyEditor.handleInput(event);
  mediaEditor.handleInput(event);
  if (!event.target.closest('#creature-sheet-root')) return;
  if (event.type === 'change' && (event.target.matches('[data-attribute-key], [data-combat-field], [data-save-key], [data-creature-field="level"]'))) {
    collectDraftFromForm();
    renderSheet();
  }
}

function handleKeydown(event) {
  const page = creaturePageFromKey(event);
  if (page) { switchCreaturePage(page); document.getElementById(`creature-tab-${page}`)?.focus(); return; }
  if (event.key === 'Escape' && getOverlay()?.classList.contains('open') && getOverlay().contains(event.target)) closeSheet();
}

function handleCommittedCreatureCombatProfile(event) {
  const updates = Array.isArray(event?.detail?.updates) ? event.detail.updates : [];
  let changed = false;
  updates.filter(update => update?.kind === 'creature').forEach(update => {
    const index = state.creatures.findIndex(creature => String(creature.id || '') === String(update.recordId || ''));
    if (index < 0) return;
    const currentCombatProfile = state.creatures[index].combatProfile || {};
    state.creatures[index] = sanitizeCreature({
      ...state.creatures[index],
      combatProfile: {
        ...currentCombatProfile,
        hitPoints: update.hitPoints ? {
          ...(currentCombatProfile.hitPoints || {}),
          current: Math.max(0, Number(update.hitPoints?.current) || 0),
          temporary: Math.max(0, Number(update.hitPoints?.temporary) || 0)
        } : currentCombatProfile.hitPoints,
        resources: Array.isArray(update.resources)
          ? update.resources.map(resource => ({ ...resource }))
          : (currentCombatProfile.resources || []),
        abilities: Array.isArray(update.abilities)
          ? update.abilities.map(ability => ({ ...ability }))
          : (currentCombatProfile.abilities || [])
      }
    });
    changed = true;
  });
  if (!changed) return;
  renderLibrary();
  dispatchChanged();
}

export async function loadCreatures(options = {}) {
  if (state.loading || (state.loaded && !options.force)) {
    renderLibrary();
    return state.creatures;
  }
  state.loading = true;
  renderLibrary();
  try {
    const backend = await ensureBackend();
    state.creatures = mergeCreatureCatalog(await backend.loadCreatures());
    state.loaded = true;
    dispatchChanged();
  } catch (error) {
    console.error('load creatures failed:', error);
    state.creatures = mergeCreatureCatalog([]);
    state.loaded = true;
    dispatchChanged();
    notify(error?.message || 'Kreaturen konnten nicht geladen werden.', 'error');
  } finally {
    state.loading = false;
    renderLibrary();
  }
  return state.creatures;
}

export function getSceneActors() {
  return state.creatures.map(makeCreatureSceneActor);
}

function mount() {
  renderLibrary();
  loadCreatures();
}

document.addEventListener('click', handleClick);
document.addEventListener('input', handleInput);
document.addEventListener('change', handleInput);
document.addEventListener('keydown', handleKeydown);
['dragover', 'dragleave', 'drop'].forEach(type => document.addEventListener(type, mediaEditor.handleDrag));
document.addEventListener('aleria:combat-profile-committed', handleCommittedCreatureCombatProfile);
document.addEventListener('aleria:item-register-records', event => {
  if (!event.detail?.creaturesReady) return;
  const next = mergeCreatureCatalog(event.detail.creatures || []);
  if (JSON.stringify(next) === JSON.stringify(state.creatures)) return;
  state.creatures = next;
  state.loaded = true;
  renderLibrary();
  dispatchChanged();
});
window.addEventListener('fb-ready', () => loadCreatures({ force: true }));

window.AleriaCreatures = Object.freeze({
  mount,
  reload: () => loadCreatures({ force: true }),
  getAll: () => state.creatures.map(clone),
  getById: id => clone(state.creatures.find(item => item.id === id) || null),
  getSceneActors,
  open: openSheet,
  duplicate: duplicateCreature,
  materializeBuiltin: materializeBuiltinCreature
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
