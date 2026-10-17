import { CHALLENGE_COMBAT_EFFECT_TYPES, MAX_CHALLENGE_COMBAT_EFFECTS } from './herausforderung-combat-effects.js';
import { renderChallengeWeaponManeuverFields, updateChallengeWeaponManeuverInput } from './herausforderung-weapon-maneuver-ui.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderChallengeRecipientOptions(context = {}, selected = '') {
  const participants = context.participants || [];
  const missing = selected && !participants.some(participant => participant.actorId === selected);
  return `<option value="">Versuchende Figur</option>${missing ? `<option value="${escape(selected)}" selected>Nicht mehr im aktiven Kampf · ${escape(selected)}</option>` : ''}`
    + participants.map(participant => `<option value="${escape(participant.actorId)}"${selected === participant.actorId ? ' selected' : ''}>${escape(participant.name)}</option>`).join('');
}

export function renderChallengeCombatChoiceOptions(context, effect, field) {
  const participants = (context.participants || []).filter(participant => !effect.targetActorId || participant.actorId === effect.targetActorId);
  const choices = new Map(participants.flatMap(participant => (participant[field] || []).map(item => [item.id,
    { ...item, label: field === 'conditions' ? `${item.name} · ${participant.name}` : item.name }])));
  const selected = effect[field === 'resources' ? 'resourceId' : 'conditionId'] || '';
  return `<option value="">${field === 'resources' ? 'Ressource auswählen …' : 'Aktiven Zustand auswählen …'}</option>`
    + (selected && !choices.has(selected) ? `<option value="${escape(selected)}" selected>Nicht verfügbar · ${escape(selected)}</option>` : '')
    + [...choices.values()].map(item => `<option value="${escape(item.id)}"${item.id === selected ? ' selected' : ''}>${escape(item.label)}</option>`).join('');
}

export function renderChallengeCombatEffects(bundle, field) {
  const effects = bundle.combatEffects || [];
  return `<section class="herausforderung-combat-effects"><h4>Direkte Kampfwirkungen</h4><p class="herausforderung-note">TP, Schutz und Ressourcen werden über die Kampflogik verrechnet und im Verlauf belegt. Würfelformeln werden separat gewürfelt; ein kritischer Fertigkeitserfolg verdoppelt sie nicht.</p>${effects.map((effect, index) => {
    const resource = ['restore-resource', 'spend-resource'].includes(effect.type), removal = effect.type === 'remove-condition', maneuver = effect.type === 'weapon-maneuver';
    return `<div class="herausforderung-effect" data-hr-combat-index="${index}"><div class="herausforderung-effect-head"><strong>Kampfwirkung ${index + 1}</strong><button type="button" data-hr-action="remove-combat-effect">Entfernen ×</button></div><div class="herausforderung-reward-grid"><label>Wirkung<select data-hr-field="combat-type">${CHALLENGE_COMBAT_EFFECT_TYPES.map(([type, label]) => `<option value="${type}"${effect.type === type ? ' selected' : ''}>${label}</option>`).join('')}</select></label><label>Empfänger<select data-hr-field="combat-targetActorId" data-hr-recipient="${escape(effect.targetActorId || '')}"></select></label>${maneuver ? renderChallengeWeaponManeuverFields(effect) : ''}${!maneuver && !removal ? `<label>Fester Betrag<input type="number" min="0" max="10000" step="1" data-hr-field="combat-amount" value="${escape(effect.amount || 0)}"></label>` : ''}${!maneuver && !resource && !removal ? `<label>Oder Würfelformel<input maxlength="80" data-hr-field="combat-formula" value="${escape(effect.formula || '')}" placeholder="z. B. 1W6+2"></label>` : ''}${resource ? `<label>Ressource<select data-hr-field="combat-resourceId" data-hr-combat-choice="resources"></select></label>` : ''}${removal ? `<label>Aktiven Zustand entfernen<select data-hr-field="combat-conditionId" data-hr-combat-choice="conditions"></select></label>` : ''}${effect.type === 'damage' ? `<label>Schadensart<input maxlength="100" data-hr-field="combat-damageType" value="${escape(effect.damageType || 'physisch')}" list="herausforderung-combat-damage-types"></label><label class="herausforderung-combat-checkbox"><input type="checkbox" data-hr-field="combat-magical"${effect.magical ? ' checked' : ''}>Magischer Schaden</label>` : ''}</div></div>`;
  }).join('')}<button type="button" class="herausforderung-button" data-hr-action="add-combat-effect"${effects.length >= MAX_CHALLENGE_COMBAT_EFFECTS ? ' disabled' : ''}>＋ Kampfwirkung hinzufügen</button></section>`;
}

export function updateChallengeCombatInput(target, bundle) {
  const index = target.closest('[data-hr-combat-index]')?.dataset.hrCombatIndex;
  if (index === undefined || !target.dataset.hrField?.startsWith('combat-')) return null;
  const effect = bundle.combatEffects[Number(index)], field = target.dataset.hrField.slice(7);
  if (field.startsWith('maneuver-')) return updateChallengeWeaponManeuverInput(target, effect, field.slice(9));
  effect[field] = target.type === 'checkbox' ? target.checked : target.type === 'number' ? target.valueAsNumber : target.value;
  if (field === 'formula' && target.value) effect.amount = 0;
  if (field === 'amount' && effect.amount > 0) effect.formula = '';
  if (field === 'type') { effect.formula = ''; effect.amount = ['remove-condition', 'weapon-maneuver'].includes(effect.type) ? 0 : 5;
    if (effect.type === 'weapon-maneuver') effect.maneuver ||= { actorId: '', weaponId: '', pickupWeapon: false, resourceId: '', extraWeaponDice: 0, damageMultiplier: 1, rollMode: 'normal', save: null }; }
  return { rerender: field === 'type' || field === 'targetActorId' };
}
