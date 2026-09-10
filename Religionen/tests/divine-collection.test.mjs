import test from 'node:test';
import assert from 'node:assert/strict';
import { readReligionCatalog, entrySearchText, entrySymbolPath, entryPagePath, validateCatalog } from '../modules/content/content-repository.mjs';
import { readCollections, profileContext } from '../modules/content/collection-repository.mjs';
import { collectionCatalog } from '../modules/pantheon/pantheon-template.mjs';
import { rootCatalogEntries } from '../modules/catalog/catalog-register-template.mjs';
import { renderReligionEntry } from '../modules/content/page-template.mjs';
import { filterEntries } from '../modules/catalog/catalog-model.mjs';
import { renderLoreBlocks, renderDivineNames } from '../modules/lore/lore-template.mjs';

const catalog = readReligionCatalog();
const collection = catalog.collections.find(item => item.id === 'goettlicher-kreis');
const circle = collectionCatalog(catalog, collection);
const searchable = entries => entries.map(entry => ({ ...entry, searchText: entrySearchText(entry) }));

test('divine register preserves 9 + 5 + 5 deities and eight named saints', () => {
  assert.deepEqual(collection.groups.map(group => group.entries.length), [9, 5, 5]);
  assert.equal(circle.entries.length, 27);
  assert.deepEqual(collection.saints.entries.map(saint => saint.name), ['Sankt Septimus', 'Sankt Martinus', 'Sankt Sieffre', 'Sankt Arissa', 'Sankt Eirinn', 'Sankt Síomhrach', 'Sankt Finbarr', 'Sankt Ninian']);
  const html = renderReligionEntry(catalog, catalog.entries.find(entry => entry.id === collection.parentId));
  const saints = html.slice(html.indexOf('<section class="faith-chapter" id="heilige"'), html.indexOf('<section class="pantheon-doctrine"'));
  assert.equal((saints.match(/class="faith-card saint-card"/g) || []).length, 8);
  assert(!/<img|<a\s/.test(saints));
  assert(!/Hierarchie der Alerischen Kirche|Sankt\.\.\./.test(html));
  assert.equal(collection.saints.entries.at(-1).epithet, null);
});

test('nested discovery searches domains and alternate names without duplicating the main catalog', () => {
  const root = rootCatalogEntries(catalog);
  assert.equal(root.length, 18);
  for (const query of ['Auron', 'Arvendil', 'Siomhrach']) {
    assert.deepEqual(filterEntries(searchable(root), { query }).map(entry => entry.id), query === 'Arvendil' ? ['neun-goettliche', 'alter-pantheon'] : ['neun-goettliche']);
  }
  assert.deepEqual(filterEntries(searchable(circle.entries), { query: 'Arvendil' }).map(entry => entry.id), ['auron']);
  assert.deepEqual(filterEntries(searchable(circle.entries), { query: 'siomhrach' }).map(entry => entry.id), ['heilige-siomhrach']);
  assert.deepEqual(filterEntries(searchable(circle.entries), { query: 'feuer', chapterId: 'souveraene' }).map(entry => entry.id), ['thyrael']);
});

test('deity navigation stays within its group and uses the original colored local icons', () => {
  for (const entry of catalog.entries.filter(entry => entry.collectionId === collection.id)) {
    const context = profileContext(catalog, entry);
    assert.equal(context.siblings.length, entry.groupId === 'goettliche' ? 9 : 5);
    assert(context.siblings.every(sibling => sibling.groupId === entry.groupId));
    assert.equal(entrySymbolPath(entry), `BilderRüstungen/${entry.id}_icon.png`);
    assert.equal(entryPagePath(entry), `Religionen/gottheiten/${entry.groupId}/${entry.id}/index.html`);
  }
});

test('all five lesser deities have completed lore and Ordan contains the supplied full profile', () => {
  for (const entry of catalog.entries.filter(entry => entry.collectionId === collection.id && entry.groupId === 'untergoetter')) {
    assert(!entry.pending);
    for (const id of ['einfuehrung', 'wesenheit', 'sphaere', 'eide', 'aspekte-segen', 'buende', 'uebertretungen', 'kult']) {
      const section = entry.sections.find(item => item.id === id);
      assert(section, `${entry.id}: ${id}`);
      assert(section.blocks.length || section.sharedLore, `${entry.id}: ${id} is empty`);
    }
    assert(!/\.{3,}|…|Yondalla|Titel hier|\[Name/.test(JSON.stringify(entry.sections)), entry.id);
    assert(entry.sections.some(section => section.authorship === 'continuation'), entry.id);
  }
  const ordan = catalog.entries.find(entry => entry.id === 'ordan');
  assert.equal(ordan.source.attachment, '63ad4af2-f33e-465e-b6de-358e1c149f9b');
  for (const gift of ['Segen des Zeithüters', 'Segen des Patriarchen', 'Bund des Drachenblutes', 'Bund der Drachenform', 'Bund des Archivaren']) assert(JSON.stringify(ordan.sections).includes(gift));
  assert(ordan.sections.find(section => section.id === 'wesenheit').blocks.length >= 7);
  assert(!/Akatosh|Einzelüberlieferung/.test(JSON.stringify(ordan.sections)));
  assert.match(renderReligionEntry(catalog, catalog.entries.find(entry => entry.id === 'tethyra')), /Flüstern der Wildnis/);
  assert.match(renderReligionEntry(catalog, catalog.entries.find(entry => entry.id === 'baldran')), /Bund der Saat/);
  assert.match(renderReligionEntry(catalog, catalog.entries.find(entry => entry.id === 'lyris')), /Eid der Anmutigkeit/);
});

test('malformed collections, duplicate sources and missing shared doctrine fail before generation', () => {
  function readChanged(change) {
    const changed = structuredClone(collection);
    change(changed);
    return () => readCollections(['collection.json'], path => path === 'collection.json' ? changed : path === collection.saintsSource ? collection.saints : catalog.entries.find(entry => entry.sourcePath === path), catalog.entries.filter(entry => !entry.collectionId));
  }
  assert.throws(readChanged(value => { value.parentId = 'missing'; }), /Sammlungsseite/);
  assert.throws(readChanged(value => { value.groups[0].entries.push(value.groups[0].entries[0]); }), /Doppelte Inhaltsquelle/);
  assert.throws(readChanged(value => { value.groups[0].entries = null; }), /Gruppeneinträge/);
  const broken = structuredClone(catalog);
  broken.entries.find(entry => entry.id === 'mariel').sections[0].sharedLore = 'missing';
  assert.throws(() => validateCatalog(broken), /Gemeinsame Lehre fehlt/);
});

test('rich lore, lists and names remain escaped instead of accepting embedded markup', () => {
  const attack = '<img src=x onerror="alert(1)">';
  const html = renderLoreBlocks([{ type: 'heading', text: attack }, { type: 'list', items: [`Ein Eid: ${attack}`] }]) + renderDivineNames([{ label: attack, value: attack }]);
  assert(!html.includes('<img'));
  assert(html.includes('&lt;img'));
  const broken = structuredClone(catalog);
  broken.entries.find(entry => entry.id === 'mariel').sections[0].blocks.push({ type: 'html', text: attack });
  assert.throws(() => validateCatalog(broken), /Unbekannter Textblock/);
});

test('all deity profiles use large local portraits, keeping catalog icons separate', () => {
  for (const entry of catalog.entries.filter(entry => entry.collectionId === collection.id)) {
    assert.equal(entry.portrait.src, `assets/divine-art/${entry.id}.png`);
    assert(entry.portrait.height > entry.portrait.width);
    const html = renderReligionEntry(catalog, entry);
    assert.match(html, /class="profile-cover has-portrait"/);
    assert.match(html, /class="profile-art"/);
    assert(html.includes(entry.portrait.src));
  }
});
