import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HOF_MAP_IMAGE, HOF_MAP_LINK } from '../../modules/tirfelyn-hof/hof-map.mjs';

const history = JSON.parse(readFileSync(new URL('../fixtures/tirfelyn-hof-parent-pin-before-20261115.json', import.meta.url), 'utf8'));

// Older map hashes predate this explicitly approved photo/link replacement.
// Verify the whole current pin first, then project only its two image fields.
// Text stays current so the existing locality-source checks still validate it.
export function projectTirfelynOriginalPinImages(pins) {
  assert.equal(history.referenceCommit, '62baf5153f62b8846676cc394b64a5c145e4309a');
  const original = history.originalPin;
  assert.equal(original.id, 'gwynthor-marking-107');
  const current = pins.filter(pin => pin.id === original.id);
  assert.equal(current.length, 1);
  assert.deepEqual(current[0], { ...original,
    img: '/Karten/' + HOF_MAP_IMAGE, imgLink: HOF_MAP_LINK,
    text: original.text + `\n\n[URL=${HOF_MAP_LINK}]Ortskarte des Tirfelyn-Hofs öffnen[/URL]` });
  return pins.map(pin => pin.id === original.id ? { ...pin, img: original.img, imgLink: original.imgLink } : pin);
}

export function projectTirfelynOriginalPins(pins) {
  return projectTirfelynOriginalPinImages(pins).map(pin => pin.id === history.originalPin.id ? structuredClone(history.originalPin) : pin);
}
