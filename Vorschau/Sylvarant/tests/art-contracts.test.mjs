import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { relative as relativePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOUSES } from '../house-data.mjs';
import { ARTWORKS } from '../art-data.mjs';
import { CLASS_PROTOTYPES, WARRIORS } from '../warrior-data.mjs';
import { WARRIORS as LEUKONIA_WARRIORS } from '../../Leukonia/warrior-data.mjs';
import { renderSylvarantPage } from '../proposal-render.mjs';
import { REALM_CONTEXT } from '../realm-context.mjs';
import { MAP_VARIANTS, REGIONS, SETTLEMENTS } from '../map-data.mjs';
import { SOCIAL_CASTES } from '../../Leukonia/culture-data.mjs';
import { shouldPublish } from '../../../netlify/build/site-publish.mjs';

const root = new URL('../', import.meta.url);
const json = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('26 cities plus four extras produce 30 ready houses without premature names, seats or ranks', () => {
  assert.equal(HOUSES.length, SETTLEMENTS.length + 4);
  assert.equal(HOUSES.filter(house => house.status === 'supplied').length, 17);
  assert.equal(HOUSES.filter(house => house.status === 'proposal').length, 13);
  assert.equal(new Set(HOUSES.map(house => house.id)).size, 30);
  for (const house of HOUSES) {
    assert.equal(house.ready, true, house.id);
    if (house.status === 'proposal') assert.match(house.name, /^Zusatzwappen \d{2}$/);
    if (house.id !== 'house-mede') {
      assert.equal(house.rank, null, house.id);
      assert.equal(house.sourceSeat, null, house.id);
    }
  }
  assert.equal(HOUSES.find(house => house.id === 'house-mede').sourceSeat, 'ort-15');
});

test('every house has its own ready figure; only Pullo shares its exclusive prototype and Mede reuses its approved original', async () => {
  assert.equal(WARRIORS.length, 30);
  assert.deepEqual(new Set(WARRIORS.map(item => item.houseId)), new Set(HOUSES.map(item => item.id)));
  assert.equal(new Set(WARRIORS.map(item => item.fullsize)).size, 30);
  const manifest = await json('assets/warriors/manifest.json');
  assert.equal(manifest.entries.length, 43, '35 original figures and eight preserved revisions');
  assert.equal(new Set(manifest.entries.map(item => item.sourceSha256)).size, 43);
  const receipts = new Map(manifest.entries.map(item => [item.production, item]));
  const prototypeImages = new Set(CLASS_PROTOTYPES.filter(item => item.id !== 'prototype-07').map(item => item.fullsize));
  for (const figure of WARRIORS) {
    assert.equal(figure.ready, true, figure.id);
    if (figure.houseId === 'house-mede') continue;
    assert.equal(prototypeImages.has(figure.fullsize), false, figure.id);
    const receipt = receipts.get(figure.fullsize);
    assert(receipt, figure.id);
    assert.equal(receipt.proof.rgbUnchanged, true, figure.id);
    assert.equal(receipt.proof.originalUnchanged, true, figure.id);
    assert.equal(receipt.alpha.touchesCanvas, false, figure.id);
    for (const key of ['source', 'production', 'preview']) {
      assert.equal(hash(await readFile(new URL(receipt[key], root))), receipt[`${key}Sha256`], `${figure.id}: ${key}`);
    }
  }
  const pullo = WARRIORS.find(figure => figure.houseId === 'house-pullo');
  const prototype = CLASS_PROTOTYPES.find(figure => figure.id === 'prototype-07');
  assert.equal(prototype.exclusiveHouseId, 'house-pullo');
  assert.equal(pullo.fullsize, prototype.fullsize);
  assert.deepEqual(WARRIORS.filter(figure => figure.prototypeId === 'prototype-07').map(figure => figure.houseId), ['house-pullo']);
  const mede = WARRIORS.find(figure => figure.houseId === 'house-mede');
  const previous = LEUKONIA_WARRIORS.find(figure => figure.houseId === 'house-mede');
  assert.equal(mede.fullsize, '../Leukonia/' + previous.fullsize);
  assert.equal(mede.image, '../Leukonia/' + previous.image);
  assert.equal(mede.status, 'supplied');
  assert.equal(mede.prototypeId, null);
});

test('seven ready roles preserve the requested equipment and reference Equo only for sword riders', async () => {
  assert.equal(CLASS_PROTOTYPES.length, 7);
  for (const figure of [...CLASS_PROTOTYPES, ...WARRIORS]) {
    assert.equal(figure.ready, true, figure.id);
    if (figure.status === 'supplied') continue;
    const role = figure.prototypeId || figure.id;
    if (role === 'prototype-05') {
      assert.equal(figure.mount.name, 'Equo');
      await access(new URL(figure.mount.href, root));
    } else assert.equal(figure.mount, null, figure.id);
    if (role === 'prototype-06') assert(figure.equipment.some(item => /Harfe|harfe/.test(item)), figure.id);
    if (role === 'prototype-02') assert(figure.equipment.some(item => /aufgestelltes.*Scutum/.test(item)), figure.id);
    if (['prototype-03', 'prototype-04'].includes(role)) assert(figure.equipment.includes('Rückenköcher'), figure.id);
  }
});

test('the seven requested house corrections and marine prototype select revised art and matching equipment', async () => {
  const revisions = (await json('sources/house-warrior-revisions.json')).jobs;
  const expected = ['house-cerunia', 'house-maborel', 'house-rinia', 'house-stalitia', 'pool-07', 'pool-10', 'pool-11'];
  assert.deepEqual(revisions.map(item => item.houseId).sort(), expected.sort());
  for (const revision of revisions) {
    const figure = WARRIORS.find(item => item.houseId === revision.houseId);
    assert.equal(figure.fullsize, `assets/warriors/production/${revision.assetStem}.png`);
    assert.deepEqual(figure.equipment, revision.equipment);
    assert.equal(figure.description, revision.description);
    await access(new URL(`assets/warriors/generated/${revision.supersedesAssetStem}.png`, root));
  }
  for (const id of ['house-cerunia', 'pool-07', 'pool-10']) {
    const figure = WARRIORS.find(item => item.houseId === id);
    assert(figure.equipment.some(item => /Gerade[rs].*(Gladius|Schwert)/.test(item)), id);
    assert(!/Säbel/.test(JSON.stringify(figure)), id);
  }
  const rinia = WARRIORS.find(item => item.houseId === 'house-rinia');
  assert(rinia.equipment.some(item => item.startsWith('Dreizack')));
  assert(!/Säbel/.test(JSON.stringify(rinia)));
  const maborel = WARRIORS.find(item => item.houseId === 'house-maborel');
  assert(maborel.equipment.some(item => /Offener/.test(item)));
  assert(maborel.equipment.some(item => /Lamellenpanzer.*abwechselnden/.test(item)));
  const marine = CLASS_PROTOTYPES.find(item => item.id === 'prototype-03');
  assert.equal(marine.fullsize, 'assets/warriors/production/prototype-03-v2.png');
  assert(!/Säbel/.test(JSON.stringify(marine)));
});

test('the yearning province revision is selected while the previous generator original is retained', async () => {
  const province = ARTWORKS.find(item => item.id === 'province-sylvarant');
  assert.equal(province.fullsize, 'assets/emblems/production/province-sylvarant-v2.png');
  assert.match(province.description, /verzehrt/);
  await access(new URL('assets/emblems/generated/province-sylvarant.png', root));
  const receipts = await json('sources/emblem-asset-receipts.json');
  assert.equal(receipts.entries.length, 14);
  for (const receipt of receipts.entries) {
    assert.equal(receipt.originalUnchanged, true);
    assert.equal(receipt.rgbUnchanged, true);
    for (const key of ['source', 'production', 'preview']) {
      assert.equal(hash(await readFile(new URL(receipt[key], root))), receipt[`${key}Sha256`], receipt.id);
    }
  }
});

test('rendered artwork links are complete public assets and no authoring prompt or local source path enters the page', async () => {
  const html = renderSylvarantPage({ context: REALM_CONTEXT, houses: HOUSES, warriors: WARRIORS,
    prototypes: CLASS_PROTOTYPES, artworks: ARTWORKS, regions: REGIONS, settlements: SETTLEMENTS,
    variants: MAP_VARIANTS, castes: SOCIAL_CASTES });
  assert(!/C:[/\\]|generated_images|"prompt"|sources\/|on(?:click|input|change)=/.test(html));
  assert.match(html, /Ein Sylvian betrügt das Volk nicht/);
  assert(!html.includes('Unwichtig'));
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
  assert(images.length > 60);
  for (const relative of new Set(images)) {
    const url = new URL(relative, root);
    await access(url);
    const publicPath = relativePath(fileURLToPath(new URL('../../../', import.meta.url)), fileURLToPath(url)).replaceAll('\\', '/');
    assert(shouldPublish(publicPath), relative);
  }
  for (const item of [...HOUSES, ...CLASS_PROTOTYPES, ...WARRIORS, ...ARTWORKS]) {
    await access(new URL(item.fullsize, root));
  }
});
