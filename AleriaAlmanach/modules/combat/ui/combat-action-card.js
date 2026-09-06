import { getSpellLevelLabel } from '../combat-spell-slots.js?v=20260803-character-creation-v1';
import { estimateCombatDamage } from '../combat-action-estimates.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export { renderWeaponLoadout, bindWeaponImageFallback } from './combat-weapon-loadout-view.js';

function signedNumber(value) {
  const number = Number(value) || 0;
  return number >= 0 ? `+${number}` : String(number);
}

export function activationLabel(value = '') {
  return ({ action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion',
    'special-action': 'Besondere Aktion', passive: 'Passiv' })[String(value || '')] || 'Aktion';
}

export function getCombatDisplayStats(actor = {}) {
  const formula = String(actor.weapon?.damageFormula || '').toUpperCase().replace(/D/g, 'W');
  const modifier = Number(actor.damageModifier) || 0;
  return {
    attack: signedNumber(actor.attackModifier),
    damage: `${formula || '—'}${modifier ? ` ${signedNumber(modifier)}` : ''}`,
    activation: activationLabel(actor.selectedAction?.activationType)
  };
}

export function getMagicDisplayStats(actor = {}) {
  const resolutionMode = String(actor.actionResolutionMode || 'spell-attack');
  const spellLevel = Number(actor.selectedAction?.castLevel ?? actor.selectedAction?.spellLevel);
  return {
    saveDc: Number(actor.actionSpellSaveDc ?? actor.spellSaveDc) || 0,
    spellAttack: Number(actor.spellAttackModifier ?? actor.attackModifier) || 0,
    resolutionLabel: resolutionMode === 'saving-throw' ? 'Rettungswurf gegen Zauber-SG'
      : (resolutionMode === 'automatic' ? 'Automatische Wirkung' : 'Zauber-Trefferwurf'),
    spellLevelLabel: Number.isFinite(spellLevel) ? getSpellLevelLabel(spellLevel) : '',
    cantrip: actor.selectedAction?.isCantrip === true || spellLevel === 0
  };
}

function actionSources(actor, { kind, id = '' }) {
  if (String(id).startsWith('ability:')) return actor.abilities;
  if (kind === 'technique') return actor.techniques;
  if (kind === 'ability') return actor.abilities;
  if (['spell', 'prayer', 'song'].includes(kind)) return actor.magic?.spells;
  if (kind === 'weapon' || kind === 'equipment-switch') return actor.weapons;
  return [];
}

function describeAction(actor, action = {}, sourceIndexes = null) {
  const sourceId = String(action.sourceId || action.equipmentSwitchTargetId || '');
  const sources = actionSources(actor, action);
  const entries = Array.isArray(sources) ? sources : [];
  if (sourceIndexes && !sourceIndexes.has(sources)) sourceIndexes.set(sources, new Map(entries.map(entry => [String(entry.id), entry])));
  const entry = (sourceIndexes ? sourceIndexes.get(sources).get(sourceId) : entries.find(source => String(source.id) === sourceId)) || action;
  const group = action.kind === 'equipment-switch' ? 'Waffenwechsel'
    : (entry.trainingForm || entry.combatStyleFormName || ({ weapon: 'Waffenangriffe', technique: 'Kampftechniken', ability: 'Fähigkeiten',
      spell: 'Zauber', prayer: 'Gebete', song: 'Gesänge' })[action.kind] || action.kindLabel || 'Handlungen');
  return { entry, group, label: String(action.name || entry.name || 'Handlung'), minimumLevel: Number(entry.minimumLevel) || 0 };
}

export function getActionPresentation(actor = {}) {
  return describeAction(actor, actor.selectedAction || {});
}

export function getActionGroups(actor = {}) {
  const groups = new Map();
  const sourceIndexes = new Map();
  (actor.actions || []).forEach(action => {
    if (action.kind === 'equipment-switch' && actor.selectedAction?.kind !== 'equipment-switch') return;
    const { group, label } = describeAction(actor, action, sourceIndexes);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push({ action, label });
  });
  return groups;
}

export function renderActionOptions(actor = {}, selectedId = '') {
  return [...getActionGroups(actor)].map(([group, actions]) => {
    const options = actions.map(({ action, label }) => {
      const unavailable = action.compatible === false;
      const reason = unavailable ? action.disabledReason || 'Zurzeit nicht verfügbar' : '';
      return `<option value="${escapeHtml(action.id)}"${String(action.id) === String(selectedId) ? ' selected' : ''}${unavailable ? ' disabled' : ''}${reason ? ` title="${escapeHtml(reason)}"` : ''}>${escapeHtml(label)}${reason ? ` · ${escapeHtml(reason)}` : ''}</option>`;
    });
    return `<optgroup label="${escapeHtml(group)}">${options.join('')}</optgroup>`;
  }).join('');
}

export function renderActionMetadata(actor = {}) {
  if (!actor.selectedAction) return '';
  const { group, minimumLevel } = getActionPresentation(actor);
  return `<small class="combat-action-meta"><span>${escapeHtml(group)}</span>${minimumLevel ? `<span>ab Stufe ${minimumLevel}</span>` : ''}<span>${escapeHtml(activationLabel(actor.selectedAction?.activationType))}</span></small>`;
}

export function renderActionDetails(actor = {}, { open = false } = {}) {
  const { entry } = getActionPresentation(actor);
  const action = actor.selectedAction || {};
  const sourceNotes = [entry.description, entry.effect, entry.requirements].filter(Boolean);
  const weaponNotes = String(action.weapon?.notes || entry.notes || '').split('\n')
    .filter(note => note && !sourceNotes.some(value => String(value).split('\n').includes(note))).join('\n');
  const fields = [
    ['Beschreibung', entry.description], ['Wirkung', entry.effect], ['Voraussetzungen', entry.requirements],
    ['Reichweite', entry.range], ['Ziel', entry.target], ['Dauer', entry.duration],
    ['Waffenhinweise', weaponNotes], ['Besonderheiten', (action.mechanicNotes || []).join('\n')],
    ['Nicht verfügbar', action.compatible === false ? action.disabledReason : '']
  ].filter(([, value]) => value && typeof value !== 'object');
  if (!fields.length) return '';
  return `<details class="combat-action-details" data-combat-details="action"${open ? ' open' : ''}>
    <summary>Wirkung und Regeln</summary>
    <dl>${fields.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
  </details>`;
}

function renderValue(label, value, note = '') {
  return `<div class="combat-action-value"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${note ? `<small>${escapeHtml(note)}</small>` : ''}</div>`;
}

export function renderCombatValueStrip(actor = {}) {
  if (actor.selectedAction?.kind === 'equipment-switch') {
    return '<p class="combat-action-notice">Kein Angriffswurf. Die Waffe wird beim Eintragen gewechselt.</p>';
  }
  const stats = getCombatDisplayStats(actor);
  return `<div class="combat-action-values" aria-label="Kampfwerte">${renderValue('Treffer', stats.attack)}${renderValue('Schaden', stats.damage, actor.weapon?.damageType || '')}${renderDamageAverage(actor)}</div>`;
}

function renderDamageAverage(actor) {
  const average = estimateCombatDamage(actor);
  return average == null ? '' : `<div class="combat-damage-average" title="Durchschnitt des normalen Haupttreffers mit aktiven Schadensboni. Ohne Krit, Folgetreffer, zielabhängige Eingriffe, Resistenzen und Schadensminderung.">${renderValue('Ø Schaden', average.toLocaleString('de-DE', { maximumFractionDigits: 2 }), 'Normaler Haupttreffer · vor Abwehr')}</div>`;
}

export function renderMagicValueStrip(actor = {}) {
  const stats = getMagicDisplayStats(actor);
  return `<div class="combat-action-values combat-action-values--magic" aria-label="Zauberwerte">${renderValue('Zauber-SG', stats.saveDc)}${renderValue('Zauber-Treffer', signedNumber(stats.spellAttack))}${renderValue('Auflösung', stats.resolutionLabel, stats.cantrip ? 'Zaubertrick' : stats.spellLevelLabel)}${renderDamageAverage(actor)}</div>`;
}
