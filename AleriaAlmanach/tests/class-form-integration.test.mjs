import test from 'node:test';
import assert from 'node:assert/strict';
import { getCenyrClassDefinition } from '../modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import { getCenyrTrainingState, getCenyrLevelUpTrainingChoices, selectCenyrTrainingOption } from '../modules/classes/cenyr/cenyr-class-training.js';
import { getCenyrTechniqueChoiceGroups, reconcileCenyrTrainingForLevel, selectCenyrTechniqueForSlot } from '../modules/classes/cenyr/cenyr-technique-selection.js';
import { getAutofilledCenyrCombatProfile } from '../modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { DRACHENTANZ_FORM_IDS as D } from '../modules/combat-styles/drachentanz/drachentanz-ids.js';
import { DERWYN_FORM_IDS as W } from '../modules/combat-styles/sirenentanz/sirenentanz-forms.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { resolveCenyrTechniqueWeaponRules } from '../modules/classes/cenyr/cenyr-technique-weapon-rules.js';
import { applyCharacterCreationDraft, createCharacterCreationDraft, getCreationStartingTechniques, validateCharacterCreationDraft } from '../modules/combat/character-creation-model.js';
import { createCharacterLevelUpPlan, previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';

const weapon = (id, type, name = id) => ({ id, name, weaponType: type, weaponProfileId: id, damageFormula: '1d8', equipped: id === 'sword' });
const loadout = [weapon('sword', 'sword'), weapon('spear', 'spear'), weapon('lance', 'spear'), weapon('rapier', 'sword'),
  weapon('longbow', 'bow'), weapon('shortbow', 'bow'), weapon('dual-daggers', 'dagger'), weapon('greatsword', 'sword'),
  weapon('trident', 'spear', 'Dreizack'), weapon('staff', 'staff', 'Kampfstab'), weapon('morningstar', 'mace', 'Morgenstern')];
function profileFor(classId, level = 20, culture = 'Cenyr') {
  return sanitizeCharacterCombatProfile({ templateSelections: { classId }, identity: { ancestry: culture, archetype: classId },
    progression: { level }, combat: { mounted: true }, weapons: loadout });
}
function select(profile, kind, selectionId, level = profile.progression.level) {
  const result = selectCenyrTrainingOption(profile, { kind, selectionId, selectedAtLevel: level });
  assert.equal(result.ok, true, result.errors.join(' '));
  return result.profile;
}
function assertLegalTraining(profile) {
  const definition = getCenyrClassDefinition(profile.templateSelections.classId);
  const plan = getCenyrClassProgression(definition.id, profile.progression.level, { classTraining: profile.classTraining });
  const availableForms = new Set(plan.styles.flatMap(style => style.forms).filter(form => form.available).map(form => form.id));
  const selections = new Map(profile.classTraining.techniqueSelections.map(selection => [selection.techniqueId, selection]));
  for (const technique of profile.techniques) {
    const selection = selections.get(technique.id);
    assert.ok(selection, technique.id);
    assert.ok(availableForms.has(technique.combatStyleFormId), technique.name);
    assert.ok(technique.minimumLevel <= selection.selectedAtLevel, technique.name);
    assert.ok(!technique.cenyrTraining.allowedClassIds.length || technique.cenyrTraining.allowedClassIds.includes(definition.classId));
  }
  return plan;
}

test('all seven class curricula fill only permitted forms and remain stable at each level', () => {
  for (const classId of ['teulu', 'cantref', 'uchelwyr', 'helwyr', 'barddwyr', 'arthwyr', 'derwyn']) {
    for (const level of [1, 6, 7, 8, 9, 13, 20]) {
      const base = profileFor(classId, level);
      const result = reconcileCenyrTrainingForLevel(base, level, { autoFill: true });
      const plan = assertLegalTraining(result.profile);
      assert.equal(result.pending.length, 0, `${classId} / ${level}: every earned slot has a legal option`);
      assert.equal(result.profile.classTraining.techniqueSelections.length + result.profile.classTraining.selections.filter(item => item.spentTechniqueSlotId).length,
        plan.earnedTechniqueSlots.length, `${classId} / ${level}: no free or duplicated slot`);
      assert.deepEqual(reconcileCenyrTrainingForLevel(result.profile, level, { autoFill: true }).profile, result.profile, `${classId} / ${level}: idempotent`);
    }
  }
});

test('retired generated choices are released while personally authored Drachentanz content survives', () => {
  const custom = { id: 'personal-dragon-strike', name: 'Eigene Cantref-Auslegung', combatStyleId: 'drachentanz', trainingForm: 'Cantref · Drachentanz', customMemo: 'behalten' };
  const original = profileFor('cantref');
  original.classTraining = { curriculumId: 'cenyr-cantref', selections: [{ kind: 'path', selectionId: D.abwartender, selectedAtLevel: 9 }],
    techniqueSelections: [{ slotId: 'expert-01', techniqueId: 'combat-style-drachentanz-retired-test', selectedAtLevel: 9 }] };
  original.techniques = [custom, { id: 'combat-style-drachentanz-retired-test', combatStyleFormId: D.abwartender, combatStyleId: 'drachentanz' }];
  const before = structuredClone(original);
  const result = getAutofilledCenyrCombatProfile(original);
  assert.deepEqual(original, before, 'reading a scene must not mutate the stored profile');
  assert.deepEqual(result.techniques.find(item => item.id === custom.id), custom);
  assert.ok(!result.techniques.some(item => item.id === 'combat-style-drachentanz-retired-test'));
  assert.ok(result.classTraining.selections.every(item => item.kind !== 'path' || getCenyrClassDefinition('cantref').pathSelection.allowedFormIds.includes(item.selectionId)));
  assert.equal(selectCenyrTrainingOption(profileFor('teulu'), { kind: 'path', selectionId: D.speerdrache, selectedAtLevel: 9 }).ok, false);
});

test('both Derwyn foundations are exclusive, persist through serialization and share the same four paths', () => {
  const paths = getCenyrClassDefinition('derwyn').pathSelection.allowedFormIds;
  assert.equal(paths.length, 4);
  for (const foundation of [D.jungdrache, W.foundation]) {
    let profile = select(profileFor('derwyn'), 'foundation', foundation, 1);
    profile = select(profile, 'path', paths[0], 9);
    const result = reconcileCenyrTrainingForLevel(profile, 20, { autoFill: true }).profile;
    const plan = assertLegalTraining(result);
    assert.equal(plan.foundationFormId, foundation);
    assert.equal(plan.styles.flatMap(style => style.forms).filter(form => form.isFoundationChoice && form.available).length, 1);
    assert.equal(sanitizeCharacterCombatProfile(result).classTraining.selections.find(item => item.kind === 'foundation').selectionId, foundation);
    assert.equal(result.techniques.filter(technique => [D.jungdrache, W.foundation].includes(technique.combatStyleFormId)).length, 3);
    const other = foundation === D.jungdrache ? W.foundation : D.jungdrache;
    const changed = reconcileCenyrTrainingForLevel(select(result, 'foundation', other, 1), 20, { autoFill: true }).profile;
    assertLegalTraining(changed);
    assert.ok(!changed.techniques.some(technique => technique.combatStyleFormId === foundation));
    assert.deepEqual(changed.classTraining.selections.filter(item => item.kind === 'path'), result.classTraining.selections.filter(item => item.kind === 'path'));
  }
});

test('Derwyn creation requires an explicit foundation and grants only its own attacks', () => {
  const draft = createCharacterCreationDraft(profileFor('derwyn', 1));
  assert.ok(validateCharacterCreationDraft(draft).some(error => error.includes('Grundausbildung')));
  for (const foundation of [D.jungdrache, W.foundation]) {
    const chosen = { ...draft, foundationFormId: foundation };
    const shown = getCreationStartingTechniques(chosen);
    assert.ok(shown.length > 0);
    assert.ok(shown.every(technique => technique.combatStyleFormId === foundation && technique.cenyrTraining.allowedClassIds.includes('derwyn')));
    const created = applyCharacterCreationDraft(profileFor('derwyn', 1), chosen);
    assert.equal(created.ok, true, created.errors.join(' '));
    assertLegalTraining(created.profile);
    assert.equal(created.profile.techniques.length, 1);
  }
});

test('Derwyn levels seven and eight provide creative slots and level nine exposes only the four Wyrm paths', () => {
  const fresh = profileFor('derwyn', 8);
  const foundation = getCenyrLevelUpTrainingChoices(fresh, 9).find(group => group.kind === 'foundation');
  assert.equal(foundation.options.length, 2);
  const choices = getCenyrLevelUpTrainingChoices(select(fresh, 'foundation', W.foundation, 1), 9);
  assert.deepEqual(choices.find(group => group.kind === 'path').options.map(option => option.id), getCenyrClassDefinition('derwyn').pathSelection.allowedFormIds);
  const plan = getCenyrClassProgression('derwyn', 8, { foundationFormId: W.foundation });
  for (const level of [7, 8]) assert.equal(plan.levels[level - 1].phase.name, 'Freie kreative Phase');
  const previewPlan = createCharacterLevelUpPlan(fresh);
  previewPlan.classTrainingChoices = { foundation: W.foundation, path: W.flowing };
  const preview = previewCharacterLevelUp(fresh, previewPlan);
  assert.equal(preview.plan.classTrainingChoices.foundation, W.foundation, 'level-up plan keeps the foundation selection');
  assert.ok(!preview.errors.some(error => error.includes('Grundausbildung')));
});

test('all four learned Wyrm forms resolve into scene actions with functional costs and weapon restrictions', () => {
  const definition = getCenyrClassDefinition('derwyn');
  for (const formId of definition.pathSelection.allowedFormIds) {
    let profile = select(profileFor('derwyn', 9), 'foundation', W.foundation, 1);
    profile = select(profile, 'path', formId, 9);
    const group = getCenyrTechniqueChoiceGroups(profile, 9).find(item => item.slot.band === 'expert');
    const candidate = group.options.find(technique => technique.combatStyleFormId === formId);
    assert.ok(candidate, formId);
    const selected = selectCenyrTechniqueForSlot(profile, { slotId: group.slotId, techniqueId: candidate.id, selectedAtLevel: 9 });
    assert.equal(selected.ok, true, selected.errors.join(' '));
    profile = selected.profile;
    const allowedWeapon = profile.weapons.find(weapon => candidate.compatibleWeaponIds.includes(weapon.id));
    assert.ok(allowedWeapon, candidate.name);
    profile.weapons.forEach(weapon => { weapon.equipped = weapon.id === allowedWeapon.id; });
    profile.combat.mainHandWeaponId = allowedWeapon.id;
    const scene = resolveCombatProfile({ id: 'derwyn-test', name: 'Derwyn', combatProfile: profile }, { actionId: `technique:${candidate.id}` });
    assert.equal(scene.selectedAction.id, `technique:${candidate.id}`);
    assert.equal(scene.selectedAction.compatible, true, scene.selectedAction.disabledReason);
    assert.ok(scene.selectedAction.costs.length > 0, 'real action resource costs');
    assert.equal(resolveCenyrTechniqueWeaponRules(profile, candidate, allowedWeapon).compatible, true);
    assert.equal(resolveCenyrTechniqueWeaponRules(profile, candidate, weapon('longbow', 'bow')).compatible, false);
    assert.ok(!/Sirenentanz/.test(scene.selectedAction.trainingForm || ''));
  }
});

test('old Derwyn advanced slot names migrate without inventing a replacement expert path', () => {
  const profile = profileFor('derwyn');
  profile.classTraining = { curriculumId: 'vennyr-derwyn', selections: [{ kind: 'path', selectionId: 'sirenentanz-brechende-brandung', selectedAtLevel: 9 }],
    techniqueSelections: [{ slotId: 'advanced-01', techniqueId: 'combat-style-sirenentanz-derwyn-kehrender-saphir', selectedAtLevel: 7 }] };
  const state = getCenyrTrainingState(profile);
  assert.equal(state.selections.length, 0);
  assert.equal(state.techniqueSelections[0].slotId, 'duelist-01');
});

test('new Cenyr paths resolve learned attacks for every intended owner and mounted constraints survive saves', () => {
  const forms = {
    cantref: [D.speerdrache, D.peitschender, D.huetender],
    uchelwyr: [D.speerdrache, D.peitschender, D.huetender, D.stuermender, D.schweifender],
    helwyr: [D.lauernder, D.jagender], arthwyr: [D.baerenklaue]
  };
  for (const [classId, pathIds] of Object.entries(forms)) for (const formId of pathIds) {
    let profile = select(profileFor(classId, 9), 'path', formId, 9);
    const group = getCenyrTechniqueChoiceGroups(profile, 9).find(group => group.slot.band === 'expert');
    const candidate = group.options.find(technique => technique.combatStyleFormId === formId);
    assert.ok(candidate, `${classId}: ${formId} has an initial attack`);
    const result = selectCenyrTechniqueForSlot(profile, { slotId: group.slotId, techniqueId: candidate.id, selectedAtLevel: 9 });
    assert.equal(result.ok, true, result.errors.join(' '));
    profile = sanitizeCharacterCombatProfile(result.profile);
    const allowedWeapon = profile.weapons.find(weapon => candidate.compatibleWeaponIds.includes(weapon.id));
    assert.ok(allowedWeapon, `${classId}: ${candidate.name} has a compatible carried weapon`);
    profile.weapons.forEach(weapon => { weapon.equipped = weapon.id === allowedWeapon.id; });
    const scene = resolveCombatProfile({ id: `test-${classId}`, combatProfile: profile }, { actionId: `technique:${candidate.id}` });
    assert.equal(scene.selectedAction.id, `technique:${candidate.id}`);
    assert.equal(scene.selectedAction.compatible, true, `${classId}: ${scene.selectedAction.disabledReason}`);
    assert.ok(scene.selectedAction.costs.length);
    if (candidate.cenyrTraining.requiresMounted) {
      const unmounted = resolveCenyrTechniqueWeaponRules({ ...profile, combat: { mounted: false } }, candidate, allowedWeapon);
      assert.equal(unmounted.compatible, false, 'cavalry requires a mount');
    }
  }
});

test('Wyrm weapons distinguish tridents, morningstars and free hands from similar weapon families', () => {
  const profile = profileFor('derwyn', 20);
  const catalog = getCenyrClassProgression('derwyn', 20).attackCatalog;
  const trident = catalog.find(technique => technique.combatStyleFormId === W.breaking);
  const morningstar = catalog.find(technique => technique.combatStyleFormId === W.whipping);
  const staff = catalog.find(technique => technique.combatStyleFormId === W.rising);
  assert.equal(resolveCenyrTechniqueWeaponRules(profile, trident, { weaponType: 'spear', name: 'Speer' }).compatible, false);
  assert.equal(resolveCenyrTechniqueWeaponRules(profile, trident, { weaponType: 'spear', name: 'Dreizack' }).compatible, true);
  assert.equal(resolveCenyrTechniqueWeaponRules(profile, morningstar, { weaponType: 'mace', name: 'Streitkolben' }).compatible, false);
  assert.equal(resolveCenyrTechniqueWeaponRules(profile, morningstar, { weaponType: 'mace', name: 'Morgenstern' }).compatible, true);
  const savedStaff = sanitizeCharacterCombatProfile({ ...profile, techniques: [staff] }).techniques[0];
  assert.equal(savedStaff.cenyrTraining.requiresTwoHands, true);
  assert.equal(resolveCenyrTechniqueWeaponRules({ ...profile, armorItems: [{ kind: 'shield', equipped: true }] }, savedStaff,
    { id: 'staff', weaponType: 'staff', name: 'Zauberstab' }).compatible, false);
  assert.equal(resolveCenyrTechniqueWeaponRules({ ...profile, combat: { offHandWeaponId: 'sword' } }, savedStaff,
    { id: 'staff', weaponType: 'staff', name: 'Kampfstab' }).compatible, false);
});
