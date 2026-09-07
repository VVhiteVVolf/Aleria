import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { BESTIARY_CHAPTERS } from '../modules/catalog/catalog-data.js';
import { NATURAL_SPECIES_IDS } from '../modules/natural-species/natural-species-registry.mjs';
import { renderNaturalSpecies } from '../modules/natural-species/natural-species-template.mjs';

const expectedEntryCounts = {
  pferde: 32,
  raubtiere: 3,
  flugwesen: 2,
  wild: 5,
  meerestiere: 5,
  vieh: 6,
  reptilien: 2,
  amphibien: 2,
  ornithosaurier: 2,
  insekten: 9
};

const expectedLegacyImageCounts = {
  pferde: 32,
  raubtiere: 3,
  flugwesen: 2,
  wild: 5,
  meerestiere: 0,
  vieh: 6,
  reptilien: 2,
  amphibien: 1,
  ornithosaurier: 2,
  insekten: 9
};

const legacyNames = {
  raubtiere: ['Raubkatzen', 'Wölfe', 'Bären'],
  flugwesen: ['Caoran', 'Rotmilan'],
  wild: ['Mittleres Wild', 'Keiler', 'Großwild', 'Kleinwild', 'Hirsche & Elche'],
  vieh: ['Rinder', 'Schafe & Ziegen', 'Schweine & Wildschweine', 'Hühner & Geflügel', 'Haustiere', 'Lasttiere'],
  reptilien: ['Druchtan', 'Corrchuban'],
  amphibien: ['Kröten', 'Frösche'],
  ornithosaurier: ['Klippenschnapper', 'Aerdrith'],
  insekten: ['Höhlenkriecher', 'Svelg / Sumpfpfähler', 'Garnspinnen', 'Koloss-Spinnen', 'Raub- & Laufspinnen', 'Gratspinnen', 'Panzerspinnen', 'Kumzehir / Dünenskorpion', 'Blutklammer']
};

const allEntries = record => record.atlas.groups.flatMap(group => [
  ...(group.ancestor ? [group.ancestor] : []),
  ...group.entries
]);

for (const id of NATURAL_SPECIES_IDS) {
  test(`${id}: generated natural-species page is complete, local and current`, async () => {
    const directory = new URL(`../tiere/${id}/`, import.meta.url);
    const record = JSON.parse(await readFile(new URL('art.json', directory), 'utf8'));
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const entries = allEntries(record);

    assert.equal(record.id, id);
    assert.equal(record.sections.length, 3);
    assert.equal(record.facts.length, 9);
    assert.equal(entries.length, expectedEntryCounts[id]);
    assert.equal(entries.filter(entry => entry.image).length, expectedLegacyImageCounts[id]);
    assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
    assert(record.sections.every(section => section.paragraphs.length >= 2));
    assert(entries.every(entry => entry.description.length >= 80));
    assert.equal(html, renderNaturalSpecies(record));
    assert(!/https?:\/\/|animexx|tumblr|postimg|onclick=|oninput=|onchange=|(?:^|\W)\?\?(?:\W|$)|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    await access(new URL(record.icon.src, directory));
    await access(new URL(record.hero.src, directory));
    await Promise.all(entries.filter(entry => entry.image).map(entry => access(new URL(entry.image.src, directory))));
  });
}

test('all ten natural-species catalog entries link to their local pages', async () => {
  const chapter = BESTIARY_CHAPTERS.find(entry => entry.id === 'tiere');
  const entries = chapter.groups.find(group => group.id === 'tiergruppen').entries;
  assert.deepEqual(entries.map(entry => entry.id), NATURAL_SPECIES_IDS);
  assert(entries.every(entry => entry.href === `./tiere/${entry.id}/index.html`));
  await Promise.all(entries.map(entry => access(new URL(`../${entry.href.slice(2)}`, import.meta.url))));
});

test('horse breeds preserve the continent, ancestor and country hierarchy', async () => {
  const record = JSON.parse(await readFile(new URL('../tiere/pferde/art.json', import.meta.url), 'utf8'));
  assert.deepEqual(record.atlas.groups.map(group => group.title), [
    'Kontinent Estryll', 'Kontinent Tirnara', 'Kontinent Lothir', 'Kontinent Aldervan', 'Kontinent Yrmandrall'
  ]);
  assert.deepEqual(record.atlas.groups.map(group => group.ancestor.title), [
    'Eiarach', 'Tanarhan', 'Fürstenglanz', 'Ælvinger', 'Skjon'
  ]);
  assert.deepEqual(record.atlas.groups[0].entries.map(entry => entry.region), [
    'Avallorn', 'Cenyr', 'Aldrimar & Ceitheach', 'Zentrales Estryll', 'Süd-Estryll', 'Klaueninseln', 'Fjordheim', 'Estrylls Sumpfland'
  ]);
  assert.deepEqual(record.atlas.groups[3].entries.map(entry => [entry.region, entry.title]), [
    ['Brevanor', 'Cheval'], ['Kent', 'Cyning'], ['Kent', 'Brycing'], ['Imperium Argentum', 'Equo'], ['Mathringen', 'Sale'], ['Baldreska', 'Drake']
  ]);
});

test('all named groups from the old sparse tables remain in the new atlases', async () => {
  for (const [id, expected] of Object.entries(legacyNames)) {
    const record = JSON.parse(await readFile(new URL(`../tiere/${id}/art.json`, import.meta.url), 'utf8'));
    const names = allEntries(record).map(entry => entry.title);
    assert.deepEqual(names, expected);
  }
});

test('art manifest documents the selected horse image and nine generated 2:3 illustrations', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/species-art-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 10);
  const horse = manifest.items.find(item => item.id === 'pferde');
  assert.equal(horse.sourceType, 'user-provided');
  assert.equal(horse.sourceUrl, 'https://i.imgur.com/31O9Ykd.png');
  const generated = manifest.items.filter(item => item.sourceType === 'generated');
  assert.equal(generated.length, 9);
  assert(generated.every(item => item.width === 1024 && item.height === 1536 && item.prompt.includes('Strict One Piece anime art style')));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('all 62 legacy creature images are documented locally', async () => {
  const creatures = JSON.parse(await readFile(new URL('../assets/species-entry-sources.json', import.meta.url), 'utf8'));
  assert.equal(creatures.items.length, 62);
  assert(creatures.items.every(item => item.sourceType === 'legacy-template'));
  await Promise.all(creatures.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('natural-species template escapes authored text', () => {
  const text = '<img src=x onerror="alert(1)">';
  const record = {
    id: 'escape', title: text, subtitle: text, classification: text, folio: text, lead: text, pullQuote: text,
    icon: { src: './icon.webp', width: 1, height: 1, alt: text },
    hero: { src: './hero.webp', width: 2, height: 3, alt: text, caption: text },
    facts: [{ label: text, value: text }],
    sections: [{ id: 'intro', title: text, paragraphs: [text] }],
    atlas: { title: text, intro: text, groups: [{ id: 'group', title: text, kicker: text, description: text, entries: [{ id: 'entry', title: text, region: text, description: text, status: text, href: null }] }] }
  };
  const html = renderNaturalSpecies(record);
  assert(!html.includes(text));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
