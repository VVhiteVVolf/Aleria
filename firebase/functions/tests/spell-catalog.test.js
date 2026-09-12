import test from 'node:test';
import assert from 'node:assert/strict';
import { listSpellCatalogEntries, createCatalogSpell } from '../src/generated/spell-catalog/spell-catalog.js';
import { createCatalogSpell as browserSpell } from '../../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { resolveCombatProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../src/generated/combat/combat-resolution-service.js';

test('all spell editions and authored grades are identical in browser and generated server mechanics', () => {
  for (const entry of listSpellCatalogEntries()) {
    for (const level of [entry.level, ...entry.forms.map(form => form.level)]) {
      assert.deepEqual(createCatalogSpell(entry.id, { level }), browserSpell(entry.id, { level }));
    }
  }
});

test('server resolves learned catalog references authoritatively and consumes the selected grade package', async () => {
  const original = createCatalogSpell('elementarismus-hagelsturm');
  const character = { id:'catalog-server-caster', name:'Elementarist', combatProfile: {
    progression:{level:20}, hitPoints:{current:100,maximumOverride:100},
    magic:{ enabled:true,casterTier:'full',manaResourceId:'mana-focus',spells:[{
      ...original,id:'learned-instance',rollFormula:'99d20',costs:[],manaCost:0
    }] }
  } };
  const actor = resolveCombatProfile(character,{actionId:'spell:learned-instance',castLevel:5});
  actor.resources = actor.resources.map(resource => ({...resource,current:resource.maximum}));
  const target = resolveCombatProfile({id:'catalog-server-target',name:'Ziel',combatProfile:{hitPoints:{current:100,maximumOverride:100},armorClass:{override:10}}});
  assert.equal(actor.selectedAction.catalogReference.id,original.catalogReference.id);
  assert.equal(actor.weapon.damageFormula,'5d6');
  assert.deepEqual(actor.resourceCosts.map(cost=>[cost.resourceId,cost.amount]),[['action',1],['special-action',1],['mana-focus',7]]);
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
});
