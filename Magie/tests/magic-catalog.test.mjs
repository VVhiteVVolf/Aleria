import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, access } from 'node:fs/promises';
import { normalizeMagicSearch, matchesMagicEntry } from '../modules/catalog/magic-catalog-model.mjs';

const pageUrl = new URL('../index.html', import.meta.url);
const html = await readFile(pageUrl, 'utf8');

test('Suche behandelt Umlaute, Umschriften, Großschreibung und mehrere Wörter gleich', () => {
  assert.equal(normalizeMagicSearch('  GÖTTLICH · äußere Kraft '), 'goettlich aeussere kraft');
  const entry = { tradition: 'bound', text: 'Göttliche Verbindung · Gunst und Paktträger' };
  assert.equal(matchesMagicEntry(entry, { query: 'pakttraeger GOETTLICHE' }), true);
  assert.equal(matchesMagicEntry(entry, { query: 'Gunst unbekannt' }), false);
  assert.equal(matchesMagicEntry(entry, { query: 'Gunst', tradition: 'druidic' }), false);
  assert.equal(matchesMagicEntry(entry, { tradition: 'bound' }), true);
});

test('Überlieferte Suchbegriffe führen zum heutigen Eintrag', () => {
  const entry = { tradition: 'bound', text: 'Lunara Zwielicht Azura Mond' };
  assert.equal(matchesMagicEntry(entry, { query: 'azura' }), true);
  assert.equal(matchesMagicEntry(entry, { query: 'Lunara' }), true);
  assert.equal(matchesMagicEntry(entry, { query: '<script>' }), false);
});

test('Alle Kapitelverweise und lokalen Assets der ausgelieferten Seite existieren', async () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'IDs müssen eindeutig sein');
  const references = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  for (const reference of references) {
    if (reference.startsWith('#')) assert.ok(ids.includes(reference.slice(1)), reference);
    else {
      assert.doesNotMatch(reference, /^https?:/, 'Der Codex benötigt keine externen Ressourcen');
      await access(new URL(reference, pageUrl));
    }
  }
});

test('Die vollständigen Traditionen stehen bereits im HTML ohne JavaScript', () => {
  const sections = [...html.matchAll(/<section[^>]+data-tradition="([^"]+)"[\s\S]*?<\/section>/g)];
  const counts = Object.fromEntries(sections.map(match => [match[1], (match[0].match(/data-magic-entry/g) || []).length]));
  assert.deepEqual(counts, { learned: 11, druidic: 7, bound: 2 });
  assert.doesNotMatch(html, /\bon(?:click|input|change)\s*=/i);
});
