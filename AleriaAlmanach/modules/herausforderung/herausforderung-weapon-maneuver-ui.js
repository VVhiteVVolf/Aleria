const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const options = (choices, selected) => choices.map(([id, label]) => `<option value="${id}"${id === selected ? ' selected' : ''}>${label}</option>`).join('');
const attributes = [['strength', 'Kraft'], ['dexterity', 'Geschick'], ['constitution', 'Konstitution'], ['intelligence', 'Intelligenz'], ['wisdom', 'Weisheit'], ['charisma', 'Charisma']];

export function renderChallengeWeaponManeuverFields(effect) {
  const m = effect.maneuver || {};
  return `<p class="herausforderung-note">Die echte geführte Waffe wird verwendet. Angriff, Rettung und Schaden würfelt der Server beim Eintragen; Kosten und Waffenaufnahme werden gemeinsam gespeichert.</p>
    <label>Angreifer<select data-hr-field="combat-maneuver-actorId" data-hr-maneuver-actor></select></label>
    <label>Waffe<select data-hr-field="combat-maneuver-weaponId" data-hr-maneuver-weapon></select></label>
    <label>Aktionskosten<select data-hr-field="combat-maneuver-resourceId">${options([['', 'Ausgelöster Angriff · keine zusätzlichen Kosten'], ['reaction', '1 Reaktion'], ['bonus-action', '1 Bonusaktion'], ['action', '1 Aktion'], ['special-action', '1 Besondere Aktion'], ['aura-focus', '1 Aura-Fokuspunkt']], m.resourceId || '')}</select></label>
    <label class="herausforderung-combat-checkbox"><input type="checkbox" data-hr-field="combat-maneuver-pickupWeapon"${m.pickupWeapon ? ' checked' : ''}>Eigene fallengelassene Waffe aufnehmen · in den Aktionskosten enthalten</label>
    <label>Zusätzliche Waffenwürfel<input type="number" min="0" max="4" step="1" data-hr-field="combat-maneuver-extraWeaponDice" value="${escape(m.extraWeaponDice || 0)}"></label>
    <label>Angriffswurf<select data-hr-field="combat-maneuver-rollMode">${options([['normal', 'Normal'], ['advantage', 'Vorteil'], ['disadvantage', 'Nachteil']], m.rollMode || 'normal')}</select></label>
    <label>Schadensfaktor<select data-hr-field="combat-maneuver-damageMultiplier">${options([['1', 'Normaler Schaden · regulärer Krit möglich'], ['2', 'Doppelter normaler Schaden · kein zusätzlicher Kritschaden']], String(m.damageMultiplier || 1))}</select></label>
    <label class="herausforderung-combat-checkbox"><input type="checkbox" data-hr-field="combat-maneuver-saveEnabled"${m.save ? ' checked' : ''}>Ziel rettet zuerst · Angriff nur bei misslungener Rettung</label>
    ${m.save ? `<label>Rettungswurf des Ziels<select data-hr-field="combat-maneuver-saveAttribute">${options(attributes, m.save.attribute)}</select></label><label>Rettungswurf-SG<input type="number" min="1" max="40" step="1" data-hr-field="combat-maneuver-saveDifficulty" value="${escape(m.save.difficulty)}"></label>` : ''}`;
}

export function refreshChallengeWeaponManeuverFields(root, effect, context) {
  const m = effect.maneuver || {}, actors = context.participants || [];
  const actorSelect = root.querySelector('[data-hr-maneuver-actor]');
  if (actorSelect) actorSelect.innerHTML = '<option value="">Angreifer wählen …</option>' + actors.map(actor => `<option value="${escape(actor.actorId)}"${actor.actorId === m.actorId ? ' selected' : ''}>${escape(actor.name)}</option>`).join('');
  const weaponSelect = root.querySelector('[data-hr-maneuver-weapon]');
  if (weaponSelect) {
    const weapons = actors.find(actor => actor.actorId === m.actorId)?.weapons || [];
    weaponSelect.innerHTML = '<option value="">Aktuell geführte Waffe</option>'
      + (m.weaponId && !weapons.some(weapon => weapon.id === m.weaponId) ? `<option value="${escape(m.weaponId)}" selected>${escape(m.weaponId)}</option>` : '')
      + weapons.map(weapon => `<option value="${escape(weapon.id)}"${weapon.id === m.weaponId ? ' selected' : ''}>${escape(weapon.name)}</option>`).join('');
  }
}

export function updateChallengeWeaponManeuverInput(target, effect, field) {
  const m = effect.maneuver ||= { actorId: '', weaponId: '', pickupWeapon: false, resourceId: '', extraWeaponDice: 0, damageMultiplier: 1, rollMode: 'normal', save: null };
  if (field === 'saveEnabled') m.save = target.checked ? { attribute: 'dexterity', difficulty: 15 } : null;
  else if (field === 'saveAttribute' && m.save) m.save.attribute = target.value;
  else if (field === 'saveDifficulty' && m.save) m.save.difficulty = target.valueAsNumber;
  else m[field] = target.type === 'checkbox' ? target.checked : ['extraWeaponDice', 'damageMultiplier'].includes(field) ? Number(target.value) : target.value;
  if (field === 'actorId') m.weaponId = '';
  return { rerender: ['actorId', 'saveEnabled'].includes(field) };
}
