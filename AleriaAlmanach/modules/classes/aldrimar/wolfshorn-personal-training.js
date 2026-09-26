export const WOLFSHORN_IDS = Object.freeze({ ylva: 'bSYZYAEOwiRgy44f6OmO', asgeir: 'oUlhJyX6C4Q69mtLS9u1' });
const cost = (resourceId, name, scope = 'comment') => ({ resourceId, name, amount: 1, scope });
const action = cost('action', 'Aktion'), bonus = cost('bonus-action', 'Bonusaktion'), reaction = cost('reaction', 'Reaktion');
const special = cost('special-action', 'Besondere Aktion', 'persistent');
const personal = { active: true, minimumLevel: 7, status: 'confirmed', trainingForm: 'Persönliche Techniken',
  category: 'technique', activationType: 'action', auraBypass: { allowed: false }, maximumTargets: 1,
  damageModel: { mode: 'weapon-dice', weaponDiceMultiplier: 1 },
  effects: [{ type: 'damage', target: 'target', on: 'hit', inheritWeaponDamageType: true }] };

export function wolfshornPersonalEntries(kind) {
  const ylva = kind === 'ylva';
  const passive = { id: `wolfshorn-${kind}-border-veteran`, name: ylva ? 'Veteranin des Dunkelhains' : 'Grenzer des Dunkelhains',
    active: true, activationType: 'passive', combatUsable: false,
    description: ylva
      ? '+20 maximale TP; +2 Angriff und +1 Schaden mit Bogen und Speer, auch bei Techniken; +3 Wahrnehmung; +3 gegen Furcht; +2 gegen Niederwerfen und erzwungene Bewegung.'
      : '+14 maximale TP; +1 Nahkampfwaffenschaden, auch bei Techniken; +2 gegen Furcht, Niederwerfen und erzwungene Bewegung.',
    mechanics: { maximumHitPoints: ylva ? 20 : 14, ...(ylva ? { dexterityWeaponTypes: ['spear'] } : {}),
      weaponModifiers: [{ weaponTypes: ylva ? ['bow', 'spear'] : ['unarmed', 'sword', 'dagger', 'axe', 'mace', 'spear', 'polearm', 'staff', 'improvised'], attack: ylva ? 2 : 0, damage: 1 }],
      skillModifiers: ylva ? [{ name: 'Wahrnehmung', bonus: 3 }] : [],
      saveModifiers: [{ kind: 'fear', bonus: ylva ? 3 : 2 }, { kind: 'prone', bonus: 2 }, { kind: 'forced-movement', bonus: 2 }] } };
  const technique = ylva ? { ...personal, id: 'ylva-fallender-dorn', name: 'Der fallende Dorn', weaponTypes: ['spear'],
    costs: [action, reaction, special],
    description: 'Zwei getrennte Speerangriffe. Nach dem ersten Treffer: Geschicklichkeitsrettungswurf SG 15. Bei Scheitern erhält der sofortige zweite Angriff Vorteil und einen zusätzlichen Waffenschadenswürfel. Sonst erfolgt er normal, auch wenn der erste Angriff verfehlt. Beide Angriffe sind bezahlt.',
    secondarySave: { enabled: true, attributeKey: 'dexterity', fixedDc: 15, addProficiency: false },
    followUpAttack: { enabled: true, afterMiss: true, inheritWeapon: true, saveFailureBonus: true, repeatCount: 1 } }
    : { ...personal, id: 'asgeir-vier-faenge', name: 'Vier Fänge des Wolfshorns', weaponTypes: ['axe'],
      cultureTraining: { allowedClassIds: ['skjaldr'], requiresDualWield: true }, spendAllRegularActions: true,
      costs: [action, bonus, reaction, cost('asgeir-four-fangs-use', 'Vier Fänge · Kampfnutzung', 'persistent')],
      description: 'Einmal pro Kampf. Verbraucht alle verbleibenden Aktionen, Bonusaktionen und Reaktionen, mindestens je eine. Vier getrennt gewürfelte Angriffe mit abwechselnden Doppeläxten gegen dasselbe Ziel. Treffen alle vier, kann das Ziel im nächsten eigenen Beitrag keine Aktion einsetzen; Bonusaktion und Reaktion bleiben verfügbar.',
      followUpAttack: { enabled: true, afterMiss: true, inheritWeapon: true, alternateHands: true, repeatCount: 3, allHitsStun: true } };
  return { passive, technique };
}

// A release planner calls this once for the named people; no name matching in combat.
export function applyWolfshornTraining(profile, kind) {
  const { passive, technique } = wolfshornPersonalEntries(kind);
  return { ...profile,
    abilities: [...(profile.abilities || []).filter(a => a.id !== passive.id), passive],
    techniques: [...(profile.techniques || []).filter(t => t.id !== technique.id), technique],
    resources: kind === 'asgeir' && !(profile.resources || []).some(r => r.id === 'asgeir-four-fangs-use')
      ? [...(profile.resources || []), { id: 'asgeir-four-fangs-use', name: 'Vier Fänge · Kampfnutzung', current: 1, maximum: 1,
        recovery: 'combat', scope: 'persistent', category: 'technique-use' }] : profile.resources };
}
