import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSE_ARTH_FAMILY } from '../assets/js/data/house-arth-family.js';
import { buildRelationshipMatrix } from '../assets/js/modules/relationship-matrix/relationship-matrix-model.js';
import { renderRelationshipMatrix } from '../assets/js/modules/relationship-matrix/relationship-matrix-renderer.js';

test('Owains Affären bleiben getrennte Familien mit ihren jeweiligen Kindern', () => {
  const matrix = buildRelationshipMatrix(HOUSE_ARTH_FAMILY, 'owain-draig');
  assert.equal(matrix.partnerships.groups.length, 2);
  assert.deepEqual(matrix.partnerships.groups.find(group => group.partnership.id === 'affair-owain-sylvia').children.map(child => child.person.id), ['siana-draig']);
  assert.deepEqual(matrix.partnerships.groups.find(group => group.partnership.id === 'affair-owain-esyllt').children.map(child => child.person.id), ['amadia-draig']);
  const html = renderRelationshipMatrix(matrix);
  assert.match(html, /data-matrix-partnership-id="affair-owain-sylvia"/);
  assert.match(html, /Unehelich/);
  assert.doesNotMatch(html, /erste Ehe|zweite Ehe|onclick=/i);
});
test('Eine Affäre erzeugt keine automatisch behauptete Stief- oder Schwiegerfamilie', () => {
  const matrix = buildRelationshipMatrix(HOUSE_ARTH_FAMILY, 'siana-draig');
  const esyllt = matrix.sections.flatMap(section => section.entries).find(entry => entry.person.id === 'esyllt-arth');
  assert.equal(esyllt?.kinds.includes('step-parent') || false, false);
  const owain = buildRelationshipMatrix(HOUSE_ARTH_FAMILY, 'owain-draig');
  const afal = owain.sections.flatMap(section => section.entries).find(entry => entry.person.id === 'afal-arth');
  assert.ok(afal.labels.includes("Vater von Sylvia O'Cenyr"));
  assert.equal(afal.labels.includes('Schwiegervater'), false);
});
test('Mehrdeutige Kinderzuordnung bleibt ausdrücklich offen', () => {
  const input = { document: { id: 'test' }, persons: ['a', 'b', 'child'].map(id => ({ id, name: id })), partnerships: [
    { id: 'first', participantIds: ['a', 'b'], type: 'affair' }, { id: 'second', participantIds: ['a', 'b'], type: 'marriage' }
  ], parentages: [{ id: 'birth', childId: 'child', parentIds: ['a', 'b'], type: 'biological' }] };
  const matrix = buildRelationshipMatrix(input, 'a');
  assert.equal(matrix.partnerships.groups.every(group => group.children.length === 0), true);
  assert.deepEqual(matrix.partnerships.unassignedChildren.map(person => person.id), ['child']);
});
