import { COMBAT_ATTRIBUTE_DEFINITIONS, COMBAT_WEAPON_TYPE_OPTIONS } from '../combat-profile-model.js?v=20260803-combat-sheet-v6';
import { COMBAT_ACTIVATION_TYPES } from '../combat-action-economy.js?v=20260803-action-economy-v2';

const state = { kind: '', item: null, resources: [], weapons: [], onSave: null };
const COMMENT_ACTION_RESOURCE_IDS = new Set(['action', 'bonus-action', 'reaction', 'special-action']);

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function checked(value) {
  return value ? ' checked' : '';
}

function selected(value, expected) {
  return String(value ?? '') === String(expected) ? ' selected' : '';
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

function fieldValue(field) {
  if (field.type === 'checkbox') return field.checked;
  if (field.type === 'number') return field.value === '' ? null : Number(field.value);
  return field.value;
}

function kindTitle() {
  if (state.kind === 'quirk') return 'Marotte & Eigenschaft bearbeiten';
  if (state.kind === 'ability') return 'Besondere Fähigkeit bearbeiten';
  if (state.kind === 'weapon') return 'Waffenangriff & Kosten bearbeiten';
  if (state.kind === 'spell') return 'Zauberregeln & Kosten bearbeiten';
  return 'Technik & Form bearbeiten';
}

function renderActivationOptions(value) {
  return COMBAT_ACTIVATION_TYPES.map(option => `<option value="${option.id}"${selected(value, option.id)}>${option.label}</option>`).join('');
}

function renderAttributeOptions(value) {
  return COMBAT_ATTRIBUTE_DEFINITIONS.map(option => `<option value="${option.key}"${selected(value, option.key)}>${option.label}</option>`).join('');
}

function renderMechanicsFields(item) {
  const mechanics = item.mechanics || {};
  const fields = [
    ['attack', 'Angriff'], ['damage', 'Schaden'], ['armorClass', 'Rüstungsklasse'],
    ['skill', 'Fertigkeiten'], ['savingThrow', 'Rettungswürfe'], ['spellAttack', 'Zauberangriff'],
    ['spellSaveDc', 'Zauber-SG'], ['movement', 'Bewegung'], ['maximumHitPoints', 'Maximale TP'],
    ['passivePerception', 'Passive Wahrnehmung']
  ];
  return `<fieldset class="combat-entry-editor-mechanics"><legend>Strukturierte Wirkung</legend>
    <p>Diese Werte werden vom Kampfsystem berechnet und von AleriaGPT verbindlich gelesen.</p>
    <div class="combat-entry-editor-number-grid">${fields.map(([key, label]) => `<label><span>${label}</span><input type="number" min="-9999" max="9999" data-entry-field="mechanics.${key}" value="${escapeHtml(mechanics[key] ?? 0)}"></label>`).join('')}</div>
    <label><span>Angriffswurf</span><select data-entry-field="mechanics.attackRollMode"><option value="normal"${selected(mechanics.attackRollMode, 'normal')}>Normal</option><option value="advantage"${selected(mechanics.attackRollMode, 'advantage')}>Vorteil</option><option value="disadvantage"${selected(mechanics.attackRollMode, 'disadvantage')}>Nachteil</option></select></label>
  </fieldset>`;
}

function renderCosts(item) {
  const costs = Array.isArray(item.costs) ? item.costs : [];
  return `<fieldset class="combat-entry-editor-costs"><legend>Kosten & Aktionsökonomie</legend>
    <div class="combat-entry-editor-cost-list">${costs.map((cost, index) => `<div class="combat-entry-editor-cost-row">
      <select data-entry-cost-index="${index}" data-entry-cost-field="resourceId"><option value="">Ressource wählen</option>${state.resources.map(resource => `<option value="${escapeHtml(resource.id)}"${selected(cost.resourceId, resource.id)}>${escapeHtml(resource.name)}</option>`).join('')}</select>
      <input type="number" min="0" max="9999" data-entry-cost-index="${index}" data-entry-cost-field="amount" value="${escapeHtml(cost.amount ?? 1)}" aria-label="Kosten">
      <button type="button" data-entry-action="remove-cost" data-entry-index="${index}" aria-label="Kosten entfernen">×</button>
    </div>`).join('') || '<p class="combat-entry-editor-empty">Keine Kosten hinterlegt.</p>'}</div>
    <button type="button" data-entry-action="add-cost">+ Ressourcenkosten</button>
    <div class="combat-entry-editor-aura-row">
      <label class="check"><input type="checkbox" data-entry-field="auraBypass.allowed"${checked(item.auraBypass?.allowed !== false)}> Durch Aura-Fokus ersetzbar</label>
      <label><span>Aura-Kosten</span><input type="number" min="1" max="999" data-entry-field="auraBypass.cost" value="${escapeHtml(item.auraBypass?.cost ?? 1)}"></label>
    </div>
  </fieldset>`;
}

function renderQuirk(item) {
  return `<div class="combat-entry-editor-grid">
    <label><span>Art</span><select data-entry-field="type"><option value="quirk"${selected(item.type, 'quirk')}>Marotte</option><option value="trait"${selected(item.type, 'trait')}>Eigenschaft</option><option value="ideal"${selected(item.type, 'ideal')}>Ideal</option><option value="bond"${selected(item.type, 'bond')}>Bindung</option><option value="flaw"${selected(item.type, 'flaw')}>Fehler</option><option value="rule"${selected(item.type, 'rule')}>Sonderregel</option></select></label>
    <label><span>Ziel / Betroffene</span><input data-entry-field="target" value="${escapeHtml(item.target)}" placeholder="Selbst, Gegner, Verbündete …"></label>
    <label><span>Priorität</span><input type="number" min="-99" max="99" data-entry-field="priority" value="${escapeHtml(item.priority ?? 0)}"></label>
    <label><span>Stapelung</span><input data-entry-field="stacking" value="${escapeHtml(item.stacking)}" placeholder="Einmalig, kumulativ …"></label>
    <label class="wide"><span>Wann gilt sie?</span><input data-entry-field="appliesWhen" value="${escapeHtml(item.appliesWhen)}" placeholder="Bedingung oder Situation"></label>
    <label class="wide"><span>Auslöser</span><input data-entry-field="trigger" value="${escapeHtml(item.trigger)}" placeholder="Wodurch wird sie ausgelöst?"></label>
    <label><span>Dauer</span><input data-entry-field="duration" value="${escapeHtml(item.duration)}"></label>
    <label><span>Schlagworte</span><input data-entry-field="tags" value="${escapeHtml(item.tags)}"></label>
    <label class="wide"><span>Beschreibung</span><textarea data-entry-field="description" rows="5">${escapeHtml(item.description)}</textarea></label>
    <label class="wide"><span>Grenzen & Konflikte</span><textarea data-entry-field="limitations" rows="3">${escapeHtml(item.limitations)}</textarea></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4" placeholder="Wie soll die KI diese Marotte interpretieren und erzählen?">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>${renderMechanicsFields(item)}`;
}

function renderAbility(item) {
  return `<div class="combat-entry-editor-grid">
    <label><span>Aktivierung</span><select data-entry-field="activationType">${renderActivationOptions(item.activationType)}</select></label>
    <label><span>Darstellung</span><select data-entry-field="delivery"><option value="ability"${selected(item.delivery, 'ability')}>Fähigkeit</option><option value="weapon"${selected(item.delivery, 'weapon')}>Waffentechnik</option><option value="spell"${selected(item.delivery, 'spell')}>Zauberformel</option><option value="prayer"${selected(item.delivery, 'prayer')}>Gebet / heiliger Schwur</option><option value="song"${selected(item.delivery, 'song')}>Gesang</option></select></label>
    <label class="check"><input type="checkbox" data-entry-field="combatUsable"${checked(item.combatUsable)}> In der interaktiven Szene auswählbar</label>
    <label><span>Würfelformel</span><input data-entry-field="rollFormula" value="${escapeHtml(String(item.rollFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="1W8"></label>
    <label><span>Schadensart</span><input data-entry-field="damageType" value="${escapeHtml(item.damageType)}"></label>
    <label><span>Reichweite</span><input data-entry-field="range" value="${escapeHtml(item.range)}"></label>
    <label><span>Ziel</span><input data-entry-field="target" value="${escapeHtml(item.target)}"></label>
    <label><span>Dauer</span><input data-entry-field="duration" value="${escapeHtml(item.duration)}"></label>
    <label><span>Nutzungen</span><div class="combat-entry-editor-pair"><input type="number" min="0" max="999" data-entry-field="usesCurrent" value="${escapeHtml(item.usesCurrent ?? 0)}"><i>/</i><input type="number" min="0" max="999" data-entry-field="usesMaximum" value="${escapeHtml(item.usesMaximum ?? 0)}"></div></label>
    <label><span>Erholung</span><select data-entry-field="recovery"><option value="none"${selected(item.recovery, 'none')}>Keine</option><option value="short-rest"${selected(item.recovery, 'short-rest')}>Kurze Rast</option><option value="long-rest"${selected(item.recovery, 'long-rest')}>Lange Rast</option><option value="scene"${selected(item.recovery, 'scene')}>Szene</option><option value="day"${selected(item.recovery, 'day')}>Tag</option><option value="manual"${selected(item.recovery, 'manual')}>Manuell</option></select></label>
    <label class="wide"><span>Beschreibung & Wirkung</span><textarea data-entry-field="description" rows="5">${escapeHtml(item.description)}</textarea></label>
    <label class="wide"><span>Voraussetzungen & Grenzen</span><textarea data-entry-field="requirements" rows="3">${escapeHtml(item.requirements)}</textarea></label>
    <label><span>Schlagworte</span><input data-entry-field="tags" value="${escapeHtml(item.tags)}"></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>${renderCosts(item)}${renderMechanicsFields(item)}`;
}

function renderTechnique(item) {
  const weaponTypes = Array.isArray(item.weaponTypes) ? item.weaponTypes : [];
  return `<div class="combat-entry-editor-grid">
    <label><span>Kategorie</span><select data-entry-field="category"><option value="technique"${selected(item.category, 'technique')}>Technik</option><option value="form"${selected(item.category, 'form')}>Form / Haltung</option><option value="reaction"${selected(item.category, 'reaction')}>Reaktion</option><option value="bonus"${selected(item.category, 'bonus')}>Bonusaktion</option><option value="special"${selected(item.category, 'special')}>Besondere Aktion</option></select></label>
    <label><span>Aktivierung</span><select data-entry-field="activationType">${renderActivationOptions(item.activationType)}</select></label>
    <label><span>Schadenswurf</span><input data-entry-field="damageFormula" value="${escapeHtml(String(item.damageFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="Leer = aktive Waffe"></label>
    <label><span>Schadensart</span><input data-entry-field="damageType" value="${escapeHtml(item.damageType)}" placeholder="Leer = aktive Waffe"></label>
    <label><span>Angriffsbonus</span><input type="number" min="-99" max="99" data-entry-field="attackBonus" value="${escapeHtml(item.attackBonus ?? 0)}"></label>
    <label><span>Schadensbonus</span><input type="number" min="-99" max="99" data-entry-field="damageBonus" value="${escapeHtml(item.damageBonus ?? 0)}"></label>
    <label><span>Wurfmodus</span><select data-entry-field="rollMode"><option value="normal"${selected(item.rollMode, 'normal')}>Normal</option><option value="advantage"${selected(item.rollMode, 'advantage')}>Vorteil</option><option value="disadvantage"${selected(item.rollMode, 'disadvantage')}>Nachteil</option></select></label>
    <label><span>Reichweite</span><input data-entry-field="range" value="${escapeHtml(item.range)}"></label>
    <label><span>Ziel</span><input data-entry-field="target" value="${escapeHtml(item.target)}"></label>
    <label><span>Dauer</span><input data-entry-field="duration" value="${escapeHtml(item.duration)}"></label>
    <fieldset class="wide combat-entry-editor-weapons"><legend>Erlaubte Waffenarten</legend>${COMBAT_WEAPON_TYPE_OPTIONS.map(option => `<label><input type="checkbox" data-entry-weapon-type="${option.id}"${checked(weaponTypes.includes(option.id))}> ${option.label}</label>`).join('')}<small>Ohne Auswahl gilt die Technik für jede aktive Waffe.</small></fieldset>
    <label class="wide"><span>Beschreibung</span><textarea data-entry-field="description" rows="4">${escapeHtml(item.description)}</textarea></label>
    <label class="wide"><span>Mechanischer / erzählerischer Effekt</span><textarea data-entry-field="effect" rows="4">${escapeHtml(item.effect)}</textarea></label>
    <label class="wide"><span>Voraussetzungen & Grenzen</span><textarea data-entry-field="requirements" rows="3">${escapeHtml(item.requirements)}</textarea></label>
    <label><span>Schlagworte</span><input data-entry-field="tags" value="${escapeHtml(item.tags)}"></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>${renderCosts(item)}${renderMechanicsFields(item)}`;
}

function renderWeapon(item) {
  return `<div class="combat-entry-editor-grid">
    <label><span>Aktivierung</span><select data-entry-field="activationType">${renderActivationOptions(item.activationType)}</select></label>
    <label><span>Waffenart</span><select data-entry-field="weaponType">${COMBAT_WEAPON_TYPE_OPTIONS.map(option => `<option value="${option.id}"${selected(item.weaponType, option.id)}>${option.label}</option>`).join('')}</select></label>
    <label><span>Angriffsattribut</span><select data-entry-field="attackAttribute">${renderAttributeOptions(item.attackAttribute)}</select></label>
    <label><span>Schadenswurf</span><input data-entry-field="damageFormula" value="${escapeHtml(String(item.damageFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="1W8"></label>
    <label><span>Schadensart</span><input data-entry-field="damageType" value="${escapeHtml(item.damageType)}"></label>
    <label><span>Reichweite</span><input data-entry-field="range" value="${escapeHtml(item.range)}"></label>
    <label class="wide"><span>Voraussetzungen & Grenzen</span><textarea data-entry-field="requirements" rows="3">${escapeHtml(item.requirements)}</textarea></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>${renderCosts(item)}`;
}

function renderSpell(item) {
  return `<div class="combat-entry-editor-grid">
    <label><span>Aktivierung</span><select data-entry-field="activationType">${renderActivationOptions(item.activationType)}</select></label>
    <label><span>Darstellung</span><select data-entry-field="presentationKind"><option value="spell"${selected(item.presentationKind, 'spell')}>Zauberformel</option><option value="prayer"${selected(item.presentationKind, 'prayer')}>Gebet / heiliger Schwur</option><option value="song"${selected(item.presentationKind, 'song')}>Gesang</option></select></label>
    <label><span>Auflösung</span><select data-entry-field="resolutionType"><option value="spell-attack"${selected(item.resolutionType, 'spell-attack')}>Zauberangriff</option><option value="saving-throw"${selected(item.resolutionType, 'saving-throw')}>Rettungswurf gegen Zauber-SG</option><option value="automatic"${selected(item.resolutionType, 'automatic')}>Automatische Wirkung</option></select></label>
    <label><span>Rettungsattribut</span><select data-entry-field="saveAttribute">${renderAttributeOptions(item.saveAttribute)}</select></label>
    <label><span>Grad</span><input type="number" min="0" max="20" data-entry-field="level" value="${escapeHtml(item.level ?? 0)}"></label>
    <label><span>Würfelformel</span><input data-entry-field="rollFormula" value="${escapeHtml(String(item.rollFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="2W6"></label>
    <label><span>Schadensart</span><input data-entry-field="damageType" value="${escapeHtml(item.damageType)}"></label>
    <label><span>Mana</span><input type="number" min="0" max="999" data-entry-field="manaCost" value="${escapeHtml(item.manaCost ?? 0)}"></label>
    <label><span>Slot-Ressource</span><select data-entry-field="slotResourceId"><option value="">Kein Slot</option>${state.resources.map(resource => `<option value="${escapeHtml(resource.id)}"${selected(item.slotResourceId, resource.id)}>${escapeHtml(resource.name)}</option>`).join('')}</select></label>
    <label><span>Slotkosten</span><input type="number" min="0" max="99" data-entry-field="slotCost" value="${escapeHtml(item.slotCost ?? 0)}"></label>
    <label><span>Reichweite</span><input data-entry-field="range" value="${escapeHtml(item.range)}"></label>
    <label><span>Dauer</span><input data-entry-field="duration" value="${escapeHtml(item.duration)}"></label>
    <label class="check"><input type="checkbox" data-entry-field="halfDamageOnSave"${checked(item.halfDamageOnSave)}> Halber Schaden bei gelungener Rettung</label>
    <label class="wide"><span>Beschreibung & Wirkung</span><textarea data-entry-field="description" rows="5">${escapeHtml(item.description)}</textarea></label>
    <label class="wide"><span>Voraussetzungen & Grenzen</span><textarea data-entry-field="requirements" rows="3">${escapeHtml(item.requirements)}</textarea></label>
    <label><span>Schlagworte</span><input data-entry-field="tags" value="${escapeHtml(item.tags)}"></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>${renderCosts(item)}`;
}

function ensureOverlay() {
  let overlay = document.getElementById('combat-entry-editor-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'combat-entry-editor-overlay';
  overlay.className = 'combat-entry-editor-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  return overlay;
}

function render() {
  const overlay = ensureOverlay();
  const item = state.item || {};
  const content = state.kind === 'quirk'
    ? renderQuirk(item)
    : (state.kind === 'ability'
      ? renderAbility(item)
      : (state.kind === 'weapon' ? renderWeapon(item) : (state.kind === 'spell' ? renderSpell(item) : renderTechnique(item))));
  overlay.innerHTML = `<section class="combat-entry-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="combat-entry-editor-title">
    <header><div><span>Kampfprofil · Detailwerkstatt</span><h2 id="combat-entry-editor-title">${kindTitle()}</h2></div><button type="button" data-entry-action="close" aria-label="Schließen">×</button></header>
    <div class="combat-entry-editor-body">
      <div class="combat-entry-editor-name-row"><label><span>Name</span><input data-entry-field="name" value="${escapeHtml(item.name)}" maxlength="140" autofocus></label><label class="check"><input type="checkbox" data-entry-field="active"${checked(item.active !== false)}> Aktiv</label></div>
      ${content}
      <p class="combat-entry-editor-error" data-entry-role="error" hidden></p>
    </div>
    <footer><button type="button" data-entry-action="close">Abbrechen</button><button type="button" class="primary" data-entry-action="save">Übernehmen</button></footer>
  </section>`;
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => overlay.querySelector('[autofocus]')?.focus());
}

function close() {
  const overlay = ensureOverlay();
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  state.kind = '';
  state.item = null;
  state.onSave = null;
}

function updateCost(field) {
  const index = Number(field.dataset.entryCostIndex);
  const cost = state.item?.costs?.[index];
  if (!cost) return;
  cost[field.dataset.entryCostField] = fieldValue(field);
  if (field.dataset.entryCostField === 'resourceId') {
    const resource = state.resources.find(item => item.id === field.value);
    cost.name = resource?.name || 'Ressource';
    cost.scope = resource?.scope || 'persistent';
  }
}

function syncSingleActivationCost(field) {
  if (field.dataset.entryField !== 'activationType' || !Array.isArray(state.item?.costs)) return;
  const actionCosts = state.item.costs.filter(cost => COMMENT_ACTION_RESOURCE_IDS.has(String(cost.resourceId || '')));
  if (actionCosts.length !== 1) return;
  const cost = actionCosts[0];
  if (field.value === 'passive') {
    state.item.costs.splice(state.item.costs.indexOf(cost), 1);
    return;
  }
  const resource = state.resources.find(item => item.id === field.value);
  cost.resourceId = field.value;
  cost.name = resource?.name || COMBAT_ACTIVATION_TYPES.find(item => item.id === field.value)?.label || field.value;
  cost.scope = resource?.scope === 'comment' ? 'comment' : 'persistent';
}

document.addEventListener('input', event => {
  const field = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-field], #combat-entry-editor-overlay [data-entry-cost-field]');
  if (!field || !state.item) return;
  if (field.dataset.entryCostField) updateCost(field);
  else {
    setAtPath(state.item, field.dataset.entryField, fieldValue(field));
    syncSingleActivationCost(field);
  }
});

document.addEventListener('change', event => {
  const weaponType = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-weapon-type]');
  if (weaponType && state.item) {
    const values = new Set(Array.isArray(state.item.weaponTypes) ? state.item.weaponTypes : []);
    if (weaponType.checked) values.add(weaponType.dataset.entryWeaponType);
    else values.delete(weaponType.dataset.entryWeaponType);
    state.item.weaponTypes = [...values];
    return;
  }
  const field = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-field], #combat-entry-editor-overlay [data-entry-cost-field]');
  if (!field || !state.item) return;
  if (field.dataset.entryCostField) updateCost(field);
  else {
    setAtPath(state.item, field.dataset.entryField, fieldValue(field));
    syncSingleActivationCost(field);
  }
});

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-action]');
  if (!trigger) return;
  const action = trigger.dataset.entryAction;
  if (action === 'close') close();
  if (action === 'add-cost') {
    if (!Array.isArray(state.item.costs)) state.item.costs = [];
    state.item.costs.push({ id: `cost-${Date.now().toString(36)}`, resourceId: '', name: 'Ressource', amount: 1, scope: 'persistent' });
    render();
  }
  if (action === 'remove-cost') {
    state.item.costs.splice(Number(trigger.dataset.entryIndex), 1);
    render();
  }
  if (action === 'save') {
    if (!String(state.item?.name || '').trim()) {
      const error = document.querySelector('[data-entry-role="error"]');
      if (error) { error.hidden = false; error.textContent = 'Bitte gib einen Namen an.'; }
      return;
    }
    const callback = state.onSave;
    const value = clone(state.item);
    close();
    callback?.(value);
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.getElementById('combat-entry-editor-overlay')?.classList.contains('active')) close();
});

export function openCombatEntryEditor({ kind, item, resources = [], weapons = [], onSave } = {}) {
  if (!['quirk', 'ability', 'technique', 'weapon', 'spell'].includes(kind)) throw new Error('Unbekannter Kampfprofil-Editor.');
  state.kind = kind;
  state.item = clone(item || {});
  state.resources = clone(resources || []);
  state.weapons = clone(weapons || []);
  state.onSave = typeof onSave === 'function' ? onSave : null;
  render();
}

export const combatEntryEditorInternals = Object.freeze({ getAtPath, setAtPath, fieldValue });
