import test from 'node:test';
import assert from 'node:assert/strict';
import { listSpellCatalogEntries, createCatalogSpell, detachCatalogSpell } from '../src/generated/spell-catalog/spell-catalog.js';
import { resolveCombatProfile as serverProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState as serverState } from '../src/generated/combat/combat-state-model.js';
import { CombatResolutionService as ServerResolver } from '../src/generated/combat/combat-resolution-service.js';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';
import { resolveCombatProfile } from '../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { CombatResolutionService } from '../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { createCharacterArchiveProfileItem, normalizeCharacterArchiveEntry } from '../../../AleriaAlmanach/modules/character-archive/character-archive-model.js';
import { SeededCombatDice } from '../../../AleriaAlmanach/tests/support/combat-seeded-dice.mjs';

const targetRecord = { id: 'audit-target', name: 'Prüfziel', combatProfile: {
  hitPoints: { current: 5000, maximumOverride: 5000 }, armorClass: { override: 5 }
} };
const caster = spell => ({ id: 'audit-caster', name: 'Prüfmagier', combatProfile: {
  progression: { level: 20 }, hitPoints: { current: 100, maximumOverride: 100 },
  attributes: [{ key: 'charisma', score: 18, modifierOverride: 5 }],
  magic: { enabled: true, casterTier: 'full', castingAttribute: 'charisma', spells: [spell] }
} });

test('eigene Zauberfassungen behalten ihre Zielgrenze auch in der autoritativen Profilauflösung', () => {
  const own = detachCatalogSpell({ ...createCatalogSpell('elementarismus-feuerball', { revision: 1 }),
    id: 'own-limited-spell', maximumTargets: 2 });
  const actor = serverProfile(caster(own), { actionId: `spell:${own.id}` });
  assert.equal(actor.selectedAction.maximumTargets, 2);
  assert.equal(actor.selectedAction.catalogReference, undefined);
});

for (const revision of [1, 2]) test(`Katalogfassung ${revision}: Server berechnet jeden Archivzauber und Grad aus Einzelwürfeln erneut`, async () => {
  for (const entry of listSpellCatalogEntries({ revision })) {
    const item = createCharacterArchiveProfileItem(normalizeCharacterArchiveEntry({ kind: 'spell', name: entry.name,
      data: createCatalogSpell(entry.id, { revision }) }), 'magic.spells');
    const record = caster(item);
    for (const level of [entry.level, ...entry.forms.map(form => form.level)]) {
      const context = `${entry.id}@${revision}:${level}`;
      const options = { actionId: `spell:${item.id}`, castLevel: level };
      const state = { temporaryConditions: [{ id: 'audit-buff', name: 'Allgemeine und Waffenboni', active: true,
        mechanics: { attack: 1, spellAttack: 2, spellSaveDc: 1, damage: 20, weaponBonusDamageFormula: '1d12' } }] };
      const browserActor = overlayCombatHitPointState(resolveCombatProfile(record, options), state);
      const serverActor = serverState(serverProfile(record, options), state);
      assert.deepEqual(serverActor.resourceCosts, browserActor.resourceCosts, context);
      assert.equal(serverActor.attackModifier, 14, context);
      assert.equal(serverActor.actionSpellSaveDc, 20, context);
      assert.equal(serverActor.damageModifier, 0, context);
      if (entry.channelComments > 1) {
        const channeling = { actionId: browserActor.profileActionId, progress: entry.channelComments - 1,
          requiredComments: entry.channelComments, lastProgressCommentKey: 'earlier' };
        browserActor.channeling = channeling; serverActor.channeling = channeling;
      }
      const browserResult = await new CombatResolutionService(new SeededCombatDice(1, 10))
        .resolveAttack({ actor: browserActor, target: resolveCombatProfile(targetRecord) }, { rulePeriods: { comment: 'complete' } });
      const submitted = structuredClone(browserResult);
      if (submitted.damage) submitted.damage.total = 9999;
      submitted.effectResults.forEach(effect => { if (effect.roll) effect.roll.total = 9999; });
      const result = await new ServerResolver(new ProvidedDiceAdapter(submitted))
        .resolveAttack({ actor: serverActor, target: serverProfile(targetRecord) }, { rulePeriods: { comment: 'complete' } });
      assert.equal(result.targetSnapshot.hitPointsAfter, browserResult.targetSnapshot.hitPointsAfter, context);
      assert.deepEqual(result.effectResults.map(effect => effect.amount), browserResult.effectResults.map(effect => effect.amount), context);
      assert.deepEqual(result.actorResourceSnapshot, browserResult.actorResourceSnapshot, context);
      assert.equal(result.damage?.total, browserResult.damage?.total, context);
    }
  }
});
