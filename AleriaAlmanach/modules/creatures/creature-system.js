import {
  COMBAT_ATTRIBUTE_DEFINITIONS,
  getArmorClass,
  getAttributeModifier,
  getMaximumHitPoints,
  getPassivePerception,
  getProficiencyBonus,
  getSavingThrowTotal,
  getSkillTotal,
  getWeaponAttackModifier,
  sanitizeCharacterCombatProfile
} from '../combat/combat-profile-model.js?v=20260802-combat-sheet-v4';
import {
  CREATURE_ARCHIVE_EXPORT_TYPE,
  CREATURE_SCHEMA_VERSION,
  MAX_CREATURE_AVATARS,
  createCreatureDraft,
  createCreatureDuplicate,
  makeCreatureSceneActor,
  makeCreatureExportPayload,
  normalizeCreatureImportPayload,
  sanitizeCreature
} from './creature-model.js?v=20260802-creatures-v3';
import {
  CREATURE_LEVEL_GUIDELINES,
  getBuiltinCreatureTemplates,
  isBuiltinCreatureId
} from './creature-catalog.js?v=20260802-brandhof-combat-v1';

const state = {
  creatures: getBuiltinCreatureTemplates(),
  loaded: false,
  loading: false,
  editingId: '',
  draft: null
};

const SIZE_OPTIONS = ['Winzig', 'Klein', 'Mittel', 'Groß', 'Riesig', 'Gigantisch'];
const ATTRIBUTE_OPTIONS = COMBAT_ATTRIBUTE_DEFINITIONS.map(item => `<option value="${item.key}">${item.label}</option>`).join('');

function mergeCreatureCatalog(storedCreatures = []) {
  const byId = new Map(getBuiltinCreatureTemplates().map(creature => [creature.id, creature]));
  (Array.isArray(storedCreatures) ? storedCreatures : []).map(sanitizeCreature).forEach(creature => {
    byId.set(creature.id, creature);
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

function dispatchChanged() {
  document.dispatchEvent(new CustomEvent('aleria:creatures-changed', {
    detail: { creatures: getSceneActors() }
  }));
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
  const profile = sanitizeCharacterCombatProfile(creature.combatProfile);
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
          ${portrait ? `<img src="${escapeHtml(portrait)}" alt="" loading="lazy" decoding="async">` : '<span class="creature-card-sigil">☠</span>'}
          <span class="creature-card-badge">${escapeHtml(instanceLabel)}</span>
        </span>
        <span class="creature-card-body">
          <strong>${escapeHtml(creature.name)}</strong>
          <small>${escapeHtml([creature.type, creature.species].filter(Boolean).join(' · ') || 'Kreatur')}</small>
          <span class="creature-card-stats"><b>TP ${hp}</b><b>RK ${ac}</b><b>Stufe ${creature.level}</b></span>
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
  const portrait = safeImageUrl(creature.portrait);
  const maximumHp = getMaximumHitPoints(profile);
  const armorClass = getArmorClass(profile);
  const proficiency = getProficiencyBonus(profile);
  const passivePerception = getPassivePerception(profile);
  root.innerHTML = `
    <section class="creature-sheet-section creature-identity-section">
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
    <div class="creature-sheet-primary">
      <section class="creature-sheet-section creature-portrait-section">
        <div class="creature-section-title"><span>2</span> Erscheinung</div>
        <div class="creature-portrait-frame">
          ${portrait ? `<img src="${escapeHtml(portrait)}" alt="${escapeHtml(creature.name)}">` : '<div class="creature-portrait-placeholder">☠<small>Portrait-URL eintragen</small></div>'}
        </div>
        ${renderField('Portrait-URL', 'portrait', creature.portrait, { type: 'url' })}
        ${renderField('Bildunterschrift', 'portraitCaption', creature.portraitCaption)}
      </section>
      <div class="creature-sheet-core">
        <section class="creature-sheet-section">
          <div class="creature-section-title"><span>3</span> Abgeleitete Kampfwerte</div>
          <div class="creature-derived-grid">
            <label><span>TP aktuell</span><input type="number" min="0" max="9999" data-combat-field="hp-current" value="${escapeHtml(profile.hitPoints.current ?? maximumHp)}"><b>♥ ${escapeHtml(profile.hitPoints.current ?? maximumHp)} / ${maximumHp}</b></label>
            <label><span>TP maximal</span><input type="number" min="1" max="9999" data-combat-field="hp-maximum" value="${maximumHp}"><b>${maximumHp}</b></label>
            <label><span>Rüstungsklasse</span><input type="number" min="0" max="999" data-combat-field="armor-class" value="${armorClass}"><b>◈ ${armorClass}</b></label>
            <label><span>Bewegung (m)</span><input type="number" min="0" max="999" data-combat-field="movement" value="${profile.combat.movement}"><b>${profile.combat.movement} m</b></label>
            <label><span>Kompetenzbonus</span><input type="number" min="-20" max="30" data-combat-field="proficiency" value="${proficiency}"><b>+${proficiency}</b></label>
            <label><span>Passiv-Bonus</span><input type="number" min="-99" max="99" data-combat-field="passive-perception" value="${profile.combat.passivePerceptionBonus}"><b>${passivePerception}</b></label>
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
    </div>
    ${renderAttacks(profile)}
    <div class="creature-sheet-columns">
      ${renderAbilities(profile)}
      ${renderSkillsAndSaves(profile)}
    </div>
    ${renderConditions(profile)}
    ${renderLoot(creature)}
    <section class="creature-sheet-section">
      <div class="creature-section-title"><span>9</span> Spielleitungsnotizen</div>
      <textarea class="creature-textarea" rows="4" data-creature-field="notes" placeholder="Taktik, Verhalten, Geheimnisse und besondere Regeln …">${escapeHtml(creature.notes)}</textarea>
    </section>
    ${renderAvatars(creature)}`;
  const deleteButton = document.querySelector('[data-creature-action="delete"]');
  if (deleteButton) deleteButton.hidden = !state.editingId || isBuiltinCreatureId(state.editingId);
}

function renderAttacks(profile) {
  return `<section class="creature-sheet-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>5</span> Angriffe</div><button type="button" data-creature-action="add-attack">+ Angriff</button></div>
    <div class="creature-table creature-attacks-table">
      <div class="creature-table-head"><span>Name</span><span>Attribut</span><span>Schaden</span><span>Art / Reichweite</span><span>Effekt</span><span></span></div>
      ${profile.weapons.map((weapon, index) => `<div class="creature-table-row" data-attack-index="${index}">
        <input data-attack-field="name" value="${escapeHtml(weapon.name)}" placeholder="Biss">
        <select data-attack-field="attackAttribute">${ATTRIBUTE_OPTIONS.replace(`value="${weapon.attackAttribute}"`, `value="${weapon.attackAttribute}" selected`)}</select>
        <input data-attack-field="damageFormula" value="${escapeHtml(weapon.damageFormula)}" placeholder="1d8+2">
        <div class="creature-stacked-inputs"><input data-attack-field="damageType" value="${escapeHtml(weapon.damageType)}" placeholder="Stich"><input data-attack-field="range" value="${escapeHtml(weapon.range)}" placeholder="Nahkampf"></div>
        <textarea rows="2" data-attack-field="notes" placeholder="Effekt / Besonderheit">${escapeHtml(weapon.notes || weapon.properties)}</textarea>
        <button type="button" class="creature-row-remove" data-creature-action="remove-attack" data-index="${index}" aria-label="Angriff entfernen">×</button>
      </div>`).join('') || '<div class="creature-table-empty">Noch kein Angriff. Füge natürliche Angriffe, Waffen oder Zauberangriffe hinzu.</div>'}
    </div>
  </section>`;
}

function renderAbilities(profile) {
  return `<section class="creature-sheet-section">
    <div class="creature-section-head"><div class="creature-section-title"><span>6</span> Eigenschaften / Fähigkeiten</div><button type="button" data-creature-action="add-ability">+ Fähigkeit</button></div>
    <div class="creature-compact-list">${profile.abilities.map((ability, index) => `<div class="creature-compact-row" data-ability-index="${index}">
      <input data-ability-field="name" value="${escapeHtml(ability.name)}" placeholder="Dunkelsicht">
      <textarea rows="2" data-ability-field="description" placeholder="Wirkung und Regel">${escapeHtml(ability.description)}</textarea>
      <button type="button" class="creature-row-remove" data-creature-action="remove-ability" data-index="${index}">×</button>
    </div>`).join('') || '<div class="creature-table-empty">Resistenzen, Sinne und besondere Fähigkeiten ergänzen.</div>'}</div>
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
    <div class="creature-section-head"><div class="creature-section-title"><span>☒</span> Mini-Lootbox</div><button type="button" data-creature-action="add-loot">+ Beute</button></div>
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

function renderAvatars(creature) {
  const avatars = Array.isArray(creature.avatars) ? creature.avatars : [];
  const canAdd = avatars.length < MAX_CREATURE_AVATARS;
  return `<section class="creature-sheet-section creature-avatar-section">
    <div class="creature-section-head">
      <div>
        <div class="creature-section-title"><span>10</span> Avatar-Galerie</div>
        <p class="creature-avatar-help">Bis zu ${MAX_CREATURE_AVATARS} zusätzliche Ausdrücke für Auftritte im Kommentarbereich. Das große Portrait bleibt die Standardauswahl.</p>
      </div>
      <strong class="creature-avatar-count">${avatars.length} / ${MAX_CREATURE_AVATARS}</strong>
    </div>
    <div class="creature-avatar-grid">
      ${avatars.map((avatar, index) => {
        const image = safeImageUrl(avatar.img);
        return `<article class="creature-avatar-card" data-avatar-index="${index}">
          <div class="creature-avatar-preview">
            ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(avatar.label || `Avatar ${index + 1}`)}" loading="lazy" decoding="async">` : '<span>☠</span>'}
          </div>
          <label><span>Bezeichnung</span><input data-avatar-field="label" value="${escapeHtml(avatar.label)}" maxlength="80" placeholder="z. B. zornig"></label>
          <label><span>Bild-URL</span><input type="url" data-avatar-field="img" value="${escapeHtml(avatar.img)}" placeholder="https://i.imgur.com/..."></label>
          <button type="button" class="creature-row-remove" data-creature-action="remove-avatar" data-index="${index}" aria-label="Avatar entfernen">×</button>
        </article>`;
      }).join('') || '<div class="creature-table-empty creature-avatar-empty">Noch keine zusätzlichen Avatare eingetragen.</div>'}
      ${canAdd ? `<div class="creature-avatar-add-card">
        <strong>Avatar hinzufügen</strong>
        <input type="text" data-new-avatar-field="label" maxlength="80" placeholder="Bezeichnung, z. B. verwundet">
        <input type="url" data-new-avatar-field="img" placeholder="https://i.imgur.com/...">
        <button type="button" data-creature-action="add-avatar">+ Avatar übernehmen</button>
      </div>` : '<div class="creature-avatar-limit">Alle zehn Avatarplätze sind belegt.</div>'}
    </div>
  </section>`;
}

function readNumber(element, fallback = 0) {
  const parsed = Number(element?.value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function collectDraftFromForm() {
  if (!state.draft) return null;
  const next = clone(state.draft);
  document.querySelectorAll('#creature-sheet-root [data-creature-field]').forEach(element => {
    const path = element.dataset.creatureField;
    const value = element.type === 'number' ? readNumber(element) : element.value;
    if (path === 'loot.currency') next.loot.currency = value;
    else if (path === 'loot.notes') next.loot.notes = value;
    else next[path] = value;
  });
  const profile = clone(next.combatProfile);
  profile.progression.level = Math.min(20, Math.max(1, readNumber(document.querySelector('[data-creature-field="level"]'), next.level)));
  profile.progression.specialLevels = Math.max(0, Math.min(10, next.level - 20));
  profile.hitPoints.current = readNumber(document.querySelector('[data-combat-field="hp-current"]'), 0);
  profile.hitPoints.maximumOverride = readNumber(document.querySelector('[data-combat-field="hp-maximum"]'), 10);
  profile.armorClass.override = readNumber(document.querySelector('[data-combat-field="armor-class"]'), 10);
  profile.combat.movement = readNumber(document.querySelector('[data-combat-field="movement"]'), 9);
  profile.progression.proficiencyBonusOverride = readNumber(document.querySelector('[data-combat-field="proficiency"]'), 2);
  profile.combat.passivePerceptionBonus = readNumber(document.querySelector('[data-combat-field="passive-perception"]'), 0);
  document.querySelectorAll('[data-attribute-key]').forEach(element => {
    const attribute = profile.attributes.find(item => item.key === element.dataset.attributeKey);
    if (attribute) attribute.score = readNumber(element, 10);
  });
  document.querySelectorAll('[data-save-key]').forEach(element => {
    const save = profile.savingThrows.find(item => item.attributeKey === element.dataset.saveKey);
    if (save) save.proficient = element.checked;
  });
  profile.weapons = Array.from(document.querySelectorAll('[data-attack-index]')).map((row, index) => ({
    ...(profile.weapons[index] || {}),
    id: profile.weapons[index]?.id || makeId('attack'),
    name: row.querySelector('[data-attack-field="name"]')?.value || '',
    attackAttribute: row.querySelector('[data-attack-field="attackAttribute"]')?.value || 'strength',
    damageFormula: row.querySelector('[data-attack-field="damageFormula"]')?.value || '',
    damageType: row.querySelector('[data-attack-field="damageType"]')?.value || '',
    range: row.querySelector('[data-attack-field="range"]')?.value || '',
    notes: row.querySelector('[data-attack-field="notes"]')?.value || '',
    equipped: index === 0,
    proficient: true
  }));
  profile.abilities = Array.from(document.querySelectorAll('[data-ability-index]')).map((row, index) => ({
    ...(profile.abilities[index] || {}), id: profile.abilities[index]?.id || makeId('ability'),
    name: row.querySelector('[data-ability-field="name"]')?.value || '',
    description: row.querySelector('[data-ability-field="description"]')?.value || '', active: true
  }));
  profile.skills = Array.from(document.querySelectorAll('[data-skill-index]')).map((row, index) => ({
    ...(profile.skills[index] || {}), id: profile.skills[index]?.id || makeId('skill'),
    name: row.querySelector('[data-skill-field="name"]')?.value || '',
    attributeKey: row.querySelector('[data-skill-field="attributeKey"]')?.value || 'dexterity',
    proficiency: row.querySelector('[data-skill-field="proficiency"]')?.value || 'none'
  }));
  profile.conditions = Array.from(document.querySelectorAll('[data-condition-index]')).map((row, index) => ({
    ...(profile.conditions[index] || {}), id: profile.conditions[index]?.id || makeId('condition'),
    name: row.querySelector('[data-condition-field="name"]')?.value || '',
    duration: row.querySelector('[data-condition-field="duration"]')?.value || '',
    description: row.querySelector('[data-condition-field="description"]')?.value || '',
    active: !!row.querySelector('[data-condition-field="active"]')?.checked
  }));
  next.loot.items = Array.from(document.querySelectorAll('[data-loot-index]')).map((row, index) => ({
    ...(next.loot.items[index] || {}), id: next.loot.items[index]?.id || makeId('loot'),
    name: row.querySelector('[data-loot-field="name"]')?.value || '',
    quantity: readNumber(row.querySelector('[data-loot-field="quantity"]'), 1),
    chance: readNumber(row.querySelector('[data-loot-field="chance"]'), 100),
    notes: row.querySelector('[data-loot-field="notes"]')?.value || ''
  }));
  next.avatars = Array.from(document.querySelectorAll('[data-avatar-index]')).map((row, index) => ({
    ...(next.avatars[index] || {}),
    id: next.avatars[index]?.id || makeId('avatar'),
    label: row.querySelector('[data-avatar-field="label"]')?.value || '',
    img: row.querySelector('[data-avatar-field="img"]')?.value || ''
  })).filter(avatar => String(avatar.img || '').trim()).slice(0, MAX_CREATURE_AVATARS);
  next.combatProfile = profile;
  state.draft = sanitizeCreature(next);
  return state.draft;
}

function openSheet(id = '') {
  state.editingId = String(id || '');
  const source = state.editingId ? state.creatures.find(item => item.id === state.editingId) : null;
  state.draft = source ? clone(source) : createCreatureDraft();
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
  const overlay = getOverlay();
  overlay?.classList.remove('open');
  overlay?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('creature-profile-open');
  state.editingId = '';
  state.draft = null;
}

async function saveCurrent() {
  const creature = collectDraftFromForm();
  if (!creature?.name) {
    setStatus('Bitte gib der Kreatur einen Namen.', 'error');
    return;
  }
  try {
    setStatus('Wird dauerhaft online gespeichert …');
    const backend = await ensureBackend();
    const now = new Date().toISOString();
    const data = { ...creature, createdAt: creature.createdAt || now, updatedAt: now };
    delete data.id;
    const id = await backend.saveCreature(state.editingId || null, data);
    state.editingId = id;
    state.draft = { id, ...data };
    const index = state.creatures.findIndex(item => item.id === id);
    if (index >= 0) state.creatures[index] = state.draft;
    else state.creatures.push(state.draft);
    state.creatures.sort((a, b) => a.name.localeCompare(b.name, 'de'));
    setStatus('Online gespeichert.', 'success');
    renderLibrary();
    renderSheet();
    dispatchChanged();
    notify(`${creature.name} wurde gespeichert.`, 'success');
  } catch (error) {
    console.error('save creature failed:', error);
    setStatus(error?.message || 'Kreatur konnte nicht gespeichert werden.', 'error');
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
        await backend.saveCreature(id, data);
      }
      await loadCreatures({ force: true });
      notify(`${imported.length} Kreatur(en) importiert.`, 'success');
    } catch (error) {
      notify(error?.message || 'Kreaturen konnten nicht importiert werden.', 'error');
    }
  });
}

function addRow(kind) {
  if (kind === 'avatar') {
    collectDraftFromForm();
    const avatars = Array.isArray(state.draft.avatars) ? state.draft.avatars : [];
    if (avatars.length >= MAX_CREATURE_AVATARS) {
      setStatus(`Maximal ${MAX_CREATURE_AVATARS} Avatare pro Kreatur.`, 'error');
      return;
    }
    const label = String(document.querySelector('[data-new-avatar-field="label"]')?.value || '').trim() || `Avatar ${avatars.length + 1}`;
    const img = safeImageUrl(document.querySelector('[data-new-avatar-field="img"]')?.value || '');
    if (!img) {
      setStatus('Bitte eine gültige http(s)-Bild-URL für den Avatar angeben.', 'error');
      return;
    }
    avatars.push({ id: makeId('avatar'), label, img });
    state.draft.avatars = avatars;
    renderSheet();
    setStatus('Avatar ergänzt. Mit „Online speichern“ dauerhaft übernehmen.', 'success');
    return;
  }
  collectDraftFromForm();
  const profile = state.draft.combatProfile;
  if (kind === 'attack') profile.weapons.push({ id: makeId('attack'), name: '', damageFormula: '', damageType: 'physisch', attackAttribute: 'strength', proficient: true, range: 'Nahkampf', equipped: profile.weapons.length === 0 });
  if (kind === 'ability') profile.abilities.push({ id: makeId('ability'), name: '', description: '', active: true });
  if (kind === 'skill') profile.skills.push({ id: makeId('skill'), name: '', attributeKey: 'dexterity', proficiency: 'trained', bonus: 0 });
  if (kind === 'condition') profile.conditions.push({ id: makeId('condition'), name: '', duration: '', description: '', active: true });
  if (kind === 'loot') state.draft.loot.items.push({ id: makeId('loot'), name: '', quantity: 1, chance: 100, notes: '' });
  renderSheet();
}

function removeRow(kind, index) {
  collectDraftFromForm();
  const mapping = { attack: state.draft.combatProfile.weapons, ability: state.draft.combatProfile.abilities, skill: state.draft.combatProfile.skills, condition: state.draft.combatProfile.conditions, loot: state.draft.loot.items, avatar: state.draft.avatars };
  mapping[kind]?.splice(index, 1);
  renderSheet();
}

function handleClick(event) {
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
  else if (action.startsWith('add-')) addRow(action.slice(4));
  else if (action.startsWith('remove-')) removeRow(action.slice(7), Number(trigger.dataset.index));
}

function handleInput(event) {
  if (!event.target.closest('#creature-sheet-root')) return;
  if (event.type === 'change' && (event.target.matches('[data-attribute-key], [data-combat-field], [data-save-key], [data-creature-field="level"], [data-avatar-field="img"]'))) {
    collectDraftFromForm();
    renderSheet();
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape' && getOverlay()?.classList.contains('open')) closeSheet();
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
window.addEventListener('fb-ready', () => loadCreatures({ force: true }));

window.AleriaCreatures = Object.freeze({
  mount,
  reload: () => loadCreatures({ force: true }),
  getAll: () => state.creatures.map(clone),
  getById: id => clone(state.creatures.find(item => item.id === id) || null),
  getSceneActors,
  open: openSheet,
  duplicate: duplicateCreature
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
