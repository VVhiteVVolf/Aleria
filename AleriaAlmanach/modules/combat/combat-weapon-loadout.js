// Two occupied hands are equipment, never an additional attack or a doubled die.
export function isPairedCombatWeapon(weapon = {}) {
  return /^dual-/.test(weapon.weaponProfileId || '') || /\bpaar\b|beidhändig/i.test(`${weapon.name || ''} ${weapon.properties || ''}`);
}

export function canUseCombatOffHand(weapon = {}) {
  return !['unarmed', 'natural', 'bow', 'crossbow', 'firearm', 'shield', 'polearm', 'spear'].includes(weapon.weaponType)
    && !/gro(?:ß|ss)(?:schwert|axt)|zweihänder|zweihändig|langbogen|kurzbogen|armbrust|hellebarde|lanze|partisane|dreizack/i.test(`${weapon.name || ''} ${weapon.properties || ''}`);
}

export function getCombatWeaponLoadout(profile = {}) {
  const weapons = Array.isArray(profile.weapons) ? profile.weapons : [];
  const right = weapons.find(weapon => weapon.equipped) || weapons[0] || null;
  const requestedLeft = profile.combat?.offHandWeaponId;
  const leftId = requestedLeft == null ? (isPairedCombatWeapon(right || {}) ? right?.id : '') : String(requestedLeft);
  const left = weapons.find(weapon => weapon.id === leftId) || null;
  const validLeft = right && left && canUseCombatOffHand(right) && canUseCombatOffHand(left)
    && (left.id !== right.id || isPairedCombatWeapon(right));
  return { right, left: validLeft ? left : null, rightWeaponId: right?.id || '', leftWeaponId: validLeft ? left.id : '', dualWield: !!validLeft };
}

export function normalizeCombatLoadout(value) {
  if (!value || typeof value !== 'object') return null;
  return { rightWeaponId: String(value.rightWeaponId || '').trim().slice(0, 180), leftWeaponId: String(value.leftWeaponId || '').trim().slice(0, 180) };
}

export function validateCombatLoadout(profile, value) {
  const requested = normalizeCombatLoadout(value);
  const weapons = Array.isArray(profile.weapons) ? profile.weapons : [];
  const right = weapons.find(weapon => weapon.id === requested?.rightWeaponId);
  const left = weapons.find(weapon => weapon.id === requested?.leftWeaponId);
  if (!right) return 'Die gewählte rechte Waffe gehört nicht zur Ausrüstung.';
  if (requested.leftWeaponId && !left) return 'Die gewählte linke Waffe gehört nicht zur Ausrüstung.';
  if (left && (!canUseCombatOffHand(right) || !canUseCombatOffHand(left))) return 'Diese Waffe benötigt beide Hände oder eignet sich nicht als zweite Handwaffe.';
  if (left && left.id === right.id && !isPairedCombatWeapon(right)) return 'Eine einzelne Waffe kann nicht gleichzeitig in beiden Händen als Waffenpaar geführt werden.';
  return '';
}

export function getCombatTechniqueWeapon(loadout) {
  const weapon = loadout.right;
  if (!weapon) return null;
  const blade = item => ['sword', 'dagger'].includes(item?.weaponType);
  if (loadout.dualWield && blade(weapon) && blade(loadout.left)) {
    return { ...weapon, weaponProfileId: weapon.weaponType === 'dagger' ? 'dual-daggers' : 'dual-swords', versatileDamageFormula: '' };
  }
  if (isPairedCombatWeapon(weapon) && !loadout.dualWield) return { ...weapon, weaponProfileId: weapon.weaponType === 'dagger' ? 'dagger' : weapon.weaponType };
  return loadout.dualWield ? { ...weapon, versatileDamageFormula: '' } : weapon;
}

// A new declared encounter starts a new opening. Without a declaration the scene
// history supplies that boundary. Server callers pass trusted history only.
export function getActorsWithCombatPosts(comments = []) {
  const actors = new Set();
  for (const comment of comments) {
    if (comment.combatEncounter?.operation === 'start') actors.clear();
    const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [comment];
    for (const segment of segments) {
      for (const resolution of segment.combatResolutions || [segment.combatResolution]) {
        if (resolution?.actorId) actors.add(String(resolution.actorId));
      }
    }
  }
  return actors;
}
export function usesCharacterWeaponLoadout(character = {}) {
  return character.entityType !== 'creature' && !character.sourceCreatureId;
}
