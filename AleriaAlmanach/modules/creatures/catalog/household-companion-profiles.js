import { getStandardHitPointProgression } from '../../combat/combat-hit-point-progression.js';

// Species-specific starting profiles. Individual level and age remain explicit in the catalog.
const PROFILES = {
  horse: { genus: 'Pferde', limit: 3, size: 'Groß', scores: [16, 14, 14, 2, 12, 10], die: 10, movement: 18, attack: 'Hufschlag', damage: '1d6', damageType: 'Wucht', attribute: 'strength', abilities: [['Reittier', 'Trägt einen geeigneten Reiter. Auf- und Absitzen sowie berittene Manöver verwenden die gemeinsame Reittier- und Aktionslogik.']] },
  dog: { genus: 'Hunde', limit: 4, size: 'Mittel', scores: [12, 14, 12, 3, 14, 10], die: 8, movement: 12, attack: 'Biss', damage: '1d6', damageType: 'Stich', attribute: 'strength', abilities: [['Spürnase', 'Kann vertraute Gerüche aufnehmen und einer Fährte folgen; Wind, Regen und fremde Gerüche beeinflussen die nötigen Proben.']] },
  lapdog: { genus: 'Hunde', limit: 4, size: 'Klein', scores: [6, 14, 10, 3, 12, 14], die: 6, movement: 9, attack: 'Biss', damage: '1d4', damageType: 'Stich', attribute: 'dexterity', abilities: [['Haushund', 'Sucht die Nähe vertrauter Menschen. Reagiert aufmerksam auf Stimmen und Musik.']] },
  cat: { genus: 'Katzen', limit: 2, size: 'Winzig', scores: [3, 16, 10, 3, 14, 10], die: 4, movement: 9, attack: 'Krallen', damage: '1d4', damageBonus: -2, damageType: 'Hieb', attribute: 'dexterity', abilities: [['Kletterin', 'Bewegt sich sicher auf schmalen Vorsprüngen und klettert bis zu 6 m; schwierige Stellen benötigen passende Proben.'], ['Leiser Schritt', 'Schleicht und beobachtet aufmerksam. Heimlichkeit wird gegen die Wahrnehmung der Umgebung geprüft.']] },
  kite: { genus: 'Vögel', limit: 2, size: 'Klein', scores: [4, 16, 10, 2, 16, 8], die: 4, movement: 18, attack: 'Krallenhieb', damage: '1d4', damageBonus: -1, damageType: 'Hieb', attribute: 'dexterity', abilities: [['Flug', 'Fliegt bis zu 18 m, am Boden bis zu 3 m. Benötigt freie Luft und nutzbare Flügel.'], ['Scharfer Blick', 'Beobachtet die Umgebung aus der Luft; Entfernung, Deckung und Sichtverhältnisse beeinflussen Wahrnehmungsproben.']] },
  peacock: { genus: 'Vögel', limit: 2, size: 'Klein', scores: [4, 12, 10, 2, 12, 14], die: 4, movement: 6, attack: 'Schnabelhieb', damage: '1d4', damageBonus: -2, damageType: 'Stich', attribute: 'dexterity', abilities: [['Kurzer Flug', 'Kann kurze Strecken bis zu 9 m fliegen, um einen erhöhten Sitzplatz oder Schutz zu erreichen.'], ['Lauter Ruf', 'Sein Ruf ist weithin hörbar. Das Rad und die Rufe dienen der Balz und Verständigung.']] }
};

export function createHouseholdCompanion(spec) {
  const base = PROFILES[spec.profile];
  if (!base || spec.level < 1 || spec.level > base.limit) throw new Error(`Ungültige Tierstufe: ${spec.name}`);
  const scores = spec.scores || base.scores;
  const hp = getStandardHitPointProgression({ hitDie: base.die, level: spec.level, constitutionModifier: Math.floor((scores[2] - 10) / 2) }).total;
  const itemId = `${spec.ownerSlug}-${spec.slug}`;
  return {
    id: `companion-${itemId}`, name: spec.name, type: 'Tier', species: spec.species,
    level: spec.level, challengeRating: spec.level, size: base.size,
    classification: { genus: base.genus, location: 'Celtigerns Wacht', house: '' },
    habitat: spec.habitat || 'Burg Draig, Celtigerns Wacht',
    portrait: spec.portrait || `https://i.imgur.com/${spec.image}`, portraitCaption: `${spec.name} · ${spec.ownerName}`,
    itemOrigin: { instanceId: itemId, inventoryItemId: itemId, templateId: '', ownerCharacterId: spec.ownerId, ownerCharacterName: spec.ownerName, disposition: 'owned' },
    biography: { summary: spec.description, personality: spec.description, bonds: spec.bonds || `Tierischer Begleiter von ${spec.ownerName}.`, facts: [{ label: 'Rolle', value: base.genus === 'Pferde' ? 'Reittier' : 'Gefährte' }] },
    combatProfile: {
      attributes: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((key, i) => ({ key, score: scores[i] })),
      hitPoints: { current: hp, maximumOverride: hp, temporary: 0, hitDie: base.die },
      armorClass: { base: 10, dexterityMode: 'full', override: null },
      combat: { movement: spec.movement || base.movement },
      skills: [{ id: `${itemId}-perception`, name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained' }],
      weapons: [{ id: `${itemId}-natural`, name: base.attack, weaponType: 'natural', damageFormula: base.damage, damageType: base.damageType, attackAttribute: base.attribute,
        damageBonus: base.damageBonus || 0, proficient: true, equipped: true, activationType: 'action', range: base.size === 'Groß' ? 'Nahkampf · 1,5 m' : 'Nahkampf · 0,5 m', properties: 'Naturwaffe' }],
      abilities: [...base.abilities, ...(spec.abilities || [])].map(([name, description], i) => ({ id: `${itemId}-ability-${i}`, name, description, activationType: 'passive', active: true, combatUsable: false })),
      armorItems: [], resources: [], techniques: [], quirks: [], conditions: [], magic: { enabled: false, spells: [] }
    },
    loot: { currency: '', notes: 'Persönlicher Begleiter; kein festgelegter Handelswert.', items: [] }, notes: spec.description
  };
}
