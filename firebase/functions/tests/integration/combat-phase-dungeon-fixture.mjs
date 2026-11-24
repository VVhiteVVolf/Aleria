import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { database, request } from './combat-test-context.mjs';
import { prepareTestAction, CheckupDice } from './combat-test-actions.mjs';
import { commitCombatPhaseCounterOperation } from '../../src/combat-phase-counter/commit-combat-phase-counter.js';
import { commitHerausforderungOperation } from '../../src/mechanics/commit-herausforderung.js';
import { commitSceneElementOperation } from '../../src/scene-elements/commit-scene-element.js';
import { commitNarrativeCommentOperation } from '../../src/comments/commit-narrative-comment.js';
import { commitSkillCommentOperation } from '../../src/mechanics/commit-skill-comment.js';
import { commitCombatCommentOperation } from '../../src/mechanics/commit-combat-comment.js';
import { commitCombatEncounter } from '../../src/mechanics/commit-combat-encounter.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';
import { getBuiltinCreatureTemplates } from '../../../../AleriaAlmanach/modules/creatures/creature-catalog.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { getActiveCombatEncounter } from '../../../../AleriaAlmanach/modules/combat/combat-encounter-model.js';
import { CREATURE_TURN_END_ID } from '../../../../AleriaAlmanach/modules/combat/combat-creature-actions.js';
import { collectHerausforderungApproaches } from '../../../../AleriaAlmanach/modules/herausforderung/herausforderung-model.js';
import { SkillResolutionService } from '../../../../AleriaAlmanach/modules/skill-checks/skill-resolution-service.js';
import { getChecksForCommentKind } from '../../../../AleriaAlmanach/modules/skill-checks/skill-check-model.js';
import { previewChallengeCombatBenefits } from '../../../../AleriaAlmanach/modules/herausforderung/herausforderung-combat-preview.js';
import { compactMechanicalMetadata } from '../../../../AleriaAlmanach/modules/combat/combat-resolution-storage.js';

export const sceneNames = ['Der nasse Vorraum', 'Die überflutete Galerie', 'Das Gewölbe des Höhlentrolls'];
export const phaseSettings = (firstPhase, lastPhase, extra = {}) => ({ firstPhase, lastPhase, renewActions: false, phaseConditions: false, steps: [], ...extra });
export const approach = (id, label, extra = {}) => ({ approachId: id, label, preferredSkills: ['perception'], difficulty: 8,
  insight: 'Der Weg ist klar.', ...extra });

export async function createDungeonFixture() {
  const moduleId = 'gruft-lokal-' + randomUUID().slice(0, 8);
  const sceneKeys = ['vorraum', 'galerie', 'gewoelbe'];
  const threadIds = sceneKeys.map(key => `${moduleId}::session:${key}`);
  const heroes = await Promise.all([
    'Startbesitz 2026-11-02/oweta-draig', 'Gwynthor Sieben/lefraye-gafyr',
    'Gwynthor Sieben/rianna-wyrm', 'Gwynthor Sieben/caralyn-chwedlonol'
  ].map(async slug => {
    const archived = JSON.parse(await readFile(new URL(`../../../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8')).character;
    return { ...archived, id: `${moduleId}-${archived.id}`, combatTeam: 'Quartett' };
  }));
  const templates = new Map(getBuiltinCreatureTemplates().map(creature => [creature.id, creature]));
  const drowned = structuredClone(templates.get('catalog-versunkener-verkuemmert'));
  const troll = structuredClone(templates.get('catalog-landtroll-narbenbedeckt'));
  drowned.id = moduleId + '-drowned-source';
  troll.id = moduleId + '-cave-troll';
  troll.name = 'Höhlentroll';
  troll.level = 12;
  troll.combatProfile.progression.level = 12;
  troll.portrait = '/Bestiarium/assets/troll-profiles/hoehlentroll.webp';
  troll.combatTeam = 'Trolle';
  const enemies = Array.from({ length: 5 }, (_, index) => ({ ...drowned, id: `${moduleId}-versunkener-${index + 1}`,
    name: `Verkümmerter Versunkener ${index + 1}`, sourceCreatureId: drowned.id, combatTeam: 'Versunkene' }));
  const roster = [...heroes, ...enemies, troll];
  const holder = actor => database.collection(actor.entityType === 'creature' ? 'creatures' : 'characters').doc(actor.sourceCreatureId || actor.id);
  const batch = database.batch();
  for (const actor of [...heroes, drowned, troll]) batch.set(holder(actor), { id: actor.id, name: actor.name, title: actor.title || '',
    entityType: actor.entityType || 'character', portrait: actor.portrait || '', inventory: actor.inventory || {},
    combatProfile: actor.combatProfile, combatTeam: actor.combatTeam || '' });
  await batch.commit();
  const auth = number => `local-dungeon-coauthor-${number}`;
  const history = async entryId => sortSceneHistory((await database.collection('comments').where('entryId', '==', entryId).get()).docs
    .map(doc => ({ ...doc.data(), id: doc.id })));
  const record = async actor => ({ ...(await holder(actor).get()).data(), id: actor.id, name: actor.name,
    ...(actor.sourceCreatureId ? { sourceCreatureId: actor.sourceCreatureId } : {}), combatTeam: actor.combatTeam });
  const phase = (data, author = 1, options = {}) => commitCombatPhaseCounterOperation(request(data, auth(author)), { database, ...options });
  const readPhase = entryId => phase({ entryId, operation: 'read' });
  const step = async (entryId, operation, settings, author = 1, options = {}) => phase({ entryId, operation,
    operationId: randomUUID(), expectedRevision: (await readPhase(entryId)).revision, ...(settings ? { settings } : {}) }, author, options);
  const authorChallenge = (data, author) => commitHerausforderungOperation({
    ...request(data, auth(author)), auth: { uid: auth(author), token: { aleriaRole: 'editor' } }
  }, { database });
  const prepare = (entryId, targetPhase, event, author = 1) => authorChallenge({
    entryId, text: event.title, metadata: { operationId: randomUUID(), herausforderung: { publicDescription: event.title, completionMode: 'all',
      ...event, activation: { enabled: true, phase: targetPhase, ...event.activation } } }
  }, author);
  const post = (entryId, actor, text) => commitNarrativeCommentOperation(request({ entryId, text, charName: actor.name,
    metadata: { characterId: actor.id, commentSegments: [{ characterId: actor.id, kind: 'action', text }] } }, auth(actor.id)), { database });
  const transition = (source, target, text, metadata) => commitNarrativeCommentOperation(request({ entryIds: [source, target], text, narrator: true, metadata }, auth(1)), { database });
  const announce = (entryId, actors, title) => commitCombatEncounter.run(request({ entryId, text: title, metadata: { combatEncounter: {
    operation: 'start', encounterId: randomUUID(), title, awardExperience: false, participants: actors.map(actor => ({ actorId: actor.id, name: actor.name,
      partyId: actor.combatTeam, partyName: actor.combatTeam, persistence: resolveCombatProfile(actor).persistence }))
  } } }, auth(1)));
  const endFight = async entryId => {
    const active = getActiveCombatEncounter(await history(entryId));
    return commitCombatEncounter.run(request({ entryId, text: 'Kampf beendet.', metadata: { combatEncounter: {
      operation: 'end', encounterId: active.encounterId, expectedRevision: active.revision, outcome: 'victory', winningPartyId: 'Quartett', awardExperience: false
    } } }, auth(2)));
  };
  async function attack(entryId, actor, target, options = {}) {
    const comments = await history(entryId), actorRecord = await record(actor);
    const first = await prepareTestAction({ entryId, actorRecord, targetRecords: [await record(target)], comments, natural: 19, ...options });
    const prepared = actor === troll && !options.skipTurnEnd ? await prepareTestAction({ entryId, actorRecord, targetRecords: [actorRecord], comments,
      actionId: CREATURE_TURN_END_ID, priorSegments: [first.segment] }) : first;
    return commitCombatCommentOperation(request({ ...prepared.payload, metadata: compactMechanicalMetadata(prepared.payload.metadata) }, auth(actor.id)),
      { database, rollCritical: () => 1 });
  }
  async function attempt(entryId, commentId, approachId, actor, skillId = 'perception', natural = 19) {
    const comments = await history(entryId);
    const challenge = collectHerausforderungApproaches(comments).find(item => item.commentId === commentId && item.approachId === approachId);
    const states = deriveCombatStateFromComments(comments);
    const savedActor = await record(actor);
    const profile = overlayCombatHitPointState(resolveCombatProfile(savedActor), states.get(actor.id));
    const dice = new CheckupDice(natural);
    const text = `${actor.name} reagiert auf ${challenge.title}.`;
    let resolution = await new SkillResolutionService({ rollSkill: ({ modifier, rollMode }) => dice.rollD20(modifier, rollMode, natural) })
      .resolve({ actor: savedActor, actorPersistence: profile.persistence, settings: { skillId }, challenge }, { actorProfile: profile, opposedDifficulty: null });
    resolution = await previewChallengeCombatBenefits({ challenge, resolution, actors: await Promise.all(roster.map(record)), comments, dice,
      profileResolver: { resolve: source => overlayCombatHitPointState(resolveCombatProfile(source), states.get(source.id)) } });
    const kind = ['thought', 'interact', 'speech'].find(value => getChecksForCommentKind(value).some(check => check.id === skillId));
    const segment = { kind, commentKind: kind, characterId: actor.id, actorId: actor.id, text, mechanicMode: 'skill',
      skillId, skillTargetChallengeId: challenge.id, skillResolution: resolution };
    return commitSkillCommentOperation(request({ entryId, text, charName: actor.name, metadata: { characterId: actor.id, commentSegments: [segment] } },
      auth(actor.id)), { database });
  }
  return { moduleId, sceneKeys, threadIds, roster, heroes, enemies, troll, drowned, history, record, phase, readPhase, step, prepare, post,
    transition, announce, endFight, attack, attempt,
    sceneElement: data => commitSceneElementOperation(request(data, auth(1)), { database }),
    submitChallenge: (entryId, text, metadata) => authorChallenge({ entryId, text, metadata }, 1)
  };
}
