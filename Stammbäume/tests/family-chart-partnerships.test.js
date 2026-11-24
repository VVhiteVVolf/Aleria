import test from 'node:test';
import assert from 'node:assert/strict';
import { createFamilyChartPersonAppearancePlan } from '../assets/js/adapters/family-chart-person-appearance-router.js';
import { createFamilyChartAppearanceLayout } from '../assets/js/adapters/family-chart-appearance-layout.js';
import { planFamilyChartPartnershipNodes } from '../assets/js/adapters/family-chart-partnership-nodes.js';
import { createFamilyChartNativeLinkRoute } from '../assets/js/adapters/family-chart-link-renderer.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { selectCollisionAwareRail } from '../assets/js/adapters/family-chart-route-geometry.js';
import { collectFamilyChartLineCrossings } from '../assets/js/adapters/family-chart-line-crossings.js';
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

test('Eine frühere Affäre und eine spätere Ehe behalten getrennte Verbindungen für dieselben Personen', () => {
  const family = {
    persons: [{ id: 'a', sex: 'male' }, { id: 'b', sex: 'female' },
      { id: 'x', sex: 'female', familyRole: 'bastard' }, { id: 'y', sex: 'male' }],
    partnerships: [{ id: 'affair', participantIds: ['a', 'b'], type: 'affair' },
      { id: 'marriage', participantIds: ['a', 'b'], type: 'marriage' }],
    parentages: [{ childId: 'x', parentIds: ['a', 'b'], partnershipId: 'affair' },
      { childId: 'y', parentIds: ['a', 'b'], partnershipId: 'marriage' }]
  };
  const original = structuredClone(family);
  const chart = toFamilyChartData(family);
  const appearance = chart.data.find(card => card.data.nodeKind === 'person-appearance');
  assert.equal(appearance.data.aleria.personId, 'b');
  assert.equal(chart.getPartnershipLine('a', appearance.id).partnershipId, 'affair');
  assert.equal(chart.getPartnershipLine('a', 'b').partnershipId, 'marriage');
  assert.deepEqual(chart.data.find(card => card.id === 'x').rels.parents, ['a', appearance.id]);
  assert.deepEqual(chart.data.find(card => card.id === 'y').rels.parents, ['a', 'b']);
  assert.deepEqual(family, original);
  family.partnerships[0].visibility = 'secret';
  family.parentages[0].visibility = 'secret';
  const publicChart = toFamilyChartData(family, { publicOnly: true });
  assert.ok(!publicChart.data.some(card => card.data.nodeKind === 'person-appearance'));
  assert.equal(publicChart.getPartnershipLine('a', 'b').partnershipId, 'marriage');
  assert.ok(!Object.hasOwn(publicChart, 'preparedLayout'));
});

test('Automatische Mehrpartnergruppen haben je einen sichtbaren Elternanschluss pro Paar', () => {
  const family = twoBranches();
  family.parentages = family.parentages.slice(2);
  const chart = toFamilyChartData(family);
  const groups = chart.extraParentageLines.filter(route => route.kind === 'parentage-group');
  assert.deepEqual(groups.map(group => [group.partnershipId, group.parentIds, group.childIds]), [
    ['union-one', ['first', 'guest'], ['one']],
    ['union-two', ['second', 'guest'], ['two']]
  ]);
});

test('Bei mehreren Beziehungen bleibt eine nachgewiesene Elternschaft ohne zugeordnete Verbindung eigenständig', () => {
  const family = { persons: ['a', 'b', 'c'].map(id => ({ id })),
    partnerships: [{ id: 'affair', participantIds: ['a', 'b'], type: 'affair' },
      { id: 'marriage', participantIds: ['a', 'b'], type: 'marriage' }],
    parentages: [{ childId: 'c', parentIds: ['a', 'b'], type: 'biological' }] };
  const chart = toFamilyChartData(family);
  assert.equal(chart.getParentageLine('c').hidden, true);
  assert.deepEqual(chart.extraParentageLines.filter(line => line.childId === 'c').map(line => line.parentIds), [['a'], ['b']]);
  assert.deepEqual(chart.data.find(card => card.id === 'c').rels.parents, ['a', 'b']);
});

test('Benachbarte Kinderlinien können die Höhe einer bereits belegten Linie umgehen', () => {
  const selected = selectCollisionAwareRail({ parentGeneration: 0, childGeneration: 326,
    cardPositions: new Map(), parentHalfSize: 0, avoidRailCoordinates: [163],
    buildRoutes: height => [[{ x: 0, y: height }, { x: 200, y: height }]] });
  assert.ok(Math.abs(selected.railCoordinate - 163) >= 10);
  assert.deepEqual(selected.hitCardIds, []);
});

test('Individuelle Abstammungsstile bleiben an den einzelnen Abzweigen erhalten', () => {
  const family = twoBranches();
  family.parentages = family.parentages.slice(2);
  family.persons.push({ id: 'three', sex: 'female', familyRole: 'bastard' });
  family.parentages.push({ childId: 'three', partnershipId: 'union-one', parentIds: ['first', 'guest'] });
  const chart = toFamilyChartData(family);
  const group = chart.extraParentageLines.find(route => route.partnershipId === 'union-one');
  assert.deepEqual(group.childIds, ['one', 'three']);
  assert.equal(group.dashed, false);
  assert.equal(group.childStyles[0].dashed, false);
  assert.equal(group.childStyles[1].dashed, true);
  assert.equal(group.childStyles[1].color, chart.getParentageLine('three').color);
});

test('Ein gemeinsamer Elternteil macht Kreuzungen verschiedener Beziehungen nicht zu Abzweigungen', () => {
  const routes = [
    { id: 'a', partnershipId: 'main', type: 'biological', relatedCardIds: ['parent', 'older'],
      points: [{ x: 50, y: 0 }, { x: 50, y: 140 }] },
    { id: 'b', partnershipId: 'other', type: 'biological', relatedCardIds: ['parent', 'younger'],
      points: [{ x: 0, y: 80 }, { x: 120, y: 80 }] }
  ];
  assert.equal(collectFamilyChartLineCrossings(routes).length, 1);
  assert.equal(collectFamilyChartLineCrossings([routes[0], { ...routes[1],
    points: [{ x: 50, y: 0 }, { x: 120, y: 0 }] }]).length, 0);
});
