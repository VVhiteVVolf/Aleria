import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { readReligionCatalog, entrySymbolPath } from '../../Religionen/modules/content/content-repository.mjs';
import { getMagicDomainCircles } from '../modules/domains/magic-domain-repository.mjs';
import { MAGIC_DOMAIN_ASSIGNMENTS } from '../modules/domains/magic-domain-assignments.mjs';
import { renderMagicDomains } from '../modules/domains/magic-domain-template.mjs';

const catalog = readReligionCatalog();

test('Jede Haupt-, souveräne und Untergottheit der beiden Kreise besitzt genau eine Domäne', () => {
  const circles = getMagicDomainCircles(catalog);
  assert.deepEqual(circles.map(circle => circle.count), [19, 15]);
  const entries = circles.flatMap(circle => circle.groups.flatMap(group => group.entries));
  assert.equal(new Set(entries.map(entry => entry.id)).size, 34);
  assert.equal(entries.find(entry => entry.id === 'adar').kind, 'Kosmische Entität');
  assert.match(entries.find(entry => entry.id === 'adar').note, /außerhalb einer eindeutigen Zuordnung/);
  assert.match(entries.find(entry => entry.id === 'ordan').href, /Religionen\/gottheiten\/goettliche\/ordan\/index.html$/);
  assert.equal(entries.some(entry => ['arkeon', 'asphyra', 'balor'].includes(entry.id)), false);
  for (const entry of entries) {
    assert.equal(entry.symbol, `../${entrySymbolPath(catalog.entries.find(deity => deity.id === entry.id))}`);
  }
});

test('Fehlende und verwaiste Domänenzuordnungen werden beim Bauen erkannt', () => {
  const missing = { ...MAGIC_DOMAIN_ASSIGNMENTS };
  delete missing.ordan;
  assert.throws(() => getMagicDomainCircles(catalog, missing), /ordan/);
  assert.throws(() => getMagicDomainCircles(catalog, { ...MAGIC_DOMAIN_ASSIGNMENTS, unbekannt: { domain: 'Test', aspect: 'Test' } }), /unbekannt/);
});

test('Das ausgelieferte Register enthält den vollständigen aktuellen Religionsabgleich', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const generated = renderMagicDomains(getMagicDomainCircles(catalog));
  assert.ok(html.replace(/\r\n/g, '\n').includes(generated));
  assert.equal((generated.match(/data-magic-domain>/g) || []).length, 34);
  assert.equal((generated.match(/class="magic-domain-symbol"/g) || []).length, 34);
  assert.equal((generated.match(/class="magic-domain-placeholder"/g) || []).length, 0);
  assert.doesNotMatch(generated, /<details[^>]+\sopen(?:\s|>)/);
});
