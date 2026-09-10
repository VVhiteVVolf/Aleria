import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { TROLL_PROFILE_IDS } from '../modules/troll-profile/troll-profile-registry.mjs';
import { renderTrollProfile } from '../modules/troll-profile/troll-profile-template.mjs';

const expectedIds = [
  'frosttroll', 'flusstroll', 'waldtroll', 'bergtroll', 'landtroll',
  'hoehlentroll', 'sumpftroll', 'huegeltroll', 'nebeltroll', 'steppentroll',
  'aschetroll', 'tundratroll', 'dschungeltroll', 'tiefentroll', 'steintroll'
];

const expectedNames = [
  'Frosttroll', 'Flusstroll', 'Waldtroll', 'Bergtroll', 'Landtroll',
  'Höhlentroll', 'Sumpftroll', 'Hügeltroll', 'Nebeltroll', 'Steppentroll',
  'Aschetroll', 'Tundratroll', 'Dschungeltroll', 'Tiefentroll', 'Steintroll'
];

const expectedMetricLabels = {
  frosttroll: ['Kälteresistenz', 'Eisatem', 'Schneetarnung', 'Hinterhalt', 'Regeneration', 'Hitzeanfälligkeit'],
  flusstroll: ['Schwimmkraft', 'Sprachvermögen', 'Geruchssinn', 'Konfliktscheu', 'Anpassung', 'Feueranfälligkeit'],
  waldtroll: ['Waldtarnung', 'Hinterhalt', 'Körperkraft', 'Regeneration', 'Reviertrieb', 'Feuerfurcht'],
  bergtroll: ['Körpermasse', 'Zähigkeit', 'Regeneration', 'Angriffswille', 'Sprachvermögen', 'Feueranfälligkeit'],
  landtroll: ['Verhandlung', 'List', 'Sprachvermögen', 'Körperkraft', 'Sesshaftigkeit', 'Selbstüberschätzung'],
  hoehlentroll: ['Dunkelgehör', 'Geruchssinn', 'Engstellenkampf', 'Zähigkeit', 'Lichtempfindlichkeit', 'Fluchttrieb'],
  sumpftroll: ['Rottendruck', 'Sumpftarnung', 'Fäulniszähigkeit', 'Schwimmkraft', 'Sprachvermögen', 'Feuerresistenz'],
  huegeltroll: ['Körpermasse', 'Langzeitstarre', 'Sonnenverträglichkeit', 'Stoffwechselruhe', 'Konfliktlust', 'Regeneration'],
  nebeltroll: ['Nebeltarnung', 'Stimmenimitation', 'Hinterhalt', 'Spürsinn', 'Körperkraft', 'Lichtempfindlichkeit'],
  steppentroll: ['Hitzeresistenz', 'Ausdauerjagd', 'Tageslichtverträglichkeit', 'Revierweite', 'Regeneration', 'Kälteanfälligkeit'],
  aschetroll: ['Feuerresistenz', 'Riesenblut', 'Befehlsprägung', 'Körperkraft', 'Regeneration', 'Kälteanfälligkeit'],
  tundratroll: ['Kälteresistenz', 'Schneesicht', 'Zähigkeit', 'Aggression', 'Verhandlungswille', 'Hitzeanfälligkeit'],
  dschungeltroll: ['Kletterkraft', 'Bewegungswahrnehmung', 'Rottenjagd', 'Ritualverhalten', 'Werkzeuggebrauch', 'Offenlandschwäche'],
  tiefentroll: ['Dunkelsicht', 'Echospürsinn', 'Zähigkeit', 'Verfolgungsdrang', 'Lichtempfindlichkeit', 'Sprachvermögen'],
  steintroll: ['Gesteinshärte', 'Unsterblichkeit', 'Regenerationsdauer', 'Passivität', 'Magieresistenz', 'Beweglichkeit']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/trolle/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(TROLL_PROFILE_IDS.map(readProfile));

test('the troll registry contains all supplied species in overview order', () => {
  assert.deepEqual(TROLL_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/trolle/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderTrollProfile(profile, navigation));
    assert(profile.summary.length >= 190 && profile.summary.length <= 480);
    assert(profile.quote.length >= 45);
    assert(profile.quoteAttribution.length >= 20);
    assert(profile.sections.length >= 7);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert.equal(profile.facts.length, 11);
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert.equal(profile.metrics.labels.includes('Sozialverhalten'), false);
    assert.equal(profile.sections.find(section => section.id === 'unterarten').blocks[0].text, '???');
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/trolle\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('theme images are local, mapped to the correct troll and rendered without cropping', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/troll-profile-sources.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.items.map(item => item.id), expectedIds);
  assert.equal(manifest.items.filter(item => item.sourceType === 'user-provided-profile-table').length, 11);
  assert.equal(manifest.items.filter(item => item.sourceType === 'generated-for-missing-theme-image').length, 4);
  assert(manifest.items.filter(item => item.sourceType === 'generated-for-missing-theme-image').every(item => item.width === item.height));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the troll overview links every completed species dossier', async () => {
  const group = JSON.parse(await readFile(new URL('../wesen/gruppen/trolle/profil.json', import.meta.url), 'utf8'));
  for (const id of expectedIds) {
    const entry = group.related.entries.find(candidate => candidate.id === id);
    assert.equal(entry.href, `../../trolle/${id}/index.html`);
    assert.equal(entry.status, 'Dossier öffnen ↗');
  }
});

test('the troll renderer escapes authored text', () => {
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
  const html = renderTrollProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
