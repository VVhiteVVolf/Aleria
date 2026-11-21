import { applyCondition, condition, costs, creatureAbility, damage, damageAffinity, encounterCard, naturalAttack } from './encounter-card-model.js';

const forms = [
  ['mulinar-frisch', 'Frisch infizierter Vampirspross', 6, 52, 17, 16, 14, '1d8', '2d8', 2],
  ['mulinar-entfesselt', 'Entfesselter Vampirspross', 10, 86, 19, 20, 16, '1d10', '3d8', 3]
];

export const MULINAR_ENCOUNTERS = forms.map(([id, name, level, hp, defense, dexterity, dc, bite, scream, maximumTargets]) => {
  const mirage = condition('mulinar-trugbild', 'Schattenbild', 'Lenkt den nächsten nichtkritischen Treffer ab.', { ward: { enabled: true, charges: 1,
    deflectChance: 100, breaksOnCriticalHit: true } });
  const fascination = condition('mulinar-umgarnung', 'Umgarnter Blick', 'Mit Nachteil angreifen und 3 m langsamer bewegen.', {
    mechanics: { attackRollMode: 'disadvantage', movement: -3 }
  });
  const magicalAbility = (slug, label, options) => creatureAbility(slug, label, { delivery: 'spell', requiresVoice: true, ...options });
  return encounterCard({ id, groupId: 'mulinare', name, species: 'Mulinar', habitat: 'Dunkle Kreuzgänge und verlassene Krypten',
    level, hp, defense, speed: 14 + (level === 10 ? 2 : 0), scores: [14, dexterity, 14, 12, 12, 16],
    saves: ['dexterity', 'charisma'], tags: ['vampir', 'tenebrium-empfindlich'],
    traits: [{ id: 'mulinar-tenebrium', name: 'Tenebriumempfindlich', description: 'Tenebrium verursacht doppelten Schaden. Ein Treffer hemmt Bewegung und Magie bis zum Ende des nächsten eigenen Beitrags.' }],
    damageAffinities: [damageAffinity('Tenebrium', 'vulnerable', 'Tenebriumempfindlichkeit')],
    weapons: [naturalAttack('mulinar-krallen', 'Kralle', '1d6', 'Hieb', { attackAttribute: 'dexterity', damageAttribute: 'dexterity' })],
    abilities: [creatureAbility('mulinar-fangzaehne', 'Fangzähne', { costs: costs('action', 'reaction'), rollFormula: bite, damageType: 'Stich',
      description: 'Schneller, gezielter Biss mit den langen Fangzähnen.' }),
    magicalAbility('mulinar-schattenbild', 'Schattenbild', { activationType: 'bonus-action', costs: costs('bonus-action'), resolutionType: 'automatic',
      range: 'Selbst', description: 'Ein Trugbild lenkt den nächsten nichtkritischen Treffer ab.', effects: [applyCondition(mirage, 'always', 'self')] }),
    magicalAbility('mulinar-lockstimme', 'Lockstimme', { costs: costs('action'), resolutionType: 'saving-throw', saveAttribute: 'wisdom', saveDc: dc - 1,
      range: 'Bis 12 m', description: 'Verdreht die Gefühle des Ziels. Misslingt die WIS-Rettung, ist es bis zum nächsten eigenen Beitragsende umgarnt.',
      effects: [applyCondition(fascination, 'save-failure')] }),
    magicalAbility('mulinar-schallstoss', level === 10 ? 'Schrei der Leere' : 'Kreischender Stoß', { activationType: 'special-action',
      costs: costs('special-action', 'action', 'reaction'), resolutionType: 'saving-throw', saveAttribute: 'constitution', saveDc: dc,
      range: 'Kegel · 9 m', maximumTargets, halfDamageOnSave: true, damageType: 'Schall',
      description: `Eine gerichtete Schallwelle trifft bis zu ${maximumTargets} erreichbare Ziele. Eine gelungene KON-Rettung halbiert den Schaden.`,
      effects: [{ ...damage('mulinar-druckwelle', scream, 'Schall', 'hit', 'selected'), magical: true }] })]
  });
});
