const attributes = new Set(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']);
const modes = new Set(['normal', 'advantage', 'disadvantage']);
const resources = new Set(['', 'action', 'bonus-action', 'reaction', 'special-action', 'aura-focus']);
const clean = (value, maximum = 240) => String(value || '').trim().slice(0, maximum);

export function normalizeChallengeWeaponManeuver(value = {}) {
  return { actorId: clean(value.actorId), weaponId: clean(value.weaponId), pickupWeapon: value.pickupWeapon === true,
    resourceId: clean(value.resourceId, 160), extraWeaponDice: Number(value.extraWeaponDice ?? 0),
    rollMode: value.rollMode || 'normal', damageMultiplier: Number(value.damageMultiplier ?? 1),
    save: value.save ? { attribute: clean(value.save.attribute, 40), difficulty: Number(value.save.difficulty) } : null };
}

export function validateChallengeWeaponManeuver(value, targetActorId) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Ein Waffenmanöver benötigt eine Manöver-Konfiguration.';
  const keys = new Set(['actorId', 'weaponId', 'pickupWeapon', 'resourceId', 'extraWeaponDice', 'rollMode', 'damageMultiplier', 'save']);
  if (Object.keys(value).some(key => !keys.has(key))) return 'Das Waffenmanöver enthält ein unbekanntes Regelfeld.';
  for (const [label, id, required] of [['Angreifer', value.actorId, true], ['Ziel', targetActorId, true], ['Waffe', value.weaponId, false]]) {
    if ((required && !id) || (id != null && (typeof id !== 'string' || !id.trim() || id.length > 240 || /[\/\u0000-\u001f]/.test(id)))) return `${label} des Waffenmanövers ist ungültig.`;
  }
  if (value.actorId === targetActorId) return 'Ein Waffenmanöver benötigt zwei unterschiedliche Figuren.';
  if (value.pickupWeapon != null && typeof value.pickupWeapon !== 'boolean') return 'pickupWeapon muss true oder false sein.';
  if (!resources.has(value.resourceId || '')) return 'Die Aktionsressource des Waffenmanövers ist ungültig.';
  if (value.pickupWeapon && (!value.weaponId || !value.resourceId)) return 'Aufheben und Angriff benötigen eine vorhandene Waffen-ID und einen Aktionspunkt.';
  if (!Number.isInteger(value.extraWeaponDice ?? 0) || value.extraWeaponDice < 0 || value.extraWeaponDice > 4) return 'Ein Waffenmanöver erlaubt null bis vier zusätzliche Waffenwürfel.';
  if (!modes.has(value.rollMode || 'normal')) return 'Die Angriffswurfart des Waffenmanövers ist ungültig.';
  if (![1, 2].includes(value.damageMultiplier ?? 1)) return 'Der normale Waffenschaden kann einfach oder doppelt zählen.';
  if (value.save != null && (typeof value.save !== 'object' || Array.isArray(value.save) || !attributes.has(value.save.attribute)
    || !Number.isInteger(value.save.difficulty) || value.save.difficulty < 1 || value.save.difficulty > 40)) return 'Der vorgelagerte Rettungswurf benötigt ein Attribut und SG 1–40.';
  if (value.save && value.pickupWeapon) return 'Aufheben und ein vorgelagerter Rettungswurf gehören in getrennte Manöver.';
  return null;
}

export function challengeWeaponManeuverActorIds(effect) {
  return effect?.type === 'weapon-maneuver' ? [effect.maneuver?.actorId, effect.targetActorId].filter(Boolean) : [];
}

export function describeChallengeWeaponManeuver(effect) {
  const maneuver = effect.maneuver || {};
  const labels = { strength: 'Kraft', dexterity: 'Geschick', constitution: 'Konstitution', intelligence: 'Intelligenz', wisdom: 'Weisheit', charisma: 'Charisma',
    action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion', 'aura-focus': 'Aura-Fokuspunkt' };
  return [maneuver.pickupWeapon ? 'Waffe aufheben + Angriff' : 'Waffenangriff',
    maneuver.save ? `${labels[maneuver.save.attribute]}-Rettung SG ${maneuver.save.difficulty}; Angriff nur bei Misslingen` : '',
    maneuver.extraWeaponDice ? `+${maneuver.extraWeaponDice} Waffenwürfel` : '',
    maneuver.damageMultiplier === 2 ? 'doppelter normaler Schaden' : '',
    maneuver.rollMode === 'advantage' ? 'Vorteil' : maneuver.rollMode === 'disadvantage' ? 'Nachteil' : '',
    maneuver.resourceId ? `1 ${labels[maneuver.resourceId]}` : 'ausgelöster Angriff ohne zusätzliche Aktionskosten'].filter(Boolean).join(' · ');
}
