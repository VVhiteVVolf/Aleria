import test from 'node:test';
import assert from 'node:assert/strict';
import { completeFamilyChartPartnerTraversal } from '../assets/js/adapters/family-chart-partner-traversal.js';

function node(id, spouses = [], parents = []) {
  return { id, data: { aleria: { personId: id } }, rels: { spouses, parents, children: [] } };
}

for (const orientation of ['vertical', 'horizontal']) {
  test(`a spouse's other partner is rendered once in the same generation (${orientation})`, () => {
    const father = node('father', ['mother']);
    const mother = node('mother', ['father', 'bard']);
    const bard = node('bard', ['mother', 'other']);
    const other = node('other', ['bard', 'mother']); // A cycle must terminate without duplicates.
    const data = [father, mother, bard, other];
    const before = structuredClone(data);
    const crossAxis = orientation === 'horizontal' ? 'y' : 'x';
    const generationAxis = orientation === 'horizontal' ? 'x' : 'y';
    const first = { data: father, x: 0, y: 0, depth: 4 };
    const second = { data: mother, x: 0, y: 0, depth: 4, spouse: first };
    second[crossAxis] = 430;
    first[generationAxis] = second[generationAxis] = 1304;
    first.spouses = [second];
    const tree = { data: [first, second] };
    const added = completeFamilyChartPartnerTraversal({ tree, data, orientation });
    assert.deepEqual(added.map(entry => entry.personId), ['bard', 'other']);
    assert.equal(tree.data.length, 4);
    assert.equal(new Set(tree.data.map(entry => entry.data.id)).size, 4);
    for (const entry of tree.data) {
      assert.equal(entry[generationAxis], 1304);
      assert.equal(entry.depth, 4);
      assert.deepEqual(entry.data.rels.parents, []);
    }
    assert.equal(tree.data[2].spouse, second);
    assert.ok(second.spouses.includes(tree.data[2]));
    assert.ok(tree.data[3].spouses.includes(second), 'The final cycle edge must be present without another mother card.');
    assert.equal(second.spouse, first, 'Existing native anchors must remain unchanged.');
    assert.ok(tree.data[2][crossAxis] > second[crossAxis]);
    assert.deepEqual(completeFamilyChartPartnerTraversal({ tree, data, orientation }), []);
    assert.deepEqual(data, before);
  });
}

test('missing source identities and already visible partners are never fabricated or duplicated', () => {
  const source = node('only', ['unknown']);
  const tree = { data: [{ data: source, x: 0, y: 0, depth: 0 }] };
  assert.deepEqual(completeFamilyChartPartnerTraversal({ tree, data: [source] }), []);
  assert.equal(tree.data.length, 1);
  assert.equal(tree.data[0].all_rels_displayed, false);
});
