import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHouseScope, selectHouseSources, mergeScopedRecords, readPageRegistry, mergePageRegistry, mergeRankRegistry, mergeBiographyRegistry } from '../scripts/house-content-scope.mjs';

test('scope is explicit, validated and optional for the established full build', () => {
  assert.equal(parseHouseScope(['--check']), null);
  assert.deepEqual(parseHouseScope(['--houses=haus-a, haus-b']), ['haus-a', 'haus-b']);
  for (const args of [['--houses'], ['--houses='], ['--houses=haus-a,'], ['--houses=haus-a,haus-a'], ['--houses=../outside'], ['--houses=haus-a', '--houses=haus-b'], ['--house=haus-a'], ['--housesx=haus-a'], ['haus-a']]) assert.throws(() => parseHouseScope(args));
});

test('every selected ID must have exactly one source before outputs are written', () => {
  const a = { content: { id: 'haus-a' } }, b = { content: { id: 'haus-b' } };
  assert.deepEqual(selectHouseSources([a, b], ['haus-b']), [b]);
  assert.throws(() => selectHouseSources([a, b], ['missing']));
  assert.throws(() => selectHouseSources([a, a], ['haus-a']));
  assert.deepEqual(selectHouseSources([a, b], null), [a, b]);
});

test('scoped records retain unrelated values and stable order while replacing or removing selected entries', () => {
  const foreign = { id: 'foreign', custom: { revision: 'preserve' } }, previous = [{ id: 'selected', old: true }, foreign];
  const updated = { id: 'selected', next: true }, order = ['selected', 'foreign'];
  const result = mergeScopedRecords(previous, [updated], ['selected'], order);
  assert.equal(result[1], foreign);
  assert.equal(result[0], updated);
  assert.deepEqual(previous[0], { id: 'selected', old: true });
  assert.deepEqual(mergeScopedRecords(previous, [], ['selected'], order), [foreign]);
  assert.deepEqual(mergeScopedRecords(result, [updated], ['selected'], order), result);
  assert.throws(() => mergeScopedRecords(previous, [{ id: 'outside' }], ['selected'], order));
  assert.throws(() => mergeScopedRecords([foreign, foreign], [], ['selected'], order));
});

test('page snapshots preserve unselected metadata and reject malformed generated records', () => {
  const record = { id: 'foreign', page: 'custom.html', data: 'old.data.js', own: { retain: true } };
  const source = `prefix\n    // BEGIN GENERATED HOUSE PAGES\n    ${JSON.stringify(record)},\n    // END GENERATED HOUSE PAGES\nsuffix`;
  assert.deepEqual(readPageRegistry(source), [record]);
  assert.throws(() => readPageRegistry('missing markers'));
  assert.throws(() => readPageRegistry(source.replace(JSON.stringify(record), 'not-json')));
  assert.throws(() => readPageRegistry(source + source));
  const commented = source.replace('    // BEGIN GENERATED HOUSE PAGES\n', '    // BEGIN GENERATED HOUSE PAGES\n    // Foreign note stays here.\n');
  const update = { id: 'selected', page: 'new.html' };
  const result = mergePageRegistry(commented, [update], ['selected'], ['foreign', 'selected']);
  assert.ok(result.includes('    // Foreign note stays here.\n'));
  assert.ok(result.includes(`    ${JSON.stringify(record)},\n`));
  assert.ok(result.indexOf('"foreign"') < result.indexOf('"selected"'));
  assert.equal(mergePageRegistry(result, [update], ['selected'], ['foreign', 'selected']), result);
});

test('rank merge preserves unselected rank values even when authoring elsewhere differs', () => {
  const source = '// Foreign preface\nexport const HOUSE_RANKS = Object.freeze({\n  // Foreign rank note\n  "foreign": "Saved rank",\n  "selected": "Old"\n});\n';
  const result = mergeRankRegistry(source, { selected: 'New', added: 'Baron' }, ['selected', 'added'], ['selected', 'added', 'foreign'], '// generated\n');
  assert.match(result, /"foreign": "Saved rank"/);
  assert.match(result, /"selected": "New"/);
  assert.match(result, /"added": "Baron"/);
  assert.ok(result.startsWith('// Foreign preface\n'));
  assert.ok(result.includes('  // Foreign rank note\n'));
  assert.ok(result.indexOf('"foreign"') < result.indexOf('"selected"'));
  assert.equal(mergeRankRegistry(result, { selected: 'New', added: 'Baron' }, ['selected', 'added'], ['selected', 'added', 'foreign'], '// generated\n'), result);
  assert.throws(() => mergeRankRegistry('unrecognized', {}, ['selected'], [], ''));
});

test('biography merge keeps foreign imports, revisions and fingerprints without refreshing their source', () => {
  const foreignImport = 'import { HOUSE_BIOGRAPHY as foreign } from "./foreign.mjs?v=existing";';
  const selectedImport = 'import { HOUSE_BIOGRAPHY as selected } from "./selected.mjs?v=old";';
  const foreignEntry = '  "foreign": Object.freeze({ sourceRevision: 7, biography: foreign, replacedDefaultFingerprints: Object.freeze(["keep"]) }),';
  const oldEntry = '  "selected": Object.freeze({ sourceRevision: 1, biography: selected, replacedDefaultFingerprints: Object.freeze([]) }),';
  const source = `// Foreign import note\n${foreignImport}\n${selectedImport}\n\nexport const HOUSE_BIOGRAPHY_DEFAULTS = Object.freeze({\n  // Foreign entry note\n${foreignEntry}\n${oldEntry}\n});\n`;
  const nextImport = selectedImport.replace('v=old', 'v=new'), nextEntry = oldEntry.replace('sourceRevision: 1', 'sourceRevision: 2');
  const result = mergeBiographyRegistry(source, [nextImport], [nextEntry], ['selected'], ['selected', 'foreign'], '// generated\n');
  assert.ok(result.includes(foreignImport));
  assert.ok(result.includes(foreignEntry));
  assert.ok(result.includes(nextImport));
  assert.ok(result.includes(nextEntry));
  assert.ok(!result.includes('v=old'));
  assert.ok(result.startsWith('// Foreign import note\n'));
  assert.ok(result.includes('  // Foreign entry note\n'));
  assert.ok(result.indexOf('"foreign":') < result.indexOf('"selected":'));
  assert.equal(mergeBiographyRegistry(result, [nextImport], [nextEntry], ['selected'], ['selected', 'foreign'], '// generated\n'), result);
  assert.throws(() => mergeBiographyRegistry('unrecognized', [], [], ['selected'], [], ''));
  assert.throws(() => mergeBiographyRegistry(source.replace('  "foreign":', "  'foreign':"), [], [], ['selected'], [], ''));
  assert.throws(() => mergeBiographyRegistry(source.replace('  "foreign":', '    "foreign":'), [], [], ['selected'], [], ''));
  assert.throws(() => mergeBiographyRegistry(source.replace(foreignImport, `${foreignImport}\n${foreignImport}`), [], [], ['selected'], [], ''));
});

test('new scoped entries follow full-build order in every registry without reordering existing foreign entries', () => {
  const order = ['haus-a', 'haus-b', 'haus-c'];
  const record = id => ({ id, value: id });
  const page = ids => `prefix\n    // BEGIN GENERATED HOUSE PAGES\n${ids.map(id => `    ${JSON.stringify(record(id))},`).join('\n')}\n    // END GENERATED HOUSE PAGES\nsuffix`;
  assert.equal(mergePageRegistry(page(['haus-a', 'haus-c']), [record('haus-b')], ['haus-b'], order), page(order));
  const ranks = ids => `// generated\nexport const HOUSE_RANKS = Object.freeze(${JSON.stringify(Object.fromEntries(ids.map(id => [id, id])), null, 2)});\n`;
  assert.equal(mergeRankRegistry(ranks(['haus-a', 'haus-c']), { 'haus-b': 'haus-b' }, ['haus-b'], order, ''), ranks(order));
  const bioImport = id => `import { HOUSE_BIOGRAPHY as ${id.replaceAll('-', '_')} } from "./${id}.mjs";`;
  const bioEntry = id => `  "${id}": Object.freeze({ sourceRevision: 1, biography: ${id.replaceAll('-', '_')}, replacedDefaultFingerprints: Object.freeze([]) }),`;
  const biographies = ids => `// generated\n${ids.map(bioImport).join('\n')}\n\nexport const HOUSE_BIOGRAPHY_DEFAULTS = Object.freeze({\n${ids.map(bioEntry).join('\n')}\n});\n`;
  assert.equal(mergeBiographyRegistry(biographies(['haus-a', 'haus-c']), [bioImport('haus-b')], [bioEntry('haus-b')], ['haus-b'], order, ''), biographies(order));
  assert.equal(mergeBiographyRegistry(biographies(['haus-a', 'haus-b']), [bioImport('haus-c')], [bioEntry('haus-c')], ['haus-c'], order, ''), biographies(order));
  const noncanonical = [record('haus-c'), record('haus-a')];
  assert.deepEqual(mergeScopedRecords(noncanonical, [record('haus-b')], ['haus-b'], order).map(row => row.id), ['haus-b', 'haus-c', 'haus-a']);
});

test('mixed line endings and foreign comments remain byte-stable in page registry scope', () => {
  const src = 'preface\r\n    // BEGIN GENERATED HOUSE PAGES\n    // keep\r\n    {"id":"foreign","custom":true},\n    // END GENERATED HOUSE PAGES\r\nfooter';
  assert.equal(mergePageRegistry(src, [], ['missing'], ['foreign']), src);
});
