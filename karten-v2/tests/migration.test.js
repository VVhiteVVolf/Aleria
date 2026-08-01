import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  legacyPinToPointFeature,
  legacyCategoryToFeatureCategory,
  legacyMarkerToMarkerCatalogItem,
  migrateLegacyExport,
} from '../src/data/legacy-adapter.js';

// The legacy Karten module stores pin positions as 0..1 fractions of the
// loaded map image's natural pixel size (see docs/LEGACY_AUDIT.md section
// 4). These fixtures use the *real* measured Celtigerns Wacht dimensions
// (4096x3072, see docs/LEGACY_AUDIT.md section 3) but synthetic pin data,
// since no real pin export exists offline (see MIGRATION_REPORT.md).
const TARGET_MAP = { id: 'cenyr-celtigerns-wacht', width: 4096, height: 3072 };

test('legacyPinToPointFeature converts fractional 0..1 coordinates to real map pixels', () => {
  const legacyPin = { id: 'p1', x: 0.5, y: 0.25, title: 'Gwynthor', cat: 'cat-1', table: [], secret: false };
  const feature = legacyPinToPointFeature(legacyPin, TARGET_MAP);
  assert.deepEqual(feature.geometry, { type: 'Point', coordinates: [2048, 768] });
  assert.equal(feature.name, 'Gwynthor');
  assert.equal(feature.categoryId, 'cat-1');
  assert.equal(feature.mapId, 'cenyr-celtigerns-wacht');
  assert.equal(feature.visibility, 'public');
});

test('legacyPinToPointFeature maps secret:true to gm-only visibility', () => {
  const feature = legacyPinToPointFeature({ id: 'p2', x: 0, y: 0, title: 'Geheimversteck', secret: true }, TARGET_MAP);
  assert.equal(feature.visibility, 'gm-only');
});

test('legacyPinToPointFeature preserves the free-form info table and lore text', () => {
  const legacyPin = {
    id: 'p3',
    x: 0.1,
    y: 0.1,
    title: 'Taverne zur Wyrm',
    table: [{ k: 'Besitzer', v: 'Rhonwen' }],
    text: 'Eine **berühmte** Taverne.',
  };
  const feature = legacyPinToPointFeature(legacyPin, TARGET_MAP);
  assert.deepEqual(feature.table, [{ k: 'Besitzer', v: 'Rhonwen' }]);
  assert.equal(feature.description, 'Eine **berühmte** Taverne.');
});

test('legacyPinToPointFeature throws on missing/invalid coordinates (caller collects into a failure report instead of crashing)', () => {
  assert.throws(() => legacyPinToPointFeature({ id: 'bad', title: 'Ohne Position' }, TARGET_MAP));
});

test('legacyPinToPointFeature falls back to a placeholder title for an untitled pin', () => {
  const feature = legacyPinToPointFeature({ id: 'p4', x: 0, y: 0 }, TARGET_MAP);
  assert.equal(feature.name, 'Unbekannter Ort');
});

test('legacyCategoryToFeatureCategory keeps id/label/color and only includes marker when present', () => {
  const withMarker = legacyCategoryToFeatureCategory({ id: 'c1', label: 'Hauptstadt', color: '#ff0000', marker: 'https://example/x.png' });
  assert.deepEqual(withMarker, { id: 'c1', label: 'Hauptstadt', color: '#ff0000', marker: 'https://example/x.png' });

  const withoutMarker = legacyCategoryToFeatureCategory({ id: 'c2', label: 'Taverne', color: '#b03030' });
  assert.deepEqual(withoutMarker, { id: 'c2', label: 'Taverne', color: '#b03030' });
  assert.equal('marker' in withoutMarker, false);
});

test('legacyMarkerToMarkerCatalogItem keeps id/url/name and optional group', () => {
  const item = legacyMarkerToMarkerCatalogItem({ id: 'm1', url: 'https://i.imgur.com/x.png', name: 'Lager', group: 'Lager' });
  assert.deepEqual(item, { id: 'm1', url: 'https://i.imgur.com/x.png', name: 'Lager', group: 'Lager' });
});

test('migrateLegacyExport converts a full legacy export and reports failed/skipped entries without throwing', () => {
  const legacyExport = {
    pins: [
      { id: 'p1', x: 0.5, y: 0.5, title: 'Gwynthor', cat: 'c1', table: [] },
      { id: 'p2', title: 'Kaputter Pin ohne Position' }, // invalid -> should be reported, not thrown
    ],
    cats: [
      { id: 'c1', label: 'Hauptstadt', color: '#ff0000' },
      { id: 'c2', label: 'Kaputte Kategorie' }, // missing color -> skipped
    ],
    markerCatalog: [{ id: 'm1', url: 'https://i.imgur.com/x.png', name: 'Lager' }],
  };
  const report = migrateLegacyExport(legacyExport, TARGET_MAP);
  assert.equal(report.pointFeatures.length, 1);
  assert.equal(report.pointFeatures[0].name, 'Gwynthor');
  assert.equal(report.failed.length, 1);
  assert.equal(report.failed[0].id, 'p2');
  assert.equal(report.categories.length, 1);
  assert.equal(report.skipped.length, 1);
  assert.equal(report.markerCatalog.length, 1);
});

test('migrateLegacyExport handles a completely empty export gracefully', () => {
  const report = migrateLegacyExport({}, TARGET_MAP);
  assert.deepEqual(report.pointFeatures, []);
  assert.deepEqual(report.failed, []);
});
