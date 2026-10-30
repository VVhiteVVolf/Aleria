import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';

const directory = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/', import.meta.url);
const read = file => JSON.parse(readFileSync(new URL(file, directory), 'utf8'));
const { state } = read('data.json');
const pin = id => state.pins.find(pin => pin.id === id);
const node = id => state.dominions.find(node => node.id === id);

test('corrected source symbols retain unique IDs and their reviewed locations', () => {
  const review = read('marker-position-review.json');
  const inventory = read('markings.inventory.json');
  assert.equal(state.pins.length, 170);
  assert.equal(new Set(state.pins.map(pin => pin.id)).size, 170);
  assert.equal(review.corrections.length, 21);
  for (const correction of review.corrections) {
    const marking = inventory.markings.find(marking => marking.id === correction.id);
    assert.deepEqual(marking.bounds, correction.newBounds, correction.id);
    assert.deepEqual([pin(correction.id).x, pin(correction.id).y], correction.newPosition, correction.id);
    assert.notDeepEqual(correction.oldPosition, correction.newPosition, correction.id);
    assert.equal(marking.categoryId, correction.categoryId);
  }
  assert.ok(review.corrections.some(correction => correction.categoryId === 'location-koehlerei'));
  assert.ok(review.corrections.some(correction => correction.categoryId === 'location-hexenhuette'));
});

test('known house crests and allegiance chains follow existing family records', () => {
  const review = read('house-affiliation-review.json');
  assert.equal(review.pins.length, 23);
  for (const item of review.pins) {
    const record = getRegisteredFamily(item.familyId), place = pin(item.pinId);
    assert.equal(place.crest, `/Stammbäume/${record.family.document.emblem}`);
    assert.ok(existsSync(new URL('../../'+place.crest.slice(1), import.meta.url)), place.crest);
    assert.match(place.region, /Llamreis Ankunft/);
    if (item.familyId === 'haus-arwydd') {
      assert.equal(place.dominionId, '');
      continue;
    }
    const ownNode = node(place.dominionId);
    assert.ok(ownNode, item.pinId);
    if (record.houseProfile.liegeHouseName) {
      assert.equal(node(ownNode.parentId).ruler, record.houseProfile.liegeHouseName, item.pinId);
    }
  }
  assert.equal(pin('gwynthor-marking-041').dominionId, 'cw-haus-penrudd');
  assert.equal(pin('gwynthor-marking-080').dominionId, 'cw-haus-penrudd');
  assert.equal(pin('gwynthor-marking-138').house, 'Familie Twyllod');
  assert.match(pin('gwynthor-marking-138').crestLink, /family=haus-twyllod/);
  assert.deepEqual([pin('gwynthor-marking-138').x, pin('gwynthor-marking-138').y], [.9609375, .6537460317460319]);
  assert.equal(node('cw-haus-bradrhith').parentId, 'cw-haus-awenydd');
  assert.equal(node('cw-haus-tlawd').parentId, 'msa3c53vomlanj');
  assert.equal(node('cw-haus-loer').parentId, 'msa3c53viyll7z');
  assert.equal(pin('gwynthor-marking-058').dominionId, 'cw-haus-tlawd');
  assert.equal(pin('gwynthor-marking-169').dominionId, 'msa3c53viyll7z');
  assert.ok(!state.pins.some(pin => /Gwendolyn/.test(pin.region)));
});
