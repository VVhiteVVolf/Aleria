import { applyCondition, condition, costs, creatureAbility, damage, damageAffinity, encounterCard, naturalAttack } from './encounter-card-model.js';

const prey = condition('hornling-beute', 'Gezeichnete Beute', 'Ein anderer Hornling kann diese Spur beim Angriff nutzen.', { creatureMark: 'hornling' });
const mark = applyCondition(prey, 'always');
const variants = [
  ['hornling-spaeher', 'Hornling Späher', 1, 15, 12, 12, 15, '1d4', 'Kurzer Jagdspeer'],
  ['hornling-jaeger', 'Hornling Jäger', 2, 23, 13, 14, 15, '1d6', 'Jagdspeer'],
  ['hornling-krieger', 'Hornling Krieger', 3, 33, 14, 16, 14, '1d8', 'Schwerer Steinspeer'],
  ['hornling-haeuptling', 'Hornling Häuptling', 5, 54, 15, 18, 14, '1d10', 'Speer des Häuptlings']
];

export const HORNLING_ENCOUNTERS = variants.map(([id, name, level, hp, defense, strength, dexterity, dice, weapon]) => encounterCard({
  id, groupId: 'hornlinge', name, species: 'Hornling', habitat: 'Waldreviere und alte Jagdpfade', level, hp, defense, speed: 9, size: 'Klein',
  scores: [strength, dexterity, 12 + Math.floor(level / 2), 9, 14, 9], hitDie: 8, saves: ['dexterity'], tags: ['hornling'],
  damageAffinities: [damageAffinity('Feuer', 'vulnerable', 'Trockenes Laubhaar')],
  traits: [{ id: 'hornling-jagdsinn', name: 'Jagdinstinkt', description: '+1 Angriff gegen Tiere und +2 Schaden gegen Beute, die ein anderer Hornling markiert hat.',
    triggerRules: [{ id: 'hornling-tierjaeger', name: 'Jagdinstinkt', phase: 'pre-roll', actionScope: 'global', weaponAttackOnly: true, requiredTargetTags: ['tier'], effects: { attackModifier: 1 } },
      { id: 'hornling-clanjagd', name: 'Clanjagd', phase: 'pre-hit-damage', actionScope: 'global', weaponAttackOnly: true,
        condition: 'would-hit', requiredOtherMark: 'hornling', effects: { damageModifier: 2 } }] }],
  weapons: [naturalAttack('hornling-steinspeer', weapon, dice, 'Stich', { weaponType: 'spear' })],
  abilities: [
    creatureAbility('hornling-faehrte', level === 5 ? 'Jagdzeichen des Häuptlings' : 'Beute zeichnen', { activationType: 'bonus-action', costs: costs('bonus-action'),
      range: 'Bis 12 m', resolutionType: 'automatic', maximumTargets: level === 5 ? 2 : 1,
      description: 'Markiert erreichbare Beute für andere Hornlinge bis zum Ende des nächsten Beitrags des Ziels.', effects: level === 5 ? [{ ...mark, target: 'selected' }] : [mark] }),
    ...(level >= 3 ? [creatureAbility('hornling-geweihstoss', 'Geweihstoß', { costs: costs('action', 'reaction'), rollFormula: '2d6', damageType: 'Wucht',
      description: 'Der Hornling stößt mit dem Geweih zu und markiert das getroffene Ziel.', effects: [damage('geweih-wucht', '2d6', 'Wucht'), applyCondition(prey)] })] : [])]
}));
