import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { BESTIARY_ENTRIES } from '../modules/catalog/catalog-data.js';
import { CREATURE_GROUP_PROFILE_IDS } from '../modules/creature-group-profile/creature-group-profile-registry.mjs';
import { renderCreatureGroupProfile } from '../modules/creature-group-profile/creature-group-profile-template.mjs';

const expectedIds = ['geister', 'nekrophagen', 'trolle', 'riesen'];
const expectedNames = ['Geister', 'Nekrophagen', 'Trolle', 'Riesen'];
const expectedKnownNames = {
  geister: ['Dullahan', 'Erscheinung (Geist)', 'Mahr', 'Dämon', 'Wächtergeist', 'Banshee (Todesfee)', 'Irrlichter & Irrlichtmutter', 'Naturahne'],
  nekrophagen: ['Zombie', 'Ghule', 'Draugr', 'Lich', 'Versunkener', 'Scheusal', 'Gruftweib / Verschlinger', 'Skelett', 'Nebling', 'Widergänger', 'Hexenrabe', 'Grall', 'Mumie', 'Sumpfzehrer'],
  trolle: ['Frosttroll', 'Flusstroll', 'Waldtroll', 'Bergtroll', 'Landtroll', 'Höhlentroll', 'Sumpftroll', 'Hügeltroll', 'Nebeltroll', 'Steppentroll', 'Aschetroll', 'Tundratroll', 'Dschungeltroll', 'Tiefentroll', 'Steintroll'],
  riesen: ['Jötun', 'Goliath', 'Zyklop', 'Fomóraig', 'Tlacharn', 'Bogann', 'Silvarn']
};
const expectedUnknownCounts = { geister: 7, nekrophagen: 1, trolle: 0, riesen: 8 };
const expectedMetricLabels = {
  geister: ['Bedrohung', 'Manifestation', 'Eigenwille', 'Bindungsstärke', 'Bannresistenz', 'Jenseitsmacht'],
  nekrophagen: ['Bedrohung', 'Körperkraft', 'Jagdtrieb', 'Eigenwille', 'Zähigkeit', 'Nekrotische Macht'],
  trolle: ['Gefahr', 'Körperlichkeit', 'Intelligenz', 'Widerstandskraft', 'Sozialverhalten', 'Übernatürliche Macht'],
  riesen: ['Gefahr', 'Körperlichkeit', 'Intelligenz', 'Widerstandskraft', 'Sozialverhalten', 'Übernatürliche Macht']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/gruppen/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(CREATURE_GROUP_PROFILE_IDS.map(readProfile));

test('the creature-group registry preserves the catalog order', () => {
  assert.deepEqual(CREATURE_GROUP_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/gruppen/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderCreatureGroupProfile(profile, navigation));
    assert(profile.summary.length >= 180);
    assert(profile.quote.length >= 65);
    assert(profile.quoteAttribution.length >= 25);
    assert(profile.sections.length >= 6);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert(profile.facts.length >= 11);
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert.equal(profile.related.entries.length, 15);

    const known = profile.related.entries.filter(entry => !entry.unknown);
    const unknown = profile.related.entries.filter(entry => entry.unknown);
    assert.deepEqual(known.map(entry => entry.name), expectedKnownNames[profile.id]);
    assert.equal(unknown.length, expectedUnknownCounts[profile.id]);
    assert(known.every(entry => entry.image && /vollständig/i.test(entry.image.alt)));
    assert(unknown.every(entry => entry.name === '???' && entry.region === '???' && entry.href === null && !entry.image));

    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/index\.html#kreaturen"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
    await Promise.all(known.map(entry => access(new URL(entry.image.src, directory))));
  });
}

test('all supplied creature-group images are documented and preserved without cropping rules', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/creature-group-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 48);
  assert.equal(new Set(manifest.items.map(item => item.id)).size, 48);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('.field-related-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the creature catalog links directly to every completed group dossier', () => {
  for (const id of expectedIds) {
    const entry = BESTIARY_ENTRIES.find(candidate => candidate.id === id);
    assert.equal(entry.href, `./wesen/gruppen/${id}/index.html`);
    assert(!/künftig|folgt/i.test(entry.description));
  }
});

test('the creature-group renderer escapes authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe,
    icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    metrics: { labels: ['A', 'B', 'C'], values: [1, 2, 3], source: unsafe },
    related: { title: unsafe, intro: unsafe, entries: [{ id: 'bad', name: unsafe, region: unsafe, description: unsafe, status: unsafe, image }] },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }, { type: 'list', items: [unsafe] }] }],
    plates: []
  };
  const html = renderCreatureGroupProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
