import test from 'node:test';
import assert from 'node:assert/strict';
import { createProposalDraft } from '../Ishtaran/proposal-draft.mjs';
import { renderProposalNames, renderEmblems } from '../Ishtaran/proposal-render.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const catalogs = { cityNames: [{ id: 'city-a' }], houseNames: [{ id: 'house-a' }], emblems: [{ id: 'crest-a' }] };

test('Ishtaran-Merkliste speichert Auswahl und Notizen ohne Quelldaten zu ändern', () => {
  const before = structuredClone(catalogs);
  const draft = createProposalDraft(catalogs);
  draft.toggle('cityNames', 'city-a');
  draft.toggle('houseNames', 'house-a');
  draft.toggle('emblems', 'crest-a');
  draft.setNotes('Stadtnamen erst später zuordnen.');
  const restored = createProposalDraft(catalogs);
  restored.restore(JSON.parse(draft.serialize()), { recordHistory: false });
  assert.deepEqual(restored.current(), draft.current());
  assert.equal(restored.canUndo(), false);
  assert.deepEqual(catalogs, before);
  const copy = draft.current(); copy.favorites.cityNames.length = 0;
  assert.deepEqual(draft.current().favorites.cityNames, ['city-a']);
  assert.equal(draft.reset(), true);
  assert.deepEqual(draft.current().favorites, { cityNames: [], houseNames: [], emblems: [] });
  assert.equal(draft.undo(), true);
  assert.equal(draft.current().notes, 'Stadtnamen erst später zuordnen.');
});

test('fremde, unbekannte, doppelte und unvollständige Importe werden atomar abgelehnt', () => {
  const draft = createProposalDraft(catalogs);
  draft.toggle('houseNames', 'house-a');
  const before = draft.current();
  for (const mutate of [
    value => { value.realm = 'venalys'; },
    value => { value.kind = 'placements'; },
    value => { value.schemaVersion = 2; },
    value => { delete value.favorites.cityNames; },
    value => { value.favorites.emblems = ['unknown']; },
    value => { value.favorites.houseNames = ['house-a', 'house-a']; },
    value => { value.favorites.cityNames = 'city-a'; },
    value => { value.notes = 'x'.repeat(10001); }
  ]) {
    const value = JSON.parse(draft.serialize()); mutate(value);
    assert.throws(() => draft.restore(value));
    assert.deepEqual(draft.current(), before);
  }
  assert.equal(draft.undo(), true);
  assert.deepEqual(draft.current().favorites.houseNames, []);
  assert.equal(draft.canUndo(), false);
});

test('Vorschlagsdarstellung escaped Namen und Notizen; Originalquellen bleiben außerhalb des Deploys', () => {
  const html = renderProposalNames([{ id: 'a', name: '<script>alert(1)</script>', group: 'Vorschläge', note: '<img onerror="bad()">' }], 'cityNames');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<img onerror'));
  const crest = renderEmblems([{ id: 'b', name: 'Wappen', image: 'assets/b.webp', motif: '<unsafe>', colors: ['Blau', 'Weiß'] }]);
  assert.ok(crest.includes('&lt;unsafe&gt;'));
  assert.equal(shouldPublish('Vorschau/Ishtaran/sources/confirmed-lore-notes.md'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets.source.json'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/warrior-art-direction.mjs'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/scripts/prepare_warriors.py'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/warriors/manifest.json'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/warriors/production/nefer.png'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/warriors/previews/derwisch.webp'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/warriors/production/ghulam.png'), true);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/warriors/previews/ghulam.webp'), true);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/warriors/production/source-03.png'), true);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/warriors/previews/pool-01.webp'), true);
  assert.equal(shouldPublish('Vorschau/Ishtaran/warrior-data.mjs'), true);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/emblems/generated/maghneach.png'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/emblems/generated-archive/maghneach-v1.png'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/emblems/alternates/maghneach.png'), false);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/emblems/production/maghneach.png'), true);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/emblems/previews/maghneach.webp'), true);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/source/source-01.png'), true);
  assert.equal(shouldPublish('Vorschau/Ishtaran/assets/production/maghneach.png'), true);
});
