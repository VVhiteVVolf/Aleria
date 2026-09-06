export const COMBAT_WAIT_ACTION = Object.freeze({
  id: 'combat:wait', sourceId: 'combat:wait', kind: 'wait', kindLabel: 'Kampfzug',
  name: 'Abwarten / Zug aussetzen', formula: '', weapon: { name: 'Abwarten', damageFormula: '' },
  activationType: 'free', costs: [], auraBypass: { allowed: false },
  effects: [{ type: 'move', target: 'self', on: 'always', movementMeters: 0, notes: 'Zug ohne Angriff abschließen.' }],
  attackModifier: 0, damageModifier: 0, resolutionMode: 'automatic',
  segmentKinds: ['combataction'], compatible: true, default: false
});

export function hasActionBlockingCondition(profile = {}) {
  return (profile.conditions || []).some(condition => condition.active !== false && condition.mechanics?.blocksActions === true);
}
