import test from 'node:test';
import assert from 'node:assert/strict';
import { listSpellCatalogEntries, createCatalogSpell } from '../src/generated/spell-catalog/spell-catalog.js';
import { createCatalogSpell as browserSpell } from '../../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { resolveCombatProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../src/generated/combat/combat-resolution-service.js';

test('all 64 Restitution base and higher forms are identical in browser and server', () => {
  const entries = listSpellCatalogEntries({ catalog: 'restitution' });
  assert.equal(entries.length, 46);
  for (const entry of entries) for (const level of [entry.level, ...entry.forms.map(form => form.level)]) {
    assert.deepEqual(createCatalogSpell(entry.id, { revision: 1, level }), browserSpell(entry.id, { revision: 1, level }));
  }
});

test('server replaces tampered healing and zero costs with the referenced higher form', async () => {
  const original = createCatalogSpell('restitution-heilende-hand');
  const character = { id: 'server-healer', name: 'Heilerin', combatProfile: {
    progression: { level: 20 }, hitPoints: { current: 50, maximumOverride: 50 },
    magic: { enabled: true, casterTier: 'full', manaResourceId: 'mana-focus', spells: [{
      ...original, id: 'learned-healing', manaCost: 0, costs: [], effects: [{ type: 'healing', amount: 9999 }]
    }] }
  } };
  const actor = resolveCombatProfile(character, { actionId: 'spell:learned-healing', castLevel: 3 });
  actor.resources = actor.resources.map(resource => ({ ...resource, current: resource.maximum }));
  assert.equal(actor.selectedAction.effects[0].formula, '4d6');
  assert.equal(actor.selectedAction.effects[0].amount, undefined);
  assert.deepEqual(actor.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['action',1],['reaction',1],['mana-focus',6]]);
  const target = resolveCombatProfile({ id:'server-patient', name:'Patient', combatProfile: {
    hitPoints:{ current: 18, maximumOverride: 20 }, armorClass:{ override: 10 }
  } });
  const dice = { async rollDamage({ damageFormula, bonus, critical }) {
    assert.equal(damageFormula, '4d6'); assert.equal(bonus, 0); assert.equal(critical, false);
    return { notation: damageFormula, total: 14, dice: [2,3,4,5], keptDice: [2,3,4,5] };
  } };
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(result.targetSnapshot.hitPointsAfter, 20);
  assert.equal(result.effectResults.find(effect => effect.effect.type === 'healing').applied.restored, 2);
  for (const cost of actor.resourceCosts) {
    const before = result.actorResourceSnapshot.before.find(resource => resource.id === cost.resourceId).current;
    const after = result.actorResourceSnapshot.after.find(resource => resource.id === cost.resourceId).current;
    assert.equal(before - after, cost.amount);
  }
});
