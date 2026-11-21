import { applyCondition, condition, costs, creatureAbility, damage, damageAffinity, encounterCard, holdAbility, naturalAttack } from './encounter-card-model.js';

const variants = [
  ['versunkener-verkuemmert', 'Verkümmerter Versunkener', 3, 31, 12, 10, 14, '2d8', 'Kaimauern und flache Strandungen'],
  ['versunkener-fahlhaeutig', 'Fahlhäutiger Versunkener', 4, 42, 13, 13, 16, '2d10', 'Verlassene Anlegestellen und alte Hafenbecken'],
  ['versunkener-bullig', 'Bulliger Versunkener', 5, 56, 14, 16, 18, '3d8', 'Gezeitendämme und Wrackfelder']
];

export const DROWNED_ENCOUNTERS = variants.map(([id, name, level, hp, defense, dc, strength, bite, habitat]) => {
  const held = condition('festgehalten', 'Festgehalten',
    'Handlungen und Reaktionen gesperrt, Angriffe mit Nachteil. Befreiung über Athletik, Stärke oder GES gegen denselben SG, beim ersten Versuch mit Nachteil. Der Griff kann durch Schaden an der haltenden Kreatur brechen.', {
      presetId: 'festgehalten', durationModel: { kind: 'combat' }, stanceGroup: 'creature-hold',
      restraint: { dc }, mechanics: { blocksActions: true, attackRollMode: 'disadvantage' }
    });
  const bleeding = condition('versunkener-blutend', 'Blutend', 'Verliert zu Beginn eigener Beiträge TP. Heilung oder Kampfende beendet die Blutung.', {
    presetId: 'bleeding', endsOnHealing: true, criticalPeriodicLoss: level === 3 ? 1 : 2, durationModel: { kind: 'combat' }
  });
  return encounterCard({
    id, groupId: 'versunkene', name, species: 'Versunkener', habitat, level, hp, defense, speed: 7,
    scores: [strength, 12, 14 + level - 3, 4, 10, 5], saves: ['constitution'], tags: ['untot'],
    damageAffinities: [damageAffinity('Feuer', 'resistant', 'Feuchte Lederhaut'), damageAffinity('Blitz', 'vulnerable', 'Feuchte Lederhaut')],
    traits: [{ id: 'feuchte-lederhaut', name: 'Feuchte Lederhaut', description: 'Ertrunkener Seemann, vom Meer als Untoter zurückgebracht. Feuer verursacht halben, Blitz doppelten Schaden.' }],
    weapons: [naturalAttack('versunkener-krallen', 'Faustschlag', level === 3 ? '1d6' : '1d8', 'Wucht')],
    abilities: [holdAbility('versunkener-tiefengriff', 'Tiefengriff', dc, costs('special-action', 'action', 'reaction'), held),
      creatureAbility('versunkener-biss', 'Verbeißender Biss', { rollFormula: bite, damageType: 'Stich', requiresOwnHold: true,
        forcedRollMode: 'advantage', costs: costs('action', 'reaction', 'bonus-action'),
        description: 'Nur gegen das selbst festgehaltene Ziel. Angriff mit Vorteil. Ein Treffer verursacht eine Blutung.',
        effects: [damage('biss-schaden', bite, 'Stich'), applyCondition(bleeding)] })]
  });
});
