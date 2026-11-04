import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { actorRecords, database, encounter, history, undo } from './combat-test-context.mjs';
import { createCombatParty } from './combat-party-context.mjs';
import { CheckupDice } from './combat-test-actions.mjs';
import { DEVELOPMENT_TRAITS } from '../../../../AleriaAlmanach/modules/character-development/development-traits.js';
import { sanitizeCharacterCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';

// The imported context refuses every destination except the disposable demo
// Firestore emulator on 127.0.0.1:8180. Only detached local fixture copies enter it.
after(() => database.terminate());

function copiedActor(index, traitIds = [], { strength = 20 } = {}) {
  const actor = structuredClone(actorRecords[index]);
  actor.inventory = { items: [] };
  actor.combatProfile = sanitizeCharacterCombatProfile({
    templateSelections: { classId: 'custom' }, progression: { level: 1, development: { mode: 'purchase' } },
    attributes: [{ key: 'strength', score: strength }],
    hitPoints: { current: 60, maximumOverride: 100, temporary: 0 },
    armorClass: { override: 10, overrideMode: 'total' },
    weapons: [{ id: 'trait-checkup-sword', name: 'Prüfklinge', weaponType: 'sword', weaponProfileId: 'sword',
      attackAttribute: 'strength', proficient: true, damageFormula: '1d6', equipped: true }],
    quirks: traitIds.map(id => {
      const trait = DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${id}`);
      assert.ok(trait, `Katalogtrait ${id} vorhanden`);
      return structuredClone(trait);
    })
  });
  return actor;
}

async function partyFor(traitIds, options) {
  return createCombatParty([
    { key: 'actor', actor: copiedActor(0, traitIds, options), team: 'Prüfgruppe' },
    { key: 'target', actor: copiedActor(1), team: 'Gegenseite' }
  ], 'Lokaler Trait-Kampfcheck');
}

class QueueDice extends CheckupDice {
  constructor(values) { super(15); this.values = values.slice(); this.attackRequests = []; }
  async rollAttack({ modifier = 0, rollMode = 'normal' }) {
    assert.ok(this.values.length, 'Für jeden ursprünglichen und jeden Ersatzwurf liegt genau ein Testwert vor.');
    this.attackRequests.push({ modifier, rollMode });
    return this.rollD20(modifier, rollMode, this.values.shift());
  }
}

test('Immer kampfbereit gewährt eigene drei temporäre TP beim echten Kampfstart und erhält sie in Speicher und Replay', async () => {
  const originals = structuredClone(actorRecords);
  const party = await partyFor(['kampfbereit']);
  const stored = await party.record('actor');
  const snapshot = await party.assertConsistent();
  const actorId = party.byKey.get('actor').id;
  assert.equal(stored.combatProfile.hitPoints.current, 60);
  assert.equal(stored.combatProfile.hitPoints.temporary, 3);
  assert.equal(snapshot.states.get(actorId).temporary, 3);
  assert.equal(snapshot.profiles.get('actor').temporaryHitPoints, 3);
  assert.equal(snapshot.profiles.get('target').temporaryHitPoints, 0);
  assert.equal((await party.snapshot()).profiles.get('actor').temporaryHitPoints, 3, 'Bloßes erneutes Lesen stapelt keine Start-TP.');
  assert.deepEqual(stored.combatProfile.resources, party.actors[0].combatProfile.resources, 'Kampfstart-TP verändern keine Ressourcen.');
  const comment = (await history()).find(comment => comment.id === party.started.id);
  assert.equal(comment.mechanicalUndo[`character:${actorId}`].before.hitPoints.temporary, 0);
  assert.equal(stored.combatProfile.lastMechanicalCommentId, party.started.id);
  await undo(party.started.id);
  const restored = await party.record('actor');
  assert.equal(restored.combatProfile.hitPoints.temporary, 0);
  assert.equal(restored.combatProfile.hitPoints.current, 60);
  assert.deepEqual(restored.combatProfile.resources, party.actors[0].combatProfile.resources);
  assert.deepEqual(actorRecords, originals, 'Lokale Originalquellen bleiben unverändert.');
});

test('verbrauchte Kampfstart-TP werden durch Entfernen und erneuten Beitritt weder im Speicher noch im Replay aufgefüllt', async () => {
  const party = await partyFor(['kampfbereit']);
  await party.commit(await party.prepare({ actor: 'target', targets: ['actor'], dice: new CheckupDice(15) }));
  const before = await party.record('actor');
  assert.equal(before.combatProfile.hitPoints.temporary, 0);
  const participant = party.started.combatEncounter.participants.find(participant => participant.actorId === party.byKey.get('actor').id);
  for (const [operation, status] of [['remove', 'left'], ['add', 'active']]) {
    await encounter({ encounterId: party.started.combatEncounter.encounterId, operation, participants: [{ ...participant, status }] });
  }
  const after = await party.record('actor');
  assert.deepEqual(after.combatProfile.hitPoints, before.combatProfile.hitPoints);
  assert.deepEqual(after.combatProfile.resources, before.combatProfile.resources);
  await party.assertConsistent();
});

test('Teilbögen ohne TP-Struktur oder ohne aktuellen TP-Wert erhalten nur Start-Temp-TP und bleiben nach Undo bei ihrem impliziten Ausgangsstand', async () => {
  for (const hitPoints of [undefined, { maximumOverride: 100, temporary: 0 }]) {
    const actor = copiedActor(0, ['kampfbereit']);
    if (hitPoints === undefined) delete actor.combatProfile.hitPoints;
    else actor.combatProfile.hitPoints = structuredClone(hitPoints);
    const originalCurrent = resolveCombatProfile(actor).currentHitPoints;
    const originalNormalizedHitPoints = sanitizeCharacterCombatProfile(actor.combatProfile).hitPoints;
    const party = await createCombatParty([
      { key: 'actor', actor, team: 'Prüfgruppe' },
      { key: 'target', actor: copiedActor(1), team: 'Gegenseite' }
    ], 'Lokaler Teilbogen-Starttest');
    const stored = await party.record('actor');
    assert.equal(stored.combatProfile.hitPoints.current, null, 'Implizite aktuelle TP werden nicht als volle TP festgeschrieben.');
    assert.equal(stored.combatProfile.hitPoints.temporary, 3);
    const snapshot = await party.snapshot();
    assert.equal(snapshot.profiles.get('actor').currentHitPoints, originalCurrent);
    assert.equal(snapshot.profiles.get('actor').temporaryHitPoints, 3);
    assert.deepEqual(stored.combatProfile.resources, actor.combatProfile.resources);
    const comment = (await history()).find(comment => comment.id === party.started.id);
    assert.deepEqual(comment.mechanicalUndo[`character:${actor.id}`].before.hitPoints, hitPoints ?? null);
    await undo(party.started.id);
    const restored = await party.record('actor');
    assert.deepEqual(restored.combatProfile.hitPoints, hitPoints ?? null);
    assert.deepEqual(sanitizeCharacterCombatProfile(restored.combatProfile).hitPoints, originalNormalizedHitPoints);
    assert.equal(resolveCombatProfile(restored).currentHitPoints, originalCurrent);
    assert.deepEqual(restored.combatProfile.resources, actor.combatProfile.resources);
  }
});

test('Szenenkreaturen erhalten Start-TP nur in ihrer Instanz und verändern keine persistente Vorlage', async () => {
  const creature = { ...copiedActor(0, ['kampfbereit']), id: 'trait-start-instance', entityType: 'creature', sourceCreatureId: 'trait-start-template' };
  const party = await createCombatParty([
    { key: 'actor', actor: creature, team: 'Prüfgruppe' },
    { key: 'target', actor: copiedActor(1), team: 'Gegenseite' }
  ], 'Lokaler Instanz-Starttest');
  const result = await party.assertConsistent();
  assert.equal(result.profiles.get('actor').temporaryHitPoints, 3);
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 0);
});

test('eigene Start-TP und eine stärkere fremde Aura persistieren gemeinsam ihr Maximum statt nur den Eigenanteil', async () => {
  const aura = copiedActor(1);
  aura.id = 'trait-start-aura-source';
  aura.combatProfile.aura = { enabled: true, name: 'Prüfaura', latentPresence: {
    enabled: true, active: true, target: 'Verbündete', radius: 'Kampfszene', allyMechanics: { combatStartTemporaryHitPoints: 12 }
  } };
  const party = await createCombatParty([
    { key: 'actor', actor: copiedActor(0, ['kampfbereit']), team: 'Prüfgruppe' },
    { key: 'aura', actor: aura, team: 'Prüfgruppe' },
    { key: 'target', actor: copiedActor(1), team: 'Gegenseite' }
  ], 'Lokaler Aura-Starttest');
  const result = await party.assertConsistent();
  assert.equal(result.profiles.get('actor').temporaryHitPoints, 12);
  assert.equal((await party.record('actor')).combatProfile.hitPoints.temporary, 12);
  assert.equal((await party.record('actor')).combatProfile.hitPoints.current, 60);
});

test('Glückspilz würfelt ursprüngliche eins einmal neu; echter Commit validiert Ersatzbeleg und persistiert identische Ziel-TP', async () => {
  const party = await partyFor(['glueckspilz']);
  const dice = new QueueDice([1, 11]);
  const prepared = await party.prepare({ actor: 'actor', targets: ['target'], dice });
  const preview = prepared.segment.combatResolution;
  assert.equal(dice.values.length, 0);
  assert.equal(dice.attackRequests.length, 2);
  assert.equal(dice.attackRequests[1].modifier, 0, 'Ersatzwurf addiert den Angriffsbonus nicht erneut.');
  assert.equal(preview.attack.naturalRoll, 11);
  assert.equal(preview.attack.hit, true);
  assert.equal(preview.attack.naturalRollPolicy.naturalOneReroll, true);
  assert.deepEqual(preview.attack.rerolls.map(({ dieIndex, original, replacement }) => ({ dieIndex, original, replacement })),
    [{ dieIndex: 0, original: 1, replacement: 11 }]);
  const committed = await party.commit(prepared);
  const actual = committed.mechanics.commentSegments[0].combatResolution;
  assert.equal(actual.attack.naturalRoll, 11);
  assert.deepEqual(actual.attack.diceResults, [11]);
  assert.deepEqual(actual.attack.rerolls, preview.attack.rerolls);
  assert.deepEqual(actual.attack.naturalRollPolicy, preview.attack.naturalRollPolicy);
  assert.equal(actual.attack.total, preview.attack.total);
  assert.equal(actual.targetSnapshot.hitPointsAfter, preview.targetSnapshot.hitPointsAfter);
  assert.equal((await party.record('target')).combatProfile.hitPoints.current, actual.targetSnapshot.hitPointsAfter);
  const snapshot = await party.assertConsistent();
  assert.equal(snapshot.states.get(party.byKey.get('target').id).current, actual.targetSnapshot.hitPointsAfter);
});

test('Pechvogel verfehlt bei natürlicher drei trotz ausreichend hoher Summe auch in der echten Servertransaktion', async () => {
  const party = await partyFor(['pechvogel'], { strength: 30 });
  const before = (await party.record('target')).combatProfile.hitPoints.current;
  const prepared = await party.prepare({ actor: 'actor', targets: ['target'], dice: new QueueDice([3]) });
  const preview = prepared.segment.combatResolution;
  assert.ok(preview.attack.total >= preview.attack.targetDefense, 'Ohne natürliche Fehlschlagregel würde die Summe treffen.');
  assert.equal(preview.attack.naturalRoll, 3);
  assert.equal(preview.attack.hit, false);
  assert.equal(preview.attack.criticalFailure, true);
  assert.equal(preview.attack.naturalRollPolicy.criticalFailureMaximum, 3);
  const committed = await party.commit(prepared);
  const actual = committed.mechanics.commentSegments[0].combatResolution;
  assert.equal(actual.attack.hit, false);
  assert.equal(actual.attack.criticalFailure, true);
  assert.equal(actual.attack.naturalRoll, 3);
  assert.equal(actual.targetSnapshot.hitPointsAfter, before);
  assert.equal((await party.record('target')).combatProfile.hitPoints.current, before);
  await party.assertConsistent();
});
