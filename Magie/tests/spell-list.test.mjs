import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { listSpellCatalogEntries } from '../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { renderSpellListPage } from '../modules/spell-list/spell-list-template.mjs';

test('learned Elemente page stays generated from the current catalog with 120 links and seven sections', async () => {
  const pageUrl = new URL('../elemente/index.html', import.meta.url);
  const page = await readFile(pageUrl,'utf8');
  assert.equal(page, renderSpellListPage(listSpellCatalogEntries()));
  assert.equal((page.match(/data-spell data-section=/g)||[]).length,120);
  assert.equal((page.match(/data-spell-section aria-labelledby=/g)||[]).length,7);
  assert.equal((page.match(/\?zauberkatalog=(?:elementarismus|elemente)-/g)||[]).length,120);
  assert.match(page, /<h1>Elemente<\/h1>/);
  assert.match(page, /Magie \/ Die gelehrten Schulen/);
  assert.doesNotMatch(page, /druidic\/|Die druidischen Wege|unter Elementarismus/);
  assert.doesNotMatch(page,/\bon(?:click|input|change)=/);
  for(const match of page.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
    if(match[1].startsWith('#')) continue;
    await access(new URL(match[1],pageUrl));
  }
  const parent = await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(parent.match(/<details[^>]+id="elemente"[\s\S]*?<\/details>/)[0],/href="elemente\/index.html"/);
  assert.doesNotMatch(parent.match(/<details[^>]+id="elementarismus"[\s\S]*?<\/details>/)[0],/href="(?:elemente|elementarismus)\/index.html"/);
});

test('the earlier address remains an explicitly marked archive with correct old values and a current link', async () => {
  const page = await readFile(new URL('../elementarismus/index.html', import.meta.url),'utf8');
  assert.equal(page, renderSpellListPage(listSpellCatalogEntries({ revision: 1 }), { archived: true }));
  assert.match(page, /Archivfassung 1/);
  assert.match(page, /href="\.\.\/elemente\/index.html"/);
  assert.equal((page.match(/data-spell data-section=/g)||[]).length,72);
  assert.match(page, /id="elementarismus-feuerball"[^>]+data-grade="3"/);
});
