import test from 'node:test';
import assert from 'node:assert/strict';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { createFamilyPerson, createMarriage, createParentages } from '../assets/js/data/family-record-builders.js';

function fixture({ enabled = true, partnership = false, visibility = 'public' } = {}) {
  return {
    document: { id: 'unpartnered-parent-fixture', title: 'Elternschaft ohne bekannte Partnerschaft' },
    persons: ['parent-a', 'parent-b', 'child'].map((id, index) => createFamilyPerson({
      id, name: id, sex: index === 0 ? 'male' : 'female', houseId: ''
    })),
    partnerships: partnership ? [createMarriage('known-pair', 'parent-a', 'parent-b')] : [],
    parentages: createParentages(['child'], ['parent-a', 'parent-b'], partnership ? 'known-pair' : '', {
      legitimacy: 'unknown', visibility,
      extensions: enabled ? { chartPairParentsWithoutPartnership: true } : {}
    }),
    lineage: {}, timeJumps: [], cadetBranches: [], houses: []
  };
}

test('Eine explizite Elternkartenpaarung erhält beide Eltern, ohne eine Partnerschaft im Fachmodell anzulegen', () => {
  const family = fixture();
  const before = structuredClone(family);
  const chart = toFamilyChartData(family);
  assert.deepEqual(chart.diagnostics, []);
  assert.deepEqual(chart.data.find(node => node.id === 'parent-a').rels.spouses, ['parent-b']);
  assert.deepEqual(chart.data.find(node => node.id === 'parent-b').rels.spouses, ['parent-a']);
  assert.deepEqual(chart.data.find(node => node.id === 'child').rels.parents, ['parent-a', 'parent-b']);
  const rail = chart.getPartnershipLine('parent-a', 'parent-b');
  assert.equal(rail.layoutOnly, true);
  assert.equal(rail.type, 'biological');
  assert.equal(rail.partnershipId, '');
  assert.deepEqual(chart.extraCoupleLines, []);
  assert.deepEqual(family, before);
  assert.deepEqual(family.partnerships, []);
});

test('Unmarkierte Elternschaften und private Abstammungen bekommen keine automatische Karte-Paarung', () => {
  const unmarked = toFamilyChartData(fixture({ enabled: false }));
  assert.deepEqual(unmarked.data.find(node => node.id === 'parent-a').rels.spouses, []);
  assert.equal(unmarked.getPartnershipLine('parent-a', 'parent-b'), null);
  const privateChart = toFamilyChartData(fixture({ visibility: 'secret' }), { publicOnly: true });
  assert.deepEqual(privateChart.data.find(node => node.id === 'parent-a').rels.spouses, []);
  assert.deepEqual(privateChart.data.find(node => node.id === 'child').rels.parents, []);
});

test('Eine wirkliche Ehe behält ihre vollständige eigene Darstellung', () => {
  const chart = toFamilyChartData(fixture({ partnership: true }));
  const line = chart.getPartnershipLine('parent-a', 'parent-b');
  assert.equal(line.type, 'marriage');
  assert.equal(line.partnershipId, 'known-pair');
  assert.equal(line.layoutOnly, undefined);
});

test('Die Elternkartenoption dupliziert weder mehrfach genannte Paare noch entfernt sie echte Kanten', () => {
  const family = fixture();
  family.persons.push(createFamilyPerson({ id: 'second-child', name: 'Zweites Kind', houseId: '' }));
  family.parentages.push(...createParentages(['second-child'], ['parent-a', 'parent-b'], '', {
    legitimacy: 'unknown', extensions: { chartPairParentsWithoutPartnership: true }
  }));
  const chart = toFamilyChartData(family);
  assert.deepEqual(chart.data.find(node => node.id === 'parent-a').rels.spouses, ['parent-b']);
  assert.deepEqual(chart.data.find(node => node.id === 'parent-a').rels.children, ['child', 'second-child']);
  assert.equal(chart.data.filter(node => node.id === 'parent-b').length, 1);
});

test('Ungeeignete Anfragen werden diagnostiziert statt einen zyklischen Chartpfad zu erzeugen', () => {
  const family = fixture();
  family.parentages.push(...createParentages(['parent-b'], ['parent-a'], '', { legitimacy: 'unknown' }));
  const chart = toFamilyChartData(family);
  assert.ok(chart.diagnostics.some(item => item.code === 'INVALID_UNPARTNERED_PARENT_LAYOUT'));
  assert.equal(chart.getPartnershipLine('parent-a', 'parent-b'), null);
});
