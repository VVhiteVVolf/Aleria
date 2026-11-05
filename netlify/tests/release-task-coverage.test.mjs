import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { isTaskInput } from '../build/site-build-plan.mjs';

const task = id => { const value = SITE_BUILD_TASKS.find(row => row.id === id); assert(value, id); return value; };
const tested = value => new Set(value.commands.filter(command => command.includes('--test')).flat().filter(file => /\.test\.(?:mjs|js)$/.test(file)));

test('release policy retains immutable-source, dependency and checkpoint protection tests together', () => {
  const files = tested(task('build-policy'));
  for (const name of ['site-build', 'local-release', 'canonical-source', 'prepared-release', 'runtime-checks',
    'release-timings', 'release-flow', 'build-checkpoints', 'site-build-fingerprints',
    'adventure-release', 'frontend-source-publication', 'reference-art-publication',
    'house-source-publication', 'language-package-publication', 'release-task-coverage', 'avatar-source-publication']) {
    assert(files.has(`netlify/tests/${name}.test.mjs`), name);
  }
  assert.equal(new Set(SITE_BUILD_TASKS.map(row => row.id)).size, SITE_BUILD_TASKS.length);
});

test('new rural family and crest inputs use their real Unicode paths', () => {
  const value = task('quest-journal');
  for (const file of ['Stammbäume/assets/js/data/gwynthor-fleischsammler/localities.mjs',
    'Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/fleischsammler/haus-ysgellfor.png']) {
    assert(isTaskInput(value, file), file);
  }
  assert(!value.inputs.some(input => input.includes('Stammb?ume') || input.includes('B?rgerliche')));
});

test('country proposal checks include both Klythesia contracts and source-publication boundaries', () => {
  const files = tested(task('uathneach-preview'));
  for (const file of ['Vorschau/Klythesia/scripts/klythesia.test.mjs',
    'Vorschau/Klythesia/scripts/klythesia-expansion.test.mjs',
    'netlify/tests/klythesia-source-publication.test.mjs', 'netlify/tests/phalantia-source-publication.test.mjs']) {
    assert(files.has(file), file);
  }
});

test('starting possessions are checked using bounded fixture tests without calling the live publisher', () => {
  const value = task('house-signets'), files = tested(value);
  for (const name of ['draig-starting-possessions', 'draig-starting-possessions-database']) {
    const file = `AleriaAlmanach/tests/${name}.test.mjs`;
    assert(files.has(file)); assert(isTaskInput(value, file));
  }
  assert(isTaskInput(value, 'AleriaAlmanach/modules/draig-starting-possessions/starting-possessions-plan.mjs'));
  assert(!value.commands.flat().some(arg => /publish-draig-starting-possessions|sync-draig-starting-possessions/.test(arg)), 'Release checks must not run a historical content grant or online synchronization.');
});
