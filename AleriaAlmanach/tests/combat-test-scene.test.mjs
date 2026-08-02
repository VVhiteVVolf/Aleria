import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {
  deriveCombatStateFromComments,
  overlayCombatHitPointState
} from '../modules/combat/combat-state-model.js';

const source = readFileSync(new URL('../modules/combat/combat-test-scene.js', import.meta.url), 'utf8');

function loadFixture() {
  const window = {};
  const context = vm.createContext({ window, structuredClone });
  vm.runInContext(source, context);
  return window.AleriaCombatTestScene;
}

test('Brandhof-Testszene simuliert sechs eindeutige Instanzen bis zur Entscheidung', () => {
  const fixture = loadFixture();
  const comments = fixture.getComments(fixture.threadId);
  const segments = comments.flatMap(comment => comment.commentSegments || []);
  const combatSegments = segments.filter(segment => segment.commentKind === 'combataction');
  const sceneActors = new Set(segments.map(segment => segment.sceneActorId).filter(Boolean));
  assert.equal(comments.length, 11);
  assert.equal(sceneActors.size, 6);
  assert.equal(combatSegments.length, 16);
  assert.ok(combatSegments.every(segment => segment.combatActionId.startsWith('weapon:')));
  assert.ok(combatSegments.some(segment => segment.combatResolution.attack.criticalSuccess));
  assert.ok(combatSegments.some(segment => segment.combatResolution.attack.criticalFailure));
  assert.ok(combatSegments.some(segment => segment.combatResolution.attack.rollMode === 'advantage'));
  assert.ok(combatSegments.some(segment => segment.combatResolution.attack.rollMode === 'disadvantage'));
  assert.equal(combatSegments.at(-1).combatResolution.targetSnapshot.defeated, true);
  assert.match(segments.at(-1).text, /Rauch riechen/);
});

test('Brandhof-Referenz bleibt read-only und verbraucht keine KI-Tokens', () => {
  const fixture = loadFixture();
  const comments = fixture.getComments(fixture.threadId);
  assert.ok(comments.every(comment => comment._hideActions));
  const narrations = comments
    .flatMap(comment => comment.commentSegments || [])
    .map(segment => segment.combatResolution?.narration)
    .filter(Boolean);
  assert.ok(narrations.length > 0);
  assert.ok(narrations.every(narration => narration.source === 'deterministic-fallback'));
});

test('Brandhof-Treffer werden pro Kreatureninstanz bis zum Endstand fortgeschrieben', () => {
  const fixture = loadFixture();
  const comments = fixture.getComments(fixture.threadId);
  const states = deriveCombatStateFromComments(comments);
  assert.equal(states.size, 6);
  assert.equal(states.get(fixture.actors.draigKnight.id).current, 38);
  Object.values(fixture.actors)
    .filter(actor => actor.id !== fixture.actors.draigKnight.id)
    .forEach(actor => assert.equal(states.get(actor.id).current, 0));
});

test('jeder Brandhof-Abschnitt zeigt den Kampfstand seines eigenen Zeitpunkts', () => {
  const fixture = loadFixture();
  const comments = fixture.getComments(fixture.threadId);
  const raubritter = fixture.actors.eelKnight;
  const firstAppearance = comments.flatMap(comment => (
    (comment.commentSegments || []).map((segment, index) => ({ comment, segment, index }))
  )).find(entry => entry.segment.sceneActorId === raubritter.id);
  const earlyStates = deriveCombatStateFromComments(comments, {
    commentId: firstAppearance.comment.id,
    segmentIndex: firstAppearance.index
  });
  const earlyProfile = overlayCombatHitPointState(
    { currentHitPoints: 67, maximumHitPoints: 67, temporaryHitPoints: 0, resources: [] },
    earlyStates.get(raubritter.id)
  );
  const finalProfile = overlayCombatHitPointState(
    { currentHitPoints: 67, maximumHitPoints: 67, temporaryHitPoints: 0, resources: [] },
    deriveCombatStateFromComments(comments).get(raubritter.id)
  );
  assert.equal(earlyProfile.currentHitPoints, 67);
  assert.equal(finalProfile.currentHitPoints, 0);
});
