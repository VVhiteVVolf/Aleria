import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVENTURE_SYSTEM_TASKS } from '../build/adventure-system-tasks.mjs';
import { isTaskInput, taskFingerprint } from '../build/site-build-plan.mjs';
import { BUILTIN_TRADE_SOURCE_FILES } from '../../AleriaAlmanach/modules/scene-trade/scene-trade-builtins.js';

const task = ADVENTURE_SYSTEM_TASKS.find(entry => entry.id === 'item-mechanics');
const source = (file, value = 'a') => ({ file, object: `100644 blob ${value.repeat(40)}` });
const runtime = 'node/scene-trade-source-coverage';

test('every canonical built-in source invalidates the authoritative mechanics gate', () => {
  assert.ok(BUILTIN_TRADE_SOURCE_FILES.length > 0);
  const tree = BUILTIN_TRADE_SOURCE_FILES.map(file => source(file));
  const before = taskFingerprint(task, tree, runtime);
  for (const file of BUILTIN_TRADE_SOURCE_FILES) {
    assert.ok(isTaskInput(task, file), file);
    const changed = tree.map(entry => entry.file === file ? source(file, 'b') : entry);
    assert.notEqual(taskFingerprint(task, changed, runtime), before, file);
  }
});

test('built-in generator and future feature helpers invalidate the same gate', () => {
  for (const file of ['AleriaAlmanach/scripts/build-scene-trade-builtins.mjs',
    'AleriaAlmanach/scripts/scene-trade/future-source-reader.mjs']) {
    assert.ok(isTaskInput(task, file), file);
    assert.notEqual(taskFingerprint(task, [source(file)], runtime),
      taskFingerprint(task, [source(file, 'b')], runtime), file);
  }
  assert.ok(task.commands.some(command => command.includes('netlify/tests/scene-trade-build-inputs.test.mjs')));
});
