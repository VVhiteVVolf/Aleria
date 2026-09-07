import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { HORSE_PROFILE_IDS } from '../modules/horse-profile/horse-profile-registry.mjs';
import { renderHorseProfile } from '../modules/horse-profile/horse-profile-template.mjs';

const expectedLabels = ['Schnelligkeit', 'Ausdauer', 'Stärke', 'Agilität', 'Sozialverhalten', 'Robustheit'];
const missingPerformance = ['aelvinger', 'skjorn', 'tanarhan'];

async function readProfile(id) {
  const directory = new URL(`../tiere/pferde/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(HORSE_PROFILE_IDS.map(readProfile));

test('the horse register contains all 32 inherited dossiers in atlas order', () => {
  assert.equal(HORSE_PROFILE_IDS.length, 32);
  assert.equal(new Set(HORSE_PROFILE_IDS).size, 32);
  assert.deepEqual(profiles.map(profile => profile.id), HORSE_PROFILE_IDS);
  assert.deepEqual(profiles.map(profile => profile.name).slice(0, 6), ['Eiarach', 'Ceffyl', 'Rhyfel', 'Hest', 'Curragh', 'Tirashan']);
  assert.deepEqual(profiles.map(profile => profile.name).slice(-4), ['Skjorn', 'Hross', 'Skuggr', 'Skaer']);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../tiere/pferde/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderHorseProfile(profile, navigation));
    assert(profile.summary.length >= 80);
    assert(profile.quote.length >= 12);
    assert(profile.sections.length >= 6);
    assert(profile.sections.every(section => section.id && section.title && section.blocks.length));
    assert(profile.sections.every(section => section.blocks.every(block => (
      block.type === 'list' ? block.items.length > 0 : Boolean(block.text)
    ))));
    assert(profile.market.tier && profile.market.price && profile.market.tags.length);
    assert(!/https?:\/\/|animexx|tumblr|postimg|onclick=|oninput=|onchange=/i.test(html));
    assert(html.includes('Aus dem Rossmarkt'));
    assert(html.includes('Leistungsblatt'));
    assert(html.includes('object-fit:') === false);

    await access(new URL(profile.emblem.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('Rossmarkt performance values are transferred to 29 matching breeds', () => {
  const withPerformance = profiles.filter(profile => profile.performance);
  assert.equal(withPerformance.length, 29);
  assert.deepEqual(profiles.filter(profile => !profile.performance).map(profile => profile.id).sort(), missingPerformance);
  assert(withPerformance.every(profile => profile.performance.source === 'Rossmarkt'));
  assert(withPerformance.every(profile => profile.performance.labels.length === 6));
  assert(withPerformance.every(profile => profile.performance.values.length === 6));
  assert(withPerformance.every(profile => profile.performance.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10)));
  assert(withPerformance.every(profile => JSON.stringify(profile.performance.labels) === JSON.stringify(expectedLabels)));

  const byId = Object.fromEntries(profiles.map(profile => [profile.id, profile]));
  assert.deepEqual(byId.eiarach.performance.values, [9, 10, 10, 9, 10, 10]);
  assert.deepEqual(byId.ceffyl.performance.values, [9, 8, 7, 8, 10, 8]);
  assert.deepEqual(byId.brycing.performance.values, [9, 10, 9, 9, 9, 9]);
  assert.deepEqual(byId.curragh.performance.values, [9, 8, 2, 10, 9, 2]);
});

test('the horse atlas links every ancestor and breed to its dossier', async () => {
  const directory = new URL('../tiere/pferde/', import.meta.url);
  const record = JSON.parse(await readFile(new URL('art.json', directory), 'utf8'));
  const entries = record.atlas.groups.flatMap(group => [group.ancestor, ...group.entries]);

  assert.deepEqual(entries.map(entry => entry.id), HORSE_PROFILE_IDS);
  assert(entries.every(entry => entry.href === `./${entry.id}/index.html`));
  assert(entries.every(entry => entry.status === 'Dossier verfügbar'));
  assert(entries.every(entry => entry.image.src === `../../assets/species-entries/pferde/${entry.id}.webp`));
  await Promise.all(entries.map(entry => access(new URL(entry.href, directory))));
  await Promise.all(entries.map(entry => access(new URL(entry.image.src, directory))));
});

test('the 32 inherited horse illustrations are documented locally', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/horse-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 32);
  assert.deepEqual(manifest.items.map(item => item.id), HORSE_PROFILE_IDS);
  assert(manifest.items.every(item => item.sourceType === 'legacy-template'));
  assert(manifest.items.every(item => item.sourceUrl.startsWith('https://i.imgur.com/')));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('horse-profile template escapes authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, quote: unsafe, quoteAttribution: unsafe, summary: unsafe, parentGroupId: unsafe,
    emblem: { src: './emblem.webp', width: 1, height: 1, alt: unsafe },
    hero: { src: './horse.webp', width: 1, height: 1, alt: unsafe, caption: unsafe },
    facts: [{ label: unsafe, value: unsafe }],
    market: { tier: unsafe, price: unsafe, age: unsafe, tags: [unsafe] },
    performance: { labels: Array(6).fill(unsafe), values: Array(6).fill(5), source: 'Rossmarkt' },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }, { type: 'list', items: [unsafe] }] }]
  };
  const html = renderHorseProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
