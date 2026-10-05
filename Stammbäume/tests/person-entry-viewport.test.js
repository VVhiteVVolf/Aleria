import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveFamilyChartEntryFocus, resolveFamilyChartEntryMainId, resolveFamilyChartInitialViewport } from '../assets/js/adapters/family-chart-viewport-policy.js';

const family = { document: { id: 'haus-pendrag' }, persons: [{ id: 'uther-1643-pendrag' }] };

test('Personenlinks wechseln auch bei getrennten Zweigen nicht zu einer Einzelansicht', () => {
  const data = [
    { id: 'tudur', rels: { children: ['rhy'] } },
    { id: 'rhy', rels: { parents: ['tudur'] } },
    { id: 'awen', rels: {} }
  ];
  const before = structuredClone(data);
  assert.equal(resolveFamilyChartEntryMainId(data, 'tudur', 'awen'), 'tudur');
  assert.equal(resolveFamilyChartEntryMainId(data, 'tudur', 'rhy'), 'tudur');
  assert.equal(resolveFamilyChartEntryMainId(data, 'tudur', 'unbekannt'), 'tudur');
  assert.equal(resolveFamilyChartEntryMainId(data, 'tudur'), 'tudur');
  assert.deepEqual(data, before);
});

test('Ein gültiger Personenlink verändert die eingepasste Gesamtansicht nicht', () => {
  const before = JSON.stringify(family);
  const entryPersonId = resolveFamilyChartEntryFocus(family, { familyId: 'haus-pendrag', personId: 'uther-1643-pendrag' });
  assert.equal(entryPersonId, 'uther-1643-pendrag');
  assert.equal(resolveFamilyChartInitialViewport({ fittedScale: 0.8, entryPersonId }), null);
  assert.equal(JSON.stringify(family), before);
});

test('Ungültige Personen und andere Familien übernehmen den Linkfokus nicht', () => {
  for (const entryFocus of [null, { familyId: 'haus-pendrag', personId: 'unbekannt' }, { familyId: 'haus-draig', personId: 'uther-1643-pendrag' }]) {
    assert.equal(resolveFamilyChartEntryFocus(family, entryFocus), '');
  }
});

test('Auch große Bäume und alte Fokuseinstellungen starten vollständig eingepasst', () => {
  assert.equal(resolveFamilyChartInitialViewport({ fittedScale: 0.8 }), null);
  assert.equal(resolveFamilyChartInitialViewport({ fittedScale: 0.1 }), null);
  assert.equal(resolveFamilyChartInitialViewport({ chartViewport: { initialPosition: 'focus', initialScale: 0.6 } }), null);
});
