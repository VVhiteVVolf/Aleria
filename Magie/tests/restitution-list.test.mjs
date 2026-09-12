import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { listSpellCatalogEntries } from '../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { renderSpellListPage } from '../modules/spell-list/spell-list-template.mjs';

test('Restitution page is generated, linked from the learned schools and has no executable revival placeholders', async () => {
  const pageUrl = new URL('../restitution/index.html', import.meta.url);
  const page = await readFile(pageUrl, 'utf8');
  assert.equal(page, renderSpellListPage(listSpellCatalogEntries({ catalog: 'restitution' })));
  assert.equal((page.match(/data-spell data-section=/g) || []).length, 46);
  assert.equal((page.match(/data-spell-section aria-labelledby=/g) || []).length, 6);
  assert.equal((page.match(/\?zauberkatalog=restitution-/g) || []).length, 46);
  assert.match(page, /<h1>Restitution<\/h1>/);
  assert.match(page, /Magie \/ Die gelehrten Schulen/);
  assert.doesNotMatch(page, /Aktuelle Vorlage im Archiv öffnen|\bon(?:click|input|change)=/);
  const pending = page.match(/<details class="spell-pending"[\s\S]*?<\/details>/)[0];
  assert.doesNotMatch(pending, /data-spell|zauberkatalog=|\bopen\b/);
  assert.match(pending, /Rückruf des letzten Funkens/);
  for (const [, path] of page.matchAll(/(?:src|href)="([^"#?]+)"/g)) await access(new URL(path, pageUrl));
  const parent = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(parent.match(/<details[^>]+id="restitution"[\s\S]*?<\/details>/)[0], /href="restitution\/index.html"/);
});
