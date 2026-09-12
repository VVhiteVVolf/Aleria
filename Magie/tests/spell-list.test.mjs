import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { listSpellCatalogEntries } from '../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { renderSpellListPage } from '../modules/spell-list/spell-list-template.mjs';

test('spell page stays generated from the archive catalog, with 72 deep links and seven sections', async () => {
  const pageUrl = new URL('../elementarismus/index.html', import.meta.url);
  const page = await readFile(pageUrl,'utf8');
  assert.equal(page, renderSpellListPage(listSpellCatalogEntries()));
  assert.equal((page.match(/data-spell data-section=/g)||[]).length,72);
  assert.equal((page.match(/data-spell-section aria-labelledby=/g)||[]).length,7);
  assert.equal((page.match(/\?zauberkatalog=elementarismus-/g)||[]).length,72);
  assert.doesNotMatch(page,/\bon(?:click|input|change)=/);
  for(const match of page.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
    if(match[1].startsWith('#')) continue;
    await access(new URL(match[1],pageUrl));
  }
  const parent = await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(parent,/href="elementarismus\/index.html"/);
});
