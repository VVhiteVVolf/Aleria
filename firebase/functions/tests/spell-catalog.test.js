import test from 'node:test';
import assert from 'node:assert/strict';
import { listSpellCatalogEntries, createCatalogSpell } from '../src/generated/spell-catalog/spell-catalog.js';
import { createCatalogSpell as browserSpell } from '../../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { resolveCombatProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../src/generated/combat/combat-resolution-service.js';

test('all spell editions and authored grades are identical in browser and generated server mechanics', () => {
  for (const entry of [...listSpellCatalogEntries(), ...listSpellCatalogEntries({ revision: 1 })]) {
    for (const level of [entry.level, ...entry.forms.map(form => form.level)]) {
      assert.deepEqual(createCatalogSpell(entry.id, { revision: entry.revision, level }), browserSpell(entry.id, { revision: entry.revision, level }));
    }
  }
});

test('server resolves learned catalog references authoritatively and consumes the selected grade package', async () => {
  for (const [revision, castLevel, formula, costs] of [
    [1, 5, '5d6', [['action',1],['special-action',1],['mana-focus',7]]],
    [2, 7, '4d6', [['action',1],['special-action',1],['reaction',1],['mana-focus',10]]]
  ]) {
  const original = createCatalogSpell('elementarismus-hagelsturm', { revision });
  const character = { id:'catalog-server-caster', name:'Elementarist', combatProfile: {
    progression:{level:20}, hitPoints:{current:100,maximumOverride:100},
    magic:{ enabled:true,casterTier:'full',manaResourceId:'mana-focus',spells:[{
      ...original,id:'learned-instance',rollFormula:'99d20',costs:[],manaCost:0
    }] }
  } };
  const actor = resolveCombatProfile(character,{actionId:'spell:learned-instance',castLevel});
  actor.resources = actor.resources.map(resource => ({...resource,current:resource.maximum}));
  const target = resolveCombatProfile({id:'catalog-server-target',name:'Ziel',combatProfile:{hitPoints:{current:100,maximumOverride:100},armorClass:{override:10}}});
  assert.equal(actor.selectedAction.catalogReference.id,original.catalogReference.id);
  assert.equal(actor.selectedAction.catalogReference.revision,revision);
  assert.equal(actor.weapon.damageFormula,formula);
  assert.deepEqual(actor.resourceCosts.map(cost=>[cost.resourceId,cost.amount]),costs);
  const dice = {
    async rollAttack() { return {natural:15,dice:[15],keptDice:[15],total:999}; },
    async rollDamage({damageFormula}) { return {notation:damageFormula,dice:[11],keptDice:[11],total:11,modifier:0}; }
  };
  const result = await new CombatResolutionService(dice).resolveAttack({actor,target});
  assert.deepEqual(result.effectResults.filter(item=>item.effect.type==='damage').map(item=>item.amount),[5,5]);
  for(const cost of actor.resourceCosts) {
    const before=result.actorResourceSnapshot.before.find(resource=>resource.id===cost.resourceId).current;
    const after=result.actorResourceSnapshot.after.find(resource=>resource.id===cost.resourceId).current;
    assert.equal(before-after,cost.amount);
  }
  }
});
