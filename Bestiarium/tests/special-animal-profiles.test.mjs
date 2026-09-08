import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { BESTIARY_ENTRIES } from '../modules/catalog/catalog-data.js';
import { SPECIAL_ANIMAL_PROFILE_IDS } from '../modules/special-animal-profile/special-animal-profile-registry.mjs';
import { renderSpecialAnimalProfile } from '../modules/special-animal-profile/special-animal-profile-template.mjs';

const expectedIds = ['sturmbock', 'mondlaeufer'];
const expectedNames = ['Sturmbock', 'Mondläufer'];
const metricLabels = ['Trittsicherheit', 'Reitbarkeit', 'Wendigkeit', 'Ausdauer', 'Tragkraft', 'Kampfwert'];

async function readProfile(id) {
  const directory = new URL(`../tiere/besondere/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(SPECIAL_ANIMAL_PROFILE_IDS.map(readProfile));

test('the special-animal registry contains both supplied mounts in catalog order', () => {
  assert.deepEqual(SPECIAL_ANIMAL_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../tiere/besondere/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderSpecialAnimalProfile(profile, navigation));
    assert(profile.summary.length >= 140);
    assert(profile.quote.length >= 45);
    assert(profile.quoteAttribution.length >= 20);
    assert(profile.sections.length >= 8);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.facts.length >= 11);
    assert.equal(profile.facts.find(fact => fact.label === 'Kosten')?.value, '???');
    assert.deepEqual(profile.metrics.labels, metricLabels);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/index\.html#besondere"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('the supplied image tableaux are local, documented and rendered without cropping', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/special-animal-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 2);
  assert.deepEqual(manifest.items.map(item => item.id), expectedIds);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the special-exemplar cards link directly to both completed dossiers', () => {
  for (const id of expectedIds) {
    const entry = BESTIARY_ENTRIES.find(candidate => candidate.id === id);
    assert.equal(entry.href, `./tiere/besondere/${id}/index.html`);
    assert(!/künftig|folgt/i.test(entry.description));
  }
});

test('the special-animal renderer escapes authored text', () => {
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
  const html = renderSpecialAnimalProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
