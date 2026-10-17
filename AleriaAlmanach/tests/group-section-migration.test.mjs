import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { migrateCenyrGroupSections, migrateCenyrGroupConfig } from '../modules/module-store/group-section-migration.js';

const root = 'root:gruppen';
const cenyr = 'custom-cenyr-node';
const islands = 'node:gruppen:klaueninseln';
const arth = `${islands}/haus-arth`;
const node = (id, parentId, title, extra = {}) => ({ id, parentId, title, tab: 'Gruppen', desc: '', sortOrder: 0, ...extra });
const original = JSON.parse(readFileSync(new URL('../../Charakter Archiv Exporte/Biographien/lynnes-schiffsmannschaft-modulpaket-2026-10-04.json', import.meta.url), 'utf8')).module.entry;

function fixture() {
  return {
    version: 1, updatedAtClient: 100, entryOverrides: { [original.id]: original }, hiddenModuleIds: { hidden: true },
    moduleSectionNodes: [node(root, '', 'Gruppen'), node(cenyr, root, 'Cenyr', { sortOrder: 7, iconUrl: 'own-cenyr.png' }),
      node(islands, root, 'Klaueninseln', { desc: 'Eigene Beschreibung', sortOrder: 4, iconUrl: 'islands.png' }),
      node(arth, islands, 'Haus Arth'), node('later-branch', arth, 'Späterer Zweig'),
      node('private-islands', 'private-collection', 'Klaueninseln'),
      node('other-tab', '', 'Klaueninseln', { tab: 'Völker & Kulturen' })],
    moduleNodeAssignments: { 'lynnes-schiffsmannschaft': arth, 'rhydians-schiffsmannschaft': arth, 'parzifals-schiffsmannschaft': arth, later: 'later-branch' },
    customSections: [{ tab: 'Gruppen', key: 'Haus Arth', path: ['Klaueninseln', 'Haus Arth'], nodeId: arth, entries: [original] },
      { tab: 'Gruppen', key: 'Andere Sammlung', path: ['Andere Sammlung'], entries: [{ id: 'unrelated' }] }],
    moduleSectionMoves: { 'parzifals-schiffsmannschaft': { tab: 'Gruppen', key: 'Haus Arth', path: ['Klaueninseln', 'Haus Arth'], nodeId: arth },
      'intentional-move': { tab: 'Gruppen', key: 'Eigene Sammlung', path: ['Eigene Sammlung'], nodeId: 'private-collection' } }
  };
}

test('Klaueninseln moves under the existing Cenyr branch without changing stable references or module bytes', () => {
  const input = fixture();
  const before = structuredClone(input);
  const bytes = JSON.stringify(original);
  const result = migrateCenyrGroupSections(input);
  assert.deepEqual(input, before, 'Input remains untouched');
  assert.equal(result.moduleSectionNodes.length, input.moduleSectionNodes.length);
  assert.deepEqual(result.moduleSectionNodes.map(item => item.id), input.moduleSectionNodes.map(item => item.id));
  assert.deepEqual(result.moduleSectionNodes.find(item => item.id === islands), { ...input.moduleSectionNodes.find(item => item.id === islands), parentId: cenyr });
  for (const current of result.moduleSectionNodes.filter(item => item.id !== islands)) assert.equal(current, input.moduleSectionNodes.find(item => item.id === current.id));
  assert.equal(result.moduleNodeAssignments, input.moduleNodeAssignments);
  assert.equal(result.entryOverrides, input.entryOverrides);
  assert.equal(result.customSections[0].entries, input.customSections[0].entries);
  assert.equal(JSON.stringify(result.customSections[0].entries[0]), bytes);
  assert.deepEqual(result.customSections[0].path, ['Cenyr', 'Klaueninseln', 'Haus Arth']);
  assert.deepEqual(result.moduleSectionMoves['parzifals-schiffsmannschaft'].path, ['Cenyr', 'Klaueninseln', 'Haus Arth']);
  assert.equal(result.moduleSectionMoves['intentional-move'], input.moduleSectionMoves['intentional-move']);
  assert.equal(result.hiddenModuleIds, input.hiddenModuleIds);
  assert.equal(result.updatedAtClient, 100);
  assert.equal(migrateCenyrGroupSections(result), result, 'Repeated migration is a no-op');
});

test('an old island-only cache receives a complete parent chain and retains its original node IDs', () => {
  const input = { moduleSectionNodes: [node(islands, '', 'Klaueninseln'), node(arth, islands, 'Haus Arth')],
    moduleNodeAssignments: { [original.id]: arth } };
  const result = migrateCenyrGroupSections(input);
  const lookup = new Map(result.moduleSectionNodes.map(item => [item.id, item]));
  assert.equal(lookup.get(islands).parentId, 'node:gruppen:cenyr');
  assert.equal(lookup.get('node:gruppen:cenyr').parentId, root);
  assert.equal(lookup.get(root).parentId, '');
  assert.equal(lookup.get(arth).parentId, islands);
  for (const item of lookup.values()) if (item.parentId) assert.ok(lookup.has(item.parentId));
  assert.equal(result.moduleNodeAssignments, input.moduleNodeAssignments);
  assert.equal(migrateCenyrGroupSections(result), result);
});

test('the config publication adapter repairs manifest descriptors and legacy mirrors without rewriting entry references', () => {
  const source = fixture();
  const descriptor = { ...source.customSections[0], entryIds: Object.keys(source.moduleNodeAssignments) };
  delete descriptor.entries;
  const config = { moduleStoreManifest: { ...source, format: 'split-v1', customSections: [descriptor] },
    moduleSectionNodes: source.moduleSectionNodes, moduleSectionMoves: source.moduleSectionMoves,
    moduleNodeAssignments: source.moduleNodeAssignments, moduleStoreUpdatedAtClient: 100,
    unrelatedSetting: { value: true } };
  delete config.moduleStoreManifest.entryOverrides;
  const before = structuredClone(config);
  const result = migrateCenyrGroupConfig(config);
  assert.deepEqual(config, before);
  assert.equal(result.moduleStoreManifest.customSections[0].entryIds, descriptor.entryIds);
  assert.deepEqual(result.moduleStoreManifest.customSections[0].path, ['Cenyr', 'Klaueninseln', 'Haus Arth']);
  assert.equal(result.moduleStoreManifest.moduleSectionNodes.find(item => item.id === islands).parentId, cenyr);
  assert.deepEqual(result.moduleSectionNodes, result.moduleStoreManifest.moduleSectionNodes);
  assert.deepEqual(result.moduleSectionMoves, result.moduleStoreManifest.moduleSectionMoves);
  assert.equal(result.moduleNodeAssignments, config.moduleNodeAssignments);
  assert.equal(result.unrelatedSetting, config.unrelatedSetting);
  assert.equal(result.moduleStoreUpdatedAtClient, config.moduleStoreUpdatedAtClient);
  assert.equal(result.moduleStoreManifest.updatedAtClient, config.moduleStoreManifest.updatedAtClient);
  assert.equal(migrateCenyrGroupConfig(result), result);
});

test('unrelated categories, intentional subtrees and absent state remain untouched', () => {
  const input = { customSections: [{ tab: 'Völker & Kulturen', path: ['Klaueninseln'] }, { tab: 'Gruppen', path: ['Cenyr', 'Klaueninseln'] }],
    moduleSectionNodes: [node('own-islands', 'private-collection', 'Klaueninseln')], moduleNodeAssignments: {} };
  assert.equal(migrateCenyrGroupSections(input), input);
  assert.equal(migrateCenyrGroupConfig(input), input);
  assert.equal(migrateCenyrGroupSections(null), null);
});

test('the deferred browser bundle exposes the same pure migration used by publication', () => {
  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../modules/module-store/group-section-migration.global.js', import.meta.url), 'utf8'), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.AleriaGroupSectionMigration.migrateCenyrGroupSections(fixture()))), JSON.parse(JSON.stringify(migrateCenyrGroupSections(fixture()))));
});
