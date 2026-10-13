import { getCombatResolutionTree } from '../combat/combat-resolution-tree.js';
import { getCriticalWeaponAttacks } from './combat-critical-catalog.js';
import { createCriticalConsequence } from './combat-critical-model.js';

// The caller owns random selection and the contribution-wide limits. Keeping
// this traversal shared prevents counter and mixed hit/fumble receipts diverging.
export function attachCriticalConsequences(resolution, { encounter, actor, target, usedConsequenceKeys, rollFor, id } = {}) {
  if (encounter?.criticalEffectsVersion !== 1) return [];
  const profiles = new Map([[actor.characterId, actor], [target.characterId, target]]);
  const attached = [];
  for (const { resolution: entry, path } of getCombatResolutionTree(resolution)) {
    const source = profiles.get(entry.actorId), recipient = profiles.get(entry.targetId);
    if (!source || !recipient) continue;
    const consequences = [];
    for (const { attack, index } of getCriticalWeaponAttacks(entry)) {
      const key = attack.criticalFailure ? `failure:${entry.actorId}` : `hit:${entry.actorId}:${entry.targetId}`;
      if (usedConsequenceKeys?.has(key)) {
        createCriticalConsequence(entry, { encounter, actor: source, target: recipient, usedConsequenceKeys, attack });
        continue;
      }
      const suffix = [...path.map(value => `counter-${value}`), ...(index ? [`attack-${index}`] : [])].join(':');
      const consequence = createCriticalConsequence(entry, {
        encounter, actor: source, target: recipient, usedConsequenceKeys, attack,
        roll: rollFor({ path, index, key }), id: suffix ? `${id}:${suffix}` : id
      });
      if (consequence) {
        consequences.push(consequence); attached.push(consequence);
        if (consequence.sceneItemEvent) {
          const ownerId = consequence.sceneItemEvent.sourceActorId;
          profiles.set(ownerId, { ...profiles.get(ownerId), weaponUnavailable: true });
        }
      }
    }
    if (consequences.length) {
      entry.criticalConsequence = consequences[0];
      if (consequences.length > 1) entry.criticalConsequences = consequences;
    }
  }
  return attached;
}
