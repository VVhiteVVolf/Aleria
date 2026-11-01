import test from 'node:test';
import assert from 'node:assert/strict';
import { projectHouseArmorSources } from '../scripts/source-pages/house-armor-source.mjs';

const registered = (id, extra = {}) => ({ id, name: `Familie ${id}`, location: 'Cenyr · Celtigerns Wacht · Gwynthor', tree: `tree:${id}`, illustrationIds: [], ...extra });

test('new unillustrated families enter the registry without inventing an armor image or source', () => {
  const sources = projectHouseArmorSources([registered('existing'), registered('new')], [{ ...registered('existing'), generated: true, file: 'approved.png' }]);
  const added = sources.find(house => house.id === 'new');
  assert.equal(added.generated, false);
  assert.equal(added.file, undefined);
  assert.equal(added.sourceImage, '');
  assert.equal(added.sourceIllustrationId, '');
  assert.equal(added.regionId, 'celtigerns-wacht');
  assert.deepEqual(sources.map(house => house.id), ['existing', 'new']);
});

test('explicit approved artwork and source assignments survive a registry metadata refresh', () => {
  const image = { id: 'existing', name: 'Früherer Anzeigename', location: 'Früherer Ort', tree: 'old-tree',
    generated: true, file: 'approved.png', sourceImage: 'original.png', sourceIllustrationId: 'chosen',
    prompt: 'Reviewed prompt', regionId: 'celtigerns-wacht', sha256: 'kept' };
  const before = structuredClone(image), current = registered('existing');
  const [result] = projectHouseArmorSources([current, registered('outside', { location: 'Venalys' })], [image]);
  assert.equal(result.name, current.name);
  assert.equal(result.location, current.location);
  assert.equal(result.tree, current.tree);
  for (const key of ['generated', 'file', 'sourceImage', 'sourceIllustrationId', 'prompt', 'regionId', 'sha256']) assert.deepEqual(result[key], before[key]);
  assert.deepEqual(image, before);
});

test('orphaned or ambiguous image assignments stay explicit errors instead of being silently discarded', () => {
  assert.throws(() => projectHouseArmorSources([], [{ id: 'old', generated: true }]), /old.*Quellen und Bilder erhalten/);
  assert.throws(() => projectHouseArmorSources([registered('same'), registered('same')], []), /Doppelte Haus-ID/);
  assert.throws(() => projectHouseArmorSources([registered('same')], [{ id: 'same' }, { id: 'same' }]), /Doppelte Haus-ID/);
});
