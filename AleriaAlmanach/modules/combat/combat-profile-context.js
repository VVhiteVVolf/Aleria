import {
  getAttributeModifier,
  getSavingThrowTotal,
  getSkillTotal,
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  resolveCharacterCombatProfile,
  sanitizeCharacterCombatProfile
} from './combat-profile-model.js?v=20260808-duncan-v1';
import { getOrderedSpellSlotResources, getSpellLevelLabel } from './combat-spell-slots.js?v=20260803-character-creation-v1';
import { getSpellManaCost } from './combat-resource-progression.js?v=20260808-duncan-v1';

const ACTION_ECONOMY_RESOURCE_IDS = new Set(['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus']);

export function buildCombatProfileAiSnapshot(character = {}) {
  const profile = sanitizeCharacterCombatProfile(character.combatProfile || character, {
    ensureRequiredSkills: character.entityType !== 'creature',
    ensureSpellSlots: character.entityType !== 'creature'
  });
  const resolved = resolveCharacterCombatProfile({ ...character, combatProfile: profile });
  return {
    schemaVersion: profile.schemaVersion,
    instruction: 'Diese Kampfdaten sind vollständig und verbindlich. Berücksichtige jede Kategorie sowie ausdrücklich auch 0, false und null. Volk, Hintergrund und Klasse sind strukturierte Ausgangsvorlagen; ihre bereits eingerechneten Attributsboni und Fertigkeitskompetenzen dürfen nicht doppelt addiert werden. Ausbildungen bestimmen, welche Waffen, Rüstungen und Werkzeuge die Figur regelgerecht beherrscht. Inventar-verknüpfte Waffen und Rüstungen sind dieselben Gegenstände; sie dürfen nicht als zusätzliche Kopie gezählt werden. versatileDamageFormula gilt nur bei ausdrücklich zweihändiger Verwendung, dexterityUnlockLevel erst ab der angegebenen Stufe. Ständige strukturierte Mechanik gilt exakt; triggerRules gelten ausschließlich, wenn das serverseitige Regelprotokoll ihre Anwendung bestätigt. Marotten, Zustände, Fähigkeiten, Aura und Präsenz fließen nur in aktiver und regelkonformer Form ein. Latente gegnerische Aura-Modifikatoren werden im Kampfsystem auf den jeweiligen Gegner angewandt. Abgeleitete Gesamtwerte enthalten Modifikatoren bereits und dürfen nicht doppelt addiert werden. Aktion, Bonusaktion und Reaktion werden pro Gesamtkommentar aufgefüllt. Aura-Fokuspunkte sind tagesgebundene Universalpunkte: Eine bestätigte Aura-Zahlung ersetzt das gesamte reguläre Kostenpaket der Handlung, sie wird niemals zusätzlich berechnet. Zaubertricks sind Grad 0 und kosten immer 1 Mana zusätzlich zu ihrer hinterlegten Aktionsart. Zauber der Grade I bis X kosten mit steigendem Grad mehr Mana und dürfen beliebig oft gewirkt werden, solange Mana/Fokus reicht - es gibt keine separat begrenzten Zauberplätze mehr; ein Zauberplatz mit Maximum ≥1 zeigt nur, dass dieser Grad bereits freigeschaltet ist. Figuren mit hinterlegtem magic.bypassResourceId (z.B. Kleriker göttlicher oder infernaler Gottheiten) dürfen ihre Celestialen oder Infernalen Punkte anstelle von Mana für denselben Zauber ausgeben, niemals zusätzlich. Hexer/Bündnisträger zahlen für ihre Zauber von vornherein Paktpunkte statt Mana (magic.manaResourceId zeigt darauf). Fokus (magic.focusEnabled/focusResourceId) ist eine von Mana strukturell getrennte Ressource für Asketen und ähnliche Kampfkünstler. Besondere Aktion, Mana, Fokus, Aura-Fokus, Celestiale, Infernale und Paktpunkte sind persistente Ressourcen und werden nur durch ihre festgelegte Erholungsregel aufgefüllt. Inventarnutzungs-Fähigkeiten gelten nur, wenn der serverseitige inventoryUse-Effekt protokolliert wurde. Freitext und aiInstructions beeinflussen nur Interpretation und Erzählung und dürfen das bestätigte Ergebnis nie verändern.',
    character: {
      id: String(character.id || ''),
      name: String(character.name || 'Unbekannte Figur'),
      identity: profile.identity,
      templateSelections: profile.templateSelections,
      progression: {
        ...profile.progression,
        effectiveLevel: resolved.effectiveLevel,
        proficiencyBonus: resolved.proficiencyBonus,
        advancementRules: {
          normalAttributeIncreaseLevels: [4, 8, 12, 16, 20],
          normalAttributePoints: 2,
          specialAttributePointsPerLevel: 4,
          firstAuraFocusPointLevel: 6
        }
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
    proficiencies: profile.proficiencies,
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
    actionEconomy: profile.resources.filter(resource => ACTION_ECONOMY_RESOURCE_IDS.has(resource.id)),
    actionEconomyRules: {
      auraFocusRule: {
        resourceId: profile.aura.focusResourceId || 'aura-focus',
        paymentRole: 'universal-substitute',
        replacesEntireRegularCostPackage: true,
        preservesLimitedTechniqueUses: true,
        defaultCost: profile.aura.focusBypassCost
      }
    },
    dailyResources: profile.resources.filter(resource => resource.recovery === 'day'),
    techniquesAndForms: profile.techniques,
    quirksAndTraits: profile.quirks,
    conditionsAndEffects: profile.conditions,
    specialAbilities: profile.abilities,
    magic: {
      ...profile.magic,
      spellLevelRules: {
        cantrip: { level: 0, label: 'Zaubertrick', manaCost: getSpellManaCost(0), spellSlotCost: 0 },
        slotLevels: Array.from({ length: 10 }, (_entry, index) => ({ level: index + 1, label: getSpellLevelLabel(index + 1) })),
        recovery: 'long-rest'
      },
      spellSlots: getOrderedSpellSlotResources(profile.resources, profile.magic.slotResourceIds)
    },
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
