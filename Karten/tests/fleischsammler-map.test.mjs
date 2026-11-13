import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { projectStilleEinkehrOriginalPins } from './support/stille-einkehr-pin-history.mjs';
import { projectHalenrhydOriginalPins } from './support/halenrhyd-pin-history.mjs';

const directory = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/', import.meta.url);
const read = file => JSON.parse(readFileSync(new URL(file, directory), 'utf8'));
const data = read('data.json');
const source = read('fleischsammler-localities.source.json');
const area = read('fleischsammler-area.source.json');
const inventory = read('markings.inventory.json');
const pin = suffix => data.state.pins.find(pin => pin.id === `gwynthor-marking-${suffix}`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('seven marked places keep all reviewed coordinates and distinct resident families', () => {
  assert.equal(source.locations.length, 7);
  assert.equal(data.state.pins.length, 170);
  assert.equal(new Set(data.state.pins.map(pin => pin.id)).size, 170);
  assert.equal(new Set(source.locations.flatMap(location => location.patch.residentFamilyIds)).size, 8);
  for (const location of source.locations) {
    const actual = data.state.pins.find(pin => pin.id === location.pinId);
    assert.deepEqual([actual.x, actual.y], location.position, location.pinId);
    assert.deepEqual(actual.residentFamilyIds, location.patch.residentFamilyIds);
    assert.match(actual.crest, /\/Gwynthor\/fleischsammler\/haus-[a-z]+\.png$/);
    assert.match(actual.crestLink, /Stammbaum\.html\?family=haus-/);
  }
  assert.deepEqual(pin('074').residentFamilyIds, ['haus-bragwen', 'haus-eiddfer']);
});

test('the screenshot assignments distinguish the hunting house from the northern home', () => {
  assert.equal(pin('091').title, 'Caer Ysgellfor');
  assert.equal(pin('091').cat, 'location-festung');
  assert.match(pin('091').text, /Rhydric Argall/);
  assert.match(pin('091').text, /vollkommen überfordert/);
  assert.match(pin('091').text, /Getreide.*Vorräte/s);
  assert.equal(pin('115').title, 'Jagdhaus Helfaen');
  assert.match(pin('115').text, /Kleinwild/);
  assert.equal(pin('086').title, 'Brynial-Kate');
  assert.equal(pin('118').title, 'Dolweth-Kate');
  assert.match(pin('118').text, /achtzehnjährige Tochter/);
  assert.match(pin('086').text, /Ehefrau und Mutter/);
  assert.match(pin('074').text, /Kooperationsbetrieb der Teyrngarch Brauerzunft/);
});

test('the horse family lives in Gwynthor and serves Wyrm without a new territorial node', () => {
  const stable = pin('092');
  assert.deepEqual(stable.residentFamilyIds, ['haus-marchwern']);
  assert.match(stable.text, /Ceffyl/);
  assert.match(stable.text, /Rhyfel/);
  assert.match(stable.faction, /Haus Wyrm/);
  assert.match(stable.region, /Gwynthor/);
  assert.ok(!data.state.dominions.some(node => node.id === 'cw-haus-marchwern'));
});

test('the native circular area includes every selected source symbol in full', () => {
  assert.deepEqual([area.width, area.height], [8192, 6300]);
  assert.equal(area.radius * 2, 2048);
  assert.deepEqual(new Set(area.pinIds), new Set(source.locations.map(location => location.pinId)));
  for (const pinId of area.pinIds) {
    const [left, top, right, bottom] = inventory.markings.find(marking => marking.id === pinId).bounds;
    for (const x of [left, right]) for (const y of [top, bottom]) {
      assert.ok(Math.hypot(x - area.center.x, y - area.center.y) < area.radius, pinId);
    }
  }
  assert.doesNotMatch(JSON.stringify(area), /Skelett|Ritual|Geliebte|Opfer|Tochter/iu);
});

test('the focused admission preserves every other pin and all map metadata', () => {
  const changedIds = new Set(source.locations.map(location => location.pinId));
  const { pins, ...stateMetadata } = data.state;
  const { revision, updatedAt, state, ...documentMetadata } = data;
  // The later, independently sourced Pert admission fills one formerly empty
  // farm. Project only that acknowledged patch back to its retained original
  // before checking this earlier seven-location admission's boundary.
  const pert = read('pert-maesglas.source.json');
  const earlierPins = projectStilleEinkehrOriginalPins(projectHalenrhydOriginalPins(pins))
    .map(pin => pin.id === pert.pinId ? pert.originalPin : pin);
  const preservation = source.publicationPreservation || source.preservation;
  assert.equal(hash(earlierPins.filter(pin => !changedIds.has(pin.id))), preservation.untouchedPinsSha256);
  assert.equal(hash(stateMetadata), preservation.stateMetadataSha256);
  assert.equal(hash(documentMetadata), preservation.documentMetadataSha256);
  assert.ok(revision > preservation.originalRevision);
  assert.notEqual(updatedAt, preservation.originalUpdatedAt);
});

test('the later two Halenrhyd locations remain exact and cannot hide another map edit', () => {
  const projected = projectHalenrhydOriginalPins(data.state.pins);
  const originals = read('halenrhyd.source.json').publicProjection.originalPins;
  for (const original of originals) assert.deepEqual(projected.find(pin => pin.id === original.id), original);
  const changed = structuredClone(data.state.pins);
  changed.find(pin => pin.id === 'gwynthor-marking-063').text += ' Unreviewed edit.';
  assert.throws(() => projectHalenrhydOriginalPins(changed));
  assert.deepEqual(projected.filter(pin => !originals.some(original => original.id === pin.id)),
    data.state.pins.filter(pin => !originals.some(original => original.id === pin.id)));
});
