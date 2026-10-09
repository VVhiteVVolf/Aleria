import test from 'node:test';
import assert from 'node:assert/strict';
import { createFamilyChartPersonAppearancePlan } from '../assets/js/adapters/family-chart-person-appearance-router.js';
import { createFamilyChartAppearanceLayout } from '../assets/js/adapters/family-chart-appearance-layout.js';
import { planFamilyChartPartnershipNodes } from '../assets/js/adapters/family-chart-partnership-nodes.js';
import { createFamilyChartNativeLinkRoute } from '../assets/js/adapters/family-chart-link-renderer.js';
import { presentPartnership } from '../assets/js/domain/partnership-presentation.js';

function twoBranches() {
  return { persons: ['guest', 'first', 'second', 'father', 'one', 'two'].map(id => ({ id })), partnerships: [
    { id: 'union-one', type: 'affair', participantIds: ['first', 'guest'] },
    { id: 'union-two', type: 'affair', participantIds: ['second', 'guest'] }
  ], parentages: [
    { childId: 'first', parentIds: ['father'] }, { childId: 'second', parentIds: ['father'] },
    { childId: 'one', partnershipId: 'union-one', parentIds: ['first', 'guest'] },
    { childId: 'two', partnershipId: 'union-two', parentIds: ['second', 'guest'] }
  ] };
}
test('Ein externer Mehrfachpartner erhält eigene Karten je weiterem Herkunftszweig, ohne Personenakten zu ändern', () => {
  const family = twoBranches(), before = structuredClone(family);
  const plan = createFamilyChartPersonAppearancePlan({ partnerships: family.partnerships, parentages: family.parentages, personById: new Map(family.persons.map(person => [person.id, person])) });
  assert.equal(plan.appearances.length, 1);
  const layout = createFamilyChartAppearanceLayout(family, plan);
  const repeatedId = plan.resolveParticipantId('guest', 'union-two');
  assert.notEqual(repeatedId, 'guest');
  assert.deepEqual(layout.partnerships[1].participantIds, ['second', repeatedId]);
  assert.deepEqual(layout.parentages[3].parentIds, ['second', repeatedId]);
  assert.deepEqual(layout.parentages[1].parentIds, ['father']);
  assert.deepEqual(family, before);
});
test('Explizit verwaltete Mehrpartner- und alternative Elternansichten bleiben maßgeblich', () => {
  const family = twoBranches();
  family.partnerships[0].extensions = { chartAlignPartnerOverChildrenPersonId: 'guest' };
  assert.equal(createFamilyChartAppearanceLayout(family), family);
});
test('Jede lokale Partnerschaft hat einen getrennten Knoten und die Kinder hängen am richtigen Knoten', () => {
  const positions = new Map([['a', { x: 0, y: 0 }], ['b', { x: 430, y: 0 }], ['c', { x: -430, y: 0 }], ['child', { x: 215, y: 326 }]]);
  const nodes = planFamilyChartPartnershipNodes({ partnerships: ['b', 'c'].map(id => ({ firstId: 'a', secondId: id, first: positions.get('a'), second: positions.get(id), type: 'affair' })), cardPositions: positions });
  assert.equal(nodes.length, 2);
  assert.notEqual(nodes[0].center.x, nodes[1].center.x);
  const route = createFamilyChartNativeLinkRoute({ source: [{ data: { id: 'a' } }, { data: { id: 'b' } }], target: { data: { id: 'child' } } }, positions, 'vertical', [], nodes);
  assert.deepEqual(route.route[0], nodes.find(node => node.secondId === 'b').exit);
});
test('Zeitangaben und Status stammen aus der Partnerschaft; eine Ehereihenfolge wird nicht erfunden', () => {
  assert.deepEqual(presentPartnership({ type: 'marriage', status: 'ended', start: '1700', end: '1710' }), { label: 'Ehe', status: 'Beendet', period: '1700–1710' });
  assert.equal(presentPartnership({ type: 'affair', start: '????' }).period, '');
  assert.equal(presentPartnership({ type: 'marriage' }).label, 'Ehe');
});
