import test from 'node:test';
import assert from 'node:assert/strict';
import { isCatalogValidationCommand, isCheckpointCommand } from '../build/validation-commands.mjs';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { canRunValidationInParallel } from '../build/build-validation-scheduler.mjs';

test('reviewed catalog checks require the exact read-only invocation', () => {
  for (const file of ['build-goldene-fassung', 'build-loer-hofjuwelier', 'build-gwniwr-shop',
    'build-maerllys', 'build-tailoring-characters', 'build-gwynthor-landfamilien', 'build-gwynthor-landfamilien-characters']) {
    const script = `AleriaAlmanach/scripts/${file}.mjs`;
    assert.equal(isCheckpointCommand([script, '--check']), true, script);
    for (const args of [[script], [script, '--apply'], [script, '--check', '--apply'],
      [script, '--check', '--report=somewhere'], [script, '--check', '--root=elsewhere']]) {
      assert.equal(isCheckpointCommand(args), false, args.join(' '));
    }
  }
  assert.equal(isCatalogValidationCommand(['unreviewed.mjs', '--check']), false);
});

test('scoped house checks accept both option orders and reject unreviewed arguments', () => {
  for (const script of ['Familien Häuser und Clans/scripts/build-house-content.mjs', 'Gallerien/krieger/scripts/build-catalog.mjs']) {
    for (const options of [['--check', '--houses=haus-ffals,haus-aurdden'], ['--houses=haus-ffals', '--check']]) {
      assert.equal(isCatalogValidationCommand([script, ...options]), true);
    }
    for (const options of [['--houses=haus-ffals'], ['--check', '--houses=../private'],
      ['--check', '--houses='], ['--check', '--check'], ['--check', '--houses=haus-ffals', '--write'],
      ['--check', '--all'], ['--check', '--houses=haus-ffals,']]) {
      assert.equal(isCatalogValidationCommand([script, ...options]), false);
    }
  }
});

test('preparation options cannot hide output modes or foreign paths in checkpointed tasks', () => {
  const script = 'netlify/build/prepare-runtime-checks.mjs';
  assert.equal(isCheckpointCommand([script]), true);
  assert.equal(isCheckpointCommand([script, '--scope=firebase']), true);
  assert.equal(isCheckpointCommand([script, '--scope=foreign']), false);
  assert.equal(isCheckpointCommand([script, '--scope=firebase', '--apply']), false);
  assert.equal(isCheckpointCommand(['netlify/build/verify-task-inputs.mjs', '--apply']), false);
});

test('artwork validators are checkpointable only without their receipt-writing option', () => {
  for (const script of ['AleriaAlmanach/scripts/check-ability-icons.mjs', 'AleriaAlmanach/scripts/check-weapon-standard-art.mjs']) {
    assert.equal(isCheckpointCommand([script]), true);
    assert.equal(isCheckpointCommand([script, '--write-receipt']), false);
    assert.equal(isCheckpointCommand([script, '--check', '--write-receipt']), false);
  }
});

test('every opted-in production group has a complete reviewed validation contract', () => {
  const groups = SITE_BUILD_TASKS.filter(task => task.parallelValidation);
  assert.ok(groups.length >= 2);
  for (const group of groups) assert.equal(canRunValidationInParallel(group), true, group.id);
  const policy = SITE_BUILD_TASKS.find(task => task.id === 'build-policy');
  for (const file of ['build-preflight', 'build-validation-scheduler', 'validation-commands']) {
    assert.ok(policy.commands.some(args => args.includes(`netlify/tests/${file}.test.mjs`)), file);
  }
});
