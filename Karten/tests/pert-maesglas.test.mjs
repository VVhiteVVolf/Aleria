import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const directory = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/', import.meta.url);
const read = file => JSON.parse(readFileSync(new URL(file, directory), 'utf8'));
const data = read('data.json');
const source = read('pert-maesglas.source.json');
const pin = data.state.pins.find(pin => pin.id === source.pinId);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Maesglas fills the reviewed existing farm without creating or moving a marker', () => {
  assert.equal(data.state.pins.length, 170);
  assert.equal(new Set(data.state.pins.map(pin => pin.id)).size, 170);
  assert.equal(source.pinId, 'gwynthor-marking-157');
  assert.deepEqual([pin.x, pin.y], [0.17822265625, 0.7861714285714286]);
  assert.deepEqual([pin.x, pin.y], source.position);
  assert.equal(pin.cat, source.originalPin.cat);
  assert.equal(pin.templateId, 'landwirtschaft');
  assert.equal(pin.title, 'Hof Maesglas');
  const marking = read('markings.inventory.json').markings.find(item => item.id === pin.id);
  // The native inventory uses the canonical type while this old map keeps its
  // existing category ID and label (Einfacher Hof). Preserve both contracts.
  assert.equal(marking.categoryId, 'location-bauernhof');
  assert.ok(source.selectionEvidence.excludes.includes('gwynthor-marking-147'));
});

test('the farm uses canonical Pert identity, house and tree links with active images', () => {
  const record = getRegisteredFamily('pert');
  assert.ok(record);
  assert.deepEqual(pin.residentFamilyIds, ['pert']);
  assert.equal(pin.crest, `/Stammbäume/${record.family.document.emblem}`);
  assert.match(pin.crestLink, /Stammbaum\.html\?family=pert&mode=view$/);
  assert.match(pin.imgLink, /kleinehaeuser\.html\?haus=pert$/);
  for (const image of [pin.img, pin.crest, pin.banner]) assert.ok(existsSync(new URL(image.slice(1), root)), image);
  for (const role of source.personnel) {
    const person = record.family.persons.find(person => person.id === role.personId);
    assert.ok(person, role.personId);
    assert.equal(person.name, role.name);
    assert.equal(person.worldPersonId, role.worldPersonId);
  }
});

test('responsibilities, history and open farm quantities follow the supplied source', () => {
  const table = Object.fromEntries(pin.table.map(row => [row.k, row.v]));
  assert.equal(table.Besitzer, 'Geraint Pert');
  assert.match(table['Haushalt / Hofalltag'], /Bethan/);
  assert.match(table['Rinder / Milch'], /Sioned/);
  assert.match(table['Pferde / Stallungen'], /Donnchadh/);
  assert.equal(table.Anbau, 'Ackerbau · einzelne Kulturen nicht benannt');
  assert.equal(table.Fläche, 'Nicht überliefert');
  assert.equal(table['Versorgung / Abnehmer'], 'Nicht näher benannt');
  assert.match(pin.text, /Mared Maesglas/);
  assert.match(pin.text, /Idwal/);
  assert.match(pin.text, /Haus Draig/);
  assert.match(pin.text, /Rinder.*Milch/s);
  assert.match(pin.text, /Pferde.*Stallungen/s);
  assert.doesNotMatch(pin.text, /\d+\s*(?:Hektar|Morgen|Rinder|Pferde|Kupfer|Silber|Gold)/i);
  assert.ok(!pin.dominionId, 'A family service relationship creates no new territorial dominion');
  assert.deepEqual(Object.fromEntries(Object.keys(source.patch).map(key => [key, pin[key]])), source.patch);
});

test('every unrelated pin and map setting remains byte-equivalent in its JSON model', () => {
  const { pins, ...metadata } = data.state;
  assert.equal(hash(pins.filter(item => item.id !== source.pinId)), source.preservation.untouchedPinsSha256);
  assert.equal(hash(metadata), source.preservation.stateMetadataSha256);
  const { revision, updatedAt, state, ...documentMetadata } = data;
  assert.equal(hash(documentMetadata), source.preservation.documentMetadataSha256);
  assert.ok(revision > source.preservation.originalRevision);
  assert.notEqual(updatedAt, source.preservation.originalUpdatedAt);
});
