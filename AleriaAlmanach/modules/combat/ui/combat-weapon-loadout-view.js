import { canUseCombatOffHand, isPairedCombatWeapon, getCombatWeaponLoadout } from '../combat-weapon-loadout.js';

const glyphs = Object.freeze({ unarmed: '✦', sword: '⚔', dagger: '†', axe: '⚒', mace: '◆', spear: '↟', polearm: 'Ψ', bow: '➳', crossbow: '⌖', staff: '⌇', shield: '⬙' });
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);

function weaponSlot(weapon, { hand = '', active = false, free = false } = {}) {
  const source = String(weapon.image || '');
  const image = /^(?:https?:\/\/|data:image\/|\.\.?\/)/i.test(source) ? source : '';
  const label = active ? `${hand} · Aktiv geführt` : free ? 'Als Startwaffe wählen · kostenlos' : 'Wechseln · 1 Bonusaktion';
  return `<button type="button" class="combat-weapon-slot" data-state="${active ? 'active' : 'stowed'}" data-weapon-id="${escape(weapon.id)}" data-combat-controller-action="${active ? 'keep-weapon' : 'select-weapon'}" aria-pressed="${active}" title="${escape(`${weapon.name} · ${label}`)}">
    <span class="combat-weapon-slot-icon" aria-hidden="true"><span>${glyphs[weapon.weaponType] || '•'}</span>${image ? `<img src="${escape(image)}" data-combat-weapon-image alt="" decoding="async">` : ''}</span>
    <span class="combat-weapon-slot-copy"><strong>${escape(weapon.name)}</strong><small>${escape(label)}</small></span>
  </button>`;
}

export function renderWeaponLoadout(actor = {}, { freeEquipment = false, requestedLoadout = null } = {}) {
  if (!(actor.actions || []).some(action => action.kind === 'equipment-switch')) return '';
  const loadout = actor.weaponLoadout || getCombatWeaponLoadout(actor);
  const weapons = (actor.weapons || []).filter(weapon => weapon.name);
  const leftOptions = weapons.filter(weapon => canUseCombatOffHand(weapon)
    && (weapon.id !== loadout.rightWeaponId || isPairedCombatWeapon(weapon)));
  const canPair = canUseCombatOffHand(loadout.right || {}) && leftOptions.length > 0;
  const preparation = actor.equipmentPreparation;
  return `<section class="combat-weapon-loadout" aria-label="Waffenführung" data-current-right="${escape(loadout.rightWeaponId)}" data-current-left="${escape(loadout.leftWeaponId)}">
    <div class="combat-weapon-active"><span class="combat-field-caption">Geführte Waffen</span>
      <label class="combat-dual-toggle"><input type="checkbox" data-combat-loadout="dual"${loadout.dualWield ? ' checked' : ''}${canPair ? '' : ' disabled'}> Zwei Waffen · rechts und links</label>
      <div class="combat-active-hands">${loadout.right ? weaponSlot(loadout.right, { hand: 'Rechts', active: true }) : ''}${loadout.left ? weaponSlot(loadout.left, { hand: 'Links', active: true }) : ''}</div>
      ${loadout.dualWield ? `<label class="combat-offhand-choice">Linke Hand<select data-combat-loadout="left">${leftOptions.map(weapon => `<option value="${escape(weapon.id)}"${weapon.id === loadout.leftWeaponId ? ' selected' : ''}>${escape(weapon.name)}</option>`).join('')}</select></label><small class="combat-loadout-hint">Jeder Angriff behält seine eigenen Kosten. Kein zusätzlicher Angriff durch das Waffenpaar; die zweite Hand ersetzt einen geführten Schild.</small>` : ''}
    </div>
    <div class="combat-weapon-alternatives"><span class="combat-field-caption">Waffenwechsel <small>· ${freeEquipment ? 'Startausrüstung kostenlos' : '1 Bonusaktion'}</small></span>
      <div class="combat-weapon-slots">${weapons.filter(weapon => weapon.id !== loadout.rightWeaponId).map(weapon => weaponSlot(weapon, { free: freeEquipment })).join('')}</div>
      ${requestedLoadout ? `<div class="combat-equipment-preparation" role="status"><span>${escape(preparation?.error || (preparation?.free ? 'Startausrüstung gewählt · kostenlos' : preparation ? 'Waffe gewechselt · 1 Bonusaktion im Entwurf verbraucht' : 'Ausrüstung entspricht der vorherigen Auswahl'))}</span><button type="button" data-combat-controller-action="cancel-equipment">Wechsel aufheben</button></div>` : ''}
    </div>
  </section>`;
}

export function bindWeaponImageFallback(composer) {
  composer.addEventListener('error', event => {
    if (event.target.matches?.('[data-combat-weapon-image]')) event.target.remove();
  }, true);
}
