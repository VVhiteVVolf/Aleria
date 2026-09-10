import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { BLOODSUCKER_PROFILE_IDS } from '../modules/bloodsucker-profile/bloodsucker-profile-registry.mjs';
import { renderBloodsuckerGroup, renderBloodsuckerProfile } from '../modules/bloodsucker-profile/bloodsucker-profile-template.mjs';

const expectedIds = ['mulinar', 'alpyr', 'nosphyr', 'mortis'];
const expectedNames = ['Mulinar', 'Alpyr', 'Nosphyr', 'Mortis'];
const expectedMetricLabels = {
  mulinar: ['Blutgier', 'Gesangslockung', 'Illusionsreflexe', 'Menschlichkeitsrest', 'Meisterbindung', 'Tarnfähigkeit'],
  alpyr: ['Selbstkontrolle', 'Gesellschaftstarnung', 'Manipulation', 'Blutgier', 'Strategisches Denken', 'Enttarnungsrisiko'],
  nosphyr: ['Körperkraft', 'Flugvermögen', 'Jagdsinne', 'Blutgier', 'Magiebegabung', 'Menschlichkeitsrest'],
  mortis: ['Verfallsaura', 'Zähigkeit', 'Aasbindung', 'Angriffswucht', 'Beweglichkeit', 'Menschlichkeitsrest']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/blutsauger/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(BLOODSUCKER_PROFILE_IDS.map(readProfile));

test('the bloodsucker registry contains all four supplied spawn forms in source order', () => {
  assert.deepEqual(BLOODSUCKER_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/blutsauger/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderBloodsuckerProfile(profile, navigation));
    assert(profile.summary.length >= 190 && profile.summary.length <= 480);
    assert(profile.quote.length >= 45);
    assert(profile.quoteAttribution.length >= 20);
    assert.equal(profile.facts.length, 12);
    assert(profile.sections.length >= 9);
    assert(profile.sections.every(section => section.blocks.length));
    assert.equal(profile.sections.find(section => section.id === 'unterarten').blocks[0].text, '???');
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert.equal(profile.metrics.labels.includes('Sozialverhalten'), false);
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/blutsauger\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    assert.match(profile.icon.alt, /vollständig/i);
    assert.match(profile.hero.alt, /vollständig/i);
    assert.notEqual(profile.icon.src, profile.hero.src);
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('the bloodsucker overview contains four linked dossiers and one untouched unknown slot', async () => {
  const directory = new URL('../wesen/gruppen/blutsauger/', import.meta.url);
  const group = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');

  assert.equal(html, renderBloodsuckerGroup(group));
  assert.equal(group.related.entries.length, 5);
  for (const id of expectedIds) {
    const entry = group.related.entries.find(candidate => candidate.id === id);
    assert.equal(entry.href, `../../blutsauger/${id}/index.html`);
    assert.equal(entry.status, 'Dossier öffnen ↗');
    assert.match(entry.image.alt, /vollständig/i);
  }
  const unknown = group.related.entries.filter(entry => entry.unknown);
  assert.equal(unknown.length, 1);
  assert.equal(unknown[0].name, '???');
  assert.equal(unknown[0].href, null);
  assert(!unknown[0].image);
  assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/vampire\/index\.html#verwandtschaft"/);
});

test('provided icons and generated scenes are documented separately and remain uncropped', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/bloodsucker-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 10);
  assert.equal(new Set(manifest.items.map(item => item.id)).size, 10);
  assert(manifest.items.every(item => item.fit === 'contain' && item.width > 0 && item.height > 0));
  assert.equal(manifest.items.filter(item => item.sourceType === 'user-provided-profile-table').length, 5);
  assert.equal(manifest.items.filter(item => item.sourceType.startsWith('generated-for-')).length, 5);

  for (const id of expectedIds) {
    assert(manifest.items.some(item => item.id === `${id}-icon` && item.sourceType === 'user-provided-profile-table'));
    assert(manifest.items.some(item => item.id === `${id}-scene` && item.sourceType === 'generated-for-missing-theme-image'));
  }
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const correctedNosphyr = manifest.items.find(item => item.id === 'nosphyr-scene');
  assert.match(correctedNosphyr.source, /v2$/);
  assert.match(correctedNosphyr.generationPrompt, /zwei Armen und zwei Flügeln/);
  assert.match(correctedNosphyr.generationPrompt, /Ordensritter/);

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the vampire hierarchy has dedicated tiers above the bloodsucker link', async () => {
  const group = JSON.parse(await readFile(new URL('../wesen/gruppen/vampire/profil.json', import.meta.url), 'utf8'));
  const tierIds = group.related.tiers.map(tier => tier.id);
  assert.deepEqual(tierIds, ['vampirfuerst', 'hoehere-vampire', 'striga', 'blutsauger']);
  assert.deepEqual(group.related.tiers[0].entryIds, ['vampirfuerst']);
  assert.deepEqual(group.related.tiers[2].entryIds, ['striga']);
  assert.deepEqual(group.related.tiers[3].entryIds, ['blutsauger']);

  const hierarchyCss = await readFile(new URL('../modules/field-guide-profile/field-related-hierarchy.css', import.meta.url), 'utf8');
  assert.match(hierarchyCss, /field-related-tier--apex/);
  assert.match(hierarchyCss, /field-related-tier--transition/);
  assert.match(hierarchyCss, /field-related-tier--subgroup/);
});

test('the bloodsucker renderers escape authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe,
    icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    metrics: { labels: ['A', 'B', 'C'], values: [1, 2, 3], source: unsafe },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }, { type: 'list', items: [unsafe] }] }],
    plates: []
  };
  const html = renderBloodsuckerProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
