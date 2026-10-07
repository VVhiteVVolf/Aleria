import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('../modules/windreiter/windreiter-section-migration.js', import.meta.url), 'utf8'), context);
const migrate = input => JSON.parse(JSON.stringify(context.migrateWindreiterModuleSections(input)));
const root = 'node:soldner:die-windreiter';
const regional = `${root}/estryll-banden`;
const band = `${regional}/die-schwarzen-fische`;
const oldRoot = 'node:soldner:windreiter';
const oldBand = `${oldRoot}/schwarzfische`;
const node = (id, parentId, title) => ({ id, parentId, title, tab: 'Söldner', desc: '', sortOrder: 0 });
const originalEntry = { id: 'schwarzfische-windreiter', title: 'Die Schwarzen Fische', pages: [{ description: 'Redaktionelle Fassung', commentThreadKey: 'bestehender-thread' }] };

test('release aliases merge into the existing online tree, retaining edits, custom modules and descendants', () => {
  const input = {
    updatedAtClient: 123,
    moduleSectionNodes: [node('root:soldner', '', 'Söldner'),
      { ...node(root, 'root:soldner', 'Die Windreiter'), desc: 'Eigene Beschreibung', sortOrder: 7 },
      node(regional, root, 'Estryll Banden'), node(band, regional, 'Die Schwarzen Fische'),
      node('custom-ship', band, 'Die Schattenschuppe'),
      node(oldRoot, 'root:soldner', 'Windreiter'), node(oldBand, oldRoot, 'Schwarzfische'),
      node('new-small-band', oldBand, 'Spätere kleine Bande')],
    customSections: [{ tab: 'Söldner', key: 'Die Schwarzen Fische', path: ['Die Windreiter', 'Estryll Banden', 'Die Schwarzen Fische'], nodeId: band,
      entries: [{ id: 'modul-1781961958641', title: 'Die Schwarzfische - Hierarchie' }] },
    { tab: 'Söldner', key: 'Spätere kleine Bande', path: ['Windreiter', 'Schwarzfische', 'Spätere kleine Bande'], nodeId: 'new-small-band', entries: [{ id: 'new-entry' }] }],
    moduleNodeAssignments: { windreiter: oldRoot, 'schwarzfische-windreiter': band, 'new-entry': 'new-small-band' },
    moduleSectionMoves: { windreiter: { tab: 'Söldner', key: 'Windreiter', path: ['Windreiter'], nodeId: oldRoot } },
    entryOverrides: { 'schwarzfische-windreiter': originalEntry }, hiddenModuleIds: { 'hidden-entry': true }
  };
  const before = structuredClone(input);
  const result = migrate(input);
  assert.deepEqual(input, before, 'Migration never mutates its source');
  assert.deepEqual(migrate(result), result, 'Repeated loads must be stable');
  assert.equal(result.moduleSectionNodes.length, input.moduleSectionNodes.length - 2);
  assert.equal(result.moduleSectionNodes.find(n => n.id === root).desc, 'Eigene Beschreibung');
  assert.equal(result.moduleSectionNodes.find(n => n.id === root).sortOrder, 7);
  assert.equal(result.moduleSectionNodes.find(n => n.id === 'new-small-band').parentId, band);
  assert.equal(result.moduleSectionNodes.find(n => n.id === 'custom-ship').parentId, band);
  assert.deepEqual(result.customSections.map(s => s.entries), input.customSections.map(s => s.entries));
  assert.deepEqual(result.customSections[1].path, ['Die Windreiter', 'Estryll Banden', 'Die Schwarzen Fische', 'Spätere kleine Bande']);
  assert.deepEqual(result.entryOverrides, input.entryOverrides);
  assert.deepEqual(result.hiddenModuleIds, input.hiddenModuleIds);
  assert.equal(result.moduleNodeAssignments.windreiter, root);
  assert.equal(result.moduleSectionMoves.windreiter.nodeId, root);
  assert.deepEqual(result.moduleSectionMoves.windreiter.path, ['Die Windreiter']);
  assert.equal(result.updatedAtClient, 123);
});

test('a cache containing only the first release receives a complete parent chain', () => {
  const result = migrate({ moduleSectionNodes: [node('root:soldner', '', 'Söldner'), node(oldRoot, 'root:soldner', 'Windreiter'), node(oldBand, oldRoot, 'Schwarzfische')],
    moduleNodeAssignments: { 'schwarzfische-windreiter': oldBand } });
  const nodes = new Map(result.moduleSectionNodes.map(n => [n.id, n]));
  assert.equal(nodes.get(band).parentId, regional);
  assert.equal(nodes.get(regional).parentId, root);
  assert.equal(result.moduleNodeAssignments['schwarzfische-windreiter'], band);
  for (const n of nodes.values()) if (n.parentId) assert(nodes.has(n.parentId));
  assert.deepEqual(migrate(result), result);
});

test('unrelated categories and intentional module moves keep their structure', () => {
  const input = { moduleSectionNodes: [{ id: 'other', parentId: '', tab: 'Gruppen', title: 'Windreiter' }],
    customSections: [{ tab: 'Gruppen', key: 'Windreiter', path: ['Windreiter'], nodeId: 'other', entries: [] }],
    moduleSectionMoves: { windreiter: { tab: 'Gruppen', path: ['Eigene Sammlung'], nodeId: 'other' } },
    moduleNodeAssignments: { windreiter: 'other' } };
  assert.deepEqual(migrate(input), input);
});
