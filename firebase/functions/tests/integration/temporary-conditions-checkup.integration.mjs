import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { actorRecords, database, threadId, request, resetScene, record, history, active, encounter, commitAction, undo } from './combat-test-context.mjs';
import { createCombatParty } from './combat-party-context.mjs';
import { normalizeItemDefinition, itemDefinitionKey } from '../../../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';
import { sanitizeCharacterCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { deriveCombatStateFromComments } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { commitSceneRestOperation } from '../../src/mechanics/commit-scene-rest.js';
import { commitNarrativeCommentOperation } from '../../src/comments/commit-narrative-comment.js';

// combat-test-context refuses every destination except the fixed disposable
// demo-aleria-combat-checkup project on 127.0.0.1:8180.
after(() => database.terminate());

function copiedActor(index, overrides = {}) {
  const actor = structuredClone(actorRecords[index]);
  actor.inventory = { items: [] };
  actor.combatProfile = sanitizeCharacterCombatProfile({
    templateSelections: { classId: 'custom' }, progression: { level: 1, development: { mode: 'purchase' } },
    hitPoints: { current: 60, maximumOverride: 100, temporary: 0 }, armorClass: { override: 10, overrideMode: 'total' },
    attributes: [{ key: 'strength', score: 20 }],
    weapons: [{ id: 'temporary-checkup-sword', name: 'Prüfklinge', weaponType: 'sword', weaponProfileId: 'sword',
      attackAttribute: 'strength', proficient: true, damageFormula: '1d6', equipped: true }],
    ...overrides
  });
  return actor;
}

async function partyWithCriticalPool(item = null) {
  const actor = copiedActor(0);
  if (item) actor.inventory.items.push(item);
  const party = await createCombatParty([
    { key: 'actor', actor, team: 'first' }, { key: 'target', actor: copiedActor(1), team: 'second' }
  ], 'Temporäre Zustände · lokale Transaktionsprüfung');
  const prepared = await party.prepare({ actor: 'actor', targets: ['target'], natural: 20 });
  const saved = await commitAction(prepared.payload, undefined, { criticalRoll: 19 });
  await party.assertConsistent();
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 2);
  const receipt = (await database.collection('comments').doc(saved.id).get()).data();
  return { party, saved, receipt };
}

test('ein echter Itemverbrauch ersetzt kritische TP atomar und Undo stellt den begrenzten Kritvorrat wieder her', async () => {
  const definition = normalizeItemDefinition({ id: 'item:temporary-checkup-protection', title: 'Lokaler Prüfschutz', category: 'potions',
    useDefinition: { mode: 'consume', effects: [{ type: 'temporary-hit-points', amount: 8 }] } });
  const item = { id: 'temporary-checkup-protection', name: 'Lokaler Prüfschutz', category: 'potions', quantity: '2',
    definitionRef: { id: definition.id, revision: definition.revision } };
  const originals = structuredClone(actorRecords);
  const { party, saved, receipt } = await partyWithCriticalPool(item);
  await database.collection('item_definition_versions').doc(itemDefinitionKey(definition)).set(definition);
  const actor = await party.record('actor');
  const used = await commitAction({ entryId: threadId, charName: actor.name, text: 'Den lokalen Prüfschutz konsumieren.', metadata: {
    characterId: actor.id, commentSegments: [{ kind: 'consume', commentKind: 'consume', characterId: actor.id, actorId: actor.id,
      text: 'Prüfschutz konsumieren.', inventorySource: 'inventory', inventoryItemId: item.id,
      inventoryUse: { actorId: actor.id, actorPersistence: { kind: 'character', recordId: actor.id }, item,
        source: 'inventory', operation: 'consume', mode: 'consume', requestedMode: 'consume', quantity: 1 } }]
  } });
  const usage = used.mechanics.commentSegments[0].inventoryUse;
  assert.equal(usage.hitPointSnapshot.after.temporary, 8);
  assert.ok(usage.conditionSnapshot.after.every(condition => condition.criticalTemporaryOwned !== true));
  await party.assertConsistent();
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 8);
  assert.equal((await party.record('actor')).inventory.items.find(entry => entry.id === item.id).quantity, '1');
  assert.deepEqual((await database.collection('comments').doc(saved.id).get()).data(), receipt, 'Der alte Kritbeleg bleibt unverändert.');
  await undo(used.id);
  await party.assertConsistent();
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 2);
  assert.equal((await party.record('actor')).inventory.items.find(entry => entry.id === item.id).quantity, '2');
  assert.ok((await party.snapshot()).states.get(actor.id).temporaryConditions.some(condition => condition.criticalTemporaryOwned));
  assert.deepEqual(actorRecords, originals);
});

test('Auraeintritt, Kritablauf, Ausscheiden und Kampfende erhalten identische persistierte TP ohne Baseline-Wiederbelebung', async () => {
  const { party, saved, receipt } = await partyWithCriticalPool();
  const source = copiedActor(1, { aura: { enabled: true, name: 'Prüfaura', latentPresence: { enabled: true, active: true,
    name: 'Prüfaura', target: 'Verbündete', radius: 'Kampfszene', allyMechanics: { combatStartTemporaryHitPoints: 8 } } } });
  source.id = 'temporary-checkup-aura-source'; source.name = 'Lokale Auraquelle';
  await database.collection('characters').doc(source.id).set({ id: source.id, name: source.name, combatProfile: source.combatProfile, inventory: source.inventory });
  let fight = await active();
  await encounter({ operation: 'add', encounterId: fight.encounterId, expectedRevision: fight.revision, participants: [{
    actorId: source.id, name: source.name, partyId: 'first', partyName: 'Prüfgruppe', persistence: { kind: 'character', recordId: source.id }
  }] });
  await party.assertConsistent();
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 8);
  await party.commit(await party.prepare({ actor: 'actor', targets: ['actor'], actionId: 'combat:wait' }));
  let state = (await party.snapshot()).states.get(party.byKey.get('actor').id);
  assert.equal(state.temporary, 8);
  assert.equal(state.encounterAuraTemporaryHitPoints.baseline, 0);
  fight = await active();
  const removed = await encounter({ operation: 'remove', encounterId: fight.encounterId, expectedRevision: fight.revision,
    participants: [{ actorId: source.id, status: 'left' }] });
  await party.assertConsistent();
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 0);
  await undo(removed.id);
  await party.assertConsistent();
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 8);
  fight = await active();
  const ended = await encounter({ operation: 'end', encounterId: fight.encounterId, expectedRevision: fight.revision,
    outcome: 'draw', endReason: 'agreement', participants: [] });
  await party.assertConsistent();
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 0);
  await undo(ended.id);
  await party.assertConsistent();
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 8);
  assert.deepEqual((await database.collection('comments').doc(saved.id).get()).data(), receipt);
});

test('kurze Rast beginnt nach bereits verstrichener Segmentzeit; Ablehnung und Undo erhalten Wunden und Vorräte', async () => {
  const actor = copiedActor(0, { hitPoints: { current: 7, maximumOverride: 20, temporary: 0 }, resources: [
    { id: 'short-pool', name: 'Rastvorrat', current: 0, maximum: 3, recovery: 'short-rest' },
    { id: 'day-pool', name: 'Tagesvorrat', current: 2, maximum: 8, recovery: 'day', recoveryDayKey: `scene:${threadId}:day-1` }
  ], abilities: [{ id: 'day-ability', name: 'Tagesfähigkeit', usesCurrent: 1, usesMaximum: 4,
    recovery: 'day', recoveryDayKey: `scene:${threadId}:day-1` }] });
  // Default daily resources still have no day key. Their initial recovery must
  // not refill another resource or ability already stamped for this same day.
  assert.ok(actor.combatProfile.resources.some(resource => resource.recovery === 'day' && !resource.recoveryDayKey));
  await resetScene({ actors: [actor, copiedActor(1)] });
  await database.collection('comments').doc('temporary-checkup-clock').set({ entryId: threadId, text: 'Lokaler Zeitanker',
    commentMode: 'scene-time', serverValidatedMechanics: true, serverCommitted: true, createdByRole: 'admin',
    sceneTimeEvent: { anchorDay: 1, anchorSeconds: 100 }, orderKey: 10 });
  await commitNarrativeCommentOperation(request({ entryId: threadId, charName: actor.name, text: 'Eine Stunde verstreicht.', metadata: {
    characterId: actor.id, commentSegments: [{ characterId: actor.id, kind: 'speech', text: 'Eine Stunde verstreicht.', durationSeconds: 3600 }]
  } }), { database, now: 1000 });
  const before = await record(actor.id), count = (await history()).length;
  const payload = endpoint => request({ entryId: threadId, text: 'Eine kurze lokale Prüfrast.', metadata: {
    sceneRest: { type: 'short', durationSeconds: 3600, participants: [{ actorId: actor.id, name: actor.name,
      persistence: { kind: 'character', recordId: actor.id } }] }, sceneTimeEvent: { anchorDay: 1, anchorSeconds: endpoint }
  } });
  await assert.rejects(commitSceneRestOperation(payload(3700), { database, nowClient: 2000 }), /kürzer/);
  assert.deepEqual((await record(actor.id)).combatProfile, before.combatProfile);
  assert.equal((await history()).length, count);
  const rested = await commitSceneRestOperation(payload(7300), { database, nowClient: 2000 });
  const stored = await record(actor.id);
  assert.equal(stored.combatProfile.hitPoints.current, 20);
  assert.equal(stored.combatProfile.resources.find(resource => resource.id === 'short-pool').current, 3);
  assert.equal(stored.combatProfile.resources.find(resource => resource.id === 'day-pool').current, 2);
  assert.equal(stored.combatProfile.abilities.find(ability => ability.id === 'day-ability').usesCurrent, 1);
  const scene = deriveCombatStateFromComments(await history()).get(actor.id);
  assert.equal(scene.current, 20);
  await undo(rested.id);
  assert.deepEqual((await record(actor.id)).combatProfile.hitPoints, before.combatProfile.hitPoints);
  assert.deepEqual((await record(actor.id)).combatProfile.resources, before.combatProfile.resources);
  assert.deepEqual((await record(actor.id)).combatProfile.abilities, before.combatProfile.abilities);
});

test('eine Rast mit fremder Figurenkennung wird vor jeder Profil- oder Kommentaränderung abgelehnt', async () => {
  const actors = [copiedActor(0, { hitPoints: { current: 7, maximumOverride: 20 } }),
    copiedActor(1, { hitPoints: { current: 3, maximumOverride: 40 } })];
  await resetScene({ actors });
  const before = await Promise.all(actors.map(actor => record(actor.id)));
  const commentsBefore = await history();
  await assert.rejects(commitSceneRestOperation(request({ entryId: threadId, text: 'Ungültige lokale Prüfrast.', metadata: {
    sceneRest: { type: 'short', durationSeconds: 3600, participants: [{ actorId: actors[1].id, name: actors[1].name,
      persistence: { kind: 'character', recordId: actors[0].id } }] },
    sceneTimeEvent: { anchorDay: 1, anchorSeconds: 3600 }
  } }), { database }), /Kennung|kennung|Profilquelle/);
  assert.deepEqual(await Promise.all(actors.map(actor => record(actor.id))), before);
  assert.deepEqual(await history(), commentsBefore);
});

test('nur bekannte Kreatureninstanzen dürfen rasten; Ablehnung, Heilung und Undo erhalten Vorlage und zweite Instanz', async () => {
  const sourceCreatureId = 'temporary-checkup-rest-template';
  const creature = { ...copiedActor(0, { hitPoints: { current: 7, maximumOverride: 20 } }),
    id: 'temporary-checkup-rest-instance-a', entityType: 'creature', sourceCreatureId };
  const second = { ...structuredClone(creature), id: 'temporary-checkup-rest-instance-b' };
  const party = await createCombatParty([
    { key: 'first', actor: creature, team: 'first' }, { key: 'second', actor: second, team: 'first' },
    { key: 'target', actor: copiedActor(1), team: 'second' }
  ], 'Lokale Instanz-Rastprüfung');
  const fight = await active();
  await encounter({ operation: 'end', encounterId: fight.encounterId, expectedRevision: fight.revision,
    outcome: 'draw', endReason: 'agreement', participants: [] });
  const sourceRef = database.collection('creatures').doc(sourceCreatureId);
  const sourceBefore = (await sourceRef.get()).data(), commentsBefore = await history();
  const payload = actorId => request({ entryId: threadId, text: 'Lokale Instanz-Prüfrast.', metadata: {
    sceneRest: { type: 'short', durationSeconds: 3600, participants: [{ actorId, name: creature.name,
      persistence: { kind: 'scene-creature', sourceCreatureId } }] },
    sceneTimeEvent: { anchorDay: 1, anchorSeconds: 3600 }
  } });
  await assert.rejects(commitSceneRestOperation(payload('temporary-checkup-rest-unknown'), { database }), /noch nicht bekannt/);
  assert.deepEqual((await sourceRef.get()).data(), sourceBefore);
  assert.deepEqual(await history(), commentsBefore);
  const rested = await commitSceneRestOperation(payload(creature.id), { database });
  assert.deepEqual(rested.profileUpdates, []);
  let state = (await party.assertConsistent()).states;
  assert.equal(state.get(creature.id).current, 20);
  assert.equal(state.get(second.id).current, 7);
  assert.deepEqual((await sourceRef.get()).data(), sourceBefore);
  await undo(rested.id);
  state = (await party.assertConsistent()).states;
  assert.equal(state.get(creature.id).current, 7);
  assert.equal(state.get(second.id).current, 7);
});
