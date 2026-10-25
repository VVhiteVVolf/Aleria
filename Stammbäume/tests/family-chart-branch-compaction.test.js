import test from 'node:test';
import assert from 'node:assert/strict';
import { applyFamilyChartBranchCompaction } from '../assets/js/adapters/family-chart-branch-compaction.js';
import { collectFamilyChartCardCollisions } from '../assets/js/adapters/family-chart-spacing-guard.js';

function fixture() {
  const node = (id, x, y, parents = []) => ({ x, y, sx: x,
    data: { id, rels: { parents }, data: {} } });
  const tree = { data: [node('p', 0, 0), node('q', 352, 0),
    node('c', -3000, 326, ['p', 'q']), node('w', -2648, 326),
    node('kid', -2824, 652, ['c', 'w']), node('ward', -2472, 652, ['c']),
    node('__cadet-knot', -2824, 978, ['c', 'w'])] };
  const family = {
    persons: ['p', 'q', 'c', 'w', 'kid', 'ward'].map(id => ({ id })),
    partnerships: [{ id: 'parents', participantIds: ['p', 'q'] }, { id: 'couple', participantIds: ['c', 'w'] }],
    parentages: [{ childId: 'c', parentIds: ['p', 'q'], partnershipId: 'parents', type: 'biological' },
      { childId: 'kid', parentIds: ['c', 'w'], partnershipId: 'couple', type: 'biological' },
      { childId: 'ward', parentIds: ['c'], partnershipId: '', type: 'foster' }]
  };
  return { tree, family };
}
const span = (tree, axis = 'x') => Math.max(...tree.data.map(n => n[axis])) - Math.min(...tree.data.map(n => n[axis]));

test('a distant descendant branch compacts with partner, children, ward and house knot as one unit', () => {
  const { tree, family } = fixture(), before = structuredClone(tree), genealogy = structuredClone(family);
  const result = applyFamilyChartBranchCompaction({ tree, family });
  assert.ok(result.resolutions.some(r => r.rootPersonId === 'c'));
  const rootShift = tree.data.find(n => n.data.id === 'c').x + 3000;
  for (const id of ['c', 'w', 'kid', 'ward', '__cadet-knot']) {
    const node = tree.data.find(n => n.data.id === id), old = before.data.find(n => n.data.id === id);
    assert.equal(node.x - old.x, rootShift, id);
    assert.equal(node.y, old.y, id);
  }
  assert.ok(span(tree) < span(before) / 2);
  assert.equal(collectFamilyChartCardCollisions(tree.data).length, 0);
  assert.deepEqual(family, genealogy);
  assert.deepEqual(applyFamilyChartBranchCompaction({ tree, family }).resolutions, []);
});

test('a blocking sibling retains its order and required card spacing', () => {
  const { tree, family } = fixture();
  tree.data.push({ x: 600, y: 326, data: { id: 'sibling', rels: { parents: ['p', 'q'] } } });
  family.persons.push({ id: 'sibling' });
  family.parentages.push({ childId: 'sibling', parentIds: ['p', 'q'], partnershipId: 'parents' });
  const beforeWidth = span(tree);
  applyFamilyChartBranchCompaction({ tree, family });
  const child = tree.data.find(n => n.data.id === 'c'), partner = tree.data.find(n => n.data.id === 'w');
  assert.ok(child.x < 600 && partner.x <= 248);
  assert.equal(collectFamilyChartCardCollisions(tree.data).length, 0);
  assert.ok(span(tree) < beforeWidth);
});

test('a spouse with a separate ancestry keeps the cross-family branch intact', () => {
  const { tree, family } = fixture();
  tree.data.push({ x: -5000, y: 0, data: { id: 'outside' } });
  family.persons.push({ id: 'outside' });
  family.parentages.push({ childId: 'w', parentIds: ['outside'], partnershipId: '' });
  applyFamilyChartBranchCompaction({ tree, family });
  assert.equal(tree.data.find(n => n.data.id === 'c').x, -3000);
  assert.equal(tree.data.find(n => n.data.id === 'w').x, -2648);
});

test('an explicit generation-edge placement is not silently moved', () => {
  const { tree, family } = fixture();
  family.partnerships[1].extensions = { chartPlacePairAtGenerationEdge: { side: 'before' } };
  const before = structuredClone(tree);
  applyFamilyChartBranchCompaction({ tree, family });
  assert.deepEqual(tree, before);
});

test('the same compaction works horizontally without changing generation coordinates', () => {
  const { tree, family } = fixture();
  tree.data.forEach(node => { [node.x, node.y] = [node.y * 2, node.x]; });
  const before = structuredClone(tree);
  const result = applyFamilyChartBranchCompaction({ tree, family, orientation: 'horizontal' });
  assert.ok(result.resolutions.length);
  assert.ok(span(tree, 'y') < span(before, 'y'));
  tree.data.forEach((node, i) => assert.equal(node.x, before.data[i].x));
  assert.equal(collectFamilyChartCardCollisions(tree.data).length, 0);
});

test('small distances and multiple parentage origins are preserved', () => {
  const { tree, family } = fixture();
  family.parentages.push({ childId: 'c', parentIds: ['q'], partnershipId: '', type: 'adoptive' });
  assert.deepEqual(applyFamilyChartBranchCompaction({ tree, family }).resolutions, []);
  const empty = applyFamilyChartBranchCompaction({ tree: { data: [] }, family: {} });
  assert.deepEqual(empty.resolutions, []);
});
