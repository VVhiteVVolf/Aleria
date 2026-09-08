import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { PET_BREED_GROUPS, PET_BREED_GROUP_IDS } from '../modules/pet-breed/pet-breed-registry.mjs';
import { renderPetBreedOverview } from '../modules/pet-breed/pet-breed-template.mjs';

const expectedDogIds = [
  'dubghar', 'lannfoal', 'fairaeg',
  'gamir', 'herdskal',
  'trywydd', 'ponter', 'brug', 'rhedwyr', 'gorfael', 'brodgi', 'clachair', 'refgi', 'tryw', 'bugail',
  'pudel', 'unbekannt-lothir-1', 'unbekannt-lothir-2', 'unbekannt-lothir-3', 'unbekannt-lothir-4',
  'unbekannt-aldervan-1'
];

const expectedCatIds = [
  'ruachar', 'duriyn', 'fialmor',
  'velir', 'skjarn',
  'cenyric', 'lethin', 'cerix', 'targwyn',
  'samtlicht'
];

async function readPetGroup(id) {
  const directory = new URL(`../tiere/vieh/haustiere/${id}/`, import.meta.url);
  return {
    directory,
    record: JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8')),
    html: await readFile(new URL('index.html', directory), 'utf8')
  };
}

function entriesOf(record) {
  return record.catalog.groups.flatMap(group => group.entries);
}

function localReferences(html) {
  return [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(match => match[1].split('#')[0])
    .filter(reference => reference && !reference.startsWith('http'));
}

test('the Haustiere registry contains dogs and cats', () => {
  assert.deepEqual(PET_BREED_GROUP_IDS, ['hunde', 'katzen']);
  assert.deepEqual(PET_BREED_GROUPS.map(group => group.title), ['Hunde', 'Katzen']);
});

test('both generated breed pages match their records and stay local', async () => {
  for (const id of PET_BREED_GROUP_IDS) {
    const { directory, record, html } = await readPetGroup(id);
    assert.equal(record.id, id);
    assert.equal(html.replace(/\r\n/g, '\n'), renderPetBreedOverview(record));
    assert.equal((html.match(/class="livestock-tabs livestock-tabs--2"/g) || []).length, 1);
    assert.equal((html.match(/aria-current="page"/g) || []).length, 2);
    assert(!/https?:\/\//.test(html));
    assert(!/animexx|tumblr_otwjgn/i.test(html));
    assert(!/\son(?:click|input|change)=/i.test(html));
    await Promise.all(localReferences(html).map(reference => access(new URL(reference, directory))));
  }
});

test('all 21 dog images become cards and only the five unnamed images get placeholders', async () => {
  const { record, html } = await readPetGroup('hunde');
  const entries = entriesOf(record);
  assert.deepEqual(entries.map(entry => entry.id), expectedDogIds);
  assert.equal(entries.length, 21);
  const unknown = entries.filter(entry => entry.unknown);
  assert.equal(unknown.length, 5);
  assert(unknown.every(entry => entry.title === 'Noch unbekannt'));
  assert(unknown.every(entry => entry.status === 'Name noch unbekannt'));
  assert.equal((html.match(/<h3>Noch unbekannt<\/h3>/g) || []).length, 5);
  assert.equal((html.match(/livestock-entry--unknown/g) || []).length, 5);
  assert(entries.filter(entry => !entry.unknown).every(entry => entry.status === 'Einzeldossier vorgemerkt'));
});

test('the 16 named dog breeds and their inherited task labels remain intact', async () => {
  const { record } = await readPetGroup('hunde');
  const named = entriesOf(record).filter(entry => !entry.unknown);
  assert.deepEqual(named.map(entry => entry.title), [
    'Dubghar', 'Lannfoal', 'Fairaeg', 'Gamir', 'Herdskal',
    'Trywydd', 'Ponter', 'Brüg', 'Rhedwyr', 'Gorfael',
    'Brodgi', 'Clachair', 'Refgi', 'Tryw', 'Bugail', 'Pudel'
  ]);
  const roles = named.map(entry => entry.region.split(' · ').at(-1));
  assert.deepEqual(roles, [
    'Wachhund', 'Kriegshund', 'Warnhund', 'Grenzhund', 'Schäferhund',
    'Spürhund', 'Wachhund', 'Hofhund', 'Jagdhund', 'Schäferhund',
    'Haushund', 'Hofhund', 'Familienhund', 'Jägershund', 'Schäferhund', 'Dressurhund'
  ]);
});

test('all ten real cat images retain their names while empty placeholders stay empty', async () => {
  const { record } = await readPetGroup('katzen');
  const entries = entriesOf(record);
  assert.deepEqual(entries.map(entry => entry.id), expectedCatIds);
  assert.deepEqual(entries.map(entry => entry.title), [
    'Ruachar', 'Duriyn', 'Fialmor', 'Velir', 'Skjarn',
    'Cenyric', 'Lethin', 'Cerix', 'Targwyn', 'Samtlicht'
  ]);
  assert(entries.every(entry => !entry.unknown));
  const aldervan = record.catalog.groups.find(group => group.id === 'aldervan');
  assert.deepEqual(aldervan.entries, []);
});

test('the Haustiere page links both breed registers', async () => {
  const directory = new URL('../tiere/vieh/haustiere/', import.meta.url);
  const record = JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8'));
  const entries = entriesOf(record);
  assert.deepEqual(entries.map(entry => entry.id), PET_BREED_GROUP_IDS);
  assert.deepEqual(entries.map(entry => entry.href), ['./hunde/index.html', './katzen/index.html']);
  assert(entries.every(entry => entry.status === 'Rassenregister verfügbar'));
  await Promise.all(entries.map(entry => access(new URL(entry.href, directory))));
});

test('all 33 source images are archived locally with dimensions', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/pet-breed-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 33);
  assert.equal(new Set(manifest.items.map(item => item.sourceUrl)).size, 33);
  assert.equal(manifest.items.filter(item => item.entryId === 'hero').length, 2);
  assert(manifest.items.every(item => PET_BREED_GROUP_IDS.includes(item.animalId)));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  assert(manifest.items.every(item => item.sourceType === 'legacy-template'));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('the pet-breed renderer escapes authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'hunde', title: unsafe, subtitle: unsafe, classification: unsafe, folio: unsafe, lead: unsafe,
    quote: unsafe, icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    sections: [{ id: 'intro', title: unsafe, paragraphs: [unsafe] }],
    catalog: {
      title: unsafe, intro: unsafe,
      groups: [{ id: 'group', title: unsafe, kicker: unsafe, description: unsafe, entries: [{ id: 'entry', title: unsafe, region: unsafe, description: unsafe, status: unsafe, href: null, images: [image] }] }]
    }
  };
  const html = renderPetBreedOverview(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
