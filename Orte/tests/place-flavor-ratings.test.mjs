import assert from 'node:assert/strict';
import test from 'node:test';
import { groupFlavorBlocks } from '../modules/flavor/place-flavor.mjs';
import { parseMerchantRating } from '../modules/merchants/merchant-ratings.mjs';

test('Flavorszenen behalten jeden Absatz und enden vor der nächsten normalen Rubrik', () => {
  const blocks = Object.freeze([
    'Einleitung',
    Object.freeze({ type: 'subheading', text: 'Sorgen am Tresen', flavor: true }),
    'Die Tür knarrt.',
    'Maldwyn: „Willkommen.“',
    Object.freeze({ type: 'subheading', text: 'Verwaltung' }),
    'Der Bürgermeister verwaltet das Dorf.',
  ]);
  const result = groupFlavorBlocks(blocks);
  assert.deepEqual(result, [blocks[0], {
    type: 'scene', text: 'Sorgen am Tresen', paragraphs: [blocks[2], blocks[3]],
  }, blocks[4], blocks[5]]);
  assert.equal(blocks.length, 6);
});

test('Unmarkierte Überschriften und Listen werden unverändert weitergegeben', () => {
  const blocks = [{ type: 'subheading', text: 'Geschichte' }, 'Chronik', { type: 'list', items: ['A', 'B'] }];
  assert.deepEqual(groupFlavorBlocks(blocks), blocks);
});

test('Händlerbewertungen bewahren die Fünferskala; Textbewertungen bleiben Text', () => {
  for (const source of ['★★☆☆☆', '✤✤✧✧✧', '✣✣✧✧✧']) {
    assert.deepEqual(parseMerchantRating(source), { value: 2, total: 5 });
  }
  assert.deepEqual(parseMerchantRating('☆☆☆☆☆'), { value: 0, total: 5 });
  assert.deepEqual(parseMerchantRating('★★★★★'), { value: 5, total: 5 });
  for (const source of ['Legendär', 'Osttor & Hafen', '★★', '', null, 0]) assert.equal(parseMerchantRating(source), null);
});
