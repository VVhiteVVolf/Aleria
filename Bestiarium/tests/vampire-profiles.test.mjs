import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { VAMPIRE_PROFILE_IDS } from '../modules/vampire-profile/vampire-profile-registry.mjs';
import { renderVampireProfile } from '../modules/vampire-profile/vampire-profile-template.mjs';

const expectedIds = ['nosferat', 'mula', 'alp', 'nachzehrer', 'striga'];
const expectedNames = ['Nosferat', 'Mula', 'Alp', 'Nachzehrer', 'Striga'];
const expectedMetricLabels = {
  nosferat: ['Herrschaftsmacht', 'Blutmagie', 'Gedankenkontrolle', 'Beschwörung', 'Furchtaura', 'Sonnenanfälligkeit'],
  mula: ['Menschentarnung', 'Gesangsbann', 'Illusionskunst', 'Polymorphie', 'Blutmagie', 'Konfrontationswille'],
  alp: ['Gesellschaftstarnung', 'Rollenwechsel', 'Illusionskunst', 'Hypnose', 'Spurvermeidung', 'Offenkampfkraft'],
  nachzehrer: ['Verfallsmagie', 'Nekromantie', 'Unauffälligkeit', 'Fluchwirken', 'Leichenversorgung', 'Sonnenanfälligkeit'],
  striga: ['Menschlichkeit', 'Blutmagiepotenzial', 'Anpassung', 'Körperresistenz', 'Bhaals Versuchung', 'Sonnenfreiheit']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/vampire/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(VAMPIRE_PROFILE_IDS.map(readProfile));

test('the vampire registry contains all supplied kinds in overview order', () => {
  assert.deepEqual(VAMPIRE_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/vampire/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderVampireProfile(profile, navigation));
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
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/vampire\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    assert.match(profile.icon.alt, /vollständig/i);
    assert.notEqual(profile.icon.src, profile.hero.src);
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
    await Promise.all(profile.plates.map(plate => access(new URL(plate.src, directory))));
  });
}

test('the supplied vampire figures and scene plates are mapped separately without cropping', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/vampire-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 16);
  assert.equal(new Set(manifest.items.map(item => item.id)).size, 16);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.fit === 'contain' && item.width > 0 && item.height > 0));
  for (const id of expectedIds) {
    assert(manifest.items.some(item => item.id === `${id}-icon`));
    assert(manifest.items.some(item => item.id === `${id}-hero`));
  }
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const animatedPlate = manifest.items.find(item => item.id === 'nosferat-plate');
  assert.equal(animatedPlate.animated, true);
  assert.equal(animatedPlate.frames, 80);

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the vampire overview links five dossiers and preserves the pending lord plus nine unknown slots', async () => {
  const group = JSON.parse(await readFile(new URL('../wesen/gruppen/vampire/profil.json', import.meta.url), 'utf8'));
  for (const id of expectedIds) {
    const entry = group.related.entries.find(candidate => candidate.id === id);
    assert.equal(entry.href, `../../vampire/${id}/index.html`);
    assert.equal(entry.status, 'Dossier öffnen ↗');
    assert.match(entry.image.alt, /vollständig/i);
  }

  const lord = group.related.entries.find(entry => entry.id === 'vampirfuerst');
  assert.equal(lord.href, null);
  assert.equal(lord.status, 'Dossier vorgemerkt');
  assert.match(lord.image.alt, /vollständig/i);

  const bloodsuckers = group.related.entries.find(entry => entry.id === 'blutsauger');
  assert.equal(bloodsuckers.href, '../blutsauger/index.html');
  assert.equal(bloodsuckers.status, 'Untersektion öffnen ↗');
  assert.match(bloodsuckers.image.alt, /vollständig/i);

  assert.deepEqual(group.related.tiers.map(tier => tier.id), ['vampirfuerst', 'hoehere-vampire', 'striga', 'blutsauger']);
  assert.deepEqual(group.related.tiers.map(tier => tier.variant), ['apex', 'lineage', 'transition', 'subgroup']);
  assert.deepEqual(group.related.tiers[0].entryIds, ['vampirfuerst']);
  assert.deepEqual(group.related.tiers[2].entryIds, ['striga']);
  assert.deepEqual(group.related.tiers[3].entryIds, ['blutsauger']);

  const unknown = group.related.entries.filter(entry => entry.unknown);
  assert.equal(unknown.length, 9);
  assert(unknown.every(entry => entry.name === '???' && entry.href === null && !entry.image));

  const html = await readFile(new URL('../wesen/gruppen/vampire/index.html', import.meta.url), 'utf8');
  assert(html.indexOf('data-related-tier="vampirfuerst"') < html.indexOf('data-related-tier="hoehere-vampire"'));
  assert(html.indexOf('data-related-tier="hoehere-vampire"') < html.indexOf('data-related-tier="striga"'));
  assert(html.indexOf('data-related-tier="striga"') < html.indexOf('data-related-tier="blutsauger"'));
  assert.match(html, /field-related-hierarchy\.css/);
});

test('the Nosferat scene plate remains animated', async () => {
  const nosferat = profiles.find(profile => profile.id === 'nosferat');
  const plate = nosferat.plates.find(candidate => candidate.id === 'wandlung');
  assert(plate);
  assert.match(plate.src, /nosferat-plate\.webp$/);

  const directory = new URL('../wesen/vampire/nosferat/', import.meta.url);
  await access(new URL(plate.src, directory));
});

test('the vampire renderer escapes authored text', () => {
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
  const html = renderVampireProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
