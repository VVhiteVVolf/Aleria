import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { KOBOLD_PROFILE_IDS } from '../modules/kobold-profile/kobold-profile-registry.mjs';
import { renderKoboldProfile } from '../modules/kobold-profile/kobold-profile-template.mjs';

const expectedIds = [
  'feuerkobold', 'leidling', 'grimling', 'blutling', 'hornling',
  'drachling', 'schaedling', 'racheling', 'wunschling', 'lustling'
];
const expectedNames = [
  'Feuerkobold', 'Leidling', 'Grimling', 'Blutling', 'Hornling',
  'Drachling', 'Schädling', 'Racheling', 'Wunschling', 'Lustling'
];
const expectedMetricLabels = {
  feuerkobold: ['Brandmacht', 'Feuerbindung', 'Gleitflug', 'Gruppenbrand', 'Kälteschwäche', 'Körperresistenz'],
  leidling: ['Leidresonanz', 'Körperlosigkeit', 'Melancholieaura', 'Klagesammlung', 'Kampfvermögen', 'Trauerbindung'],
  grimling: ['Überfalllist', 'Plünderungsdrang', 'Rudeldruck', 'Waffenimprovisation', 'Disziplin', 'Magiebegabung'],
  blutling: ['Blutdurst', 'Rudeljagd', 'Klauenhärte', 'Furchtlosigkeit', 'Fährteninstinkt', 'Verstand'],
  hornling: ['Fährtenlesen', 'Waldtarnung', 'Fallenbau', 'Ritualtreue', 'Revierbindung', 'Nahkampfhärte'],
  drachling: ['Elementarkraft', 'Schuppenpanzer', 'Flugvermögen', 'Schatzgier', 'Kampfgeschick', 'Langzeitplanung'],
  schaedling: ['Schwarmdienst', 'Gedankensprache', 'Tarnung', 'Baupflege', 'Eigenwille', 'Einzelkampfkraft'],
  racheling: ['Racheflüstern', 'Gedankenlese', 'Schattentarnung', 'Giftkunde', 'Agilität', 'Nahkampfausdauer'],
  wunschling: ['Wunschverdrehung', 'Illusionskunst', 'Sprachmagie', 'Verhandlungsgeschick', 'Regelbindung', 'Körperkraft'],
  lustling: ['Dienstinstinkt', 'Unauffälligkeit', 'Beobachtungsgabe', 'Aufgabentreue', 'Geistresistenz', 'Kampfkraft']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/kobolde/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(KOBOLD_PROFILE_IDS.map(readProfile));

test('the kobold registry contains all supplied lines in overview order', () => {
  assert.deepEqual(KOBOLD_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/kobolde/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderKoboldProfile(profile, navigation));
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
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/kobolde\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    assert.match(profile.icon.alt, /vollständig/i);
    assert.notEqual(profile.icon.src, profile.hero.src);
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('the supplied kobold figures and scene plates are mapped separately without cropping', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/kobold-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 21);
  assert.equal(new Set(manifest.items.map(item => item.id)).size, 21);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.fit === 'contain' && item.width > 0 && item.height > 0));
  for (const id of expectedIds) {
    assert(manifest.items.some(item => item.id === `${id}-icon`));
    assert(manifest.items.some(item => item.id === `${id}-hero`));
  }
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('.field-related-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the kobold overview links all ten dossiers and preserves five unknown slots', async () => {
  const group = JSON.parse(await readFile(new URL('../wesen/gruppen/kobolde/profil.json', import.meta.url), 'utf8'));
  for (const id of expectedIds) {
    const entry = group.related.entries.find(candidate => candidate.id === id);
    assert.equal(entry.href, `../../kobolde/${id}/index.html`);
    assert.equal(entry.status, 'Dossier öffnen ↗');
    assert.match(entry.image.alt, /vollständig/i);
  }
  const unknown = group.related.entries.filter(entry => entry.unknown);
  assert.equal(unknown.length, 5);
  assert(unknown.every(entry => entry.name === '???' && entry.href === null));
});

test('the kobold renderer escapes authored text', () => {
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
  const html = renderKoboldProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
