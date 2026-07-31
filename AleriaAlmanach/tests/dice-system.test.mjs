import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const bundled = await build({
  stdin: {
    contents: `
      export * from './modules/scene-dice/dice-validation.js';
      export * from './modules/scene-dice/dice-history.js';
      export * from './modules/scene-dice/dice-fallback-engine.js';
      export * from './modules/scene-dice/dice-parser-adapter.js';
    `,
    resolveDir: process.cwd(),
    sourcefile: 'dice-test-entry.js'
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'silent'
});

const dice = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

function createEngine(values) {
  let index = 0;
  return new dice.DiceFallbackEngine(max => {
    const next = values[index++];
    if (next == null) throw new Error(`Testwert für W${max} fehlt.`);
    return Math.max(0, Math.min(max - 1, next));
  });
}

async function execute(notation, values) {
  return new dice.DiceParserAdapter().execute(notation, createEngine(values));
}

test('validates the supported advanced notation subset and limits', () => {
  for (const notation of ['1d20', '1d20+5', '1d20-2', '2d6+4', '8d6', '2d20kh1', '2d20kl1', '4d6dl1', '6d6!', '2d12r1', '1d6+1d8+3']) {
    assert.equal(dice.validateDiceNotation(notation).notation, notation);
  }
  assert.throws(() => dice.validateDiceNotation('1d7'), /nicht unterstützt/);
  assert.throws(() => dice.validateDiceNotation('101d6'), /Würfelgruppe/);
  assert.throws(() => dice.validateDiceNotation('1d20<script>'), /nicht unterstützt/);
});

test('aggregates positive and negative modifiers from the physical die', async () => {
  const plus = await execute('1d20+5', [9]);
  assert.equal(plus.total, 15);
  assert.equal(plus.modifier, 5);
  assert.deepEqual(plus.dice, [10]);

  const minus = await execute('1d20-5', [9]);
  assert.equal(minus.total, 5);
  assert.equal(minus.modifier, -5);

  const damage = await execute('2d6+4', [2, 3]);
  assert.equal(damage.total, 11);
  assert.deepEqual(damage.keptDice, [3, 4]);
});

test('keeps the correct d20 for advantage and disadvantage', async () => {
  const advantage = await execute('2d20kh1+5', [6, 17]);
  assert.equal(advantage.total, 23);
  assert.equal(advantage.natural, 18);
  assert.deepEqual(advantage.keptDice, [18]);
  assert.deepEqual(advantage.droppedDice, [7]);

  const disadvantage = await execute('2d20kl1', [6, 17]);
  assert.equal(disadvantage.total, 7);
  assert.equal(disadvantage.natural, 7);
  assert.deepEqual(disadvantage.keptDice, [7]);
  assert.deepEqual(disadvantage.droppedDice, [18]);
});

test('marks only the kept natural d20 as critical', async () => {
  const naturalTwenty = await execute('1d20+5', [19]);
  assert.equal(naturalTwenty.critical, 'success');
  assert.equal(naturalTwenty.natural, 20);

  const keptTwenty = await execute('2d20kh1', [19, 14]);
  assert.equal(keptTwenty.critical, 'success');

  const droppedTwenty = await execute('2d20kl1', [19, 14]);
  assert.equal(droppedTwenty.critical, '');
  assert.equal(droppedTwenty.natural, 15);
});

test('drops the lowest die without marking ordinary damage as critical', async () => {
  const result = await execute('4d6dl1', [0, 1, 3, 5]);
  assert.equal(result.total, 12);
  assert.deepEqual(result.keptDice, [2, 4, 6]);
  assert.deepEqual(result.droppedDice, [1]);
  assert.equal(result.critical, '');
});

test('handles multiple physical dice groups', async () => {
  const result = await execute('1d6+1d8+2', [3, 5]);
  assert.equal(result.total, 12);
  assert.deepEqual(result.keptDice, [4, 6]);
  assert.equal(result.terms.filter(term => term.kind === 'dice').length, 2);
});

test('finishes rerolls before returning the result', async () => {
  const result = await execute('2d12r1', [0, 6, 9]);
  assert.equal(result.total, 17);
  assert.deepEqual(result.keptDice, [7, 10]);
  assert.deepEqual(result.droppedDice, [1]);
});

test('finishes exploding dice before returning the result', async () => {
  const result = await execute('2d6!', [5, 1, 3]);
  assert.equal(result.total, 12);
  assert.deepEqual(result.keptDice, [6, 2, 4]);
});

test('stops an unbounded explosion chain', async () => {
  const engine = new dice.DiceFallbackEngine(max => max - 1);
  await assert.rejects(() => new dice.DiceParserAdapter().execute('1d4!', engine), /zu viele Folge-Würfe/);
});

test('stores at most 30 versioned history entries', () => {
  const memory = new Map();
  const storage = {
    getItem: key => memory.get(key) || null,
    setItem: (key, value) => memory.set(key, value)
  };
  const repository = new dice.DiceHistoryRepository(storage);
  for (let index = 0; index < 35; index += 1) {
    repository.add({ notation: '1d20', dice: [index + 1], keptDice: [index + 1], droppedDice: [], modifier: 0, total: index + 1 });
  }
  assert.equal(repository.list().length, 30);
  assert.equal(JSON.parse(memory.get(dice.DICE_HISTORY_KEY)).schemaVersion, 1);
});
