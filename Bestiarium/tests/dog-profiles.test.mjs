import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { DOG_PROFILE_IDS } from '../modules/dog-profile/dog-profile-registry.mjs';
import { renderDogProfile } from '../modules/dog-profile/dog-profile-template.mjs';

const expectedIds = [
  'dubghar', 'lannfoal', 'fairaeg', 'gamir', 'herdskal',
  'trywydd', 'ponter', 'brag', 'rhedwyr', 'gorfael',
  'brodgi', 'clachair', 'refgi', 'tryw', 'bugail'
];

const expectedNames = [
  'Dubghar', 'Lannfoal', 'Fairaeg', 'Gamir', 'Herdskal',
  'Trywydd', 'Ponter', 'Brág', 'Rhedwyr', 'Gorfael',
  'Brodgi', 'Clachair', 'Refgi', 'Tryw', 'Bugail'
];

const expectedSections = [
  'Einführung', 'Herkunft & Zucht', 'Erscheinungsbild', 'Verhalten',
  'Beziehung zum Menschen', 'Zähmung & Ausbildung', 'Stärken & Schwächen', 'Trivia'
];

const expectedFacts = [
  'Name', 'Typ', 'Herkunft', 'Abstammung', 'Status', 'Intelligenz',
  'Niveau der Zucht', 'Preis', 'Stärke', 'Schwächen', 'Besonderheit'
];

const sourceUrls = [
  'https://i.imgur.com/yOqszfA.png', 'https://i.imgur.com/vNVZ7nS.png', 'https://i.imgur.com/ju1B23D.png',
  'https://i.imgur.com/hKW2rN9.png', 'https://i.imgur.com/2QYW2Az.png', 'https://i.imgur.com/f1VSS3d.png',
  'https://i.imgur.com/VzxL9M0.png', 'https://i.imgur.com/ZKbCWTF.png', 'https://i.imgur.com/dCJ9lNz.png',
  'https://i.imgur.com/xvifqoJ.png', 'https://i.imgur.com/qDNup0M.png', 'https://i.imgur.com/lryPLBA.png',
  'https://i.imgur.com/tj9dDUN.png', 'https://i.imgur.com/cLkhrHc.png', 'https://i.imgur.com/qgTewMC.png'
];

async function readProfile(id) {
  const directory = new URL(`../tiere/vieh/haustiere/hunde/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(DOG_PROFILE_IDS.map(readProfile));

test('the dog registry contains all fifteen supplied dossiers in atlas order', () => {
  assert.deepEqual(DOG_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.id), expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
  assert.equal(new Set(DOG_PROFILE_IDS).size, 15);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../tiere/vieh/haustiere/hunde/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderDogProfile(profile, navigation));
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
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|\.\.\.|\?\?\?/i.test(html));
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('known source copy errors are repaired using each breed lore', () => {
  const byId = Object.fromEntries(profiles.map(profile => [profile.id, profile]));
  const sectionText = (profile, id) => JSON.stringify(profile.sections.find(section => section.id === id).blocks);
  assert(!sectionText(byId.lannfoal, 'zaehmung-und-ausbildung').includes('Dubghar'));
  assert(sectionText(byId.lannfoal, 'zaehmung-und-ausbildung').includes('erfahrene Hände'));
  assert(sectionText(byId.refgi, 'beziehung-zum-menschen').includes('Der Refgi'));
  assert(!sectionText(byId.clachair, 'zaehmung-und-ausbildung').includes('Brodgi'));
  assert(sectionText(byId.clachair, 'zaehmung-und-ausbildung').includes('Rollenverständnis'));
});

test('the dog overview links fifteen dossiers and keeps six incomplete records open', async () => {
  const directory = new URL('../tiere/vieh/haustiere/hunde/', import.meta.url);
  const overview = JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8'));
  const entries = overview.catalog.groups.flatMap(group => group.entries);
  const available = entries.filter(entry => entry.href);
  const unknown = entries.filter(entry => entry.unknown);
  const poodle = entries.find(entry => entry.id === 'pudel');

  assert.deepEqual(available.map(entry => entry.id), expectedIds);
  assert(available.every(entry => entry.status === 'Dossier verfügbar'));
  assert.deepEqual(unknown.map(entry => entry.title), Array(5).fill('???'));
  assert(unknown.every(entry => entry.href === null && entry.status === 'Noch unausgefüllt'));
  assert.equal(poodle.href, null);
  assert.equal(poodle.status, 'Dossier noch nicht ausgearbeitet');
  assert.equal(overview.catalog.groups.find(group => group.id === 'aldrimar').title, 'Aldrimar');
  assert.equal(entries.find(entry => entry.id === 'brag').title, 'Brág');
  await Promise.all(available.map(entry => access(new URL(entry.href, directory))));
});

test('all fifteen supplied profile illustrations are archived with their source dimensions', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/dog-profile-sources.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.items.map(item => item.id), expectedIds);
  assert.deepEqual(manifest.items.map(item => item.sourceUrl), sourceUrls);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('dog images use the shared pet profile rules and are explicitly contained instead of cropped', async () => {
  const css = await readFile(new URL('../modules/pet-profile/pet-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.pet-profile .livestock-icon'));
  assert(css.includes('.pet-profile .livestock-hero-image'));
  assert.equal((css.match(/object-fit:\s*contain/g) || []).length, 1);
  assert(!/object-fit:\s*cover/.test(css));
});

test('dog dossiers use a shared metrics panel and keep Wissenswertes beside the narrative', async () => {
  const template = await readFile(new URL('../modules/pet-profile/pet-profile-template.mjs', import.meta.url), 'utf8');
  const css = await readFile(new URL('../modules/pet-profile/pet-profile.css', import.meta.url), 'utf8');
  assert(template.includes('renderProfileMetrics(record.metrics'));
  assert(template.includes('pet-profile-reading'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
  assert(css.includes('.pet-profile-facts { position: sticky'));
  assert(css.includes('grid-template-columns: minmax(0, 82px) minmax(0, 1fr)'));
  assert(css.includes('padding: 12px 0'));
  assert(css.includes('overflow-wrap: anywhere'));
});

test('the dog-profile renderer escapes authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe,
    icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }, { type: 'list', items: [unsafe] }] }]
  };
  const html = renderDogProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
