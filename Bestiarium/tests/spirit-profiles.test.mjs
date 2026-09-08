import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { SPIRIT_PROFILE_IDS } from '../modules/spirit-profile/spirit-profile-registry.mjs';
import { renderSpiritProfile } from '../modules/spirit-profile/spirit-profile-template.mjs';

const expectedIds = [
  'dullahan',
  'erscheinungen',
  'mahr',
  'daemon',
  'waechtergeist',
  'naturahne',
  'irrlichtmutter',
  'banshee'
];

const expectedNames = [
  'Dullahan',
  'Erscheinungen',
  'Mahr',
  'Dämon',
  'Wächtergeist',
  'Naturahne',
  'Irrlichter und Irrlichtmutter',
  'Banshee (Todesfee)'
];

const expectedMetricLabels = {
  dullahan: ['Ruhelosigkeit', 'Körperbindung', 'Schreckensaura', 'Jagdtrieb', 'Geschwindigkeit', 'Erlösbarkeit'],
  erscheinungen: ['Wahrnehmbarkeit', 'Ortsbindung', 'Zeitbindung', 'Illusionskraft', 'Aggression', 'Kommunikation'],
  mahr: ['Heimlichkeit', 'Wirtsbindung', 'Traumkontrolle', 'Leidverstärkung', 'Besitzergreifung', 'Exorzismusresistenz'],
  daemon: ['Besessenheit', 'Wirtsformung', 'Infernalenergie', 'Zielstrebigkeit', 'Anpassung', 'Exorzismusresistenz'],
  waechtergeist: ['Schutzmacht', 'Gebietsbindung', 'Urteilsvermögen', 'Barrieren', 'Lichtmacht', 'Entweihungsresistenz'],
  naturahne: ['Hainbindung', 'Naturkontrolle', 'Unsichtbarkeit', 'Gleichgewichtszwang', 'Tiermanifestation', 'Ritualresistenz'],
  irrlichtmutter: ['Täuschung', 'Territoriumsbindung', 'Irrlichtkontrolle', 'Rachedrang', 'Nebelmacht', 'Bannresistenz'],
  banshee: ['Todesahnung', 'Klagemacht', 'Familienbindung', 'Körperlosigkeit', 'Aggression', 'Erlösbarkeit']
};

const profilesWithUnknownSubtypes = new Set([
  'mahr',
  'daemon',
  'waechtergeist',
  'naturahne',
  'irrlichtmutter',
  'banshee'
]);

async function readProfile(id) {
  const directory = new URL(`../wesen/geister/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(SPIRIT_PROFILE_IDS.map(readProfile));

test('the spirit profile registry contains all supplied entries in dossier order', () => {
  assert.deepEqual(SPIRIT_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/geister/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderSpiritProfile(profile, navigation));
    assert(profile.summary.length >= 190);
    assert(profile.quote.length >= 55);
    assert(profile.quoteAttribution.length >= 20);
    assert(profile.sections.length >= 7);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert.equal(profile.facts.length, 11);
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert.equal(JSON.stringify(profile).includes('???'), profilesWithUnknownSubtypes.has(profile.id));
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/geister\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher/i.test(html));

    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('the supplied spirit images are local, correctly mapped and rendered without cropping', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/spirit-profile-sources.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.items.map(item => item.id), expectedIds);
  assert(manifest.items.every(item => item.sourceType.startsWith('user-provided-profile-table')));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the Geister overview links every completed entry to its dossier', async () => {
  const group = JSON.parse(await readFile(new URL('../wesen/gruppen/geister/profil.json', import.meta.url), 'utf8'));
  const expectedTargets = {
    dullahan: '../../geister/dullahan/index.html',
    erscheinung: '../../geister/erscheinungen/index.html',
    mahr: '../../geister/mahr/index.html',
    daemon: '../../geister/daemon/index.html',
    waechtergeist: '../../geister/waechtergeist/index.html',
    naturahne: '../../geister/naturahne/index.html',
    irrlicht: '../../geister/irrlichtmutter/index.html',
    banshee: '../../geister/banshee/index.html'
  };

  for (const [id, href] of Object.entries(expectedTargets)) {
    const entry = group.related.entries.find(candidate => candidate.id === id);
    assert.equal(entry.href, href);
    assert.equal(entry.status, 'Dossier öffnen ↗');
  }
});

test('the spirit profile renderer escapes authored text', () => {
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
  const html = renderSpiritProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
