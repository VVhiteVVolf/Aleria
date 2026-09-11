import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveFamilyChartEntryFocus, resolveFamilyChartInitialViewport } from '../assets/js/adapters/family-chart-viewport-policy.js';

const family = { document: { id: 'haus-pendrag' }, persons: [{ id: 'uther-1643-pendrag' }] };

test('Ein gültiger Personenlink erhält einen lesbaren Fokus, auch in kleinen Stammbäumen', () => {
  const before = JSON.stringify(family);
  const entryPersonId = resolveFamilyChartEntryFocus(family, { familyId: 'haus-pendrag', personId: 'uther-1643-pendrag' });
  assert.equal(entryPersonId, 'uther-1643-pendrag');
  assert.deepEqual(resolveFamilyChartInitialViewport({ fittedScale: 0.8, entryPersonId }), {
    mode: 'focus', scale: 0.55, reason: 'person-link'
  });
  assert.equal(JSON.stringify(family), before);
});

test('Ungültige Personen und andere Familien übernehmen den Linkfokus nicht', () => {
  for (const entryFocus of [null, { familyId: 'haus-pendrag', personId: 'unbekannt' }, { familyId: 'haus-draig', personId: 'uther-1643-pendrag' }]) {
    assert.equal(resolveFamilyChartEntryFocus(family, entryFocus), '');
  }
});

test('Ohne Personenlink bleiben bisherige Startansichten erhalten', () => {
  assert.equal(resolveFamilyChartInitialViewport({ fittedScale: 0.8 }), null);
  assert.equal(resolveFamilyChartInitialViewport({ fittedScale: 0.1 }).reason, 'oversized-tree');
  assert.equal(resolveFamilyChartInitialViewport({ chartViewport: { initialPosition: 'focus', initialScale: 0.6 } }).scale, 0.6);
});
