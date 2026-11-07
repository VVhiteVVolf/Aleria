import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = JSON.parse(readFileSync(new URL('../../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/stille-einkehr.source.json', import.meta.url), 'utf8'));
const identities = [
  { id: 'gwynthor-marking-060', position: [0.77001953125, 0.2758730158730159], category: 'location-ahnenbaum', template: 'natur', title: 'Ahnenbaum des Fionnbharr' },
  { id: 'gwynthor-marking-065', position: [0.738037109375, 0.30391111111111113], category: 'location-heiligtum', template: 'institution', title: 'Asketenkloster der Stillen Einkehr' }
];
const ids = identities.map(item => item.id).sort();
const fields = ['region', 'table', 'text', 'title'];

// Only this separately reviewed two-pin admission may be reconstructed for
// older, unchanged whole-map preservation hashes. The current full pins must
// first equal their retained originals plus the four approved text fields.
export function projectStilleEinkehrOriginalPins(pins, admission = source) {
  assert(Array.isArray(pins));
  assert.equal(admission.mapId, 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis');
  assert.equal(admission.publicProjection?.baseCommit, '9f33049750f6620162e93493721b036f76219373');
  const originals = admission.publicProjection.originalPins;
  assert.equal(admission.locations?.length, 2);
  assert.equal(originals?.length, 2);
  assert.deepEqual(admission.locations.map(item => item.id).sort(), ids);
  assert.deepEqual(originals.map(item => item.id).sort(), ids);
  for (const identity of identities) {
    const location = admission.locations.find(item => item.id === identity.id);
    const original = originals.find(item => item.id === identity.id);
    const actual = pins.filter(item => item.id === identity.id);
    assert.equal(actual.length, 1, identity.id + ': exactly one current pin');
    assert.deepEqual(location.position, identity.position);
    assert.deepEqual([original.x, original.y], identity.position);
    assert.equal(original.cat, identity.category);
    assert.equal(original.templateId, identity.template);
    assert.deepEqual(Object.keys(location.patch).sort(), fields);
    assert.equal(location.patch.title, identity.title);
    assert.deepEqual(actual[0], { ...original, ...location.patch }, identity.id + ': only the reviewed text admission is projectable');
  }
  const byId = new Map(originals.map(item => [item.id, item]));
  return pins.map(pin => byId.has(pin.id) ? structuredClone(byId.get(pin.id)) : pin);
}
