import test from 'node:test';
import assert from 'node:assert/strict';
import {
  planFamilyChartConnectionReferences,
  findFamilyChartConnectionReference,
  familyChartReferenceParentAnchor
} from '../assets/js/adapters/family-chart-connection-references.js';
import { collectFamilyChartJunctions } from '../assets/js/adapters/family-chart-junction-renderer.js';
import { createFamilyChartCardHtml } from '../assets/js/adapters/family-chart-card-renderer.js';
import {
  createFamilyChartNativeLinkRoute,
  selectFamilyChartNativeLinkRoute,
  createFamilyChartParentageGroupRoutes,
  createFamilyChartLinkRenderer,
  isFamilyChartNativeLinkActive
} from '../assets/js/adapters/family-chart-link-renderer.js';
import { countOrthogonalRouteCardIntersections } from '../assets/js/adapters/family-chart-route-geometry.js';
import { changeFamilyChartZoom } from '../assets/js/adapters/family-chart-zoom.js';
import { updateFamilyChartLayoutBounds } from '../assets/js/adapters/family-chart-layout-bounds.js';
import { applyFamilyChartSpacingGuard } from '../assets/js/adapters/family-chart-spacing-guard.js';
import { applyFamilyChartReferenceSpacing } from '../assets/js/adapters/family-chart-reference-spacing.js';

function pair(first, second, options = {}) {
  return { firstId: 'a', secondId: 'b', first, second, type: 'affair', ...options };
}

test('Fernbeziehungen erhalten genau zwei benannte Verweise und behalten die Personen-IDs', () => {
  const partnership = pair({ x: 0, y: 0 }, { x: 2300, y: 0 }, { firstName: 'Vater', secondName: 'Mutter' });
  const before = structuredClone(partnership);
  const references = planFamilyChartConnectionReferences({ partnerships: [partnership, partnership], cardPositions: new Map() });
  assert.equal(references.length, 1);
  assert.equal(references[0].code, 'V1');
  assert.deepEqual(references[0].badges.map(badge => badge.personId), ['a', 'b']);
  assert.equal(references[0].firstName, 'Vater');
  assert.equal(references[0].secondName, 'Mutter');
  assert.deepEqual(partnership, before);
  assert.equal(findFamilyChartConnectionReference(references, ['b', 'a'], [partnership.second, partnership.first]), references[0]);
  assert.deepEqual(familyChartReferenceParentAnchor(references[0], { x: 2300, y: 326 }), references[0].badges[1].exit);
});

test('Verweise gehören zur konkreten Kartenerscheinung und veröffentlichen keine verborgene Beziehung', () => {
  const first = pair({ x: 0, y: 0 }, { x: 2000, y: 0 });
  const references = planFamilyChartConnectionReferences({ partnerships: [first, { ...first, hidden: true }], cardPositions: new Map() });
  assert.equal(references.length, 1);
  assert.equal(findFamilyChartConnectionReference(references, ['a', 'b'], [{ x: 50, y: 326 }, first.second]), undefined);
  assert.equal(planFamilyChartConnectionReferences({ partnerships: [{ ...first, hidden: true }], cardPositions: new Map() }).length, 0);
});

test('Normale Paare und örtliche Dreiergruppen behalten ihre Linien', () => {
  const positions = new Map([['inner', { x: 352, y: 0 }]]);
  assert.equal(planFamilyChartConnectionReferences({ partnerships: [pair({ x: 0, y: 0 }, { x: 704, y: 0 })], cardPositions: positions }).length, 0);
  positions.set('other', { x: 704, y: 0 });
  assert.equal(planFamilyChartConnectionReferences({ partnerships: [pair({ x: 0, y: 0 }, { x: 1056, y: 0 })], cardPositions: positions }).length, 1);
});

test('Mehrere Fernpartner bekommen getrennte Anschlussstellen an derselben Karte', () => {
  const references = planFamilyChartConnectionReferences({ partnerships: [
    pair({ x: 0, y: 0 }, { x: 2000, y: 0 }),
    pair({ x: 0, y: 0 }, { x: -2000, y: 0 }, { secondId: 'c' })
  ], cardPositions: new Map() });
  const centers = references.flatMap(reference => reference.badges).filter(badge => badge.personId === 'a').map(badge => badge.center.y);
  assert.equal(new Set(centers).size, 2);
  assert.ok(Math.abs(centers[0] - centers[1]) >= 28);
});

test('Kinder einer örtlichen Mehrpartnerbeziehung beginnen an der tatsächlichen Paarspur', () => {
  const positions = new Map([
    ['a', { x: 0, y: 0 }], ['inner', { x: 352, y: 0 }],
    ['b', { x: 704, y: 0 }], ['child', { x: 704, y: 326 }]
  ]);
  const result = createFamilyChartNativeLinkRoute({ source: [{ data: { id: 'a' } }, { data: { id: 'b' } }], target: { data: { id: 'child' } } }, positions);
  assert.ok(result.route[0].y > 106.5, 'Der Ursprung liegt auf der Paarspur unter den Karten, nicht in der fremden Partnerkarte.');
  assert.equal(countOrthogonalRouteCardIntersections([result.route], positions, result.relatedCardIds).length, 0);
});

test('Kinder einer Fernbeziehung schließen zusammenhängend an den passenden Elternverweis an', () => {
  const positions = new Map([['a', { x: 0, y: 0 }], ['b', { x: 2300, y: 0 }], ['child', { x: 2300, y: 326 }]]);
  const references = planFamilyChartConnectionReferences({ partnerships: [pair(positions.get('a'), positions.get('b'))], cardPositions: positions });
  const routes = createFamilyChartParentageGroupRoutes({ parentIds: ['a', 'b'], childIds: ['child'] }, positions, 'vertical', references);
  assert.deepEqual(routes[0][0], references[0].badges[1].exit);
  assert.equal(routes[0].at(-1).x, routes[1][0].x);
  assert.deepEqual(routes.at(-1).at(-1), positions.get('child'));
});

test('Eine verschobene Karte darf auch bei einer neuen Kollision keinen alten freien Linienanker behalten', () => {
  const positions = new Map([['parent', { x: 200, y: 0 }], ['child', { x: 200, y: 652 }], ['obstacle', { x: 200, y: 326 }]]);
  const result = selectFamilyChartNativeLinkRoute({ d: [[-800, 0], [-800, 652]], source: { data: { id: 'parent' }, x: 200, y: 0 }, target: { data: { id: 'child' }, x: 200, y: 652 } }, positions);
  assert.equal(result.route[0].x, 200);
  assert.equal(result.route.at(-1).x, 200);
  assert.notEqual(result.strategy, 'native-valid');
  assert.equal(countOrthogonalRouteCardIntersections([result.route], positions, result.relatedCardIds).length, 0);
});

test('Einpassen umfasst die endgültigen Kartenpositionen einschließlich Rand und Kartenmaßen', () => {
  const tree = { dim: { width: 10, height: 10 }, data: [
    { x: -2000, y: 300, data: { id: 'a' } }, { x: 3000, y: 900, data: { id: 'b' } },
    { x: -99999, y: -99999, data: { data: { aleria: { virtualType: 'overview-root' } } } }
  ] };
  const originalDimensions = tree.dim;
  const bounds = updateFamilyChartLayoutBounds(tree);
  assert.equal(tree.dim, originalDimensions);
  assert.equal(bounds.width, 5000 + 320 + 128);
  assert.equal(bounds.height, 600 + 213 + 128);
  assert.equal(bounds.x_off, 2000 + 160 + 64);
  assert.deepEqual(tree.dim, bounds);
});

test('Kollidierende Kinder verschiedener Partnerschaften werden innerhalb ihres gemeinsamen Vorfahren getrennt', () => {
  const family = {
    persons: ['father', 'mother-a', 'mother-b', 'child-a', 'child-b'].map(id => ({ id })),
    partnerships: [{ id: 'pair-a', participantIds: ['father', 'mother-a'] }, { id: 'pair-b', participantIds: ['father', 'mother-b'] }],
    parentages: [
      { childId: 'child-a', partnershipId: 'pair-a', parentIds: ['father', 'mother-a'] },
      { childId: 'child-b', partnershipId: 'pair-b', parentIds: ['father', 'mother-b'] }
    ]
  };
  const tree = { data: [
    { x: 0, y: 0, data: { id: 'father' } }, { x: -430, y: 0, data: { id: 'mother-a' } }, { x: 430, y: 0, data: { id: 'mother-b' } },
    { x: 0, y: 326, data: { id: 'child-a' } }, { x: 176, y: 326, data: { id: 'child-b' } }
  ] };
  const result = applyFamilyChartSpacingGuard({ tree, family, maximumScale: 1 });
  assert.equal(result.remainingCollisions.length, 0);
  assert.equal(result.scale, 1);
  assert.ok(result.localResolutions.every(resolution => resolution.movedNodeIds.length === 1));
});

test('Nur wirkliche Abzweige innerhalb derselben Abstammungsgruppe erhalten einen Knotenpunkt', () => {
  const records = [
    { groupId: 'parents', points: [{ x: 0, y: 0 }, { x: 0, y: 100 }], relatedCardIds: ['a'] },
    { groupId: 'parents', points: [{ x: -100, y: 100 }, { x: 100, y: 100 }], relatedCardIds: ['b'] },
    { groupId: 'unrelated', points: [{ x: 50, y: 0 }, { x: 50, y: 200 }], relatedCardIds: ['c'] }
  ];
  assert.deepEqual(collectFamilyChartJunctions(records).map(junction => junction.point), [{ x: 0, y: 100 }]);
});

test('Uneheliche und legitimierte Herkunft sind lesbar und die Karte ist per Tastatur erreichbar', () => {
  const html = createFamilyChartCardHtml({ data: { data: { name: '<Name>', role: 'bastard', roleLabel: 'Außerhalb der Ehe', legitimacy: 'legitimized' } } });
  assert.match(html, /Legitimiert/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /&lt;Name&gt;/);
});

test('Zoom verwendet die bestehende Chart-Kamera und verändert keine Person oder Wurzel', () => {
  const calls = [];
  const canvas = { __zoomObj: { scaleBy: () => {} } };
  const selection = { interrupt() { return this; }, call(...args) { calls.push(args); } };
  const runtime = { d3: { zoomTransform: () => ({ k: 0.5 }), select: element => { assert.equal(element, canvas); return selection; } } };
  assert.equal(changeFamilyChartZoom({ querySelector: () => canvas }, runtime, 1.3), true);
  assert.equal(calls[0][1], 1.3);
  assert.equal(changeFamilyChartZoom({ querySelector: () => canvas }, runtime, -1), false);
});

test('Vor einem Bibliotheksupdate verlassen nur die eigenen Zusatzlinien den nativen Daten-Join', () => {
  const extra = { removed: false, remove() { this.removed = true; } };
  const native = { dataset: {}, removed: false, remove() { this.removed = true; } };
  const container = {
    dataset: {},
    querySelectorAll(selector) {
      if (selector === '.aleria-extra-link, .aleria-line-junction') return [extra];
      if (selector.includes('path.link:not')) return [native];
      return [];
    }
  };
  const renderer = createFamilyChartLinkRenderer({ container, resolveMetadata: () => null });
  renderer.prepareUpdate();
  assert.equal(extra.removed, true);
  assert.equal(native.removed, false);
  renderer.destroy();
});

test('Viele benannte Fernpartner bekommen Platz über der nächsten Generation, ohne die Zweige auseinanderzuziehen', () => {
  const core = { x: 0, y: 0, data: { id: 'core' } };
  const partners = [1, 2, 3, 4, 5].map(index => ({ x: index * 2000, y: 0, data: { id: `partner-${index}` } }));
  const child = { x: 0, y: 326, data: { id: 'child' } };
  const tree = { data: [core, ...partners, child] };
  const family = { partnerships: partners.map(partner => ({ participantIds: ['core', partner.data.id], type: 'affair' })) };
  const reservations = applyFamilyChartReferenceSpacing({ tree, family });
  assert.equal(reservations.length, 1);
  assert.equal(core.y, 0);
  assert.ok(child.y > 326);
  assert.equal(child.x, 0);
  const references = planFamilyChartConnectionReferences({ partnerships: partners.map(partner => pair(core, partner, { firstId: 'core', secondId: partner.data.id })), cardPositions: new Map() });
  const lastBadge = Math.max(...references.flatMap(reference => reference.badges).filter(badge => badge.personId === 'core').map(badge => badge.exit.y));
  assert.ok(child.y - 106.5 >= lastBadge + 16);
});

test('Auslaufende Linien werden anhand ihrer konkreten Hierarchieknoten erkannt, auch bei gleichen Personen-IDs', () => {
  const parent = { data: { id: 'parent' } }, child = { data: { id: 'child' } };
  const nodes = new Set([parent, child]);
  assert.equal(isFamilyChartNativeLinkActive({ source: [parent, parent], target: child }, nodes), true);
  assert.equal(isFamilyChartNativeLinkActive({ source: { data: { id: 'parent' } }, target: child }, nodes), false);
});
