import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { extractRossmarktBreedingCrossings } from '../../AleriaAlmanach/scripts/source-pages/rossmarkt-source.mjs';
import { localBreedingInterpretation, createBreedingPrompt } from '../modules/horse-breeding/horse-breeding-ai.js';
import { loadHorseBreedingData } from '../modules/horse-breeding/horse-breeding-data.mjs';
import {
  calculateFoal,
  horsePairKey,
  normalizeLegacyHorseCrossings
} from '../modules/horse-breeding/horse-breeding-model.mjs';
import { HORSE_BREEDING_BREEDS } from '../modules/horse-breeding/horse-breeding-registry.mjs';
import { createHorseBreedingStore } from '../modules/horse-breeding/horse-breeding-store.js';
import { renderHorseBreedingPage } from '../modules/horse-breeding/horse-breeding-template.mjs';

const data = await loadHorseBreedingData();
const byId = new Map(data.breeds.map(breed => [breed.id, breed]));

test('breeding data joins all 27 Rossmarkt breeds with local horse dossiers', async () => {
  assert.equal(HORSE_BREEDING_BREEDS.length, 27);
  assert.equal(data.breeds.length, 27);
  assert.equal(new Set(data.breeds.map(breed => breed.id)).size, 27);
  assert(data.breeds.every(breed => breed.stats.length === 6));
  assert(data.breeds.every(breed => breed.stats.every(value => Number.isInteger(value) && value >= 1 && value <= 10)));
  assert(data.breeds.every(breed => breed.ageRange.length === 2));
  assert(data.breeds.every(breed => breed.priceRange.minCopper <= breed.priceRange.maxCopper));

  const pageDirectory = new URL('../tiere/pferde/zuchtbuch/', import.meta.url);
  await Promise.all(data.breeds.map(breed => access(new URL(breed.image.src, pageDirectory))));
  await Promise.all(data.breeds.map(breed => access(new URL(breed.profileHref, pageDirectory))));
});

test('the five Rossmarkt names and two established lore crossings are complete and symmetric', async () => {
  const source = await readFile(new URL('../../Markt/Rossmarkt/Rossmarkt.html', import.meta.url), 'utf8');
  assert.deepEqual(extractRossmarktBreedingCrossings(source).map(entry => entry.name), [
    'Hochblut', 'Kronforst', 'Kronhest', 'Roh-Rhyfel', 'Edelsale'
  ]);
  assert.equal(data.crossings.length, 7);
  assert.deepEqual(data.crossings.map(entry => entry.name), [
    'Hochblut', 'Kronforst', 'Kronhest', 'Roh-Rhyfel', 'Edelsale', 'Brycing', 'Tirashan'
  ]);
  assert.equal(new Set(data.crossings.map(entry => horsePairKey(entry.mareId, entry.sireId))).size, 7);
  assert.equal(horsePairKey('hest', 'ceffyl'), horsePairKey('ceffyl', 'hest'));
  assert.equal(data.crossings.find(entry => entry.name === 'Roh-Rhyfel').establishedBreed, 'Rhyfel');
});

test('the foal model preserves the Rossmarkt averaging, lifespan and price rules', () => {
  const result = calculateFoal(byId.get('hest'), byId.get('brycing'), { random: () => 0.5 });
  assert.deepEqual(result.expectedStats, [6.5, 8.5, 7, 6.5, 8, 9]);
  assert.deepEqual(result.stats, [7, 9, 7, 7, 8, 9]);
  assert.equal(result.talentIndex, -1);
  assert.deepEqual(result.lifespan, { minimum: 43, maximum: 53, label: '43–53 Jahre' });
  assert(result.priceRange.minCopper > 0);
  assert(result.priceRange.maxCopper > result.priceRange.minCopper);
});

test('AI prompt and local interpretation use both bloodlines without exposing stat numbers in prose', () => {
  const result = calculateFoal(byId.get('cyning'), byId.get('drake'), { random: () => 0.5 });
  const payload = {
    mare: byId.get('cyning'),
    sire: byId.get('drake'),
    crossName: 'Brycing',
    result
  };
  const prompt = createBreedingPrompt(payload);
  const fallback = localBreedingInterpretation(payload);
  assert(prompt.includes('Cyning') && prompt.includes('Drake') && prompt.includes('Brycing'));
  assert(fallback.includes('Cyning') && fallback.includes('Drake') && fallback.includes('Brycing'));
  assert(!/\b\d+\/10\b/.test(fallback));
});

test('local breeding store keeps records and user-authored crossing names isolated', () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const store = createHorseBreedingStore(storage);
  const pairKey = horsePairKey('afol', 'hest');
  store.addRecord({ id: 'fohlen-1', foalName: 'Funke', crossName: 'Nordfunke', notes: 'Ruhig.' });
  store.setCustomCrossName(pairKey, 'Nordfunke');
  store.mergeCustomCrossNames({ [pairKey]: 'Wird nicht überschrieben', [horsePairKey('afol', 'drake')]: 'Aschenlauf' });
  assert.equal(store.read().records[0].foalName, 'Funke');
  assert.equal(store.read().customCrossNames[pairKey], 'Nordfunke');
  assert.equal(store.read().customCrossNames[horsePairKey('afol', 'drake')], 'Aschenlauf');
  store.removeRecord('fohlen-1');
  assert.equal(store.read().records.length, 0);
});

test('old Rossmarkt browser names migrate into canonical symmetric breed pairs', () => {
  const migrated = normalizeLegacyHorseCrossings({
    'Goldmähne|Crafan': 'Goldzwerg',
    'Hest|Brycing': 'Eigenes Kronhest',
    'Unbekannt|Hest': 'Verwerfen',
    broken: 'Verwerfen'
  }, data.breeds);
  assert.deepEqual(migrated, {
    [horsePairKey('goldmaehne', 'crafan-pony')]: 'Goldzwerg',
    [horsePairKey('hest', 'brycing')]: 'Eigenes Kronhest'
  });
});

test('generated breeding page is current, local, linked and crop-safe', async () => {
  const pageDirectory = new URL('../tiere/pferde/zuchtbuch/', import.meta.url);
  const html = (await readFile(new URL('index.html', pageDirectory), 'utf8')).replace(/\r\n/g, '\n');
  const css = await readFile(new URL('../../../modules/horse-breeding/horse-breeding.css', pageDirectory), 'utf8');
  const controller = await readFile(new URL('../../../modules/horse-breeding/horse-breeding-page.js', pageDirectory), 'utf8');
  const overview = await readFile(new URL('../index.html', pageDirectory), 'utf8');
  assert.equal(html, renderHorseBreedingPage(data));
  assert(html.includes('27 Rassen · 351 mögliche Paare'));
  assert(data.crossings.every(crossing => html.includes(crossing.name)));
  assert(!/https?:\/\/|onclick=|oninput=|onchange=/i.test(html));
  assert(css.includes('object-fit: contain'));
  assert(css.includes('drop-shadow'));
  assert(!css.includes('object-fit: cover'));
  assert(controller.includes('data-action="select-cross"'));
  assert(overview.includes('./zuchtbuch/index.html'));
  assert(overview.includes('Zum Zuchtbuch'));
});

test('the breeding archive uses its own generated transparent mare-and-foal icon', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/horse-breeding-icon-source.json', import.meta.url), 'utf8'));
  const image = await readFile(new URL(`../assets/${manifest.file.slice(2)}`, import.meta.url));
  assert.equal(manifest.id, 'horse-breeding');
  assert.equal(manifest.sourceType, 'generated');
  assert.equal(manifest.transparent, true);
  assert.deepEqual([manifest.width, manifest.height], [1254, 1254]);
  assert.equal(image.toString('ascii', 1, 4), 'PNG');
  assert.equal(image[25], 6, 'PNG must use an RGBA color type with alpha');
  assert((await readFile(new URL('../tiere/pferde/zuchtbuch/index.html', import.meta.url), 'utf8')).includes('../../../assets/icons/horse-breeding.png'));
});

test('Vite registers the horse breeding page as a production entry', async () => {
  const config = await readFile(new URL('../../AleriaAlmanach/vite.config.mjs', import.meta.url), 'utf8');
  assert(config.includes('HORSE_BREEDING_PAGE_ID'));
  assert(config.includes('bestiary-horse-${HORSE_BREEDING_PAGE_ID}'));
});
