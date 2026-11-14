import test from 'node:test';
import assert from 'node:assert/strict';
import { getHerausforderungValidationIssues, normalizeHerausforderungEvent, collectHerausforderungApproaches } from '../modules/herausforderung/herausforderung-model.js';
import { normalizeSceneElementActivation, validateSceneElementConfiguration } from '../modules/scene-elements/scene-element-model.js';
import { getSceneElementContributors, getSceneElementPassiveValue, evaluateSceneElementConditions } from '../modules/scene-elements/scene-element-conditions.js';
import { collectPublicSceneElements, renderSceneElementReaction } from '../modules/scene-elements/scene-element-view.js';
import { renderHerausforderungComment } from '../modules/herausforderung/herausforderung-ui.js';
import { createHerausforderungExport, parseHerausforderungImport } from '../modules/herausforderung/herausforderung-exchange.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { deriveCombatRuleFrequencyKeys } from '../modules/combat/combat-trigger-rules.js';
import { getSceneConditionClock } from '../modules/scene-time/scene-condition-clock.js';
import { getSkillRollContext, SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { person } from './fixtures/graded-challenge-fixtures.mjs';

const approach = () => ({ approachId: 'read', label: 'Runen deuten', preferredSkills: ['arcane-kunde', 'investigation', 'perception', 'sleight-of-hand'], difficulty: 17, insight: 'Das Tor öffnet sich nach Norden.' });
const puzzle = patch => normalizeHerausforderungEvent({ elementType: 'puzzle', title: 'Die Runenwand', publicDescription: 'Vier Zeichen leuchten auf.', approaches: [approach()], ...patch });
const profile = () => resolveCombatProfile({ ...person('reader'), combatProfile: { ...person('reader').combatProfile,
  attributes: [{ key: 'wisdom', score: 14 }, { key: 'dexterity', score: 12 }],
  skills: [{ id: 'perception', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained' }], combat: { passivePerceptionBonus: 3 } } });

test('old challenges stay active with independent approaches, without hidden activation', () => {
  const event = puzzle({ elementType: undefined });
  assert.equal(event.elementType, 'challenge'); assert.equal(event.completionMode, 'all'); assert.equal(event.activation.enabled, false);
  assert.equal(getHerausforderungValidationIssues(event).length, 0);
});

test('a self-interaction on a hidden element needs an accessible signal', () => {
  const activation = { enabled: true, showSignal: false, conditions: [{ type: 'interaction', sourceId: '' }] };
  assert.match(validateSceneElementConfiguration({ elementType: 'danger', activation })[0].message, /Interaktionssymbol/);
  assert.deepEqual(validateSceneElementConfiguration({ elementType: 'danger', activation: { ...activation, showSignal: true } }), []);
});

test('narrative elements have no attempt controls, training, reward teaser or forced reaction', () => {
  const event = normalizeHerausforderungEvent({ elementType: 'narration', title: 'Abendlicht', publicDescription: 'Die Schatten werden länger.', approaches: [] });
  assert.equal(getHerausforderungValidationIssues(event).length, 0);
  const html = renderHerausforderungComment({ id: 'story', herausforderung: event });
  assert.match(html, /Keine Reaktion erforderlich/); assert.doesNotMatch(html, /data-herausforderung-action="attempt"|Belohnung:|0\/0/);
  assert.deepEqual(collectHerausforderungApproaches([{ id: 'story', herausforderung: event }]), []);
});

test('narrative, puzzle and danger authoring survives JSON exchange without runtime receipts', () => {
  for (const elementType of ['narration', 'puzzle', 'danger', 'item']) {
    const event = puzzle({ elementType, approaches: elementType === 'narration' ? [] : [approach()] });
    const exported = createHerausforderungExport(event);
    const imported = parseHerausforderungImport(JSON.stringify(exported)).event;
    assert.equal(imported.elementType, elementType); assert.deepEqual(imported.approaches, event.approaches);
    assert.equal(imported.activation.enabled, elementType === 'danger');
  }
  const exported = createHerausforderungExport(puzzle({ elementType: 'danger', sceneElementId: 'old',
    reaction: { actorId: 'reader', detected: true }, activation: { enabled: false, conditions: [{ type: 'comments', minimum: 6 }] } }));
  assert.equal(exported.challenge.reaction, undefined); assert.equal(exported.challenge.sceneElementId, undefined);
  assert.equal(exported.challenge.activation.enabled, true);
});

test('invalid conditions, modes, target and passive skills are rejected before normalization', () => {
  for (const patch of [ { mode: 'xor' }, { conditions: [] }, { conditions: [{ type: 'comments', minimum: 0 }] },
    { conditions: [{ type: 'passive', skillId: 'invented', minimum: 20 }] }, { target: { mode: 'fixed', actorId: '' } },
    { showSignal: 'false' }, { detection: [] } ]) {
    const activation = { ...normalizeSceneElementActivation({}, 'danger'), ...patch };
    assert.ok(validateSceneElementConfiguration({ elementType: 'danger', activation }).length, JSON.stringify(patch));
  }
});

test('a post counts once even when multiple segments and actors appear; system and narrator posts do not count', () => {
  const comment = { serverCommitted: true, commentSegments: [{ actorId: 'reader', kind: 'speech' }, { actorId: 'reader', kind: 'thought' }, { actorId: 'other' }] };
  assert.equal(getSceneElementContributors(comment).length, 2);
  for (const patch of [{ narrator: true }, { sceneElementSignal: {} }, { herausforderung: {} }, { importedHistoricalMechanics: true }, { sceneTimeEvent: {} }]) assert.deepEqual(getSceneElementContributors({ ...comment, ...patch }), []);
  assert.deepEqual(getSceneElementContributors({ ...comment, serverCommitted: false }), []);
});

test('passive perception keeps training, explicit passive bonuses and active temporary modifiers exactly once', () => {
  const base = profile();
  assert.equal(getSceneElementPassiveValue(base, { skillId: 'perception' }), 17);
  const affected = overlayCombatHitPointState(base, { temporaryConditions: [{ id: 'watchful', name: 'Aufmerksam', active: true,
    mechanics: { skill: 2, passivePerception: 1 }, durationModel: { kind: 'scene-comments', remainingSceneComments: 2 } }] });
  assert.equal(getSceneElementPassiveValue(affected, { skillId: 'perception' }), 20);
});

test('AND/OR distinguishes a missing comment threshold from an already sufficient passive value', () => {
  const activation = normalizeSceneElementActivation({ enabled: true, mode: 'all', conditions: [
    { type: 'comments', minimum: 6 }, { type: 'passive', skillId: 'perception', minimum: 17 } ] });
  const context = { commentCount: 5, profiles: [{ actorId: 'reader', name: 'Reader', profile: profile() }] };
  assert.equal(evaluateSceneElementConditions(activation, context).satisfied, false);
  assert.equal(evaluateSceneElementConditions({ ...activation, mode: 'any' }, context).satisfied, true);
  assert.equal(evaluateSceneElementConditions(activation, { ...context, commentCount: 6 }).satisfied, true);
});

test('the same interaction can latch behind a comment condition; an unrelated source never matches', () => {
  const activation = normalizeSceneElementActivation({ enabled: true, mode: 'all', conditions: [
    { type: 'comments', minimum: 2 }, { type: 'interaction', sourceId: 'chest' } ] });
  assert.equal(evaluateSceneElementConditions(activation, { commentCount: 2, interactions: [{ sourceId: 'other', actorId: 'reader' }] }).satisfied, false);
  assert.equal(evaluateSceneElementConditions(activation, { commentCount: 2, interactions: [{ sourceId: 'chest', actorId: 'reader' }] }).satisfied, true);
});

for (const detected of [true, false]) test(`danger reaction combines ${detected ? 'advantage' : 'disadvantage'} with typed saves and traits`, () => {
  const actor = { ...person('reader'), combatProfile: { ...person('reader').combatProfile,
    quirks: ['feuer-phobie', 'mutig'].map(id => DEVELOPMENT_TRAITS.find(trait => trait.id === 'development-trait-' + id)) } };
  const resolved = resolveCombatProfile(actor);
  const context = getSkillRollContext({ actor, settings: { skillId: 'save:dexterity', saveContext: { damageType: 'kälte' } },
    challenge: { reaction: { actorId: 'reader', detected, rollMode: detected ? 'advantage' : 'disadvantage',
      saveContext: { damageType: 'feuer', saveTags: ['fear'] } } } }, { actorProfile: resolved });
  assert.equal(context.settings.saveContext.damageType, 'feuer');
  assert.equal(context.rollMode, detected ? 'normal' : 'disadvantage');
  assert.equal(context.skill.modifier, 2);
});

test('another actor cannot inherit the selected victim advantage, and forged free roll modes are ignored', () => {
  const actor = { ...person('reader') };
  const context = getSkillRollContext({ actor, settings: { skillId: 'perception', rollMode: 'advantage' },
    challenge: { reaction: { actorId: 'other', rollMode: 'advantage' } } }, { actorProfile: profile() });
  assert.equal(context.rollMode, 'normal');
});

test('puzzle completion closes alternative approaches without exposing their unselected solutions', () => {
  const event = puzzle({ approaches: [approach(), { ...approach(), approachId: 'other', insight: 'Ungewählte geheime Lösung.' }] });
  const comments = [{ id: 'runes', herausforderung: event }, { commentSegments: [{ skillResolution: { targetChallengeId: 'herausforderung:runes:read', outcome: 'success' } }] }];
  assert.equal(collectHerausforderungApproaches(comments).length, 0);
  assert.equal(collectHerausforderungApproaches([{ ...comments[0], herausforderung: { ...event, completionMode: 'all' } }, comments[1]]).length, 2);
  assert.doesNotMatch(renderHerausforderungComment(comments[0]), /Ungewählte geheime Lösung/);
});

test('hidden signals do not create a rail entry; visible mysteries carry no private description', () => {
  const hidden = { id: 'signal', serverValidatedMechanics: true, sceneElementSignal: { id: 'secret', visible: false, state: 'armed', elementType: 'danger' } };
  assert.deepEqual(collectPublicSceneElements([hidden]), []);
  assert.equal(collectPublicSceneElements([{ ...hidden, sceneElementSignal: { ...hidden.sceneElementSignal, visible: true } }])[0].title, 'Gefahr untersuchen');
  assert.doesNotMatch(renderSceneElementReaction({ actorName: '<script>', detected: false, description: '<img onerror=alert(1)>', detection: {} }), /<script>|<img onerror/);
});

test('detection and preparation do not advance condition clocks, but resource receipts replay', () => {
  const history = [{ id: 'time', serverValidatedMechanics: true, sceneTimeEvent: { anchorDay: 1, anchorSeconds: 0 } },
    { id: 'first', serverCommitted: true, characterId: 'reader', text: 'Start', commentMode: 'character' }];
  const detection = { id: 'reveal', serverValidatedMechanics: true, narrator: true, text: 'Gefahr',
    sceneElementDetection: { actorId: 'reader', ruleResourceSnapshots: [{ sourceActorId: 'reader', after: [{ id: 'luck', name: 'Glück', current: 0, maximum: 1, scope: 'persistent' }] }] } };
  assert.deepEqual(getSceneConditionClock([...history, detection]), getSceneConditionClock(history));
  assert.equal(deriveCombatStateFromComments([...history, detection]).get('reader').resources[0].current, 0);
});

test('ordinary skills and hidden detection both retain used trait frequency keys', () => {
  const resolution = { ruleApplications: [{ usedKey: 'reader:quirk:insight:scene:one', sourceActorId: 'reader' }] };
  assert.ok(deriveCombatRuleFrequencyKeys([{ commentSegments: [{ skillResolution: resolution }] }]).has('reader:quirk:insight:scene:one'));
  assert.ok(deriveCombatRuleFrequencyKeys([{ sceneElementDetection: resolution }]).has('reader:quirk:insight:scene:one'));
});

test('the selected reaction mode is actually used by the resolver, with current save modifiers', async () => {
  const actor = person('reader'), current = overlayCombatHitPointState(resolveCombatProfile(actor), { temporaryConditions: [{
    id: 'unsteady', name: 'Wankend', active: true, mechanics: { savingThrow: -2 }, durationModel: { kind: 'scene-comments', remainingSceneComments: 2 } }] });
  const result = await new SkillResolutionService({ async rollSkill({ modifier, rollMode }) {
    assert.equal(rollMode, 'advantage'); assert.equal(modifier, -2);
    return { natural: 17, dice: [8, 17], keptDice: [17], total: 17 + modifier };
  } }).resolve({ actor, settings: { skillId: 'save:dexterity', difficulty: 15 },
    challenge: { reaction: { actorId: actor.id, detected: true, rollMode: 'advantage', saveContext: {} } } }, { actorProfile: current });
  assert.equal(result.total, 15); assert.equal(result.outcome, 'success');
});
