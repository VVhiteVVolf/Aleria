import assert from 'node:assert/strict';
import test from 'node:test';
import { runBrandhofCombatSimulation } from '../modules/combat/brandhof-combat-runner.js';
import { parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';

test('Brandhof läuft mit echten Katalogprofilen und produktiven Regeln bis zur Entscheidung', async () => {
  const result = await runBrandhofCombatSimulation();
  const resolutions = result.comments.flatMap(comment => comment.commentSegments)
    .map(segment => segment.combatResolution)
    .filter(Boolean);
  assert.equal(result.actors.length, 6);
  assert.equal(result.finished, true);
  assert.ok(result.turns < 180);
  assert.ok(resolutions.length > 6);
  assert.ok(result.comments.some(comment => comment.commentSegments.some(segment => segment.kind === 'speech')));
  resolutions.forEach(resolution => {
    const parsed = parseDamageFormula(resolution.weapon.damageFormula);
    if (resolution.damage) {
      const expectedDice = parsed.diceCount * (resolution.attack.criticalSuccess ? 2 : 1);
      assert.equal(resolution.damage.diceResults.length, expectedDice);
      assert.ok(resolution.damage.diceResults.every(value => value >= 1 && value <= parsed.sides));
    }
    assert.ok(resolution.targetSnapshot.hitPointsAfter <= resolution.targetSnapshot.hitPointsBefore);
    assert.equal(resolution.serverValidated, true);
  });
  const losingTeam = result.winningTeam === 'Draig' ? 'Schwarzer Zitteraal' : 'Draig';
  result.actors.filter(actor => actor.combatTeam === losingTeam)
    .forEach(actor => assert.equal(result.states.get(actor.id)?.current, 0));
});
