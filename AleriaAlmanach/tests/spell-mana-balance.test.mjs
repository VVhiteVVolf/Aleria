import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { createCatalogSpell } from '../modules/spell-catalog/spell-catalog.js';
import { getCharacterSpellPresentation } from '../modules/characters/character-spell-presentation.js';

test('old saved costs refresh once for custom spells and both catalog editions', () => {
  for (const manaResourceId of ['mana-focus', 'pact-points']) {
    let profile = { magic: { enabled: true, manaResourceId, spells: [
      { id: 'old-cantrip', name: 'Alter Zaubertrick', level: 0, manaCost: 1, costs: [{ resourceId: manaResourceId, amount: 1 }] },
      { ...createCatalogSpell('elementarismus-feuerball', { revision: 1 }), id: 'learned-v1', manaCost: 5 },
      { ...createCatalogSpell('elementarismus-feuerball', { revision: 2 }), id: 'learned-v2', manaCost: 10 }
    ] } };
    for (let round = 0; round < 3; round++) {
      profile = sanitizeCharacterCombatProfile(JSON.parse(JSON.stringify(profile)));
      assert.deepEqual(profile.magic.spells.map(s => s.manaCost), [2, 6, 12]);
      assert.deepEqual(profile.magic.spells.map(s => s.id), ['old-cantrip', 'learned-v1', 'learned-v2']);
      for (const spell of profile.magic.spells) {
        const costs = spell.costs.filter(c => c.resourceId === manaResourceId);
        assert.equal(costs.length, 1);
        assert.equal(costs[0].amount, spell.manaCost);
      }
    }
    assert.deepEqual(profile.magic.spells.slice(1).map(s => s.catalogReference.revision), [1, 2]);
    assert.match(getCharacterSpellPresentation(profile.magic.spells[2], profile).costs, /12 Mana$/);
  }
});

test('the greater fireball requires and spends 12 mana; the previous 10 no longer suffice', async () => {
  const character = { id: 'mana-test', name: 'Prüfmagier', combatProfile: {
    progression: { level: 20 }, hitPoints: { current: 100, maximumOverride: 100 },
    magic: { enabled: true, casterTier: 'full', spells: [createCatalogSpell('elementarismus-feuerball')] }
  } };
  const actor = resolveCombatProfile(character, { actionId: 'spell:elementarismus-feuerball', castLevel: 7 });
  actor.resources = actor.resources.map(r => ({ ...r, current: r.id === 'mana-focus' ? 12 : r.maximum }));
  const target = resolveCombatProfile({ id: 'mana-target', name: 'Ziel', combatProfile: { hitPoints: { current: 100, maximumOverride: 100 } } });
  const service = new CombatResolutionService({
    async rollAttack() { return { natural: 15, dice: [15], keptDice: [15], total: 999 }; },
    async rollDamage({ damageFormula }) { return { notation: damageFormula, dice: Array(8).fill(1), keptDice: Array(8).fill(1), total: 8, modifier: 0 }; }
  });
  const insufficient = { ...actor, resources: actor.resources.map(r => r.id === 'mana-focus' ? { ...r, current: 10 } : r) };
  await assert.rejects(service.resolveAttack({ actor: insufficient, target }));
  const result = await service.resolveAttack({ actor, target });
  assert.equal(result.actorResourceSnapshot.before.find(r => r.id === 'mana-focus').current, 12);
  assert.equal(result.actorResourceSnapshot.after.find(r => r.id === 'mana-focus').current, 0);
  assert.deepEqual(result.resourceCosts.map(c => [c.resourceId, c.amount]), [['action', 1], ['special-action', 1], ['reaction', 1], ['mana-focus', 12]]);
});
