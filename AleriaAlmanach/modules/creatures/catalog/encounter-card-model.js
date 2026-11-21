const artRoot = '/Bestiarium/assets/kreaturenkarten';

export const ENCOUNTER_GROUPS = Object.freeze([
  { id: 'versunkene', name: 'Versunkene' },
  { id: 'landtrolle', name: 'Landtrolle', genus: 'Trolle' },
  { id: 'urgren', name: 'Urgren', genus: 'Bären' },
  { id: 'mulinare', name: 'Mulinare' },
  { id: 'warge', name: 'Warge', genus: 'Wölfe' },
  { id: 'hornlinge', name: 'Hornlinge' }
]);

export function encounterArt(id) {
  return { scene: `${artRoot}/szenen/${id}.webp`, portrait: `${artRoot}/portraits/${id}.webp` };
}

export const encounterIcon = groupId => `${artRoot}/zeichen/${groupId}.webp`;

const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
export const costs = (...ids) => ids.map(resourceId => ({ resourceId, amount: 1,
  scope: resourceId === 'special-action' ? 'persistent' : 'comment' }));

export function encounterCard({ id, groupId, name, species, habitat, level, hp, defense, speed, scores, traits = [],
  weapons, abilities = [], saves = [], size = 'Mittel', hitDie = 8, resources = [], damageAffinities = [], tags = [], profile = {} }) {
  const { scene, portrait } = encounterArt(id);
  const group = ENCOUNTER_GROUPS.find(entry => entry.id === groupId);
  return {
    id: `catalog-${id}`, groupId, artId: id, scene, name, type: group.name, species, habitat, level, challengeRating: level, size,
    portrait, portraitCaption: `${name} · ${habitat}`, avatars: [{ id: `${id}-scene`, img: scene, label: 'Szenenbild' }],
    classification: { genus: group.genus || group.name },
    notes: traits.map(trait => trait.description).join('\n'),
    combatProfile: {
      progression: { level }, attributes: attributes.map((key, index) => ({ key, score: scores[index] })),
      hitPoints: { current: hp, maximumOverride: hp, hitDie }, armorClass: { override: defense }, combat: { movement: speed },
      savingThrows: saves.map(attributeKey => ({ attributeKey, proficient: true })), weapons,
      abilities: [...abilities, ...traits.map(trait => ({ active: true, activationType: 'passive', ...trait }))],
      resources, damageAffinities, encounterTags: tags, ...profile
    }
  };
}

export function naturalAttack(id, name, formula, damageType, extra = {}) {
  return { id, name, weaponType: 'natural', attackAttribute: 'strength', damageAttribute: 'strength',
    proficient: true, equipped: true, range: 'Nahkampf · 1,5 m', damageFormula: formula, damageType, ...extra };
}

export function creatureAbility(id, name, options = {}) {
  return { id, name, active: true, combatUsable: true, activationType: 'action', range: 'Nahkampf · 1,5 m',
    resolutionType: 'weapon-attack', auraBypass: { allowed: false }, ...options };
}

export const damageAffinity = (damageType, response, source) => ({ damageType, response, source });
export const damage = (id, formula, damageType, on = 'hit', target = 'target') => ({ id, type: 'damage', formula, damageType, on, target });
export const condition = (id, name, description, options = {}) => ({ id, name, description,
  durationModel: { kind: 'actor-comments', remainingActorComments: 1 }, ...options });
export const applyCondition = (effect, on = 'hit', target = 'target') => ({ id: effect.id, type: 'apply-condition', condition: effect, on, target });

export function holdAbility(id, name, dc, payment, endCondition) {
  return creatureAbility(id, name, { resolutionType: 'saving-throw', saveAttribute: 'dexterity', saveDc: dc,
    costs: payment, activationType: payment[0].resourceId, concentration: true, holdAction: true,
    description: `Misslingt die GES-Rettung gegen SG ${dc}, hält die Kreatur das Ziel fest. ${endCondition.description}`,
    effects: [{ ...applyCondition(endCondition, 'save-failure'), concentration: true }] });
}
