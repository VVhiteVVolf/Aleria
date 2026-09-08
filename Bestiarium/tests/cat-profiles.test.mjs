import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { CAT_PROFILE_IDS } from '../modules/cat-profile/cat-profile-registry.mjs';
import { renderCatProfile } from '../modules/cat-profile/cat-profile-template.mjs';

const expectedIds = [
  'ruachar', 'duriyn', 'fialmor', 'velir', 'skjarn',
  'cenyric', 'lethin', 'cerix', 'targwyn', 'samtlicht'
];

const expectedNames = [
  'Ruachar', 'Dúriyn', 'Fialmor', 'Velir', 'Skjarn',
  'Cenyric', 'Lethin', 'Cérix', 'Targwyn', 'Samtlicht'
];

const expectedSections = [
  'Einführung', 'Herkunft', 'Erscheinungsbild', 'Rassenmerkmale',
  'Verhalten', 'Beziehung zum Menschen', 'Eigenarten', 'Trivia'
];

const expectedFacts = [
  'Name', 'Typ', 'Herkunft', 'Größe', 'Körperbau', 'Aktivzeiten',
  'Bedrohungsgrad', 'Bevorzugte Beute', 'Besonderheiten'
];

const sourceUrls = [
  'https://i.imgur.com/P4mjiS8.png', 'https://i.imgur.com/f4FmBSz.png',
  'https://i.imgur.com/q1ZEIwM.png', 'https://i.imgur.com/8V0Z6Hi.png',
  'https://i.imgur.com/HaMBYN4.png', 'https://i.imgur.com/0mScrzm.png',
  'https://i.imgur.com/BfZVBKu.png', 'https://i.imgur.com/2CihWV7.png',
  'https://i.imgur.com/Wqkv4ux.png', 'https://i.imgur.com/ECtH4eD.png'
];

const loreMarkers = {
  ruachar: 'Ruhe – Beobachtung – Gewalt – Ruhe',
  duriyn: 'sauberen Hof',
  fialmor: 'Kaninchen oder Fasane',
  velir: 'Fjordheim',
  skjarn: 'geschlossener Türen',
  cenyric: 'Avallorn',
  lethin: 'Weisenfluher Samtlichts',
  cerix: 'Haus Cath',
  targwyn: 'Dächer, Mauerkanten, Märkte',
  samtlicht: 'Völlige Nutzlosigkeit'
};

async function readProfile(id) {
  const directory = new URL(`../tiere/vieh/haustiere/katzen/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(CAT_PROFILE_IDS.map(readProfile));

test('the cat registry contains all ten supplied dossiers in atlas order', () => {
  assert.deepEqual(CAT_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.id), expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
  assert.equal(new Set(CAT_PROFILE_IDS).size, 10);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../tiere/vieh/haustiere/katzen/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderCatProfile(profile, navigation));
    assert(profile.summary.length >= 100);
    assert(profile.quote.length >= 20);
    assert(profile.quoteAttribution.length >= 10);
    assert.deepEqual(profile.sections.map(section => section.title), expectedSections);
    assert(profile.sections.every(section => section.id && section.blocks.length));
    assert(profile.sections.every(section => section.blocks.every(block => (
      block.type === 'list' ? block.items.length > 0 : Boolean(block.text)
    ))));
    const trivia = profile.sections.find(section => section.id === 'trivia');
    assert.equal(trivia.blocks.length, 1);
    assert.equal(trivia.blocks[0].items.length, 3);
    assert.deepEqual(profile.facts.map(fact => fact.label), expectedFacts);
    assert(profile.facts.every(fact => fact.value.length > 0));
    assert.deepEqual(profile.metrics.labels, ['Bindung', 'Lernfähigkeit', 'Körperkraft', 'Ausdauer', 'Sozialverhalten', 'Arbeits-/Jagdtrieb']);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert(html.indexOf('pet-profile-narrative') < html.indexOf('pet-profile-facts'));
    assert(html.includes(loreMarkers[profile.id]));
    assert(html.includes(`../index.html#bestand-${profile.parentGroupId}`));
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|\.\.\.|\?\?\?/i.test(html));
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('the cat overview links ten dossiers and retains fifteen empty regional slots', async () => {
  const directory = new URL('../tiere/vieh/haustiere/katzen/', import.meta.url);
  const overview = JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8'));
  const entries = overview.catalog.groups.flatMap(group => group.entries);
  const available = entries.filter(entry => entry.href);
  const unknown = entries.filter(entry => entry.unknown);

  assert.deepEqual(available.map(entry => entry.id), expectedIds);
  assert(available.every(entry => entry.status === 'Dossier verfügbar'));
  assert.equal(unknown.length, 15);
  assert(unknown.every(entry => entry.title === '???'));
  assert(unknown.every(entry => entry.href === null && entry.images.length === 0));
  assert.deepEqual(overview.catalog.groups.map(group => group.entries.length), [5, 5, 5, 5, 5]);
  await Promise.all(available.map(entry => access(new URL(entry.href, directory))));
});

test('all ten supplied profile illustrations are archived with their source dimensions', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/cat-profile-sources.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.items.map(item => item.id), expectedIds);
  assert.deepEqual(manifest.items.map(item => item.sourceUrl), sourceUrls);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('cat and dog images share explicit contain rules that never crop a breed image', async () => {
  const css = await readFile(new URL('../modules/pet-profile/pet-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.pet-profile .livestock-icon'));
  assert(css.includes('.pet-profile .livestock-hero-image'));
  assert.equal((css.match(/object-fit:\s*contain/g) || []).length, 1);
  assert(!/object-fit:\s*cover/.test(css));
});

test('the cat-profile renderer escapes authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe,
    icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }, { type: 'list', items: [unsafe] }] }]
  };
  const html = renderCatProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
