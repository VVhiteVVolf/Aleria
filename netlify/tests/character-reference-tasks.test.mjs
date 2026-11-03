import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { selectBuildTasks, isTaskInput } from '../build/site-build-plan.mjs';
import { CHARACTER_CULTURAL_ORIGINS } from '../../AleriaAlmanach/modules/character-origins/cultural-origin-catalog.js';

const task = SITE_BUILD_TASKS.find(value => value.id === 'character-reference-catalogs');
const guides = SITE_BUILD_TASKS.find(value => value.id === 'gameplay-guides');
const now = Date.parse('2026-11-03T12:00:00Z');
const options = { now, runtime: 'node/test', siteId: 'reference-catalog-test' };
const blob = (file, revision = 'a') => ({ file, object: `100644 blob ${revision.repeat(40)}` });
const samples = [
  'AleriaAlmanach/modules/weapon-standards/weapon-standard-catalog.js',
  'Markt/WaffenRüstungen/data/shop-data.js',
  'AleriaAlmanach/public/assets/weapon-standards/rapier.png',
  'AleriaAlmanach/docs/art/weapon-standards/sources/rapier.png',
  'AleriaAlmanach/scripts/prepare-weapon-standard-art.ps1',
  'AleriaAlmanach/modules/character-origins/cultural-origin-catalog.js',
  'AleriaAlmanach/public/assets/character-origins/alben.png',
  'AleriaAlmanach/modules/character-archive/character-archive-query.js',
  'AleriaAlmanach/modules/character-archive/character-archive-ability-icons.js',
  'AleriaAlmanach/tools/character-library/public-character-library-source.mjs',
  'CharakterDatenbank/generated/characters.snapshot.json',
  'CharakterDatenbank/records/public/example/character.json',
  'AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js',
  'AleriaAlmanach/docs/art/ability-icons/sources/durchschnaufen.png',
  'AleriaAlmanach/scripts/check-ability-icons.mjs',
  'AleriaAlmanach/modules/combat/combat-weapon-profile-family.js',
  'AleriaAlmanach/tests/weapon-standard-expansion.test.mjs',
  'AleriaAlmanach/modules/weapon-standards/weapon-standard-presentation.js'
];
const tree = samples.map(file => blob(file));
const baseline = { version: 1, siteId: options.siteId, commit: 'a'.repeat(40),
  tasks: Object.fromEntries(selectBuildTasks(SITE_BUILD_TASKS, tree, options).map(value => [value.id, {
    fingerprint: value.fingerprint, verifiedAt: new Date(now - 1000).toISOString()
  }])) };
const selected = next => selectBuildTasks(SITE_BUILD_TASKS, next, { ...options, baseline })
  .filter(value => value.run && !value.always).map(value => value.id);

test('each weapon, origin, public library, archive and art input invalidates the independent catalog gate', () => {
  assert.ok(task);
  assert.deepEqual(selected(tree), []);
  for (const file of samples) {
    const next = tree.map(row => row.file === file ? blob(file, 'b') : row);
    assert.ok(selected(next).includes(task.id), file);
    assert.ok(selected(tree.filter(row => row.file !== file)).includes(task.id), `removed ${file}`);
  }
});

test('country dependencies follow documented origin sources and artwork without watching unrelated drafts', () => {
  for (const origin of CHARACTER_CULTURAL_ORIGINS) {
    for (const file of [...origin.sourcePaths, origin.icon.replace(/^\//, '')]) assert.ok(isTaskInput(task, file), file);
    const page = origin.pagePath.split('#')[0].replace(/^\//, '').replace(/\/$/, '/index.html');
    assert.ok(isTaskInput(task, page), page);
  }
  assert.equal(isTaskInput(task, 'Vorschau/Unrelated/draft.mjs'), false);
  assert.equal(isTaskInput(task, 'netlify/docs/editorial-notes.md'), false);
  assert.ok(!selected([...tree, blob('Vorschau/Unrelated/draft.mjs')]).includes(task.id));
});

test('gameplay guides watch their imported definitions without coupling unrelated archive UI or image changes', () => {
  for (const file of [samples[0], samples[8], samples.at(-1)]) assert.ok(isTaskInput(guides, file), file);
  for (const file of [samples[2], samples[3], samples[4], samples[6], samples[7], samples[13]]) {
    assert.equal(isTaskInput(guides, file), false, file);
    assert.ok(!selected(tree.map(row => row.file === file ? blob(file, 'b') : row)).includes(guides.id), file);
  }
});

test('catalog commands validate authored generators, portable image receipts and all owner regression tests', () => {
  for (const command of [
    ['AleriaAlmanach/scripts/build-weapon-standards.mjs', '--check'],
    ['AleriaAlmanach/scripts/check-weapon-standard-art.mjs'],
    ['AleriaAlmanach/scripts/check-ability-icons.mjs'],
    ['AleriaAlmanach/scripts/build-item-register.mjs', '--check'],
    ['AleriaAlmanach/tools/build-spell-attack-library.mjs', '--check']
  ]) assert.ok(task.commands.some(value => JSON.stringify(value) === JSON.stringify(command)), command.join(' '));
  for (const file of ['weapon-standard-expansion', 'weapon-standard-art', 'weapon-standard-presentation', 'combat-weapon-profile-family',
    'cultural-origin-catalog', 'character-creation', 'ability-icon-registry',
    'character-archive-catalog-integrity', 'character-archive-attack-groups', 'character-archive-class-training',
    'character-archive-query', 'character-archive-library-revision', 'character-archive-card-presentation', 'combat-entry-icons', 'combat-technique-icon-ui']) {
    assert.ok(task.commands.some(command => command[0] === '--test' && command.includes(`AleriaAlmanach/tests/${file}.test.mjs`)), file);
  }
  assert.ok(task.commands.every(command => !command[0].endsWith('.ps1')), 'Node pipeline must remain portable');
  assert.ok(task.commands.some(command => command.includes('firebase/functions/tests/reference-catalog-parity.test.js')));
  for (const file of ['firebase/functions/src/generated/character-origins/cultural-origin-catalog.js',
    'firebase/functions/src/generated/combat/character-creation-templates.js',
    'firebase/functions/src/generated/combat/combat-weapon-profile-family.js']) assert.ok(isTaskInput(task, file), file);
});
