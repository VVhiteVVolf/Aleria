import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const review = JSON.parse(readFileSync(new URL('./chamois-estate-pin.review.json', import.meta.url), 'utf8'));

export function projectChamoisOriginalPin(pins) {
  const { before, after } = review;
  const matches = pins.filter(pin => pin.id === before.id);
  assert.deepEqual(matches, [{ ...after, img: '', imgLink: '' }], 'Castell Chamois may restore only the reviewed estate pin.');
  for (const key of ['id', 'x', 'y', 'cat', 'templateId', 'house']) assert.equal(after[key], before[key], key);
  return pins.map(pin => pin.id === before.id ? structuredClone(before) : pin);
}
