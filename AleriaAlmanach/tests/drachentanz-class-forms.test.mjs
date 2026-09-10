import test from 'node:test';
import assert from 'node:assert/strict';
import { DRACHENTANZ_FORM_IDS as F } from '../modules/combat-styles/drachentanz/drachentanz-ids.js';
import { DRACHENTANZ_COMBAT_STYLE as style } from '../modules/combat-styles/drachentanz/drachentanz-registry.js';
import { getCenyrClassDefinition } from '../modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import { resolveCenyrTechniqueWeaponRules } from '../modules/classes/cenyr/cenyr-technique-weapon-rules.js';
import { getCenyrPathActionEffects } from '../modules/classes/cenyr/cenyr-class-combat-rules.js';
import { migrateDrachentanzFormId, migrateDrachentanzTechniqueId } from '../modules/combat-styles/drachentanz/drachentanz-training-migration.js';

const teulu = [F.schwertdrache, F.abwartender, F.fliegender, F.aufsteigender, F.bruellender, F.ausgeglichener, F.zwillingsdrache];
const spear = [F.speerdrache, F.peitschender, F.huetender];
const profile = (classId, formId, mounted = false) => ({ templateSelections: { classId }, progression: { level: 20 }, combat: { mounted },
  classTraining: { selections: [{ kind: 'path', selectionId: formId, selectedAtLevel: 9 }] } });
const attacks = formId => style.forms.find(form => form.id === formId).techniques;

test('class curricula expose precisely the requested forms in order without foreign placeholders', () => {
  const expected = { teulu, cantref: spear, uchelwyr: [...spear, F.stuermender, F.schweifender],
    helwyr: [...teulu, F.lauernder, F.jagender], arthwyr: [...teulu, F.baerenklaue], barddwyr: [F.schwertdrache, F.kreischender] };
  for (const [classId, paths] of Object.entries(expected)) {
    const definition = getCenyrClassDefinition(classId);
    assert.deepEqual(definition.pathSelection.allowedFormIds, paths, classId);
    assert(definition.formAccess.some(form => form.formId === F.jungdrache), classId);
    assert(definition.formAccess.every(form => form.status !== 'blocked'), classId);
    const catalog = getCenyrClassProgression(classId, 20).attackCatalog;
    assert(catalog.every(attack => definition.formAccess.some(form => form.formId === attack.combatStyleFormId)), classId);
  }
  assert.deepEqual(getCenyrClassDefinition('milwr').formAccess.map(form => form.formId), [F.jungdrache, F.drachling]);
  assert.equal(style.forms.some(form => /Sattel|Lanzen|Bogendrachen/.test(form.shortName)), false);
});

test('all shared spear attacks execute for both spear classes and reject Teulu', () => {
  for (const formId of spear) {
    assert(attacks(formId).length >= 6);
    for (const attack of attacks(formId)) {
      assert.deepEqual(attack.cenyrTraining.allowedClassIds, ['cantref', 'uchelwyr']);
      for (const classId of ['cantref', 'uchelwyr']) {
        for (const weaponProfileId of ['spear', 'lance', 'partisan', 'trident', 'halberd']) {
          assert.equal(resolveCenyrTechniqueWeaponRules(profile(classId, formId), attack, { weaponType: 'spear', weaponProfileId }).compatible, true, `${classId}/${attack.id}/${weaponProfileId}`);
        }
      }
      assert.equal(resolveCenyrTechniqueWeaponRules(profile('teulu', formId), attack, { weaponType: 'spear', weaponProfileId: 'spear' }).compatible, false);
    }
  }
});

test('rider, hunter and bear forms enforce their equipment and context', () => {
  const charge = attacks(F.stuermender)[0];
  const sword = { weaponType: 'sword', weaponProfileId: 'sword' };
  assert.equal(resolveCenyrTechniqueWeaponRules(profile('uchelwyr', F.stuermender), charge, sword).compatible, false);
  assert.equal(resolveCenyrTechniqueWeaponRules(profile('uchelwyr', F.stuermender, true), charge, sword).compatible, true);
  const sweep = attacks(F.schweifender).find(attack => !attack.cenyrTraining.requiresMounted);
  assert.equal(resolveCenyrTechniqueWeaponRules(profile('uchelwyr', F.schweifender), sweep, sword).compatible, true);
  const shortBlade = attacks(F.jagender).find(attack => attack.name === 'Kurzer Fang');
  assert.equal(resolveCenyrTechniqueWeaponRules(profile('helwyr', F.jagender), shortBlade, { weaponType: 'dagger' }).compatible, true);
  assert.equal(resolveCenyrTechniqueWeaponRules(profile('helwyr', F.jagender), shortBlade, { weaponType: 'sword', weaponProfileId: 'greatsword' }).compatible, false);
  assert.equal(resolveCenyrTechniqueWeaponRules(profile('arthwyr', F.baerenklaue), attacks(F.baerenklaue)[0], { weaponType: 'axe', weaponProfileId: 'battleaxe' }).compatible, true);
});

test('new passives and defensive abilities carry executable effects and avoid unintended weapon damage', () => {
  const guard = attacks(F.huetender)[0];
  const defence = getCenyrPathActionEffects(profile('cantref', F.huetender), { technique: guard, weapon: { weaponType: 'spear', weaponProfileId: 'spear' } });
  assert.equal(defence.effects[0].condition.mechanics.armorClass, 3);
  const support = attacks(F.huetender).find(attack => attack.name === 'Ruhige Schwelle');
  assert.equal(support.damageFormula, '');
  assert.equal(support.damageModel.mode, 'fixed');
  assert.equal(support.effects.some(effect => effect.type === 'damage'), false);
  assert(support.effects.some(effect => effect.condition?.mechanics.armorClass === 2 && effect.on === 'always'));
  assert(attacks(F.speerdrache).some(attack => attack.effects.some(effect => effect.type === 'move')));
  for (const formId of [F.peitschender, F.schweifender]) {
    const penalties = attacks(formId).flatMap(attack => attack.effects).filter(effect => effect.condition?.mechanics.armorClass < 0);
    assert(penalties.length > 0);
    assert(penalties.every(effect => effect.type === 'debuff'));
  }
});

test('migration preserves useful learned identities and releases foreign catalog techniques', () => {
  for (const classId of ['cantref', 'uchelwyr']) {
    assert.equal(migrateDrachentanzFormId(classId, F.schwertdrache), F.speerdrache);
    assert.equal(migrateDrachentanzTechniqueId(classId, 'combat-style-drachentanz-schwertdrache-eroeffnung-des-einen'), 'combat-style-drachentanz-speerdrache-fliessende-eroeffnung');
    assert.equal(migrateDrachentanzTechniqueId(classId, 'combat-style-drachentanz-rueckschritt-des-waechters'), '');
  }
  assert.equal(migrateDrachentanzFormId('helwyr', 'drachentanz-pfad-bogendrache'), F.lauernder);
  assert.equal(migrateDrachentanzFormId('teulu', 'drachentanz-pfad-satteldrache'), '');
  assert.equal(migrateDrachentanzTechniqueId('helwyr', 'combat-style-drachentanz-bogendrache-ruhige-sehne'), 'combat-style-drachentanz-bogendrache-ruhige-sehne');
  assert.equal(migrateDrachentanzTechniqueId('cantref', 'mein-eigener-speerwurf'), 'mein-eigener-speerwurf');
});
