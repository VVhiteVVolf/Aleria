import { getSpellLevelLabel } from '../combat-spell-slots.js?v=20260803-character-creation-v1';
import { getCombatDamagePreview, getExplicitAttackSequencePreview, getPreparedCounterPreview } from '../combat-action-estimates.js?v=20260928-equipment-art-v4';
import { getActionCategoryPresentation, compareArsenalChoices, getActionWeaponSections, getArsenalClassIds } from './combat-action-taxonomy.js?v=20261015-scenarios-v2';
import { renderCombatStatIcon } from './combat-presentation-icons.js?v=20261015-scenarios-v2';
import { combatTooltipAttributes } from './combat-presentation-markup.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export { renderWeaponLoadout, bindWeaponImageFallback } from './combat-weapon-loadout-view.js?v=20260928-equipment-art-v4';

function signedNumber(value) {
  const number = Number(value) || 0;
  return number >= 0 ? `+${number}` : String(number);
}

export function activationLabel(value = '') {
  return ({ action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion',
    'special-action': 'Besondere Aktion', passive: 'Passiv' })[String(value || '')] || 'Aktion';
}

export function getCombatDisplayStats(actor = {}, damagePreview = getCombatDamagePreview(actor)) {
  const sequence = getExplicitAttackSequencePreview(actor);
  return {
    attack: actor.actionResolutionMode === 'automatic' ? 'Automatisch' : signedNumber(actor.attackModifier),
    damage: actor.selectedAction?.nonDamaging ? 'Kein Schaden' : (sequence.length ? sequence.map(step => step.notation).join(' → ') : damagePreview?.notation || '—').toUpperCase().replace(/D/g, 'W'),
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
  return { entry, ...getActionCategoryPresentation(actor, action, entry), label: String(action.name || entry.name || 'Handlung'), minimumLevel: Number(entry.minimumLevel) || 0 };
}

export function getActionPresentation(actor = {}) {
  return describeAction(actor, actor.selectedAction || {});
}

export function getActionGroups(actor = {}) {
  const groups = new Map();
  const sourceIndexes = new Map();
  (actor.actions || []).forEach(action => {
    if (action.kind === 'equipment-switch' && actor.selectedAction?.kind !== 'equipment-switch') return;
    const presentation = describeAction(actor, action, sourceIndexes);
    if (!groups.has(presentation.groupKey)) groups.set(presentation.groupKey, []);
    groups.get(presentation.groupKey).push({ action, ...presentation });
  });
  groups.forEach(actions => actions.sort((a, b) => compareArsenalChoices(actor, a, b)));
  const rank = choices => ({ weapon: 0, technique: choices[0].personal ? 1 : 2, ability: 3, spell: 4, prayer: 4, song: 4, 'equipment-switch': 5 })[choices[0].action.kind] ?? 6;
  const classes = getArsenalClassIds(actor);
  const classRank = choices => Math.min(...choices[0].classIds.map(id => { const index = classes.indexOf(id); return index < 0 ? classes.length : index; }), classes.length);
  return new Map([...groups].sort(([, a], [, b]) => rank(a) - rank(b)
    || classRank(a) - classRank(b)
    || Math.min(...a.map(c => c.minimumLevel)) - Math.min(...b.map(c => c.minimumLevel))
    || a[0].group.localeCompare(b[0].group, 'de')));
}

export function renderActionOptions(actor = {}, selectedId = '', groups = getActionGroups(actor)) {
  return [...groups.values()].flatMap(actions => getActionWeaponSections(actions).map(section => {
    const group = `${actions[0].group} · ${section.weapon.label}`;
    const options = section.choices.map(({ action, label }) => {
      const unavailable = action.compatible === false;
      const reason = unavailable ? action.disabledReason || 'Zurzeit nicht verfügbar' : '';
      return `<option value="${escapeHtml(action.id)}"${String(action.id) === String(selectedId) ? ' selected' : ''}${unavailable ? ' disabled' : ''}${reason ? ` title="${escapeHtml(reason)}"` : ''}>${escapeHtml(label)}${reason ? ` · ${escapeHtml(reason)}` : ''}</option>`;
    });
    return `<optgroup label="${escapeHtml(group)}">${options.join('')}</optgroup>`;
  })).join('');
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
    ['Beschreibung', entry.description], ['Wirkung', entry.description?.includes(entry.effect) ? '' : entry.effect], ['Voraussetzungen', entry.requirements],
    ['Reichweite', action.range || entry.range], ['Ziel', entry.target], ['Dauer', action.duration || entry.duration],
    ['Waffenhinweise', weaponNotes], ['Besonderheiten', (action.mechanicNotes || []).join('\n')],
    ['Nicht verfügbar', action.compatible === false ? action.disabledReason : '']
  ].filter(([, value]) => value && typeof value !== 'object');
  if (!fields.length) return '';
  return `<details class="combat-action-details" data-combat-details="action"${open ? ' open' : ''}>
    <summary>Wirkung und Regeln</summary>
    <dl>${fields.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
  </details>`;
}

function renderValue(label, value, note = '', className = '') {
  const kind = /Rettung|SG/.test(label) ? 'save' : /Schaden/.test(label) ? 'damage' : /Treffer/.test(label) ? 'attack' : '';
  const help = label === 'Ø Schaden' ? 'Durchschnitt des normalen Haupttreffers mit aktiven Schadensboni. Ohne Krit, Folgetreffer, zielabhängige Eingriffe, Resistenzen und Schadensminderung.' : ({ attack: 'Bonus auf den W20-Trefferwurf mit der aktuellen Waffenführung.', damage: 'Schadensformel vor Rüstung und Resistenzen. Wirkung und Voraussetzungen stehen darunter.', save: 'Das Ziel besteht den Rettungswurf bei einem Ergebnis mindestens gleich dem SG.' }[kind] || `${label}: ${value}`);
  return `<div class="combat-action-value${kind ? ` combat-action-value--${kind}` : ''}${className ? ` ${escapeHtml(className)}` : ''}" ${combatTooltipAttributes(help, { focusable: true })}><span>${kind ? renderCombatStatIcon(kind) : ''}${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${note ? `<small>${escapeHtml(note)}</small>` : ''}</div>`;
}

export function renderCombatValueStrip(actor = {}) {
  if (actor.selectedAction?.kind === 'equipment-switch') {
    return '<p class="combat-action-notice">Kein Angriffswurf. Die Waffe wird beim Eintragen gewechselt.</p>';
  }
  const damage = getCombatDamagePreview(actor);
  const stats = getCombatDisplayStats(actor, damage);
  const counter = getPreparedCounterPreview(actor);
  const save = actor.selectedAction?.secondarySave;
  const attribute = { strength: 'KRF', dexterity: 'GES', constitution: 'KON', wisdom: 'WEI' };
  return `<div class="combat-action-values" aria-label="Kampfwerte">${renderValue('Treffer', stats.attack)}${renderValue('Schaden', stats.damage, damage?.damageType)}${renderDamageAverage(damage)}${save?.enabled ? renderValue(save.timing === 'after-sequence' ? 'Rettung nach Folge' : 'Rettung nach Treffer', `${attribute[save.attributeKey] || save.attributeKey} SG ${save.dc}`) : ''}${counter ? renderValue('Konter-Treffer', signedNumber(counter.attackModifier), 'Nur nach Auslöser · Vorteil') + renderValue('Konter-Schaden', counter.damage?.notation?.toUpperCase().replace(/D/g, 'W'), 'Aktuell geführte Waffe') + (counter.secondarySave?.enabled ? renderValue('Konter-Rettung', `${attribute[counter.secondarySave.attributeKey] || counter.secondarySave.attributeKey} SG ${counter.secondarySave.dc}`) : '') : ''}</div>`;
}

function renderDamageAverage(damage) {
  const average = damage?.average;
  return average == null ? '' : `<div class="combat-damage-average">${renderValue('Ø Schaden', average.toLocaleString('de-DE', { maximumFractionDigits: 2 }), 'Normaler Haupttreffer · vor Abwehr')}</div>`;
}

export function renderMagicValueStrip(actor = {}) {
  const stats = getMagicDisplayStats(actor);
  const damage = getCombatDamagePreview(actor);
  const damageNote = damage ? [damage.damageType, `Schadensmod. ${signedNumber(damage.modifier)}`].filter(Boolean).join(' · ') : '';
  const damageValue = damage ? renderValue('Schaden', getCombatDisplayStats(actor, damage).damage, damageNote) : '';
  return `<div class="combat-action-values combat-action-values--magic" aria-label="Zauberwerte">${renderValue('Zauber-SG', stats.saveDc)}${renderValue('Zauber-Treffer', signedNumber(stats.spellAttack))}${renderValue('Auflösung', stats.resolutionLabel, stats.cantrip ? 'Zaubertrick' : stats.spellLevelLabel, 'combat-action-value--resolution')}${damageValue}${renderDamageAverage(damage)}</div>`;
}
