import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { getCenyrClassDefinitions, getCenyrClassDefinition, withCenyrClassTraining } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassProgression } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js';
import { getCenyrCharacterClassSummary } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-sheet.js';
import { getCenyrClassActionModifiers } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-combat-rules.js';
import { getCenyrLevelUpTrainingChoices, selectCenyrTrainingOption } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-training.js';
import { resolveCenyrTechniqueWeaponRules } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-technique-weapon-rules.js';
import { getCombatStyle, getCombatStyleTechniqueUnlockLevel, addMissingCombatStyleTechniques } from '../../AleriaAlmanach/modules/combat-styles/combat-style-registry.js';
import { getCharacterCreationTemplate } from '../../AleriaAlmanach/modules/combat/character-creation-templates.js';
import { createCharacterCreationDraft, applyCharacterCreationDraft } from '../../AleriaAlmanach/modules/combat/character-creation-model.js';
import {
  applyManualCharacterLevel,
  createCharacterLevelUpPlan,
  previewCharacterLevelUp,
  getLevelUpAttributePointAllowance
} from '../../AleriaAlmanach/modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, getWeaponAttackModifier, getWeaponDamageModifier } from '../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { resolveTechniqueDamageFormula } from '../../AleriaAlmanach/modules/combat/combat-technique-damage.js';
import { getAuraFocusMaximum, getCombatActionEconomy } from '../../AleriaAlmanach/modules/combat/combat-resource-progression.js';
import { DRACHENTANZ_FORM_IDS as FORM_IDS } from '../../AleriaAlmanach/modules/combat-styles/drachentanz/drachentanz-ids.js';
import { classifyCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-classification.js';
import { getCharacterArchiveClassLinks } from '../../AleriaAlmanach/modules/character-archive/character-archive-class-links.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';
import { getCultureClassPageHref } from '../modules/culture/culture-class-registry.js';

const definitions = getCenyrClassDefinitions();
const root = new URL('../', import.meta.url);
const culture = JSON.parse(await readFile(new URL('Cenyr/kultur.json', root), 'utf8'));
const sourcePassages = { milwr: 'Fundament des cenyrischen Heeres', teulu: 'Vom Becher und vom Durst', cantref: 'Hundertschaft des Landes', uchelwyr: 'Ritter des hohen Sattels', helwyr: 'Offiziere, Bannerträger, Engstellen', arthwyr: 'Tanz der Bärenklaue', barddwyr: 'Haus Ceirwyn O’Calon' };
const trainingPassages = { milwr: '9 Slots bis Stufe 20', teulu: '24 Slots bis Stufe 20', cantref: 'Hellebarde', uchelwyr: 'Tanz des stürmenden Drachens', helwyr: 'Langbogenfolge', arthwyr: 'Großschwert', barddwyr: 'Tanz des kreischenden Drachens' };

test('seven cultural pages preserve supplied lore, artwork proportions and local navigation', async () => {
  for (const definition of definitions) {
    const path = `Cenyr/${definition.classId}/`;
    const document = resolveCultureClassDocument(JSON.parse(await readFile(new URL(`${path}klasse.json`, root), 'utf8')), culture);
    const page = await readFile(new URL(`${path}index.html`, root), 'utf8');
    assert(page.includes(sourcePassages[definition.classId]));
    assert(page.includes(trainingPassages[definition.classId]));
    assert(!/animexx|Titel hier|Zitatgeber|Dialog von Figur|\bonclick=/.test(page));
    assert.equal((page.match(/data-training-row="/g) || []).length, 20);
    assert.equal((page.match(/data-training-attack="/g) || []).length, getCenyrClassProgression(definition.classId, 20).attackCatalog.length);
    assert(page.includes(`width="${document.artwork.width}" height="${document.artwork.height}"`));
    const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const [, href] of page.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      if (/^https:/.test(href)) continue;
      if (href.startsWith('#')) assert(ids.includes(href.slice(1)));
      else { const target = new URL(href, new URL(`${path}index.html`, root)); target.search = ''; target.hash = ''; await access(target); }
    }
  }
});

test('class curricula separate foundation, free training and selectable paths with complete attack pools', () => {
  const canonical = getCombatStyle('drachentanz');
  assert.equal(canonical.forms.length, 20);
  assert.deepEqual(canonical.forms.slice(0, 3).map(form => form.kind), ['foundation', 'duelist', 'path']);
  assert.deepEqual(canonical.forms.slice(2, 7).map(form => form.techniqueLevelBand), Array(5).fill({ minimum: 9, maximum: 20 }));
  assert.equal(canonical.forms[1].shortName, 'Freie Vertiefung');
  assert.deepEqual(canonical.forms[1].techniqueLevelBand, { minimum: 7, maximum: 8 });
  assert.equal(canonical.forms[2].shortName, 'Tanz des Schwertdrachens');
  assert.equal(canonical.forms[2].techniques.length, 24);
  assert(canonical.forms[2].techniques.every(technique => technique.maximumTargets === 1));
  assert.equal(canonical.forms.some(form => /zornigen/i.test(form.shortName)), false);
  assert.equal(canonical.forms.at(-3).shortName, 'Tanz des Drachlings');
  assert.equal(canonical.forms.at(-2).shortName, 'Tanz des trällernden Drachens');
  assert.equal(canonical.forms.at(-1).shortName, 'Tanz des kreischenden Drachens');
  const expectedBudgets = { milwr: 9, teulu: 24, cantref: 14, uchelwyr: 16, helwyr: 12, arthwyr: 14, barddwyr: 8 };
  const expectedCatalogSizes = { milwr: 9, teulu: 95, cantref: 38, uchelwyr: 65, helwyr: 145, arthwyr: 98, barddwyr: 48 };
  for (const definition of definitions) {
    const plan = getCenyrClassProgression(definition.id, 20);
    assert.equal(plan.levels.length, 20);
    assert(plan.availableAttacks.every(attack => attack.minimumLevel <= 6));
    assert.equal(plan.availableAttacks.length, definition.classId === 'teulu' ? 10 : 0);
    assert(plan.pendingFeatures.every(feature => feature.minimumLevel === null));
    assert.equal(plan.levels[5].level, 6);
    assert.equal(plan.techniqueBudget.total, expectedBudgets[definition.classId]);
    assert.equal(plan.earnedTechniqueSlots.length, expectedBudgets[definition.classId]);
    assert.equal(plan.attackCatalog.length, expectedCatalogSizes[definition.classId]);
  }
  assert.deepEqual(getCenyrClassProgression('teulu', 20).trainingPhases.map(phase => [phase.minimumLevel, phase.maximumLevel]), [[1, 6], [7, 8], [9, 20]]);
  assert.equal(getCenyrClassProgression('teulu', 9).pathOptions.filter(path => path.eligible).length, 6);
  assert.equal(getCenyrClassProgression('teulu', 9).pathOptions.filter(path => path.available).length, 0, 'Pfade werden nicht ohne Wahl gewährt');
  assert.equal(getCenyrClassProgression('milwr', 20).styles[0].forms.length, 2);
  assert.deepEqual(getCenyrClassProgression('milwr', 20).trainingPhases.map(phase => [phase.minimumLevel, phase.maximumLevel]), [[1, 6], [6, 15], [16, 20]]);
  assert.equal(getCenyrClassProgression('arthwyr', 6).styles[0].forms.find(form => form.shortName === 'Tanz des brüllenden Drachens').available, true);
  assert.equal(getCenyrClassDefinition('helwyr').techniquePool.ratioToTeulu, 0.5);
  assert.deepEqual(getCenyrClassProgression('barddwyr', 9).pathOptions.filter(path => path.eligible).map(path => path.shortName), [
    'Tanz des Schwertdrachens', 'Tanz des kreischenden Drachens'
  ]);
  assert.deepEqual(getCenyrClassProgression('barddwyr', 9).pathOptions.filter(path => path.blocked), []);
  for (const classId of ['cantref', 'uchelwyr']) {
    const paths = getCenyrClassProgression(classId, 9).pathOptions;
    assert.equal(paths[0].id, FORM_IDS.speerdrache);
    assert.equal(paths[0].shortName, 'Tanz des Speerdrachens');
    assert.equal(paths.some(path => path.id === FORM_IDS.schwertdrache), false);
  }
  assert.equal(getCenyrClassProgression('teulu', 6).availableAttacks.length, 10);
});

test('all registered attack designs are complete, level-valid and safely kept in draft', () => {
  const techniques = getCombatStyle('drachentanz').forms.flatMap(form => form.techniques);
  assert.equal(techniques.length, 297);
  assert.equal(new Set(techniques.map(technique => technique.id)).size, techniques.length);
  for (const technique of techniques) {
    assert(technique.name && technique.description && technique.effect && technique.requirements, technique.id);
    assert(technique.minimumLevel >= 1 && technique.minimumLevel <= 20, technique.id);
    assert(technique.costs.length > 0, technique.id);
    if (technique.status === 'draft') {
      const light = technique.costs.length === 1 && technique.costs[0].resourceId === 'bonus-action';
      const support = !technique.effects.some(effect => effect.type === 'damage');
      assert.equal(technique.damageModel.mode, light || support ? 'fixed' : 'weapon-dice', technique.id);
      if (light) assert.equal(technique.damageFormula, '1d6', technique.id);
      assert(technique.cenyrTraining.allowedClassIds.length > 0, technique.id);
    }
    const economy = getCombatActionEconomy(technique.minimumLevel);
    for (const cost of technique.costs) {
      const maximum = cost.resourceId === 'aura-focus'
        ? getAuraFocusMaximum(technique.minimumLevel)
        : economy[cost.resourceId];
      assert.notEqual(maximum, undefined, `${technique.id}: ${cost.resourceId}`);
      assert(cost.amount <= maximum, `${technique.id}: ${cost.amount} ${cost.resourceId}, aber nur ${maximum} verfügbar`);
    }
  }
  const drafts = techniques.filter(technique => technique.status === 'draft');
  assert.equal(drafts.length, 281);
  const experts = drafts.filter(technique => technique.minimumLevel >= 13 && technique.cenyrTraining.slotBands.includes('expert'));
  assert(experts.some(technique => technique.costs.every(cost => ['action', 'bonus-action', 'reaction'].includes(cost.resourceId))), 'Auch erfahrene Figuren behalten erneuerbare Expertenattacken');
  assert(experts.filter(technique => technique.minimumLevel === 20).every(technique => technique.costs.some(cost => cost.resourceId === 'special-action')), 'Meisterabschlüsse benötigen Tagesressourcen');
});

test('class-specific attack quotas preserve each Cenyr combat identity', () => {
  const uchelwyr = getCenyrClassProgression('uchelwyr', 20);
  const mounted = uchelwyr.attackCatalog.filter(technique => technique.cenyrTraining.requiresMounted);
  assert.equal(mounted.length, 16);
  assert.equal(mounted.filter(technique => technique.combatStyleFormId === FORM_IDS.jungdrache).length, 2);
  assert.equal(mounted.filter(technique => technique.combatStyleFormId === FORM_IDS.vertiefung).length, 2);
  assert.equal(mounted.filter(technique => [FORM_IDS.stuermender, FORM_IDS.schweifender].includes(technique.combatStyleFormId)).length, 12);
  const borrowedCantref = uchelwyr.attackCatalog.filter(technique => technique.id.startsWith('combat-style-drachentanz-cantref-')
    && technique.cenyrTraining.allowedClassIds.includes('cantref'));
  assert.equal(borrowedCantref.length, 5);
  assert(borrowedCantref.every(technique => technique.cenyrTraining.classWeaponProfiles.uchelwyr?.includes('lance')));

  const helwyr = getCenyrClassProgression('helwyr', 20);
  assert.equal(helwyr.attackCatalog.filter(technique => technique.cenyrTraining.slotBands.includes('expert')).length, 127);
  assert.equal(helwyr.attackCatalog.filter(technique => technique.combatStyleFormId === FORM_IDS.lauernder).length, 14);
  assert.equal(helwyr.attackCatalog.filter(technique => technique.combatStyleFormId === FORM_IDS.zwillingsdrache).length, 12);
  assert.equal(helwyr.attackCatalog.filter(technique => technique.combatStyleFormId === FORM_IDS.schwertdrache).length, 12);

  const barddwyr = getCenyrClassProgression('barddwyr', 20);
  assert.equal(barddwyr.attackCatalog.filter(technique => technique.combatStyleFormId.includes('traellernder')).length, 4);
  assert.equal(barddwyr.attackCatalog.filter(technique => technique.combatStyleFormId.includes('kreischender')).length, 12);
  assert.equal(barddwyr.attackCatalog.filter(technique => technique.combatStyleFormId === FORM_IDS.bruellender).length, 0);
  assert.equal(getCenyrClassProgression('milwr', 20).attackCatalog.filter(technique => technique.combatStyleFormId.endsWith('drachling')).length, 5);
  assert.equal(getCenyrClassProgression('arthwyr', 6).attackCatalog.filter(technique => technique.minimumLevel === 6 && technique.combatStyleFormId.includes('bruellender')).length, 1);
});

test('path dependencies, exclusive paths and equipment requirements fail closed', () => {
  const levelNine = { templateSelections: { classId: 'teulu' }, progression: { level: 9 } };
  const risingWithoutParent = selectCenyrTrainingOption(levelNine, {
    kind: 'path', selectionId: FORM_IDS.aufsteigender, selectedAtLevel: 9
  });
  assert.equal(risingWithoutParent.ok, false);
  assert.match(risingWithoutParent.errors[0], /fliegenden Drachens/i);

  const flying = selectCenyrTrainingOption(levelNine, {
    kind: 'path', selectionId: FORM_IDS.fliegender, selectedAtLevel: 9
  });
  assert.equal(flying.ok, true);
  const rising = selectCenyrTrainingOption(flying.profile, {
    kind: 'path', selectionId: FORM_IDS.aufsteigender, selectedAtLevel: 9
  });
  assert.equal(rising.ok, true);
  assert.equal(rising.selection.spentTechniqueSlotId, 'expert-01');

  for (const [classId, formId] of [['uchelwyr', FORM_IDS.stuermender], ['cantref', FORM_IDS.speerdrache], ['helwyr', FORM_IDS.lauernder]]) {
    assert(getCenyrClassProgression(classId, 9).pathOptions.some(path => path.id === formId && path.eligible));
    assert.equal(getCenyrClassProgression('teulu', 9).pathOptions.some(path => path.id === formId), false);
  }

  const twin = getCenyrClassProgression('helwyr', 20).attackCatalog.find(technique => technique.combatStyleFormId === FORM_IDS.zwillingsdrache);
  const helwyr = { templateSelections: { classId: 'helwyr' }, progression: { level: 20 } };
  assert.equal(resolveCenyrTechniqueWeaponRules(helwyr, twin, { weaponType: 'sword', weaponProfileId: 'sword' }).compatible, false);
  assert.equal(resolveCenyrTechniqueWeaponRules(helwyr, twin, { weaponType: 'sword', weaponProfileId: 'dual-swords' }).compatible, true);

  const shield = getCenyrClassProgression('teulu', 20).attackCatalog.find(technique => technique.cenyrTraining.requiresShield);
  const teulu = { templateSelections: { classId: 'teulu' }, progression: { level: 20 }, weapons: [] };
  assert.equal(resolveCenyrTechniqueWeaponRules(teulu, shield, { weaponType: 'sword', weaponProfileId: 'sword' }).compatible, false);
  assert.equal(resolveCenyrTechniqueWeaponRules({ ...teulu, armorItems: [{ id: 'shield', kind: 'shield', equipped: true }] }, shield, { weaponType: 'sword', weaponProfileId: 'sword' }).compatible, true);

  const spearDragonDuel = getCenyrClassProgression('cantref', 20).attackCatalog
    .find(technique => technique.combatStyleFormId === FORM_IDS.speerdrache);
  const halberdDuel = resolveCenyrTechniqueWeaponRules(
    { templateSelections: { classId: 'cantref' }, progression: { level: 20 } },
    spearDragonDuel,
    { weaponType: 'polearm', weaponProfileId: 'halberd' }
  );
  assert.equal(halberdDuel.compatible, true);
  assert.equal(halberdDuel.maximumTargets, 1, 'Die Hellebarde darf einen ausdrücklichen Duellangriff nicht auf vier Ziele erweitern.');
});

test('selected path passives apply only in their declared context and replace lower tiers', () => {
  const schwertdrache = getCenyrClassProgression('teulu', 20).attackCatalog.find(technique => technique.combatStyleFormId === FORM_IDS.schwertdrache);
  const teulu = {
    templateSelections: { classId: 'teulu' }, progression: { level: 20 },
    classTraining: { selections: [{ kind: 'path', selectionId: FORM_IDS.schwertdrache, selectedAtLevel: 9 }] }
  };
  const duel = getCenyrClassActionModifiers(teulu, { technique: schwertdrache, weapon: { weaponType: 'sword' }, hostileOpponentCount: 1 });
  assert.equal(duel.attackBonus, 3);
  assert.equal(duel.damageBonus, 2);
  assert.equal(duel.targetDefenseModifier, -1);
  const groupFight = getCenyrClassActionModifiers(teulu, { technique: schwertdrache, weapon: { weaponType: 'sword' }, hostileOpponentCount: 2 });
  assert.equal(groupFight.attackBonus, 0);
  assert.equal(groupFight.damageBonus, 2);
  assert.equal(groupFight.targetDefenseModifier, undefined);

  const risingTechnique = getCenyrClassProgression('teulu', 20).attackCatalog.find(technique => technique.combatStyleFormId === FORM_IDS.aufsteigender);
  const risingProfile = {
    ...teulu,
    classTraining: { selections: [
      { kind: 'path', selectionId: FORM_IDS.fliegender, selectedAtLevel: 9 },
      { kind: 'path', selectionId: FORM_IDS.aufsteigender, selectedAtLevel: 10 }
    ] }
  };
  assert.equal(getCenyrClassActionModifiers(risingProfile, { technique: risingTechnique, weapon: { weaponType: 'sword' } }).criticalThreshold, 18);
});

test('each Cenyr template follows its curriculum through actual creation and every level-up to 20', () => {
  for (const definition of definitions) {
    const draft = createCharacterCreationDraft({});
    draft.selections = { ancestryId: 'cenyr', backgroundId: '', classId: definition.templateId };
    draft.attributeMethod = 'free';
    const result = applyCharacterCreationDraft({}, draft, { now: '2026-09-05T00:00:00Z' });
    assert(result.ok);
    let profile = result.profile;
    assert.equal(profile.classTraining.curriculumId, definition.id);
    for (let level = 1; level <= 20; level += 1) {
      const selected = profile.classTraining.techniqueSelections;
      assert.equal(profile.techniques.length, selected.length, `${definition.id}: ausgewählte Attacken auf Stufe ${level}`);
      assert.deepEqual(profile.techniques.map(attack => attack.id), selected.map(selection => selection.techniqueId));
      assert(profile.techniques.every(attack => attack.status === 'confirmed' && attack.minimumLevel <= level));
      if (definition.classId === 'barddwyr') assert.equal(profile.magic.enabled, level >= 6, `Barddwyr magic at level ${level}`);
      if (level === 20) break;
      const plan = createCharacterLevelUpPlan(profile);
      plan.attributeIncreases.strength = getLevelUpAttributePointAllowance(profile);
      let preview = previewCharacterLevelUp(profile, plan);
      preview.actionPoolChoiceGroups.filter(group => !group.selectedId).forEach(group => {
        plan.actionPoolChoices[group.level] = group.options[0].id;
      });
      preview.classTrainingChoiceGroups.filter(group => group.required).forEach(group => {
        plan.classTrainingChoices[group.kind] = group.options[0].id;
      });
      preview = previewCharacterLevelUp(profile, plan);
      const choicesThisLevel = new Set();
      preview.classTechniqueChoiceGroups.forEach(group => {
        assert(group.options.length > 0, `${definition.id}: keine Attacke für ${group.slotId} auf Stufe ${level + 1}`);
        const option = group.options.find(option => !choicesThisLevel.has(option.id));
        assert(option, `${definition.id}: eigener Technikvorschlag für ${group.slotId}`);
        plan.cenyrTechniqueChoices[group.slotId] = option.id;
        choicesThisLevel.add(option.id);
      });
      preview = previewCharacterLevelUp(profile, plan);
      assert(preview.ready, preview.errors.join(', '));
      profile = preview.profile;
    }
    if (definition.classId === 'barddwyr') assert.equal(profile.magic.enabled, true);
  }
});

test('manual level alignment rebuilds every Cenyr curriculum upward and prunes it downward', () => {
  for (const definition of definitions) {
    const draft = createCharacterCreationDraft({});
    draft.selections = { ancestryId: 'cenyr', backgroundId: '', classId: definition.templateId };
    draft.attributeMethod = 'free';
    const created = applyCharacterCreationDraft({}, draft, { now: '2026-09-05T00:00:00Z' });
    assert.equal(created.ok, true);

    const raised = applyManualCharacterLevel(created.profile, 20);
    const levelTwentyPlan = getCenyrClassProgression(definition.id, 20, { classTraining: raised.profile.classTraining });
    assert.equal(raised.pendingTechniqueSlots.length, 0, `${definition.id}: offene Slots auf Stufe 20`);
    assert.equal(raised.profile.classTraining.techniqueSelections.length, levelTwentyPlan.earnedTechniqueSlots.length);
    assert(raised.profile.techniques.every(technique => technique.minimumLevel <= 20 && technique.status === 'confirmed'));
    if (definition.pathSelection.firstSelectionRequired) {
      assert(raised.profile.classTraining.selections.some(selection => selection.kind === 'path'));
    }

    const lowered = applyManualCharacterLevel(raised.profile, 5);
    const levelFivePlan = getCenyrClassProgression(definition.id, 5, { classTraining: lowered.profile.classTraining });
    assert.equal(lowered.pendingTechniqueSlots.length, 0, `${definition.id}: offene Slots auf Stufe 5`);
    assert.equal(lowered.profile.classTraining.techniqueSelections.length, levelFivePlan.earnedTechniqueSlots.length);
    assert(lowered.profile.classTraining.selections.every(selection => selection.selectedAtLevel <= 5));
    assert(lowered.profile.techniques.every(technique => technique.minimumLevel <= 5));
  }
});

test('unplanned attacks fail closed and repeated grants preserve individual character edits', () => {
  const closedGrant = getCenyrClassDefinition('helwyr').combatStyleGrants[0];
  const grant = getCenyrClassDefinition('teulu').combatStyleGrants[0];
  const attack = getCombatStyle('drachentanz').forms[0].techniques[0];
  assert.equal(getCombatStyleTechniqueUnlockLevel(closedGrant, { ...attack, id: 'future-attack' }), null);
  assert.equal(getCombatStyleTechniqueUnlockLevel({ ...grant, techniqueUnlockLevels: { [attack.id]: null } }, attack), null);
  const draft = getCombatStyle('drachentanz').forms[1].techniques[0];
  assert.equal(addMissingCombatStyleTechniques([], [{ styleId: 'drachentanz', formId: draft.combatStyleFormId, minimumLevel: 7 }], 20).added.length, 0);
  const existing = [{ ...attack, damageFormula: '1d4', name: 'Meine Variante' }];
  const updated = addMissingCombatStyleTechniques(existing, [grant, grant], 20);
  assert.equal(updated.techniques.length, 10);
  assert.equal(updated.techniques[0].damageFormula, '1d4');
  assert.deepEqual(existing, [{ ...attack, damageFormula: '1d4', name: 'Meine Variante' }]);
  assert.equal(addMissingCombatStyleTechniques(updated.techniques, [grant], 20).added.length, 0);
});

test('confirmed class bonuses remain conditional on class, level, style and weapon', () => {
  const technique = getCombatStyle('drachentanz').forms[0].techniques[0];
  const profile = (classId, level) => ({ templateSelections: { classId }, progression: { level } });
  assert.equal(getCenyrClassActionModifiers(profile('teulu', 5), { technique, weapon: { weaponType: 'sword' } }).damageBonus, 0);
  assert.equal(getCenyrClassActionModifiers(profile('teulu', 6), { technique, weapon: { weaponType: 'sword' } }).damageBonus, 2);
  assert.equal(getCenyrClassActionModifiers(profile('teulu', 6), { technique, weapon: { weaponType: 'axe' } }).damageBonus, 0);
  assert.equal(getCenyrClassActionModifiers(profile('helwyr', 1), { weapon: { weaponType: 'bow' } }).attackBonus, 2);
  assert.equal(getCenyrClassActionModifiers(profile('helwyr', 1), { weapon: { weaponType: 'spear', range: 'Fernkampf' } }).attackBonus, 2);
  assert.equal(getCenyrClassActionModifiers(profile('helwyr', 1), { weapon: { weaponType: 'sword' } }).attackBonus, 0);
  assert.equal(getCenyrClassActionModifiers({ identity: { archetype: 'Helwyr', ancestry: 'Cenyr' }, progression: { level: 1 } }, { weapon: { weaponType: 'bow' } }).attackBonus, 2);
  assert.deepEqual(getCenyrClassActionModifiers(profile('arthwyr', 1), { technique, weapon: { weaponType: 'axe' } }), {
    attackBonus: -2, damageBonus: 2, criticalThreshold: 20, sources: [{ id: 'arthwyr-brutal-style', name: 'Brachialer Drachentanz' }]
  });

  const teuluWeapon = getCharacterCreationTemplate('class', 'teulu').weapons[0];
  const teuluProfile = sanitizeCharacterCombatProfile({ templateSelections: { classId: 'teulu' }, progression: { level: 6 },
    weapons: [teuluWeapon], techniques: [technique] });
  const teuluAction = resolveCombatProfile({ id: 'teulu-test', name: 'Teulu', combatProfile: teuluProfile }, { actionId: `technique:${technique.id}` });
  assert.equal(teuluAction.damageModifier, getWeaponDamageModifier(teuluProfile, teuluProfile.weapons[0]) + 2);

  const helwyrWeapon = getCharacterCreationTemplate('class', 'helwyr').weapons[0];
  const helwyrProfile = sanitizeCharacterCombatProfile({ templateSelections: { classId: 'helwyr' }, progression: { level: 1 }, weapons: [helwyrWeapon] });
  const helwyrAction = resolveCombatProfile({ id: 'helwyr-test', name: 'Helwyr', combatProfile: helwyrProfile }, { actionId: `weapon:${helwyrWeapon.id}` });
  assert.equal(helwyrAction.attackModifier, getWeaponAttackModifier(helwyrProfile, helwyrProfile.weapons[0]) + 2);
});

test('Pfad- und Barddwyr-Zweigwahlen verwenden das gemeinsame Attackenbudget', () => {
  const base = { templateSelections: { classId: 'teulu' }, progression: { level: 10 } };
  const first = selectCenyrTrainingOption(base, { kind: 'path', selectionId: 'drachentanz-form-iii-abwartender-drache', selectedAtLevel: 9 });
  assert.equal(first.ok, true);
  assert.equal(first.selection.spentTechniqueSlotId, '');
  const second = selectCenyrTrainingOption(first.profile, { kind: 'path', selectionId: 'drachentanz-form-iv-fliegender-drache', selectedAtLevel: 10 });
  assert.equal(second.ok, true);
  assert.equal(second.selection.spentTechniqueSlotId, 'expert-02');

  const bard = { templateSelections: { classId: 'barddwyr' }, progression: { level: 9 } };
  const rapier = selectCenyrTrainingOption(bard, { kind: 'branch', selectionId: 'barddwyr-rapier', selectedAtLevel: 7 });
  assert.equal(rapier.selection.spentTechniqueSlotId, '');
  const sword = selectCenyrTrainingOption(rapier.profile, { kind: 'branch', selectionId: 'barddwyr-sword', selectedAtLevel: 7 });
  assert.equal(sword.selection.spentTechniqueSlotId, 'duelist-01');
  const blocked = selectCenyrTrainingOption(sword.profile, { kind: 'path', selectionId: 'drachentanz-form-v-bruellender-drache', selectedAtLevel: 9 });
  assert.equal(blocked.ok, false);

  const levelEight = sanitizeCharacterCombatProfile({ templateSelections: { classId: 'teulu' }, progression: { level: 8 } });
  const requiredPlan = createCharacterLevelUpPlan(levelEight);
  assert.equal(previewCharacterLevelUp(levelEight, requiredPlan).ready, false);
  requiredPlan.classTrainingChoices.path = 'drachentanz-form-iii-abwartender-drache';
  let selectedPreview = previewCharacterLevelUp(levelEight, requiredPlan);
  assert.equal(selectedPreview.ready, false);
  assert.equal(selectedPreview.classTechniqueChoiceGroups.length, 1);
  const [techniqueGroup] = selectedPreview.classTechniqueChoiceGroups;
  requiredPlan.cenyrTechniqueChoices[techniqueGroup.slotId] = techniqueGroup.options[0].id;
  selectedPreview = previewCharacterLevelUp(levelEight, requiredPlan);
  assert.equal(selectedPreview.ready, true);
  assert.equal(selectedPreview.profile.classTraining.selections[0].selectionId, requiredPlan.classTrainingChoices.path);
});

test('Waffenwürfel und Cenyr-Waffenprofile werden erst bei der Kampfhandlung aufgelöst', () => {
  assert.equal(resolveTechniqueDamageFormula({ damageModel: { mode: 'weapon-dice', weaponDiceMultiplier: 2, bonusFormula: '1d6' } }, { damageFormula: '1d10' }), '2d10+1d6');
  const technique = { combatStyleId: 'drachentanz', cenyrTraining: { weaponRuleSetId: 'cantref-polearm', uchelwyrCompatible: true } };
  const cantref = { templateSelections: { classId: 'cantref' }, progression: { level: 10 } };
  assert.equal(resolveCenyrTechniqueWeaponRules(cantref, technique, { weaponType: 'spear', weaponProfileId: 'lance' }).targetDefenseModifier, -1);
  assert.equal(resolveCenyrTechniqueWeaponRules(cantref, technique, { weaponType: 'polearm', weaponProfileId: 'partisan' }).attackBonus, 1);
  assert.match(resolveCenyrTechniqueWeaponRules(cantref, technique, { weaponType: 'spear', weaponProfileId: 'trident' }).mechanicNotes[0], /Entwaffnung/);
  assert.equal(resolveCenyrTechniqueWeaponRules(cantref, technique, { weaponType: 'polearm', weaponProfileId: 'halberd' }).maximumTargets, 4);

  const mountedTechnique = { combatStyleId: 'drachentanz', cenyrTraining: { requiresMounted: true } };
  const uchelwyr = { templateSelections: { classId: 'uchelwyr' }, progression: { level: 10 }, combat: { mounted: false } };
  assert.equal(resolveCenyrTechniqueWeaponRules(uchelwyr, mountedTechnique, { weaponType: 'spear' }).compatible, false);
  assert.equal(resolveCenyrTechniqueWeaponRules({ ...uchelwyr, combat: { mounted: true } }, mountedTechnique, { weaponType: 'spear' }).compatible, true);

  const haken = getCenyrClassProgression('cantref', 20).attackCatalog.find(attack => attack.name === 'Haken des Jungdrachens');
  const sanitized = sanitizeCharacterCombatProfile({
    templateSelections: { classId: 'cantref' }, progression: { level: 6 }, techniques: [haken],
    weapons: [{ id: 'testlanze', name: 'Testlanze', weaponType: 'spear', weaponProfileId: 'lance', damageFormula: '1d12', damageType: 'Stich', equipped: true }]
  });
  assert.equal(sanitized.techniques[0].status, 'draft');
  assert.deepEqual(sanitized.techniques[0].cenyrTraining.allowedClassIds, ['cantref', 'uchelwyr']);
  assert.equal(sanitized.techniques[0].effects[0].inheritWeaponDamageType, true);
  const resolved = resolveCombatProfile({ id: 'cantref-test', name: 'Cantref', combatProfile: sanitized }, { actionId: `technique:${haken.id}` });
  assert.equal(resolved.selectedAction.formula, '1d12+1d8');
  assert.equal(resolved.selectedAction.targetDefenseModifier, -1);
});

test('Barddwyr-Rapiertechniken erhalten einen Kritbereich von 19 bis 20', () => {
  const technique = getCenyrClassProgression('barddwyr', 7).attackCatalog.find(attack => attack.name === 'Auftaktstich');
  const profile = sanitizeCharacterCombatProfile({ templateSelections: { classId: 'barddwyr' }, progression: { level: 7 },
    weapons: [{ id: 'rapier', name: 'Rapier', weaponType: 'sword', weaponProfileId: 'rapier', damageFormula: '1d8', equipped: true }], techniques: [technique] });
  const action = resolveCombatProfile({ id: 'barddwyr-test', name: 'Barddwyr', combatProfile: profile }, { actionId: `technique:${technique.id}` });
  assert.equal(action.selectedAction.criticalThreshold, 19);
});

test('archive links and character summaries preserve cultural identity without mutating profiles', () => {
  const plainMilwr = { id: 'milwr', label: 'Milwr' };
  assert.deepEqual(withCenyrClassTraining(plainMilwr), plainMilwr);
  assert.equal(getCenyrClassDefinition('milwr', 'vennyr'), null);
  assert.equal(getCultureClassPageHref('vennyr', 'milwr'), 'Vennyr/milwr/index.html');
  assert.equal(getCultureClassPageHref('cenyr', 'milwr'), 'Cenyr/milwr/index.html');
  assert.equal(getCharacterCreationTemplate('class', 'cenyr-milwr').hitDie, undefined);
  assert.equal(getCenyrCharacterClassSummary({ identity: { archetype: 'Milwr', ancestry: 'Vennyr' } }), null);
  for (const definition of definitions) {
    const [entry] = classifyCharacterArchiveEntries([{ kind: 'class', name: definition.name, data: { id: definition.classId } }]);
    assert.equal(entry.data.cultureClassProfiles[0].id, definition.id);
    const [link] = getCharacterArchiveClassLinks(entry);
    assert(link.href.endsWith(definition.pagePath));
    assert.equal(new URL(link.href, 'https://example.test/preview/AleriaAlmanach/AleriaAlmanach.html').pathname, `/preview/${definition.pagePath}`);
    const profile = { templateSelections: { classId: definition.templateId }, progression: { level: 5 }, techniques: [] };
    const before = structuredClone(profile);
    const summary = getCenyrCharacterClassSummary(profile);
    assert(summary.href.includes('stufe=5#ausbildungsplan'));
    assert.equal(new URL(summary.href, 'https://example.test/preview/AleriaAlmanach/AleriaAlmanach.html').pathname, `/preview/${definition.pagePath}`);
    assert.equal(summary.learnedTechniqueCount, 0);
    assert.equal(summary.pendingTechniqueSlotCount, summary.earnedTechniqueSlots);
    assert.deepEqual(profile, before);
  }
});
