import { effectiveHealthTraits } from '../character-health/health-trait-policy.js';
import { COMBAT_STATUS_PRESETS } from '../combat-status/combat-status-catalog.js';
const actionBlockingPresets = new Set(COMBAT_STATUS_PRESETS.filter(preset => preset.mechanics?.blocksActions).map(preset => preset.id));
export const COMBAT_WAIT_ACTION = Object.freeze({
  id: 'combat:wait', sourceId: 'combat:wait', kind: 'wait', kindLabel: 'Kampfzug',
  name: 'Abwarten / Zug aussetzen', formula: '', weapon: { name: 'Abwarten', damageFormula: '' },
  activationType: 'passive', costs: [], auraBypass: { allowed: false },
  description: 'Der eigene Zug verstreicht ohne aktive Handlung, Heilung oder Ressourcengewinn; auch bei Handlungsunfähigkeit möglich.',
  effects: [{ type: 'move', target: 'self', on: 'always', movementMeters: 0, notes: 'Zug ohne aktive Handlung abschließen.' }],
  attackModifier: 0, damageModifier: 0, resolutionMode: 'automatic',
  segmentKinds: ['combataction'], compatible: true, default: false
});

export function getActionBlockingCondition(profile = {}) {
  return [...(profile.conditions || []), ...effectiveHealthTraits(profile.quirks || [])].find(condition => condition.active !== false
    && (condition.mechanics?.blocksActions === true || actionBlockingPresets.has(condition.presetId))) || null;
}
export function hasActionBlockingCondition(profile = {}) {
  return Boolean(getActionBlockingCondition(profile));
}
