import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { SYLVANID_PROFILE_IDS } from '../modules/sylvanid-profile/sylvanid-profile-registry.mjs';
import { renderSylvanidProfile } from '../modules/sylvanid-profile/sylvanid-profile-template.mjs';

const expectedIds = ['waldschrat', 'erlschrat', 'zatrakin'];
const expectedNames = ['Waldschrat', 'Erlschrat', 'Zatrakin'];
const expectedMetrics = new Map([
  ['waldschrat', ['Reviermacht', 'Totemrückkehr', 'Gestaltwandel', 'Naturflüche', 'Jagdbesessenheit', 'Wahnsinnsdruck']],
  ['erlschrat', ['Zielbindung', 'Seelenspur', 'Fluchverderbnis', 'Schattenschritt', 'Runenresistenz', 'Unholdbrut']],
  ['zatrakin', ['Jagdkunst', 'Taktik', 'Anpassung', 'Willenskraft', 'Naturmagie', 'Gunst Zatrachs']]
]);

async function readProfile(id) {
  const directory = new URL(`../wesen/sylvaniiden/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(SYLVANID_PROFILE_IDS.map(readProfile));

test('the Sylvanid registry contains the three supplied dossiers in overview order', () => {
  assert.deepEqual(SYLVANID_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/sylvaniiden/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderSylvanidProfile(profile, navigation));
    assert(profile.summary.length >= 210);
    assert(profile.quote.length >= 45);
    assert(profile.quoteAttribution.length >= 25);
    assert(profile.sections.length >= 8);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.facts.length >= 12);
    assert.deepEqual(profile.metrics.labels, expectedMetrics.get(profile.id));
    assert.equal(new Set(profile.metrics.labels).size, 6);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/index\.html#infernale"/);
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/sylvaniiden\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.\.\.(?:\W|$)/i.test(html));
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('species figures and tableaux keep their correct roles', () => {
  const mapping = new Map(profiles.map(profile => [profile.id, profile]));
  assert.match(mapping.get('waldschrat').icon.src, /sylvaniiden-waldschrat\.webp$/);
  assert.match(mapping.get('waldschrat').hero.src, /waldschrat-hero\.webp$/);
  assert.match(mapping.get('erlschrat').icon.src, /sylvaniiden-erlschrat\.webp$/);
  assert.match(mapping.get('erlschrat').hero.src, /erlschrat-hero\.webp$/);
  assert.match(mapping.get('zatrakin').icon.src, /sylvaniiden-zatrakin\.webp$/);
  assert.match(mapping.get('zatrakin').hero.src, /zatrakin-hero\.webp$/);
});

test('the supplied and generated tableaux are local and documented', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/sylvanid-profile-sources.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.items.map(item => item.id), ['waldschrat-hero', 'erlschrat-hero', 'zatrakin-hero']);
  assert.equal(manifest.items[0].sourceUrl, 'https://i.imgur.com/gYRWp9v.png');
  assert.equal(manifest.items[2].sourceUrl, 'https://i.imgur.com/v2h1qji.png');
  const erlschrat = manifest.items[1];
  assert.equal(erlschrat.sourceType, 'generated-scene-tableau');
  assert.equal(erlschrat.generationMode, 'edit-from-reference');
  assert.equal(erlschrat.width, erlschrat.height);
  assert.match(erlschrat.reference, /sylvaniiden-erlschrat\.webp$/);
  assert(erlschrat.generationPrompt.length >= 300);
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('the Sylvanid overview links new and already existing canonical dossiers', async () => {
  const overview = JSON.parse(await readFile(new URL('../wesen/gruppen/sylvaniiden/profil.json', import.meta.url), 'utf8'));
  const related = new Map(overview.related.entries.map(entry => [entry.id, entry]));
  const expectedLinks = new Map([
    ['waldschrat', '../../sylvaniiden/waldschrat/index.html'],
    ['erlschrat', '../../sylvaniiden/erlschrat/index.html'],
    ['zatrakin', '../../sylvaniiden/zatrakin/index.html'],
    ['zarok', '../../ogroiden/zarok/index.html'],
    ['hornling', '../../kobolde/hornling/index.html']
  ]);
  for (const [id, href] of expectedLinks) {
    assert.equal(related.get(id).href, href);
    assert.equal(related.get(id).status, 'Dossier öffnen');
  }
  assert.equal([...related.values()].filter(entry => entry.unknown).length, 6);
  assert([...related.values()].filter(entry => entry.unknown).every(entry => entry.href === null));
});

test('Sylvanid artwork stays uncropped and facts remain beside the narrative', async () => {
  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('Vite registers all Sylvanid dossier entry points', async () => {
  const config = await readFile(new URL('../../AleriaAlmanach/vite.config.mjs', import.meta.url), 'utf8');
  assert.match(config, /SYLVANID_PROFILE_IDS/);
  assert.match(config, /Bestiarium\/wesen\/sylvaniiden/);
});

test('the Sylvanid renderer escapes authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe,
    icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    metrics: { labels: ['A', 'B', 'C'], values: [1, 2, 3], source: unsafe },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }] }],
    plates: []
  };
  const html = renderSylvanidProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
