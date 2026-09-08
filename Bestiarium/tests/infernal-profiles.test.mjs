import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { BESTIARY_ENTRIES } from '../modules/catalog/catalog-data.js';
import { INFERNAL_PROFILE_IDS } from '../modules/infernal-profile/infernal-profile-registry.mjs';
import { renderInfernalProfile } from '../modules/infernal-profile/infernal-profile-template.mjs';

const expectedIds = ['djinn', 'muhmen'];
const expectedNames = ['Djinn', 'Muhmen'];
const expectedMetricLabels = {
  djinn: ['Magiepotenz', 'Formwechsel', 'Willenskraft', 'List', 'Bannbindung', 'Geistangriff'],
  muhmen: ['Paktmacht', 'Fluchweberei', 'Täuschung', 'Weissagung', 'Naturverderbnis', 'Geduld']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/infernale/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(INFERNAL_PROFILE_IDS.map(readProfile));

test('the infernal profile registry contains both supplied entries in catalog order', () => {
  assert.deepEqual(INFERNAL_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/infernale/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderInfernalProfile(profile, navigation));
    assert(profile.summary.length >= 190);
    assert(profile.quote.length >= 55);
    assert(profile.quoteAttribution.length >= 20);
    assert(profile.sections.length >= 7);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert.equal(profile.facts.length, 11);
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/index\.html#infernale"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('unknown Djinn loot remains explicitly open while supplied Muhmen facts are complete', () => {
  const djinn = profiles.find(profile => profile.id === 'djinn');
  const muhmen = profiles.find(profile => profile.id === 'muhmen');
  assert.equal(djinn.facts.find(fact => fact.label === 'Beute')?.value, '???');
  assert(!muhmen.facts.some(fact => fact.value === '???'));
});

test('the supplied thematic images are local, correctly mapped and rendered without cropping', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/infernal-profile-sources.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.items.map(item => item.id), expectedIds);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width === 1024 && item.height === 1536));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the infernal catalog links directly to both completed dossiers', () => {
  for (const id of expectedIds) {
    const entry = BESTIARY_ENTRIES.find(candidate => candidate.id === id);
    assert.equal(entry.href, `./wesen/infernale/${id}/index.html`);
    assert(!/künftig|folgt/i.test(entry.description));
  }
});

test('the infernal profile renderer escapes authored text', () => {
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
  const html = renderInfernalProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
