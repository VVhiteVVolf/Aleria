import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

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
