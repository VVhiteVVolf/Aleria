import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { database, threadId, resetScene, startFight, history, commitAction } from './combat-test-context.mjs';
import { prepareTestAction } from './combat-test-actions.mjs';
import { getBuiltinCreatureTemplates } from '../../../../AleriaAlmanach/modules/creatures/creature-catalog.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { withEquippedCombatWeapon } from '../../../../AleriaAlmanach/modules/combat/combat-equipment-state.js';
import { applyManualCharacterLevel } from '../../../../AleriaAlmanach/modules/combat/combat-level-up-model.js';

const templates = new Map(getBuiltinCreatureTemplates().map(creature => [creature.id, creature]));

export async function createCombatParty(definitions, title = 'Gemischte Kampfgruppe') {
  const actors = await Promise.all(definitions.map(async (definition, index) => {
    const source = definition.creature ? templates.get(definition.creature)
      : JSON.parse(await readFile(new URL(`../../../../Charakter%20Archiv%20Exporte/${definition.slug}.json`, import.meta.url), 'utf8')).character;
    assert.ok(source, `Testfigur ${definition.key} existiert`);
    const actor = structuredClone(source);
    if (definition.creature) {
      actor.id = `party-test:${definition.creature}:${index}`;
      actor.sourceCreatureId = definition.creature;
      actor.entityType = 'creature';
    }
    if (definition.level) actor.combatProfile = applyManualCharacterLevel(actor.combatProfile, definition.level).profile;
    if (definition.hitPoints != null) actor.combatProfile.hitPoints.current = definition.hitPoints;
    return { ...actor, combatTeam: definition.team, testKey: definition.key };
  }));
  const byKey = new Map(actors.map(actor => [actor.testKey, actor]));
  const recordRef = actor => database.collection(actor.entityType === 'creature' ? 'creatures' : 'characters').doc(actor.sourceCreatureId || actor.id);
  await resetScene({ actors });
  const sourceSnapshots = new Map();
  for (const actor of actors.filter(actor => actor.sourceCreatureId)) sourceSnapshots.set(actor.sourceCreatureId, (await recordRef(actor).get()).data());
  const started = await startFight({ title, participants: actors.map(actor => ({ actorId: actor.id, name: actor.name, partyId: actor.combatTeam,
    partyName: actor.combatTeam, persistence: resolveCombatProfile(actor).persistence })) });
  async function record(key) {
    const actor = byKey.get(key);
    assert.ok(actor, `Testfigur ${key} gehört zur Gruppe`);
    return { ...(await recordRef(actor).get()).data(), id: actor.id, entityType: actor.entityType || 'character',
      sourceCreatureId: actor.sourceCreatureId || '', combatTeam: actor.combatTeam, testKey: key };
  }
  async function snapshot() {
    const comments = await history();
    const states = deriveCombatStateFromComments(comments);
    const profiles = new Map();
    for (const actor of actors) {
      const stored = await record(actor.testKey);
      const state = states.get(actor.id);
      profiles.set(actor.testKey, overlayCombatHitPointState(resolveCombatProfile(withEquippedCombatWeapon(stored, state?.equippedWeaponId, state?.offHandWeaponId)), state));
    }
    return { comments, states, profiles };
  }
  async function assertConsistent() {
    const result = await snapshot();
    for (const actor of actors) {
      const profile = result.profiles.get(actor.testKey);
      const stored = await record(actor.testKey);
      assert.ok(Number.isFinite(profile.currentHitPoints) && profile.currentHitPoints >= 0 && profile.currentHitPoints <= profile.maximumHitPoints, `${actor.name}: gültige TP`);
      assert.ok(profile.temporaryHitPoints >= 0, `${actor.name}: temporäre TP`);
      for (const resource of profile.resources) assert.ok(resource.current >= 0 && resource.current <= resource.maximum, `${actor.name}: ${resource.id} ${resource.current}/${resource.maximum}`);
      if (!actor.sourceCreatureId) {
        assert.equal(profile.currentHitPoints, stored.combatProfile.hitPoints.current, `${actor.name}: Speicher und Replay`);
        assert.equal(profile.temporaryHitPoints, Number(stored.combatProfile.hitPoints.temporary) || 0, `${actor.name}: temporäre TP in Speicher und Replay`);
      } else {
        const actual = (await recordRef(actor).get()).data();
        assert.deepEqual(actual, sourceSnapshots.get(actor.sourceCreatureId), `${actor.name}: Szenenkreaturen verändern ihre Vorlage nicht`);
      }
    }
    return result;
  }
  async function prepare({ actor, targets, ...options }) {
    return prepareTestAction({ entryId: threadId, actorRecord: await record(actor), targetRecords: await Promise.all(targets.map(record)), comments: await history(), ...options });
  }
  async function commit(prepared) {
    const result = await commitAction(prepared.payload);
    const actual = result.mechanics.commentSegments;
    for (const [index, segment] of actual.entries()) {
      const expected = prepared.payload.metadata.commentSegments[index];
      const expectedResolutions = expected.combatResolutions || [expected.combatResolution];
      for (const [targetIndex, resolution] of (segment.combatResolutions || [segment.combatResolution]).entries()) {
        assert.equal(resolution.damage?.total, expectedResolutions[targetIndex].damage?.total, `${resolution.actorName}: Vorschau und Server-Schaden`);
        assert.equal(resolution.targetSnapshot.hitPointsAfter, expectedResolutions[targetIndex].targetSnapshot.hitPointsAfter, `${resolution.actorName}: Vorschau und Server-TP`);
      }
    }
    await assertConsistent();
    return result;
  }
  return { actors, byKey, started, record, snapshot, assertConsistent, prepare, commit };
}
