import test from 'node:test';
import assert from 'node:assert/strict';
import { auditChartGeometrySnapshot } from '../assets/js/modules/chart-quality/chart-geometry-audit.js';

const card = (id, x, y) => ({ id, left: x - 160, right: x + 160, top: y - 106.5, bottom: y + 106.5 });
function connectedFamily() {
  return {
    cards: [card('a', 0, 0), card('b', 430, 0), card('child', 215, 326)],
    labels: [{ id: 'union', left: 115, right: 315, top: 118.5, bottom: 150.5, relatedIds: ['a', 'b'] }],
    routes: [
      { id: 'pair', relatedIds: ['a', 'b'], points: [{ x: 0, y: 106.5 }, { x: 0, y: 134.5 }, { x: 430, y: 134.5 }, { x: 430, y: 106.5 }] },
      { id: 'child', relatedIds: ['a', 'b', 'child'], points: [{ x: 215, y: 150.5 }, { x: 215, y: 219.5 }] }
    ]
  };
}
test('Ein zusammenhängendes Paar mit Beziehungsknoten und Kind besteht die Geometrieprüfung', () => {
  assert.equal(auditChartGeometrySnapshot(connectedFamily()).passed, true);
});
test('Freie Enden werden auch dann erkannt, wenn keine fremde Karte geschnitten wird', () => {
  const snapshot = connectedFamily();
  snapshot.routes[1].points[1] = { x: 215, y: 700 };
  assert.ok(auditChartGeometrySnapshot(snapshot).issues.some(issue => issue.code === 'FLOATING_ENDPOINT'));
});
test('Eine fremde kreuzende Linie gilt nicht als Abstammungsanschluss', () => {
  const snapshot = connectedFamily();
  snapshot.routes.push({ id: 'foreign', relatedIds: ['other'], points: [{ x: -300, y: 180 }, { x: 800, y: 180 }] });
  snapshot.routes[1].points[1] = { x: 215, y: 180 };
  assert.ok(auditChartGeometrySnapshot(snapshot).issues.some(issue => issue.code === 'FLOATING_ENDPOINT' && issue.ids[0] === 'child'));
});
test('Kollidierende Beschriftungen, verdeckte Karten und abgetrennte Beschriftungen werden gemeldet', () => {
  const snapshot = connectedFamily();
  snapshot.labels.push({ ...snapshot.labels[0], id: 'collision' }, { ...snapshot.labels[0], id: 'over-card', top: -16, bottom: 16, left: -100, right: 100 }, { ...snapshot.labels[0], id: 'detached', left: 900, right: 1100 });
  const codes = new Set(auditChartGeometrySnapshot(snapshot).issues.map(issue => issue.code));
  assert.ok(codes.has('LABEL_OVERLAP'));
  assert.ok(codes.has('LABEL_CARD_OVERLAP'));
  assert.ok(codes.has('DETACHED_LABEL'));
});
test('Verweispaare brauchen genau zwei gegenseitig passende Gegenstellen', () => {
  const snapshot = connectedFamily();
  snapshot.labels[0] = { ...snapshot.labels[0], referenceCode: 'V1', personId: 'a', targetId: 'b' };
  assert.ok(auditChartGeometrySnapshot(snapshot).issues.some(issue => issue.code === 'INCOMPLETE_REFERENCE_PAIR'));
  snapshot.labels.push({ ...snapshot.labels[0], id: 'other-reference', left: 900, right: 1100, personId: 'b', targetId: 'wrong' });
  assert.ok(auditChartGeometrySnapshot(snapshot).issues.some(issue => issue.code === 'INCOMPLETE_REFERENCE_PAIR'));
  snapshot.labels[1].targetId = 'a';
  assert.equal(auditChartGeometrySnapshot(snapshot).issues.some(issue => issue.code === 'INCOMPLETE_REFERENCE_PAIR'), false);
});
test('Eine eigens angelegte Partnerdarstellung darf nicht wieder zur Fernbeziehung werden', () => {
  const snapshot = connectedFamily();
  snapshot.cards[0].appearanceRole = 'partnership-participant';
  snapshot.cards[0].partnershipId = 'union';
  snapshot.labels[0] = { ...snapshot.labels[0], referenceCode: 'V1', personId: 'a', targetId: 'b' };
  assert.ok(auditChartGeometrySnapshot(snapshot).issues.some(issue => issue.code === 'SEPARATED_PARTNERSHIP_APPEARANCE'));
});
