const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function renderCombatWeaponGrip(actor = {}) {
  if (!actor.supportsVersatileGrip) return '';
  const twoHanded = actor.weaponGrip === 'two-handed';
  const blocked = actor.weaponGripBlockedReason;
  return `<label class="combat-weapon-grip">Führung
    <select data-combat-input="weaponGrip" aria-label="Waffenführung">
      <option value="one-handed"${twoHanded ? '' : ' selected'}>Einhändig · ${escape(actor.selectedAction?.baseDamageFormula)}</option>
      <option value="two-handed"${twoHanded ? ' selected' : ''}${blocked ? ' disabled' : ''}>Zweihändig · ${escape(actor.selectedAction?.weapon?.versatileDamageFormula)} · −1 Angriff</option>
    </select>
    <small class="combat-loadout-hint">${escape(blocked || 'Einhändig: präziser. Zweihändig: mehr Schaden, −1 Angriff; beide Hände nötig. Gleiche Aktionskosten.')}</small>
  </label>`;
}
