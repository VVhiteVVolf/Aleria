import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { PERMANENT_AFFLICTIONS, ARCANE_FEVER_TRAITS, ADDICTION_TRAITS, TOLERANCE_TRAITS, HEALTH_TRAIT_DEFINITIONS } from '../modules/character-health/health-trait-catalog.js';
import { getHealthTaskError } from '../modules/character-health/health-trait-policy.js';
import { HEALTH_STATUS_PRESETS } from '../modules/character-health/health-status-presets.js';
import { getStatusIcon } from '../modules/combat-status/combat-status-catalog.js';
import { applySubstanceExposure, advanceSubstanceConditions, createSubstanceIntoxication } from '../modules/character-health/substance-state.js';
import { SUBSTANCE_ITEM_CATALOG } from '../modules/character-health/substance-item-catalog.js';
import { getItemSubstanceProfile } from '../modules/character-health/substance-item-effects.js';
import { getSceneConditionClock, sceneClockBeforeSegment } from '../modules/scene-time/scene-condition-clock.js';
import { previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getSavingThrowTotal, getMaximumHitPoints } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { expireConditionsForRest } from '../modules/combat/combat-condition-duration.js';
import { hasActionBlockingCondition } from '../modules/combat/combat-wait-action.js';
import { createManualCombatCondition, formatStatusDuration } from '../modules/combat-status/combat-status-model.js';
import { normalizeItemDefinition } from '../modules/item-definitions/item-definition-model.js';
import { applyInventoryUseAbilityEffects } from '../modules/inventory-use/inventory-use-model.js';
import { itemBuilderDraft, definitionFromBuilderDraft } from '../modules/item-builder/item-builder-model.js';
import { renderDevelopmentTraits } from '../modules/character-development/development-ui.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { sanitizeCharacterCombatProfile as serverSanitize } from '../../firebase/functions/src/generated/combat/combat-profile-model.js';

const trait = id => DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${id}`);
const profile = (ids = []) => sanitizeCharacterCombatProfile({ identity: { ancestry: 'Mensch' }, hitPoints: { current: 7, maximumOverride: 30 },
  progression: { level: 1, development: { mode: 'purchase' } }, quirks: ids.map(trait) });
const anchor = seconds => ({ entryId: 'scene', serverValidatedMechanics: true, sceneTimeEvent: { anchorDay: 1, anchorSeconds: seconds } });
function doses(kind, amount, count, source = profile(), start = 100) {
  let conditions = [];
  for (let index = 0; index < count; index++) conditions = applySubstanceExposure({ ...source, temporaryConditions: conditions }, { kind, amount }, { actorId: 'actor', sceneId: 'scene', seconds: start + index }).conditions;
  return conditions;
}

test('52 health traits and five runtime states have distinct original comic PNGs and web icons', async () => {
  assert.equal(PERMANENT_AFFLICTIONS.length, 30); assert.equal(ARCANE_FEVER_TRAITS.length, 10);
  assert.equal(ADDICTION_TRAITS.length, 9); assert.equal(TOLERANCE_TRAITS.length, 3);
  const icons = [];
  for (const entry of HEALTH_TRAIT_DEFINITIONS) {
    assert.ok(trait(entry.id.replace('development-trait-', '')), entry.name);
    icons.push(entry.icon);
  }
  assert.equal(HEALTH_STATUS_PRESETS.length, 5);
  for (const entry of HEALTH_STATUS_PRESETS) icons.push(getStatusIcon({ presetId: entry.id }));
  assert.equal(new Set(icons).size, 57);
  for (const icon of icons) {
    assert.match(icon, /^\/AleriaAlmanach\/assets\/development-traits\/web\/[a-z0-9-]+\.webp$/);
    await access(new URL(`../../${icon.slice(1)}`, import.meta.url));
    await access(new URL(`../../${icon.slice(1).replace('/web/', '/').replace('.webp', '.png')}`, import.meta.url));
  }
});
test('all lasting choices survive server normalization without healing, equipment or class grants', () => {
  const original = profile();
  for (const entry of HEALTH_TRAIT_DEFINITIONS) {
    const result = previewCharacterLevelUp(original, { targetLevel: 1, traitIds: [entry.id] });
    assert.equal(result.ready, true, entry.name);
    assert.deepEqual(serverSanitize(result.profile), sanitizeCharacterCombatProfile(result.profile), entry.name);
    for (const key of ['weapons', 'armorItems', 'resources', 'identity', 'templateSelections', 'techniques']) assert.deepEqual(result.profile[key], original[key], `${entry.name}/${key}`);
    assert.equal(result.profile.hitPoints.current, 7);
  }
});
test('fever is a single staged illness; principal stages worsen and druids never receive necrosis', () => {
  for (const variant of ['human', 'druid']) {
    let lastSkill = Infinity, lastSave = Infinity, lastHp = Infinity;
    for (let stage = 1; stage <= 4; stage++) {
      const current = profile([`arkanes-fieber-${variant}-${stage}`]);
      const skill = getSkillTotal(current, current.skills[0]), save = getSavingThrowTotal(current, 'constitution'), hp = getMaximumHitPoints(current);
      assert.ok(skill < lastSkill && save < lastSave && hp <= lastHp);
      lastSkill = skill; lastSave = save; lastHp = hp;
      assert.equal(hasActionBlockingCondition(current), stage === 4);
      if (variant === 'druid') assert.equal(current.quirks[0].mechanics.maximumHitPoints, 0);
    }
  }
  const chosen = previewCharacterLevelUp(profile(), { targetLevel: 1, traitIds: ['development-trait-arkanes-fieber-human-1', 'development-trait-arkanes-fieber-human-3'] });
  assert.equal(chosen.balance.traitCost, -6);
  assert.ok(chosen.balance.warnings.some(warning => warning.includes('Nur die stärkste')));
  assert.equal(getSavingThrowTotal(chosen.profile, 'constitution'), -3);
});
test('each health category is available in the shared assistant filters', () => {
  for (const [group, count] of [['affliction', 30], ['fever', 10], ['addiction', 9], ['tolerance', 3]]) {
    const preview = previewCharacterLevelUp(profile(), { targetLevel: 1, traitGroup: group });
    assert.equal((renderDevelopmentTraits(preview.plan).match(/data-development-trait=/g) || []).length, count);
  }
});
test('five normal 200 ml beers or three 40 ml whiskies reach intoxication', () => {
  assert.equal(doses('alcohol', 1, 4).at(-1).substance.phase, 'exposure');
  assert.equal(doses('alcohol', 1, 5).at(-1).name, 'Betrunken');
  assert.equal(doses('alcohol', 1.6, 2).at(-1).substance.phase, 'exposure');
  assert.equal(doses('alcohol', 1.6, 3).at(-1).name, 'Betrunken');
});
test('tolerance doubles only the matching threshold and does not halve aftereffects', () => {
  const tolerant = profile(['substanztoleranz-alcohol']);
  assert.equal(doses('alcohol', 1, 9, tolerant).at(-1).substance.phase, 'exposure');
  const full = doses('alcohol', 1, 10, tolerant).at(-1);
  assert.equal(full.substance.phase, 'intoxication'); assert.equal(full.substance.hangoverSeconds, 7200);
  assert.equal(doses('kriss', 1, 1, tolerant).at(-1).substance.phase, 'intoxication');
  assert.equal(doses('kriss', 1, 1, profile(['substanztoleranz-kriss'])).at(-1).substance.phase, 'exposure');
  assert.equal(doses('kriss', 1, 2, profile(['substanztoleranz-kriss'])).at(-1).substance.phase, 'intoxication');
});
test('liver weakness increases alcohol burden without creating a universal damage modifier', () => {
  assert.equal(doses('alcohol', 1, 4, profile(['leberschwaeche'])).at(-1).substance.phase, 'intoxication');
  assert.equal(doses('alcohol', 1, 4).at(-1).substance.phase, 'exposure');
});
test('published drink sizes and actual ABV govern whole-container exposure', () => {
  const orb = SUBSTANCE_ITEM_CATALOG.filter(entry => entry.name === 'Òrbharr');
  assert.ok(orb.length >= 3); assert.ok(orb.every(entry => entry.abv === 4.7 && entry.basis === 'source-abv'));
  const cask = orb.find(entry => entry.volumeMl === 50000), jug = orb.find(entry => entry.volumeMl === 500);
  assert.equal(cask.exposure.amount / jug.exposure.amount, 100);
  const whiskey = SUBSTANCE_ITEM_CATALOG.find(entry => entry.family === 'whisky' && entry.volumeMl === 40);
  assert.ok(whiskey.exposure.amount >= 1.6);
  assert.equal(getItemSubstanceProfile({ name: 'Kriss', id: 'invented' }), null);
  assert.ok(!SUBSTANCE_ITEM_CATALOG.some(entry => /Wasser|Kräuteraufguss|Hartkäse|Essiggurken/.test(entry.name)));
});
test('subthreshold drinks expire after one scene hour and never count across unrelated days', () => {
  const before = doses('alcohol', 1, 4);
  assert.deepEqual(advanceSubstanceConditions(before, 3700, 'scene'), []);
  const next = applySubstanceExposure({ ...profile(), temporaryConditions: before }, { kind: 'alcohol', amount: 1 }, { actorId: 'actor', sceneId: 'scene', seconds: 90000 });
  assert.equal(next.condition.substance.load, 1); assert.equal(next.condition.substance.phase, 'exposure');
});
test('intoxication becomes a 1–3 hour hangover and large time jumps process the entire chain', () => {
  for (const [amount, expectedHours] of [[4.8, 1], [8, 2], [20, 3]]) {
    const conditions = doses('alcohol', amount, 1);
    const drunk = conditions.at(-1), end = drunk.durationModel.expiresAtSeconds;
    assert.equal(end - drunk.durationModel.startedAtSeconds, expectedHours * 3600);
    const after = advanceSubstanceConditions(conditions, end, 'scene');
    assert.equal(after[0].name, 'Verkatert (Alkohol)');
    assert.equal(after[0].durationModel.expiresAtSeconds - end, expectedHours * 3600);
    assert.deepEqual(advanceSubstanceConditions(conditions, end + expectedHours * 3600, 'scene'), []);
    assert.deepEqual(advanceSubstanceConditions(after, end), after);
  }
});
test('repeat drinking extends the matching intoxication, and small doses do not remove a hangover', () => {
  const original = doses('alcohol', 4.8, 1), end = original[0].durationModel.expiresAtSeconds;
  const repeated = applySubstanceExposure({ ...profile(), temporaryConditions: original }, { kind: 'alcohol', amount: 2 }, { actorId: 'actor', sceneId: 'scene', seconds: 500 });
  assert.ok(repeated.condition.durationModel.expiresAtSeconds > end);
  const hung = advanceSubstanceConditions(original, end, 'scene');
  const small = applySubstanceExposure({ ...profile(), temporaryConditions: hung }, { kind: 'alcohol', amount: 1 }, { actorId: 'actor', sceneId: 'scene', seconds: end + 1 });
  assert.ok(small.conditions.some(condition => condition.substance.phase === 'hangover'));
});
test('only the corresponding intoxication suppresses withdrawal; it returns during hangover', () => {
  for (const kind of ['alcohol', 'kriss', 'smaragdflux']) {
    const source = profile([`abhaengigkeit-${kind}-3`]);
    const base = resolveCombatProfile({ id: 'actor', combatProfile: source });
    const own = createSubstanceIntoxication(kind, { actorId: 'actor', sceneId: 'scene', seconds: 100 });
    const active = overlayCombatHitPointState(base, { temporaryConditions: [own] });
    const skill = source.skills.find(skill => skill.name === 'Geschichte');
    assert.equal(getSkillTotal(source, skill), -3);
    assert.equal(getSkillTotal(active, skill), kind === 'alcohol' ? -2 : 0);
    const after = advanceSubstanceConditions([own], own.durationModel.expiresAtSeconds, 'scene');
    assert.equal(getSkillTotal(overlayCombatHitPointState(base, { temporaryConditions: after }), skill), -4);
    const other = createSubstanceIntoxication(kind === 'alcohol' ? 'kriss' : 'alcohol', { seconds: 100 });
    assert.ok(getSkillTotal(overlayCombatHitPointState(base, { temporaryConditions: [other] }), skill) <= -3);
  }
});
test('Kriss buffs perception and dexterity saves, Flux buffs magic without resource refills', () => {
  const source = profile(), base = resolveCombatProfile({ id: 'actor', combatProfile: source });
  const kriss = overlayCombatHitPointState(base, { temporaryConditions: doses('kriss', 1, 1) });
  const perception = source.skills.find(skill => skill.name === 'Wahrnehmung');
  assert.equal(getSkillTotal(kriss, perception) - getSkillTotal(source, perception), 2);
  assert.equal(kriss.passivePerception - base.passivePerception, 2);
  assert.equal(getSavingThrowTotal(kriss, 'dexterity') - getSavingThrowTotal(source, 'dexterity'), 1);
  const flux = overlayCombatHitPointState(base, { temporaryConditions: doses('smaragdflux', 1, 1) });
  assert.equal(flux.spellAttackModifier - base.spellAttackModifier, 2); assert.equal(flux.spellSaveDc - base.spellSaveDc, 1);
  assert.deepEqual(flux.resources, base.resources); assert.equal(flux.currentHitPoints, 7);
});
test('trusted scene time and segment durations drive transitions; wall clock and forged anchors do not', () => {
  const history = [anchor(100), { serverCommitted: true, text: 'Warten', commentMode: 'character', commentSegments: [{ text: 'Eine Stunde vergeht.', durationSeconds: 3600 }] }];
  assert.equal(getSceneConditionClock(history).seconds, 3700);
  assert.equal(getSceneConditionClock([...history, { sceneTimeEvent: { anchorDay: 2, anchorSeconds: 0 } }]).seconds, 3700);
  assert.equal(getSceneConditionClock([...history, anchor(50)]).seconds, 3700);
  assert.equal(sceneClockBeforeSegment(getSceneConditionClock([anchor(100)]), [{ text: 'Warten', durationSeconds: 90 }, { text: 'Trinken', durationSeconds: 5 }], 1), 190);
  assert.throws(() => doses('alcohol', 5, 1, sourceWithoutClock(), NaN), /Szenenzeit/);
  function sourceWithoutClock() { return profile(); }
});
test('replay advances from intoxication to hangover across explicit time jumps and rest snapshots', () => {
  const conditions = doses('alcohol', 4.8, 1), end = conditions[0].durationModel.expiresAtSeconds;
  const history = [anchor(100), { entryId: 'scene', serverValidatedMechanics: true, combatStatus: { actorId: 'actor', operation: 'add', after: { temporaryConditions: conditions } } }, anchor(end)];
  assert.equal(deriveCombatStateFromComments(history).get('actor').temporaryConditions[0].substance.phase, 'hangover');
  assert.deepEqual(deriveCombatStateFromComments([...history, anchor(end + 3600)]).get('actor').temporaryConditions, []);
  const rested = expireConditionsForRest(conditions, 'long');
  assert.deepEqual(rested.map(condition => [condition.id, condition.durationModel.expiresAtSeconds]), conditions.map(condition => [condition.id, condition.durationModel.expiresAtSeconds]));
});
test('item effects use trusted definition exposure, multiply quantity, and reject missing scene time', () => {
  const item = { id: 'owned', name: 'Umbenannt', definitionRef: { id: 'item:test-drink', revision: 'r1' } };
  const definition = normalizeItemDefinition({ id: item.definitionRef.id, revision: 'r1', title: 'Bier', category: 'getraenke', useDefinition: { mode: 'consume', substance: { kind: 'alcohol', volumeMl: 200, abv: 5 } } });
  const definitions = new Map([['item:test-drink@r1', definition]]), usage = { item, actorId: 'actor', mode: 'consume', quantity: 5 };
  assert.throws(() => applyInventoryUseAbilityEffects(profile(), usage, '', { definitions }), /Szenenzeit/);
  const applied = applyInventoryUseAbilityEffects(profile(), usage, '', { definitions, sceneClockSeconds: 100, sceneId: 'scene' });
  assert.equal(applied.conditions[0].name, 'Betrunken'); assert.equal(applied.inventoryUse.conditionSnapshot.after[0].substance.load, 5);
  assert.equal(applyInventoryUseAbilityEffects(profile(), { ...usage, operation: 'pickup' }, '', { definitions }).changed, false);
});
test('the item builder retains exposure when creating new drink variants', () => {
  const record = SUBSTANCE_ITEM_CATALOG.find(item => item.volumeMl === 50000);
  const draft = itemBuilderDraft({ id: record.offerIds[0], title: record.name, category: 'getraenke', definitionRef: { id: record.definitionId, revision: 'test' } }, { intent: 'variant' });
  assert.equal(draft.useDefinition.substance.volumeMl, 50000);
  assert.equal(definitionFromBuilderDraft(draft).useDefinition.substance.amount, record.exposure.amount);
});
test('manual intoxication and timed conditions use the scene clock and preserve fixed preset mechanics', () => {
  const drunk = createManualCombatCondition({ presetId: 'drunk', durationAmount: 60 }, { actorId: 'actor', sceneId: 'scene', sceneClockSeconds: 100 });
  assert.match(formatStatusDuration(drunk), /60 Szenenminuten/); assert.equal(drunk.mechanics.saveModifiers[0].bonus, 2);
  assert.throws(() => createManualCombatCondition({ presetId: 'drunk' }, {}), /Szenenzeit/);
  const hung = createManualCombatCondition({ presetId: 'hangover', durationAmount: 120 }, { actorId: 'actor', sceneId: 'scene', sceneClockSeconds: 100 });
  assert.equal(hung.name, 'Verkatert (Alkohol)'); assert.equal(hung.durationModel.expiresAtSeconds, 7300);
});
test('sensory limitations block explicitly impossible checks without penalizing alternative senses', async () => {
  const source = profile(['blind', 'taub']);
  assert.match(getHealthTaskError(source, { sense: 'vision' }), /Sicht/);
  assert.equal(getHealthTaskError(source, { sense: 'touch' }), '');
  const dice = { rollSkill: async () => ({ natural: 10, total: 10, notation: '1d20' }) }, service = new SkillResolutionService(dice);
  await assert.rejects(service.resolve({ actor: { id: 'a', name: 'Test', combatProfile: source }, settings: { skillId: 'perception', requiredSense: 'vision' } }), /Sicht/);
});

test('leg paralysis limits walking explicitly without numeric sentinels or blocking other actions', () => {
  const source = sanitizeCharacterCombatProfile({ ...profile(['gelaehmte-beine']), combat: { movement: 999 } });
  const resolved = resolveCombatProfile({ id: 'actor', name: 'Test', combatProfile: source });
  assert.equal(resolved.movement, 0);
  assert.equal(hasActionBlockingCondition(source), false);
  const boosted = overlayCombatHitPointState(resolved, { temporaryConditions: [{ id: 'speed', active: true, name: 'Bewegungsbonus', mechanics: { movement: 5 } }] });
  assert.equal(boosted.movement, 0);
  assert.equal(boosted.aiSnapshot.derivedCombatValues.movementMeters, 0);
  assert.equal(source.combat.movement, 999);
});
