import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { GIANT_PROFILE_IDS } from '../modules/giant-profile/giant-profile-registry.mjs';
import { renderGiantProfile } from '../modules/giant-profile/giant-profile-template.mjs';

const expectedIds = ['joetun', 'goliath', 'zyklop', 'fomoraig', 'tlacharn', 'bogann', 'silvarn'];
const expectedNames = ['Jötun', 'Goliath', 'Zyklop', 'Fomóraig', 'Tlacharn', 'Bogann', 'Silvarn'];
const expectedMetricLabels = {
  joetun: ['Frostherrschaft', 'Eisatem', 'Winterausdauer', 'Ehreninstinkt', 'Gebietskontrolle', 'Wärmeanfälligkeit'],
  goliath: ['Körperkraft', 'Plünderungsdrang', 'Schmerzresistenz', 'Instinktlist', 'Naturerinnerung', 'Furchtgebrüll'],
  zyklop: ['Felswurf', 'Jagdausdauer', 'Scharfsicht', 'Raserei', 'Fehlbildungslast', 'Gruppenfähigkeit'],
  fomoraig: ['Naturbindung', 'Weisheit', 'Tierverständnis', 'Schutzinstinkt', 'Friedfertigkeit', 'Menschenvertrauen'],
  tlacharn: ['Schmiedekunst', 'Tiefensinn', 'Mechanik', 'Herrschaftsdrang', 'Rachsucht', 'Lichtempfindlichkeit'],
  bogann: ['Verderbnisaura', 'Sumpfanpassung', 'Menschenhunger', 'Fluchbindung', 'Sprachvermögen', 'Feuermeidung'],
  silvarn: ['Charisma', 'Täuschung', 'Kultbildung', 'Vorratshortung', 'Körperkraft', 'Heiligenscheu']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/riesen/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(GIANT_PROFILE_IDS.map(readProfile));

test('the giant registry contains every supplied species in overview order', () => {
  assert.deepEqual(GIANT_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/riesen/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderGiantProfile(profile, navigation));
    assert(profile.summary.length >= 190 && profile.summary.length <= 480);
    assert(profile.quote.length >= 45);
    assert(profile.quoteAttribution.length >= 20);
    assert(profile.sections.length >= 8);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert.equal(profile.facts.length, 11);
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert.equal(profile.metrics.labels.includes('Sozialverhalten'), false);
    assert.equal(profile.sections.find(section => section.id === 'unterarten').blocks[0].text, '???');
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/riesen\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('all seven thematic images are local, correctly mapped and uncropped', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/giant-profile-sources.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.items.map(item => item.id), expectedIds);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the giant overview links the seven dossiers and preserves eight unknown slots', async () => {
  const group = JSON.parse(await readFile(new URL('../wesen/gruppen/riesen/profil.json', import.meta.url), 'utf8'));
  for (const id of expectedIds) {
    const entry = group.related.entries.find(candidate => candidate.id === id);
    assert.equal(entry.href, `../../riesen/${id}/index.html`);
    assert.equal(entry.status, 'Dossier öffnen ↗');
  }
  const unknown = group.related.entries.filter(entry => entry.unknown);
  assert.equal(unknown.length, 8);
  assert(unknown.every(entry => entry.name === '???' && entry.href === null));
});

test('the giant renderer escapes authored text', () => {
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
  const html = renderGiantProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
