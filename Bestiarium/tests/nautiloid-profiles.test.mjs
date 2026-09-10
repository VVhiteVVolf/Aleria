import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { NAUTILOID_PROFILE_IDS } from '../modules/nautiloid-profile/nautiloid-profile-registry.mjs';
import { renderNautiloidProfile } from '../modules/nautiloid-profile/nautiloid-profile-template.mjs';

const expectedIds = ['thraalkin', 'sirenen'];
const expectedNames = ['Thraalkin', 'Sirenen'];
const expectedMetrics = new Map([
  ['thraalkin', ['Schwarmordnung', 'Tiefentoleranz', 'Gifthaut', 'Schuppenpanzer', 'Ritualmacht', 'Landabhängigkeit']],
  ['sirenen', ['Lockgesang', 'Illusionsmacht', 'Lebensraub', 'Nebeltarnung', 'Schwarmplanung', 'Willensabwehr']]
]);

async function readProfile(id) {
  const directory = new URL(`../wesen/nautiloiden/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(NAUTILOID_PROFILE_IDS.map(readProfile));

test('the Nautiloid registry contains the two supplied species in overview order', () => {
  assert.deepEqual(NAUTILOID_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/nautiloiden/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderNautiloidProfile(profile, navigation));
    assert(profile.summary.length >= 180);
    assert(profile.quote.length >= 55);
    assert(profile.quoteAttribution.length >= 25);
    assert(profile.sections.length >= 9);
    assert(profile.sections.every(section => section.blocks.length));
    assert.equal(profile.sections.find(section => section.id === 'unterarten')?.blocks[0].text, '???');
    assert(profile.facts.length >= 12);
    assert.deepEqual(profile.metrics.labels, expectedMetrics.get(profile.id));
    assert.equal(new Set(profile.metrics.labels).size, 6);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/index\.html#infernale"/);
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/nautiloiden\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher/i.test(html));
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
    await Promise.all(profile.plates.map(plate => access(new URL(plate.src, directory))));
  });
}

test('the Siren gallery contains both supplied species figures and all four bonus images', () => {
  const sirens = profiles.find(profile => profile.id === 'sirenen');
  assert.equal(sirens.platesTitle, 'Sirenen-Galerie');
  assert.equal(sirens.plates.length, 6);
  assert.deepEqual(sirens.plates.slice(2).map(plate => plate.src), [
    '../../../assets/nautiloid-profiles/sirenen-galerie-01.webp',
    '../../../assets/nautiloid-profiles/sirenen-galerie-02.webp',
    '../../../assets/nautiloid-profiles/sirenen-galerie-03.webp',
    '../../../assets/nautiloid-profiles/sirenen-galerie-04.webp'
  ]);
});

test('the supplied aquatic tableaux are local, documented and mapped to the correct roles', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/nautiloid-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 8);
  assert.equal(new Set(manifest.items.map(item => item.id)).size, 8);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  assert.deepEqual(manifest.items.slice(4).map(item => item.sourceUrl), [
    'https://i.imgur.com/GhmuhfJ.png',
    'https://i.imgur.com/5tsxGyD.png',
    'https://i.imgur.com/MXOwrmM.png',
    'https://i.imgur.com/o5Sb27P.png'
  ]);
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('the Nautiloid overview links only the two completed dossiers', async () => {
  const overview = JSON.parse(await readFile(new URL('../wesen/gruppen/nautiloiden/profil.json', import.meta.url), 'utf8'));
  const related = new Map(overview.related.entries.map(entry => [entry.id, entry]));
  assert.equal(related.get('thraalkin').href, '../../nautiloiden/thraalkin/index.html');
  assert.equal(related.get('sirenen').href, '../../nautiloiden/sirenen/index.html');
  assert.equal(related.get('leviathan').href, null);
  assert([...related.values()].filter(entry => entry.href).every(entry => entry.status === 'Dossier öffnen'));
});

test('Nautiloid artwork is rendered without cropping and facts stay beside the narrative', async () => {
  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('.field-plate img'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('Vite registers both Nautiloid dossier entry points', async () => {
  const config = await readFile(new URL('../../AleriaAlmanach/vite.config.mjs', import.meta.url), 'utf8');
  assert.match(config, /NAUTILOID_PROFILE_IDS/);
  assert.match(config, /Bestiarium\/wesen\/nautiloiden/);
});

test('the Nautiloid renderer escapes authored text and gallery headings', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe,
    platesTitle: unsafe, platesEyebrow: unsafe, icon: image, hero: image,
    facts: [{ label: unsafe, value: unsafe }],
    metrics: { labels: ['A', 'B', 'C'], values: [1, 2, 3], source: unsafe },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }] }],
    plates: [image]
  };
  const html = renderNautiloidProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
