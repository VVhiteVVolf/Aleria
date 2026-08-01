import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toLeafletLatLng,
  fromLeafletLatLng,
  mapImageBounds,
  isWithinMapBounds,
  roundMapPoint,
} from '../src/core/coordinate-system.js';

const TOP_LEFT_MAP = { width: 4096, height: 3072, coordinateOrigin: 'top-left' };
const BOTTOM_LEFT_MAP = { width: 100, height: 50, coordinateOrigin: 'bottom-left' };

test('top-left origin: top-left corner (0,0) maps to lat 0, lng 0', () => {
  assert.deepEqual(toLeafletLatLng(TOP_LEFT_MAP, { x: 0, y: 0 }), { lat: 0, lng: 0 });
});

test('top-left origin: top-right corner maps to lat 0, lng = width', () => {
  assert.deepEqual(toLeafletLatLng(TOP_LEFT_MAP, { x: 4096, y: 0 }), { lat: 0, lng: 4096 });
});

test('top-left origin: bottom-left corner maps to lat = -height, lng 0', () => {
  assert.deepEqual(toLeafletLatLng(TOP_LEFT_MAP, { x: 0, y: 3072 }), { lat: -3072, lng: 0 });
});

test('top-left origin: bottom-right corner maps to lat = -height, lng = width', () => {
  assert.deepEqual(toLeafletLatLng(TOP_LEFT_MAP, { x: 4096, y: 3072 }), { lat: -3072, lng: 4096 });
});

test('top-left origin: map centre maps to lat = -height/2, lng = width/2', () => {
  assert.deepEqual(toLeafletLatLng(TOP_LEFT_MAP, { x: 2048, y: 1536 }), { lat: -1536, lng: 2048 });
});

test('bottom-left origin: origin corner (0,0) maps to lat 0, lng 0', () => {
  assert.deepEqual(toLeafletLatLng(BOTTOM_LEFT_MAP, { x: 0, y: 0 }), { lat: 0, lng: 0 });
});

test('bottom-left origin: top-left image corner (y=height) maps to lat = height', () => {
  assert.deepEqual(toLeafletLatLng(BOTTOM_LEFT_MAP, { x: 0, y: 50 }), { lat: 50, lng: 0 });
});

test('bottom-left origin: top-right image corner maps to lat = height, lng = width', () => {
  assert.deepEqual(toLeafletLatLng(BOTTOM_LEFT_MAP, { x: 100, y: 50 }), { lat: 50, lng: 100 });
});

test('bottom-left origin: bottom-right corner maps to lat 0, lng = width', () => {
  assert.deepEqual(toLeafletLatLng(BOTTOM_LEFT_MAP, { x: 100, y: 0 }), { lat: 0, lng: 100 });
});

test('round trip: fromLeafletLatLng(toLeafletLatLng(p)) equals p for arbitrary points (top-left)', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 4096, y: 3072 },
    { x: 1234.5, y: 987.25 },
    { x: 0.001, y: 3071.999 },
  ];
  for (const p of points) {
    const back = fromLeafletLatLng(TOP_LEFT_MAP, toLeafletLatLng(TOP_LEFT_MAP, p));
    assert.equal(back.x, p.x, `x mismatch for ${JSON.stringify(p)}`);
    assert.equal(back.y, p.y, `y mismatch for ${JSON.stringify(p)}`);
  }
});

test('round trip: fromLeafletLatLng(toLeafletLatLng(p)) equals p for arbitrary points (bottom-left)', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 100, y: 50 },
    { x: 33.3, y: 12.7 },
  ];
  for (const p of points) {
    const back = fromLeafletLatLng(BOTTOM_LEFT_MAP, toLeafletLatLng(BOTTOM_LEFT_MAP, p));
    assert.equal(back.x, p.x);
    assert.equal(back.y, p.y);
  }
});

test('fromLeafletLatLng accepts a [lat, lng] tuple as well as {lat,lng}', () => {
  const fromObject = fromLeafletLatLng(TOP_LEFT_MAP, { lat: -1536, lng: 2048 });
  const fromTuple = fromLeafletLatLng(TOP_LEFT_MAP, [-1536, 2048]);
  assert.deepEqual(fromObject, fromTuple);
});

test('negative / out-of-range map coordinates still convert without throwing (pure math, no clamping)', () => {
  assert.deepEqual(toLeafletLatLng(TOP_LEFT_MAP, { x: -50, y: -20 }), { lat: 20, lng: -50 });
  assert.deepEqual(toLeafletLatLng(TOP_LEFT_MAP, { x: 5000, y: 4000 }), { lat: -4000, lng: 5000 });
});

test('invalid (non-numeric) map coordinates throw', () => {
  assert.throws(() => toLeafletLatLng(TOP_LEFT_MAP, { x: 'a', y: 1 }));
  assert.throws(() => toLeafletLatLng(TOP_LEFT_MAP, { x: NaN, y: 1 }));
  assert.throws(() => fromLeafletLatLng(TOP_LEFT_MAP, { lat: undefined, lng: 1 }));
});

test('unknown coordinateOrigin throws a clear error', () => {
  assert.throws(
    () => toLeafletLatLng({ width: 10, height: 10, coordinateOrigin: 'center' }, { x: 0, y: 0 }),
    /Unbekannter coordinateOrigin/,
  );
});

test('mapImageBounds returns exact image-covering bounds for top-left origin', () => {
  assert.deepEqual(mapImageBounds(TOP_LEFT_MAP), [[-3072, 0], [0, 4096]]);
});

test('mapImageBounds returns exact image-covering bounds for bottom-left origin', () => {
  assert.deepEqual(mapImageBounds(BOTTOM_LEFT_MAP), [[0, 0], [50, 100]]);
});

test('mapImageBounds throws for invalid dimensions', () => {
  assert.throws(() => mapImageBounds({ width: 0, height: 10, coordinateOrigin: 'top-left' }));
  assert.throws(() => mapImageBounds({ width: 10, height: -1, coordinateOrigin: 'top-left' }));
});

test('isWithinMapBounds correctly classifies points inside/outside the map', () => {
  assert.equal(isWithinMapBounds(TOP_LEFT_MAP, { x: 0, y: 0 }), true);
  assert.equal(isWithinMapBounds(TOP_LEFT_MAP, { x: 4096, y: 3072 }), true);
  assert.equal(isWithinMapBounds(TOP_LEFT_MAP, { x: 2048, y: 1536 }), true);
  assert.equal(isWithinMapBounds(TOP_LEFT_MAP, { x: -1, y: 0 }), false);
  assert.equal(isWithinMapBounds(TOP_LEFT_MAP, { x: 0, y: 3073 }), false);
  assert.equal(isWithinMapBounds(TOP_LEFT_MAP, { x: 4097, y: 0 }), false);
});

test('roundMapPoint rounds to whole pixels by default without mutating the input', () => {
  const p = { x: 12.345, y: 6.789 };
  const rounded = roundMapPoint(p);
  assert.deepEqual(rounded, { x: 12, y: 7 });
  assert.deepEqual(p, { x: 12.345, y: 6.789 }, 'original point must be untouched');
});

test('roundMapPoint supports a decimals argument', () => {
  assert.deepEqual(roundMapPoint({ x: 12.345, y: 6.789 }, 1), { x: 12.3, y: 6.8 });
});
