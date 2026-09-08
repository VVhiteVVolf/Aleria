import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { LIVESTOCK_CATEGORIES, LIVESTOCK_CATEGORY_IDS } from '../modules/livestock-category/livestock-category-registry.mjs';
import { renderLivestockCategory } from '../modules/livestock-category/livestock-category-template.mjs';

const expectedEntries = {
  'rinder': ['Gewöhnliches Rind', 'Estryll Hochland Rind', 'Usail Rind', 'Faelorn Hochland Rind', 'Erlinger', 'Aldinger', 'Tiefland Rind'],
  'schafe-und-ziegen': ['Gewöhnliche Ziege & Schaf', 'Estryller Schaf', 'Nordisches Schaf', 'Albisches Schaf', 'Nördliche Ziege', 'Albische Ziege'],
  'schweine-und-wildschweine': ['Gewöhnliches Schwein', 'Gewöhnliches Estryll Schwein', 'Nordisches Landschwein', 'Domestiziertes Wildes Schwein', 'Albisches Landschwein', 'Fiadh', 'Domestiziertes Wildes Schwein', 'Lothir Landschwein'],
  'huehner-und-gefluegel': ['Gewöhnliches Huhn', 'Goldfeder', 'Uanric-Moorglucke', 'Hofschimmer', 'Blaufeder'],
  'haustiere': ['Hunde', 'Katzen'],
  'lasttiere': ['Ochse', 'Arbeitspferd', 'Maultier', 'Esel']
};

async function readCategory(id) {
  const directory = new URL(`../tiere/vieh/${id}/`, import.meta.url);
  return {
    directory,
    record: JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8')),
    html: await readFile(new URL('index.html', directory), 'utf8')
  };
}

function localReferences(html) {
  return [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(match => match[1].split('#')[0])
    .filter(reference => reference && !reference.startsWith('http'));
}

test('livestock registry exposes the six inherited subcategories', () => {
  assert.deepEqual(LIVESTOCK_CATEGORY_IDS, [
    'rinder',
    'schafe-und-ziegen',
    'schweine-und-wildschweine',
    'huehner-und-gefluegel',
    'haustiere',
    'lasttiere'
  ]);
  assert.equal(new Set(LIVESTOCK_CATEGORIES.map(category => category.title)).size, 6);
});

test('all generated livestock pages match their source records', async () => {
  for (const id of LIVESTOCK_CATEGORY_IDS) {
    const { record, html } = await readCategory(id);
    assert.equal(record.id, id);
    assert.equal(html.replace(/\r\n/g, '\n'), renderLivestockCategory(record));
    assert.equal((html.match(/aria-current="page"/g) || []).length, 2);
    assert.equal((html.match(/class="livestock-tabs livestock-tabs--6"/g) || []).length, 1);
    assert(!/https?:\/\//.test(html));
    assert(!/\son(?:click|input|change)=/i.test(html));
    assert(!html.includes('tumblr_otwjgn'));
    assert(!html.includes('Unbekannt'));
    assert(!html.includes('??'));
  }
});

test('the old tables contribute only their 32 named animal entries', async () => {
  let count = 0;
  for (const id of LIVESTOCK_CATEGORY_IDS) {
    const { record } = await readCategory(id);
    const entries = record.catalog.groups.flatMap(group => group.entries);
    assert.deepEqual(entries.map(entry => entry.title), expectedEntries[id]);
    if (id === 'haustiere') {
      assert.deepEqual(entries.map(entry => entry.href), ['./hunde/index.html', './katzen/index.html']);
      assert(entries.every(entry => entry.status === 'Rassenregister verfügbar'));
    } else {
      assert(entries.every(entry => entry.href === null));
      assert(entries.every(entry => entry.status === 'Einzeldossier vorgemerkt'));
    }
    assert(entries.every(entry => entry.images.length > 0));
    count += entries.length;
  }
  assert.equal(count, 32);
});

test('the continental structure is preserved without invented filled groups', async () => {
  const continentalIds = ['estryll', 'lothir', 'aldervan', 'tirnara', 'sundara'];
  for (const id of ['rinder', 'schafe-und-ziegen', 'schweine-und-wildschweine', 'huehner-und-gefluegel', 'lasttiere']) {
    const { record } = await readCategory(id);
    const groupIds = record.catalog.groups.map(group => group.id);
    for (const continentId of continentalIds) assert(groupIds.includes(continentId));
  }

  const expectedEmptyGroups = {
    rinder: ['aldervan', 'tirnara', 'sundara'],
    'schafe-und-ziegen': ['lothir', 'aldervan', 'tirnara', 'sundara'],
    'schweine-und-wildschweine': ['aldervan', 'tirnara', 'sundara'],
    'huehner-und-gefluegel': ['estryll', 'aldervan', 'sundara'],
    lasttiere: continentalIds
  };
  for (const [id, emptyIds] of Object.entries(expectedEmptyGroups)) {
    const { record } = await readCategory(id);
    assert.deepEqual(record.catalog.groups.filter(group => group.entries.length === 0).map(group => group.id), emptyIds);
  }
});

test('the parent livestock page links every category overview', async () => {
  const directory = new URL('../tiere/vieh/', import.meta.url);
  const record = JSON.parse(await readFile(new URL('art.json', directory), 'utf8'));
  const entries = record.atlas.groups.flatMap(group => group.entries);
  assert.deepEqual(entries.map(entry => entry.id), LIVESTOCK_CATEGORY_IDS);
  assert(entries.every(entry => entry.href === `./${entry.id}/index.html`));
  assert(entries.every(entry => entry.status === 'Übersicht verfügbar'));
  await Promise.all(entries.map(entry => access(new URL(entry.href, directory))));
});

test('all local page references resolve', async () => {
  for (const id of LIVESTOCK_CATEGORY_IDS) {
    const { directory, html } = await readCategory(id);
    const references = localReferences(html);
    await Promise.all(references.map(reference => access(new URL(reference, directory))));
  }
});

test('all 33 inherited livestock images are archived locally', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/livestock-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 33);
  assert.equal(new Set(manifest.items.map(item => item.sourceUrl)).size, 33);
  assert(manifest.items.every(item => item.sourceType === 'legacy-template'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  assert(manifest.items.every(item => LIVESTOCK_CATEGORY_IDS.includes(item.categoryId)));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('livestock template escapes authored content', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'rinder', title: unsafe, subtitle: unsafe, classification: unsafe, folio: unsafe, lead: unsafe,
    quote: unsafe, icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    sections: [{ id: 'intro', title: unsafe, paragraphs: [unsafe] }],
    catalog: {
      title: unsafe, intro: unsafe,
      groups: [{ id: 'group', title: unsafe, kicker: unsafe, description: unsafe, entries: [{ id: 'entry', title: unsafe, region: unsafe, description: unsafe, status: unsafe, href: null, images: [image] }] }]
    }
  };
  const html = renderLivestockCategory(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
