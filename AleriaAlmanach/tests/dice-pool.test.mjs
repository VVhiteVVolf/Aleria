import assert from 'node:assert/strict';
import test from 'node:test';
import { applyDiceAppearance, getDiceAppearances } from '../modules/scene-dice/dice-appearance.js';
import { SceneDicePool } from '../modules/scene-dice/dice-pool.js';

test('builds a combined pool notation with modifier', () => {
  const pool = new SceneDicePool();
  pool.add(6);
  pool.add(6);
  pool.add(8);

  assert.equal(pool.toNotation({ modifier: 4 }), '2d6+1d8+1d20+4');
});

test('applies advantage only to the d20 group in a mixed pool', () => {
  const pool = new SceneDicePool([{ sides: 20, count: 1 }, { sides: 6, count: 2 }]);

  assert.equal(pool.toNotation({ mode: 'advantage', modifier: -2 }), '2d6+2d20kh1-2');
  assert.equal(pool.toNotation({ mode: 'disadvantage' }), '2d6+2d20kl1');
});

test('supports removing and clearing pool dice safely', () => {
  const pool = new SceneDicePool([{ sides: 12, count: 2 }]);
  pool.remove(12);
  assert.deepEqual(pool.list(), [{ sides: 12, count: 1 }]);
  pool.clear();
  assert.throws(() => pool.toNotation(), /mindestens einen Würfel/);
});

test('assigns a stable individual color to every supported die type', () => {
  const appearances = getDiceAppearances();
  assert.equal(appearances.length, 7);
  assert.equal(new Set(appearances.map(item => item.color)).size, appearances.length);

  const colored = applyDiceAppearance(appearances.map(item => ({ sides: item.sides, qty: 1 })));
  assert.deepEqual(colored.map(item => item.themeColor), appearances.map(item => item.color));
});
