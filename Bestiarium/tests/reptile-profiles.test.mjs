import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { REPTILE_PROFILE_IDS } from '../modules/reptile-profile/reptile-profile-registry.mjs';
import { renderReptileProfile } from '../modules/reptile-profile/reptile-profile-template.mjs';

const expectedIds = ['druchtan', 'myrrblodr', 'bructar', 'corrchuban'];
const expectedNames = ['Drúchtán', 'Mýrrblóðr', 'Brúctar', 'Corrchrúbán'];

async function readProfile(id) {
  const directory = new URL(`../tiere/reptilien/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(REPTILE_PROFILE_IDS.map(readProfile));

test('the reptile registry contains the two species and both supplied Druchtan lines', () => {
  assert.deepEqual(REPTILE_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../tiere/reptilien/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderReptileProfile(profile, navigation));
    assert(profile.summary.length >= 120);
    assert(profile.quote.length >= 35);
    assert(profile.quoteAttribution.length >= 15);
    assert(profile.sections.length >= 7);
    assert(profile.sections.every(section => section.blocks.length));
    assert.equal(profile.facts.length, 11);
    assert.deepEqual(profile.metrics.labels, ['Gefahr', 'Zähmbarkeit', 'Intelligenz', 'Körperkraft', 'Sozialverhalten', 'Ausdauer']);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
    await Promise.all((profile.plates || []).map(entry => access(new URL(entry.src, directory))));
  });
}

test('Druchtan links both known lineages and retains three unknown source slots', async () => {
  const druchtan = profiles[0];
  const known = druchtan.related.entries.filter(entry => entry.href);
  const unknown = druchtan.related.entries.filter(entry => !entry.href);
  assert.deepEqual(known.map(entry => entry.id), ['myrrblodr', 'bructar']);
  assert.equal(unknown.length, 3);
  assert(unknown.every(entry => entry.name === '???' && entry.status === 'Noch unausgefüllt'));
  await Promise.all(known.map(entry => access(new URL(entry.href, new URL('../tiere/reptilien/druchtan/', import.meta.url)))));
});

test('the Corrchuban overview uses its species portrait while the dossier keeps the scene tableau', async () => {
  const overview = JSON.parse(await readFile(new URL('../tiere/reptilien/art.json', import.meta.url), 'utf8'));
  const entries = overview.atlas.groups.flatMap(group => group.entries);
  const corrchuban = entries.find(entry => entry.id === 'corrchuban');
  assert.equal(corrchuban.image.src, '../../assets/species-entries/reptilien/corrchuban.webp');
  assert.equal(profiles[3].hero.src, '../../../assets/reptile-profiles/corrchuban-hero.webp');
  assert.notEqual(corrchuban.image.src.split('/').at(-1), profiles[3].hero.src.split('/').at(-1));
});

test('all supplied reptile illustrations are archived locally with source dimensions', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/reptile-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 12);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('reptile portraits, related cards and plates explicitly preserve the complete illustration', async () => {
  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('.field-related-image'));
  assert(css.includes('.field-plate img'));
  assert.equal((css.match(/object-fit:\s*contain/g) || []).length, 4);
  assert(!/object-fit:\s*cover/.test(css));
});

test('the reptile-profile renderer escapes authored text', () => {
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
  const html = renderReptileProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
