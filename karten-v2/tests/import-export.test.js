import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExportPackage, toGeoJson, validateImportPackage } from '../src/editor/import-export.js';

const MAP_DEFINITION = { id: 'cenyr-celtigerns-wacht', title: 'Celtigerns Wacht' };

function samplePointFeature(overrides = {}) {
  return {
    schemaVersion: 1,
    id: 'pt-1',
    mapId: 'cenyr-celtigerns-wacht',
    kind: 'PointFeature',
    type: 'settlement',
    name: 'Gwynthor',
    geometry: { type: 'Point', coordinates: [1420, 730] },
    visibility: 'public',
    tags: ['Hauptstadt'],
    table: [{ k: 'Bevoelkerung', v: '4000' }],
    ...overrides,
  };
}

test('buildExportPackage produces a self-describing envelope with the given features', () => {
  const pkg = buildExportPackage(MAP_DEFINITION, { pointFeatures: [samplePointFeature()], regionFeatures: [], routeFeatures: [] });
  assert.equal(pkg.type, 'aleria-karten-v2-export');
  assert.equal(pkg.mapId, 'cenyr-celtigerns-wacht');
  assert.equal(pkg.features.pointFeatures.length, 1);
  assert.ok(pkg.exportedAt);
});

test('export -> import round trip preserves geometry and metadata for a valid package', () => {
  const original = samplePointFeature();
  const pkg = buildExportPackage(MAP_DEFINITION, { pointFeatures: [original], regionFeatures: [], routeFeatures: [] });

  // Simulate writing to disk and reading back (JSON round trip).
  const reparsed = JSON.parse(JSON.stringify(pkg));
  const result = validateImportPackage(reparsed, 'cenyr-celtigerns-wacht');

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.pointFeatures.length, 1);
  assert.deepEqual(result.pointFeatures[0].geometry, original.geometry);
  assert.equal(result.pointFeatures[0].name, original.name);
  assert.deepEqual(result.pointFeatures[0].table, original.table);
});

test('validateImportPackage rejects a package for the wrong map', () => {
  const pkg = buildExportPackage(MAP_DEFINITION, { pointFeatures: [samplePointFeature()], regionFeatures: [], routeFeatures: [] });
  const result = validateImportPackage(pkg, 'some-other-map');
  assert.ok(result.errors.some((message) => message.includes('gehoert zu Karte')));
});

test('validateImportPackage rejects an unrecognised envelope type', () => {
  const result = validateImportPackage({ type: 'something-else', schemaVersion: 1, features: {} }, 'cenyr-celtigerns-wacht');
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('Unbekannter Dateityp')));
});

test('validateImportPackage rejects an unsupported schema version', () => {
  const pkg = buildExportPackage(MAP_DEFINITION, { pointFeatures: [samplePointFeature()], regionFeatures: [], routeFeatures: [] });
  pkg.schemaVersion = 999;
  const result = validateImportPackage(pkg, 'cenyr-celtigerns-wacht');
  assert.ok(result.errors.some((message) => message.includes('Schema-Version')));
});

test('validateImportPackage skips individually invalid features but keeps the valid ones, with an error message per skipped feature', () => {
  const good = samplePointFeature({ id: 'pt-good' });
  const bad = samplePointFeature({ id: 'pt-bad', geometry: { type: 'Point', coordinates: ['not-a-number', 1] } });
  const pkg = buildExportPackage(MAP_DEFINITION, { pointFeatures: [good, bad], regionFeatures: [], routeFeatures: [] });
  const result = validateImportPackage(pkg, 'cenyr-celtigerns-wacht');
  assert.equal(result.pointFeatures.length, 1);
  assert.equal(result.pointFeatures[0].id, 'pt-good');
  assert.ok(result.errors.some((message) => message.includes('pt-bad') || message.includes('Gwynthor')));
});

test('toGeoJson wraps point features into a valid FeatureCollection preserving coordinates', () => {
  const geojson = toGeoJson([samplePointFeature()]);
  assert.equal(geojson.type, 'FeatureCollection');
  assert.equal(geojson.features.length, 1);
  assert.equal(geojson.features[0].type, 'Feature');
  assert.deepEqual(geojson.features[0].geometry.coordinates, [1420, 730]);
});
