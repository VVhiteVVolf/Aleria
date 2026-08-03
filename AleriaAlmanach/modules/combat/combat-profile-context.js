import {
  getAttributeModifier,
  getSavingThrowTotal,
  getSkillTotal,
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  resolveCharacterCombatProfile,
  sanitizeCharacterCombatProfile
} from './combat-profile-model.js?v=20260803-combat-sheet-v6';

export function buildCombatProfileAiSnapshot(character = {}) {
  const profile = sanitizeCharacterCombatProfile(character.combatProfile || character, { ensureRequiredSkills: character.entityType !== 'creature' });
  const resolved = resolveCharacterCombatProfile({ ...character, combatProfile: profile });
  return {
    schemaVersion: profile.schemaVersion,
    instruction: 'Diese Kampfdaten sind vollständig und verbindlich. Berücksichtige jede Kategorie sowie ausdrücklich auch 0, false und null. Strukturierte Mechanik gilt exakt; bei Marotten, Zuständen, Fähigkeiten, Aura und Präsenz fließen Zahlen nur in ihrer aktiven Form ein. Latente gegnerische Aura-Modifikatoren werden im Kampfsystem auf den jeweiligen Gegner angewandt. Abgeleitete Gesamtwerte enthalten Modifikatoren bereits und dürfen nicht doppelt addiert werden. Aktion, Bonusaktion und Reaktion werden pro Gesamtkommentar aufgefüllt. Besondere Aktion, Mana/Fokus, Aura-Fokus sowie Celestiale und Infernale Punkte sind tagesgebundene, persistente Ressourcen und dürfen nicht vor dem nächsten Tag aufgefüllt werden. Freitext und aiInstructions beeinflussen Interpretation und Erzählung, sofern sie der Mechanik nicht widersprechen.',
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
      movementMeters: resolved.movement,
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
    actionEconomy: profile.resources.filter(resource => resource.scope === 'comment'),
    dailyResources: profile.resources.filter(resource => resource.recovery === 'day'),
    techniquesAndForms: profile.techniques,
    quirksAndTraits: profile.quirks,
    conditionsAndEffects: profile.conditions,
    specialAbilities: profile.abilities,
    magic: profile.magic,
    auraPresenceAndDomain: profile.aura,
    cheatRules: profile.cheats,
    notesAndSpecialRules: profile.notes
  };
}

export function formatCombatProfileAiContext(character = {}) {
  return [
    'VERBINDLICHER ALERIA-KAMPFBOGEN',
    JSON.stringify(buildCombatProfileAiSnapshot(character), null, 2)
  ].join('\n');
}
