import { applyCondition, condition, costs, creatureAbility, damage, damageAffinity, encounterCard, holdAbility, naturalAttack } from './encounter-card-model.js';

const variants = [
  ['landtroll-jung', 'Junger Landtroll', 9, 98, 14, 19, 18, 13, '1d10', '2d8', 2, 'Flache Furten und Bachläufe'],
  ['landtroll-narbenbedeckt', 'Narbenbedeckter Landtroll', 14, 154, 16, 22, 20, 15, '2d6', '3d8', 3, 'Brücken und steinige Wegengen'],
  ['landtroll-uralt', 'Uralter Landtroll', 17, 203, 17, 24, 22, 17, '2d8', '4d8', 4, 'Verfallene Bergstraßen und Felsruinen']
];

export const LAND_TROLL_ENCOUNTERS = variants.map(([id, name, level, hp, defense, strength, constitution, dc, blow, rock, targets, habitat]) => {
  const grip = condition('landtroll-klammer', 'Festgehalten', 'Athletik, Stärke oder GES befreien aus dem Griff. Der Landtroll muss den Griff bei erlittenem Schaden halten.', {
    presetId: 'festgehalten', durationModel: { kind: 'combat' }, stanceGroup: 'creature-hold', restraint: { dc },
    mechanics: { blocksActions: true, attackRollMode: 'disadvantage' }
  });
  const stun = condition('trollerschuetterung', 'Betäubt', 'Bis zum Ende des nächsten eigenen Beitrags handlungsunfähig.', {
    presetId: 'stunned', mechanics: { blocksActions: true }
  });
  return encounterCard({
    id, groupId: 'landtrolle', name, species: 'Landtroll', habitat, level, hp, defense, speed: 8, size: 'Groß', hitDie: 12,
    scores: [strength, 8, constitution, 6, 10, 7], saves: ['strength', 'constitution'], tags: ['troll'],
    weapons: [naturalAttack(`${id}-hieb`, level === 14 ? 'Grobe Holzkeule' : 'Fausthieb', blow, 'Wucht')],
    damageAffinities: [damageAffinity('Feuer', 'vulnerable', 'Trollblut')],
    resources: [{ id: 'landtroll-post', name: 'Trollblut', current: 1, maximum: 1, scope: 'comment', category: 'turn-effect', recovery: 'scene' }],
    traits: [{ id: 'landtroll-trollblut', name: 'Trollblut', regeneration: { resourceId: 'landtroll-post', constitutionMultiplier: 2,
      timing: 'end', blockedByBurning: true, burningDamage: '1d4', incomingBurningBonus: '1d4' },
    description: 'Am Beitragsende 1W12 + doppelter KON-Modifikator heilen. Feuer verursacht doppelten Schaden und unterdrückt die nächste Regeneration. Brennend verursacht 1W4 Feuerschaden pro eigenem Beitrag und 1W4 zusätzlichen Schaden pro eingehendem Treffer.' }],
    abilities: [creatureAbility('troll-felswurf', 'Brockenwurf', { range: 'Wurf · 6–15 m', rollFormula: rock, damageType: 'Wucht',
      costs: costs('action', 'bonus-action'), description: 'Schleudert einen greifbaren Stein oder vergleichbar schweren Gegenstand.' }),
    holdAbility('landtroll-klammergriff', 'Klammergriff', dc - 1, costs('action', 'reaction'), { ...grip, restraint: { dc: dc - 1 } }),
    creatureAbility('troll-bodenwucht', 'Bodenwucht', { activationType: 'special-action', costs: costs('special-action', 'action', 'bonus-action'),
      range: 'Umkreis · 3 m', resolutionType: 'saving-throw', saveAttribute: 'constitution', saveDc: dc, maximumTargets: targets,
      halfDamageOnSave: true, damageType: 'Wucht', description: `Wucht gegen bis zu ${targets} nahe Ziele. Misslingt die KON-Rettung, wird das Ziel betäubt.`,
      effects: [damage('trollwucht', rock, 'Wucht', 'hit', 'selected'), applyCondition(stun, 'save-failure', 'selected')] })]
  });
});
