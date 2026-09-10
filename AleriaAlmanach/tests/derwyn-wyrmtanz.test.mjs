import test from 'node:test';
import assert from 'node:assert/strict';
import { getDerwynClassDefinition } from '../modules/classes/vennyr/derwyn-curriculum.js';
import { WYRMTANZ_COMBAT_STYLE } from '../modules/combat-styles/sirenentanz/wyrmtanz-registry.js';
import { DERWYN_FORM_IDS as F, DERWYN_EXPERT_PATH_IDS, SIRENENTANZ_FORM_IDS as OLD } from '../modules/combat-styles/sirenentanz/sirenentanz-forms.js';
import { getDerwynCenyrFoundationTechniques } from '../modules/combat-styles/sirenentanz/derwyn-techniques.js';
import { migrateDerwynFormId, migrateDerwynTechniqueId, migrateDerwynTechniqueSlotId } from '../modules/combat-styles/sirenentanz/wyrmtanz-training-migration.js';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';

test('Derwyn has an explicit shared foundation budget and four own expert paths', () => {
  const plan = getDerwynClassDefinition();
  assert.deepEqual(plan.cultures, ['Cenyr', 'Vennyr']);
  assert.equal(plan.foundationSelection.required, true);
  assert.equal(plan.foundationSelection.options.length, 2);
  assert.deepEqual(plan.pathSelection.allowedFormIds, DERWYN_EXPERT_PATH_IDS);
  assert.deepEqual(plan.techniqueBudget.slots.map(slot => slot.level), [1, 3, 5, 7, 8, 9, 12, 15, 17, 20]);
  assert.equal(plan.trainingPhases[1].name, 'Freie kreative Phase');
  assert.equal(plan.formAccess.find(form => form.formId === F.creative).minimumLevel, 7);
  assert(!plan.formAccess.some(form => [OLD.advanced, OLD.breaker, OLD.current, OLD.depths].includes(form.formId)));
  const swordGrant = plan.combatStyleGrants.find(grant => grant.styleId === 'drachentanz');
  assert.deepEqual(Object.keys(swordGrant.techniqueUnlockLevels), getDerwynCenyrFoundationTechniques().map(attack => attack.id));
  plan.pathSelection.allowedFormIds.pop();
  assert.equal(getDerwynClassDefinition().pathSelection.allowedFormIds.length, 4);
});

test('each Wyrm path has eight usable weapon-specific choices and no automatic spell or free attack', () => {
  const weaponByForm = new Map([[F.flowing, 'sword'], [F.breaking, 'trident'], [F.rising, 'staff'], [F.whipping, 'morningstar']]);
  const techniques = WYRMTANZ_COMBAT_STYLE.forms.flatMap(form => form.techniques);
  assert.equal(WYRMTANZ_COMBAT_STYLE.name, 'Wyrmtanz');
  assert.equal(new Set(techniques.map(attack => attack.id)).size, techniques.length);
  for (const form of WYRMTANZ_COMBAT_STYLE.forms.filter(form => form.kind === 'path')) {
    assert.equal(form.techniques.length, 8);
    assert(form.techniques.every(attack => attack.cultureTraining.weaponProfileIds.includes(weaponByForm.get(form.id))));
  }
  for (const attack of techniques) {
    assert.equal(attack.status, 'confirmed');
    assert.equal(attack.active, false);
    assert.deepEqual(attack.cenyrTraining.allowedClassIds, ['derwyn']);
    assert(attack.costs.length && attack.costs.every(cost => cost.amount === 1));
    assert.equal(attack.followUpAttack.enabled, false);
    assert(!attack.effects.some(effect => effect.magical || effect.type === 'heal'));
    const formula = resolveTechniqueDamageFormula(attack, { damageFormula: '1d8' }, { progression: { level: 20 } });
    if (attack.effects.some(effect => effect.type === 'damage')) assert(parseDamageFormula(formula).notation);
    else assert.equal(formula, '');
    for (const effect of attack.effects.filter(effect => effect.condition)) {
      assert.equal(effect.condition.durationModel.kind, 'actor-comments');
      assert.equal(effect.condition.durationModel.remainingActorComments, 1);
    }
    if (attack.secondarySave.enabled) {
      assert.equal(attack.secondarySave.attributeKey, 'strength');
      assert(attack.secondarySave.failureCondition.mechanics.attack < 0);
    }
  }
});

test('migration retires incompatible mixed paths and mace attacks without deleting custom techniques', () => {
  for (const id of [OLD.breaker, OLD.current, OLD.depths]) assert.equal(migrateDerwynFormId(id), '');
  assert.equal(migrateDerwynFormId(OLD.advanced), F.creative);
  assert.equal(migrateDerwynTechniqueId('combat-style-sirenentanz-derwyn-kolbenkeil'), '');
  assert.equal(migrateDerwynTechniqueId('combat-style-sirenentanz-derwyn-versperrte-linie'), '');
  assert.equal(migrateDerwynTechniqueId('combat-style-sirenentanz-derwyn-saphirkreis'), 'combat-style-sirenentanz-derwyn-saphirkreis');
  assert.equal(migrateDerwynTechniqueId('my-custom-derwyn-attack'), 'my-custom-derwyn-attack');
  assert.equal(migrateDerwynTechniqueSlotId('advanced-02'), 'duelist-02');
});
