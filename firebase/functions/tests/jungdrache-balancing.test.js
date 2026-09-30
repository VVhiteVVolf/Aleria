import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatResolutionService as BrowserService } from '../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { CombatResolutionService as ServerService } from '../src/generated/combat/combat-resolution-service.js';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';
import { fighter, receipts, prepare } from '../../../AleriaAlmanach/tests/fixtures/jungdrache-fixtures.mjs';
import { deriveCombatStateFromComments } from '../src/generated/combat/combat-state-model.js';
import { deriveSceneItems } from '../src/generated/scene-items/scene-items-model.js';
const semantic = value => JSON.parse(JSON.stringify(value), (key, entry) => key === 'id' && typeof entry === 'string'
  ? entry.replace(/-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/, '') : entry);

for (const stance of ['Lauernde Klaue','Entwaffnende Klaue','Fallende Schwinge','Erstickte Antwort','Brechender Widerhall']) {
  test(`${stance}: browser/server rolls, authoritative state, replay and tamper rejection`, async () => {
    const { profile: target } = await prepare('Gildas Gafyr', stance);
    const actor = fighter('Asgeir Wolfshorn');
    const client = await new BrowserService(receipts([2,19])).resolveAttack({ actor, target });
    const result = await new ServerService(new ProvidedDiceAdapter(client)).resolveAttack({ actor, target });
    assert.deepEqual(result.actorHitPointSnapshot, client.actorHitPointSnapshot);
    assert.deepEqual(result.targetSnapshot, client.targetSnapshot);
    assert.deepEqual(result.actorResourceSnapshot, client.actorResourceSnapshot);
    assert.deepEqual(semantic(result.actorConditionSnapshot), semantic(client.actorConditionSnapshot));
    assert.deepEqual(result.targetConditionSnapshot, client.targetConditionSnapshot);
    const history = [{ id: 'attack', characterId: actor.characterId, commentSegments: [{ combatResolution: result }] }];
    const replay = deriveCombatStateFromComments(history);
    assert.equal(replay.get(actor.characterId).current, result.actorHitPointSnapshot.after.current);
    if (stance === 'Entwaffnende Klaue') {
      assert.equal(deriveSceneItems(history).size, 1);
      assert.equal(replay.get(actor.characterId).droppedWeapons.length, 1);
    }
    const tampered = structuredClone(client);
    tampered.counterAttacks[0].resolution.attack.diceResults = [];
    await assert.rejects(new ServerService(new ProvidedDiceAdapter(tampered)).resolveAttack({ actor, target }));
  });
}
