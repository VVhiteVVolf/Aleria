import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { OGROID_PROFILE_IDS } from '../modules/ogroid-profile/ogroid-profile-registry.mjs';
import { renderOgroidProfile } from '../modules/ogroid-profile/ogroid-profile-template.mjs';

const expectedIds = ['gorak', 'ognir', 'grimnak', 'bhalgar', 'zarok'];
const expectedNames = ['Gorak', 'Ognir', 'Grimnak', 'Bhalgar', 'Zarok'];
const expectedMetricLabels = {
  gorak: ['Körperhitze', 'Zerstörungskraft', 'Kampfausdauer', 'Schreckensaura', 'Clanordnung', 'Magieresistenz'],
  ognir: ['Kolossalkraft', 'Kälteresistenz', 'Regeneration', 'Dominanzgewalt', 'Kampfintuition', 'Hitzeverträglichkeit'],
  grimnak: ['Schmiedekunst', 'Kälteresistenz', 'Nahkampfkunst', 'Regeneration', 'Gruppenordnung', 'Feueranfälligkeit'],
  bhalgar: ['Blutmagie', 'Schattenjagd', 'Beweglichkeit', 'Regeneration', 'Hinterhaltsplanung', 'Blutabhängigkeit'],
  zarok: ['Fährtenkunst', 'Wildnistarnung', 'Körperkraft', 'Jagdpräzision', 'Bestienführung', 'Strategische Tiefe']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/ogroiden/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(OGROID_PROFILE_IDS.map(readProfile));

test('the ogroid registry contains all supplied lines in overview order', () => {
  assert.deepEqual(OGROID_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/ogroiden/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderOgroidProfile(profile, navigation));
    assert(profile.summary.length >= 190 && profile.summary.length <= 480);
    assert(profile.quote.length >= 45);
    assert(profile.quoteAttribution.length >= 20);
    assert.equal(profile.facts.length, 11);
    assert(profile.sections.length >= 8);
    assert(profile.sections.every(section => section.blocks.length));
    assert.equal(profile.sections.find(section => section.id === 'unterarten').blocks[0].text, '???');
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert.equal(profile.metrics.labels.includes('Sozialverhalten'), false);
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/ogroiden\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    assert.match(profile.icon.alt, /vollständig/i);
    assert.notEqual(profile.icon.src, profile.hero.src);
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('the supplied ogroid figures and scene plates are mapped separately without cropping', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/ogroid-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 11);
  assert.equal(new Set(manifest.items.map(item => item.id)).size, 11);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.fit === 'contain' && item.width > 0 && item.height > 0));
  for (const id of expectedIds) {
    assert(manifest.items.some(item => item.id === `${id}-icon`));
    assert(manifest.items.some(item => item.id === `${id}-hero`));
  }
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the ogroid overview links five dossiers and preserves ten unknown slots', async () => {
  const group = JSON.parse(await readFile(new URL('../wesen/gruppen/ogroiden/profil.json', import.meta.url), 'utf8'));
  for (const id of expectedIds) {
    const entry = group.related.entries.find(candidate => candidate.id === id);
    assert.equal(entry.href, `../../ogroiden/${id}/index.html`);
    assert.equal(entry.status, 'Dossier öffnen ↗');
    assert.match(entry.image.alt, /vollständig/i);
  }
  const unknown = group.related.entries.filter(entry => entry.unknown);
  assert.equal(unknown.length, 10);
  assert(unknown.every(entry => entry.name === '???' && entry.href === null));
});

test('the Zarok profile corrects the legacy name-cell mismatch', () => {
  const zarok = profiles.find(profile => profile.id === 'zarok');
  assert.equal(zarok.facts.find(fact => fact.label === 'Name').value, 'Zarok');
  assert(!zarok.facts.some(fact => fact.label === 'Name' && fact.value === 'Ognir'));
});

test('the ogroid renderer escapes authored text', () => {
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
  const html = renderOgroidProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
