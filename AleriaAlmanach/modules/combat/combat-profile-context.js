import {
  getAttributeModifier,
  getSavingThrowTotal,
  getSkillTotal,
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  resolveCharacterCombatProfile,
  sanitizeCharacterCombatProfile
} from './combat-profile-model.js?v=20260802-combat-sheet-v4';

export function buildCombatProfileAiSnapshot(character = {}) {
  const profile = sanitizeCharacterCombatProfile(character.combatProfile || character);
  const resolved = resolveCharacterCombatProfile({ ...character, combatProfile: profile });
  return {
    schemaVersion: profile.schemaVersion,
    instruction: 'Diese Kampfdaten sind vollständig und verbindlich. Berücksichtige jede Kategorie sowie ausdrücklich auch 0, false und null. Strukturierte Mechanik gilt exakt; bei Marotten, Zuständen und Fähigkeiten fließen Zahlen nur mit active=true ein. Abgeleitete Gesamtwerte enthalten diese Modifikatoren bereits und dürfen nicht doppelt addiert werden. Freitext beeinflusst Interpretation und Erzählung, sofern er der Mechanik nicht widerspricht.',
    character: {
      id: String(character.id || ''),
      name: String(character.name || 'Unbekannte Figur'),
      identity: profile.identity,
      progression: {
        ...profile.progression,
        effectiveLevel: resolved.effectiveLevel,
        proficiencyBonus: resolved.proficiencyBonus
      }
    },
    attributes: profile.attributes.map(attribute => ({
      key: attribute.key,
      label: attribute.label,
      shortLabel: attribute.shortLabel,
      score: attribute.score,
      modifier: getAttributeModifier(attribute),
      modifierOverride: attribute.modifierOverride
    })),
    derivedCombatValues: {
      currentHitPoints: resolved.currentHitPoints,
      maximumHitPoints: resolved.maximumHitPoints,
      temporaryHitPoints: resolved.temporaryHitPoints,
      armorClass: resolved.totalDefense,
      initiative: resolved.initiative,
      movementMeters: profile.combat.movement,
      proficiencyBonus: resolved.proficiencyBonus,
      passivePerception: resolved.passivePerception,
      spellAttackModifier: resolved.spellAttackModifier,
      spellSaveDc: resolved.spellSaveDc
    },
    hitPointRules: profile.hitPoints,
    armorClassRules: profile.armorClass,
    combatModifiers: profile.combat,
    savingThrows: profile.savingThrows.map(save => ({
      ...save,
      total: getSavingThrowTotal(profile, save.attributeKey)
    })),
    skills: profile.skills.map(skill => ({ ...skill, total: getSkillTotal(profile, skill) })),
    weapons: profile.weapons.map(weapon => ({
      ...weapon,
      totalAttackModifier: getWeaponAttackModifier(profile, weapon),
      totalDamageModifier: getWeaponDamageModifier(profile, weapon)
    })),
    armor: profile.armorItems,
    coreResources: profile.resources,
    quirksAndTraits: profile.quirks,
    conditionsAndEffects: profile.conditions,
    specialAbilities: profile.abilities,
    magic: profile.magic,
    notesAndSpecialRules: profile.notes
  };
}

export function formatCombatProfileAiContext(character = {}) {
  return [
    'VERBINDLICHER ALERIA-KAMPFBOGEN',
    JSON.stringify(buildCombatProfileAiSnapshot(character), null, 2)
  ].join('\n');
}
