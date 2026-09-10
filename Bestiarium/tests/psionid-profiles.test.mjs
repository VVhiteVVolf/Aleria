import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { PSIONID_PROFILE_IDS } from '../modules/psionid-profile/psionid-profile-registry.mjs';
import { renderPsionidProfile } from '../modules/psionid-profile/psionid-profile-template.mjs';

const expectedIds = ['lenker', 'sucher', 'lauerer', 'schaedling', 'bruetling', 'wandler'];
const expectedNames = ['Lenker', 'Sucher', 'Lauerer', 'Schädling', 'Brütling', 'Wandler'];
const expectedMetrics = new Map([
  ['lenker', ['Willenstyrannis', 'Schwarmkontrolle', 'Telepathie', 'Telekinese', 'Realitätsdissonanz', 'Körperhärte']],
  ['sucher', ['Gedankenarchiv', 'Willensbruch', 'Magie-Störung', 'Telekinese', 'Telepathie', 'Körperhärte']],
  ['lauerer', ['Titanenkraft', 'Zerstörungswucht', 'Magiespeicher', 'Befehlstreue', 'Eigenwille', 'Zauberkraft']],
  ['schaedling', ['Schwarmzahl', 'Bauleistung', 'Tarnung', 'Telepathie', 'Diensttreue', 'Einzelkampfkraft']],
  ['bruetling', ['Wandlungspotential', 'Schwarmbindung', 'Verpuppung', 'Eigenwille', 'Kampfkraft', 'Formstabilität']],
  ['wandler', ['Metamorphose', 'Absorption', 'Spiegelung', 'Symbiose', 'Formstabilität', 'Eigenwille']]
]);

async function readProfile(id) {
  const directory = new URL(`../wesen/psioniden/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(PSIONID_PROFILE_IDS.map(readProfile));

test('the Psionid registry contains the six supplied dossiers in overview order', () => {
  assert.deepEqual(PSIONID_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/psioniden/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderPsionidProfile(profile, navigation));
    assert(profile.summary.length >= 210);
    assert(profile.quote.length >= 40);
    assert(profile.quoteAttribution.length >= 25);
    assert(profile.sections.length >= 8);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.facts.length >= 12);
    assert.deepEqual(profile.metrics.labels, expectedMetrics.get(profile.id));
    assert.equal(new Set(profile.metrics.labels).size, 6);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/index\.html#infernale"/);
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/psioniden\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|Laurerer|(?:^|\W)\.\.\.(?:\W|$)/i.test(html));
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('Psionid species figures and supplied tableaux keep their correct roles', () => {
  const mapping = new Map(profiles.map(profile => [profile.id, profile]));
  for (const id of expectedIds) {
    assert.match(mapping.get(id).icon.src, new RegExp(`creature-group-profiles/psioniden-${id}\\.webp$`));
    assert.match(mapping.get(id).hero.src, new RegExp(`psionid-profiles/${id}-hero\\.webp$`));
  }
  assert.match(mapping.get('schaedling').summary, /Psionidische Schädlinge/);
  assert.match(mapping.get('schaedling').sections.at(-1).blocks[0].items[0], /gleichnamigen Kobold/);
});

test('the six supplied Psionid tableaux are local and documented', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/psionid-profile-sources.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.items.map(item => item.id), expectedIds.map(id => `${id}-hero`));
  assert.deepEqual(manifest.items.map(item => item.sourceUrl), [
    'https://i.imgur.com/lfCuUra.png',
    'https://i.imgur.com/8N3bOht.png',
    'https://i.imgur.com/hoWoM6E.png',
    'https://i.imgur.com/8O2cqTm.png',
    'https://i.imgur.com/5DQvils.png',
    'https://i.imgur.com/MQ04jZC.png'
  ]);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0 && item.fit === 'contain'));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('the Psionid overview links all completed dossiers and preserves four unknown entries', async () => {
  const overview = JSON.parse(await readFile(new URL('../wesen/gruppen/psioniden/profil.json', import.meta.url), 'utf8'));
  const related = new Map(overview.related.entries.map(entry => [entry.id, entry]));
  for (const id of expectedIds) {
    assert.equal(related.get(id).href, `../../psioniden/${id}/index.html`);
    assert.equal(related.get(id).status, 'Dossier öffnen');
  }
  assert.notEqual(related.get('schaedling').href, '../../kobolde/schaedling/index.html');
  const unknown = [...related.values()].filter(entry => entry.unknown);
  assert.equal(unknown.length, 4);
  assert(unknown.every(entry => entry.name === '???' && entry.href === null));
});

test('Psionid artwork stays uncropped and facts remain beside the narrative', async () => {
  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('Vite registers all Psionid dossier entry points', async () => {
  const config = await readFile(new URL('../../AleriaAlmanach/vite.config.mjs', import.meta.url), 'utf8');
  assert.match(config, /PSIONID_PROFILE_IDS/);
  assert.match(config, /Bestiarium\/wesen\/psioniden/);
});

test('the Psionid renderer escapes authored text', () => {
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
  const html = renderPsionidProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
